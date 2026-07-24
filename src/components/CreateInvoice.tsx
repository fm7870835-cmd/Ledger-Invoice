import React, { useState } from 'react';
import { Invoice, UserProfile, LineItem } from '../types';

interface CreateInvoiceProps {
  user: UserProfile;
  onInvoiceCreated: (newInvoice: Invoice) => void;
  onNavigateSettings: () => void;
  onNavigateDashboard: () => void;
}

export const CreateInvoice: React.FC<CreateInvoiceProps> = ({
  user,
  onInvoiceCreated,
  onNavigateSettings,
  onNavigateDashboard,
}) => {
  // Step 1: Form State
  const [customerName, setCustomerName] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState(
    `INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`
  );
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  );
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 14 * 86400000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  );

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', description: 'Item 1 / Service', quantity: 1, unit_price: 150.0, line_total: 150.0 },
  ]);

  const [taxRatePercent, setTaxRatePercent] = useState<number>(8);
  const [generatedInvoice, setGeneratedInvoice] = useState<Invoice | null>(null);
  const [stampActive, setStampActive] = useState(false);

  // Calculations
  const subtotal = lineItems.reduce((sum, item) => sum + (item.line_total || 0), 0);
  const taxAmount = (subtotal * taxRatePercent) / 100;
  const totalAmount = subtotal + taxAmount;

  // Handlers
  const handleAddItem = () => {
    const newItem: LineItem = {
      id: String(Date.now()),
      description: '',
      quantity: 1,
      unit_price: 0,
      line_total: 0,
    };
    setLineItems([...lineItems, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    if (lineItems.length === 1) return;
    setLineItems(lineItems.filter((i) => i.id !== id));
  };

  const handleItemChange = (id: string, field: keyof LineItem, val: any) => {
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: val };
          if (field === 'quantity' || field === 'unit_price') {
            updated.line_total = Number(updated.quantity || 0) * Number(updated.unit_price || 0);
          }
          return updated;
        }
        return item;
      })
    );
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();

    const newInv: Invoice = {
      id: 'inv-' + Math.random().toString(36).substring(2, 9),
      vendor_name: user.shop_name || 'My Shop',
      vendor_initials: (user.shop_name || 'MS').slice(0, 2).toUpperCase(),
      customer_name: customerName || 'Valued Customer',
      shop_logo: user.shop_logo,
      invoice_number: invoiceNumber,
      invoice_date: invoiceDate,
      due_date: dueDate,
      subtotal,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      currency: 'USD',
      status: 'Confirmed',
      line_items: lineItems,
      created_at: new Date().toISOString(),
      confirmed_at: new Date().toISOString(),
    };

    setGeneratedInvoice(newInv);
    setStampActive(true);
    onInvoiceCreated(newInv);

    setTimeout(() => {
      setStampActive(false);
    }, 1800);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-[#f7f4e7] border-2 border-[#822426] p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#822426] text-white flex items-center justify-center font-bold text-2xl">
            1
          </div>
          <div>
            <h1 className="font-headline-md text-2xl text-[#1c1c15]">Create New Invoice</h1>
            <p className="font-body-md text-xs text-[#564241]">
              Fill in customer details, add line items, then click <strong>Generate</strong>.
            </p>
          </div>
        </div>

        {/* Shop Logo Active Indicator */}
        <div className="flex items-center gap-3 bg-white p-2 border border-[#ddc0be]">
          {user.shop_logo ? (
            <img src={user.shop_logo} alt="Shop Logo" className="w-10 h-10 object-contain" />
          ) : (
            <div className="w-10 h-10 bg-[#ebe8dc] flex items-center justify-center text-xs font-bold text-[#822426]">
              LOGO
            </div>
          )}
          <div className="text-left">
            <span className="font-label-md text-[10px] text-[#8a7170] block uppercase">Active Shop Branding</span>
            <span className="font-body-md font-bold text-xs text-[#1c1c15]">
              {user.shop_name || 'My Shop'}
            </span>
            <button
              onClick={onNavigateSettings}
              className="text-[10px] text-[#822426] font-bold underline block hover:text-[#a23b3b]"
            >
              Change Logo in Settings
            </button>
          </div>
        </div>
      </div>

      {/* GENERATED INVOICE PREVIEW DISPLAY */}
      {generatedInvoice ? (
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-[#e6f4ea] border border-[#bbeecc] p-4 flex items-center justify-between">
            <div className="flex items-center gap-3 text-[#1e4620]">
              <span className="material-symbols-outlined text-2xl">check_circle</span>
              <span className="font-headline-sm text-base">Invoice Generated Successfully!</span>
            </div>
            <button
              onClick={() => setGeneratedInvoice(null)}
              className="text-xs font-label-md uppercase text-[#204f36] underline hover:text-[#000]"
            >
              Create Another Invoice
            </button>
          </div>

          {/* Paper Document Preview */}
          <div className="bg-white border border-[#ddc0be] p-8 md:p-12 shadow-md relative overflow-hidden">
            {/* Confirmed Stamp Overlay */}
            {stampActive && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 border-[6px] border-[#822426] px-8 py-3 bg-white/95 shadow-2xl animate-bounce">
                <span className="text-[#822426] font-headline-lg text-3xl md:text-5xl uppercase tracking-widest font-extrabold select-none">
                  GENERATED
                </span>
              </div>
            )}

            {/* Document Header with Shop Logo */}
            <div className="flex justify-between items-start border-b border-[#ddc0be] pb-6 mb-8">
              <div className="flex items-center gap-4">
                {user.shop_logo ? (
                  <img src={user.shop_logo} alt={user.shop_name} className="w-16 h-16 object-contain" />
                ) : (
                  <div className="w-16 h-16 bg-[#822426] text-white font-bold flex items-center justify-center text-xl">
                    {(user.shop_name || 'S').slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <h2 className="font-headline-md text-2xl text-[#1c1c15]">{user.shop_name || 'My Shop'}</h2>
                  <p className="font-body-md text-xs text-[#564241]">{user.shop_address || 'Main Street Store'}</p>
                  <p className="font-data-sm text-xs text-[#564241]">{user.shop_phone}</p>
                </div>
              </div>

              <div className="text-right">
                <span className="stamp-effect text-xs mb-2">INVOICE</span>
                <p className="font-data-lg font-bold text-lg text-[#1c1c15]">{generatedInvoice.invoice_number}</p>
                <p className="font-data-md text-xs text-[#564241]">Date: {generatedInvoice.invoice_date}</p>
                <p className="font-data-md text-xs text-[#564241]">Due Date: {generatedInvoice.due_date}</p>
              </div>
            </div>

            {/* Billed To Customer */}
            <div className="mb-8 p-4 bg-[#f7f4e7] border border-[#ddc0be]">
              <span className="font-label-md text-[10px] text-[#8a7170] uppercase block">Billed To Customer</span>
              <h3 className="font-headline-sm text-lg text-[#1c1c15] mt-1">{generatedInvoice.customer_name}</h3>
            </div>

            {/* Line Items Table */}
            <table className="w-full border-collapse mb-8 text-left">
              <thead>
                <tr className="bg-[#f1eee2] border-b border-[#ddc0be]">
                  <th className="p-3 font-label-md text-xs text-[#564241] uppercase">Item Description</th>
                  <th className="p-3 font-label-md text-xs text-[#564241] uppercase text-right">Qty</th>
                  <th className="p-3 font-label-md text-xs text-[#564241] uppercase text-right">Unit Price</th>
                  <th className="p-3 font-label-md text-xs text-[#564241] uppercase text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ddc0be]/50">
                {generatedInvoice.line_items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="p-3 font-body-md text-sm text-[#1c1c15]">{item.description || 'Standard Item'}</td>
                    <td className="p-3 font-data-md text-sm text-right text-[#1c1c15]">{item.quantity}</td>
                    <td className="p-3 font-data-md text-sm text-right text-[#1c1c15]">
                      ${item.unit_price.toFixed(2)}
                    </td>
                    <td className="p-3 font-data-md text-sm text-right font-semibold text-[#1c1c15]">
                      ${item.line_total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-[#1c1c15]">
                  <td colSpan={3} className="p-3 font-label-md text-sm text-right uppercase">Subtotal</td>
                  <td className="p-3 font-data-md text-sm text-right font-semibold">${generatedInvoice.subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="p-3 font-label-md text-sm text-right uppercase">Tax ({taxRatePercent}%)</td>
                  <td className="p-3 font-data-md text-sm text-right font-semibold">${generatedInvoice.tax_amount.toFixed(2)}</td>
                </tr>
                <tr className="bg-[#f7f4e7] border-t-2 border-[#822426]">
                  <td colSpan={3} className="p-3 font-label-md text-base text-right font-bold uppercase text-[#822426]">
                    Total Amount Due
                  </td>
                  <td className="p-3 font-data-lg text-xl text-right font-bold text-[#822426]">
                    ${generatedInvoice.total_amount.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-[#ddc0be]">
              <button
                onClick={() => window.print()}
                className="px-6 py-3 bg-[#0c1b34] text-white font-label-md text-xs uppercase tracking-wider hover:bg-[#1a2e4c] transition-colors cursor-pointer inline-flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">print</span>
                Print / Download PDF
              </button>

              <div className="flex gap-3">
                <button
                  onClick={onNavigateDashboard}
                  className="px-6 py-3 border border-[#822426] text-[#822426] font-label-md text-xs uppercase hover:bg-[#822426]/5 transition-colors cursor-pointer"
                >
                  View in Ledger
                </button>
                <button
                  onClick={() => setGeneratedInvoice(null)}
                  className="px-6 py-3 bg-[#822426] text-white font-label-md text-xs uppercase hover:bg-[#a23b3b] transition-colors cursor-pointer"
                >
                  + Create Another
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* STEP 1: CREATE FORM */
        <form onSubmit={handleGenerate} className="bg-white border border-[#ddc0be] p-6 md:p-8 space-y-6 shadow-sm">
          <div className="border-b border-[#ddc0be] pb-4">
            <h2 className="font-headline-sm text-xl text-[#1c1c15]">Enter Invoice Details</h2>
            <p className="font-body-md text-xs text-[#564241] mt-1">
              Provide the customer name and line items below. Your shop logo (<strong>{user.shop_name}</strong>) will be attached automatically.
            </p>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="font-label-md text-xs text-[#8a7170] uppercase block mb-1">
                Customer / Client Name *
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Acme Services Ltd. or Sarah Smith"
                className="w-full p-3 bg-[#f7f4e7] border border-[#ddc0be] focus:border-[#822426] focus:outline-none font-body-md text-sm text-[#1c1c15]"
              />
            </div>

            <div>
              <label className="font-label-md text-xs text-[#8a7170] uppercase block mb-1">
                Invoice Number
              </label>
              <input
                type="text"
                required
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full p-3 bg-[#f7f4e7] border border-[#ddc0be] focus:border-[#822426] focus:outline-none font-data-md text-sm text-[#1c1c15]"
              />
            </div>

            <div>
              <label className="font-label-md text-xs text-[#8a7170] uppercase block mb-1">
                Invoice Date
              </label>
              <input
                type="text"
                required
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full p-3 bg-[#f7f4e7] border border-[#ddc0be] focus:border-[#822426] focus:outline-none font-body-md text-sm text-[#1c1c15]"
              />
            </div>

            <div>
              <label className="font-label-md text-xs text-[#8a7170] uppercase block mb-1">
                Due Date
              </label>
              <input
                type="text"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full p-3 bg-[#f7f4e7] border border-[#ddc0be] focus:border-[#822426] focus:outline-none font-body-md text-sm text-[#1c1c15]"
              />
            </div>
          </div>

          {/* Line Items Section */}
          <div className="pt-4 border-t border-[#ddc0be]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-label-md text-xs text-[#1c1c15] uppercase tracking-wider font-bold">
                Items / Services
              </h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-3 py-1.5 bg-[#f1eee2] border border-[#ddc0be] text-xs font-label-md text-[#822426] hover:bg-[#822426] hover:text-white transition-all cursor-pointer inline-flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-xs">add</span>
                Add Item
              </button>
            </div>

            <div className="space-y-3">
              {lineItems.map((item, index) => (
                <div key={item.id} className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-[#f7f4e7] border border-[#ddc0be]">
                  <div className="flex-1 w-full">
                    <label className="text-[10px] font-label-md text-[#8a7170] block uppercase sm:hidden">
                      Description
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={`Item ${index + 1} description`}
                      value={item.description}
                      onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                      className="w-full p-2 bg-white border border-[#ddc0be] text-xs font-body-md text-[#1c1c15]"
                    />
                  </div>

                  <div className="w-full sm:w-24">
                    <label className="text-[10px] font-label-md text-[#8a7170] block uppercase sm:hidden">
                      Qty
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={item.quantity}
                      onChange={(e) => handleItemChange(item.id, 'quantity', Number(e.target.value))}
                      className="w-full p-2 bg-white border border-[#ddc0be] text-xs font-data-md text-center text-[#1c1c15]"
                    />
                  </div>

                  <div className="w-full sm:w-32">
                    <label className="text-[10px] font-label-md text-[#8a7170] block uppercase sm:hidden">
                      Unit Price ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={item.unit_price}
                      onChange={(e) => handleItemChange(item.id, 'unit_price', Number(e.target.value))}
                      className="w-full p-2 bg-white border border-[#ddc0be] text-xs font-data-md text-right text-[#1c1c15]"
                    />
                  </div>

                  <div className="w-full sm:w-32 text-right">
                    <span className="text-[10px] font-label-md text-[#8a7170] block uppercase sm:hidden">
                      Total
                    </span>
                    <span className="font-data-md font-bold text-sm text-[#822426]">
                      ${(item.line_total || 0).toFixed(2)}
                    </span>
                  </div>

                  {lineItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1 text-[#ba1a1a] hover:bg-red-50 rounded cursor-pointer"
                      title="Remove Item"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Totals Summary Card */}
          <div className="p-4 bg-[#f1eee2] border border-[#ddc0be] space-y-2 max-w-xs ml-auto">
            <div className="flex justify-between text-xs font-body-md">
              <span className="text-[#564241]">Subtotal:</span>
              <span className="font-data-md font-bold">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-xs font-body-md">
              <span className="text-[#564241]">Tax Rate:</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={taxRatePercent}
                  onChange={(e) => setTaxRatePercent(Number(e.target.value))}
                  className="w-12 p-1 text-right bg-white border border-[#ddc0be] text-xs font-data-md"
                />
                <span>%</span>
              </div>
            </div>
            <div className="flex justify-between text-sm font-label-md font-bold text-[#822426] pt-2 border-t border-[#ddc0be]">
              <span>TOTAL DUE:</span>
              <span className="font-data-lg">${totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Big GENERATE INVOICE Button */}
          <div className="pt-4 border-t border-[#ddc0be]">
            <button
              type="submit"
              className="w-full py-4 bg-[#822426] text-white font-label-md text-base uppercase tracking-widest hover:bg-[#a23b3b] transition-all shadow-md cursor-pointer flex items-center justify-center gap-3"
            >
              <span className="material-symbols-outlined text-2xl">receipt_long</span>
              GENERATE INVOICE NOW
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
