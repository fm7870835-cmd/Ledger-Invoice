import React, { useState } from 'react';
import { PlanTier } from '../types';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: PlanTier;
  onSelectPlan: (plan: PlanTier, limit: number) => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  currentPlan,
  onSelectPlan,
}) => {
  const [selectedTier, setSelectedTier] = useState<PlanTier>(currentPlan);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const plans = [
    {
      name: 'Starter' as PlanTier,
      price: '$29',
      period: '/month',
      limit: 50,
      description: 'Ideal for single-operator freelancers & micro-businesses.',
      features: ['Up to 50 invoices/mo', 'Gemini AI automated OCR', 'Google Sheets & CSV export', 'Standard email support'],
    },
    {
      name: 'Growth' as PlanTier,
      price: '$79',
      period: '/month',
      limit: 300,
      popular: true,
      description: 'Designed for growing small businesses & bookkeeping practices.',
      features: ['Up to 300 invoices/mo', 'High-confidence AI verification', 'Google Sheets sync', 'Priority support & audit trail'],
    },
    {
      name: 'Unlimited' as PlanTier,
      price: '$199',
      period: '/month',
      limit: 99999,
      description: 'Full capacity for high-volume accounts & multi-client firms.',
      features: ['Unlimited invoices/mo', 'Custom Gemini fine-tuning', 'Dedicated workspace account manager', '24/7 priority support'],
    },
  ];

  const handleUpgrade = (planName: PlanTier, limit: number) => {
    setSelectedTier(planName);
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);
      onSelectPlan(planName, limit);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in overflow-y-auto">
      <div className="bg-[#fcf9ed] border border-[#ddc0be] max-w-3xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative">
        <div className="flex justify-between items-start border-b border-[#ddc0be] pb-4">
          <div>
            <span className="font-label-md text-[10px] text-[#822426] uppercase tracking-widest block font-bold">
              Subscription & Volume Quota
            </span>
            <h2 className="font-headline-lg text-2xl text-[#1c1c15]">Upgrade Your Ledger Subscription</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-[#ebe8dc] text-[#564241] cursor-pointer">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center space-y-4 bg-white border border-[#bbeecc]">
            <div className="w-16 h-16 bg-[#e6f4ea] text-[#204f36] rounded-full flex items-center justify-center mx-auto text-3xl">
              <span className="material-symbols-outlined text-3xl">verified</span>
            </div>
            <h3 className="font-headline-md text-xl text-[#1c1c15]">Subscription Updated to {selectedTier} Plan!</h3>
            <p className="font-body-md text-[#564241] max-w-md mx-auto">
              Your workspace capacity has been upgraded. New invoice quotas are now immediately active.
            </p>
            <button
              onClick={onClose}
              className="bg-[#822426] text-white px-8 py-3 font-label-md text-xs uppercase tracking-widest shadow-sm hover:bg-[#a23b3b]"
            >
              Return to Dashboard
            </button>
          </div>
        ) : (
          <>
            <p className="font-body-md text-[#564241]">
              Select the plan that best fits your monthly invoice processing volume. Upgrade or downgrade anytime.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((p) => {
                const isCurrent = currentPlan === p.name;
                return (
                  <div
                    key={p.name}
                    className={`bg-white p-6 border flex flex-col justify-between relative transition-all ${
                      p.popular ? 'border-[#822426] ring-1 ring-[#822426]' : 'border-[#ddc0be]'
                    }`}
                  >
                    {p.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#822426] text-white text-[9px] font-bold uppercase tracking-widest px-3 py-0.5">
                        Most Popular
                      </span>
                    )}

                    <div>
                      <h3 className="font-headline-sm text-lg text-[#1c1c15] mb-1">{p.name}</h3>
                      <div className="flex items-baseline gap-1 my-3">
                        <span className="font-data-lg text-3xl font-bold text-[#822426]">{p.price}</span>
                        <span className="font-body-md text-xs text-[#8a7170]">{p.period}</span>
                      </div>
                      <p className="font-body-md text-xs text-[#564241] mb-4">{p.description}</p>
                      <ul className="space-y-2 text-xs text-[#1c1c15] border-t border-[#f1eee2] pt-4">
                        {p.features.map((f, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm text-[#204f36]">check</span>
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-6 pt-4 border-t border-[#f1eee2]">
                      <button
                        disabled={isCurrent || processing}
                        onClick={() => handleUpgrade(p.name, p.limit)}
                        className={`w-full py-2.5 px-4 font-label-md text-xs uppercase tracking-widest transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-[#f1eee2] text-[#8a7170] cursor-not-allowed border border-[#ddc0be]'
                            : p.popular
                            ? 'bg-[#822426] text-white hover:bg-[#a23b3b]'
                            : 'border border-[#0c1b34] text-[#0c1b34] hover:bg-[#0c1b34]/5'
                        }`}
                      >
                        {isCurrent ? 'Current Plan' : `Upgrade to ${p.name}`}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
