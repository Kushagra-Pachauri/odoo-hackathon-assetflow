import AdminRoute from "../components/organization/AdminRoute";
import OrganizationSetup from "../pages/organizationSetup/OrganizationSetup";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import AppLayout from "../layouts/AppLayout";

import Dashboard from "../pages/Dashboard";
import Assets from "../pages/Assets";
import Allocations from "../pages/Allocations";
import Bookings from "../pages/Bookings";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import NotFound from "../pages/NotFound";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/assets" element={<Assets />} />
          <Route path="/allocation" element={<Allocations />} />
          <Route path="/booking" element={<Bookings />} />

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