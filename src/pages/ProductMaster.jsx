import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';

export default function ProductMaster() {
  const products = useLiveQuery(() => db.products.toArray()) || [];
  
  const [formData, setFormData] = useState({
    code: '', name: '', uom: 'KG', rate: 0, cgst: 0, sgst: 0
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await db.products.add({
      ...formData,
      rate: Number(formData.rate),
      cgst: Number(formData.cgst),
      sgst: Number(formData.sgst)
    });
    setFormData({ code: '', name: '', uom: 'KG', rate: 0, cgst: 0, sgst: 0 });
  };

  const handleDelete = async (id) => {
    await db.products.delete(id);
  };

  return (
    <div>
      <h2 className="card-title">Product Master</h2>
      
      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Code (HSN)</label>
              <input value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} required autoFocus />
            </div>
            <div className="form-group" style={{flex: 2}}>
              <label>Product Name</label>
              <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Unit (UOM)</label>
              <select value={formData.uom} onChange={e => setFormData({...formData, uom: e.target.value})}>
                <option value="KG">KG</option>
                <option value="NOS">NOS</option>
                <option value="PKT">PKT</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Rate</label>
              <input type="number" step="0.01" value={formData.rate} onChange={e => setFormData({...formData, rate: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>CGST (%)</label>
              <input type="number" step="0.01" value={formData.cgst} onChange={e => setFormData({...formData, cgst: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>SGST (%)</label>
              <input type="number" step="0.01" value={formData.sgst} onChange={e => setFormData({...formData, sgst: e.target.value})} required />
            </div>
            <div className="form-group" style={{justifyContent: 'flex-end'}}>
              <button type="submit" className="btn">Save Product</button>
            </div>
          </div>
        </form>
      </div>

      <div className="data-grid-container">
        <table className="data-grid">
          <thead>
            <tr>
              <th>ID</th>
              <th>Code</th>
              <th>Product Name</th>
              <th>Unit</th>
              <th className="text-right">Rate</th>
              <th className="text-right">CGST %</th>
              <th className="text-right">SGST %</th>
              <th style={{width: 80}}>Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.code}</td>
                <td>{p.name}</td>
                <td>{p.uom}</td>
                <td className="text-right">{p.rate.toFixed(2)}</td>
                <td className="text-right">{p.cgst.toFixed(2)}</td>
                <td className="text-right">{p.sgst.toFixed(2)}</td>
                <td>
                  <button className="btn btn-danger" onClick={() => handleDelete(p.id)} style={{padding: '4px 8px', fontSize: '11px'}}>Del</button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan="8" style={{textAlign: 'center', padding: '16px'}}>No products found. Add a new product above.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
