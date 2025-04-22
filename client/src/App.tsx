import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProvisioningProvider } from "@/context/provisioning-context";
import Navbar from "@/components/navbar";
import Landing from "@/pages/landing";
import EcsDashboard from "@/pages/ecs-dashboard";
import NotFound from "@/pages/not-found";
import AppRouter from "@/components/app-router";

import "@/index.css";
import "remixicon/fonts/remixicon.css";

function Router() {
  return (
    <Switch>
      <Route path="/" component={AppRouter} />
      <Route path="/dashboard/ecs" component={EcsDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ProvisioningProvider>
          <div className="min-h-screen bg-gray-50 text-gray-800">
            <Navbar />
            <div className="flex-grow">
              <Router />
            </div>
          </div>
          <Toaster />
        </ProvisioningProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
