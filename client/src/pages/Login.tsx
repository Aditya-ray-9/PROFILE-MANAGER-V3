import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";

export default function Login() {
  const [username, setUsername] = useState("viewer");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<"viewer" | "admin">("viewer");
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const { login } = useAuth();

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      // For viewer role, no password required
      if (role === "viewer") {
        // Log in as viewer
        login({ 
          username: "viewer", 
          role: "viewer" 
        });
        
        // Refresh queries in case user permissions have changed
        await queryClient.invalidateQueries({ queryKey: ['/api/profiles'] });
        
        toast({
          title: "Welcome, Viewer!",
          description: "You have view-only access to profiles.",
        });
        
        setLocation("/profiles");
        return;
      }
      
      // For admin role, password required
      if (!password) {
        toast({
          title: "Password Required",
          description: "Please enter the admin password to continue.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // Verify the admin password locally (simulated authentication)
      if (password === "A9810625562") {
        // Login with auth context
        login({ 
          username: "admin", 
          role: "admin" 
        });
        
        // Refresh queries
        await queryClient.invalidateQueries({ queryKey: ['/api/profiles'] });
        
        toast({
          title: "Welcome, Admin!",
          description: "You now have full access to manage profiles.",
        });
        
        setLocation("/profiles");
      } else {
        throw new Error("Invalid admin password");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login Failed",
        description: "Invalid admin password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Profile Management</CardTitle>
          <CardDescription className="text-center">
            Choose your access level to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="viewer" onValueChange={(value) => setRole(value as "viewer" | "admin")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="viewer">Viewer</TabsTrigger>
              <TabsTrigger value="admin">Admin</TabsTrigger>
            </TabsList>
            <TabsContent value="viewer" className="space-y-4 mt-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Viewer access allows you to browse all profiles without making changes.
                </p>
                <div className="flex justify-center">
                  <Button 
                    onClick={handleLogin} 
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? "Loading..." : "Continue as Viewer"}
                  </Button>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="admin" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Admin Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter admin password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    Admin access allows you to create, edit, and delete profiles.
                  </p>
                </div>
                <Button 
                  onClick={handleLogin} 
                  disabled={isLoading} 
                  className="w-full"
                >
                  {isLoading ? "Authenticating..." : "Login as Admin"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-4">
          <p className="text-sm text-muted-foreground text-center">
            This is a secure profile management system with role-based access control.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}