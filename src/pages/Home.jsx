import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, ReceiptText, AlertCircle, Users, FileText, Package, LayoutGrid, Download } from 'lucide-react';
import VoucherDetailsModal from '../components/VoucherDetailsModal';
import { useLocalCollection } from '../hooks/useLocalCollection';
import { syncService } from '../services/syncService';

export default function Home() {
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  
  const { data: vouchers } = useLocalCollection('vouchers');
  const { data: receiptPayments } = useLocalCollection('receiptPayments');

  const stats = useMemo(() => {
    const sales = vouchers.filter(v => v.type === 'sales');
    const receipts = receiptPayments.filter(r => r.type === 'receipt');

    const totalRev = sales.reduce((sum, s) => sum + (Number(s.grand_total) || 0), 0);
    const clients = new Set(sales.filter(s => s.party_name).map(s => s.party_name));
    const received = receipts.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

    return {
      metrics: {
        totalRevenue: totalRev,
        amountReceived: received,
        outstandingDues: Math.max(0, totalRev - received),
        totalClients: clients.size
      },
      recentInvoices: sales.slice().reverse().slice(0, 5)
    };
  }, [vouchers, receiptPayments]);

  const { metrics, recentInvoices } = stats;

  const handleSyncData = () => {
    syncService.performSync();
  };

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div className="dashboard-title-area">
          <div className="dashboard-icon">
            <LayoutGrid size={28} />
          </div>
          <div className="dashboard-text">
            <h1>My Business</h1>
            <p>Official Billing & ERP Dashboard</p>
          </div>
        </div>
        <div className="dashboard-header-actions">
          <button className="dash-btn btn-outline" onClick={handleSyncData}>
            <TrendingUp size={16} /> Sync Data
          </button>
          <button className="dash-btn btn-primary-light">
            <Download size={16} /> Export Backup
          </button>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card outline-card">
          <div className="kpi-card-header">
             <p>TOTAL REVENUE</p>
             <div className="kpi-icon-wrapper blue-icon"><TrendingUp size={16} strokeWidth={2.5}/></div>
          </div>
          <h2>{formatCurrency(metrics.totalRevenue)}</h2>
        </div>

        <div className="kpi-card success-card relative-card">
          <div className="kpi-card-header">
             <p>AMOUNT RECEIVED</p>
             <div className="kpi-icon-wrapper green-icon"><ReceiptText size={16} strokeWidth={2.5}/></div>
          </div>
          <h2 className="text-success">{formatCurrency(metrics.amountReceived)}</h2>
        </div>

        <div className="kpi-card warning-card">
          <div className="kpi-card-header">
             <p>OUTSTANDING DUES</p>
             <div className="kpi-icon-wrapper orange-icon"><AlertCircle size={16} strokeWidth={2.5}/></div>
          </div>
          <h2 className="text-warning">{formatCurrency(metrics.outstandingDues)}</h2>
        </div>

        <div className="kpi-card outline-card">
          <div className="kpi-card-header">
             <p>TOTAL CLIENTS</p>
             <div className="kpi-icon-wrapper purple-icon"><Users size={16} strokeWidth={2.5}/></div>
          </div>
          <h2>{metrics.totalClients}</h2>
        </div>
      </div>

      <div className="dashboard-content-split">
        <div className="ledger-card">
          <div className="ledger-card-header">
            <div>
              <h3><FileText size={18} className="text-primary-blue" /> Sales Ledger / Recent Invoices</h3>
              <p>Manage and view your generated official bills.</p>
            </div>
            <div className="ledger-badge">{recentInvoices.length} Bills</div>
          </div>
          <div className="ledger-card-body">
            {recentInvoices.length === 0 ? (
              <p className="empty-state">No recent sales found.</p>
            ) : (
              <div className="invoice-list">
                {recentInvoices.map((inv) => (
                  <div key={inv.id} className="invoice-item">
                    <div className="invoice-info">
                      <div className="invoice-icon"><ReceiptText size={20} /></div>
                      <div>
                        <p className="invoice-party">{inv.party_name}</p>
                        <p className="invoice-meta">Inv #{inv.voucher_no} • {inv.date}</p>
                      </div>
                    </div>
                    <div className="invoice-total">
                      <p>{formatCurrency(inv.grand_total)}</p>
                      <button onClick={() => setSelectedVoucher(inv)} style={{cursor: 'pointer'}}>View Details</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="quick-actions-card">
          <div className="qa-bg-icon"><LayoutGrid size={120} /></div>
          <h3>Quick Actions</h3>
          <div className="qa-grid">
            <Link to="/ledgers" className="qa-button">
              <Users size={24} />
              <span>Manage Clients</span>
            </Link>
            <Link to="/products" className="qa-button">
              <Package size={24} />
              <span>Inventory</span>
            </Link>
          </div>
          <Link to="/sales" className="qa-action-main">
            + Generate New Bill
          </Link>
        </div>
      </div>
      
      {selectedVoucher && (
        <VoucherDetailsModal 
          voucher={selectedVoucher} 
          onClose={() => setSelectedVoucher(null)} 
        />
      )}
    </div>
  );
}
