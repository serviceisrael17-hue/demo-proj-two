import Dexie from 'dexie';

export const db = new Dexie('EasyTradeDB');

db.version(1).stores({
  products: '++id, code, name, uom, rate, cgst, sgst',
  vouchers: '++id, type, voucher_no, date, party_name, grand_total',
  voucherItems: '++id, voucher_id, product_id, qty, rate, basic_amt, cgst_amt, sgst_amt, total_amt'
});

db.version(2).stores({
  ledgers: '++id, name, group, opening_balance',
  uoms: '++id, name',
  receiptPayments: '++id, type, voucher_no, date, ledger_id, amount, remarks'
});

db.version(3).stores({
  products: '++id, code, name, uom, rate, cgst, sgst, igst, discount',
  voucherItems: '++id, voucher_id, product_id, qty, rate, discount_pct, discount_amt, basic_amt, cgst_amt, sgst_amt, igst_amt, total_amt'
});

// Seed data on first launch
export async function populateInitialData() {
  const count = await db.products.count();
  if (count === 0) {
    await db.products.bulkAdd([
      { code: '090230', name: 'WB LF 250GMS', uom: 'KG', rate: 519.24, cgst: 2.50, sgst: 2.50, igst: 0, discount: 0 },
      { code: '090231', name: 'NAVCHETAN ELAICHI 20RS', uom: 'PKT', rate: 14.29, cgst: 2.50, sgst: 2.50, igst: 0, discount: 0 }
    ]);
  }

  const uomCount = await db.uoms.count();
  if (uomCount === 0) {
    await db.uoms.bulkAdd([
      { name: 'KG' },
      { name: 'NOS' },
      { name: 'PKT' }
    ]);
  }

  const ledgerCount = await db.ledgers.count();
  if (ledgerCount === 0) {
    await db.ledgers.bulkAdd([
      { name: 'CASH A/C', group: 'Cash in Hand', opening_balance: 0 },
      { name: 'Bank A/c', group: 'Bank Accounts', opening_balance: 0 }
    ]);
  }
}

// Call on startup
populateInitialData();
