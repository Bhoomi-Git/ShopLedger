const test = require('node:test');
const assert = require('node:assert/strict');
const invoice = require('../lib/invoice');
const pricing = require('../lib/pricing');

function figuresFor(items, coupon = '') {
  const checkout = pricing.computeTotals(items, coupon);
  const { rows, ...totals } = invoice.computeInvoiceFigures({
    items,
    coupon,
    subtotal: checkout.subtotal,
    discount: checkout.discount,
    tax: checkout.tax,
    total: checkout.total
  });
  return { checkout, totals, rows };
}

test('CURRENT BEHAVIOUR: #1001-style mixed slabs use HSN without gstRate', () => {
  // Order snapshots can carry HSN without an explicit gstRate.
  const { checkout, totals, rows } = figuresFor([
    { name: 'Rice', price: 250, qty: 2, hsn: '1006' },
    { name: 'Ghee', price: 250, qty: 1, hsn: '0405' }
  ]);

  assert.deepEqual(checkout.lines.map(line => line.gstPercent), [5, 12]);
  assert.equal(checkout.tax, 55);
  assert.equal(checkout.total, 805);
  assert.deepEqual(rows.map(row => [row.hsn, row.gstPercent, row.lineTax]), [
    ['1006', 5, 25],
    ['0405', 12, 30]
  ]);
  assert.deepEqual(totals, {
    subtotal: 750, discount: 0, tax: 55, cgst: 27.5, sgst: 27.5, total: 805
  });
});

test('CURRENT BEHAVIOUR: #1002-style SAVE10 discounts the subtotal before GST', () => {
  const { checkout, totals, rows } = figuresFor([
    { name: 'Ghee', price: 500, qty: 2, hsn: '0405', gstRate: 12 }
  ], 'SAVE10');

  assert.equal(checkout.discount, 100);
  assert.equal(checkout.tax, 108);
  assert.equal(checkout.total, 1008);
  assert.deepEqual(rows.map(row => [row.gstPercent, row.lineTax]), [[12, 108]]);
  assert.deepEqual(totals, {
    subtotal: 1000, discount: 100, tax: 108, cgst: 54, sgst: 54, total: 1008
  });
});

test('CURRENT BEHAVIOUR: #1004-style SAVE10 honors the 150 cap on the invoice', () => {
  const { checkout, totals, rows } = figuresFor([
    { name: 'Coffee', price: 560, qty: 4, hsn: '0901', gstRate: 18 }
  ], 'SAVE10');

  assert.equal(checkout.subtotal, 2240);
  assert.equal(checkout.discount, 150);
  assert.equal(checkout.tax, 376.2);
  assert.equal(checkout.total, 2466.2);
  assert.deepEqual(rows.map(row => [row.gstPercent, row.lineTax]), [[18, 376.2]]);
  assert.deepEqual(totals, {
    subtotal: 2240, discount: 150, tax: 376.2,
    cgst: 188.1, sgst: 188.1, total: 2466.2
  });
});

test('CURRENT BEHAVIOUR: #1008-style 18% items match checkout without a coupon', () => {
  const { checkout, totals, rows } = figuresFor([
    { name: 'Tea', price: 150, qty: 2, hsn: '0902' },
    { name: 'Coffee', price: 200, qty: 1, hsn: '0901', gstRate: 18 }
  ]);

  assert.deepEqual(rows.map(row => [row.gstPercent, row.lineTax]), [[18, 54], [18, 36]]);
  assert.deepEqual(totals, {
    subtotal: 500, discount: 0, tax: 90, cgst: 45, sgst: 45, total: 590
  });
  assert.deepEqual(totals, {
    subtotal: checkout.subtotal,
    discount: checkout.discount,
    tax: checkout.tax,
    cgst: checkout.cgst,
    sgst: checkout.sgst,
    total: checkout.total
  });
});

test('invoice matches checkout for mixed HSN slabs and a capped SAVE10 coupon', () => {
  const { checkout, totals, rows } = figuresFor([
    { name: 'Rice', price: 500, qty: 2, hsn: '1006' },
    { name: 'Ghee', price: 620, qty: 2, hsn: '0405' }
  ], 'SAVE10');

  assert.deepEqual(totals, {
    subtotal: 2240, discount: 150, tax: 185.49,
    cgst: 92.75, sgst: 92.74, total: 2275.49
  });
  assert.deepEqual(rows.map(row => [row.gstPercent, row.lineTax]),
    checkout.lines.map(line => [line.gstPercent, line.tax]));
  assert.equal(totals.total, checkout.total);
});
