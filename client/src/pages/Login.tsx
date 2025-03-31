import { LoginForm } from "@/components/auth/LoginForm";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";

export default function Login() {
  const [_, setLocation] = useLocation();
  
  // Check if user is already logged in
  const { data, isLoading } = useQuery({
    queryKey: ["/api/session"],
    queryFn: async () => {
      const response = await fetch("/api/session");
      if (!response.ok) {
        throw new Error("Failed to check session");
      }
      return response.json();
    },
  });

  // If already authenticated, redirect to admin page
  useEffect(() => {
    if (data && data.authenticated) {
      setLocation("/admin");
    }
  }, [data, setLocation]);

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