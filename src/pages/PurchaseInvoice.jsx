import React, { useState, useMemo, useEffect } from 'react';
import { useLocalCollection } from '../hooks/useLocalCollection';

export default function PurchaseInvoice() {
  const { data: productsList } = useLocalCollection('products');
  const { data: ledgersList } = useLocalCollection('ledgers');
  const { add: addVoucher } = useLocalCollection('vouchers');
  const { add: addVoucherItem } = useLocalCollection('voucherItems');
  
  const [invoiceHeader, setInvoiceHeader] = useState({
    partyName: 'CASH A/C',
    address: '',
    invNo: 'AUTO',
    invDate: new Date().toISOString().split('T')[0]
  });

  const [items, setItems] = useState([
    { id: 1, productId: '', qty: 1, discount: 0, igst: 0, Object: null }
  ]);

  // Keyboard navigation snippet: Enter to go to next input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        const formElements = Array.from(document.querySelectorAll('input:not(:disabled), select:not(:disabled), button:not(:disabled)'));
        const index = formElements.indexOf(document.activeElement);
        if (index > -1 && index < formElements.length - 1) {
          e.preventDefault();
          formElements[index + 1].focus();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

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
        row.igst = p.igst || 0;
        row.discount = p.discount || 0;
      } else {
        row.Object = null;
      }
    }
    setItems(newItems);
  };

  const addRow = () => setItems([...items, { id: Date.now(), productId: '', qty: 1, discount: 0, igst: 0, Object: null }]);

  const calculatedItems = useMemo(() => {
    return items.map(item => {
      let grossAmt = 0;
      let discountAmt = 0;
      let taxableAmt = 0;
      let cgstAmt = 0;
      let sgstAmt = 0;
      let igstAmt = 0;
      let totalAmount = 0;
      
      if (item.Object) {
        grossAmt = Number(item.qty) * Number(item.rate || 0);
        discountAmt = grossAmt * (Number(item.discount || 0) / 100);
        taxableAmt = grossAmt - discountAmt;
        cgstAmt = taxableAmt * (Number(item.cgst || 0) / 100);
        sgstAmt = taxableAmt * (Number(item.sgst || 0) / 100);
        igstAmt = taxableAmt * (Number(item.igst || 0) / 100);
        totalAmount = taxableAmt + cgstAmt + sgstAmt + igstAmt;
      }
      return { ...item, grossAmt, discountAmt, basicAmt: taxableAmt, cgstAmt, sgstAmt, igstAmt, totalAmount };
    });
  }, [items]);

  const totals = useMemo(() => {
    return calculatedItems.reduce((acc, curr) => ({
      qty: acc.qty + Number(curr.qty || 0),
      gross: acc.gross + Number(curr.grossAmt || 0),
      discount: acc.discount + Number(curr.discountAmt || 0),
      basic: acc.basic + Number(curr.basicAmt || 0),
      cgst: acc.cgst + Number(curr.cgstAmt || 0),
      sgst: acc.sgst + Number(curr.sgstAmt || 0),
      igst: acc.igst + Number(curr.igstAmt || 0),
      total: acc.total + Number(curr.totalAmount || 0)
    }), { qty: 0, gross: 0, discount: 0, basic: 0, cgst: 0, sgst: 0, igst: 0, total: 0 });
  }, [calculatedItems]);

  const grandTotal = Math.round(totals.total);
  const roundOff = (grandTotal - totals.total).toFixed(2);

  const saveInvoice = async () => {
    try {
      if(totals.total === 0) return alert('Cannot save empty invoice');
      
      const vId = await addVoucher({
        type: 'purchase',
        voucher_no: invoiceHeader.invNo === 'AUTO' ? `PUR-${Date.now()}` : invoiceHeader.invNo,
        date: invoiceHeader.invDate,
        party_name: invoiceHeader.partyName,
        grand_total: grandTotal
      });

      const lineItemsToSave = calculatedItems.filter(i => i.Object).map(i => ({
        voucher_id: vId,
        product_id: i.Object.id,
        qty: Number(i.qty),
        rate: Number(i.rate),
        discount_pct: Number(i.discount),
        discount_amt: Number(i.discountAmt),
        basic_amt: Number(i.basicAmt),
        cgst_amt: Number(i.cgstAmt),
        sgst_amt: Number(i.sgstAmt),
        igst_amt: Number(i.igstAmt),
        total_amt: Number(i.totalAmount)
      }));

      for (const item of lineItemsToSave) {
        await addVoucherItem(item);
      }
      
      alert(`Purchase Invoice saved successfully with ID: ${vId}`);
      setItems([{ id: Date.now(), productId: '', qty: 1, discount: 0, igst: 0, Object: null }]);
      setInvoiceHeader({...invoiceHeader, invNo: 'AUTO'});
    } catch(err) {
      alert("Error saving: " + err.message);
    }
  };

  return (
    <div>
      <h2 className="card-title">Purchase Invoice (Tax)</h2>
      
      <div className="form-card" style={{marginBottom: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0}}>
        <div className="form-row">
          <div className="form-group" style={{flex: 2}}>
            <label>Supplier / Party Name</label>
            <select value={invoiceHeader.partyName} onChange={e => setInvoiceHeader({...invoiceHeader, partyName: e.target.value})} autoFocus>
              <option value="CASH A/C">CASH A/C</option>
              {ledgersList.filter(l => l.group === 'Sundry Creditors' || l.group === 'Cash in Hand' || l.group === 'Bank Accounts').map(l => (
                <option key={l.id} value={l.name}>{l.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Vendor Inv No.</label>
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
              <th style={{width: 70}}>Qty</th>
              <th className="text-right" style={{width: 90}}>Rate</th>
              <th className="text-right" style={{width: 70}}>Disc %</th>
              <th className="text-right" style={{width: 100}}>Taxable</th>
              <th className="text-right" style={{width: 80}}>CGST</th>
              <th className="text-right" style={{width: 80}}>SGST</th>
              <th className="text-right" style={{width: 80}}>IGST %</th>
              <th className="text-right" style={{width: 100}}>Amount</th>
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
                <td className="text-right">{item.Object?.rate.toFixed(2) || ''}</td>
                <td>
                   <input type="number" step="0.01" className="text-right" value={item.discount} onChange={e => handleRowChange(idx, 'discount', e.target.value)} disabled={!item.Object} />
                </td>
                <td className="text-right">{item.basicAmt ? item.basicAmt.toFixed(2) : ''}</td>
                <td className="text-right">{item.cgstAmt ? item.cgstAmt.toFixed(2) : ''}</td>
                <td className="text-right">{item.sgstAmt ? item.sgstAmt.toFixed(2) : ''}</td>
                <td>
                   <input type="number" step="0.01" className="text-right" value={item.igst} onChange={e => handleRowChange(idx, 'igst', e.target.value)} disabled={!item.Object} />
                </td>
                <td className="text-right" style={{fontWeight: 'bold'}}>{item.totalAmount ? item.totalAmount.toFixed(2) : ''}</td>
              </tr>
            ))}
            <tr>
              <td colSpan="10">
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
              <td className="text-right">{totals.igst.toFixed(2)}</td>
              <td className="text-right">{totals.total.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="form-card" style={{marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#d0dbe5'}}>
        <div style={{display: 'flex', gap: '8px'}}>
          <button className="btn" onClick={saveInvoice} style={{padding: '10px 32px', fontSize: '15px'}}>Save Invoice</button>
          <button className="btn btn-secondary" onClick={() => window.print()}>Print / Export PDF</button>
        </div>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px'}}>
          <div style={{fontSize: '13px', display: 'flex', width: '200px', justifyContent: 'space-between'}}>
            <span>Total Discount :</span>
            <span>{totals.discount.toFixed(2)}</span>
          </div>
          <div style={{fontSize: '13px', display: 'flex', width: '200px', justifyContent: 'space-between'}}>
            <span>Round Off :</span>
            <span>{roundOff}</span>
          </div>
          <div style={{fontSize: '18px', fontWeight: 'bold', display: 'flex', width: '200px', justifyContent: 'space-between', borderTop: '1px solid #aaa', paddingTop: '4px', marginTop: '4px'}}>
            <span>Grand Total :</span>
            <span>{grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
