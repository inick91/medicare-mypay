import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { CommissionRate } from "@/lib/data";
import { supabase } from "@/integrations/supabase/client";

interface RatesContextType {
  rates: CommissionRate[];
  loading: boolean;
  addRate: (rate: Omit<CommissionRate, 'id'>) => Promise<void>;
  updateRate: (rate: CommissionRate) => Promise<void>;
  deleteRate: (id: string) => Promise<void>;
}

const RatesContext = createContext<RatesContextType | undefined>(undefined);

const mapRow = (row: any): CommissionRate => ({
  id: row.id,
  carrier: row.carrier,
  planType: row.plan_type,
  planName: row.plan_name,
  initialAmount: Number(row.initial_amount),
  renewalAmount: Number(row.renewal_amount),
  nonCommissionable: row.non_commissionable,
});

export const RatesProvider = ({ children }: { children: ReactNode }) => {
  const [rates, setRates] = useState<CommissionRate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRates = async () => {
    const { data } = await supabase.from("commission_rates").select("*").order("carrier");
    if (data) setRates(data.map(mapRow));
    setLoading(false);
  };

  useEffect(() => { fetchRates(); }, []);

  const addRate = async (rate: Omit<CommissionRate, 'id'>) => {
    const { data } = await supabase.from("commission_rates").insert({
      carrier: rate.carrier,
      plan_type: rate.planType,
      plan_name: rate.planName,
      initial_amount: rate.initialAmount,
      renewal_amount: rate.renewalAmount,
      non_commissionable: rate.nonCommissionable,
    }).select().single();
    if (data) setRates(prev => [...prev, mapRow(data)]);
  };

  const updateRate = async (rate: CommissionRate) => {
    const { data } = await supabase.from("commission_rates").update({
      carrier: rate.carrier,
      plan_type: rate.planType,
      plan_name: rate.planName,
      initial_amount: rate.initialAmount,
      renewal_amount: rate.renewalAmount,
      non_commissionable: rate.nonCommissionable,
    }).eq("id", rate.id).select().single();
    if (data) setRates(prev => prev.map(r => r.id === rate.id ? mapRow(data) : r));
  };

  const deleteRate = async (id: string) => {
    await supabase.from("commission_rates").delete().eq("id", id);
    setRates(prev => prev.filter(r => r.id !== id));
  };

  return (
    <RatesContext.Provider value={{ rates, loading, addRate, updateRate, deleteRate }}>
      {children}
    </RatesContext.Provider>
  );
};

export const useRates = () => {
  const ctx = useContext(RatesContext);
  if (!ctx) throw new Error("useRates must be used within RatesProvider");
  return ctx;
};
