import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Commission, CommissionRate, PLAN_TYPES, DEFAULT_CARRIERS, CMS_2026_RATES } from "@/lib/data";
import { useRates } from "@/contexts/RatesContext";
import { Plus, Ban } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface CommissionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (commission: Commission) => void;
  editingCommission?: Commission | null;
}

const emptyForm = {
  agentName: '',
  policyNumber: '',
  selectedRateId: '',
  enrollmentDate: '',
  commissionAmount: '',
  status: 'pending' as Commission['status'],
};

const emptyNewPlan = {
  carrier: '',
  planType: '' as CommissionRate['planType'],
  planName: '',
  initialAmount: '',
  renewalAmount: '',
  nonCommissionable: false,
};

const CommissionFormDialog = ({ open, onOpenChange, onSubmit, editingCommission }: CommissionFormDialogProps) => {
  const { rates, addRate } = useRates();
  const [form, setForm] = useState(emptyForm);
  const [addingNewPlan, setAddingNewPlan] = useState(false);
  const [newPlan, setNewPlan] = useState(emptyNewPlan);
  const isEditing = !!editingCommission;

  useEffect(() => {
    if (editingCommission) {
      // Find matching rate
      const matchingRate = rates.find(
        r => r.carrier === editingCommission.carrier && r.planName === editingCommission.planName
      );
      setForm({
        agentName: editingCommission.agentName,
        policyNumber: editingCommission.policyNumber,
        selectedRateId: matchingRate?.id ?? '',
        enrollmentDate: editingCommission.enrollmentDate,
        commissionAmount: String(editingCommission.commissionAmount),
        status: editingCommission.status,
      });
    } else {
      setForm(emptyForm);
    }
    setAddingNewPlan(false);
    setNewPlan(emptyNewPlan);
  }, [editingCommission, open, rates]);

  const selectedRate = rates.find(r => r.id === form.selectedRateId);

  const handlePlanSelect = (rateId: string) => {
    const rate = rates.find(r => r.id === rateId);
    if (rate) {
      setForm(f => ({
        ...f,
        selectedRateId: rateId,
        commissionAmount: String(rate.initialAmount),
      }));
    }
  };

  const handleNewPlanTypeChange = (planType: CommissionRate['planType']) => {
    const defaults = CMS_2026_RATES[planType];
    setNewPlan(f => ({
      ...f,
      planType,
      ...(defaults && !f.nonCommissionable
        ? { initialAmount: String(defaults.initial), renewalAmount: String(defaults.renewal) }
        : {}),
    }));
  };

  const handleNewPlanNonCommToggle = (checked: boolean) => {
    setNewPlan(f => ({
      ...f,
      nonCommissionable: checked,
      ...(checked ? { initialAmount: '0', renewalAmount: '0' } : (() => {
        const defaults = CMS_2026_RATES[f.planType];
        return defaults ? { initialAmount: String(defaults.initial), renewalAmount: String(defaults.renewal) } : {};
      })()),
    }));
  };

  const handleAddNewPlan = async () => {
    const entry = {
      carrier: newPlan.carrier,
      planType: newPlan.planType,
      planName: newPlan.planName,
      initialAmount: newPlan.nonCommissionable ? 0 : parseFloat(newPlan.initialAmount || '0'),
      renewalAmount: newPlan.nonCommissionable ? 0 : parseFloat(newPlan.renewalAmount || '0'),
      nonCommissionable: newPlan.nonCommissionable,
    };
    await addRate(entry);
    // After adding, the rates list will update; find the newly added rate
    setAddingNewPlan(false);
    setNewPlan(emptyNewPlan);
  };

  // After rates update from addRate, auto-select the newest matching plan
  useEffect(() => {
    if (!addingNewPlan && newPlan.planName === '' && rates.length > 0) {
      // Check if we just added a plan and need to select it
      const lastRate = rates[rates.length - 1];
      if (lastRate && form.selectedRateId === '' && !isEditing) {
        // Don't auto-select on initial load
      }
    }
  }, [rates]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRate) return;
    onSubmit({
      id: editingCommission?.id ?? crypto.randomUUID(),
      agentName: form.agentName,
      policyNumber: form.policyNumber,
      carrier: selectedRate.carrier,
      planType: selectedRate.planType,
      planName: selectedRate.planName,
      enrollmentDate: form.enrollmentDate,
      commissionAmount: parseFloat(form.commissionAmount),
      status: form.status,
    });
    setForm(emptyForm);
    onOpenChange(false);
  };

  // Group rates by carrier for the dropdown
  const carriers = [...new Set(rates.map(r => r.carrier))].sort();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">{isEditing ? 'Edit' : 'Add'} Commission Entry</DialogTitle>
        </DialogHeader>

        {addingNewPlan ? (
          <div className="space-y-4 mt-2">
            <p className="text-sm text-muted-foreground">Add a new plan to the commission rates database.</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Carrier</Label>
                <Input required value={newPlan.carrier} onChange={e => setNewPlan(f => ({ ...f, carrier: e.target.value }))} placeholder="e.g. Humana" list="new-carrier-suggestions" />
                <datalist id="new-carrier-suggestions">
                  {DEFAULT_CARRIERS.map(c => <option key={c} value={c} />)}
                </datalist>
              </div>
              <div className="space-y-2">
                <Label>Plan Type</Label>
                <Select value={newPlan.planType} onValueChange={handleNewPlanTypeChange}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {PLAN_TYPES.map(pt => <SelectItem key={pt} value={pt}>{pt}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Plan Name</Label>
              <Input required value={newPlan.planName} onChange={e => setNewPlan(f => ({ ...f, planName: e.target.value }))} placeholder="e.g. Humana Gold Plus H1036-040" />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3 bg-muted/30">
              <div>
                <Label className="text-sm font-medium">Non-Commissionable</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Commission is $0</p>
              </div>
              <Switch checked={newPlan.nonCommissionable} onCheckedChange={handleNewPlanNonCommToggle} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Initial ($)</Label>
                <Input type="number" step="0.01" min="0" value={newPlan.nonCommissionable ? '0' : newPlan.initialAmount} onChange={e => setNewPlan(f => ({ ...f, initialAmount: e.target.value }))} disabled={newPlan.nonCommissionable} className={newPlan.nonCommissionable ? 'opacity-50' : ''} />
              </div>
              <div className="space-y-2">
                <Label>Renewal ($)</Label>
                <Input type="number" step="0.01" min="0" value={newPlan.nonCommissionable ? '0' : newPlan.renewalAmount} onChange={e => setNewPlan(f => ({ ...f, renewalAmount: e.target.value }))} disabled={newPlan.nonCommissionable} className={newPlan.nonCommissionable ? 'opacity-50' : ''} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setAddingNewPlan(false)}>Cancel</Button>
              <Button type="button" className="flex-1" onClick={handleAddNewPlan} disabled={!newPlan.carrier || !newPlan.planType || !newPlan.planName}>Save Plan</Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Agent Name</Label>
                <Input required value={form.agentName} onChange={e => setForm(f => ({ ...f, agentName: e.target.value }))} placeholder="Jane Doe" />
              </div>
              <div className="space-y-2">
                <Label>Policy Number</Label>
                <Input required value={form.policyNumber} onChange={e => setForm(f => ({ ...f, policyNumber: e.target.value }))} placeholder="MA-2025-00001" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center justify-between">
                Plan
                <Button type="button" variant="link" size="sm" className="h-auto p-0 text-xs gap-1" onClick={() => setAddingNewPlan(true)}>
                  <Plus className="h-3 w-3" />
                  Add New Plan
                </Button>
              </Label>
              <Select required value={form.selectedRateId} onValueChange={handlePlanSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a plan" />
                </SelectTrigger>
                <SelectContent>
                  {carriers.map(carrier => (
                    <div key={carrier}>
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">{carrier}</div>
                      {rates.filter(r => r.carrier === carrier).map(rate => (
                        <SelectItem key={rate.id} value={rate.id}>
                          <span className="flex items-center gap-2">
                            {rate.planName}
                            {rate.nonCommissionable && (
                              <Badge variant="outline" className="text-[10px] px-1 py-0 bg-muted/50 text-muted-foreground border-muted-foreground/20 gap-0.5">
                                <Ban className="h-2.5 w-2.5" />
                                $0
                              </Badge>
                            )}
                          </span>
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
              {selectedRate && (
                <p className="text-xs text-muted-foreground">
                  {selectedRate.carrier} · {selectedRate.planType}
                  {selectedRate.nonCommissionable ? ' · Non-commissionable' : ` · Initial: $${selectedRate.initialAmount}`}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Enrollment Date</Label>
                <Input required type="date" value={form.enrollmentDate} onChange={e => setForm(f => ({ ...f, enrollmentDate: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Commission Amount ($)</Label>
                <Input
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.commissionAmount}
                  onChange={e => setForm(f => ({ ...f, commissionAmount: e.target.value }))}
                  placeholder="601"
                  disabled={selectedRate?.nonCommissionable}
                  className={selectedRate?.nonCommissionable ? 'opacity-50' : ''}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as Commission['status'] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="clawback">Clawback</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={!form.selectedRateId}>
              {isEditing ? 'Save Changes' : 'Add Entry'}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CommissionFormDialog;
