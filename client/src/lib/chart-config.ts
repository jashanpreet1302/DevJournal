import type { ChartConfiguration } from "chart.js";

const chartColors = {
  primary: "#3B82F6",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  purple: "#8B5CF6",
  text: "#E2E8F0",
  textMuted: "#94A3B8",
  border: "#475569",
};

export const defaultChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: chartColors.text,
        usePointStyle: true,
        padding: 20,
      },
    },
    tooltip: {
      backgroundColor: "rgba(30, 41, 59, 0.95)",
      titleColor: chartColors.text,
      bodyColor: chartColors.text,
      borderColor: chartColors.border,
      borderWidth: 1,
    },
  },
  scales: {
    x: {
      ticks: { 
        color: chartColors.textMuted,
        font: { size: 12 },
      },
      grid: { 
        color: chartColors.border,
        drawBorder: false,
      },
    },
    y: {
      ticks: { 
        color: chartColors.textMuted,
        font: { size: 12 },
      },
      grid: { 
        color: chartColors.border,
        drawBorder: false,
      },
    },
  },
};

export function createLineChartConfig(
  labels: string[],
  datasets: Array<{
    label: string;
    data: number[];
    color?: string;
  }>
): ChartConfiguration {
  return {
    type: "line",
    data: {
      labels,
      datasets: datasets.map((dataset) => ({
        label: dataset.label,
        data: dataset.data,
        borderColor: dataset.color || chartColors.primary,
        backgroundColor: `${dataset.color || chartColors.primary}20`,
        tension: 0.4,
        fill: true,
      })),
    },
    options: defaultChartOptions,
  };
}

export function createBarChartConfig(
  labels: string[],
  datasets: Array<{
    label: string;
    data: number[];
    color?: string;
  }>
): ChartConfiguration {
  return {
    type: "bar",
    data: {
      labels,
      datasets: datasets.map((dataset) => ({
        label: dataset.label,
        data: dataset.data,
        backgroundColor: dataset.color || chartColors.primary,
        borderRadius: 4,
      })),
    },
    options: {
      ...defaultChartOptions,
      scales: {
        ...defaultChartOptions.scales,
        x: {
          ...defaultChartOptions.scales.x,
          grid: {
            ...defaultChartOptions.scales.x.grid,
            display: false,
          },
        },
      },
    },
  };
}

export function createDoughnutChartConfig(
  labels: string[],
  data: number[],
  colors?: string[]
): ChartConfiguration {
  const defaultColors = [
    chartColors.primary,
    chartColors.success,
    chartColors.warning,
    chartColors.error,
    chartColors.purple,
  ];

  return {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors || defaultColors,
          borderWidth: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: chartColors.text,
            usePointStyle: true,
            padding: 20,
          },
        },
        tooltip: {
          backgroundColor: "rgba(30, 41, 59, 0.95)",
          titleColor: chartColors.text,
          bodyColor: chartColors.text,
          borderColor: chartColors.border,
          borderWidth: 1,
        },
      },
    },
  };
}
