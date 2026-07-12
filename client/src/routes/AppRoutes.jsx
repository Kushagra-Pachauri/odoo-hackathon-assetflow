import AdminRoute from "../components/organization/AdminRoute";
import OrganizationSetup from "../pages/organizationSetup/OrganizationSetup";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import AppLayout from "../layouts/AppLayout";

import Dashboard from "../pages/Dashboard";
import Assets from "../pages/Assets";
import Allocations from "../pages/Allocations";
import Bookings from "../pages/Bookings";
import Maintenance from "../pages/Maintenance";
import Reports from "../pages/Reports";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import NotFound from "../pages/NotFound";

import ProtectedRoute from "../components/ProtectedRoute";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/assets" element={<Assets />} />
          <Route path="/allocation" element={<Allocations />} />
          <Route path="/booking" element={<Bookings />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/reports" element={<Reports />} />

          <Route
            path="/organization-setup"
            element={
              <AdminRoute>
                <OrganizationSetup />
              </AdminRoute>
            }
          />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;