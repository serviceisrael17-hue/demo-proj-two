import React, { useState } from 'react';
import { useSupabaseCollection } from '../hooks/useSupabaseCollection';
import { supabase } from '../db/supabaseClient';

export default function ReceiptPayment() {
  const ledgers = useSupabaseCollection('ledgers');
  const vouchers = useSupabaseCollection('receiptPayments');
  
  const [formData, setFormData] = useState({
    type: 'Receipt',
    voucher_no: 'AUTO',
    date: new Date().toISOString().split('T')[0],
    ledger_id: '',
    amount: '',
    remarks: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.ledger_id || !formData.amount) {
      alert("Please select Ledger and enter Amount.");
      return;
    }
    
    await supabase.from('receiptPayments').insert([{
      type: formData.type.toLowerCase(), // Store as lowercase logic for consistency
      voucher_no: formData.voucher_no === 'AUTO' ? `VCH-${Date.now()}` : formData.voucher_no,
      date: formData.date,
      ledger_id: Number(formData.ledger_id),
      amount: Number(formData.amount),
      remarks: formData.remarks
    }]);
    
    setFormData({
      ...formData,
      voucher_no: 'AUTO',
      ledger_id: '',
      amount: '',
      remarks: ''
    });
    alert(`${formData.type} saved successfully!`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this entry?")) {
      await supabase.from('receiptPayments').delete().match({ id });
    }
  };

  return (
    <div>
      <h2 className="card-title">Receipt & Payment</h2>
      
      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Voucher Type</label>
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} style={{
                backgroundColor: formData.type === 'Receipt' ? '#e8f5e9' : '#ffebee',
                fontWeight: 600,
                color: formData.type === 'Receipt' ? '#2e7d32' : '#c62828'
              }}>
                <option value="Receipt">Receipt (+)</option>
                <option value="Payment">Payment (-)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Voucher No</label>
              <input value={formData.voucher_no} onChange={e => setFormData({...formData, voucher_no: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Date</label>
              <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group" style={{flex: 2}}>
              <label>Ledger Account</label>
              <select value={formData.ledger_id} onChange={e => setFormData({...formData, ledger_id: e.target.value})} required>
                <option value="">-- Select Ledger --</option>
                {ledgers.map(l => (
                  <option key={l.id} value={l.id}>{l.name} ({l.group})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Amount (₹)</label>
              <input type="number" step="0.01" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group" style={{flex: 3}}>
              <label>Remarks / Narration</label>
              <input value={formData.remarks} onChange={e => setFormData({...formData, remarks: e.target.value})} placeholder="e.g. Paid for rent, Received cash" />
            </div>
            <div className="form-group" style={{flex: 1, justifyContent: 'flex-end'}}>
              <button type="submit" className="btn" style={{padding: '10px', fontSize: '14px', width: '100%'}}>
                Save {formData.type}
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="data-grid-container">
        <table className="data-grid">
          <thead>
            <tr>
              <th style={{width: 60}}>ID</th>
              <th style={{width: 90}}>Type</th>
              <th style={{width: 120}}>Voucher No</th>
              <th style={{width: 100}}>Date</th>
              <th>Ledger</th>
              <th>Remarks</th>
              <th className="text-right" style={{width: 120}}>Amount</th>
              <th style={{width: 80}}>Action</th>
            </tr>
          </thead>
          <tbody>
            {vouchers.slice().reverse().map(v => {
              const ledger = ledgers.find(l => l.id === v.ledger_id);
              return (
                <tr key={v.id}>
                  <td>{v.id}</td>
                  <td style={{color: v.type.toLowerCase() === 'receipt' ? '#2e7d32' : '#c62828', fontWeight: 600, textTransform: 'capitalize'}}>{v.type}</td>
                  <td>{v.voucher_no}</td>
                  <td>{v.date}</td>
                  <td>{ledger ? ledger.name : 'Unknown Account'}</td>
                  <td style={{color: '#666', fontStyle: 'italic'}}>{v.remarks}</td>
                  <td className="text-right" style={{fontWeight: 'bold'}}>{Number(v.amount).toFixed(2)}</td>
                  <td>
                    <button className="btn btn-danger" onClick={() => handleDelete(v.id)} style={{padding: '4px 8px', fontSize: '11px'}}>Del</button>
                  </td>
                </tr>
              );
            })}
            {vouchers.length === 0 && (
              <tr><td colSpan="8" style={{textAlign: 'center', padding: '16px'}}>No receipts or payments recorded yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
