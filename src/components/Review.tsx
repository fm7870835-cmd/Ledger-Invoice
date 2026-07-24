import React, { useState } from 'react';
import { Invoice, LineItem } from '../types';

interface ReviewProps {
  invoice: Invoice;
  onUpdateInvoice: (updated: Invoice) => void;
  onNextInvoice?: () => void;
}

export const Review: React.FC<ReviewProps> = ({ invoice, onUpdateInvoice, onNextInvoice }) => {
  const [vendorName, setVendorName] = useState(invoice.vendor_name);
  const [invoiceNumber, setInvoiceNumber] = useState(invoice.invoice_number);
  const [invoiceDate, setInvoiceDate] = useState(invoice.invoice_date);
  const [totalAmount, setTotalAmount] = useState(invoice.total_amount);
  const [lineItems, setLineItems] = useState<LineItem[]>(invoice.line_items || []);
  const [isConfirmed, setIsConfirmed] = useState(invoice.status === 'Confirmed' || invoice.status === 'Paid');
  const [stampActive, setStampActive] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  const defaultSampleImg =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCK9V7XbaKZmkvmNjA12jj6n06StrEbwQii5nFS-dsIsUO8Wwg93e85cUhag3z4f7OxNe3pXXNCvBLLwvbfEVn5UXpeluczOR5fPZsKjMJGeeYU4a8VZ0o5NIFisyiupMOa-0_W7A4nUWex0iOcvGJNHl1CMLlSIPn1I03EVBkmeHvvn01h5Jrx8i8_B8hxd1skhRaTHAhAP2VyZkENdtVtwCDfAIj93_iFxcs4-kbnAze5bzJ0ukO4HMrq9iWxBhgoRvFBX0YCzO1i';

  const handleConfirm = () => {
    setIsConfirmed(true);
    setStampActive(true);

    const updated: Invoice = {
      ...invoice,
      vendor_name: vendorName,
      invoice_number: invoiceNumber,
      invoice_date: invoiceDate,
      total_amount: Number(totalAmount),
      line_items: lineItems,
      status: 'Confirmed',
      confirmed_at: new Date().toISOString(),
      low_confidence_fields: [],
    };

    onUpdateInvoice(updated);

    setTimeout(() => {
      setStampActive(false);
      if (onNextInvoice) onNextInvoice();
    }, 2000);
  };

  const handleLineItemChange = (id: string, field: keyof LineItem, val: any) => {
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: val };
          if (field === 'quantity' || field === 'unit_price') {
            updatedItem.line_total = Number(updatedItem.quantity || 0) * Number(updatedItem.unit_price || 0);
          }
          return updatedItem;
        }
        return item;
      })
    );
  };

  const hasLowConfidence = (invoice.low_confidence_fields || []).length > 0;

  return (
    <div className="flex flex-col lg:flex-row h-full min-h-[calc(100vh-80px)] bg-[#fcf9ed] border border-[#ddc0be] shadow-xs">
      {/* Left Panel: Document Source */}
      <section className="w-full lg:w-1/2 p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-[#ddc0be] bg-[#f7f4e7]">
        <div className="sticky top-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-headline-md text-headline-md text-[#1c1c15]">Document Source</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2))}
                className="p-2 hover:bg-[#ebe8dc] rounded transition-colors text-[#1c1c15] cursor-pointer"
                title="Zoom In"
              >
                <span className="material-symbols-outlined">zoom_in</span>
              </button>
              <button
                onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.75))}
                className="p-2 hover:bg-[#ebe8dc] rounded transition-colors text-[#1c1c15] cursor-pointer"
                title="Zoom Out"
              >
                <span className="material-symbols-outlined">zoom_out</span>
              </button>
            </div>
          </div>

          {/* Invoice Image Container */}
          <div className="relative w-full aspect-[3/4] bg-white border border-[#ddc0be] shadow-sm flex items-center justify-center overflow-hidden">
            <img
              src={invoice.preview_url || defaultSampleImg}
              alt="Invoice Document Source"
              style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.2s ease-out' }}
              className="w-full h-full object-contain"
            />

            {/* AI Confidence Highlight Box */}
            {hasLowConfidence && (
              <div className="absolute top-[42%] left-[62%] w-36 h-10 border-2 border-amber-500 bg-amber-500/10 pointer-events-none animate-pulse flex items-center justify-center">
                <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-1 py-0.5">
                  AI Review
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Right Panel: Ledger Entry Form */}
      <section className="w-full lg:w-1/2 p-6 lg:p-10 bg-[#fcf9ed] relative overflow-hidden">
        {/* Confirmed Stamp Overlay */}
        {stampActive && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 border-[8px] border-[#822426] px-8 py-4 pointer-events-none bg-white/90 shadow-2xl animate-in zoom-in duration-300">
            <span className="text-[#822426] font-headline-lg text-4xl lg:text-6xl uppercase tracking-widest font-extrabold select-none">
              Confirmed
            </span>
            <div className="mt-1 text-center font-label-md text-[#822426] text-xs">
              {new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()} - VERIFIED
            </div>
          </div>
        )}

        <div className="max-w-md mx-auto space-y-8">
          <header className="border-b border-[#1c1c15]/10 pb-4">
            <p className="font-label-md text-label-md text-[#8a7170] uppercase">Invoice Analysis</p>
            <h2 className="font-headline-md text-headline-md text-[#1c1c15] mt-1">Review Entry</h2>
          </header>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            {/* Header Form Grid */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-6">
              <div className="flex flex-col">
                <label className="font-label-md text-label-md text-[#8a7170] mb-1">Vendor</label>
                <input
                  type="text"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  className="bg-transparent font-body-md text-body-md ledger-line py-1 border-0 focus:ring-0 text-[#1c1c15]"
                />
              </div>

              <div className="flex flex-col">
                <label className="font-label-md text-label-md text-[#8a7170] mb-1">Invoice Number</label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="bg-transparent font-data-md text-data-md ledger-line py-1 border-0 focus:ring-0 text-[#1c1c15]"
                />
              </div>

              <div className="flex flex-col">
                <label className="font-label-md text-label-md text-[#8a7170] mb-1">Date</label>
                <input
                  type="text"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="bg-transparent font-body-md text-body-md ledger-line py-1 border-0 focus:ring-0 text-[#1c1c15]"
                />
              </div>

              {/* Total Amount field with low confidence highlight if flagged */}
              <div className="flex flex-col relative">
                <label className="font-label-md text-label-md text-amber-800 mb-1 flex items-center gap-1 font-bold">
                  Total Amount
                  {hasLowConfidence && <span className="material-symbols-outlined text-[14px]">warning</span>}
                </label>
                <div className="flex items-center">
                  <span className="font-data-lg text-amber-900 mr-1">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(Number(e.target.value))}
                    className={`bg-transparent font-data-lg text-data-lg ledger-line py-1 border-0 w-full focus:ring-0 ${
                      hasLowConfidence
                        ? 'border-b-2 border-amber-500 text-amber-900 font-bold bg-amber-50/50'
                        : 'text-[#1c1c15]'
                    }`}
                  />
                </div>
                {hasLowConfidence && (
                  <p className="text-[10px] text-amber-800 mt-1 font-medium">Double-check this value</p>
                )}
              </div>
            </div>

            {/* Line Items Table */}
            <div className="mt-8">
              <h3 className="font-label-md text-label-md text-[#8a7170] uppercase mb-3 tracking-widest">
                Line Items
              </h3>
              <div className="border border-[#ddc0be] bg-white p-1">
                <table className="w-full text-left">
                  <thead className="bg-[#f7f4e7] border-b border-[#ddc0be]">
                    <tr>
                      <th className="py-2 px-3 font-label-md text-label-md text-[#8a7170] uppercase">
                        Description
                      </th>
                      <th className="py-2 px-3 font-label-md text-label-md text-[#8a7170] uppercase text-right">
                        Qty
                      </th>
                      <th className="py-2 px-3 font-label-md text-label-md text-[#8a7170] uppercase text-right">
                        Price
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ddc0be]/40">
                    {lineItems.map((item) => (
                      <tr key={item.id} className={item.unsure ? 'bg-amber-50/80' : ''}>
                        <td className="py-3 px-3 font-body-md text-body-md text-[#1c1c15]">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleLineItemChange(item.id, 'description', e.target.value)}
                            className="w-full bg-transparent border-none focus:ring-0 text-xs text-[#1c1c15]"
                          />
                          {item.unsure && (
                            <span className="text-amber-800 ml-1 text-[9px] font-bold bg-amber-200 px-1">
                              UNSURE
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-data-md text-data-md text-right text-[#1c1c15]">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleLineItemChange(item.id, 'quantity', Number(e.target.value))}
                            className="w-12 text-right bg-transparent border-none focus:ring-0 text-xs"
                          />
                        </td>
                        <td className="py-3 px-3 font-data-md text-data-md text-right text-[#1c1c15]">
                          <input
                            type="number"
                            step="0.01"
                            value={item.unit_price}
                            onChange={(e) => handleLineItemChange(item.id, 'unit_price', Number(e.target.value))}
                            className="w-20 text-right bg-transparent border-none focus:ring-0 text-xs font-semibold"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-[#8a7170]">
                      <td colSpan={2} className="py-3 px-3 font-label-md text-label-md text-right uppercase">
                        Total USD
                      </td>
                      <td className="py-3 px-3 font-data-lg text-data-lg text-right font-bold text-[#822426]">
                        ${Number(totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-6">
              <button
                type="button"
                onClick={() => {
                  onUpdateInvoice({
                    ...invoice,
                    vendor_name: vendorName,
                    invoice_number: invoiceNumber,
                    invoice_date: invoiceDate,
                    total_amount: Number(totalAmount),
                    line_items: lineItems,
                  });
                  if (onNextInvoice) onNextInvoice();
                }}
                className="w-full sm:flex-1 py-3 px-6 border border-[#0c1b34] text-[#0c1b34] font-label-md text-label-md uppercase tracking-widest hover:bg-[#0c1b34]/5 transition-colors cursor-pointer"
              >
                Save and continue
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                className={`w-full sm:flex-1 py-3 px-6 font-label-md text-label-md uppercase tracking-widest transition-all shadow-sm cursor-pointer ${
                  isConfirmed
                    ? 'bg-[#204f36] text-white'
                    : 'bg-[#822426] text-white hover:bg-[#a23b3b]'
                }`}
              >
                {isConfirmed ? 'Confirmed' : 'Confirm'}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};
