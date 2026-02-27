import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { CommissionRate } from "@/lib/data";
import { supabase } from "@/integrations/supabase/client";

interface RatesContextType {
  rates: CommissionRate[];
  loading: boolean;
  addRate: (rate: Omit<CommissionRate, "id">) => Promise<void>;
  updateRate: (rate: CommissionRate) => Promise<void>;
  deleteRate: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
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
    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error("Auth error:", authError);
      setRates([]);
      setLoading(false);
      return;
    }

    const userId = authData.user?.id;
    if (!userId) {
      setRates([]);
      setLoading(false);
      return;
    }

    const { data, error } = await (supabase
      .from("commission_rates")
      .select("*") as any)
      .eq("user_id", userId)
      .order("carrier");

    if (error) {
      console.error("Fetch commission_rates error:", error);
      setRates([]);
      setLoading(false);
      return;
    }

    setRates((data ?? []).map(mapRow));
    setLoading(false);
  };

  useEffect(() => {
    fetchRates();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      fetchRates();
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  const addRate = async (rate: Omit<CommissionRate, "id">) => {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error("Auth error:", authError);
      return;
    }

    const userId = authData.user?.id;
    if (!userId) return;

    const { data, error } = await (supabase
      .from("commission_rates")
      .insert({
        user_id: userId,
        carrier: rate.carrier,
        plan_type: rate.planType,
        plan_name: rate.planName,
        initial_amount: rate.initialAmount,
        renewal_amount: rate.renewalAmount,
        non_commissionable: rate.nonCommissionable,
      } as any))
      .select()
      .single();

    if (error) {
      console.error("Insert commission_rates error:", error);
      return;
    }

    if (data) setRates((prev) => [...prev, mapRow(data)]);
  };

  const updateRate = async (rate: CommissionRate) => {
    const { data, error } = await supabase
      .from("commission_rates")
      .update({
        carrier: rate.carrier,
        plan_type: rate.planType,
        plan_name: rate.planName,
        initial_amount: rate.initialAmount,
        renewal_amount: rate.renewalAmount,
        non_commissionable: rate.nonCommissionable,
      })
      .eq("id", rate.id)
      .select()
      .single();

    if (error) {
      console.error("Update commission_rates error:", error);
      return;
    }

    if (data) setRates((prev) => prev.map((r) => (r.id === rate.id ? mapRow(data) : r)));
  };

  const deleteRate = async (id: string) => {
    const { error } = await supabase.from("commission_rates").delete().eq("id", id);

    if (error) {
      console.error("Delete commission_rates error:", error);
      return;
    }

    setRates((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <RatesContext.Provider
      value={{
        rates,
        loading,
        addRate,
        updateRate,
        deleteRate,
        refetch: fetchRates,
      }}
    >
      {children}
    </RatesContext.Provider>
  );
};

export const useRates = () => {
  const ctx = useContext(RatesContext);
  if (!ctx) throw new Error("useRates must be used within RatesProvider");
  return ctx;
};
