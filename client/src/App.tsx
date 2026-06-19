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
import Configuracoes from "./pages/Configuracoes";
import { DoctorGuard } from "./components/DoctorGuard";
import { SessionProvider } from "./components/SessionProvider";

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
  // On the patient domain the root serves the public patient landing page.
  // On the physician domain it serves the doctor app, gated by DoctorGuard.
  if (isPatientHost()) return <PacienteLanding />;
  return (
    <DoctorGuard>
      <Home />
    </DoctorGuard>
  );
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

      {/* Patient-shareable diary (reads from local storage, no Manus login) */}
      <Route path="/diario-paciente/:id" component={DiarioPaciente} />

      {/* Physician-only routes (gated by DoctorGuard / ownerProcedure on backend) */}
      <Route path="/protocolo/:id">
        <DoctorGuard><ProtocolDetail /></DoctorGuard>
      </Route>
      <Route path="/favoritos">
        <DoctorGuard><Favorites /></DoctorGuard>
      </Route>
      <Route path="/calculadoras">
        <DoctorGuard><Calculators /></DoctorGuard>
      </Route>
      <Route path="/pacientes">
        <DoctorGuard><Patients /></DoctorGuard>
      </Route>
      <Route path="/orçamentos">
        <DoctorGuard><Budgets /></DoctorGuard>
      </Route>
      <Route path="/treinamento">
        <DoctorGuard><SecretaryTraining /></DoctorGuard>
      </Route>
      <Route path="/icp">
        <DoctorGuard><ICP /></DoctorGuard>
      </Route>
      <Route path="/fichas">
        <DoctorGuard><IntakeManager /></DoctorGuard>
      </Route>
      <Route path="/fichas/:id">
        <DoctorGuard><IntakeDetail /></DoctorGuard>
      </Route>
      <Route path="/configuracoes">
        <DoctorGuard><Configuracoes /></DoctorGuard>
      </Route>

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
          <SessionProvider>
            <Toaster position="top-right" closeButton richColors />
            <Router />
          </SessionProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
