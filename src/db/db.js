import Dexie from 'dexie';

export const db = new Dexie('EasyTradeDB');

db.version(1).stores({
  products: '++id, code, name, uom, rate, cgst, sgst',
  vouchers: '++id, type, voucher_no, date, party_name, grand_total',
  voucherItems: '++id, voucher_id, product_id, qty, rate, basic_amt, cgst_amt, sgst_amt, total_amt'
});

// Helper to seed initial data if empty
export async function populateInitialData() {
  const count = await db.products.count();
  if (count === 0) {
    await db.products.bulkAdd([
      { code: '090230', name: 'WB LF 250GMS', uom: 'KG', rate: 519.24, cgst: 2.50, sgst: 2.50 },
      { code: '090231', name: 'NAVCHETAN ELAICHI 20RS', uom: 'PKT', rate: 14.29, cgst: 2.50, sgst: 2.50 }
    ]);
  }
}

// Call on startup
populateInitialData();
