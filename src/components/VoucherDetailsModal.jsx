import React, { useState, useEffect } from 'react';
import { supabase } from '../db/supabaseClient';

export default function VoucherDetailsModal({ voucher, onClose }) {
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!voucher) return;
    const fetchDetails = async () => {
      setLoading(true);
      
      try {
        // Fetch items associated with the voucher
        const { data: voucherItems, error: itemsError } = await supabase
          .from('voucherItems')
          .select('*')
          .eq('voucher_id', voucher.id);

        if (itemsError) throw itemsError;

        // Fetch products lightly to map names
        const { data: productsData, error: prodError } = await supabase.from('products').select('id, name');
        
        if (prodError) throw prodError;

        const prodMap = {};
        if (productsData) {
          productsData.forEach(p => prodMap[p.id] = p.name);
        }
        
        setProducts(prodMap);
        setItems(voucherItems || []);
      } catch (err) {
        console.error('Error fetching detail items:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [voucher]);

  if (!voucher) return null;

  return (
    <div className="modal-overlay" style={overlayStyle}>
      <div className="modal-content" style={contentStyle}>
        <div style={headerStyle}>
          <h3 style={{ margin: 0, color: '#0f172a' }}>Invoice Details: {voucher.voucher_no}</h3>
          <button onClick={onClose} style={closeBtnStyle}>✕</button>
        </div>
        
        <div style={{ padding: '20px' }}>
          <div style={detailsGrid}>
            <div><span style={lbl}>Customer/Party:</span> <br/><strong>{voucher.party_name}</strong></div>
            <div><span style={lbl}>Date:</span> <br/><strong>{voucher.date}</strong></div>
            <div><span style={lbl}>Type:</span> <br/><strong style={{ textTransform: 'capitalize' }}>{voucher.type}</strong></div>
            <div><span style={lbl}>Grand Total:</span> <br/><strong style={{ fontSize: '18px', color: '#16a34a' }}>₹ {Number(voucher.grand_total).toFixed(2)}</strong></div>
          </div>
          
          <h4 style={{ marginTop: '24px', marginBottom: '12px', borderBottom: '2px solid #f1f5f9', paddingBottom: '8px', color: '#334155' }}>
            Line Items ({items.length})
          </h4>
          
          {loading ? (
             <div style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>Loading items...</div>
          ) : (
            <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
              <table className="data-grid" style={{ width: '100%', fontSize: '13px', margin: 0, border: 'none' }}>
                <thead style={{ backgroundColor: '#f8fafc' }}>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '10px 12px' }}>Product</th>
                    <th style={{ textAlign: 'center', padding: '10px 12px' }}>Qty</th>
                    <th style={{ textAlign: 'right', padding: '10px 12px' }}>Rate</th>
                    <th style={{ textAlign: 'right', padding: '10px 12px' }}>Taxable</th>
                    <th style={{ textAlign: 'right', padding: '10px 12px' }}>Tax</th>
                    <th style={{ textAlign: 'right', padding: '10px 12px' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={item.id} style={{ borderBottom: i === items.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px 12px' }}>{products[item.product_id] || `Unknown (ID: ${item.product_id})`}</td>
                      <td style={{ textAlign: 'center', padding: '8px 12px' }}>{item.qty}</td>
                      <td style={{ textAlign: 'right', padding: '8px 12px' }}>{Number(item.rate).toFixed(2)}</td>
                      <td style={{ textAlign: 'right', padding: '8px 12px' }}>{Number(item.basic_amt).toFixed(2)}</td>
                      <td style={{ textAlign: 'right', padding: '8px 12px' }}>
                         {(Number(item.cgst_amt||0) + Number(item.sgst_amt||0) + Number(item.igst_amt||0)).toFixed(2)}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 'bold', padding: '8px 12px' }}>{Number(item.total_amt).toFixed(2)}</td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr><td colSpan="6" style={{ textAlign:'center', padding: '16px', color: '#94a3b8' }}>No items found for this invoice.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(15, 23, 42, 0.65)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 10000,
  backdropFilter: 'blur(2px)'
};

const contentStyle = {
  backgroundColor: '#fff',
  width: '95%',
  maxWidth: '650px',
  borderRadius: '12px',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  display: 'flex',
  flexDirection: 'column',
  maxHeight: '90vh',
  overflowY: 'auto'
};

const headerStyle = {
  padding: '16px 20px',
  borderBottom: '1px solid #e2e8f0',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: '#f8fafc',
  borderTopLeftRadius: '12px',
  borderTopRightRadius: '12px'
};

const closeBtnStyle = {
  background: '#e2e8f0',
  border: 'none',
  fontSize: '16px',
  cursor: 'pointer',
  color: '#475569',
  width: '28px',
  height: '28px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background-color 0.2s'
};

const detailsGrid = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '16px',
  fontSize: '14px',
  backgroundColor: '#f0f9ff',
  padding: '16px',
  border: '1px solid #bae6fd',
  borderRadius: '8px'
};

const lbl = {
  color: '#64748b',
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
};
