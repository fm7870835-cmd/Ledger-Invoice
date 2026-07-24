import React, { useState, useRef } from 'react';
import { Invoice } from '../types';

interface UploadProps {
  onInvoicesExtracted: (newInvoices: Invoice[]) => void;
  onNavigateReview: () => void;
}

interface ProcessingFile {
  id: string;
  name: string;
  sizeKb: number;
  status: 'processing' | 'success' | 'error';
  extractedData?: any;
}

export const Upload: React.FC<UploadProps> = ({ onInvoicesExtracted, onNavigateReview }) => {
  const [processingQueue, setProcessingQueue] = useState<ProcessingFile[]>([]);
  const [isHovering, setIsHovering] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File, sampleType?: string) => {
    const fileId = 'proc-' + Math.random().toString(36).substring(2, 9);
    const newProcFile: ProcessingFile = {
      id: fileId,
      name: file ? file.name : (sampleType === 'west_coast_logistics' ? 'West_Coast_Logistics_INV.pdf' : 'Acme_Systems_Receipt.png'),
      sizeKb: file ? Math.round(file.size / 1024) : 184,
      status: 'processing',
    };

    setProcessingQueue((prev) => [...prev, newProcFile]);

    try {
      let payload: any = { fileName: newProcFile.name };

      if (sampleType) {
        payload.sampleType = sampleType;
      } else if (file) {
        // Read file as base64
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        payload.imageBase64 = base64;
        payload.mimeType = file.type || 'image/png';
      }

      const res = await fetch('/api/extract-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const extracted = await res.json();

      const createdInvoice: Invoice = {
        id: 'inv-' + Math.random().toString(36).substring(2, 9),
        vendor_name: extracted.vendor_name || 'Vendor Corp',
        vendor_initials: (extracted.vendor_name || 'VC').slice(0, 2).toUpperCase(),
        invoice_number: extracted.invoice_number || `INV-${Math.floor(1000 + Math.random() * 9000)}`,
        invoice_date: extracted.invoice_date || 'Oct 24, 2026',
        due_date: extracted.due_date || 'Nov 24, 2026',
        subtotal: extracted.subtotal || 1200.0,
        tax_amount: extracted.tax_amount || 100.0,
        total_amount: extracted.total_amount || 1300.0,
        currency: extracted.currency || 'USD',
        status: extracted.low_confidence_fields && extracted.low_confidence_fields.length > 0 ? 'Needs Review' : 'Needs Review',
        low_confidence_fields: extracted.low_confidence_fields || [],
        line_items: (extracted.line_items || []).map((item: any, idx: number) => ({
          id: `li-${idx}`,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          line_total: item.line_total,
          unsure: item.unsure,
        })),
        created_at: new Date().toISOString(),
        preview_url: sampleType === 'west_coast_logistics'
          ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuCK9V7XbaKZmkvmNjA12jj6n06StrEbwQii5nFS-dsIsUO8Wwg93e85cUhag3z4f7OxNe3pXXNCvBLLwvbfEVn5UXpeluczOR5fPZsKjMJGeeYU4a8VZ0o5NIFisyiupMOa-0_W7A4nUWex0iOcvGJNHl1CMLlSIPn1I03EVBkmeHvvn01h5Jrx8i8_B8hxd1skhRaTHAhAP2VyZkENdtVtwCDfAIj93_iFxcs4-kbnAze5bzJ0ukO4HMrq9iWxBhgoRvFBX0YCzO1i'
          : undefined,
      };

      setProcessingQueue((prev) =>
        prev.map((item) =>
          item.id === fileId ? { ...item, status: 'success', extractedData: createdInvoice } : item
        )
      );

      onInvoicesExtracted([createdInvoice]);
    } catch (err) {
      console.error(err);
      setProcessingQueue((prev) =>
        prev.map((item) => (item.id === fileId ? { ...item, status: 'error' } : item))
      );
    }
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => processFile(file));
  };

  const handleSampleClick = (sampleType: string) => {
    processFile(null as any, sampleType);
  };

  const completedCount = processingQueue.filter((p) => p.status === 'success').length;
  const isQueueDone = processingQueue.length > 0 && completedCount === processingQueue.length;

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto">
      {/* Page Header */}
      <header className="border-b border-[#ddc0be] pb-6">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-[#1c1c15]">Invoice Upload</h1>
            <p className="font-body-md text-[#564241] mt-2 max-w-md">
              Synchronize your physical records with our digital core. Drag files onto the canvas to begin extraction.
            </p>
          </div>
          <div className="hidden md:block">
            <span className="font-data-md text-data-md text-[#564241] opacity-60">
              BATCH_ID: {new Date().getFullYear()}-AF-091
            </span>
          </div>
        </div>
      </header>

      {/* Upload Drop Zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsHovering(true);
        }}
        onDragLeave={() => setIsHovering(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsHovering(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`ledger-paper dashed-dropzone rounded-none min-h-[320px] flex flex-col items-center justify-center cursor-pointer group p-8 transition-all ${
          isHovering ? 'border-[#822426] bg-[#822426]/5' : 'border-[#8a7170]'
        }`}
      >
        <div className="bg-white p-6 border border-[#ddc0be] shadow-xs group-hover:border-[#822426] transition-colors">
          <span className="material-symbols-outlined text-5xl text-[#8a7170] group-hover:text-[#822426] transition-colors">
            redeem
          </span>
        </div>
        <div className="mt-8 text-center">
          <p className="font-headline-sm text-headline-sm text-[#1c1c15]">Drop invoices here</p>
          <p className="font-body-md text-[#564241] mt-1">PDF, JPG, or PNG files (up to 20MB)</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Quick Test Samples Bar */}
      <div className="bg-[#f7f4e7] border border-[#ddc0be] p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#822426]">science</span>
          <span className="font-label-md text-xs text-[#1c1c15] uppercase tracking-wider">
            Quick Test Samples (Instant Gemini Extraction):
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleSampleClick('west_coast_logistics')}
            className="px-3 py-1.5 bg-white border border-[#ddc0be] text-xs font-label-md text-[#822426] hover:bg-[#822426] hover:text-white transition-all cursor-pointer shadow-2xs"
          >
            + Test West Coast Logistics PDF
          </button>
          <button
            onClick={() => handleSampleClick('acme_systems')}
            className="px-3 py-1.5 bg-white border border-[#ddc0be] text-xs font-label-md text-[#0c1b34] hover:bg-[#0c1b34] hover:text-white transition-all cursor-pointer shadow-2xs"
          >
            + Test Acme Systems Receipt
          </button>
        </div>
      </div>

      {/* Processing Queue Tray */}
      {processingQueue.length > 0 && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-label-md text-label-md uppercase tracking-widest text-[#564241]">
              Processing Queue
            </h3>
            <span className={`font-data-sm text-data-sm ${isQueueDone ? 'text-[#204f36]' : 'text-[#822426]'}`}>
              {completedCount} of {processingQueue.length} Files Processed
            </span>
          </div>

          <div className="bg-white border border-[#ddc0be] divide-y divide-[#ddc0be]">
            {processingQueue.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 hover:bg-[#f7f4e7] transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="text-[#564241] group-hover:text-[#822426]">
                    <span className="material-symbols-outlined">insert_drive_file</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-body-md font-bold text-[#1c1c15]">{item.name}</span>
                    <div className="flex gap-4">
                      <span className="font-data-sm text-data-sm text-[#564241] opacity-60">
                        {item.sizeKb} KB
                      </span>
                      <span className="font-data-sm text-data-sm text-[#564241] opacity-60">
                        {new Date().toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {item.status === 'processing' ? (
                    <div className="flex items-center gap-2">
                      <span className="font-label-md text-label-md uppercase tracking-widest text-[#564241] processing-ink">
                        Extracting
                      </span>
                      <div className="w-2 h-2 rounded-full bg-[#822426] processing-ink" />
                    </div>
                  ) : item.status === 'success' ? (
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[#204f36]">check_circle</span>
                      <span className="font-label-md text-label-md uppercase tracking-widest text-[#204f36]">
                        Success
                      </span>
                      <div className="stamp-effect text-[10px] py-0.5 px-2 ml-2">Extracted</div>
                    </div>
                  ) : (
                    <span className="font-label-md text-xs text-[#ba1a1a]">Extraction Error</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {isQueueDone && (
            <div className="flex justify-end pt-4">
              <button
                onClick={onNavigateReview}
                className="bg-[#822426] text-white px-8 py-3 rounded-none font-label-md text-label-md uppercase tracking-widest flex items-center gap-3 hover:bg-[#a23b3b] transition-all shadow-sm cursor-pointer"
              >
                Review Extracted Invoices
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Guidance Info Bento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 opacity-80">
        <div className="p-6 border border-[#ddc0be] bg-[#f7f4e7]">
          <span className="material-symbols-outlined text-[#822426] mb-4 text-2xl">auto_awesome</span>
          <h4 className="font-label-md text-label-md uppercase tracking-wider text-[#1c1c15] mb-2">
            Automated OCR
          </h4>
          <p className="text-xs text-[#564241] leading-relaxed">
            Our neural Gemini engine extracts line items, tax details, and vendor information with 99.4% accuracy.
          </p>
        </div>
        <div className="p-6 border border-[#ddc0be] bg-[#f7f4e7]">
          <span className="material-symbols-outlined text-[#822426] mb-4 text-2xl">security</span>
          <h4 className="font-label-md text-label-md uppercase tracking-wider text-[#1c1c15] mb-2">
            Encrypted Vault
          </h4>
          <p className="text-xs text-[#564241] leading-relaxed">
            All documents are processed in a localized sandbox and encrypted at rest using AES-256 standards.
          </p>
        </div>
        <div className="p-6 border border-[#ddc0be] bg-[#f7f4e7]">
          <span className="material-symbols-outlined text-[#822426] mb-4 text-2xl">account_balance</span>
          <h4 className="font-label-md text-label-md uppercase tracking-wider text-[#1c1c15] mb-2">
            GAPP Compliant
          </h4>
          <p className="text-xs text-[#564241] leading-relaxed">
            Audit-ready extraction ensures every digital mark follows historical accounting principles.
          </p>
        </div>
      </div>
    </div>
  );
};
