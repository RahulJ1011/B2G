import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PoliceLoginPage from "./pages/PoliceLoginPage";
import DashboardPage from "./pages/DashboardPage";
import SubmitCasePage from "./pages/SubmitCasePage";
import MyCasesPage from "./pages/MyCasesPage";
import AssignedCasesPage from "./pages/AssignedCasesPage";
import EscalatedCasesPage from "./pages/EscalatedCasesPage";
import AllCasesPage from "./pages/AllCasesPage";
import StationsPage from "./pages/StationsPage";
import NotificationsPage from "./pages/NotificationsPage";
import { AppLayout } from "./components/layout/AppLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/police-login" element={<PoliceLoginPage />} />
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/submit-case" element={<SubmitCasePage />} />
            <Route path="/my-cases" element={<MyCasesPage />} />
            <Route path="/assigned-cases" element={<AssignedCasesPage />} />
            <Route path="/escalated-cases" element={<EscalatedCasesPage />} />
            <Route path="/all-cases" element={<AllCasesPage />} />
            <Route path="/stations" element={<StationsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
