import React, { useState, useRef } from 'react';
import { UserProfile } from '../types';

interface SettingsProps {
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  onOpenUpgrade: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ user, onUpdateUser, onOpenUpgrade }) => {
  const [fullName, setFullName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [timezone, setTimezone] = useState(user.timezone);

  // Shop Owner Branding
  const [shopName, setShopName] = useState(user.shop_name || 'Apex General Store');
  const [shopLogo, setShopLogo] = useState(
    user.shop_logo || 'https://api.iconify.design/lucide:store.svg?color=%23822426'
  );
  const [shopAddress, setShopAddress] = useState(
    user.shop_address || '100 Main Street, Suite 400, New York, NY 10001'
  );
  const [shopPhone, setShopPhone] = useState(user.shop_phone || '+1 (555) 234-5678');

  // File upload ref for logo
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Toggle preferences
  const [tfaEnabled, setTfaEnabled] = useState(true);
  const [emailReceipts, setEmailReceipts] = useState(false);
  const [betaFeatures, setBetaFeatures] = useState(false);

  // Micro-interaction states
  const [showToast, setShowToast] = useState(false);
  const [showValidatedStamp, setShowValidatedStamp] = useState(true);

  const presetLogos = [
    { name: 'Store Front', url: 'https://api.iconify.design/lucide:store.svg?color=%23822426' },
    { name: 'Coffee Cup', url: 'https://api.iconify.design/lucide:coffee.svg?color=%23822426' },
    { name: 'Tech / Gadget', url: 'https://api.iconify.design/lucide:laptop.svg?color=%23822426' },
    { name: 'Shopping Bag', url: 'https://api.iconify.design/lucide:shopping-bag.svg?color=%23822426' },
    { name: 'Crown / Premium', url: 'https://api.iconify.design/lucide:crown.svg?color=%23822426' },
  ];

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setShopLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = () => {
    onUpdateUser({
      ...user,
      name: fullName,
      email: email,
      timezone: timezone,
      shop_name: shopName,
      shop_logo: shopLogo,
      shop_address: shopAddress,
      shop_phone: shopPhone,
    });

    setShowValidatedStamp(true);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const usagePercent = Math.round((user.invoices_processed_this_month / user.monthly_limit) * 100);

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="font-headline-lg text-headline-lg text-[#1c1c15] mb-1">Settings & Shop Branding</h1>
        <p className="font-body-md text-[#564241]">
          Configure your shop logo, business address, and user preferences for all generated invoices.
        </p>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Settings Panel */}
        <div className="lg:col-span-8 space-y-6">
          {/* Shop Logo & Branding Card */}
          <div className="bg-[#f7f4e7] border-2 border-[#822426] p-6 md:p-8 shadow-xs">
            <div className="flex items-center gap-3 border-b border-[#ddc0be] pb-4 mb-6">
              <span className="material-symbols-outlined text-3xl text-[#822426]">storefront</span>
              <div>
                <h2 className="font-headline-sm text-xl text-[#1c1c15]">Shop Owner Branding & Logo</h2>
                <p className="font-body-md text-xs text-[#564241]">
                  This logo and shop info will automatically print on every invoice you generate.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Logo Preview and Upload */}
              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-white border border-[#ddc0be]">
                <div className="w-24 h-24 bg-[#f1eee2] border-2 border-dashed border-[#822426] flex items-center justify-center p-2 relative group">
                  {shopLogo ? (
                    <img src={shopLogo} alt="Shop Logo" className="w-full h-full object-contain" />
                  ) : (
                    <span className="font-label-md text-xs text-[#822426]">No Logo</span>
                  )}
                  <button
                    onClick={() => logoInputRef.current?.click()}
                    className="absolute inset-0 bg-black/60 text-white font-label-md text-[10px] uppercase flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-base">upload</span>
                    Change
                  </button>
                </div>

                <div className="flex-1 text-center sm:text-left space-y-2">
                  <h3 className="font-headline-sm text-base text-[#1c1c15]">Upload Custom Shop Logo</h3>
                  <p className="font-body-md text-xs text-[#564241]">
                    PNG, JPG, or SVG image (recommended square ratio).
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1 justify-center sm:justify-start">
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="px-4 py-2 bg-[#822426] text-white font-label-md text-xs uppercase hover:bg-[#a23b3b] transition-all cursor-pointer shadow-xs inline-flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">file_upload</span>
                      Upload Image
                    </button>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Preset Logos */}
              <div>
                <label className="font-label-md text-xs text-[#8a7170] uppercase block mb-2">
                  Or Select a Preset Shop Icon:
                </label>
                <div className="flex flex-wrap gap-3">
                  {presetLogos.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setShopLogo(preset.url)}
                      className={`p-2 bg-white border flex items-center gap-2 hover:border-[#822426] cursor-pointer transition-all ${
                        shopLogo === preset.url ? 'border-[#822426] ring-1 ring-[#822426] bg-red-50/20' : 'border-[#ddc0be]'
                      }`}
                    >
                      <img src={preset.url} alt={preset.name} className="w-6 h-6 object-contain" />
                      <span className="font-body-md text-xs text-[#1c1c15]">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Shop Details Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="font-label-md text-xs text-[#564241] uppercase block mb-1">Shop Name *</label>
                  <input
                    type="text"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder="e.g. Apex General Store"
                    className="w-full p-2.5 bg-white border border-[#ddc0be] focus:border-[#822426] font-body-md text-sm text-[#1c1c15]"
                  />
                </div>

                <div>
                  <label className="font-label-md text-xs text-[#564241] uppercase block mb-1">Shop Phone</label>
                  <input
                    type="text"
                    value={shopPhone}
                    onChange={(e) => setShopPhone(e.target.value)}
                    placeholder="e.g. +1 (555) 019-2831"
                    className="w-full p-2.5 bg-white border border-[#ddc0be] focus:border-[#822426] font-body-md text-sm text-[#1c1c15]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="font-label-md text-xs text-[#564241] uppercase block mb-1">Shop Address</label>
                  <input
                    type="text"
                    value={shopAddress}
                    onChange={(e) => setShopAddress(e.target.value)}
                    placeholder="e.g. 100 Main Street, New York, NY"
                    className="w-full p-2.5 bg-white border border-[#ddc0be] focus:border-[#822426] font-body-md text-sm text-[#1c1c15]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* User Account Settings Form */}
          <div className="bg-white paper-border p-6 md:p-8 shadow-xs">
            <h2 className="font-headline-sm text-headline-sm text-[#1c1c15] mb-6">Personal Information</h2>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="font-label-md text-label-md text-[#564241] uppercase">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-transparent border-0 border-b border-[#8a7170] focus:ring-0 focus:border-[#1c1c15] font-body-lg text-body-lg px-0 py-2 text-[#1c1c15]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-label-md text-label-md text-[#564241] uppercase">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent border-0 border-b border-[#8a7170] focus:ring-0 focus:border-[#1c1c15] font-body-lg text-body-lg px-0 py-2 text-[#1c1c15]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-label-md text-label-md text-[#564241] uppercase">Account ID</label>
                  <div className="font-data-md text-data-md py-2 text-[#564241] font-semibold">
                    {user.account_id}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-label-md text-label-md text-[#564241] uppercase">Timezone</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full bg-transparent border-0 border-b border-[#8a7170] focus:ring-0 focus:border-[#1c1c15] font-body-lg text-body-lg px-0 py-2 appearance-none text-[#1c1c15] cursor-pointer"
                  >
                    <option>UTC -05:00 (EST)</option>
                    <option>UTC +00:00 (GMT)</option>
                    <option>UTC +01:00 (CET)</option>
                    <option>UTC -08:00 (PST)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-4 border-t border-[#f1eee2]">
                <button
                  type="button"
                  onClick={() => {
                    setFullName(user.name);
                    setEmail(user.email);
                  }}
                  className="px-6 py-2 border border-[#0c1b34] text-[#0c1b34] font-label-md text-label-md hover:bg-[#0c1b34]/5 transition-colors cursor-pointer"
                >
                  DISCARD
                </button>
                <button
                  type="button"
                  onClick={handleSaveChanges}
                  className="px-6 py-2 bg-[#822426] text-white font-label-md text-label-md hover:bg-[#a23b3b] transition-all cursor-pointer shadow-xs"
                >
                  SAVE ALL SETTINGS
                </button>
              </div>
            </form>
          </div>

          {/* Invoice Usage Card */}
          <div className="bg-white paper-border p-6 md:p-8 shadow-xs">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="font-headline-sm text-headline-sm text-[#1c1c15] mb-1">Invoice Usage</h2>
                <p className="font-body-md text-[#564241]">
                  Monthly volume for <strong>{user.plan} Plan</strong>
                </p>
              </div>
              <button
                onClick={onOpenUpgrade}
                className="px-6 py-2.5 bg-[#822426] text-white font-label-md text-label-md hover:bg-[#a23b3b] transition-all uppercase tracking-wider cursor-pointer shadow-xs"
              >
                UPGRADE PLAN
              </button>
            </div>

            {/* Stamp Red Usage Bar */}
            <div className="space-y-3">
              <div className="flex justify-between font-data-sm text-data-sm text-[#1c1c15]">
                <span>
                  {user.invoices_processed_this_month} / {user.monthly_limit.toLocaleString()} Invoices processed
                </span>
                <span className="font-bold">{usagePercent}%</span>
              </div>
              <div className="h-4 w-full bg-[#ebe8dc] paper-border relative overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-[#822426] transition-all duration-1000"
                  style={{ width: `${Math.min(usagePercent, 100)}%` }}
                />
              </div>
              <p className="font-data-sm text-data-sm text-[#564241] italic">
                Your billing cycle resets in {user.billing_cycle_reset_days} days.
              </p>
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Subscription Status Card */}
          <div className="bg-[#ebe8dc] p-6 paper-border relative overflow-hidden shadow-xs">
            <div className="relative z-10">
              <h3 className="font-label-md text-label-md text-[#564241] uppercase mb-4 tracking-wider">
                Subscription Status
              </h3>
              <div className="mb-6">
                <div className="font-headline-md text-headline-md text-[#822426] mb-1">{user.plan} Plan</div>
                <div className="font-data-sm text-data-sm text-[#564241]">Billed annually • $1,490/yr</div>
              </div>

              {showValidatedStamp && (
                <div>
                  <div className="stamp-effect text-xs py-1 px-3 bg-white/80">VALIDATED</div>
                </div>
              )}
            </div>
            <span className="material-symbols-outlined text-9xl absolute -right-6 -bottom-6 text-[#822426]/10 select-none">
              verified
            </span>
          </div>

          {/* Preferences Card */}
          <div className="bg-white paper-border p-6 shadow-xs">
            <h3 className="font-label-md text-label-md text-[#564241] uppercase mb-6 tracking-wider">Preferences</h3>
            <ul className="space-y-4">
              <li className="flex items-center justify-between py-2 border-b border-[#ddc0be]">
                <div className="flex flex-col">
                  <span className="font-body-md text-body-md font-semibold text-[#1c1c15]">Two-Factor Auth</span>
                  <span className="font-label-md text-xs text-[#564241]">Security priority</span>
                </div>
                <button
                  type="button"
                  onClick={() => setTfaEnabled(!tfaEnabled)}
                  className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${
                    tfaEnabled ? 'bg-[#204f36]' : 'bg-[#ebe8dc] paper-border'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                      tfaEnabled ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </li>

              <li className="flex items-center justify-between py-2 border-b border-[#ddc0be]">
                <div className="flex flex-col">
                  <span className="font-body-md text-body-md font-semibold text-[#1c1c15]">Email Receipts</span>
                  <span className="font-label-md text-xs text-[#564241]">After every transaction</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEmailReceipts(!emailReceipts)}
                  className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${
                    emailReceipts ? 'bg-[#204f36]' : 'bg-[#ebe8dc] paper-border'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full transition-all ${
                      emailReceipts ? 'right-1 bg-white' : 'left-1 bg-[#8a7170]'
                    }`}
                  />
                </button>
              </li>

              <li className="flex items-center justify-between py-2">
                <div className="flex flex-col">
                  <span className="font-body-md text-body-md font-semibold text-[#1c1c15]">Beta Features</span>
                  <span className="font-label-md text-xs text-[#564241]">Early AI ledger access</span>
                </div>
                <button
                  type="button"
                  onClick={() => setBetaFeatures(!betaFeatures)}
                  className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${
                    betaFeatures ? 'bg-[#204f36]' : 'bg-[#ebe8dc] paper-border'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full transition-all ${
                      betaFeatures ? 'right-1 bg-white' : 'left-1 bg-[#8a7170]'
                    }`}
                  />
                </button>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      {/* Success Feedback Toast */}
      {showToast && (
        <div className="fixed bottom-8 right-8 bg-[#0c1b34] text-white px-6 py-4 shadow-xl z-50 paper-border border-[#822426] animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-[#204f36]">check_circle</span>
            <span className="font-label-md text-xs uppercase tracking-widest">Shop Logo & Settings Saved!</span>
          </div>
        </div>
      )}
    </div>
  );
};

