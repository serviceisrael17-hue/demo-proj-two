import React, { useState, useEffect } from 'react';
import { supabase } from '../db/supabaseClient';
import { Link } from 'react-router-dom';
import { TrendingUp, ReceiptText, AlertCircle, Users, FileText, Package, LayoutGrid, Download } from 'lucide-react';
import VoucherDetailsModal from '../components/VoucherDetailsModal';

export default function Home() {
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    amountReceived: 0,
    outstandingDues: 0,
    totalClients: 0
  });
  
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();

    // Subscribe to real-time changes
    const vouchersSubscription = supabase.channel('vouchers-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vouchers' }, () => fetchDashboardData())
      .subscribe();
      
    const receiptsSubscription = supabase.channel('receipts-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'receiptPayments' }, () => fetchDashboardData())
      .subscribe();

    return () => {
      supabase.removeChannel(vouchersSubscription);
      supabase.removeChannel(receiptsSubscription);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: sales, error: salesError } = await supabase
        .from('vouchers')
        .select('grand_total, party_name')
        .eq('type', 'sales');
      
      if (salesError) throw salesError;

      const totalRev = sales.reduce((sum, s) => sum + (Number(s.grand_total) || 0), 0);
      const clients = new Set(sales.filter(s => s.party_name).map(s => s.party_name));
      
      const { data: receipts, error: rectError } = await supabase
        .from('receiptPayments')
        .select('amount')
        .eq('type', 'receipt');
        
      if (rectError) throw rectError;

      const received = receipts.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

      const { data: recent } = await supabase
        .from('vouchers')
        .select('*')
        .eq('type', 'sales')
        .order('id', { ascending: false })
        .limit(5);

      setMetrics({
        totalRevenue: totalRev,
        amountReceived: received,
        outstandingDues: Math.max(0, totalRev - received),
        totalClients: clients.size
      });
      setRecentInvoices(recent || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
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
          <button className="dash-btn btn-outline" onClick={fetchDashboardData}>
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
            {loading ? (
              <p className="empty-state">Loading recent manual transactions...</p>
            ) : recentInvoices.length === 0 ? (
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
