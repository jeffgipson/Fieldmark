import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { DaleChatProvider } from "./contexts/DaleChatContext";
import { FarmProvider } from "./contexts/FarmContext";
import BenchmarkPage from "./pages/BenchmarkPage";
import DashboardPage from "./pages/DashboardPage";
import FarmPage from "./pages/FarmPage";
import InputCostsPage from "./pages/InputCostsPage";
import LandingPage from "./pages/LandingPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ReportPage from "./pages/ReportPage";
import ScenarioPage from "./pages/ScenarioPage";
import ScenariosPage from "./pages/ScenariosPage";
import ProfilePage from "./pages/ProfilePage";
import ResourcesPage from "./pages/ResourcesPage";
import HelpPage from "./pages/HelpPage";
import VendorProfilePage from "./pages/VendorProfilePage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <FarmProvider>
          <DaleChatProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route
              element={
                <ProtectedRoute>
                  <AppShell />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/farm" element={<FarmPage />} />
              <Route path="/fields/:id/costs" element={<InputCostsPage />} />
              <Route path="/scenarios" element={<ScenariosPage />} />
              <Route path="/scenarios/:id" element={<ScenarioPage />} />
              <Route path="/scenarios/:id/benchmark" element={<BenchmarkPage />} />
              <Route path="/scenarios/:id/report" element={<ReportPage />} />
              <Route path="/reports" element={<ReportPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/resources" element={<ResourcesPage />} />
              <Route path="/resources/:slug" element={<VendorProfilePage />} />
              <Route path="/help" element={<HelpPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </DaleChatProvider>
        </FarmProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
