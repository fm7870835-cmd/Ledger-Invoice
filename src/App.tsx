import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './lib/firebase';
import {
  saveInvoiceToFirestore,
  saveMultipleInvoicesToFirestore,
  saveUserProfileToFirestore,
  subscribeToInvoices,
  subscribeToUserProfile,
} from './lib/firebaseService';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { CreateInvoice } from './components/CreateInvoice';
import { Upload } from './components/Upload';
import { Review } from './components/Review';
import { Settings } from './components/Settings';
import { SignUp } from './components/SignUp';
import { ExportModal } from './components/ExportModal';
import { UpgradeModal } from './components/UpgradeModal';
import { SAMPLE_INVOICES, INITIAL_USER_PROFILE } from './data/initialInvoices';
import { Invoice, UserProfile, PlanTier } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'create' | 'upload' | 'invoices' | 'settings' | 'signup'>(
    'dashboard'
  );
  const [invoices, setInvoices] = useState<Invoice[]>(SAMPLE_INVOICES);
  const [user, setUser] = useState<UserProfile>(INITIAL_USER_PROFILE);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(
    SAMPLE_INVOICES.find((i) => i.status === 'Needs Review') || SAMPLE_INVOICES[0]
  );
  const [isReviewing, setIsReviewing] = useState(false);

  // Firebase Auth & Firestore Listener
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (fbUser) => {
      setCurrentUser(fbUser);
      if (fbUser) {
        const updatedProfile = {
          ...user,
          email: fbUser.email || user.email,
          name: fbUser.displayName || fbUser.email?.split('@')[0] || user.name,
        };
        setUser(updatedProfile);
        saveUserProfileToFirestore(updatedProfile, fbUser.uid);
      }
    });

    // Subscribe to Firestore Real-time Invoices
    const unsubscribeInvoices = subscribeToInvoices((firestoreInvoices) => {
      if (firestoreInvoices && firestoreInvoices.length > 0) {
        setInvoices(firestoreInvoices);
      }
    });

    // Subscribe to Firestore Real-time User Profile
    const unsubscribeProfile = subscribeToUserProfile((firestoreUser) => {
      if (firestoreUser) {
        setUser(firestoreUser);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeInvoices();
      unsubscribeProfile();
    };
  }, []);

  // Modals
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);

  // Handlers with Firestore Persistence
  const handleInvoiceCreated = (newInvoice: Invoice) => {
    setInvoices((prev) => [newInvoice, ...prev]);
    const updatedUser = {
      ...user,
      invoices_processed_this_month: user.invoices_processed_this_month + 1,
    };
    setUser(updatedUser);

    // Save to Firebase Firestore
    saveInvoiceToFirestore(newInvoice);
    saveUserProfileToFirestore(updatedUser, currentUser?.uid);
  };

  const handleInvoicesExtracted = (newInvoices: Invoice[]) => {
    setInvoices((prev) => [...newInvoices, ...prev]);
    if (newInvoices.length > 0) {
      setSelectedInvoice(newInvoices[0]);
    }
    // Save extracted invoices to Firebase Firestore
    saveMultipleInvoicesToFirestore(newInvoices);
  };

  const handleUpdateInvoice = (updated: Invoice) => {
    setInvoices((prev) => prev.map((inv) => (inv.id === updated.id ? updated : inv)));
    setSelectedInvoice(updated);
    // Save updated invoice to Firebase Firestore
    saveInvoiceToFirestore(updated);
  };

  const handleUpdateUserProfile = (updatedUser: UserProfile) => {
    setUser(updatedUser);
    saveUserProfileToFirestore(updatedUser, currentUser?.uid);
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
    const updatedUser = {
      ...user,
      plan,
      monthly_limit: limit,
    };
    setUser(updatedUser);
    saveUserProfileToFirestore(updatedUser, currentUser?.uid);
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
              onUpdateUser={handleUpdateUserProfile}
              onOpenUpgrade={() => setIsUpgradeOpen(true)}
            />
          ) : activeTab === 'signup' ? (
            <SignUp
              currentUser={currentUser}
              onNavigateDashboard={() => {
                setIsReviewing(false);
                setActiveTab('dashboard');
              }}
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
