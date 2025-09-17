import { Link, NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-14 items-center justify-between">
          <Link to="/" className="text-base font-semibold text-indigo-700">
            talentFlow
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <NavLink
              to="/jobs"
              className={({ isActive }) =>
                "rounded px-3 py-1.5 " +
                (isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-700 hover:bg-slate-100")
              }
            >
              Jobs
            </NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
}
