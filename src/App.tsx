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
import TalentRegister from "./pages/TalentRegister";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Forbidden from "./pages/Forbidden";
import About from "./pages/About";
import NGOsDirectory from "./pages/NGOsDirectory";
import NGOProfile from "./pages/NGOProfile";
import TalentsPublic from "./pages/TalentsPublic";
import PortalLanding from "./pages/PortalLanding";
import TalentsPortalLanding from "./pages/TalentsPortalLanding";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminJobs from "./pages/admin/AdminJobs";
import AdminOrganizations from "./pages/admin/AdminOrganizations";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSubscriptions from "./pages/admin/AdminSubscriptions";
import PortalLayout from "./components/portal/PortalLayout";
import PortalDashboard from "./pages/portal/PortalDashboard";
import PortalPending from "./pages/portal/PortalPending";
import PortalJobs from "./pages/portal/PortalJobs";
import PortalNewJob from "./pages/portal/PortalNewJob";
import PortalApplications from "./pages/portal/PortalApplications";
import PortalTeam from "./pages/portal/PortalTeam";
import PortalBilling from "./pages/portal/PortalBilling";
import PortalSettings from "./pages/portal/PortalSettings";
import TalentsLayout from "./components/talents/TalentsLayout";
import TalentsDashboard from "./pages/talents/TalentsDashboard";
import TalentsProfile from "./pages/talents/TalentsProfile";
import TalentsApplications from "./pages/talents/TalentsApplications";
import TalentsSettings from "./pages/talents/TalentsSettings";
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
            <Route path="/register/talent" element={<TalentRegister />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/forbidden" element={<Forbidden />} />

            {/* Public pages */}
            <Route path="/about" element={<About />} />
            <Route path="/ngos" element={<NGOsDirectory />} />
            <Route path="/ngos/:slug" element={<NGOProfile />} />
            <Route path="/talents-public" element={<TalentsPublic />} />
            <Route path="/portal-landing" element={<PortalLanding />} />
            <Route path="/talents-portal" element={<TalentsPortalLanding />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/contact" element={<Contact />} />

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

            {/* Portal (Entity) routes */}
            <Route path="/portal/pending" element={
              <ProtectedRoute allowedRoles={["org_owner", "org_hr_manager", "org_viewer"]}>
                <PortalPending />
              </ProtectedRoute>
            } />
            <Route path="/portal" element={
              <ProtectedRoute allowedRoles={["org_owner", "org_hr_manager", "org_viewer"]}>
                <PortalLayout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<PortalDashboard />} />
              <Route path="jobs" element={<PortalJobs />} />
              <Route path="jobs/new" element={<PortalNewJob />} />
              <Route path="applications" element={<PortalApplications />} />
              <Route path="team" element={<PortalTeam />} />
              <Route path="billing" element={<PortalBilling />} />
              <Route path="settings" element={<PortalSettings />} />
            </Route>

            {/* Talents routes */}
            <Route path="/talents" element={
              <ProtectedRoute allowedRoles={["job_seeker"]}>
                <TalentsLayout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<TalentsDashboard />} />
              <Route path="profile" element={<TalentsProfile />} />
              <Route path="applications" element={<TalentsApplications />} />
              <Route path="settings" element={<TalentsSettings />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
