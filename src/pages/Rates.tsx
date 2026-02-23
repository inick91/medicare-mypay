import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { Plus, Pencil, Trash2, Settings, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { CommissionRate, PLAN_TYPES, DEFAULT_CARRIERS, sampleRates } from "@/lib/data";

const RatesPage = () => {
  const [rates, setRates] = useState<CommissionRate[]>(sampleRates);
  const [formOpen, setFormOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<CommissionRate | null>(null);
  const [form, setForm] = useState({ carrier: '', planType: '' as CommissionRate['planType'], amount: '' });

  const openAdd = () => {
    setEditingRate(null);
    setForm({ carrier: '', planType: '' as CommissionRate['planType'], amount: '' });
    setFormOpen(true);
  };

  const openEdit = (rate: CommissionRate) => {
    setEditingRate(rate);
    setForm({ carrier: rate.carrier, planType: rate.planType, amount: String(rate.amount) });
    setFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entry: CommissionRate = {
      id: editingRate?.id ?? crypto.randomUUID(),
      carrier: form.carrier,
      planType: form.planType,
      amount: parseFloat(form.amount),
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
              <p className="text-sm text-muted-foreground">Set default commission amounts per carrier and plan type</p>
            </div>
          </div>
          <Button className="gap-2" onClick={openAdd}>
            <Plus className="h-4 w-4" />
            Add Rate
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
              Add Your First Rate
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
                      <TableHead className="font-semibold text-foreground">Plan Type</TableHead>
                      <TableHead className="font-semibold text-foreground text-right">Commission Amount</TableHead>
                      <TableHead className="font-semibold text-foreground w-[100px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {carrierRates.map(rate => (
                      <TableRow key={rate.id} className="hover:bg-muted/30">
                        <TableCell>{rate.planType}</TableCell>
                        <TableCell className="text-right font-semibold">${rate.amount.toLocaleString()}</TableCell>
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
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">{editingRate ? 'Edit' : 'Add'} Commission Rate</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
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
              <Select required value={form.planType} onValueChange={v => setForm(f => ({ ...f, planType: v as CommissionRate['planType'] }))}>
                <SelectTrigger><SelectValue placeholder="Select plan type" /></SelectTrigger>
                <SelectContent>
                  {PLAN_TYPES.map(pt => (
                    <SelectItem key={pt} value={pt}>{pt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Commission Amount ($)</Label>
              <Input required type="number" step="0.01" min="0" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="601" />
            </div>
            <Button type="submit" className="w-full">{editingRate ? 'Save Changes' : 'Add Rate'}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RatesPage;
