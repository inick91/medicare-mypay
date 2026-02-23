export const PLAN_TYPES = ['Medicare Advantage', 'Medicare Supplement', 'Part D', 'Other'] as const;
export type PlanType = typeof PLAN_TYPES[number];

export const DEFAULT_CARRIERS = ['Humana', 'Aetna', 'UnitedHealthcare', 'Cigna', 'Blue Cross', 'Mutual of Omaha'] as const;

export interface Commission {
  id: string;
  agentName: string;
  policyNumber: string;
  carrier: string;
  planType: PlanType;
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
  amount: number;
}

export const sampleRates: CommissionRate[] = [
  { id: '1', carrier: 'Humana', planType: 'Medicare Advantage', amount: 601 },
  { id: '2', carrier: 'Humana', planType: 'Medicare Supplement', amount: 450 },
  { id: '3', carrier: 'Humana', planType: 'Part D', amount: 100 },
  { id: '4', carrier: 'Aetna', planType: 'Medicare Advantage', amount: 601 },
  { id: '5', carrier: 'Aetna', planType: 'Medicare Supplement', amount: 475 },
  { id: '6', carrier: 'UnitedHealthcare', planType: 'Medicare Advantage', amount: 601 },
  { id: '7', carrier: 'Cigna', planType: 'Part D', amount: 100 },
  { id: '8', carrier: 'Blue Cross', planType: 'Medicare Advantage', amount: 601 },
  { id: '9', carrier: 'Mutual of Omaha', planType: 'Medicare Supplement', amount: 520 },
];

export const sampleCommissions: Commission[] = [
  {
    id: '1',
    agentName: 'Sarah Johnson',
    policyNumber: 'MA-2024-00142',
    carrier: 'Humana',
    planType: 'Medicare Advantage',
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
    enrollmentDate: '2026-01-12',
    commissionAmount: 601,
    status: 'paid',
    paidDate: '2026-02-15',
  },
];
