import { Invoice, UserProfile } from '../types';

export const INITIAL_USER_PROFILE: UserProfile = {
  name: 'Julian Draxler',
  email: 'julian@ledger-finance.io',
  role: 'Store Manager / Owner',
  account_id: 'LGR-992-PX-10',
  timezone: 'UTC -05:00 (EST)',
  plan: 'Professional',
  invoices_processed_this_month: 842,
  monthly_limit: 1000,
  billing_cycle_reset_days: 8,
  payment_card_last4: '4242',
  payment_card_exp: '12/26',
  shop_name: 'Apex General Store',
  shop_logo: 'https://api.iconify.design/lucide:store.svg?color=%23822426',
  shop_phone: '+1 (555) 234-5678',
  shop_address: '100 Main Street, Suite 400, New York, NY 10001',
};

export const SAMPLE_INVOICES: Invoice[] = [
  {
    id: 'inv-001',
    vendor_name: 'Acme Systems Co.',
    vendor_initials: 'AS',
    invoice_number: 'INV-2023-001',
    invoice_date: 'Oct 12, 2023',
    due_date: 'Nov 12, 2023',
    subtotal: 1150.00,
    tax_amount: 100.00,
    total_amount: 1250.00,
    currency: 'USD',
    status: 'Paid',
    line_items: [
      { id: 'li-1', description: 'Cloud Infrastructure Hosting (Monthly)', quantity: 1, unit_price: 950.00, line_total: 950.00 },
      { id: 'li-2', description: 'Premium API Gateway Tier', quantity: 1, unit_price: 200.00, line_total: 200.00 }
    ],
    created_at: '2023-10-12T09:00:00Z',
    confirmed_at: '2023-10-12T09:15:00Z'
  },
  {
    id: 'inv-002',
    vendor_name: 'Global Tech Logics',
    vendor_initials: 'GT',
    invoice_number: 'INV-2023-082',
    invoice_date: 'Oct 14, 2023',
    due_date: 'Oct 28, 2023',
    subtotal: 4400.00,
    tax_amount: 420.50,
    total_amount: 4820.50,
    currency: 'USD',
    status: 'Overdue',
    line_items: [
      { id: 'li-3', description: 'Enterprise Data Pipeline Setup', quantity: 1, unit_price: 3200.00, line_total: 3200.00 },
      { id: 'li-4', description: 'On-site Database Optimization', quantity: 8, unit_price: 150.00, line_total: 1200.00 }
    ],
    created_at: '2023-10-14T11:20:00Z'
  },
  {
    id: 'inv-003',
    vendor_name: 'Stellar Venture Group',
    vendor_initials: 'SV',
    invoice_number: 'INV-2023-119',
    invoice_date: 'Oct 15, 2023',
    due_date: 'Nov 15, 2023',
    subtotal: 800.00,
    tax_amount: 90.00,
    total_amount: 890.00,
    currency: 'USD',
    status: 'Pending',
    line_items: [
      { id: 'li-5', description: 'Financial Audit & Tax Strategy Retainer', quantity: 1, unit_price: 800.00, line_total: 800.00 }
    ],
    created_at: '2023-10-15T14:10:00Z'
  },
  {
    id: 'inv-004',
    vendor_name: 'West Coast Logistics',
    vendor_initials: 'WC',
    invoice_number: 'INV-2023-8842',
    invoice_date: 'Oct 12, 2023',
    due_date: 'Nov 12, 2023',
    subtotal: 1380.00,
    tax_amount: 72.00,
    total_amount: 1452.00,
    currency: 'USD',
    status: 'Needs Review',
    low_confidence_fields: ['total_amount', 'handling_fee'],
    preview_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCK9V7XbaKZmkvmNjA12jj6n06StrEbwQii5nFS-dsIsUO8Wwg93e85cUhag3z4f7OxNe3pXXNCvBLLwvbfEVn5UXpeluczOR5fPZsKjMJGeeYU4a8VZ0o5NIFisyiupMOa-0_W7A4nUWex0iOcvGJNHl1CMLlSIPn1I03EVBkmeHvvn01h5Jrx8i8_B8hxd1skhRaTHAhAP2VyZkENdtVtwCDfAIj93_iFxcs4-kbnAze5bzJ0ukO4HMrq9iWxBhgoRvFBX0YCzO1i',
    line_items: [
      { id: 'li-6', description: 'Freight - Standard Delivery', quantity: 1, unit_price: 1200.00, line_total: 1200.00 },
      { id: 'li-7', description: 'Fuel Surcharge (15%)', quantity: 1, unit_price: 180.00, line_total: 180.00 },
      { id: 'li-8', description: 'Handling Fee', quantity: 1, unit_price: 72.00, line_total: 72.00, unsure: true }
    ],
    created_at: '2023-10-12T16:05:00Z'
  },
  {
    id: 'inv-005',
    vendor_name: 'Apex Media Partners',
    vendor_initials: 'AM',
    invoice_number: 'INV-2023-502',
    invoice_date: 'Oct 18, 2023',
    due_date: 'Nov 01, 2023',
    subtotal: 3100.00,
    tax_amount: 250.00,
    total_amount: 3350.00,
    currency: 'USD',
    status: 'Exported',
    line_items: [
      { id: 'li-9', description: 'Q4 Brand Awareness Ad Placement', quantity: 1, unit_price: 3100.00, line_total: 3100.00 }
    ],
    created_at: '2023-10-18T10:00:00Z',
    exported_at: '2023-10-18T11:00:00Z'
  },
  {
    id: 'inv-006',
    vendor_name: 'Horizon Dynamics',
    vendor_initials: 'HD',
    invoice_number: 'INV-2023-909',
    invoice_date: 'Oct 20, 2023',
    due_date: 'Nov 20, 2023',
    subtotal: 2100.00,
    tax_amount: 190.00,
    total_amount: 2290.00,
    currency: 'USD',
    status: 'Confirmed',
    line_items: [
      { id: 'li-10', description: 'Custom Hardware Enclosures', quantity: 10, unit_price: 210.00, line_total: 2100.00 }
    ],
    created_at: '2023-10-20T08:30:00Z',
    confirmed_at: '2023-10-20T08:45:00Z'
  }
];
