import { useQuery } from "@tanstack/react-query";
import { Lightbulb, Bug, Code, Flame } from "lucide-react";
import StatsCard from "@/components/stats-card";
import ChartWrapper from "@/components/chart-wrapper";
import { createLineChartConfig, createDoughnutChartConfig } from "@/lib/chart-config";
import { format } from "date-fns";
import type { DashboardStats, ActivityData, TechnologyDistribution } from "@shared/schema";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/analytics/dashboard"],
  });

  const { data: activityData, isLoading: activityLoading } = useQuery<ActivityData[]>({
    queryKey: ["/api/analytics/activity"],
    queryFn: () => fetch("/api/analytics/activity?days=7").then(res => res.json()),
  });

  const { data: techData, isLoading: techLoading } = useQuery<TechnologyDistribution[]>({
    queryKey: ["/api/analytics/technologies"],
  });

  if (statsLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-dev-surface rounded-xl p-6 border border-dev-border animate-pulse">
              <div className="h-16 bg-dev-bg rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Prepare chart data
  const learningChartConfig = activityData ? createLineChartConfig(
    activityData.map(d => format(new Date(d.date), "EEE")),
    [
      {
        label: "Learning Sessions",
        data: activityData.map(d => d.journalEntries),
        color: "#3B82F6",
      },
    ]
  ) : null;

  const techChartConfig = techData ? createDoughnutChartConfig(
    techData.slice(0, 5).map(t => t.name),
    techData.slice(0, 5).map(t => t.count)
  ) : null;

  return (
    <div className="p-6 space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Insights"
          value={stats?.totalInsights || 0}
          icon={Lightbulb}
          color="blue"
          trend={{
            value: stats?.weeklyGrowth.insights || 0,
            label: "from last week",
          }}
        />
        <StatsCard
          title="Bugs Resolved"
          value={stats?.bugsResolved || 0}
          icon={Bug}
          color="red"
          trend={{
            value: stats?.weeklyGrowth.bugs || 0,
            label: "resolution rate",
          }}
        />
        <StatsCard
          title="Code Snippets"
          value={stats?.snippets || 0}
          icon={Code}
          color="green"
        />
        <StatsCard
          title="Learning Streak"
          value={stats?.streak || 0}
          icon={Flame}
          color="yellow"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-dev-surface rounded-xl p-6 border border-dev-border">
          <h3 className="text-lg font-semibold text-dev-text mb-4">Weekly Learning Activity</h3>
          <div className="h-64">
            {learningChartConfig && !activityLoading ? (
              <ChartWrapper config={learningChartConfig} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-dev-text-muted">Loading chart...</div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-dev-surface rounded-xl p-6 border border-dev-border">
          <h3 className="text-lg font-semibold text-dev-text mb-4">Technology Distribution</h3>
          <div className="h-64">
            {techChartConfig && !techLoading ? (
              <ChartWrapper config={techChartConfig} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-dev-text-muted">Loading chart...</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-dev-surface rounded-xl p-6 border border-dev-border">
        <h3 className="text-lg font-semibold text-dev-text mb-4">Recent Activity</h3>
        {activityData && activityData.length > 0 ? (
          <div className="space-y-4">
            {activityData.slice(-3).reverse().map((activity, index) => (
              <div key={activity.date} className="flex items-center p-4 bg-dev-bg rounded-lg">
                <div className="w-10 h-10 bg-dev-accent/20 rounded-lg flex items-center justify-center mr-4">
                  <Lightbulb className="text-dev-accent" size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-dev-text font-medium">
                    {activity.journalEntries} journal entries, {activity.bugsResolved} bugs resolved, {activity.snippetsAdded} snippets added
                  </p>
                  <p className="text-dev-text-muted text-sm">
                    {format(new Date(activity.date), "EEEE, MMMM d")}
                  </p>
                </div>
                <span className="text-dev-text-muted text-sm">
                  {index === 0 ? "Today" : `${index + 1} days ago`}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Lightbulb className="mx-auto text-dev-text-muted mb-4" size={48} />
            <h4 className="text-lg font-medium text-dev-text mb-2">No Activity Yet</h4>
            <p className="text-dev-text-muted">Start by creating your first journal entry, reporting a bug, or saving a code snippet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
