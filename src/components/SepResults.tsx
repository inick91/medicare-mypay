import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { EnrollmentPeriodResult } from '@/lib/sep-rules';
import { format } from 'date-fns';
import { AlertTriangle, Calendar, Clock, Info, Shield, Star } from 'lucide-react';

const STATUS_BADGE_CLASSES: Record<string, string> = {
  'Available Now': 'bg-success text-success-foreground',
  'Available Now – Limited Use': 'bg-warning text-warning-foreground',
  'Available Now – Expires Soon': 'bg-destructive text-destructive-foreground',
  'Available Now – Ongoing': 'bg-accent text-accent-foreground',
  'Future Option': 'bg-secondary text-secondary-foreground',
  'Informational Only': 'bg-muted text-muted-foreground',
};

const TIER_ICON: Record<number, React.ReactNode> = {
  1: <Star className="h-4 w-4 text-destructive" />,
  2: <Star className="h-4 w-4 text-warning" />,
  3: <Clock className="h-4 w-4 text-accent" />,
  4: <Calendar className="h-4 w-4 text-muted-foreground" />,
  5: <Info className="h-4 w-4 text-muted-foreground" />,
};

interface Props {
  results: EnrollmentPeriodResult[];
}

export default function SepResults({ results }: Props) {
  const recommended = results.filter(r => r.isActive && r.tier <= 2);
  const otherActive = results.filter(r => r.isActive && r.tier > 2);
  const future = results.filter(r => r.isFuture);
  const expired = results.filter(r => r.isExpired);

  const renderCard = (ep: EnrollmentPeriodResult, isTop: boolean) => (
    <Card key={ep.id} className={isTop ? 'border-primary/40 shadow-md' : ''}>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {TIER_ICON[ep.tier]}
            <CardTitle className="text-base">{ep.name}</CardTitle>
          </div>
          <Badge className={STATUS_BADGE_CLASSES[ep.status] ?? 'bg-muted text-muted-foreground'}>
            {ep.status}
          </Badge>
        </div>
        {ep.daysRemaining !== null && ep.isActive && (
          <p className="text-sm font-medium text-muted-foreground mt-1">
            {ep.daysRemaining === 0 ? 'Expires today' : `${ep.daysRemaining} day${ep.daysRemaining === 1 ? '' : 's'} remaining`}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {ep.warning && (
          <Alert variant="destructive" className="bg-warning/10 border-warning text-warning-foreground">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">{ep.warning}</AlertDescription>
          </Alert>
        )}

        <Accordion type="single" collapsible>
          <AccordionItem value="details" className="border-none">
            <AccordionTrigger className="text-sm py-2 hover:no-underline">View Details</AccordionTrigger>
            <AccordionContent>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="font-semibold flex items-center gap-1"><Info className="h-3.5 w-3.5" /> Why It Applies</dt>
                  <dd className="text-muted-foreground ml-5">{ep.whyItApplies}</dd>
                </div>
                <div>
                  <dt className="font-semibold flex items-center gap-1"><Shield className="h-3.5 w-3.5" /> Allowed Actions</dt>
                  <dd className="text-muted-foreground ml-5">{ep.allowedActions}</dd>
                </div>
                {ep.startDate && ep.endDate && (
                  <div>
                    <dt className="font-semibold flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Window</dt>
                    <dd className="text-muted-foreground ml-5">
                      {format(ep.startDate, 'MMM d, yyyy')} – {format(ep.endDate, 'MMM d, yyyy')}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="font-semibold">Effective Date Rule</dt>
                  <dd className="text-muted-foreground ml-5">{ep.effectiveDateRule}</dd>
                </div>
                <div>
                  <dt className="font-semibold">Limited Use?</dt>
                  <dd className="text-muted-foreground ml-5">{ep.limitedUse ? 'Yes — can only be used once' : 'No — can be used repeatedly'}</dd>
                </div>
                <div>
                  <dt className="font-semibold flex items-center gap-1"><Star className="h-3.5 w-3.5" /> Strategic Guidance</dt>
                  <dd className="text-muted-foreground ml-5 italic">{ep.strategicGuidance}</dd>
                </div>
              </dl>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Recommended */}
      {recommended.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Recommended — Use First
          </h2>
          <p className="text-sm text-muted-foreground">
            These enrollment periods expire soonest. Using them first preserves your longer-lasting options.
          </p>
          <div className="grid gap-4">
            {recommended.map(r => renderCard(r, true))}
          </div>
        </section>
      )}

      {/* Other active */}
      {otherActive.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Other Available Options</h2>
          <div className="grid gap-4">
            {otherActive.map(r => renderCard(r, false))}
          </div>
        </section>
      )}

      {/* Future */}
      {future.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-muted-foreground">Future Enrollment Periods</h2>
          <div className="grid gap-4">
            {future.map(r => renderCard(r, false))}
          </div>
        </section>
      )}

      {/* Expired / Informational */}
      {expired.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-muted-foreground">Expired / Informational</h2>
          <div className="grid gap-4 opacity-60">
            {expired.map(r => renderCard(r, false))}
          </div>
        </section>
      )}

      {results.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No results yet. Fill in the beneficiary information and click "Find Enrollment Periods."
          </CardContent>
        </Card>
      )}
    </div>
  );
}
