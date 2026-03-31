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
        if (action === 'INSERT' || action === 'UPDATE') {
          // Use upsert for the sync to prevent duplicate errors
          const { error } = await supabase.from(table).upsert(data);
          if (error) throw error;
        } else if (action === 'DELETE') {
          const { error } = await supabase.from(table).delete().match({ id: data.id });
          if (error) throw error;
        }
        
        // Remove from local queue if successfully synced to Cloud
        await db.syncQueue.delete(id);
      } catch (error) {
        console.error(`Error syncing outbound for table ${table}, action ${action}`, error);
        // Break out to preserve sequence: if a voucher fails, voucherItems shouldn't proceed
        break;
      }
    }
  }

  async syncInbound() {
    // Ensure voucherItems are synced after vouchers to maintain relational integrity
    const tables = ['company', 'products', 'ledgers', 'receiptPayments', 'vouchers', 'voucherItems'];

    for (const table of tables) {
      const lastSyncKey = `lastSync_${table}`;
      // Fallback past timestamp if no sync has ever occurred
      const lastSync = localStorage.getItem(lastSyncKey) || '1970-01-01T00:00:00.000Z';

      try {
        // "Last Write Wins": We pull all server records modified after our last sync
        const { data: serverRecords, error } = await supabase
          .from(table)
          .select('*')
          .gt('updated_at', lastSync)
          .order('updated_at', { ascending: true }); 

        if (error) {
          // If the table doesn't have an computed/tracked updated_at yet, fallback to full fetch
          console.warn(`Could not sync inbound for ${table} using updated_at. Doing full sync.`, error);
          const { data: allRecords, error: fallbackError } = await supabase.from(table).select('*');
          if (!fallbackError && allRecords) {
              await db[table].bulkPut(allRecords);
          }
        } else if (serverRecords && serverRecords.length > 0) {
          // Updates Dexie so the local data is fresh
          await db[table].bulkPut(serverRecords);
          const maxUpdatedAt = serverRecords[serverRecords.length - 1].updated_at;
          localStorage.setItem(lastSyncKey, maxUpdatedAt);
        }
      } catch (error) {
        console.error(`Error processing inbound sync for table ${table}`, error);
      }
    }
  }
}

export const syncService = new SyncService();
