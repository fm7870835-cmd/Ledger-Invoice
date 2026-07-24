import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { CreateInvoice } from './components/CreateInvoice';
import { Upload } from './components/Upload';
import { Review } from './components/Review';
import { Settings } from './components/Settings';
import { ExportModal } from './components/ExportModal';
import { UpgradeModal } from './components/UpgradeModal';
import { SAMPLE_INVOICES, INITIAL_USER_PROFILE } from './data/initialInvoices';
import { Invoice, UserProfile, PlanTier } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'create' | 'upload' | 'invoices' | 'settings'>(
    'dashboard'
  );
  const [invoices, setInvoices] = useState<Invoice[]>(SAMPLE_INVOICES);
  const [user, setUser] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(
    SAMPLE_INVOICES.find((i) => i.status === 'Needs Review') || SAMPLE_INVOICES[0]
  );
  const [isReviewing, setIsReviewing] = useState(false);

  // Modals
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);

  // Handlers
  const handleInvoiceCreated = (newInvoice: Invoice) => {
    setInvoices((prev) => [newInvoice, ...prev]);
    setUser((prev) => ({
      ...prev,
      invoices_processed_this_month: prev.invoices_processed_this_month + 1,
    }));
  };

  const handleInvoicesExtracted = (newInvoices: Invoice[]) => {
    setInvoices((prev) => [...newInvoices, ...prev]);
    if (newInvoices.length > 0) {
      setSelectedInvoice(newInvoices[0]);
    }
  };

  const handleUpdateInvoice = (updated: Invoice) => {
    setInvoices((prev) => prev.map((inv) => (inv.id === updated.id ? updated : inv)));
    setSelectedInvoice(updated);
  };

  const handleNextInvoice = () => {
    const unconfirmed = invoices.find((i) => i.id !== selectedInvoice?.id && i.status === 'Needs Review');
    if (unconfirmed) {
      setSelectedInvoice(unconfirmed);
    } else {
      setIsReviewing(false);
      setActiveTab('dashboard');
    }
  };

  const handleSelectInvoiceFromTable = (inv: Invoice) => {
    setSelectedInvoice(inv);
    setIsReviewing(true);
  };

  const handleSelectPlan = (plan: PlanTier, limit: number) => {
    setUser((prev) => ({
      ...prev,
      plan,
      monthly_limit: limit,
    }));
  };

  return (
    <div className="min-h-screen bg-[#fcf9ed] text-[#1c1c15] font-body-md flex flex-col lg:flex-row">
      {/* Sidebar Navigation (The Spine) */}
      <Sidebar
        activeTab={isReviewing ? 'invoices' : activeTab}
        setActiveTab={(tab) => {
          setIsReviewing(false);
          setActiveTab(tab);
        }}
        user={user}
        onOpenUpgrade={() => setIsUpgradeOpen(true)}
      />

      {/* Main Content Area (The Page) */}
      <main className="flex-1 overflow-y-auto lg:pl-[280px] pt-16 lg:pt-0">
        <div className="p-4 md:p-8 lg:p-10 min-h-screen">
          {isReviewing && selectedInvoice ? (
            <div className="space-y-4">
              <button
                onClick={() => setIsReviewing(false)}
                className="inline-flex items-center gap-2 font-label-md text-xs text-[#564241] hover:text-[#822426] cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Back to Invoices
              </button>
              <Review
                invoice={selectedInvoice}
                onUpdateInvoice={handleUpdateInvoice}
                onNextInvoice={handleNextInvoice}
              />
            </div>
          ) : activeTab === 'dashboard' ? (
            <Dashboard
              invoices={invoices}
              onNavigateCreate={() => {
                setIsReviewing(false);
                setActiveTab('create');
              }}
              onNavigateUpload={() => {
                setIsReviewing(false);
                setActiveTab('upload');
              }}
              onSelectInvoice={handleSelectInvoiceFromTable}
              onOpenExport={() => setIsExportOpen(true)}
            />
          ) : activeTab === 'create' ? (
            <CreateInvoice
              user={user}
              onInvoiceCreated={handleInvoiceCreated}
              onNavigateSettings={() => {
                setIsReviewing(false);
                setActiveTab('settings');
              }}
              onNavigateDashboard={() => {
                setIsReviewing(false);
                setActiveTab('dashboard');
              }}
            />
          ) : activeTab === 'upload' ? (
            <Upload
              onInvoicesExtracted={handleInvoicesExtracted}
              onNavigateReview={() => setIsReviewing(true)}
            />
          ) : activeTab === 'invoices' ? (
            <Dashboard
              invoices={invoices}
              onNavigateCreate={() => {
                setIsReviewing(false);
                setActiveTab('create');
              }}
              onNavigateUpload={() => {
                setIsReviewing(false);
                setActiveTab('upload');
              }}
              onSelectInvoice={handleSelectInvoiceFromTable}
              onOpenExport={() => setIsExportOpen(true)}
            />
          ) : activeTab === 'settings' ? (
            <Settings
              user={user}
              onUpdateUser={setUser}
              onOpenUpgrade={() => setIsUpgradeOpen(true)}
            />
          ) : null}
        </div>
      </main>

      {/* Modals */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        invoices={invoices}
        onExportSuccess={(count) => {
          console.log(`Exported ${count} invoices`);
        }}
      />

      <UpgradeModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
        currentPlan={user.plan}
        onSelectPlan={handleSelectPlan}
      />
    </div>
  );
}
