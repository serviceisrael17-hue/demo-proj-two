import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import ProductMaster from './pages/ProductMaster';
import SalesInvoice from './pages/SalesInvoice';
import LedgerMaster from './pages/LedgerMaster';
import UomMaster from './pages/UomMaster';
import PurchaseInvoice from './pages/PurchaseInvoice';
import InvoiceHistory from './pages/InvoiceHistory';
import ReceiptPayment from './pages/ReceiptPayment';
import Home from './pages/Home';
import Settings from './pages/Settings';
import { Settings as SettingsIcon } from 'lucide-react';
import SyncStatus from './components/SyncStatus';
import { syncService } from './services/syncService';

export default function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

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

  // Trigger sync on initial load
  useEffect(() => {
    syncService.performSync();
  }, []);

  return (
    <BrowserRouter>
      <div className="app-container">
        <nav className="top-nav">
          <div className="nav-brand" style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            Easy Trade
            <div style={{
              width: '10px', height: '10px', borderRadius: '50%',
              backgroundColor: isOnline ? '#4caf50' : '#f44336',
              boxShadow: '0 0 4px rgba(0,0,0,0.2)'
            }} title={isOnline ? 'Online' : 'Offline'}></div>
          </div>
          <div className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/sales">Sales</Link>
            <Link to="/purchase">Purchase</Link>
            <Link to="/receipt-payment">Receipt / Pymt</Link>
            <Link to="/history">History</Link>
            <span style={{margin: '0 8px', color: '#aaa'}}>|</span>
            <Link to="/products">Products</Link>
            <Link to="/ledgers">Ledgers</Link>
            <Link to="/uom">UOM</Link>
            <Link to="/settings" style={{display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto', background: '#f0f9ff', padding: '4px 10px', borderRadius: '20px', color: '#0369a1'}}>
              <SettingsIcon size={16} /> Settings
            </Link>
          </div>
        </nav>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<ProductMaster />} />
            <Route path="/sales" element={<SalesInvoice />} />
            <Route path="/ledgers" element={<LedgerMaster />} />
            <Route path="/uom" element={<UomMaster />} />
            <Route path="/purchase" element={<PurchaseInvoice />} />
            <Route path="/history" element={<InvoiceHistory />} />
            <Route path="/receipt-payment" element={<ReceiptPayment />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
        <SyncStatus />
      </div>
    </BrowserRouter>
  );
}
