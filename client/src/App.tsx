import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ProtocolDetail from "./pages/ProtocolDetail";
import Favorites from "./pages/Favorites";
import Calculators from "./pages/Calculators";
import Patients from "./pages/Patients";
import Budgets from "./pages/Budgets";
import SecretaryTraining from "./pages/SecretaryTraining";
import ICP from "./pages/ICP";
import DiarioPaciente from "./pages/DiarioPaciente";
import FichaPublica from "./pages/FichaPublica";
import PortalPaciente from "./pages/PortalPaciente";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/protocolo/:id" component={ProtocolDetail} />
      <Route path="/favoritos" component={Favorites} />
      <Route path="/calculadoras" component={Calculators} />
      <Route path="/pacientes" component={Patients} />
      <Route path="/orçamentos" component={Budgets} />
      <Route path="/treinamento" component={SecretaryTraining} />
      <Route path="/icp" component={ICP} />
      <Route path="/diario-paciente/:id" component={DiarioPaciente} />
      <Route path="/ficha/:token" component={FichaPublica} />
      <Route path="/portal" component={PortalPaciente} />
      <Route path="/404" component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster position="top-right" closeButton richColors />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
