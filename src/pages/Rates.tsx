import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Settings, ArrowLeft, Ban } from "lucide-react";
import { Link } from "react-router-dom";
import { CommissionRate, PLAN_TYPES, DEFAULT_CARRIERS, CMS_2026_RATES } from "@/lib/data";
import SavedIndicator from "@/components/SavedIndicator";
import { useRates } from "@/contexts/RatesContext";

const RatesPage = () => {
  const { rates, setRates } = useRates();
  const [formOpen, setFormOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<CommissionRate | null>(null);
  const [form, setForm] = useState({
    carrier: '',
    planType: '' as CommissionRate['planType'],
    planName: '',
    initialAmount: '',
    renewalAmount: '',
    nonCommissionable: false,
  });

  // Saved indicator state
  const [savedId, setSavedId] = useState<string | null>(null);
  const [savedTrigger, setSavedTrigger] = useState(0);

  const openAdd = () => {
    setEditingRate(null);
    setForm({ carrier: '', planType: '' as CommissionRate['planType'], planName: '', initialAmount: '', renewalAmount: '', nonCommissionable: false });
    setFormOpen(true);
  };

  const openEdit = (rate: CommissionRate) => {
    setEditingRate(rate);
    setForm({
      carrier: rate.carrier,
      planType: rate.planType,
      planName: rate.planName,
      initialAmount: String(rate.initialAmount),
      renewalAmount: String(rate.renewalAmount),
      nonCommissionable: rate.nonCommissionable,
    });
    setFormOpen(true);
  };

  // When plan type changes, auto-fill CMS defaults
  const handlePlanTypeChange = (planType: CommissionRate['planType']) => {
    const defaults = CMS_2026_RATES[planType];
    setForm(f => ({
      ...f,
      planType,
      ...(defaults && !f.nonCommissionable
        ? { initialAmount: String(defaults.initial), renewalAmount: String(defaults.renewal) }
        : {}),
    }));
  };

  const handleNonCommissionableToggle = (checked: boolean) => {
    setForm(f => ({
      ...f,
      nonCommissionable: checked,
      ...(checked ? { initialAmount: '0', renewalAmount: '0' } : (() => {
        const defaults = CMS_2026_RATES[f.planType];
        return defaults ? { initialAmount: String(defaults.initial), renewalAmount: String(defaults.renewal) } : {};
      })()),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entry: CommissionRate = {
      id: editingRate?.id ?? crypto.randomUUID(),
      carrier: form.carrier,
      planType: form.planType,
      planName: form.planName,
      initialAmount: form.nonCommissionable ? 0 : parseFloat(form.initialAmount || '0'),
      renewalAmount: form.nonCommissionable ? 0 : parseFloat(form.renewalAmount || '0'),
      nonCommissionable: form.nonCommissionable,
    };
    if (editingRate) {
      setRates(prev => prev.map(r => r.id === entry.id ? entry : r));
    } else {
      setRates(prev => [...prev, entry]);
    }
    setFormOpen(false);
  };

  const handleDelete = (id: string) => {
    setRates(prev => prev.filter(r => r.id !== id));
  };

  // Group rates by carrier
  const carriers = [...new Set(rates.map(r => r.carrier))].sort();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-display font-bold text-foreground tracking-tight flex items-center gap-2">
                <Settings className="h-5 w-5 text-accent" />
                Commission Rates
              </h1>
              <p className="text-sm text-muted-foreground">Set commission amounts per carrier plan · CMS 2026 rates as defaults</p>
            </div>
          </div>
          <Button className="gap-2" onClick={openAdd}>
            <Plus className="h-4 w-4" />
            Add Plan
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {carriers.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <Settings className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No commission rates configured yet.</p>
            <Button className="mt-4 gap-2" onClick={openAdd}>
              <Plus className="h-4 w-4" />
              Add Your First Plan
            </Button>
          </div>
        ) : (
          carriers.map(carrier => {
            const carrierRates = rates.filter(r => r.carrier === carrier);
            return (
              <div key={carrier} className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                <div className="px-5 py-3 bg-muted/40 border-b border-border">
                  <h2 className="font-display font-semibold text-foreground">{carrier}</h2>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-semibold text-foreground">Plan Name</TableHead>
                      <TableHead className="font-semibold text-foreground">Type</TableHead>
                      <TableHead className="font-semibold text-foreground text-right">Initial</TableHead>
                      <TableHead className="font-semibold text-foreground text-right">Renewal</TableHead>
                      <TableHead className="font-semibold text-foreground w-[100px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {carrierRates.map(rate => (
                      <TableRow key={rate.id} className={`hover:bg-muted/30 ${rate.nonCommissionable ? 'opacity-60' : ''}`}>
                        <TableCell className="font-medium">
                          <span className="flex items-center gap-2">
                            {rate.planName}
                            {rate.nonCommissionable && (
                              <Badge variant="outline" className="text-xs bg-muted/50 text-muted-foreground border-muted-foreground/20 gap-1">
                                <Ban className="h-3 w-3" />
                                Non-comm.
                              </Badge>
                            )}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">{rate.planType}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {rate.nonCommissionable ? '—' : `$${rate.initialAmount.toLocaleString()}`}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {rate.nonCommissionable ? '—' : `$${rate.renewalAmount.toLocaleString()}`}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => openEdit(rate)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(rate.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            );
          })
        )}
      </main>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">{editingRate ? 'Edit' : 'Add'} Plan Commission Rate</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Carrier</Label>
                <Input
                  required
                  value={form.carrier}
                  onChange={e => setForm(f => ({ ...f, carrier: e.target.value }))}
                  placeholder="e.g. Humana"
                  list="carrier-suggestions"
                />
                <datalist id="carrier-suggestions">
                  {DEFAULT_CARRIERS.map(c => <option key={c} value={c} />)}
                </datalist>
              </div>
              <div className="space-y-2">
                <Label>Plan Type</Label>
                <Select required value={form.planType} onValueChange={handlePlanTypeChange}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {PLAN_TYPES.map(pt => (
                      <SelectItem key={pt} value={pt}>{pt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Plan Name</Label>
              <Input
                required
                value={form.planName}
                onChange={e => setForm(f => ({ ...f, planName: e.target.value }))}
                placeholder="e.g. Humana Gold Plus H1036-040"
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-3 bg-muted/30">
              <div>
                <Label className="text-sm font-medium">Non-Commissionable</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Commission is $0 and cannot be edited</p>
              </div>
              <Switch
                checked={form.nonCommissionable}
                onCheckedChange={handleNonCommissionableToggle}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center justify-between">
                  Initial ($)
                  {CMS_2026_RATES[form.planType] && !form.nonCommissionable && (
                    <span className="text-xs text-muted-foreground font-normal">CMS max: ${CMS_2026_RATES[form.planType].initial}</span>
                  )}
                </Label>
                <Input
                  required={!form.nonCommissionable}
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.nonCommissionable ? '0' : form.initialAmount}
                  onChange={e => setForm(f => ({ ...f, initialAmount: e.target.value }))}
                  placeholder="694"
                  disabled={form.nonCommissionable}
                  className={form.nonCommissionable ? 'opacity-50' : ''}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center justify-between">
                  Renewal ($)
                  {CMS_2026_RATES[form.planType] && !form.nonCommissionable && (
                    <span className="text-xs text-muted-foreground font-normal">CMS max: ${CMS_2026_RATES[form.planType].renewal}</span>
                  )}
                </Label>
                <Input
                  required={!form.nonCommissionable}
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.nonCommissionable ? '0' : form.renewalAmount}
                  onChange={e => setForm(f => ({ ...f, renewalAmount: e.target.value }))}
                  placeholder="347"
                  disabled={form.nonCommissionable}
                  className={form.nonCommissionable ? 'opacity-50' : ''}
                />
              </div>
            </div>

            <Button type="submit" className="w-full">{editingRate ? 'Save Changes' : 'Add Plan'}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RatesPage;
