import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { Commission } from "@/lib/data";

interface AddCommissionDialogProps {
  onAdd: (commission: Commission) => void;
}

const AddCommissionDialog = ({ onAdd }: AddCommissionDialogProps) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    agentName: '',
    policyNumber: '',
    carrier: '',
    planType: '' as Commission['planType'],
    enrollmentDate: '',
    commissionAmount: '',
    status: 'pending' as Commission['status'],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      id: crypto.randomUUID(),
      ...form,
      commissionAmount: parseFloat(form.commissionAmount),
    });
    setForm({ agentName: '', policyNumber: '', carrier: '', planType: '' as Commission['planType'], enrollmentDate: '', commissionAmount: '', status: 'pending' });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Commission
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Add Commission Entry</DialogTitle>
        </DialogHeader>
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Carrier</Label>
              <Input required value={form.carrier} onChange={e => setForm(f => ({ ...f, carrier: e.target.value }))} placeholder="Humana" />
            </div>
            <div className="space-y-2">
              <Label>Plan Type</Label>
              <Select required value={form.planType} onValueChange={v => setForm(f => ({ ...f, planType: v as Commission['planType'] }))}>
                <SelectTrigger><SelectValue placeholder="Select plan" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Medicare Advantage">Medicare Advantage</SelectItem>
                  <SelectItem value="Medicare Supplement">Medicare Supplement</SelectItem>
                  <SelectItem value="Part D">Part D</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Enrollment Date</Label>
              <Input required type="date" value={form.enrollmentDate} onChange={e => setForm(f => ({ ...f, enrollmentDate: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Commission Amount ($)</Label>
              <Input required type="number" step="0.01" min="0" value={form.commissionAmount} onChange={e => setForm(f => ({ ...f, commissionAmount: e.target.value }))} placeholder="601" />
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
          <Button type="submit" className="w-full">Add Entry</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddCommissionDialog;
