import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";
import { useState, useEffect, useCallback } from "react";
import "@/index.css";

// Components
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";

// Pages
import Home from "@/pages/Home";
import ProfilesPage from "@/pages/ProfilesPage";
import NotFound from "@/pages/not-found";

// Create a QueryClient instance for GitHub Pages
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

// Define custom Link component for hash routing
function Link({ to, children, className }: { to: string; children: React.ReactNode; className?: string }) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.location.hash = to;
  };

  return (
    <a href={`#${to}`} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}

// Simple hash-based routing for GitHub Pages compatibility
function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  
  // State to keep track of current route
  const [currentRoute, setCurrentRoute] = useState("/");
  
  // Effect to listen for hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const path = window.location.hash.replace("#", "") || "/";
      setCurrentRoute(path);
    };
    
    // Set initial route
    handleHashChange();
    
    // Listen for hash changes
    window.addEventListener("hashchange", handleHashChange);
    
    // Clean up event listener
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);
  
  // Make navigate function available globally
  const navigate = useCallback((to: string) => {
    window.location.hash = to;
  }, []);
  
  // Add navigate to window for components that need it
  useEffect(() => {
    // @ts-ignore
    window.navigate = navigate;
  }, [navigate]);

  // Render the appropriate component based on route
  const renderRoute = () => {
    switch (currentRoute) {
      case "/":
        return <Home />;
      case "/profiles":
        return <ProfilesPage />;
      default:
        return <NotFound />;
    }
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="system">
      <QueryClientProvider client={queryClient}>
        <div className="flex h-screen bg-background">
          <Sidebar active={currentRoute} isOpen={sidebarOpen} />
          <div className="flex flex-col flex-1 overflow-hidden">
            <Header toggleSidebar={toggleSidebar} />
            <main className="flex-1 overflow-y-auto p-4 md:p-6">
              {renderRoute()}
            </main>
          </div>
        </div>
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;