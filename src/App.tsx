import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RatesProvider } from "@/contexts/RatesContext";
import ProtectedRoute from "@/auth/ProtectedRoute";
import Login from "./pages/Login";
import Index from "./pages/Index";
import Rates from "./pages/Rates";
import SepFinder from "./pages/SepFinder";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <RatesProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              }
            />

            <Route
              path="/rates"
              element={
                <ProtectedRoute>
                  <Rates />
                </ProtectedRoute>
              }
            />

            <Route
              path="/sep-finder"
              element={
                <ProtectedRoute>
                  <SepFinder />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </RatesProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
