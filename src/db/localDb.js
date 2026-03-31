import Dexie from 'dexie';

export const db = new Dexie('EasyTradeDB');
db.version(1).stores({
    products: '++id, code, name',
    ledgers: '++id, name, group',
    vouchers: '++id, type, date',
    voucherItems: '++id, voucher_id, product_id',
    receiptPayments: '++id, date, ledger_id',
    company: 'id',
    syncQueue: '++id, table, action, data' // To track offline changes
});