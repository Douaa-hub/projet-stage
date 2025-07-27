// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './components/Login';
import DashboardEmploye from './pages/DashboardEmploye';
import DashboardResponsable from './pages/DashboardResponsable';
import DashboardRH from './pages/DashboardRH';
import DashboardGardien from './pages/DashboardGardien';
import DashboardAdmin from './pages/DashboardAdmin';
import ListeDemandes from './components/ListeDemandesSortie';

import { getUser } from './services/authService';

function PrivateRoute({ children, roles }) {
  const user = getUser();

  if (!user) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(user.role)) return <Navigate to="/login" replace />;

  return children;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route
          path="/dashboard-employe"
          element={
            <PrivateRoute roles={['employe']}>
              <DashboardEmploye />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard-responsable"
          element={
            <PrivateRoute roles={['responsable']}>
              <DashboardResponsable />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard-rh"
          element={
            <PrivateRoute roles={['rh']}>
              <DashboardRH />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard-gardien"
          element={
            <PrivateRoute roles={['gardien']}>
              <DashboardGardien />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard-admin"
          element={
            <PrivateRoute roles={['admin']}>
              <DashboardAdmin />
            </PrivateRoute>
          }
        />

        <Route
          path="/mes-demandes"
          element={
            <PrivateRoute roles={['employe']}>
              <ListeDemandes />
            </PrivateRoute>
          }
        />

        {/* Route catch-all à placer en dernier */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

