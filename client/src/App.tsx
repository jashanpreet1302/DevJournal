import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import Journal from "@/pages/journal";
import Bugs from "@/pages/bugs";
import Snippets from "@/pages/snippets";
import Analytics from "@/pages/analytics";
import Turtle from "@/pages/turtle";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";

function Router() {
  return (
    <div className="min-h-screen bg-dev-bg text-dev-text">
      <Sidebar />
      <div className="ml-64">
        <Header />
        <main className="animate-fade-in">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/journal" component={Journal} />
            <Route path="/bugs" component={Bugs} />
            <Route path="/snippets" component={Snippets} />
            <Route path="/analytics" component={Analytics} />
            <Route path="/turtle" component={Turtle} />
            <Route>
              <div className="p-6">
                <div className="text-center">
                  <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
                  <p className="text-dev-text-muted">The requested page could not be found.</p>
                </div>
              </div>
            </Route>
          </Switch>
        </main>
      </div>
    </div>
  );
}

function App() {
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
