import { useLocation } from "wouter";
import { Brain, ChartPie, BookOpen, Bug, Code, ChartLine, Palette } from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: ChartPie },
  { name: "Developer Journal", href: "/journal", icon: BookOpen },
  { name: "Bug Vault", href: "/bugs", icon: Bug },
  { name: "Snippet Library", href: "/snippets", icon: Code },
  { name: "Visual Analytics", href: "/analytics", icon: ChartLine },
  { name: "Learning Journey", href: "/turtle", icon: Palette },
];

export default function Sidebar() {
  const [location, setLocation] = useLocation();

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-dev-surface border-r border-dev-border">
      <div className="flex flex-col h-full">
        {/* Logo/Brand */}
        <div className="flex items-center px-6 py-4 border-b border-dev-border">
          <Brain className="text-dev-accent text-2xl mr-3" size={32} />
          <div>
            <h1 className="text-lg font-semibold text-dev-text">DevInsightOS</h1>
            <p className="text-xs text-dev-text-muted">Visual Knowledge System</p>
          </div>
        </div>
        
        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <button
                key={item.name}
                onClick={() => setLocation(item.href)}
                className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                  isActive
                    ? "bg-dev-accent text-white"
                    : "text-dev-text-muted hover:bg-dev-surface-hover hover:text-dev-text"
                }`}
              >
                <Icon className="mr-3" size={18} />
                <span className="text-sm">{item.name}</span>
              </button>
            );
          })}
        </nav>

      </div>
    </div>
  );
}
