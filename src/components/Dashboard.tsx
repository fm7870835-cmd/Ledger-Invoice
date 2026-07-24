import React, { useState, useMemo } from 'react';
import { Invoice, InvoiceStatus } from '../types';

interface DashboardProps {
  invoices: Invoice[];
  onNavigateCreate: () => void;
  onNavigateUpload: () => void;
  onSelectInvoice: (invoice: Invoice) => void;
  onOpenExport: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  invoices,
  onNavigateCreate,
  onNavigateUpload,
  onSelectInvoice,
  onOpenExport,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [stampActive, setStampActive] = useState(false);

  // Compute summary stats
  const totalThisMonth = useMemo(() => {
    return invoices.reduce((sum, inv) => sum + inv.total_amount, 0);
  }, [invoices]);

  const needsReviewCount = useMemo(() => {
    return invoices.filter((i) => i.status === 'Needs Review').length;
  }, [invoices]);

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesSearch =
        inv.vendor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        selectedStatusFilter === 'All' || inv.status === selectedStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchQuery, selectedStatusFilter]);

  const handleRowClick = (inv: Invoice) => {
    // Show signature stamp micro-interaction
    setStampActive(true);
    setTimeout(() => setStampActive(false), 1800);
    onSelectInvoice(inv);
  };

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case 'Paid':
        return 'bg-[#e6f4ea] text-[#1e4620]';
      case 'Confirmed':
      case 'Exported':
        return 'bg-[#e6f4ea] text-[#1e4620]';
      case 'Overdue':
        return 'bg-[#ffdad6] text-[#93000a]';
      case 'Needs Review':
        return 'bg-[#fff4e5] text-[#822426] border border-[#a23b3b]/30 font-bold';
      case 'Pending':
      default:
        return 'bg-[#fff4e5] text-[#663d00]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-[#1c1c15]">Your invoices</h1>
          <p className="font-body-md text-[#564241]">Review and manage your pending documentation.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onNavigateCreate}
            className="bg-[#822426] text-white px-6 py-3 font-label-md text-label-md shadow-sm hover:bg-[#a23b3b] transition-colors inline-flex items-center gap-2 cursor-pointer uppercase tracking-wider"
          >
            <span className="material-symbols-outlined text-[18px]">add_notes</span>
            CREATE INVOICE
          </button>
          <button
            onClick={onNavigateUpload}
            className="bg-[#0c1b34] text-white px-5 py-3 font-label-md text-label-md shadow-sm hover:bg-[#1a2e4c] transition-colors inline-flex items-center gap-2 cursor-pointer uppercase tracking-wider"
          >
            <span className="material-symbols-outlined text-[18px]">upload_file</span>
            UPLOAD FILE
          </button>
        </div>
      </div>

      {/* Summary Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Card */}
        <div className="bg-white border border-[#ddc0be] p-6 flex flex-col justify-between shadow-xs">
          <span className="font-label-md text-[#564241] uppercase tracking-widest text-[10px]">
            Total this month
          </span>
          <div className="mt-4">
            <span className="font-data-lg text-3xl font-bold text-[#822426]">
              ${totalThisMonth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <div className="flex items-center gap-1 mt-1 text-[#204f36]">
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              <span className="text-[12px] font-medium">+12.5% from June</span>
            </div>
          </div>
        </div>

        {/* Processed Card */}
        <div className="bg-white border border-[#ddc0be] p-6 flex flex-col justify-between shadow-xs">
          <span className="font-label-md text-[#564241] uppercase tracking-widest text-[10px]">
            Invoices processed
          </span>
          <div className="mt-4">
            <span className="font-data-lg text-3xl font-bold text-[#1c1c15]">1,204</span>
            <p className="text-[12px] text-[#564241] mt-1">98.2% automated success rate</p>
          </div>
        </div>

        {/* Review Card */}
        <div className="bg-[#ebe8dc] border-2 border-[#a23b3b] p-6 flex flex-col justify-between relative overflow-hidden shadow-xs">
          <div className="relative z-10">
            <span className="font-label-md text-[#564241] uppercase tracking-widest text-[10px]">
              Needs review
            </span>
            <div className="mt-4">
              <span className="font-data-lg text-3xl font-bold text-[#822426]">{needsReviewCount}</span>
              <p className="text-[12px] text-[#564241] mt-1">Requires manual verification</p>
            </div>
          </div>
          <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-8xl text-[#822426]/10 select-none">
            warning
          </span>
        </div>
      </div>

      {/* Controls (Search, Filter, Export) */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#564241] group-focus-within:text-[#822426]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by vendor or invoice number..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-[#ddc0be] focus:border-[#822426] focus:ring-0 rounded-none font-body-md placeholder:text-[#8a7170] outline-none"
          />
        </div>

        <div className="flex gap-2 relative">
          {/* Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="bg-white border border-[#ddc0be] px-4 py-3 font-label-md text-label-md inline-flex items-center gap-2 hover:bg-[#f1eee2] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">filter_list</span>
              FILTER {selectedStatusFilter !== 'All' ? `(${selectedStatusFilter})` : ''}
            </button>

            {showFilterMenu && (
              <div className="absolute right-0 mt-1 w-48 bg-white border border-[#ddc0be] shadow-lg z-30 py-1">
                {['All', 'Needs Review', 'Confirmed', 'Paid', 'Pending', 'Overdue', 'Exported'].map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setSelectedStatusFilter(status);
                      setShowFilterMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 font-body-md text-xs hover:bg-[#f7f4e7] cursor-pointer ${
                      selectedStatusFilter === status ? 'font-bold text-[#822426] bg-[#f1eee2]' : 'text-[#1c1c15]'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={onOpenExport}
            className="bg-white border border-[#ddc0be] px-4 py-3 font-label-md text-label-md inline-flex items-center gap-2 hover:bg-[#f1eee2] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            EXPORT
          </button>
        </div>
      </div>

      {/* Invoice Table or Empty State */}
      {filteredInvoices.length > 0 ? (
        <div className="bg-white border border-[#ddc0be] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead className="bg-[#f1eee2] border-b border-[#ddc0be]">
                <tr>
                  <th className="px-6 py-4 font-label-md text-[#564241] uppercase tracking-widest text-[10px]">
                    Vendor
                  </th>
                  <th className="px-6 py-4 font-label-md text-[#564241] uppercase tracking-widest text-[10px]">
                    Invoice #
                  </th>
                  <th className="px-6 py-4 font-label-md text-[#564241] uppercase tracking-widest text-[10px]">
                    Date
                  </th>
                  <th className="px-6 py-4 font-label-md text-[#564241] uppercase tracking-widest text-[10px]">
                    Due Date
                  </th>
                  <th className="px-6 py-4 text-right font-label-md text-[#564241] uppercase tracking-widest text-[10px]">
                    Amount
                  </th>
                  <th className="px-6 py-4 font-label-md text-[#564241] uppercase tracking-widest text-[10px]">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ddc0be]">
                {filteredInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => handleRowClick(inv)}
                    className="hover:bg-[#f7f4e7] transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#f1eee2] flex items-center justify-center font-bold text-xs text-[#1c1c15]">
                          {inv.vendor_initials || inv.vendor_name.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-body-md font-semibold text-[#1c1c15] group-hover:text-[#822426]">
                          {inv.vendor_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 font-data-md text-[#564241]">{inv.invoice_number}</td>
                    <td className="px-6 py-5 font-data-md text-[#564241]">{inv.invoice_date}</td>
                    <td className={`px-6 py-5 font-data-md ${inv.status === 'Overdue' ? 'text-[#ba1a1a] font-semibold' : 'text-[#564241]'}`}>
                      {inv.due_date}
                    </td>
                    <td className="px-6 py-5 text-right font-data-md font-semibold text-[#1c1c15]">
                      ${inv.total_amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-2 py-0.5 rounded-[2px] text-[10px] font-bold uppercase ${getStatusBadge(inv.status)}`}>
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-[#f1eee2] border-t border-[#ddc0be] flex justify-between items-center">
            <span className="text-[12px] text-[#564241] font-data-md">
              Showing {filteredInvoices.length} of {invoices.length} results
            </span>
            <div className="flex gap-2">
              <button className="p-1 hover:bg-white transition-colors border border-[#ddc0be] opacity-50 cursor-not-allowed">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button className="p-1 hover:bg-white transition-colors border border-[#ddc0be]">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20 px-8 border border-dashed border-[#ddc0be] bg-white text-center space-y-4">
          <div className="w-40 h-40 relative flex items-center justify-center bg-[#f7f4e7] rounded-full border border-[#ddc0be]">
            <span className="material-symbols-outlined text-6xl text-[#822426]">history_edu</span>
          </div>
          <h3 className="font-headline-sm text-headline-sm text-[#1c1c15]">No invoices found</h3>
          <p className="font-body-md text-[#564241] max-w-sm">
            It seems no documents match your criteria. Upload a new invoice or adjust your search filter.
          </p>
          <button
            onClick={onNavigateUpload}
            className="mt-4 border-2 border-[#822426] text-[#822426] px-8 py-3 font-label-md text-label-md hover:bg-[#822426]/10 transition-all uppercase tracking-widest cursor-pointer"
          >
            Upload Your First Invoice
          </button>
        </div>
      )}

      {/* Signature Tactile Stamp Micro-interaction Toast */}
      {stampActive && (
        <div className="fixed bottom-8 right-8 z-50 pointer-events-none transition-all duration-300 animate-bounce">
          <div className="stamp-effect shadow-lg bg-white">
            Opening Ledger Entry...
          </div>
        </div>
      )}
    </div>
  );
};
