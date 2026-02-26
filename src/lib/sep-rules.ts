import { addMonths, addDays, differenceInDays, isWithinInterval, startOfMonth, endOfMonth, format } from 'date-fns';

// ─── Types ───────────────────────────────────────────────────────────

export type StatusLabel =
  | 'Available Now'
  | 'Available Now – Limited Use'
  | 'Available Now – Expires Soon'
  | 'Available Now – Ongoing'
  | 'Future Option'
  | 'Informational Only';

export type RankTier = 1 | 2 | 3 | 4 | 5;

export interface EnrollmentPeriodResult {
  id: string;
  name: string;
  status: StatusLabel;
  tier: RankTier;
  isActive: boolean;
  isFuture: boolean;
  isExpired: boolean;
  isOneTimeUse: boolean;
  startDate: Date | null;
  endDate: Date | null;
  daysRemaining: number | null;
  effectiveDateRule: string;
  whyItApplies: string;
  allowedActions: string;
  limitedUse: boolean;
  strategicGuidance: string;
  warning?: string;
}

export interface SepFinderInput {
  today: Date;
  partAEffectiveDate: string;       // YYYY-MM-DD
  turning65Date: string;            // YYYY-MM-DD (empty if already 65+)
  isDualEligible: boolean;
  isLIS: boolean;                   // Low-Income Subsidy
  hasMovedRecently: boolean;
  moveDate: string;                 // YYYY-MM-DD
  hasLostCoverage: boolean;
  coverageLossDate: string;         // YYYY-MM-DD
  hasChronicCondition: boolean;
  isInstitutionalized: boolean;
  usedOep: boolean;                 // whether OEP has already been used this year
}

// ─── Helpers ─────────────────────────────────────────────────────────

function daysUntil(today: Date, end: Date): number | null {
  const d = differenceInDays(end, today);
  return d >= 0 ? d : null;
}

function makeDate(s: string): Date | null {
  if (!s) return null;
  const d = new Date(s + 'T00:00:00');
  return isNaN(d.getTime()) ? null : d;
}

// ─── Evaluation ──────────────────────────────────────────────────────

export function evaluateEnrollmentPeriods(input: SepFinderInput): EnrollmentPeriodResult[] {
  const { today } = input;
  const results: EnrollmentPeriodResult[] = [];
  const year = today.getFullYear();

  // ── IEP (Initial Enrollment Period) ──
  const partADate = makeDate(input.partAEffectiveDate);
  if (partADate) {
    const iepStart = addMonths(partADate, -3);
    const iepEnd = addMonths(partADate, 3);
    const iepEndDay = endOfMonth(iepEnd);
    const active = isWithinInterval(today, { start: iepStart, end: iepEndDay });
    const expired = today > iepEndDay;
    const remaining = active ? daysUntil(today, iepEndDay) : null;
    const expiresSoon = remaining !== null && remaining <= 60;

    results.push({
      id: 'iep',
      name: 'Initial Enrollment Period (IEP)',
      status: active ? (expiresSoon ? 'Available Now – Expires Soon' : 'Available Now') : (expired ? 'Informational Only' : 'Future Option'),
      tier: active && expiresSoon ? 1 : active ? 2 : expired ? 5 : 4,
      isActive: active,
      isFuture: !active && !expired,
      isExpired: expired,
      isOneTimeUse: true,
      startDate: iepStart,
      endDate: iepEndDay,
      daysRemaining: remaining,
      effectiveDateRule: 'Coverage begins the 1st of the month after enrollment, depending on when during IEP you sign up.',
      whyItApplies: `Your Part A effective date is ${format(partADate, 'MM/dd/yyyy')}. The IEP spans 7 months around that date.`,
      allowedActions: 'Enroll in Medicare Advantage, Medicare Supplement, or Part D for the first time.',
      limitedUse: true,
      strategicGuidance: active && expiresSoon
        ? 'This window closes soon — use it before it expires since it cannot be reopened.'
        : active
          ? 'You are within your IEP. Consider enrolling now while you have the broadest plan choices.'
          : expired
            ? 'Your IEP has passed. Other enrollment periods may still be available.'
            : 'Your IEP has not started yet.',
    });
  }

  // ── ICEP (Initial Coverage Election Period) ──
  const turning65 = makeDate(input.turning65Date);
  if (turning65) {
    const icepStart = addMonths(turning65, -3);
    const icepEnd = endOfMonth(addMonths(turning65, 3));
    const active = isWithinInterval(today, { start: icepStart, end: icepEnd });
    const expired = today > icepEnd;
    const remaining = active ? daysUntil(today, icepEnd) : null;
    const expiresSoon = remaining !== null && remaining <= 60;

    results.push({
      id: 'icep',
      name: 'Initial Coverage Election Period (ICEP)',
      status: active ? (expiresSoon ? 'Available Now – Expires Soon' : 'Available Now') : (expired ? 'Informational Only' : 'Future Option'),
      tier: active && expiresSoon ? 1 : active ? 2 : expired ? 5 : 4,
      isActive: active,
      isFuture: !active && !expired,
      isExpired: expired,
      isOneTimeUse: true,
      startDate: icepStart,
      endDate: icepEnd,
      daysRemaining: remaining,
      effectiveDateRule: 'Coverage begins the 1st of the month you turn 65 or when Part A/B starts, whichever is later.',
      whyItApplies: `You are turning 65 on ${format(turning65, 'MM/dd/yyyy')}. The ICEP spans 7 months around that date.`,
      allowedActions: 'Enroll in a Medicare Advantage or Part D plan for the first time.',
      limitedUse: true,
      strategicGuidance: active && expiresSoon
        ? 'Your ICEP is closing soon — act now to lock in your first MA or Part D plan.'
        : active
          ? 'You are in your ICEP. This is your first chance to pick a Medicare Advantage plan.'
          : expired
            ? 'Your ICEP has passed.'
            : 'Your ICEP has not begun yet.',
    });
  }

  // ── AEP (Annual Election Period) — Oct 15 – Dec 7 ──
  {
    const aepStart = new Date(year, 9, 15); // Oct 15
    const aepEnd = new Date(year, 11, 7);   // Dec 7
    const active = isWithinInterval(today, { start: aepStart, end: aepEnd });
    const expired = today > aepEnd;
    const futureThisYear = today < aepStart;
    const remaining = active ? daysUntil(today, aepEnd) : null;
    const displayStart = futureThisYear ? aepStart : new Date(year + 1, 9, 15);

    results.push({
      id: 'aep',
      name: 'Annual Election Period (AEP)',
      status: active ? 'Available Now' : 'Future Option',
      tier: active ? 2 : 4,
      isActive: active,
      isFuture: !active,
      isExpired: false,
      isOneTimeUse: false,
      startDate: active ? aepStart : displayStart,
      endDate: active ? aepEnd : (futureThisYear ? aepEnd : new Date(year + 1, 11, 7)),
      daysRemaining: remaining,
      effectiveDateRule: 'Changes made during AEP take effect January 1 of the following year.',
      whyItApplies: 'AEP is available to all Medicare beneficiaries every year.',
      allowedActions: 'Switch MA plans, return to Original Medicare, join or drop a Part D plan.',
      limitedUse: false,
      strategicGuidance: active
        ? 'AEP is open now. You can make broad plan changes effective January 1.'
        : `If you do not use another option now, AEP opens October 15 and allows broader plan changes.`,
      warning: active ? undefined : `Future Option – Opens October 15${futureThisYear ? '' : `, ${year + 1}`}.`,
    });
  }

  // ── OEP (Medicare Advantage Open Enrollment Period) — Jan 1 – Mar 31 ──
  {
    const oepStart = new Date(year, 0, 1);
    const oepEnd = new Date(year, 2, 31);
    const active = isWithinInterval(today, { start: oepStart, end: oepEnd });
    const remaining = active ? daysUntil(today, oepEnd) : null;

    if (active) {
      results.push({
        id: 'oep',
        name: 'Medicare Advantage Open Enrollment Period (OEP)',
        status: 'Available Now – Limited Use',
        tier: remaining !== null && remaining <= 30 ? 1 : 2,
        isActive: true,
        isFuture: false,
        isExpired: false,
        isOneTimeUse: true,
        startDate: oepStart,
        endDate: oepEnd,
        daysRemaining: remaining,
        effectiveDateRule: 'Changes take effect the 1st of the month after the plan receives the enrollment.',
        whyItApplies: 'The OEP is available January 1 through March 31 for anyone currently enrolled in a Medicare Advantage plan.',
        allowedActions: 'Switch to a different MA plan, or disenroll from MA back to Original Medicare (with Part D option).',
        limitedUse: true,
        strategicGuidance: 'OEP can only be used once. If another SEP expires sooner, consider using that first to preserve this option.',
        warning: 'Can only be used once between January 1 and March 31.',
      });
    } else {
      results.push({
        id: 'oep',
        name: 'Medicare Advantage Open Enrollment Period (OEP)',
        status: 'Future Option',
        tier: 4,
        isActive: false,
        isFuture: true,
        isExpired: false,
        isOneTimeUse: true,
        startDate: new Date(year + 1, 0, 1),
        endDate: new Date(year + 1, 2, 31),
        daysRemaining: null,
        effectiveDateRule: 'Changes take effect the 1st of the month after the plan receives the enrollment.',
        whyItApplies: 'OEP is available every year January 1–March 31 for MA enrollees.',
        allowedActions: 'Switch MA plans or disenroll from MA.',
        limitedUse: true,
        strategicGuidance: 'OEP opens January 1 next year. It can only be used once per year.',
        warning: `Future Option – Opens January 1, ${year + 1}.`,
      });
    }
  }

  // ── Dual/LIS Monthly SEP ──
  if (input.isDualEligible || input.isLIS) {
    results.push({
      id: 'dual-lis-monthly',
      name: input.isDualEligible ? 'Dual Eligible Monthly SEP' : 'LIS (Extra Help) Monthly SEP',
      status: 'Available Now – Ongoing',
      tier: 3,
      isActive: true,
      isFuture: false,
      isExpired: false,
      isOneTimeUse: false,
      startDate: null,
      endDate: null,
      daysRemaining: null,
      effectiveDateRule: 'Changes take effect the 1st of the month after the plan receives the enrollment.',
      whyItApplies: input.isDualEligible
        ? 'You are dual-eligible (Medicare + Medicaid), which qualifies you for a monthly SEP.'
        : 'You receive the Low-Income Subsidy (Extra Help), qualifying you for a monthly SEP.',
      allowedActions: input.isDualEligible
        ? 'Enroll in or switch Part D or certain MA plans once per month. Note: some MA-only plans may not be available through this SEP.'
        : 'Switch Part D plans or MA-PD plans once per month.',
      limitedUse: false,
      strategicGuidance: 'This SEP is ongoing and can be used monthly. Use time-limited SEPs first to preserve maximum flexibility.',
      warning: input.isDualEligible
        ? 'This SEP may not allow enrollment in all Medicare Advantage plans — only D-SNP or MA-PD plans may be available.'
        : undefined,
    });
  }

  // ── Move SEP ──
  if (input.hasMovedRecently) {
    const moveDate = makeDate(input.moveDate);
    if (moveDate) {
      const sepEnd = endOfMonth(addMonths(moveDate, 2));
      const active = isWithinInterval(today, { start: moveDate, end: sepEnd });
      const expired = today > sepEnd;
      const remaining = active ? daysUntil(today, sepEnd) : null;

      if (!expired) {
        results.push({
          id: 'sep-move',
          name: 'Special Enrollment Period – Permanent Move',
          status: active ? (remaining !== null && remaining <= 30 ? 'Available Now – Expires Soon' : 'Available Now') : 'Future Option',
          tier: active ? 1 : 4,
          isActive: active,
          isFuture: !active,
          isExpired: false,
          isOneTimeUse: true,
          startDate: moveDate,
          endDate: sepEnd,
          daysRemaining: remaining,
          effectiveDateRule: 'Coverage begins the 1st of the month after the plan receives the enrollment.',
          whyItApplies: `You permanently moved on ${format(moveDate, 'MM/dd/yyyy')}, which triggers a SEP lasting approximately 2 months.`,
          allowedActions: 'Enroll in or switch MA, MA-PD, or Part D plans available in your new service area.',
          limitedUse: true,
          strategicGuidance: active
            ? 'This SEP has a short window — prioritize using it before it expires. Other options like OEP or AEP remain available after.'
            : 'This SEP will become active on your move date.',
        });
      }
    }
  }

  // ── Loss of Coverage SEP ──
  if (input.hasLostCoverage) {
    const lossDate = makeDate(input.coverageLossDate);
    if (lossDate) {
      const sepEnd = endOfMonth(addMonths(lossDate, 2));
      const active = isWithinInterval(today, { start: addMonths(lossDate, -2), end: sepEnd });
      const expired = today > sepEnd;
      const remaining = active ? daysUntil(today, sepEnd) : null;

      if (!expired) {
        results.push({
          id: 'sep-loss',
          name: 'Special Enrollment Period – Loss of Coverage',
          status: active ? (remaining !== null && remaining <= 30 ? 'Available Now – Expires Soon' : 'Available Now') : 'Future Option',
          tier: active ? 1 : 4,
          isActive: active,
          isFuture: !active,
          isExpired: false,
          isOneTimeUse: true,
          startDate: addMonths(lossDate, -2),
          endDate: sepEnd,
          daysRemaining: remaining,
          effectiveDateRule: 'Coverage begins the 1st of the month after the plan receives the enrollment, or the 1st of the month of loss if enrolled before the loss date.',
          whyItApplies: `You are losing or lost coverage on ${format(lossDate, 'MM/dd/yyyy')}.`,
          allowedActions: 'Enroll in MA, MA-PD, or Part D plans.',
          limitedUse: true,
          strategicGuidance: active
            ? 'Use this SEP promptly to avoid a gap in coverage.'
            : 'This SEP will open 2 months before your coverage loss date.',
        });
      }
    }
  }

  // ── Chronic Condition SEP ──
  if (input.hasChronicCondition) {
    results.push({
      id: 'sep-chronic',
      name: 'Special Enrollment Period – Chronic Condition (C-SNP)',
      status: 'Available Now – Ongoing',
      tier: 3,
      isActive: true,
      isFuture: false,
      isExpired: false,
      isOneTimeUse: false,
      startDate: null,
      endDate: null,
      daysRemaining: null,
      effectiveDateRule: 'Coverage begins the 1st of the month after the plan receives the enrollment.',
      whyItApplies: 'You have a qualifying chronic condition, enabling enrollment in a Chronic Condition SNP at any time.',
      allowedActions: 'Enroll in a C-SNP plan that covers your condition.',
      limitedUse: false,
      strategicGuidance: 'This SEP is ongoing. Use time-limited options first if available.',
    });
  }

  // ── Institutionalized SEP ──
  if (input.isInstitutionalized) {
    results.push({
      id: 'sep-institutional',
      name: 'Special Enrollment Period – Institutionalized',
      status: 'Available Now – Ongoing',
      tier: 3,
      isActive: true,
      isFuture: false,
      isExpired: false,
      isOneTimeUse: false,
      startDate: null,
      endDate: null,
      daysRemaining: null,
      effectiveDateRule: 'Coverage begins the 1st of the month after the plan receives the enrollment.',
      whyItApplies: 'You live in or have recently moved out of an institution (e.g., nursing facility).',
      allowedActions: 'Enroll in, disenroll from, or switch MA or Part D plans at any time.',
      limitedUse: false,
      strategicGuidance: 'This SEP is ongoing. Prioritize any time-limited SEPs first.',
    });
  }

  // ── Sort by tier, then by days remaining (soonest first) ──
  results.sort((a, b) => {
    if (a.tier !== b.tier) return a.tier - b.tier;
    const aDays = a.daysRemaining ?? Infinity;
    const bDays = b.daysRemaining ?? Infinity;
    return aDays - bDays;
  });

  // Filter out expired / informational if desired — keep them for display
  return results;
}
