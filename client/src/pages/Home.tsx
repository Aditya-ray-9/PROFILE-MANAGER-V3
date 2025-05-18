import { useEffect } from 'react';
import { useLocation } from 'wouter';

export default function Home() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Redirect to profiles page
    setLocation('/profiles');
  }, [setLocation]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <p>Redirecting to profiles page...</p>
    </div>
  );
}
