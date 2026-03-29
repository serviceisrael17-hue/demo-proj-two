# 🏪 Easy Trade — Project Handoff Document
**Last Updated:** 29-March-2026  
**Project Location:** `F:\EASYTRADE`  
**Purpose:** This document contains complete project context, all source files, and next steps so any AI agent (or developer) can continue building from exactly where we stopped — without missing anything.

---

## 📌 Project Background

**Easy Trade** is a legacy desktop billing and accounting application built using **VB.NET + MS Access** used by "Jalaram Trading Co." (and similar retail/trading businesses). The goal is to migrate it to a **modern, offline-first web application** that:
- Works 100% offline using browser's local database (IndexedDB via Dexie.js)
- Has a familiar **Blue/Grey UI** to ease user transition from the legacy desktop app
- Can later be wrapped in **Electron.js** for a true desktop experience
- Supports **GST-compliant billing** (CGST + SGST + IGST)

### Reference materials
- 27 screenshots of the legacy application were analyzed to map all features
- Gemini Strategy Link: `https://gemini.google.com/share/ab55c6b51b6a`

---

## 🏗️ Architecture Decision

| Layer | Technology | Reason |
|---|---|---|
| Frontend Framework | React + Vite | Fast, component-based, Electron-ready |
| Offline Database | Dexie.js (IndexedDB) | Phase 1 only. No backend needed. |
| Future DB (Phase 2) | SQLite-WASM / Turso | For MS Access migration & complex queries |
| Future Desktop Shell (Phase 2) | Electron.js | For hardware (printer) access |
| UI Style | Custom CSS — Blue/Grey | Legacy-inspired, dense data-grid layout |
| Routing | react-router-dom | SPA page navigation |

---

## 📦 Tech Stack & Dependencies (`package.json`)

```json
{
  "name": "easy-trade-demo",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "dexie": "^4.0.8",
    "dexie-react-hooks": "^1.1.7",
    "lucide-react": "^0.454.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.27.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.3",
    "vite": "^5.4.10"
  }
}
```

---

## 📂 Project File Tree

```
F:\EASYTRADE\
├── index.html              ← Main HTML entrypoint
├── package.json            ← Dependencies
├── vite.config.js          ← Vite config
├── EASYTRADE_HANDOFF.md    ← This file
└── src\
    ├── main.jsx            ← React root renderer
    ├── App.jsx             ← Router + Navigation
    ├── index.css           ← Global Blue/Grey UI Skin
    ├── db\
    │   └── db.js           ← Dexie.js offline database schema
    └── pages\
        ├── ProductMaster.jsx  ← Product CRUD form + table
        └── SalesInvoice.jsx   ← Sales Invoice with auto-GST grid
```

---

## 📄 Complete Source Files

### `index.html`
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Easy Trade Demo</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

---

### `vite.config.js`
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

---

### `src/main.jsx`
```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

---

### `src/App.jsx`
```jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import ProductMaster from './pages/ProductMaster';
import SalesInvoice from './pages/SalesInvoice';

function Home() {
  return (
    <div className="home-screen" style={{textAlign: 'center', marginTop: '60px'}}>
      <h1>Welcome to Easy Trade</h1>
      <p>Select an option from the menu: <strong>Product Master</strong> to add items, <strong>Sales Invoice</strong> to trade.</p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <nav className="top-nav">
          <div className="nav-brand">Easy Trade</div>
          <div className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/products">Product Master</Link>
            <Link to="/sales">Sales Invoice</Link>
          </div>
        </nav>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<ProductMaster />} />
            <Route path="/sales" element={<SalesInvoice />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
```

---

### `src/index.css`
```css
:root {
  --primary-blue: #0078D7;
  --primary-hover: #005A9E;
  --header-bg: #EAEAEA;
  --bg-color: #F0F4F8;
  --text-main: #333333;
  --border-color: #CCCCCC;
  --grid-header: #DDDDDD;
  --grid-row-alt: #F9F9F9;
  --danger: #D32F2F;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: var(--bg-color);
  color: var(--text-main);
  font-size: 14px;
}

.app-container { display: flex; flex-direction: column; height: 100vh; }

.top-nav {
  display: flex;
  align-items: center;
  background-color: var(--header-bg);
  border-bottom: 2px solid var(--primary-blue);
  padding: 8px 16px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.nav-brand { font-size: 18px; font-weight: 700; color: var(--primary-blue); margin-right: 24px; }

.nav-links a {
  margin-right: 16px;
  text-decoration: none;
  color: var(--text-main);
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.nav-links a:hover { background-color: var(--primary-blue); color: white; }

.main-content { flex: 1; padding: 16px; overflow-y: auto; }

.form-card {
  background: white;
  border: 1px solid var(--border-color);
  border-top: 3px solid var(--primary-blue);
  border-radius: 4px;
  padding: 16px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  margin-bottom: 16px;
}

.card-title {
  margin-top: 0; margin-bottom: 16px;
  font-size: 18px; color: var(--primary-blue);
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 8px;
}

.form-row { display: flex; gap: 16px; margin-bottom: 12px; align-items: flex-end; }
.form-group { display: flex; flex-direction: column; flex: 1; }
.form-group label { font-size: 12px; font-weight: 600; margin-bottom: 4px; color: #555; }
.form-group input, .form-group select {
  padding: 6px 8px;
  border: 1px solid var(--border-color);
  border-radius: 2px;
  font-family: inherit;
  font-size: 13px;
}
.form-group input:focus, .form-group select:focus {
  outline: none;
  border-color: var(--primary-blue);
  box-shadow: 0 0 0 1px var(--primary-blue);
}

.btn {
  padding: 8px 16px;
  background-color: var(--primary-blue);
  color: white;
  border: 1px solid transparent;
  border-radius: 3px;
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  transition: background-color 0.2s;
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
}
.btn:hover { background-color: var(--primary-hover); }
.btn-danger { background-color: var(--danger); }
.btn-danger:hover { background-color: #B71C1C; }
.btn-secondary { background-color: #f1f1f1; color: #333; border: 1px solid var(--border-color); }
.btn-secondary:hover { background-color: #e2e2e2; }

.data-grid-container {
  overflow-x: auto; margin-top: 16px;
  border: 1px solid var(--border-color);
}
.data-grid {
  width: 100%; border-collapse: collapse;
  background: white; table-layout: fixed;
}
.data-grid th, .data-grid td {
  border-bottom: 1px solid var(--border-color);
  border-right: 1px solid var(--border-color);
  padding: 6px 8px;
  text-align: left; font-size: 13px;
}
.data-grid th { background-color: var(--grid-header); font-weight: 600; color: #333; }
.data-grid td input {
  width: 100%; border: none; background: transparent;
  padding: 2px 4px; font-family: inherit; font-size: 13px;
}
.data-grid td input:focus { outline: 1px solid var(--primary-blue); background: white; }
.data-grid tbody tr:nth-child(even) { background-color: var(--grid-row-alt); }
.data-grid tbody tr:hover { background-color: #eef5fb; }
.text-right { text-align: right !important; }
```

---

### `src/db/db.js`
```js
import Dexie from 'dexie';

export const db = new Dexie('EasyTradeDB');

db.version(1).stores({
  products: '++id, code, name, uom, rate, cgst, sgst',
  vouchers: '++id, type, voucher_no, date, party_name, grand_total',
  voucherItems: '++id, voucher_id, product_id, qty, rate, basic_amt, cgst_amt, sgst_amt, total_amt'
});

// Seed data on first launch
export async function populateInitialData() {
  const count = await db.products.count();
  if (count === 0) {
    await db.products.bulkAdd([
      { code: '090230', name: 'WB LF 250GMS', uom: 'KG', rate: 519.24, cgst: 2.50, sgst: 2.50 },
      { code: '090231', name: 'NAVCHETAN ELAICHI 20RS', uom: 'PKT', rate: 14.29, cgst: 2.50, sgst: 2.50 }
    ]);
  }
}

populateInitialData();
```

---

### `src/pages/ProductMaster.jsx`
```jsx
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
              <th>ID</th><th>Code</th><th>Product Name</th><th>Unit</th>
              <th className="text-right">Rate</th>
              <th className="text-right">CGST %</th>
              <th className="text-right">SGST %</th>
              <th style={{width: 80}}>Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td><td>{p.code}</td><td>{p.name}</td><td>{p.uom}</td>
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
```

---

### `src/pages/SalesInvoice.jsx`
```jsx
import React, { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';

export default function SalesInvoice() {
  const productsList = useLiveQuery(() => db.products.toArray()) || [];
  
  const [invoiceHeader, setInvoiceHeader] = useState({
    partyName: 'CASH A/C',
    address: '',
    invNo: 'AUTO',
    invDate: new Date().toISOString().split('T')[0]
  });

  const [items, setItems] = useState([
    { id: 1, productId: '', qty: 1, Object: null }
  ]);

  const handleRowChange = (index, field, value) => {
    const newItems = [...items];
    const row = newItems[index];
    row[field] = value;
    if (field === 'productId') {
      const p = productsList.find(p => p.id === Number(value));
      if (p) { row.Object = p; row.rate = p.rate; row.cgst = p.cgst; row.sgst = p.sgst; }
      else { row.Object = null; }
    }
    setItems(newItems);
  };

  const addRow = () => setItems([...items, { id: Date.now(), productId: '', qty: 1, Object: null }]);

  const calculatedItems = useMemo(() => {
    return items.map(item => {
      let basicAmt = 0, cgstAmt = 0, sgstAmt = 0, totalAmount = 0;
      if (item.Object) {
        basicAmt = Number(item.qty) * Number(item.rate || 0);
        cgstAmt = basicAmt * (Number(item.cgst || 0) / 100);
        sgstAmt = basicAmt * (Number(item.sgst || 0) / 100);
        totalAmount = basicAmt + cgstAmt + sgstAmt;
      }
      return { ...item, basicAmt, cgstAmt, sgstAmt, totalAmount };
    });
  }, [items]);

  const totals = useMemo(() => {
    return calculatedItems.reduce((acc, curr) => ({
      qty: acc.qty + Number(curr.qty || 0),
      basic: acc.basic + Number(curr.basicAmt || 0),
      cgst: acc.cgst + Number(curr.cgstAmt || 0),
      sgst: acc.sgst + Number(curr.sgstAmt || 0),
      total: acc.total + Number(curr.totalAmount || 0)
    }), { qty: 0, basic: 0, cgst: 0, sgst: 0, total: 0 });
  }, [calculatedItems]);

  const grandTotal = Math.round(totals.total);
  const roundOff = (grandTotal - totals.total).toFixed(2);

  const saveInvoice = async () => {
    try {
      if(totals.total === 0) return alert('Cannot save empty invoice');
      const vId = await db.vouchers.add({
        type: 'Sales',
        voucher_no: invoiceHeader.invNo === 'AUTO' ? `INV-${Date.now()}` : invoiceHeader.invNo,
        date: invoiceHeader.invDate,
        party_name: invoiceHeader.partyName,
        grand_total: grandTotal
      });
      const lineItemsToSave = calculatedItems.filter(i => i.Object).map(i => ({
        voucher_id: vId, product_id: i.Object.id, qty: i.qty, rate: i.rate,
        basic_amt: i.basicAmt, cgst_amt: i.cgstAmt, sgst_amt: i.sgstAmt, total_amt: i.totalAmount
      }));
      if(lineItemsToSave.length > 0) await db.voucherItems.bulkAdd(lineItemsToSave);
      alert(`Invoice saved successfully! ID: ${vId}`);
      setItems([{ id: Date.now(), productId: '', qty: 1, Object: null }]);
      setInvoiceHeader({...invoiceHeader, invNo: 'AUTO'});
    } catch(err) { alert("Error saving: " + err); }
  };

  return (
    <div>
      <h2 className="card-title">Sales Invoice (Tax)</h2>
      <div className="form-card" style={{marginBottom: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0}}>
        <div className="form-row">
          <div className="form-group" style={{flex: 2}}>
            <label>Party Name / Cash</label>
            <input value={invoiceHeader.partyName} onChange={e => setInvoiceHeader({...invoiceHeader, partyName: e.target.value})} autoFocus />
          </div>
          <div className="form-group">
            <label>Invoice No.</label>
            <input value={invoiceHeader.invNo} onChange={e => setInvoiceHeader({...invoiceHeader, invNo: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Date</label>
            <input type="date" value={invoiceHeader.invDate} onChange={e => setInvoiceHeader({...invoiceHeader, invDate: e.target.value})} />
          </div>
        </div>
      </div>
      <div className="data-grid-container" style={{marginTop: 0, borderTop: 'none'}}>
        <table className="data-grid">
          <thead>
            <tr>
              <th style={{width: 40}}>Sr</th>
              <th>Product Name</th>
              <th style={{width: 80}}>Qty</th>
              <th style={{width: 60}}>Unit</th>
              <th className="text-right" style={{width: 100}}>Rate</th>
              <th className="text-right" style={{width: 120}}>Basic Amt</th>
              <th className="text-right" style={{width: 100}}>CGST Amt</th>
              <th className="text-right" style={{width: 100}}>SGST Amt</th>
              <th className="text-right" style={{width: 120}}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {calculatedItems.map((item, idx) => (
              <tr key={item.id}>
                <td style={{textAlign: 'center'}}>{idx + 1}</td>
                <td>
                  <select value={item.productId} onChange={e => handleRowChange(idx, 'productId', e.target.value)}
                    style={{width: '100%', border: 'none', background: 'transparent', outline: 'none', fontFamily: 'inherit'}}>
                    <option value="">-- Select Product --</option>
                    {productsList.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
                  </select>
                </td>
                <td><input type="number" value={item.qty} onChange={e => handleRowChange(idx, 'qty', e.target.value)} disabled={!item.Object} /></td>
                <td style={{textAlign: 'center'}}>{item.Object?.uom || ''}</td>
                <td className="text-right">{item.Object?.rate.toFixed(2) || ''}</td>
                <td className="text-right">{item.basicAmt ? item.basicAmt.toFixed(2) : ''}</td>
                <td className="text-right">{item.cgstAmt ? item.cgstAmt.toFixed(2) : ''}</td>
                <td className="text-right">{item.sgstAmt ? item.sgstAmt.toFixed(2) : ''}</td>
                <td className="text-right" style={{fontWeight: 'bold'}}>{item.totalAmount ? item.totalAmount.toFixed(2) : ''}</td>
              </tr>
            ))}
            <tr>
              <td colSpan="9">
                <button type="button" onClick={addRow} className="btn btn-secondary" style={{padding: '4px 8px', fontSize: '11px', marginTop: '4px'}}>+ Add Row</button>
              </td>
            </tr>
          </tbody>
          <tfoot style={{backgroundColor: '#EAEAEA', fontWeight: 'bold'}}>
            <tr>
              <td colSpan="2" className="text-right">Sub Totals :</td>
              <td style={{textAlign: 'center'}}>{totals.qty}</td>
              <td></td><td></td>
              <td className="text-right">{totals.basic.toFixed(2)}</td>
              <td className="text-right">{totals.cgst.toFixed(2)}</td>
              <td className="text-right">{totals.sgst.toFixed(2)}</td>
              <td className="text-right">{totals.total.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="form-card" style={{marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#d0dbe5'}}>
        <div style={{display: 'flex', gap: '8px'}}>
          <button className="btn" onClick={saveInvoice} style={{padding: '10px 32px', fontSize: '15px'}}>Save Invoice</button>
          <button className="btn btn-secondary">Print</button>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px'}}>
          <div style={{fontSize: '13px', display: 'flex', width: '200px', justifyContent: 'space-between'}}>
            <span>Round Off :</span><span>{roundOff}</span>
          </div>
          <div style={{fontSize: '18px', fontWeight: 'bold', display: 'flex', width: '200px', justifyContent: 'space-between'}}>
            <span>Grand Total :</span><span>{grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## ⚙️ How to Run

> [!IMPORTANT]
> The project files are all written, but `npm install` has NOT been confirmed to have finished yet. Run these commands first.

### Step 1 — Install dependencies
```bash
cd F:\EASYTRADE
npm install
```

### Step 2 — Start dev server
```bash
npm run dev
```

Open browser at: `http://localhost:5173`

---

## ✅ What's DONE (Phase 1)

| Feature | Status |
|---|---|
| Project scaffold (Vite + React) | ✅ Done |
| Global Blue/Grey CSS Skin | ✅ Done |
| Dexie.js Offline DB (3 tables) | ✅ Done |
| Auto-seed 2 sample products on launch | ✅ Done |
| Product Master — Add, List, Delete | ✅ Done |
| Sales Invoice — Multi-row grid | ✅ Done |
| Auto GST calc (CGST + SGST) | ✅ Done |
| Sub Totals, Round Off, Grand Total | ✅ Done |
| Save Invoice to local IndexedDB | ✅ Done |

---

## 🔜 What's NEXT (Continue From Here)

### Priority 1 — Pending Demo Features
1. **Purchase Invoice** page (same grid layout as Sales, but reversed party logic)
2. **Invoice List / History** page — Show all saved vouchers from `db.vouchers`
3. **Ledger Master** page — CRUD for party accounts (Customers, Suppliers, Cash/Bank)
4. **Receipt & Payment** vouchers — Simple debit/credit entry forms
5. **UOM Master** — Dynamic list instead of hardcoded KG/NOS/PKT

### Priority 2 — Polish
6. Keyboard navigation in the invoice grid (Enter to move to next cell)
7. Print/PDF export of invoice
8. Online/Offline status indicator in header
9. Discount column in the Sales Invoice grid (matching legacy app)
10. IGST support for inter-state sales

### Phase 2 (Production / Desktop)
- Wrap in **Electron.js** for printer access
- Migrate DB to **SQLite-WASM or Turso** for MS Access migration
- Add cloud sync (`tenant_id` based multi-tenant backend)
- Build all 15+ report screens from the legacy software

---

## 🗞️ Database Schema (Current)

### `products` table
| Field | Type | Notes |
|---|---|---|
| id | autoincrement | Primary key |
| code | string | HSN code |
| name | string | Product display name |
| uom | string | "KG", "NOS", "PKT", etc. |
| rate | number | Default selling rate |
| cgst | number | CGST % (e.g., 2.5) |
| sgst | number | SGST % (e.g., 2.5) |

### `vouchers` table
| Field | Type | Notes |
|---|---|---|
| id | autoincrement | Primary key |
| type | string | "Sales", "Purchase", etc. |
| voucher_no | string | "INV-123..." or custom |
| date | string | ISO date string |
| party_name | string | Customer or supplier name |
| grand_total | number | Final rounded total |

### `voucherItems` table  
| Field | Type | Notes |
|---|---|---|
| id | autoincrement | Primary key |
| voucher_id | number | FK → vouchers.id |
| product_id | number | FK → products.id |
| qty | number | Quantity |
| rate | number | Rate at time of sale |
| basic_amt | number | qty × rate |
| cgst_amt | number | CGST calculated value |
| sgst_amt | number | SGST calculated value |
| total_amt | number | basicAmt + cgst + sgst |

---

*This file was auto-generated by the Antigravity AI Agent from the conversation context. All source files above are the current state of `F:\EASYTRADE`.*
