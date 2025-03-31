import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import AllProjects from "@/pages/AllProjects";
import Admin from "@/pages/Admin";
import Login from "@/pages/Login";
import Blogs from "@/pages/Blogs";
import BlogPost from "@/pages/BlogPost";
import { ThemeProvider } from "@/hooks/use-theme";
import { AuthProvider } from "@/hooks/use-auth";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/projects" component={AllProjects} />
      <Route path="/blogs" component={Blogs} />
      <Route path="/blogs/:slug" component={BlogPost} />
      <Route path="/login" component={Login} />
      <Route path="/admin" component={Admin} />
      <Route path="/admin/messages" component={Admin} />
      <Route path="/admin/projects" component={Admin} />
      <Route path="/admin/skills" component={Admin} />
      <Route path="/admin/blogs" component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
