import { ReactNode, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

export function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      setLocation("/login");
      return;
    }

    // If admin-only route and not an admin, redirect
    if (adminOnly && !isAdmin) {
      setLocation("/profiles");
    }
  }, [isAuthenticated, isAdmin, adminOnly, setLocation]);

  // Only render children if authenticated and proper role
  if (!isAuthenticated) {
    return null;
  }

  if (adminOnly && !isAdmin) {
    return null;
  }

  return <>{children}</>;
}