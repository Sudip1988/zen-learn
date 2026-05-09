import { NavLink } from "react-router-dom";
import { Home, BookOpen, Settings } from "lucide-react";

const navItems = [
  { to: "/home", icon: Home, label: "Home" },
  { to: "/catalogues", icon: BookOpen, label: "Learn" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-zen-void/95 backdrop-blur-md border-t border-zen-border safe-area-pb">
      <div className="flex max-w-2xl mx-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `relative flex-1 flex flex-col items-center gap-1 pt-3 pb-2 transition-colors ${
                isActive ? "text-zen-accent" : "text-zen-muted hover:text-zen-text-secondary"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {/* Active indicator line */}
                <span
                  className={`absolute top-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full transition-all duration-300 ${
                    isActive ? "w-8 bg-zen-accent shadow-glow-sm" : "w-0 bg-transparent"
                  }`}
                />
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium tracking-wide uppercase">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
