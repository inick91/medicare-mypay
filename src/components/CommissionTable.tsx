import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CheckCircle2, Clock, AlertTriangle, ChevronDown } from "lucide-react";
import { Commission } from "@/lib/data";

interface CommissionTableProps {
  commissions: Commission[];
  onStatusChange: (id: string, status: Commission['status']) => void;
}

const statusStyles: Record<Commission['status'], string> = {
  paid: 'bg-success/10 text-success border-success/20',
  pending: 'bg-warning/10 text-warning-foreground border-warning/20',
  clawback: 'bg-destructive/10 text-destructive border-destructive/20',
};

const statusOptions: { value: Commission['status']; label: string; icon: typeof CheckCircle2 }[] = [
  { value: 'pending', label: 'Pending', icon: Clock },
  { value: 'paid', label: 'Paid', icon: CheckCircle2 },
  { value: 'clawback', label: 'Clawback', icon: AlertTriangle },
];

const CommissionTable = ({ commissions, onStatusChange }: CommissionTableProps) => {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="font-semibold text-foreground">Agent</TableHead>
            <TableHead className="font-semibold text-foreground">Policy #</TableHead>
            <TableHead className="font-semibold text-foreground">Carrier</TableHead>
            <TableHead className="font-semibold text-foreground">Plan Type</TableHead>
            <TableHead className="font-semibold text-foreground">Enrolled</TableHead>
            <TableHead className="font-semibold text-foreground text-right">Amount</TableHead>
            <TableHead className="font-semibold text-foreground">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {commissions.map((c) => (
            <TableRow key={c.id} className="hover:bg-muted/30">
              <TableCell className="font-medium">{c.agentName}</TableCell>
              <TableCell className="font-mono text-sm text-muted-foreground">{c.policyNumber}</TableCell>
              <TableCell>{c.carrier}</TableCell>
              <TableCell>{c.planType}</TableCell>
              <TableCell className="text-muted-foreground">
                {new Date(c.enrollmentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </TableCell>
              <TableCell className="text-right font-semibold">${c.commissionAmount.toLocaleString()}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="focus:outline-none group flex items-center gap-1">
                      <Badge variant="outline" className={`${statusStyles[c.status]} cursor-pointer group-hover:shadow-md transition-all pr-1.5`}>
                        <span className="flex items-center gap-1.5">
                          {c.status === 'paid' && <CheckCircle2 className="h-3 w-3" />}
                          {c.status === 'pending' && <Clock className="h-3 w-3" />}
                          {c.status === 'clawback' && <AlertTriangle className="h-3 w-3" />}
                          {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                          <ChevronDown className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                        </span>
                      </Badge>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-36">
                    {statusOptions.map(opt => (
                      <DropdownMenuItem
                        key={opt.value}
                        onClick={() => onStatusChange(c.id, opt.value)}
                        className={c.status === opt.value ? 'font-semibold' : ''}
                      >
                        <opt.icon className="h-4 w-4 mr-2" />
                        {opt.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
          {commissions.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                No commission entries found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default CommissionTable;
