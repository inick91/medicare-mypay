import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import SummaryCards from "@/components/SummaryCards";
import CommissionTable from "@/components/CommissionTable";
import AddCommissionDialog from "@/components/AddCommissionDialog";
import { Commission, sampleCommissions } from "@/lib/data";

const Index = () => {
  const [commissions, setCommissions] = useState<Commission[]>(sampleCommissions);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const filtered = commissions.filter(c => {
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    const matchesSearch = search === "" ||
      c.agentName.toLowerCase().includes(search.toLowerCase()) ||
      c.policyNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.carrier.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleAdd = (commission: Commission) => {
    setCommissions(prev => [commission, ...prev]);
  };

  const handleStatusChange = (id: string, status: Commission['status']) => {
    setCommissions(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-display font-bold text-foreground tracking-tight">
              Medicare Commission Tracker
            </h1>
            <p className="text-sm text-muted-foreground">Track and manage agent commission payments</p>
          </div>
          <AddCommissionDialog onAdd={handleAdd} />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Summary */}
        <SummaryCards commissions={commissions} />

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search agent, policy, or carrier..."
              value={search}
              onChange={e => setSearch(e.target.value)}
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

        {/* Table */}
        <CommissionTable commissions={filtered} onStatusChange={handleStatusChange} />
      </main>
    </div>
  );
};

export default Index;
