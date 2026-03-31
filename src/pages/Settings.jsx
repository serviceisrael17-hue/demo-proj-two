import React, { useState, useEffect } from 'react';
import { supabase } from '../db/supabaseClient';
import { Settings as SettingsIcon, Trash2, Plus, Save } from 'lucide-react';

export default function Settings() {
  const [businessName, setBusinessName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [address, setAddress] = useState('');
  const [taxRate, setTaxRate] = useState(18);
  const [companyId, setCompanyId] = useState(null);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // New User Form State
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('Employee');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data: compData } = await supabase.from('company').select('*').limit(1).maybeSingle();
    if (compData) {
      setCompanyId(compData.id);
      setBusinessName(compData.business_name || '');
      setGstNumber(compData.gst_number || '');
      setAddress(compData.full_address || '');
      setTaxRate(compData.default_tax_rate || 18);
    }

    const { data: usersData } = await supabase.from('users').select('*').order('id', { ascending: true });
    if (usersData) {
      setUsers(usersData);
    }
    setLoading(false);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const payload = {
      business_name: businessName,
      gst_number: gstNumber,
      full_address: address,
      default_tax_rate: taxRate
    };

    if (companyId) {
      await supabase.from('company').update(payload).eq('id', companyId);
    } else {
      const { data } = await supabase.from('company').insert([payload]).select().maybeSingle();
      if (data) setCompanyId(data.id);
    }
    alert('Profile saved successfully!');
  };

  const submitNewUser = async (e) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;

    const { data, error } = await supabase.from('users').insert([{ 
      name: newUserName, 
      email: newUserEmail, 
      role: newUserRole 
    }]).select().maybeSingle();
    
    if (error) {
       alert("Error adding user: " + error.message);
    } else if (data) {
      setUsers([...users, data]);
      setIsAddingUser(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserRole('Employee');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    await supabase.from('users').delete().eq('id', id);
    setUsers(users.filter(u => u.id !== id));
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <SettingsIcon className="settings-icon-main" size={28} />
        <h1>Company Settings</h1>
      </div>

      <div className="settings-split">
        {/* Left Column: Business Details */}
        <div className="settings-card">
          <h2>Business Details</h2>
          <p className="settings-subtext">Update your company identity and tax configurations.</p>
          
          <form onSubmit={handleSaveProfile} className="settings-form">
            <div className="form-group-settings">
              <label>Business Name *</label>
              <input 
                type="text" 
                required
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
              />
            </div>
            <div className="form-group-settings">
              <label>GST Number</label>
              <input 
                type="text" 
                className="uppercase-input"
                value={gstNumber}
                onChange={e => setGstNumber(e.target.value)}
              />
            </div>
            <div className="form-group-settings">
              <label>Full Address</label>
              <input 
                type="text" 
                value={address}
                onChange={e => setAddress(e.target.value)}
              />
            </div>
            <div className="form-group-settings">
              <label>Default Tax Rate (%)</label>
              <input 
                type="number" 
                value={taxRate}
                onChange={e => setTaxRate(Number(e.target.value))}
              />
            </div>
            <button type="submit" className="btn-save">
              <Save size={18} /> Save Profile
            </button>
          </form>
        </div>

        {/* Right Column: User Management */}
        <div className="settings-card auto-height">
          <div className="settings-card-header">
            <div>
              <h2>User Management</h2>
              <p className="settings-subtext">Manage offline access roles.</p>
            </div>
            {!isAddingUser && (
              <button type="button" onClick={() => setIsAddingUser(true)} className="btn-add">
                <Plus size={16} /> Add User
              </button>
            )}
          </div>

          {isAddingUser && (
            <div className="settings-form" style={{backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '24px', border: '1px solid #e2e8f0'}}>
              <h3 style={{margin: '0 0 12px 0', fontSize: '14px', color: '#334155'}}>Add New User</h3>
              <form onSubmit={submitNewUser} style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                <div className="form-group-settings">
                  <label>Name</label>
                  <input type="text" required value={newUserName} onChange={e => setNewUserName(e.target.value)} placeholder="e.g. Ashish" autoFocus />
                </div>
                <div className="form-group-settings">
                  <label>Email</label>
                  <input type="email" required value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} placeholder="e.g. ashish@gmail.com" />
                </div>
                <div className="form-group-settings">
                  <label>Role</label>
                  <select 
                    value={newUserRole} 
                    onChange={e => setNewUserRole(e.target.value)}
                    style={{padding: '10px 16px', backgroundColor: '#eff6ff80', border: '1px solid #e5e7eb', borderRadius: '8px', outline: 'none'}}
                  >
                    <option value="Employee">Employee</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
                <div style={{display: 'flex', gap: '8px', marginTop: '8px'}}>
                  <button type="submit" className="btn-add" style={{flex: 1, justifyContent: 'center'}}>Save User</button>
                  <button type="button" onClick={() => setIsAddingUser(false)} className="btn-save" style={{background: '#cbd5e1', color: '#334155', flex: 1, marginTop: 0}}>Cancel</button>
                </div>
              </form>
            </div>
          )}

          <div className="settings-table-container">
            <table className="settings-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="3" className="empty-row">Loading...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan="3" className="empty-row">No users found.</td></tr>
                ) : (
                  users.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div className="user-name">{u.name}</div>
                        <div className="user-email">{u.email}</div>
                      </td>
                      <td className="user-role">{u.role}</td>
                      <td className="text-right">
                        <button type="button" onClick={() => handleDeleteUser(u.id)} className="btn-delete-icon">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
