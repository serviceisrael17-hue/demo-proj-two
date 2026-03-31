import { db } from '../db/localDb';
import { supabase } from '../db/supabaseClient';

class SyncService {
  constructor() {
    this.isSyncing = false;
    
    // Recursive Sync: Automatically triggers when navigator.onLine becomes true.
    window.addEventListener('online', () => {
      this.performSync();
    });
  }

  async performSync() {
    if (!navigator.onLine || this.isSyncing) return;
    this.isSyncing = true;
    try {
      // 1. Outbound Sync (Local changes pushed to Supabase)
      await this.syncOutbound();
      // 2. Inbound Sync (Supabase changes pulled to Local)
      await this.syncInbound();
    } catch (error) {
      console.error('Sync process failed:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  async syncOutbound() {
    // Get all pending actions from syncQueue, ordered by id to maintain insertion order
    const queue = await db.syncQueue.orderBy('id').toArray();
    if (queue.length === 0) return;

    // Process each queue item in correct order
    for (const item of queue) {
      const { id, table, action, data } = item;
      
      try {
        const payload = { ...data };
        delete payload.created_at;
        delete payload.updated_at;

        if (action === 'INSERT' || action === 'UPDATE') {
          // Use upsert for the sync to prevent duplicate errors
          const { error } = await supabase.from(table).upsert(payload);
          if (error) throw error;
        } else if (action === 'DELETE') {
          const { error } = await supabase.from(table).delete().match({ id: payload.id });
          if (error) throw error;
        }
        
        // Remove from local queue if successfully synced to Cloud
        await db.syncQueue.delete(id);
      } catch (error) {
        console.error(`Error syncing outbound for table ${table}, action ${action}. Dropping bad payload to prevent deadlock.`, error);
        // Instead of breaking and deadlocking the entire Sync Engine forever,
        // we drop the permanently unsyncable record so the rest of the app can proceed smoothly.
        await db.syncQueue.delete(id);
      }
    }
  }

  async syncInbound() {
    // Ensure voucherItems are synced after vouchers to maintain relational integrity
    const tables = ['company', 'uoms', 'products', 'ledgers', 'receiptPayments', 'vouchers', 'voucherItems'];

    for (const table of tables) {
      try {
        // Simple full sync for offline-first demo to avoid schema requirements like 'updated_at'
        const { data: allRecords, error } = await supabase.from(table).select('*');
        
        if (error) {
           console.warn(`Could not fetch ${table} from Supabase:`, error);
        } else if (allRecords) {
           await db[table].bulkPut(allRecords);
        }
      } catch (error) {
        console.error(`Error processing inbound sync for table ${table}`, error);
      }
    }
  }
}

export const syncService = new SyncService();
