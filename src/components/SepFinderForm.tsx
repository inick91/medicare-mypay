import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { SepFinderInput } from '@/lib/sep-rules';
import { Search } from 'lucide-react';

interface Props {
  onSubmit: (input: SepFinderInput) => void;
}

export default function SepFinderForm({ onSubmit }: Props) {
  const [partA, setPartA] = useState('');
  const [turning65, setTurning65] = useState('');
  const [isDual, setIsDual] = useState(false);
  const [isLIS, setIsLIS] = useState(false);
  const [moved, setMoved] = useState(false);
  const [moveDate, setMoveDate] = useState('');
  const [lostCoverage, setLostCoverage] = useState(false);
  const [lossDate, setLossDate] = useState('');
  const [chronic, setChronic] = useState(false);
  const [institutionalized, setInstitutionalized] = useState(false);
  const [usedOep, setUsedOep] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      today: new Date(),
      partAEffectiveDate: partA,
      turning65Date: turning65,
      isDualEligible: isDual,
      isLIS,
      hasMovedRecently: moved,
      moveDate,
      hasLostCoverage: lostCoverage,
      coverageLossDate: lossDate,
      hasChronicCondition: chronic,
      isInstitutionalized: institutionalized,
      usedOep,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Beneficiary Information</CardTitle>
        <CardDescription>Enter the beneficiary's details to find all available enrollment periods.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dates */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="partA">Part A Effective Date</Label>
              <Input id="partA" type="date" value={partA} onChange={e => setPartA(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="turn65">Turning 65 Date <span className="text-muted-foreground text-xs">(leave blank if already 65+)</span></Label>
              <Input id="turn65" type="date" value={turning65} onChange={e => setTurning65(e.target.value)} />
            </div>
          </div>

          {/* Toggles */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label htmlFor="dual" className="cursor-pointer">Dual Eligible (Medicare + Medicaid)</Label>
              <Switch id="dual" checked={isDual} onCheckedChange={setIsDual} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label htmlFor="lis" className="cursor-pointer">LIS / Extra Help</Label>
              <Switch id="lis" checked={isLIS} onCheckedChange={setIsLIS} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label htmlFor="chronic" className="cursor-pointer">Chronic Condition (C-SNP eligible)</Label>
              <Switch id="chronic" checked={chronic} onCheckedChange={setChronic} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label htmlFor="inst" className="cursor-pointer">Institutionalized</Label>
              <Switch id="inst" checked={institutionalized} onCheckedChange={setInstitutionalized} />
            </div>
          </div>

          {/* Move */}
          <div className="rounded-lg border p-3 space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="moved" className="cursor-pointer">Permanently Moved Recently</Label>
              <Switch id="moved" checked={moved} onCheckedChange={setMoved} />
            </div>
            {moved && (
              <div className="space-y-2">
                <Label htmlFor="moveDate">Move Date</Label>
                <Input id="moveDate" type="date" value={moveDate} onChange={e => setMoveDate(e.target.value)} required />
              </div>
            )}
          </div>

          {/* Loss of coverage */}
          <div className="rounded-lg border p-3 space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="lost" className="cursor-pointer">Lost or Losing Coverage</Label>
              <Switch id="lost" checked={lostCoverage} onCheckedChange={setLostCoverage} />
            </div>
            {lostCoverage && (
              <div className="space-y-2">
                <Label htmlFor="lossDate">Coverage Loss Date</Label>
                <Input id="lossDate" type="date" value={lossDate} onChange={e => setLossDate(e.target.value)} required />
              </div>
            )}
          </div>

          {/* OEP usage */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <Label htmlFor="usedOep" className="cursor-pointer">Already Used OEP This Year</Label>
            <Switch id="usedOep" checked={usedOep} onCheckedChange={setUsedOep} />
          </div>

          <Button type="submit" className="w-full" size="lg">
            <Search className="mr-2 h-4 w-4" />
            Find Enrollment Periods
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
