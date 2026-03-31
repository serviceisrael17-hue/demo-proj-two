import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/localDb';
import { syncService } from '../services/syncService';

export function useLocalCollection(tableName) {
  // Pull data reactively from local Dexie DB
  const data = useLiveQuery(() => db[tableName].toArray(), [tableName]) || [];

  const add = async (record) => {
    // 1. Write to actual local table
    const id = await db[tableName].add(record);
    const finalRecord = { ...record, id }; // Combine the ID automatically assigned

    // 2. Add to syncQueue
    await db.syncQueue.add({
      table: tableName,
      action: 'INSERT',
      data: finalRecord
    });

    // 3. Trigger syncService immediately if online
    if (navigator.onLine) {
      syncService.performSync();
    }
    
    return id;
  };

  const update = async (id, changes) => {
    await db[tableName].update(id, changes);
    
    // Fetch full merged record because Supabase upsert typically requires the whole row
    const updatedRecord = await db[tableName].get(id);

    await db.syncQueue.add({
      table: tableName,
      action: 'UPDATE',
      data: updatedRecord
    });

    if (navigator.onLine) {
      syncService.performSync();
    }
  };

  const remove = async (id) => {
    await db[tableName].delete(id);

    await db.syncQueue.add({
      table: tableName,
      action: 'DELETE',
      data: { id }
    });

    if (navigator.onLine) {
      syncService.performSync();
    }
  };

  return { data, add, update, remove };
}
