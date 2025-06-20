import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  color: "blue" | "red" | "green" | "yellow";
}

const colorClasses = {
  blue: {
    icon: "text-dev-accent bg-dev-accent/20",
    border: "hover:border-dev-accent",
  },
  red: {
    icon: "text-dev-error bg-dev-error/20",
    border: "hover:border-dev-error",
  },
  green: {
    icon: "text-dev-success bg-dev-success/20",
    border: "hover:border-dev-success",
  },
  yellow: {
    icon: "text-dev-warning bg-dev-warning/20",
    border: "hover:border-dev-warning",
  },
};

export default function StatsCard({ title, value, icon: Icon, trend, color }: StatsCardProps) {
  const colorClass = colorClasses[color];

  return (
    <div className={`bg-dev-surface rounded-xl p-6 border border-dev-border ${colorClass.border} transition-colors`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-dev-text-muted text-sm">{title}</p>
          <p className="text-2xl font-bold text-dev-text">{value}</p>
        </div>
        <div className={`w-12 h-12 ${colorClass.icon} rounded-lg flex items-center justify-center`}>
          <Icon size={20} />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center text-sm">
          <span className="text-dev-success">+{trend.value}%</span>
          <span className="text-dev-text-muted ml-2">{trend.label}</span>
        </div>
      )}
    </div>
  );
}
