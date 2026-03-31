import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/localDb';

export default function SyncStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Reactively track how many items are in the syncQueue
  const pendingCount = useLiveQuery(() => db.syncQueue.count(), []) || 0;

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  let statusText = "Cloud Synced";
  let statusColor = "#4caf50"; // Green

  if (!isOnline) {
    statusText = "Offline - Saving Locally";
    statusColor = "#f44336"; // Red
  } else if (pendingCount > 0) {
    statusText = "Syncing...";
    statusColor = "#ff9800"; // Yellow
  } else {
    statusText = "Cloud Synced";
    statusColor = "#4caf50"; // Green
  }

  // A small, fixed UI indicator (bottom-right)
  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      backgroundColor: statusColor,
      color: '#fff',
      padding: '10px 18px',
      borderRadius: '24px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      zIndex: 9999,
      fontSize: '14px',
      fontWeight: 'bold',
      transition: 'background-color 0.3s ease'
    }}>
      <div style={{
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        backgroundColor: '#fff',
        opacity: pendingCount > 0 && isOnline ? 0.5 : 1 // Simple indicator toggle if syncing
      }}></div>
      {statusText}
      {pendingCount > 0 && isOnline && ` (${pendingCount})`}
    </div>
  );
}
