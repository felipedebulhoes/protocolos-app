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
import SecretaryTraining from "./pages/SecretaryTraining";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/protocolo/:id" component={ProtocolDetail} />
      <Route path="/favoritos" component={Favorites} />
      <Route path="/calculadoras" component={Calculators} />
      <Route path="/pacientes" component={Patients} />
      <Route path="/treinamento" component={SecretaryTraining} />
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
