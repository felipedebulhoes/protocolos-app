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
import PacienteLanding from "./pages/PacienteLanding";
import IntakeManager from "./pages/IntakeManager";
import IntakeDetail from "./pages/IntakeDetail";

/**
 * Detect whether the current host is the patient-facing domain.
 * On the patient domain the root path ("/") serves the patient landing page
 * instead of the physician app.
 */
function isPatientHost(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname.toLowerCase();
  return host.startsWith("paciente.");
}

// Route wrappers so wouter's RouteComponentProps don't clash with our props.
function PortalLogin() {
  return <PortalPaciente initialMode="login" />;
}
function PortalRegister() {
  return <PortalPaciente initialMode="register" />;
}
function PortalRoute() {
  return <PortalPaciente initialMode="login" />;
}
function RootRoute() {
  return isPatientHost() ? <PacienteLanding /> : <Home />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={RootRoute} />

      {/* Patient-facing public routes */}
      <Route path="/paciente" component={PacienteLanding} />
      <Route path="/cadastro" component={PortalRegister} />
      <Route path="/login" component={PortalLogin} />
      <Route path="/portal" component={PortalRoute} />
      <Route path="/ficha/:token" component={FichaPublica} />

      {/* Physician app routes */}
      <Route path="/protocolo/:id" component={ProtocolDetail} />
      <Route path="/favoritos" component={Favorites} />
      <Route path="/calculadoras" component={Calculators} />
      <Route path="/pacientes" component={Patients} />
      <Route path="/orçamentos" component={Budgets} />
      <Route path="/treinamento" component={SecretaryTraining} />
      <Route path="/icp" component={ICP} />
      <Route path="/diario-paciente/:id" component={DiarioPaciente} />
      <Route path="/fichas" component={IntakeManager} />
      <Route path="/fichas/:id" component={IntakeDetail} />

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
