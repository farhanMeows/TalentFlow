import { Link, NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-[rgba(255,255,255,0.06)] bg-[#1e1e1e]/90 backdrop-blur-md shadow-[0_2px_10px_rgba(0,0,0,0.4)]">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Brand */}
          <Link
            to="/"
            className="text-2xl font-bold bg-gradient-to-r from-[#bb85fb] to-[#00dac5] bg-clip-text text-transparent"
          >
            talentFlow
          </Link>

          {/* Nav Links */}
          <nav className="flex items-center gap-2 text-sm">
            <NavLink
              to="/jobs"
              className={({ isActive }) =>
                [
                  "rounded-md px-3 py-1.5 transition-colors duration-200",
                  isActive
                    ? "bg-[#bb85fb]/20 text-[#bb85fb] font-semibold"
                    : "text-[#a0a0a0] hover:text-white hover:bg-[#121212]",
                ].join(" ")
              }
            >
              Jobs
            </NavLink>
            <NavLink
              to="/candidates"
              className={({ isActive }) =>
                [
                  "rounded-md px-3 py-1.5 transition-colors duration-200",
                  isActive
                    ? "bg-[#00dac5]/20 text-[#00dac5] font-semibold"
                    : "text-[#a0a0a0] hover:text-white hover:bg-[#121212]",
                ].join(" ")
              }
            >
              Candidates
            </NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
}
