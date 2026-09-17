import { CheckCheck, Inbox, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import EmptyState from "../components/ui/EmptyState";
import ErrorState from "../components/ui/ErrorState";
import LoadingState from "../components/ui/LoadingState";
import { notificationService } from "../services/notification.service";

const TYPE_ICONS = {
  opportunity: "🎯",
  reminder: "🔔",
  milestone: "🏆",
  assessment: "📝",
  announcement: "📢",
  resource: "📚",
};

function formatTime(dateString) {
  const date = new Date(dateString);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [marking, setMarking] = useState(false);
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    setError("");
    notificationService
      .list()
      .then((res) => {
        if (res.success) setNotifications(res.data || []);
      })
      .catch((err) => setError(err.message || "Unable to load notifications."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let cancelled = false;
    notificationService
      .list()
      .then((res) => {
        if (!cancelled && res.success) setNotifications(res.data || []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Unable to load notifications.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const openNotification = async (notification) => {
    if (!notification.read) {
      try {
        await notificationService.markAsRead(notification._id);
        setNotifications((prev) => prev.map((item) => item._id === notification._id ? { ...item, read: true } : item));
      } catch {
        setError("Unable to mark notifications as read.");
      }
    }
    if (notification.link) {
      if (notification.link.startsWith("http")) {
        window.open(notification.link, "_blank", "noopener,noreferrer");
      } else {
        navigate(notification.link);
      }
    }
  };

  const markAllRead = async () => {
    setMarking(true);
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    } catch {
      setError("Unable to mark notifications as read.");
    } finally {
      setMarking(false);
    }
  };

  return (
    <DashboardLayout pageTitle="Notifications">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => navigate(-1)} className="rounded-lg p-2 text-lavender-400 hover:bg-white/5" title="Back">
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-2xl font-black">Notifications</h1>
          </div>
          <p className="mt-2 text-sm text-lavender-400">Stay caught up with opportunities, reminders, and MOYU updates.</p>
        </div>
        {notifications.some((notification) => !notification.read) && (
          <button type="button" onClick={markAllRead} disabled={marking} className="rounded-xl border border-lavender-200/10 px-4 py-2.5 text-sm font-semibold text-lavender-200 transition hover:bg-white/5 disabled:opacity-50">
            <CheckCheck size={16} className="mr-2 inline" /> {marking ? "Marking..." : "Mark all read"}
          </button>
        )}
      </div>

      {error && <div className="mt-6"><ErrorState message={error} onRetry={load} /></div>}
      {loading && notifications.length === 0 && <div className="mt-8"><LoadingState label="Loading notifications..." /></div>}
      {!loading && !error && notifications.length === 0 && (
        <div className="mt-8">
          <EmptyState icon={Inbox} title="You're all caught up" description="New opportunities, reminders, and announcements will appear here." />
        </div>
      )}
      {!loading && !error && notifications.length > 0 && (
        <div className="mt-8 space-y-3">
          {notifications.map((notification) => (
            <button
              key={notification._id}
              type="button"
              onClick={() => openNotification(notification)}
              className={`flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-xl ${
                notification.read ? "border-lavender-200/10 bg-white/[0.03] hover:border-brand-400/20" : "border-brand-400/25 bg-brand-500/10 hover:border-brand-400/40"
              }`}
            >
              <span className="mt-0.5 text-xl">{TYPE_ICONS[notification.type] || "🔔"}</span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-3">
                  <span className={`text-sm font-bold ${notification.read ? "text-lavender-200" : "text-white"}`}>{notification.title}</span>
                  {!notification.read && <span className="h-2 w-2 shrink-0 rounded-full bg-brand-400" />}
                </span>
                <span className="mt-1 block text-sm text-lavender-400">{notification.message}</span>
                <span className="mt-2 block text-[11px] text-lavender-500">{formatTime(notification.createdAt)}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}

export default Notifications;