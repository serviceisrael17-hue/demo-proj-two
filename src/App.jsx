import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import ProductMaster from './pages/ProductMaster';
import SalesInvoice from './pages/SalesInvoice';
import LedgerMaster from './pages/LedgerMaster';
import UomMaster from './pages/UomMaster';
import PurchaseInvoice from './pages/PurchaseInvoice';
import InvoiceHistory from './pages/InvoiceHistory';
import ReceiptPayment from './pages/ReceiptPayment';

function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  return (
    <div className="home-screen" style={{position: 'relative', height: '100%', minHeight: 'calc(100vh - 100px)'}}>
      
      {/* Dimmed Overlay background */}
      {isSidebarOpen && (
        <div 
          style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999, transition: 'opacity 0.3s ease'}}
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Slide-in Sidebar Menu */}
      <div style={{
          position: 'fixed', top: 0, left: 0, height: '100vh', width: '320px',
          backgroundColor: '#fff', zIndex: 1000,
          boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
          transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex', flexDirection: 'column', padding: '24px'
      }}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', paddingBottom: '16px', borderBottom: '1px solid #eaeaea'}}>
          <span style={{fontSize: '22px', fontWeight: 'bold', color: 'var(--primary-blue)'}}>Transactions</span>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            style={{background: 'none', border: 'none', fontSize: '32px', cursor: 'pointer', color: '#888', lineHeight: 1, padding: '0 8px'}}
          >
            &times;
          </button>
        </div>
        
        <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
          <Link to="/sales" className="btn" style={{padding: '18px 20px', fontSize: '16px', display: 'block', textAlign: 'left', borderRadius: '8px'}} onClick={() => setIsSidebarOpen(false)}>Sales Invoice</Link>
          <Link to="/purchase" className="btn" style={{padding: '18px 20px', fontSize: '16px', backgroundColor: '#e67e22', display: 'block', textAlign: 'left', borderRadius: '8px'}} onClick={() => setIsSidebarOpen(false)}>Purchase Invoice</Link>
          <Link to="/receipt-payment" className="btn" style={{padding: '18px 20px', fontSize: '16px', backgroundColor: '#27ae60', display: 'block', textAlign: 'left', borderRadius: '8px'}} onClick={() => setIsSidebarOpen(false)}>Receipts / Payments</Link>
          <Link to="/history" className="btn btn-secondary" style={{padding: '18px 20px', fontSize: '16px', display: 'block', textAlign: 'left', borderRadius: '8px', border: '1px solid var(--border-color)', fontWeight: '600'}} onClick={() => setIsSidebarOpen(false)}>Invoice History</Link>
        </div>
      </div>

      {/* Main Hamburger Menu Trigger on Page */}
      <div style={{position: 'absolute', top: '16px', left: '16px', zIndex: 10}}>
        <button 
          onClick={() => setIsSidebarOpen(true)} 
          style={{background: 'white', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '10px 16px', fontSize: '24px', cursor: 'pointer', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', transition: 'all 0.2s'}}
        >
          <span style={{color: 'var(--primary-blue)'}}>☰</span> <span style={{fontSize: '15px', fontWeight: '600'}}>Menu</span>
        </button>
      </div>

      <div style={{textAlign: 'center', paddingTop: '100px'}}>
        <h1 style={{fontSize: '32px', color: 'var(--primary-blue)', marginBottom: '16px'}}>Welcome to Easy Trade</h1>
        <p style={{fontSize: '16px', color: '#555'}}>Select an option from the menu: <strong>Product Master</strong> to add items, <strong>Sales Invoice</strong> to trade.</p>
        <p style={{color: '#888', marginTop: '40px', fontSize: '15px', padding: '20px', background: 'white', borderRadius: '8px', display: 'inline-block', border: '1px dashed #ccc'}}>
          Click the <strong>☰ Menu</strong> on the left to quickly access your transactions in the new sidebar.
        </p>
      </div>
    </div>
  );
}

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
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
