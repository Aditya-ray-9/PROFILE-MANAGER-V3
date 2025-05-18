import { useState, useEffect, useCallback } from "react";

export function useHashLocation() {
  const [currentPath, setCurrentPath] = useState(() => {
    // Get the path from the hash part of the URL or default to "/"
    return window.location.hash.replace("#", "") || "/";
  });

  useEffect(() => {
    // Update the location on hash change
    const handleHashChange = () => {
      setCurrentPath(window.location.hash.replace("#", "") || "/");
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const navigate = useCallback((to: string) => {
    window.location.hash = to;
  }, []);

  return [currentPath, navigate] as const;
}