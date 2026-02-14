import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import InboxPage from "@/components/dashboard/InboxPage";
import DraftsPage from "@/components/dashboard/DraftsPage";
import SummariesPage from "@/components/dashboard/SummariesPage";
import CalendarPage from "@/components/dashboard/CalendarPage";
import DocumentsPage from "@/components/dashboard/DocumentsPage";
import AnalyticsPage from "@/components/dashboard/AnalyticsPage";
import SettingsPage from "@/components/dashboard/SettingsPage";
import AIChatbotPage from "@/components/dashboard/AIChatbotPage";
import EmailParserPage from "@/components/dashboard/EmailParserPage";
import ReplyGeneratorPage from "@/components/dashboard/ReplyGeneratorPage";


const Dashboard = () => (
  <Routes>
    <Route element={<DashboardLayout />}>
      <Route index element={<Navigate to="inbox" replace />} />
      <Route path="inbox" element={<InboxPage />} />
      <Route path="drafts" element={<DraftsPage />} />
      <Route path="summaries" element={<SummariesPage />} />
      <Route path="calendar" element={<CalendarPage />} />
      <Route path="documents" element={<DocumentsPage />} />
      <Route path="analytics" element={<AnalyticsPage />} />
      <Route path="settings" element={<SettingsPage />} />
      <Route path="ai-chat" element={<AIChatbotPage />} />
      <Route path="email-parser" element={<EmailParserPage />} />
      <Route path="reply-generator" element={<ReplyGeneratorPage />} />
      
    </Route>
  </Routes>
);

export default Dashboard;
