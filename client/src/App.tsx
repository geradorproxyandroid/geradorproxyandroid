import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import UserPanel from "./pages/UserPanel";
import { trpc } from "./lib/trpc";
import { useEffect } from "react";

function AuthRedirect() {
  const { data: user, isLoading } = trpc.auth.me.useQuery();
  const [location, navigate] = useLocation();

  useEffect(() => {
    if (isLoading) return;
    if (location === "/" || location === "") {
      if (!user) {
        navigate("/login");
      } else if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/painel");
      }
    }
  }, [user, isLoading, location, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-emerald-50">
        <span className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={AuthRedirect} />
      <Route path="/login" component={Login} />
      <Route path="/admin" component={Admin} />
      <Route path="/painel" component={UserPanel} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster position="top-center" richColors />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
