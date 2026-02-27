import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Settings, Loader2 } from "lucide-react";

import SummaryCards from "@/components/SummaryCards";
import CommissionTable from "@/components/CommissionTable";
import CommissionFormDialog from "@/components/CommissionFormDialog";
import { Commission } from "@/lib/data";

const mapRow = (row: any): Commission => ({
  id: String(row.id),
  agentName: String(row.agent_name ?? ""),
  policyNumber: String(row.policy_number ?? ""),
  carrier: String(row.carrier ?? ""),
  planType: String(row.plan_type ?? "") as Commission["planType"],
  planName: row.plan_name ?? undefined,
  enrollmentDate: String(row.enrollment_date ?? ""),
  commissionAmount: Number(row.commission_amount ?? 0),
  status: (row.status as Commission["status"]) ?? "pending",
  paidDate: row.paid_date ? String(row.paid_date) : undefined,
  notes: row.notes ?? undefined,
});

const Index = () => {
  const navigate = useNavigate();

  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingCommission, setEditingCommission] = useState<Commission | null>(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);

      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error("Auth error:", authError);
        setLoading(false);
        return;
      }

      const userId = authData.user?.id;
      if (!userId) {
        setCommissions([]);
        setLoading(false);
        return;
      }

      const { data, error } = await (supabase
        .from("commissions")
        .select("*") as any)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Fetch commissions error:", error);
        setLoading(false);
        return;
      }

      if (data) setCommissions(data.map(mapRow));
      setLoading(false);
    };

    fetch();
  }, []);

  const filtered = commissions.filter((c) => {
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;

    const matchesSearch =
      search === "" ||
      c.agentName.toLowerCase().includes(search.toLowerCase()) ||
      c.policyNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.carrier.toLowerCase().includes(search.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const handleSubmit = async (commission: Commission) => {
    if (editingCommission) {
      const { data, error } = await supabase
        .from("commissions")
        .update({
          agent_name: commission.agentName,
          policy_number: commission.policyNumber,
          carrier: commission.carrier,
          plan_type: commission.planType,
          plan_name: commission.planName ?? null,
          enrollment_date: commission.enrollmentDate,
          commission_amount: commission.commissionAmount,
          status: commission.status,
          ...(commission.status === "paid" && commission.paidDate
            ? { paid_date: commission.paidDate }
            : {}),
        })
        .eq("id", commission.id)
        .select()
        .single();

      if (error) {
        console.error("Update commission error:", error);
        return;
      }

      if (data) {
        setCommissions((prev) => prev.map((c) => (c.id === commission.id ? mapRow(data) : c)));
      }
    } else {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error("Auth error:", authError);
        return;
      }

      const userId = authData.user?.id;
      if (!userId) {
        console.error("No user session found");
        return;
      }

      const { data, error } = await (supabase
        .from("commissions")
        .insert({
          user_id: userId,
          agent_name: commission.agentName,
          policy_number: commission.policyNumber,
          carrier: commission.carrier,
          plan_type: commission.planType,
          plan_name: commission.planName ?? null,
          enrollment_date: commission.enrollmentDate,
          commission_amount: commission.commissionAmount,
          status: commission.status,
        } as any))
        .select()
        .single();

      if (error) {
        console.error("Insert commission error:", error);
        return;
      }

      if (data) setCommissions((prev) => [mapRow(data), ...prev]);
    }

    setEditingCommission(null);
  };

  const handleEdit = (commission: Commission) => {
    setEditingCommission(commission);
    setFormOpen(true);
  };

  const handleStatusChange = async (id: string, status: Commission["status"]) => {
    const { data, error } = await supabase
      .from("commissions")
      .update({
        status,
        ...(status === "paid" ? { paid_date: new Date().toISOString().split("T")[0] } : {}),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Update status error:", error);
      return;
    }

    if (data) setCommissions((prev) => prev.map((c) => (c.id === id ? mapRow(data) : c)));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-display font-bold text-foreground tracking-tight">
              Medicare Commission Tracker
            </h1>
            <p className="text-sm text-muted-foreground">Track and manage agent commission payments</p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate("/login");
              }}
            >
              Log out
            </Button>

            <Link to="/rates">
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>

            <Button
              className="gap-2"
              onClick={() => {
                setEditingCommission(null);
                setFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Add Commission
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <SummaryCards commissions={commissions} />

        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search agent, policy, or carrier..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="clawback">Clawback</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <CommissionTable commissions={filtered} onStatusChange={handleStatusChange} onEdit={handleEdit} />
      </main>

      <CommissionFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingCommission(null);
        }}
        onSubmit={handleSubmit}
        editingCommission={editingCommission}
      />
    </div>
  );
};

export default Index;
