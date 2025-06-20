import { useLocation } from "wouter";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const pageInfo = {
  "/": {
    title: "Dashboard Overview",
    subtitle: "Track your learning progress and development insights",
  },
  "/journal": {
    title: "Developer Journal",
    subtitle: "Capture your daily learning insights and discoveries",
  },
  "/bugs": {
    title: "Bug Vault",
    subtitle: "Document bugs and their solutions for future reference",
  },
  "/snippets": {
    title: "Snippet Library",
    subtitle: "Organize and reuse your code snippets",
  },
  "/analytics": {
    title: "Visual Analytics",
    subtitle: "Analyze your learning patterns and development insights",
  },
  "/turtle": {
    title: "Learning Journey",
    subtitle: "Artistic representation of your development learning path",
  },
};

interface HeaderProps {
  onNewEntry?: () => void;
  showNewButton?: boolean;
}

export default function Header({ 
  onNewEntry, 
  showNewButton = true 
}: HeaderProps) {
  const [location] = useLocation();
  const info = pageInfo[location as keyof typeof pageInfo] || pageInfo["/"];

  return (
    <header className="bg-dev-surface border-b border-dev-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-dev-text">{info.title}</h2>
          <p className="text-sm text-dev-text-muted">{info.subtitle}</p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Quick Actions */}
          {showNewButton && onNewEntry && (
            <Button
              onClick={onNewEntry}
              className="bg-dev-accent hover:bg-blue-600 text-white"
            >
              <Plus className="mr-2" size={16} />
              New Entry
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
