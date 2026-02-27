export const PLAN_TYPES = ['Medicare Advantage', 'Medicare Supplement', 'Part D', 'Other'] as const;
export type PlanType = typeof PLAN_TYPES[number];

export const DEFAULT_CARRIERS = ['Humana', 'Aetna', 'UnitedHealthcare', 'Cigna', 'Blue Cross', 'Mutual of Omaha'] as const;

// CMS 2026 maximum broker compensation rates
export const CMS_2026_RATES: Record<string, { initial: number; renewal: number }> = {
  'Medicare Advantage': { initial: 694, renewal: 347 },
  'Part D': { initial: 114, renewal: 57 },
};

export interface Commission {
  id: string;
  agentName: string;
  policyNumber: string;
  carrier: string;
  planType: PlanType;
  planName?: string;
  enrollmentDate: string;
  commissionAmount: number;
  status: 'pending' | 'paid' | 'clawback';
  paidDate?: string;
  notes?: string;
}

export interface CommissionRate {
  id: string;
  carrier: string;
  planType: PlanType;
  planName: string;
  initialAmount: number;
  renewalAmount: number;
  nonCommissionable: boolean;
}

export const sampleRates: CommissionRate[] = [
  { id: '1', carrier: 'Humana', planType: 'Medicare Advantage', planName: 'Humana Gold Plus H1036-040', initialAmount: 694, renewalAmount: 347, nonCommissionable: false },
  { id: '2', carrier: 'Humana', planType: 'Medicare Advantage', planName: 'Humana Honor H5216-254', initialAmount: 694, renewalAmount: 347, nonCommissionable: false },
  { id: '3', carrier: 'Humana', planType: 'Part D', planName: 'Humana Walmart Value Rx Plan', initialAmount: 114, renewalAmount: 57, nonCommissionable: false },
  { id: '4', carrier: 'Humana', planType: 'Medicare Supplement', planName: 'Humana Plan G', initialAmount: 450, renewalAmount: 225, nonCommissionable: false },
  { id: '5', carrier: 'Aetna', planType: 'Medicare Advantage', planName: 'Aetna Medicare Eagle Plan', initialAmount: 694, renewalAmount: 347, nonCommissionable: false },
  { id: '6', carrier: 'Aetna', planType: 'Medicare Advantage', planName: 'Aetna Medicare Value Plan', initialAmount: 0, renewalAmount: 0, nonCommissionable: true },
  { id: '7', carrier: 'UnitedHealthcare', planType: 'Medicare Advantage', planName: 'AARP Medicare Advantage Plan 1', initialAmount: 694, renewalAmount: 347, nonCommissionable: false },
  { id: '8', carrier: 'Cigna', planType: 'Part D', planName: 'Cigna Secure Rx', initialAmount: 114, renewalAmount: 57, nonCommissionable: false },
  { id: '9', carrier: 'Blue Cross', planType: 'Medicare Advantage', planName: 'Blue Cross MA Saver', initialAmount: 694, renewalAmount: 347, nonCommissionable: false },
  { id: '10', carrier: 'Mutual of Omaha', planType: 'Medicare Supplement', planName: 'Plan G', initialAmount: 520, renewalAmount: 260, nonCommissionable: false },
];

export const sampleCommissions: Commission[] = [
  {
    id: '1',
    agentName: 'Sarah Johnson',
    policyNumber: 'MA-2024-00142',
    carrier: 'Humana',
    planType: 'Medicare Advantage',
    planName: 'Humana Gold Plus H1036-040',
    enrollmentDate: '2025-10-15',
    commissionAmount: 601,
    status: 'paid',
    paidDate: '2025-11-20',
  },
  {
    id: '2',
    agentName: 'Sarah Johnson',
    policyNumber: 'MS-2024-00287',
    carrier: 'Aetna',
    planType: 'Medicare Supplement',
    enrollmentDate: '2025-11-02',
    commissionAmount: 450,
    status: 'pending',
  },
  {
    id: '3',
    agentName: 'Michael Chen',
    policyNumber: 'MA-2024-00301',
    carrier: 'UnitedHealthcare',
    planType: 'Medicare Advantage',
    planName: 'AARP Medicare Advantage Plan 1',
    enrollmentDate: '2025-10-20',
    commissionAmount: 601,
    status: 'paid',
    paidDate: '2025-11-25',
  },
  {
    id: '4',
    agentName: 'Michael Chen',
    policyNumber: 'PD-2024-00089',
    carrier: 'Cigna',
    planType: 'Part D',
    planName: 'Cigna Secure Rx',
    enrollmentDate: '2025-11-10',
    commissionAmount: 100,
    status: 'pending',
  },
  {
    id: '5',
    agentName: 'Lisa Martinez',
    policyNumber: 'MA-2024-00415',
    carrier: 'Blue Cross',
    planType: 'Medicare Advantage',
    planName: 'Blue Cross MA Saver',
    enrollmentDate: '2025-09-28',
    commissionAmount: 601,
    status: 'paid',
    paidDate: '2025-10-30',
  },
  {
    id: '6',
    agentName: 'Lisa Martinez',
    policyNumber: 'MA-2024-00416',
    carrier: 'Humana',
    planType: 'Medicare Advantage',
    planName: 'Humana Gold Plus H1036-040',
    enrollmentDate: '2025-12-01',
    commissionAmount: 601,
    status: 'clawback',
    notes: 'Policy cancelled within 90 days',
  },
  {
    id: '7',
    agentName: 'James Wilson',
    policyNumber: 'MS-2024-00512',
    carrier: 'Mutual of Omaha',
    planType: 'Medicare Supplement',
    planName: 'Plan G',
    enrollmentDate: '2026-01-05',
    commissionAmount: 520,
    status: 'pending',
  },
  {
    id: '8',
    agentName: 'James Wilson',
    policyNumber: 'MA-2024-00520',
    carrier: 'Aetna',
    planType: 'Medicare Advantage',
    planName: 'Aetna Medicare Eagle Plan',
    enrollmentDate: '2026-01-12',
    commissionAmount: 601,
    status: 'paid',
    paidDate: '2026-02-15',
  },
];

export type CommissionStatus = "paid" | "pending" | "clawback";

export type Commission = {
  id: string;
  agentName: string;
  policyNumber: string;
  carrier: string;
  planType: string;
  planName?: string;
  enrollmentDate: string;
  commissionAmount: number;
  status: CommissionStatus;
  paidDate?: string;
  notes?: string;
};
