import { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail, Inbox, FileEdit, FileText, Calendar, BarChart3,
  Settings, Bot, Zap, MessageSquare, PanelLeftClose, PanelLeft,
  Menu, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

const navSections = [
  {
    label: "Kryesore",
    items: [
      { title: "Inbox", url: "/dashboard/inbox", icon: Inbox },
      { title: "Draftet", url: "/dashboard/drafts", icon: FileEdit },
      { title: "Përmbledhje", url: "/dashboard/summaries", icon: FileText },
      { title: "Kalendari", url: "/dashboard/calendar", icon: Calendar },
      { title: "Dokumentet", url: "/dashboard/documents", icon: FileText },
      { title: "Analitika", url: "/dashboard/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Mjetet AI",
    items: [
      { title: "Chat AI", url: "/dashboard/ai-chat", icon: Bot },
      { title: "Analizues Email", url: "/dashboard/email-parser", icon: MessageSquare },
      { title: "Gjeneruesi Përgjigjeve", url: "/dashboard/reply-generator", icon: Zap },
    ],
  },
];

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();

  // Close mobile sidebar on navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <Mail className="h-4 w-4 text-primary-foreground" />
          </div>
          {(!collapsed || isMobile) && (
            <>
              <span className="font-heading text-sm font-bold text-foreground">MailMind</span>
              <span className="gradient-text font-heading text-sm font-bold">AI</span>
            </>
          )}
        </Link>
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-4 px-3 space-y-6">
        {navSections.map((section) => (
          <div key={section.label}>
            {(!collapsed || isMobile) && (
              <span className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                {section.label}
              </span>
            )}
            <div className="mt-2 space-y-1">
              {section.items.map((item) => {
                const active = location.pathname === item.url;
                const isCollapsedDesktop = collapsed && !isMobile;
                return (
                  <Link
                    key={item.url}
                    to={item.url}
                    className={`sidebar-item ${active ? "active" : ""} ${isCollapsedDesktop ? "justify-center px-0" : ""}`}
                    title={isCollapsedDesktop ? item.title : undefined}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!isCollapsedDesktop && <span className="text-sm">{item.title}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="border-t border-sidebar-border p-3 space-y-1">
        <Link
          to="/dashboard/settings"
          className={`sidebar-item ${location.pathname === "/dashboard/settings" ? "active" : ""} ${collapsed && !isMobile ? "justify-center px-0" : ""}`}
        >
          <Settings className="h-4 w-4 shrink-0" />
          {(!collapsed || isMobile) && <span className="text-sm">Cilësimet</span>}
        </Link>
        {!isMobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`sidebar-item w-full ${collapsed ? "justify-center px-0" : ""}`}
          >
            {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            {!collapsed && <span className="text-sm">Mbyll</span>}
          </button>
        )}
      </div>
    </>
  );

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobile && mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar - desktop */}
      {!isMobile && (
        <motion.aside
          animate={{ width: collapsed ? 72 : 256 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="h-full border-r border-sidebar-border bg-sidebar flex flex-col shrink-0"
        >
          {sidebarContent}
        </motion.aside>
      )}

      {/* Sidebar - mobile drawer */}
      <AnimatePresence>
        {isMobile && mobileOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="fixed left-0 top-0 z-50 h-full w-[280px] border-r border-sidebar-border bg-sidebar flex flex-col"
          >
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 md:h-16 border-b border-border/50 flex items-center justify-between px-3 md:px-6 bg-background/80 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-2 flex-1">
            {isMobile && (
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)} className="shrink-0">
                <Menu className="h-5 w-5" />
              </Button>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto scrollbar-thin p-3 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
