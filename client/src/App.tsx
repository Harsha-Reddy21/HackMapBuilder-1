import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Hackathons from "@/pages/hackathons";
import HackathonDetails from "@/pages/hackathon-details";
import Teams from "@/pages/teams";
import Ideas from "@/pages/ideas";
import Dashboard from "@/pages/dashboard";
import Profile from "@/pages/profile";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import Navbar from "./components/layout/navbar";
import Footer from "./components/layout/footer";
import { useAuth } from "./contexts/auth-context";
import { Loader2 } from "lucide-react";

function Router() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/hackathons" component={Hackathons} />
          <Route path="/hackathons/:id" component={HackathonDetails} />
          <Route path="/teams" component={Teams} />
          <Route path="/ideas" component={Ideas} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/profile" component={Profile} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
