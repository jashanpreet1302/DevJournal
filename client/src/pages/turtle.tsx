import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Download, RefreshCw } from "lucide-react";
import { TurtleGraphics } from "@/lib/turtle-graphics";
import type { DashboardStats, TechnologyDistribution } from "@shared/schema";

export default function Turtle() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const turtleRef = useRef<TurtleGraphics | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [journeyStyle, setJourneyStyle] = useState("spiral");
  const [colorTheme, setColorTheme] = useState("#3B82F6");
  const [timeRange, setTimeRange] = useState("30");
  const [complexity, setComplexity] = useState(5);

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ["/api/analytics/dashboard"],
  });

  const { data: techData } = useQuery<TechnologyDistribution[]>({
    queryKey: ["/api/analytics/technologies"],
  });

  useEffect(() => {
    if (canvasRef.current) {
      turtleRef.current = new TurtleGraphics(canvasRef.current);
    }
  }, []);

  const generateVisualization = async () => {
    if (!turtleRef.current || !stats || !techData) return;

    setIsGenerating(true);
    
    try {
      const journeyData = {
        journalEntries: stats.totalInsights,
        bugsResolved: stats.bugsResolved,
        snippetsAdded: stats.snippets,
        technologies: techData.slice(0, 6).map(t => t.name),
      };

      switch (journeyStyle) {
        case "spiral":
          turtleRef.current.drawLearningJourney(journeyData);
          break;
        case "tree":
          turtleRef.current.drawTreePattern();
          break;
        case "geometric":
          turtleRef.current.drawGeometricPattern();
          break;
        case "organic":
          turtleRef.current.drawSpiralPattern(complexity * 20);
          break;
        default:
          turtleRef.current.drawLearningJourney(journeyData);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const exportVisualization = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement("a");
    link.download = `learning-journey-${new Date().toISOString().split('T')[0]}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  const clearCanvas = () => {
    if (turtleRef.current) {
      turtleRef.current.clear();
    }
  };

  const calculateJourneyStats = () => {
    if (!stats || !techData) return { distance: 0, turns: 0, peaks: 0 };
    
    const totalActivities = stats.totalInsights + stats.bugsResolved + stats.snippets;
    return {
      distance: Math.round(totalActivities * 12.5),
      turns: Math.round(totalActivities * 1.8),
      peaks: techData.length,
    };
  };

  const journeyStats = calculateJourneyStats();

  return (
    <div>
      <header className="bg-dev-surface border-b border-dev-border px-6 py-4">
        <div>
          <h2 className="text-xl font-semibold text-dev-text">Learning Journey Visualization</h2>
          <p className="text-sm text-dev-text-muted">Artistic representation of your development learning path</p>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Turtle Canvas */}
        <div className="bg-dev-surface rounded-xl p-6 border border-dev-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-dev-text">Your Learning Journey</h3>
            <div className="flex space-x-2">
              <Button
                onClick={generateVisualization}
                disabled={isGenerating}
                className="bg-dev-accent hover:bg-blue-600"
              >
                {isGenerating ? (
                  <RefreshCw className="mr-2 animate-spin" size={16} />
                ) : (
                  <Play className="mr-2" size={16} />
                )}
                {isGenerating ? "Generating..." : "Generate"}
              </Button>
              <Button
                onClick={exportVisualization}
                variant="outline"
                className="border-dev-border hover:bg-dev-surface-hover"
              >
                <Download className="mr-2" size={16} />
                Export
              </Button>
              <Button
                onClick={clearCanvas}
                variant="outline"
                className="border-dev-border hover:bg-dev-surface-hover"
              >
                Clear
              </Button>
            </div>
          </div>

          <div className="turtle-canvas rounded-lg h-96 flex items-center justify-center relative overflow-hidden border border-dev-border">
            <canvas
              ref={canvasRef}
              width={800}
              height={400}
              className="max-w-full max-h-full"
            />
          </div>
        </div>

        {/* Controls and Legend */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-dev-surface rounded-xl p-6 border border-dev-border">
            <h3 className="text-lg font-semibold text-dev-text mb-4">Visualization Controls</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-dev-text-muted text-sm mb-2">Journey Style</label>
                <Select value={journeyStyle} onValueChange={setJourneyStyle}>
                  <SelectTrigger className="bg-dev-bg border-dev-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spiral">Spiral Growth</SelectItem>
                    <SelectItem value="tree">Tree Branches</SelectItem>
                    <SelectItem value="geometric">Geometric Patterns</SelectItem>
                    <SelectItem value="organic">Organic Flow</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-dev-text-muted text-sm mb-2">Color Theme</label>
                <div className="flex space-x-2">
                  {[
                    { color: "#3B82F6", name: "Blue" },
                    { color: "#10B981", name: "Green" },
                    { color: "#F59E0B", name: "Yellow" },
                    { color: "#EF4444", name: "Red" },
                    { color: "#8B5CF6", name: "Purple" },
                  ].map((theme) => (
                    <button
                      key={theme.color}
                      onClick={() => setColorTheme(theme.color)}
                      className={`w-8 h-8 rounded border-2 transition-all ${
                        colorTheme === theme.color ? "border-white scale-110" : "border-transparent"
                      }`}
                      style={{ backgroundColor: theme.color }}
                      title={theme.name}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-dev-text-muted text-sm mb-2">Time Range</label>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="bg-dev-bg border-dev-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Last 7 days</SelectItem>
                    <SelectItem value="30">Last 30 days</SelectItem>
                    <SelectItem value="90">Last 90 days</SelectItem>
                    <SelectItem value="365">Last year</SelectItem>
                    <SelectItem value="all">All time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-dev-text-muted text-sm mb-2">
                  Complexity: {complexity}
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={complexity}
                  onChange={(e) => setComplexity(parseInt(e.target.value))}
                  className="w-full accent-dev-accent"
                />
              </div>
            </div>
          </div>

          <div className="bg-dev-surface rounded-xl p-6 border border-dev-border">
            <h3 className="text-lg font-semibold text-dev-text mb-4">Pattern Legend</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-dev-accent rounded mr-3" />
                <span className="text-dev-text-muted text-sm">Learning Sessions</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-dev-error rounded mr-3" />
                <span className="text-dev-text-muted text-sm">Bug Encounters</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-dev-success rounded mr-3" />
                <span className="text-dev-text-muted text-sm">Problem Solved</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-dev-warning rounded mr-3" />
                <span className="text-dev-text-muted text-sm">New Technology</span>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="text-dev-text font-medium mb-2">Journey Stats</h4>
              <div className="space-y-2 text-sm text-dev-text-muted">
                <div className="flex justify-between">
                  <span>Total Distance:</span>
                  <span className="text-dev-text">{journeyStats.distance.toLocaleString()} units</span>
                </div>
                <div className="flex justify-between">
                  <span>Direction Changes:</span>
                  <span className="text-dev-text">{journeyStats.turns}</span>
                </div>
                <div className="flex justify-between">
                  <span>Learning Peaks:</span>
                  <span className="text-dev-text">{journeyStats.peaks}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Insights:</span>
                  <span className="text-dev-text">{stats?.totalInsights || 0}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-dev-bg rounded-lg">
              <h5 className="text-dev-text font-medium mb-2">Interpretation</h5>
              <p className="text-dev-text-muted text-xs leading-relaxed">
                Each line represents your learning journey. The path grows and changes direction based on your activities.
                Longer segments indicate intensive learning periods, while direction changes show encounters with new challenges or technologies.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
