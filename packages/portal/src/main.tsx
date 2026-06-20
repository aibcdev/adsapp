import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { SiteSeo } from "./components/SiteSeo";
import { AttributionCapture } from "./components/AttributionCapture";
import { LandingPage } from "./pages/LandingPage";
import { DashboardPage } from "./pages/DashboardPage";
import { AdvertiserCampaignDetailPage } from "./pages/AdvertiserCampaignDetailPage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { TermsPage } from "./pages/TermsPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { LoginPage } from "./pages/LoginPage";
import { ExtensionConnectPage } from "./pages/ExtensionConnectPage";
import { AdvertisersPage } from "./pages/AdvertisersPage";
import { AdvertiserApplyPage } from "./pages/AdvertiserApplyPage";
import { PublishersPage } from "./pages/PublishersPage";
import { AdminShell } from "./components/admin/AdminShell";
import { AdminPayoutsPage } from "./pages/admin/AdminPayoutsPage";
import { AdminUsersPage } from "./pages/admin/AdminUsersPage";
import { AdminUserDetailPage } from "./pages/admin/AdminUserDetailPage";
import { AdminLimitsPage } from "./pages/admin/AdminLimitsPage";
import { AdminOverviewPage } from "./pages/admin/AdminOverviewPage";
import { AdminAlternateOverviewPage } from "./pages/admin/AdminAlternateOverviewPage";
import { AdminAdvertiserPipelinePage } from "./pages/admin/AdminAdvertiserPipelinePage";
import { AdminCompetitivePage } from "./pages/admin/AdminCompetitivePage";
import { ReferralPage } from "./pages/ReferralPage";
import { ContactPage } from "./pages/ContactPage";
import { HowItWorksPage } from "./pages/HowItWorksPage";
import { PayoutsPage } from "./pages/PayoutsPage";
import { IntegrationRoutePage } from "./pages/IntegrationRoutePage";
import { BlogIndexPage } from "./pages/BlogIndexPage";
import { BlogPostPage } from "./pages/BlogPostPage";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <SiteSeo />
      <AttributionCapture />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/advertiser/campaigns/:id" element={<AdvertiserCampaignDetailPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/advertisers" element={<AdvertisersPage />} />
        <Route path="/advertisers/apply" element={<AdvertiserApplyPage />} />
        <Route path="/waitlist" element={<Navigate to="/#install" replace />} />
        <Route path="/publishers" element={<PublishersPage />} />
        <Route path="/waitlist/success" element={<Navigate to="/#install" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/extension/connect" element={<ExtensionConnectPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/developers/how-it-works" element={<HowItWorksPage />} />
        <Route path="/developers/payouts" element={<PayoutsPage />} />
        <Route path="/integrations/:slug" element={<IntegrationRoutePage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/blog" element={<BlogIndexPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/referral" element={<ReferralPage />} />
        <Route path="/admin" element={<AdminShell />}>
          <Route index element={<Navigate to="/admin/overview" replace />} />
          <Route path="overview" element={<AdminOverviewPage />} />
          <Route path="alternate" element={<AdminAlternateOverviewPage />} />
          <Route path="pipeline" element={<AdminAdvertiserPipelinePage />} />
          <Route path="payouts" element={<AdminPayoutsPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="users/:clientId" element={<AdminUserDetailPage />} />
          <Route path="limits" element={<AdminLimitsPage />} />
          <Route path="competitive" element={<AdminCompetitivePage />} />
          <Route path="*" element={<Navigate to="/admin/overview" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
