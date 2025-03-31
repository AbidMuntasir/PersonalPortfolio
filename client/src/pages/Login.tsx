import { LoginForm } from "@/components/auth/LoginForm";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export default function Login() {
  const [_, setLocation] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  
  // If already authenticated, redirect to admin page
  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/admin");
    }
  }, [isAuthenticated, setLocation]);

  return (
    <div className="container mx-auto py-10 px-4 min-h-screen flex flex-col justify-center">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Portfolio Admin</h1>
        <p className="text-muted-foreground mt-2">
          Login to manage your portfolio content
        </p>
      </div>

      {isLoading ? (
        <div className="text-center">Checking session...</div>
      ) : (
        <LoginForm />
      )}
    </div>
  );
}