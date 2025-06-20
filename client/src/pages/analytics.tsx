import { useQuery } from "@tanstack/react-query";
import ChartWrapper from "@/components/chart-wrapper";
import { createLineChartConfig, createBarChartConfig, createDoughnutChartConfig } from "@/lib/chart-config";
import { format, subDays } from "date-fns";
import type { DashboardStats, ActivityData, TechnologyDistribution } from "@shared/schema";

export default function Analytics() {
  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/analytics/dashboard"],
  });

  const { data: activityData } = useQuery<ActivityData[]>({
    queryKey: ["/api/analytics/activity", 30],
    queryFn: () => fetch("/api/analytics/activity?days=30").then(res => res.json()),
  });

  const { data: weeklyActivity } = useQuery<ActivityData[]>({
    queryKey: ["/api/analytics/activity", 7],
    queryFn: () => fetch("/api/analytics/activity?days=7").then(res => res.json()),
  });

  const { data: techData } = useQuery<TechnologyDistribution[]>({
    queryKey: ["/api/analytics/technologies"],
  });

  // Prepare chart data
  const bugResolutionChart = weeklyActivity ? createBarChartConfig(
    weeklyActivity.map(d => format(new Date(d.date), "EEE")),
    [
      {
        label: "Bugs Resolved",
        data: weeklyActivity.map(d => d.bugsResolved),
        color: "#10B981",
      },
      {
        label: "New Entries",
        data: weeklyActivity.map(d => d.journalEntries),
        color: "#3B82F6",
      },
    ]
  ) : null;

  const difficultyChart = createDoughnutChartConfig(
    ["Beginner", "Intermediate", "Advanced"],
    [30, 45, 25],
    ["#10B981", "#F59E0B", "#EF4444"]
  );

  const learningVsBugChart = activityData ? createLineChartConfig(
    activityData.map(d => format(new Date(d.date), "MMM d")),
    [
      {
        label: "Learning Sessions",
        data: activityData.map(d => d.journalEntries),
        color: "#3B82F6",
      },
      {
        label: "Bugs Encountered",
        data: activityData.map(d => d.bugsResolved),
        color: "#EF4444",
      },
    ]
  ) : null;

  const generateHeatmapData = () => {
    const today = new Date();
    const weeks = 12;
    const data = [];
    
    for (let week = 0; week < weeks; week++) {
      const weekData = [];
      for (let day = 0; day < 7; day++) {
        const date = subDays(today, (weeks - week - 1) * 7 + (6 - day));
        const dayActivity = activityData?.find(d => 
          format(new Date(d.date), "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
        );
        const intensity = dayActivity 
          ? Math.min((dayActivity.journalEntries + dayActivity.bugsResolved + dayActivity.snippetsAdded) / 5, 1)
          : 0;
        weekData.push({ date, intensity });
      }
      data.push(weekData);
    }
    
    return data;
  };

  const heatmapData = generateHeatmapData();

  const getIntensityClass = (intensity: number) => {
    if (intensity === 0) return "bg-dev-bg";
    if (intensity <= 0.25) return "bg-dev-accent/30";
    if (intensity <= 0.5) return "bg-dev-accent/60";
    if (intensity <= 0.75) return "bg-dev-accent/80";
    return "bg-dev-accent";
  };

  return (
    <div>
      <header className="bg-dev-surface border-b border-dev-border px-6 py-4">
        <div>
          <h2 className="text-xl font-semibold text-dev-text">Visual Analytics</h2>
          <p className="text-sm text-dev-text-muted">Analyze your learning patterns and development insights</p>
        </div>
      </header>

      <div className="p-6 space-y-8">
        {/* Analytics Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-dev-surface rounded-xl p-6 border border-dev-border">
            <h3 className="text-lg font-semibold text-dev-text mb-4">Bug Resolution Rate</h3>
            <div className="h-64">
              {bugResolutionChart ? (
                <ChartWrapper config={bugResolutionChart} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-dev-text-muted">Loading chart...</div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-dev-surface rounded-xl p-6 border border-dev-border">
            <h3 className="text-lg font-semibold text-dev-text mb-4">Learning Difficulty</h3>
            <div className="h-64">
              <ChartWrapper config={difficultyChart} />
            </div>
          </div>

          <div className="bg-dev-surface rounded-xl p-6 border border-dev-border">
            <h3 className="text-lg font-semibold text-dev-text mb-4">Weekly Activity</h3>
            <div className="space-y-3">
              {weeklyActivity?.map((activity, index) => {
                const total = activity.journalEntries + activity.bugsResolved + activity.snippetsAdded;
                const maxTotal = 10; // Assume max 10 activities per day
                const percentage = Math.min((total / maxTotal) * 100, 100);
                
                return (
                  <div key={activity.date} className="flex items-center justify-between">
                    <span className="text-dev-text-muted text-sm w-20">
                      {format(new Date(activity.date), "EEE")}
                    </span>
                    <div className="flex-1 mx-3 bg-dev-bg rounded-full h-2">
                      <div 
                        className="bg-dev-accent h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-dev-text text-sm w-8 text-right">{total}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Heatmap */}
        <div className="bg-dev-surface rounded-xl p-6 border border-dev-border">
          <h3 className="text-lg font-semibold text-dev-text mb-4">Learning Activity Heatmap</h3>
          <div className="space-y-2">
            {heatmapData.map((week, weekIndex) => (
              <div key={weekIndex} className="flex space-x-1">
                {week.map((day, dayIndex) => (
                  <div
                    key={dayIndex}
                    className={`w-3 h-3 rounded-sm ${getIntensityClass(day.intensity)}`}
                    title={`${format(day.date, "MMM d, yyyy")} - ${Math.round(day.intensity * 10)} activities`}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-4 text-xs text-dev-text-muted">
            <span>Less</span>
            <div className="flex space-x-1">
              <div className="w-3 h-3 bg-dev-bg rounded-sm" />
              <div className="w-3 h-3 bg-dev-accent/30 rounded-sm" />
              <div className="w-3 h-3 bg-dev-accent/60 rounded-sm" />
              <div className="w-3 h-3 bg-dev-accent rounded-sm" />
            </div>
            <span>More</span>
          </div>
        </div>

        {/* Technology Distribution */}
        {techData && techData.length > 0 && (
          <div className="bg-dev-surface rounded-xl p-6 border border-dev-border">
            <h3 className="text-lg font-semibold text-dev-text mb-4">Technology Usage</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {techData.slice(0, 6).map((tech) => (
                <div key={tech.name} className="bg-dev-bg rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-dev-text font-medium">{tech.name}</span>
                    <span className="text-dev-text-muted text-sm">{tech.percentage}%</span>
                  </div>
                  <div className="w-full bg-dev-border rounded-full h-2">
                    <div
                      className="bg-dev-accent h-2 rounded-full transition-all duration-300"
                      style={{ width: `${tech.percentage}%` }}
                    />
                  </div>
                  <div className="mt-1 text-xs text-dev-text-muted">
                    {tech.count} entries
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Large Analytics Chart */}
        <div className="bg-dev-surface rounded-xl p-6 border border-dev-border">
          <h3 className="text-lg font-semibold text-dev-text mb-4">Learning vs Bug Ratio</h3>
          <div className="h-96">
            {learningVsBugChart ? (
              <ChartWrapper config={learningVsBugChart} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-dev-text-muted">Loading chart...</div>
              </div>
            )}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-dev-surface rounded-xl p-6 border border-dev-border text-center">
            <div className="text-2xl font-bold text-dev-accent mb-2">{stats?.totalInsights || 0}</div>
            <div className="text-dev-text-muted">Total Learning Sessions</div>
          </div>
          <div className="bg-dev-surface rounded-xl p-6 border border-dev-border text-center">
            <div className="text-2xl font-bold text-dev-success mb-2">{stats?.bugsResolved || 0}</div>
            <div className="text-dev-text-muted">Bugs Resolved</div>
          </div>
          <div className="bg-dev-surface rounded-xl p-6 border border-dev-border text-center">
            <div className="text-2xl font-bold text-dev-warning mb-2">{stats?.streak || 0}</div>
            <div className="text-dev-text-muted">Day Learning Streak</div>
          </div>
        </div>
      </div>
    </div>
  );
}
