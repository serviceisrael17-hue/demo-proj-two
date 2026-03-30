import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';

export default function InvoiceHistory() {
  const [filterType, setFilterType] = useState('All');
  
  const vouchers = useLiveQuery(() => {
    if (filterType === 'All') return db.vouchers.toArray();
    return db.vouchers.where('type').equals(filterType).toArray();
  }, [filterType]) || [];

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this voucher?')) {
      await db.vouchers.delete(id);
      // Delete associated items
      await db.voucherItems.where('voucher_id').equals(id).delete();
    }
  };

  return (
    <div>
      <h2 className="card-title">Invoice History</h2>
      
      <div className="form-card" style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
        <label style={{fontWeight: 600}}>Filter By Type:</label>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{padding: '6px 8px'}}>
          <option value="All">All Invoices</option>
          <option value="Sales">Sales</option>
          <option value="Purchase">Purchase</option>
        </select>
      </div>

      <div className="data-grid-container">
        <table className="data-grid">
          <thead>
            <tr>
              <th style={{width: 60}}>ID</th>
              <th style={{width: 100}}>Type</th>
              <th style={{width: 150}}>Voucher No</th>
              <th style={{width: 120}}>Date</th>
              <th>Party Name</th>
              <th className="text-right" style={{width: 150}}>Grand Total</th>
              <th style={{width: 100, textAlign: 'center'}}>Action</th>
            </tr>
          </thead>
          <tbody>
            {vouchers.map(v => (
              <tr key={v.id}>
                <td>{v.id}</td>
                <td>
                  <span style={{
                    backgroundColor: v.type === 'Sales' ? '#e6f3e6' : '#f3e6e6',
                    color: v.type === 'Sales' ? '#2e7d32' : '#c62828',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontWeight: 500,
                    fontSize: '12px'
                  }}>
                    {v.type}
                  </span>
                </td>
                <td>{v.voucher_no}</td>
                <td>{v.date}</td>
                <td>{v.party_name}</td>
                <td className="text-right" style={{fontWeight: 'bold'}}>{v.grand_total.toFixed(2)}</td>
                <td style={{textAlign: 'center'}}>
                  <button className="btn btn-danger" onClick={() => handleDelete(v.id)} style={{padding: '4px 8px', fontSize: '11px'}}>Delete</button>
                </td>
              </tr>
            ))}
            {vouchers.length === 0 && (
              <tr><td colSpan="7" style={{textAlign: 'center', padding: '16px'}}>No records found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
