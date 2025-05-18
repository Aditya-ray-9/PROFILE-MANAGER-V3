import { Route, Switch, Router as WouterRouter, useLocation } from "wouter";
import makeLocation from "wouter/use-location";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";
import "@/index.css";

// Components
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import { useState, useEffect, useCallback } from "react";

// Pages
import Home from "@/pages/Home";
import ProfilesPage from "@/pages/ProfilesPage";
import NotFound from "@/pages/not-found";

// Create a QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

// Create a hash-based location hook for GitHub Pages
const hashLocation = () => {
  const [loc, setLoc] = useState(() => window.location.hash.replace("#", "") || "/");

  useEffect(() => {
    // Handle hash changes
    const handler = () => setLoc(window.location.hash.replace("#", "") || "/");
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  // Replace the pathname with hash-based navigation
  const navigate = useCallback((to: string) => {
    window.location.hash = to;
  }, []);

  return [loc, navigate] as const;
};

// Create a custom Wouter Router that uses hash-based navigation
const HashRouter = ({ children }: { children: React.ReactNode }) => {
  return <WouterRouter hook={hashLocation}>{children}</WouterRouter>;
};

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const [location] = hashLocation();
  const active = location || "/";

  return (
    <ThemeProvider attribute="class" defaultTheme="system">
      <QueryClientProvider client={queryClient}>
        <div className="flex h-screen bg-background">
          <Sidebar active={active} isOpen={sidebarOpen} />
          <div className="flex flex-col flex-1 overflow-hidden">
            <Header toggleSidebar={toggleSidebar} />
            <main className="flex-1 overflow-y-auto p-4 md:p-6">
              <HashRouter>
                <Route path="/" component={Home} />
                <Route path="/profiles" component={ProfilesPage} />
                <Route component={NotFound} />
              </HashRouter>
            </main>
          </div>
        </div>
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;