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
import { AdminPayoutsPage } from "./pages/AdminPayoutsPage";
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
        <Route path="/admin/payouts" element={<AdminPayoutsPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
