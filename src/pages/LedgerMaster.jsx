import React, { useState } from 'react';
import { useSupabaseCollection } from '../hooks/useSupabaseCollection';
import { supabase } from '../db/supabaseClient';

export default function LedgerMaster() {
  const ledgers = useSupabaseCollection('ledgers');
  
  const [formData, setFormData] = useState({
    name: '', group: 'Sundry Debtors', opening_balance: 0
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return;
    await supabase.from('ledgers').insert([{
      name: formData.name,
      group: formData.group,
      opening_balance: Number(formData.opening_balance)
    }]);
    setFormData({ name: '', group: 'Sundry Debtors', opening_balance: 0 });
  };

  const handleDelete = async (id) => {
    await supabase.from('ledgers').delete().match({ id });
  };

  return (
    <div>
      <h2 className="card-title">Ledger Master</h2>
      
      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group" style={{flex: 2}}>
              <label>Ledger/Party Name</label>
              <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required autoFocus />
            </div>
            <div className="form-group">
              <label>Group</label>
              <select value={formData.group} onChange={e => setFormData({...formData, group: e.target.value})}>
                <option value="Sundry Debtors">Sundry Debtors</option>
                <option value="Sundry Creditors">Sundry Creditors</option>
                <option value="Cash in Hand">Cash in Hand</option>
                <option value="Bank Accounts">Bank Accounts</option>
                <option value="Direct Incomes">Direct Incomes</option>
                <option value="Direct Expenses">Direct Expenses</option>
                <option value="Indirect Incomes">Indirect Incomes</option>
                <option value="Indirect Expenses">Indirect Expenses</option>
              </select>
            </div>
            <div className="form-group">
              <label>Opening Balance</label>
              <input type="number" step="0.01" value={formData.opening_balance} onChange={e => setFormData({...formData, opening_balance: e.target.value})} required />
            </div>
            <div className="form-group" style={{flex: 'unset', justifyContent: 'flex-end'}}>
              <button type="submit" className="btn">Save Ledger</button>
            </div>
          </div>
        </form>
      </div>

      <div className="data-grid-container">
        <table className="data-grid">
          <thead>
            <tr>
              <th style={{width: 60}}>ID</th>
              <th>Ledger Name</th>
              <th>Group</th>
              <th className="text-right">Opening Balance</th>
              <th style={{width: 80}}>Action</th>
            </tr>
          </thead>
          <tbody>
            {ledgers.map(l => (
              <tr key={l.id}>
                <td>{l.id}</td>
                <td>{l.name}</td>
                <td>{l.group}</td>
                <td className="text-right">{Number(l.opening_balance).toFixed(2)}</td>
                <td>
                  <button className="btn btn-danger" onClick={() => handleDelete(l.id)} style={{padding: '4px 8px', fontSize: '11px'}}>Del</button>
                </td>
              </tr>
            ))}
            {ledgers.length === 0 && (
              <tr><td colSpan="5" style={{textAlign: 'center', padding: '16px'}}>No Ledgers found. Add above.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
