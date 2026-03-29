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
      if (p) {
        row.Object = p;
        row.rate = p.rate;
        row.cgst = p.cgst;
        row.sgst = p.sgst;
      } else {
        row.Object = null;
      }
    }
    setItems(newItems);
  };

  const addRow = () => setItems([...items, { id: Date.now(), productId: '', qty: 1, Object: null }]);

  const calculatedItems = useMemo(() => {
    return items.map(item => {
      let basicAmt = 0;
      let cgstAmt = 0;
      let sgstAmt = 0;
      let totalAmount = 0;
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
        voucher_id: vId,
        product_id: i.Object.id,
        qty: i.qty,
        rate: i.rate,
        basic_amt: i.basicAmt,
        cgst_amt: i.cgstAmt,
        sgst_amt: i.sgstAmt,
        total_amt: i.totalAmount
      }));

      if(lineItemsToSave.length > 0) {
        await db.voucherItems.bulkAdd(lineItemsToSave);
      }
      
      alert(`Invoice saved successfully with ID: ${vId}`);
      setItems([{ id: Date.now(), productId: '', qty: 1, Object: null }]);
      setInvoiceHeader({...invoiceHeader, invNo: 'AUTO'});
    } catch(err) {
      alert("Error saving: " + err);
    }
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
                  <select 
                    value={item.productId} 
                    onChange={e => handleRowChange(idx, 'productId', e.target.value)}
                    style={{width: '100%', border: 'none', background: 'transparent', outline: 'none', fontFamily: 'inherit'}}
                  >
                    <option value="">-- Select Product --</option>
                    {productsList.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <input type="number" value={item.qty} onChange={e => handleRowChange(idx, 'qty', e.target.value)} disabled={!item.Object} />
                </td>
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
              <td></td>
              <td></td>
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
            <span>Round Off :</span>
            <span>{roundOff}</span>
          </div>
          <div style={{fontSize: '18px', fontWeight: 'bold', display: 'flex', width: '200px', justifyContent: 'space-between'}}>
            <span>Grand Total :</span>
            <span>{grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
