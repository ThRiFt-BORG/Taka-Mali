import { useMemo } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Filler, Legend } from "chart.js";
import { Line, Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Filler, Legend);

interface ChartViewProps {
  data: Record<string, number>;
  title?: string;
  chartType?: "line" | "bar";
  height?: number;
}

/**
 * ChartView component - displays waste collection trends using Chart.js
 */
export default function ChartView({
  data,
  title = "Waste Collection Trends",
  chartType = "line",
  height = 300,
}: ChartViewProps) {
  const chartData = useMemo(() => {
    const dates = Object.keys(data).sort();
    const values = dates.map((date) => data[date]);

    return {
      labels: dates.map((date) => new Date(date).toLocaleDateString()),
      datasets: [
        {
          label: "Total Volume (tons)",
          data: values,
          borderColor: "#3b82f6",
          backgroundColor: chartType === "bar" ? "rgba(59, 130, 246, 0.5)" : "rgba(59, 130, 246, 0.1)",
          borderWidth: 2,
          tension: 0.4,
          fill: chartType === "line",
          pointRadius: 4,
          pointBackgroundColor: "#3b82f6",
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
        },
      ],
    };
  }, [data, chartType]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: !!title,
        text: title,
        font: {
          size: 14,
          weight: "bold" as const,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Volume (tons)",
        },
      },
      x: {
        title: {
          display: true,
          text: "Date",
        },
      },
    },
  };

  return (
    <div style={{ height, width: "100%" }}>
      {Object.keys(data).length > 0 ? (
        chartType === "line" ? (
          <Line data={chartData} options={options} />
        ) : (
          <Bar data={chartData} options={options} />
        )
      ) : (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          No data available for chart
        </div>
      )}
    </div>
  );
}

