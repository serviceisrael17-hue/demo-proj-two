import React, { useState } from 'react';
import { useLocalCollection } from '../hooks/useLocalCollection';

export default function UomMaster() {
  const { data: uoms, add: addUom, remove: deleteUom } = useLocalCollection('uoms');
  
  const [formData, setFormData] = useState({ name: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return;
    await addUom({ name: formData.name });
    setFormData({ name: '' });
  };

  const handleDelete = async (id) => {
    await deleteUom(id);
  };

  return (
    <div>
      <h2 className="card-title">UOM Master</h2>
      
      <div className="form-card">
        <form onSubmit={handleSubmit} className="form-row">
          <div className="form-group" style={{flex: 1}}>
            <label>UOM Name</label>
            <input value={formData.name} onChange={e => setFormData({name: e.target.value})} required autoFocus placeholder="e.g. LTR, PCS" />
          </div>
          <div className="form-group" style={{flex: 'unset', justifyContent: 'flex-end'}}>
            <button type="submit" className="btn">Save UOM</button>
          </div>
        </form>
      </div>

      <div className="data-grid-container">
        <table className="data-grid">
          <thead>
            <tr>
              <th style={{width: 60}}>ID</th>
              <th>UOM Name</th>
              <th style={{width: 80}}>Action</th>
            </tr>
          </thead>
          <tbody>
            {uoms.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.name}</td>
                <td>
                  <button className="btn btn-danger" onClick={() => handleDelete(u.id)} style={{padding: '4px 8px', fontSize: '11px'}}>Del</button>
                </td>
              </tr>
            ))}
            {uoms.length === 0 && (
              <tr><td colSpan="3" style={{textAlign: 'center', padding: '16px'}}>No UOMs found. Add above.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
