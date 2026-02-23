import { DollarSign, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { Commission } from "@/lib/data";

interface SummaryCardsProps {
  commissions: Commission[];
}

const SummaryCards = ({ commissions }: SummaryCardsProps) => {
  const total = commissions.reduce((sum, c) => sum + c.commissionAmount, 0);
  const paid = commissions.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.commissionAmount, 0);
  const pending = commissions.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.commissionAmount, 0);
  const clawbacks = commissions.filter(c => c.status === 'clawback').reduce((sum, c) => sum + c.commissionAmount, 0);

  const cards = [
    { label: 'Total Commissions', value: total, icon: DollarSign, className: 'bg-primary text-primary-foreground' },
    { label: 'Paid', value: paid, icon: CheckCircle2, className: 'bg-card text-success' },
    { label: 'Pending', value: pending, icon: Clock, className: 'bg-card text-warning' },
    { label: 'Clawbacks', value: clawbacks, icon: AlertTriangle, className: 'bg-card text-destructive' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(card => (
        <div
          key={card.label}
          className={`rounded-xl p-5 shadow-sm border border-border ${card.className}`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className={`text-sm font-medium ${card.label === 'Total Commissions' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
              {card.label}
            </span>
            <card.icon className="h-5 w-5 opacity-70" />
          </div>
          <p className="text-2xl font-display font-bold">
            ${card.value.toLocaleString()}
          </p>
          <p className={`text-xs mt-1 ${card.label === 'Total Commissions' ? 'text-primary-foreground/50' : 'text-muted-foreground'}`}>
            {commissions.filter(c =>
              card.label === 'Total Commissions' ? true :
              card.label === 'Paid' ? c.status === 'paid' :
              card.label === 'Pending' ? c.status === 'pending' :
              c.status === 'clawback'
            ).length} entries
          </p>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
