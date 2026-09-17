import {
  BarChart3,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  Code2,
  LayoutDashboard,
  LogOut,
  Menu,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const ADMIN_NAV_ITEMS = [
  { to: "/admin", icon: BarChart3, label: "Overview" },
  { to: "/admin/students", icon: Users, label: "Students" },
  { to: "/admin/companies", icon: BriefcaseBusiness, label: "Companies" },
  { to: "/admin/resources", icon: BookOpen, label: "Resources" },
  { to: "/admin/practice", icon: Code2, label: "Practice Questions" },
  { to: "/admin/notifications", icon: Bell, label: "Notifications" },
];

function AdminLayout({ children, pageTitle = "Admin" }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setSidebarOpen(false);
    navigate("/login", { replace: true });
  };

  const avatarLetter = user?.name ? user.name.charAt(0).toUpperCase() : "A";

  return (
    <div className="min-h-screen bg-brand-950 text-white">
      <header className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between border-b border-lavender-200/10 bg-brand-950/95 px-5 backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-700 font-black">
            M
          </div>
          <span className="text-xl font-bold">MOYU Admin</span>
        </div>
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-lg border border-lavender-200/10 p-2"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`fixed bottom-0 left-0 top-0 z-50 w-64 border-r border-lavender-200/10 bg-brand-950 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-20 items-center gap-3 border-b border-lavender-200/10 px-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-700 text-xl font-black shadow-lg shadow-brand-800/30">
              M
            </div>
            <div>
              <p className="text-xl font-bold">MOYU</p>
              <p className="text-[10px] uppercase tracking-widest text-lavender-500">Admin Console</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
            {ADMIN_NAV_ITEMS.map((item) => (
              <SidebarLink
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                active={location.pathname === item.to}
                onClick={() => setSidebarOpen(false)}
              />
            ))}
          </nav>

          <div className="border-t border-lavender-200/10 p-4">
            <Link
              to="/dashboard"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-lavender-400 transition hover:bg-white/5 hover:text-white"
            >
              <LayoutDashboard size={18} />
              <span>Back to Student View</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-lavender-400 transition hover:bg-red-500/10 hover:text-red-400"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="min-h-screen lg:ml-64">
        <header className="hidden h-20 items-center justify-between border-b border-lavender-200/10 px-8 lg:flex">
          <div>
            <p className="text-sm text-lavender-500">{pageTitle}</p>
            <p className="text-sm text-lavender-300">Admin Console</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 font-bold">
              {avatarLetter}
            </div>
            <div>
              <p className="text-sm font-semibold">{user?.name || "Admin"}</p>
              <p className="text-xs text-lavender-500">Administrator</p>
            </div>
          </div>
        </header>

        <div className="px-5 pb-12 pt-24 sm:px-8 lg:px-10 lg:pt-8">{children}</div>
      </main>
    </div>
  );
}

function SidebarLink({ to, icon: Icon, label, active = false, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
        active ? "bg-brand-600/25 font-semibold text-lavender-100" : "text-lavender-400 hover:bg-white/5 hover:text-white"
      }`}
    >
      <Icon size={18} />
      {label}
    </Link>
  );
}

export default AdminLayout;
