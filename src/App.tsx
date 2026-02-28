import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Forbidden from "./pages/Forbidden";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminJobs from "./pages/admin/AdminJobs";
import AdminOrganizations from "./pages/admin/AdminOrganizations";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSubscriptions from "./pages/admin/AdminSubscriptions";
import OrgDashboard from "./pages/org/OrgDashboard";
import OrgPending from "./pages/org/OrgPending";
import JobSeekerDashboard from "./pages/job-seeker/JobSeekerDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:id" element={<JobDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/forbidden" element={<Forbidden />} />

            {/* Admin routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={["super_admin", "admin", "moderator"]}>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="jobs" element={<AdminJobs />} />
              <Route path="organizations" element={<AdminOrganizations />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="subscriptions" element={<AdminSubscriptions />} />
              <Route path="categories" element={<AdminCategories />} />
            </Route>

            {/* Organization routes */}
            <Route path="/org/dashboard" element={
              <ProtectedRoute allowedRoles={["org_owner", "org_hr_manager", "org_viewer"]}>
                <OrgDashboard />
              </ProtectedRoute>
            } />
            <Route path="/org/pending" element={
              <ProtectedRoute allowedRoles={["org_owner", "org_hr_manager", "org_viewer"]}>
                <OrgPending />
              </ProtectedRoute>
            } />

            {/* Job seeker routes */}
            <Route path="/job-seeker/dashboard" element={
              <ProtectedRoute allowedRoles={["job_seeker"]}>
                <JobSeekerDashboard />
              </ProtectedRoute>
            } />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
