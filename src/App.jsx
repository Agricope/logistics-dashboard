import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

// Auth
import Login from "./pages/Login.jsx";

// Layout & Protection
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminLayout from "./components/AdminLayout.jsx";

// Dashboard
import Dashboard from "./pages/Dashboard";

// Admin Management
import { AdminManagement, AdminDetails } from "./pages/AdminManagement";

// Driver Management
import { Drivers, DriverDetails } from "./pages/DriverManagement";

// Vehicle Management
import { Vehicles, VehicleDetails, VehicleMakes, VehicleModels, VehicleInsurance } from "./pages/VehicleManagement";

// Delivery Management
import Deliveries from "./pages/DeliveryManagement";
import AddNewDelivery from "./pages/DeliveryManagement/AddNewDelivery.jsx";
import DeliveryDetails from "./pages/DeliveryDetails/DeliveryDetails.jsx";

// Client Management
import ClientManagement, { ClientDetails } from "./pages/ClientManagement";

// Performance
import Performance from "./pages/Performance";

// Calls
import Calls from "./pages/Calls";

// Live Map
import LiveMap from "./pages/LiveMap";

// Source Configurator
import Sources from "./pages/SourceConfigurator";

// Demo/Other
import DemoPage from "./pages/DemoPage.jsx";

function App() {
  const token = useSelector((state) => state.auth.token);
  const location = useLocation();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          token ? (
            <Navigate to="/dashboard" replace state={{ from: location }} />
          ) : (
            <Login />
          )
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Dashboard />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-management"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <AdminManagement />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-management/:id"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <AdminDetails />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/live-map"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <LiveMap />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/clients"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <ClientManagement />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/clients/:id"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <ClientDetails />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/performance"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Performance />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/calls"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Calls />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/vehicle-insurance"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <VehicleInsurance />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/vehicle-makes"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <VehicleMakes />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/vehicle-models"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <VehicleModels />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/drivers"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Drivers />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/drivers/:id"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <DriverDetails />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/vehicles"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Vehicles />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/vehicles/:id"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <VehicleDetails />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sources"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Sources />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/deliveries"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <Deliveries />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/deliveries/new"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <AddNewDelivery />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/deliveries/:id"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <DeliveryDetails />
            </AdminLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/demo"
        element={
          <AdminLayout>
            <DemoPage />
          </AdminLayout>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
