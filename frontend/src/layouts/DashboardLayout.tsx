import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogOut } from "lucide-react";

const navigation = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Experiments", path: "/experiments" },
  { name: "Leaderboard", path: "/leaderboard" },
  { name: "Analytics", path: "/analytics" },
  { name: "Metrics", path: "/metrics" },
  { name: "Activity", path: "/activity" },
];

const sidebarLinkClass = ({ isActive }: { isActive: boolean }) =>
  `block w-full rounded-lg px-4 py-2 text-sm font-medium transition ${
    isActive
      ? "bg-slate-700 text-white"
      : "text-slate-400 hover:bg-slate-800 hover:text-white"
  }`;

const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
  `block w-full rounded-lg px-4 py-3 text-sm font-medium transition ${
    isActive
      ? "bg-slate-700 text-white"
      : "text-slate-300 hover:bg-slate-800 hover:text-white"
  }`;

const DashboardLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">

      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-800 bg-slate-900 md:block">
        <div className="border-b border-slate-800 px-6 py-6">
          <h1 className="text-xl font-bold">EvalForge AI</h1>
          <p className="mt-1 text-xs text-slate-400">
            AI Evaluation Platform
          </p>
        </div>

        <nav className="space-y-1 p-4">
          {navigation.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={sidebarLinkClass}
            >
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full border-t border-slate-800 p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-slate-800 hover:text-red-300"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="min-w-0 md:pl-64">

        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
          <div className="flex items-center justify-between px-4 py-4 sm:px-6 md:px-8">

            <div className="md:hidden">
              <h2 className="font-semibold leading-tight">
                EvalForge AI
              </h2>

              <p className="text-xs text-slate-500">
                AI Model Evaluation Platform
              </p>
            </div>

            <div className="hidden md:block" />

            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              className="rounded-lg border border-slate-800 p-2 text-slate-300 transition hover:bg-slate-800 hover:text-white md:hidden"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          <nav
            className={`overflow-hidden border-t border-slate-800 bg-slate-950 transition-[max-height] duration-200 ease-in-out md:hidden ${
              mobileOpen ? "max-h-[500px]" : "max-h-0 border-t-0"
            }`}
          >
            <div className="space-y-1 px-4 py-3">
              {navigation.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={mobileLinkClass}
                >
                  {item.name}
                </NavLink>
              ))}

              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-400 transition hover:bg-slate-800 hover:text-red-300"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </nav>
        </header>

        {/* Page Content */}
        <main className="min-w-0">
          <Outlet />
        </main>

      </div>
    </div>
  );
};

export default DashboardLayout;