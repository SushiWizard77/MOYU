import {
  BookOpen,
  BriefcaseBusiness,
  Code2,
  FileText,
  FolderGit2,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Shield,
  TerminalSquare,
  User,
  X,
  Bell,
  ChevronDown,
  UserRound,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import Starfield from "../components/Starfield";
import { useAuth } from "../hooks/useAuth";
import { notificationService } from "../services/notification.service";

const NAV_ITEMS = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/roadmaps", icon: BookOpen, label: "Roadmaps" },
  { to: "/practice", icon: Code2, label: "Practice" },
  { to: "/coding-lab", icon: TerminalSquare, label: "Coding Lab" },
  { to: "/projects", icon: FolderGit2, label: "Projects" },
  { to: "/companies", icon: BriefcaseBusiness, label: "Companies" },
  { to: "/resources", icon: BookOpen, label: "Resources" },
  { to: "/resume", icon: FileText, label: "Resume" },
  { to: "/profile", icon: User, label: "My Profile" },
];

const TYPE_ICONS = {
  opportunity: "🎯",
  reminder: "🔔",
  milestone: "🏆",
  assessment: "📝",
  announcement: "📢",
  resource: "📚",
};

function DashboardLayout({ children, pageTitle = "Dashboard" }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notificationsRef = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let mounted = true;
    notificationService
      .list()
      .then((res) => {
        if (mounted && res.success) {
          setUnreadCount(res.unreadCount || 0);
          setNotifications(res.data || []);
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setSidebarOpen(false);
    navigate("/login", { replace: true });
  };

  const avatarLetter = user?.name ? user.name.charAt(0).toUpperCase() : "S";

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      try {
        await notificationService.markAsRead(notification._id);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notification._id ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {
        // ignore
      }
    }
    if (notification.link) {
      if (notification.link.startsWith("http")) {
        window.open(notification.link, "_blank");
      } else {
        navigate(notification.link);
      }
    }
    setNotificationsOpen(false);
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // ignore
    }
  };

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="app-shell relative min-h-screen overflow-hidden bg-brand-950 text-white">
      <div className="app-shell-glow pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_0%,#1d4fd7_0%,transparent_65%)]" />
      <div className="app-shell-stars pointer-events-none fixed inset-0 opacity-50"><Starfield density={90} shootingStars={false} /></div>
      <header className="app-chrome fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between border-b border-white/10 bg-brand-950/90 px-5 backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-3">
          <Logo size={34} />
          <span className="text-xl font-bold">MOYU</span>
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
        className={`app-chrome fixed bottom-0 left-0 top-0 z-50 w-64 border-r border-white/10 bg-brand-950/95 backdrop-blur-xl transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-20 items-center gap-3 border-b border-white/10 px-5">
            <Logo size={38} tagline="Placement Hub" />
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
            {NAV_ITEMS.map((item) => (
              <SidebarLink
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                active={location.pathname === item.to}
                onClick={() => setSidebarOpen(false)}
              />
            ))}
            {user?.role === "admin" && (
              <SidebarLink
                to="/admin"
                icon={Shield}
                label="Admin Panel"
                active={location.pathname.startsWith("/admin")}
                onClick={() => setSidebarOpen(false)}
              />
            )}
          </nav>

          <div className="border-t border-lavender-200/10 p-4">
            <Link to="/settings" className="app-sidebar-link flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-lavender-400 transition hover:bg-white/5 hover:text-white">
              <Settings size={18} />
              <span>Settings</span>
            </Link>
            <Link to="/profile" className="app-sidebar-link mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-lavender-400 transition hover:bg-white/5 hover:text-white">
              <UserRound size={18} />
              <span>My Profile</span>
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
        <header className="app-chrome hidden h-20 items-center justify-between border-b border-lavender-200/10 px-8 lg:flex">
          <div>
            <p className="text-sm text-lavender-500">{pageTitle}</p>
            <p className="text-sm text-lavender-300">
              {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>

          <div className="flex items-center gap-5">
            {/* Notifications Dropdown */}
            <div className="relative" ref={notificationsRef}>
              <button
                type="button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative rounded-xl border border-lavender-200/10 p-2.5 text-lavender-400 transition hover:bg-white/5 hover:text-white"
                aria-label="Notifications"
                aria-expanded={notificationsOpen}
              >
                <Bell size={19} />
                {unreadCount > 0 && (
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-brand-400" />
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-lavender-200/10 bg-brand-950/98 shadow-2xl overflow-hidden animate-moyu-rise">
                  <div className="flex items-center justify-between border-b border-lavender-200/10 p-4">
                    <h3 className="font-bold">Notifications</h3>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAllRead();
                          }}
                          className="text-xs font-semibold text-brand-300 hover:text-brand-200"
                        >
                          Mark all read
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setNotificationsOpen(false)}
                        className="rounded-lg p-1 text-lavender-400 hover:bg-white/5 hover:text-white"
                      >
                        <ChevronDown size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-lavender-500">
                        <Bell className="mx-auto mb-2 text-lavender-500/50" size={24} />
                        <p className="text-sm">No notifications yet</p>
                      </div>
                    ) : (
                      <ul className="divide-y divide-lavender-200/10">
                        {notifications.slice(0, 20).map((notification) => (
                          <li
                            key={notification._id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`flex items-start gap-3 p-4 cursor-pointer transition ${
                              !notification.read ? "bg-brand-500/10" : "hover:bg-brand-950/50"
                            }`}
                          >
                            <span className="flex-shrink-0 mt-0.5 text-lg">{TYPE_ICONS[notification.type] || "🔔"}</span>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm ${!notification.read ? "font-semibold text-white" : "text-lavender-200"}`}>
                                {notification.title}
                              </p>
                              <p className="mt-0.5 text-xs text-lavender-500 line-clamp-2">{notification.message}</p>
                              <p className="mt-1.5 text-[10px] text-lavender-500/70">{formatTime(notification.createdAt)}</p>
                            </div>
                            {!notification.read && (
                              <span className="flex-shrink-0 h-2 w-2 rounded-full bg-brand-400 mt-1.5" />
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {notifications.length > 20 && (
                    <div className="border-t border-lavender-200/10 p-3 text-center">
                      <Link
                        to="/notifications"
                        className="text-xs font-semibold text-brand-300 hover:text-brand-200 flex items-center justify-center gap-1"
                      >
                        View all notifications <ChevronDown size={12} />
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="h-8 w-px bg-lavender-200/10" />

            <Link to="/profile" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-brand-400 to-brand-700 font-bold">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  avatarLetter
                )}
              </div>
              <div>
                <p className="text-sm font-semibold hover:text-brand-300 transition">{user?.name || "Student"}</p>
                <p className="text-xs text-lavender-500">{user?.department || "MOYU Student"}</p>
              </div>
            </Link>
          </div>
        </header>

        <div key={location.pathname} className="page-enter px-5 pb-12 pt-24 sm:px-8 lg:px-10 lg:pt-8">{children}</div>
      </main>
    </div>
  );
}

function SidebarLink({ to, icon: Icon, label, active = false, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`app-sidebar-link flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
        active ? "app-sidebar-link-active bg-brand-600/25 font-semibold text-lavender-100" : "text-lavender-400 hover:bg-white/5 hover:text-white"
      }`}
    >
      <Icon size={18} />
      {label}
    </Link>
  );
}

export default DashboardLayout;
