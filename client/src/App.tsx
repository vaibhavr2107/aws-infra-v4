import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProvisioningProvider } from "@/context/provisioning-context";
import Navbar from "@/components/navbar";
import Landing from "@/pages/landing";
import EcsDashboard from "@/pages/ecs-dashboard";
import InfraDashboard from "@/pages/infra-dashboard";
import NotFound from "@/pages/not-found";
import AppRouter from "@/components/app-router";

import "@/index.css";
import "remixicon/fonts/remixicon.css";

function Router() {
  return (
    <Switch>
      <Route path="/" component={AppRouter} />
      <Route path="/dashboard/ecs" component={EcsDashboard} />
      <Route path="/dashboard/infra" component={InfraDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-gray-50 text-gray-800">
          <Navbar />
          <div className="flex-grow">
            <ProvisioningProvider>
              <Router />
            </ProvisioningProvider>
          </div>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;