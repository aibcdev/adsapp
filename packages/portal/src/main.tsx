import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import { DashboardPage } from "./pages/DashboardPage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { TermsPage } from "./pages/TermsPage";
import { LoginPage } from "./pages/LoginPage";
import { AdvertisersPage } from "./pages/AdvertisersPage";
import { AdvertiserApplyPage } from "./pages/AdvertiserApplyPage";
import { PublishersPage } from "./pages/PublishersPage";
import { AdminShell } from "./components/admin/AdminShell";
import { AdminPayoutsPage } from "./pages/admin/AdminPayoutsPage";
import { AdminUsersPage } from "./pages/admin/AdminUsersPage";
import { AdminUserDetailPage } from "./pages/admin/AdminUserDetailPage";
import { AdminLimitsPage } from "./pages/admin/AdminLimitsPage";
import { AdminCompetitivePage } from "./pages/admin/AdminCompetitivePage";
import { ReferralPage } from "./pages/ReferralPage";
import { ContactPage } from "./pages/ContactPage";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/advertisers" element={<AdvertisersPage />} />
        <Route path="/advertisers/apply" element={<AdvertiserApplyPage />} />
        <Route path="/waitlist" element={<Navigate to="/#install" replace />} />
        <Route path="/publishers" element={<PublishersPage />} />
        <Route path="/waitlist/success" element={<Navigate to="/#install" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/referral" element={<ReferralPage />} />
        <Route path="/admin" element={<AdminShell />}>
          <Route index element={<Navigate to="/admin/payouts" replace />} />
          <Route path="payouts" element={<AdminPayoutsPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="users/:clientId" element={<AdminUserDetailPage />} />
          <Route path="limits" element={<AdminLimitsPage />} />
          <Route path="competitive" element={<AdminCompetitivePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
