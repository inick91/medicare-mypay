import { createContext, useContext, useState, ReactNode } from "react";
import { CommissionRate, sampleRates } from "@/lib/data";

interface RatesContextType {
  rates: CommissionRate[];
  setRates: React.Dispatch<React.SetStateAction<CommissionRate[]>>;
}

const RatesContext = createContext<RatesContextType | undefined>(undefined);

export const RatesProvider = ({ children }: { children: ReactNode }) => {
  const [rates, setRates] = useState<CommissionRate[]>(sampleRates);
  return (
    <RatesContext.Provider value={{ rates, setRates }}>
      {children}
    </RatesContext.Provider>
  );
};

export const useRates = () => {
  const ctx = useContext(RatesContext);
  if (!ctx) throw new Error("useRates must be used within RatesProvider");
  return ctx;
};
