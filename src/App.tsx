import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "./components/MainLayout";
import Dashboard from "./pages/Dashboard";
import Clientes from "./pages/Clientes";
import Eventos from "./pages/Eventos";
import Ventas from "./pages/Ventas";
import Inventario from "./pages/Inventario";
import Personal from "./pages/Personal";
import Marketing from "./pages/Marketing";
import Reportes from "./pages/Reportes";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<MainLayout><Dashboard /></MainLayout>} />
          <Route path="/clientes" element={<MainLayout><Clientes /></MainLayout>} />
          <Route path="/eventos" element={<MainLayout><Eventos /></MainLayout>} />
          <Route path="/ventas" element={<MainLayout><Ventas /></MainLayout>} />
          <Route path="/inventario" element={<MainLayout><Inventario /></MainLayout>} />
          <Route path="/personal" element={<MainLayout><Personal /></MainLayout>} />
          <Route path="/marketing" element={<MainLayout><Marketing /></MainLayout>} />
          <Route path="/reportes" element={<MainLayout><Reportes /></MainLayout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
