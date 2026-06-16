/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { ManufacturerLogin } from './pages/ManufacturerLogin';
import { ManufacturerDashboard } from './pages/ManufacturerDashboard';
import { EndUserPortal } from './pages/EndUserPortal';
import { ManualView } from './pages/ManualView';
import { ManualEditor } from './pages/ManualEditor';
import { ManualAnalytics } from './pages/ManualAnalytics';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/manufacturer/login" element={<ManufacturerLogin />} />
        <Route path="/manufacturer/dashboard" element={<ManufacturerDashboard />} />
        <Route path="/manufacturer" element={<ManufacturerDashboard />} />
        <Route path="/manufacturer/new" element={<ManualEditor />} />
        <Route path="/manufacturer/edit/:id" element={<ManualEditor />} />
        <Route path="/manufacturer/analytics/:id" element={<ManualAnalytics />} />
        <Route path="/user" element={<EndUserPortal />} />
        <Route path="/manual/:id" element={<ManualView />} />
      </Routes>
    </Router>
  );
}
