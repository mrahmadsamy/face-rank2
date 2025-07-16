import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import Navigation from "@/components/navigation";
import Home from "@/pages/home";
import FaceMash from "@/pages/facemash";
import Rankings from "@/pages/rankings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/facemash" component={FaceMash} />
        <Route path="/rankings" component={Rankings} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  const [sessionId, setSessionId] = useState<string>("");

  useEffect(() => {
    // Get or create session ID
    let storedSessionId = localStorage.getItem('facerank_sessionId');
    if (!storedSessionId) {
      storedSessionId = 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('facerank_sessionId', storedSessionId);
    }
    setSessionId(storedSessionId);

    // Set default headers for all API calls
    queryClient.setDefaultOptions({
      queries: {
        ...queryClient.getDefaultOptions().queries,
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        ...queryClient.getDefaultOptions().mutations,
        retry: 1,
      },
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="dark">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
