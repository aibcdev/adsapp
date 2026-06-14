import { Link, NavLink, Outlet } from "react-router-dom";
import { SiteHeader } from "../SiteHeader";
import { SiteFooter } from "../SiteFooter";

const tabs = [
  { to: "/admin/payouts", label: "Payouts" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/limits", label: "Limits" },
  { to: "/admin/competitive", label: "Competitive" },
];

export function AdminShell() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <SiteHeader />
      <div className="mx-auto max-w-6xl px-6 py-24 md:px-12">
        <h1 className="font-instrument-serif text-3xl text-white">Admin</h1>
        <nav className="mt-6 flex flex-wrap gap-2">
          {tabs.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-medium ${
                  isActive ? "bg-white text-black" : "border border-zinc-700 text-zinc-300 hover:border-zinc-500"
                }`
              }
            >
              {t.label}
            </NavLink>
          ))}
          <Link to="/dashboard" className="ml-auto text-sm text-zinc-500 hover:text-zinc-300">
            ← Dashboard
          </Link>
        </nav>
        <div className="mt-8">
          <Outlet />
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
