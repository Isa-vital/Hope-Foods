import React, { useEffect, useRef } from 'react';
import { Printer, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatUGX } from '@/lib/api';

/**
 * Printable thermal-style receipt (80mm).
 * Props:
 *   order: { order_number, created_at, order_type, customer_name, customer_phone, table_number, items: [{item_name|menu_item_name, quantity, unit_price, subtotal}], subtotal, tax, total, payment_method, cashier_name, notes }
 *   onClose: () => void
 *   autoPrint: bool (default true)
 */
const Receipt = ({ order, onClose, autoPrint = false }) => {
  const printedRef = useRef(false);

  useEffect(() => {
    if (autoPrint && !printedRef.current) {
      printedRef.current = true;
      // Small delay to ensure DOM is painted
      const t = setTimeout(() => window.print(), 250);
      return () => clearTimeout(t);
    }
  }, [autoPrint]);

  if (!order) return null;

  const items = order.items || [];
  const subtotal = Number(order.subtotal ?? items.reduce((s, i) => s + Number(i.subtotal ?? (i.unit_price * i.quantity) ?? 0), 0));
  const tax = Number(order.tax ?? 0);
  const total = Number(order.total ?? (subtotal + tax));
  const dateStr = new Date(order.created_at || Date.now()).toLocaleString('en-UG', {
    dateStyle: 'medium', timeStyle: 'short'
  });

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 print:bg-white print:p-0 print:static">
      {/* Print-only style: 80mm thermal */}
      <style>{`
        @media print {
          @page { size: 80mm auto; margin: 4mm; }
          html, body { background: #fff !important; }
          body * { visibility: hidden !important; }
          #receipt-printable, #receipt-printable * { visibility: visible !important; }
          #receipt-printable {
            position: absolute !important;
            left: 0; top: 0;
            width: 72mm !important;
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            font-family: 'Courier New', monospace !important;
            color: #000 !important;
            font-size: 11px !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full max-h-[90vh] overflow-y-auto print:max-h-none print:overflow-visible print:rounded-none print:shadow-none">
        {/* Top toolbar (screen only) */}
        <div className="no-print sticky top-0 bg-stone-50 border-b border-stone-200 px-4 py-3 flex items-center justify-between">
          <h3 className="font-bold text-stone-900">Receipt Preview</h3>
          <div className="flex items-center gap-2">
            <Button onClick={() => window.print()} className="bg-orange-600 hover:bg-orange-700 text-white">
              <Printer size={16} className="mr-2" />Print
            </Button>
            {onClose && (
              <button onClick={onClose} className="p-2 hover:bg-stone-200 rounded-lg">
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Receipt body */}
        <div id="receipt-printable" className="p-5 font-mono text-stone-900 text-[13px] leading-snug">
          <div className="text-center mb-3">
            <p className="text-lg font-bold tracking-wide">HOPE FOODS</p>
            <p className="text-[11px]">Restaurant &amp; Hotel</p>
            <p className="text-[11px]">Kampala, Uganda</p>
            <p className="text-[11px]">Tel: +256 700 000 000</p>
          </div>

          <div className="border-t border-dashed border-stone-400 my-2" />

          <div className="text-[12px] space-y-0.5">
            <div className="flex justify-between"><span>Receipt #</span><span className="font-bold">{order.order_number}</span></div>
            <div className="flex justify-between"><span>Date</span><span>{dateStr}</span></div>
            {order.cashier_name && <div className="flex justify-between"><span>Cashier</span><span>{order.cashier_name}</span></div>}
            <div className="flex justify-between"><span>Type</span><span className="uppercase">{(order.order_type || '').replace('_', ' ')}</span></div>
            {order.table_number && <div className="flex justify-between"><span>Table</span><span>{order.table_number}</span></div>}
            {order.customer_name && <div className="flex justify-between"><span>Customer</span><span>{order.customer_name}</span></div>}
            {order.customer_phone && order.customer_phone !== '0000000000' && (
              <div className="flex justify-between"><span>Phone</span><span>{order.customer_phone}</span></div>
            )}
          </div>

          <div className="border-t border-dashed border-stone-400 my-2" />

          <div className="text-[12px]">
            <div className="flex font-bold border-b border-stone-400 pb-1 mb-1">
              <span className="flex-1">Item</span>
              <span className="w-8 text-right">Qty</span>
              <span className="w-20 text-right">Amount</span>
            </div>
            {items.length === 0 && <p className="text-center text-stone-500 py-2">(no items)</p>}
            {items.map((it, idx) => {
              const name = it.item_name || it.menu_item_name || it.name || 'Item';
              const qty = Number(it.quantity || 1);
              const price = Number(it.unit_price ?? it.priceNumber ?? 0);
              const line = Number(it.subtotal ?? price * qty);
              return (
                <div key={idx} className="mb-1">
                  <div className="flex">
                    <span className="flex-1 truncate">{name}</span>
                    <span className="w-8 text-right">{qty}</span>
                    <span className="w-20 text-right">{formatUGX(line)}</span>
                  </div>
                  <div className="text-[10px] text-stone-600 pl-2">@ {formatUGX(price)}</div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-dashed border-stone-400 my-2" />

          <div className="text-[12px] space-y-0.5">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatUGX(subtotal)}</span></div>
            {tax > 0 && <div className="flex justify-between"><span>Tax</span><span>{formatUGX(tax)}</span></div>}
            <div className="flex justify-between text-[14px] font-bold pt-1 border-t border-stone-400">
              <span>TOTAL</span><span>{formatUGX(total)}</span>
            </div>
            {order.payment_method && (
              <div className="flex justify-between pt-1"><span>Paid via</span><span className="uppercase">{order.payment_method.replace('_', ' ')}</span></div>
            )}
          </div>

          <div className="border-t border-dashed border-stone-400 my-2" />

          {order.notes && <p className="text-[11px] italic text-center mb-2">Note: {order.notes}</p>}

          <div className="text-center text-[11px] mt-3">
            <p className="font-bold">THANK YOU!</p>
            <p>Please come again</p>
            <p className="mt-2 text-[10px] text-stone-600">Powered by Hope Foods POS</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Receipt;
