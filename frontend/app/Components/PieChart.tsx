import React, { useEffect, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import axios from "axios";

ChartJS.register(ArcElement, Tooltip, Legend);

const url = "http://localhost:3010/api/stats/unique";

interface UniqueCategories {
  [key: string]: number;
}

interface ApiResponse {
  UniqueCategories: UniqueCategories;
}

export default function CategoryPieChart({ month }: { month: string }) {
  const [unique, setUnique] = useState<UniqueCategories | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function getUniqueCategories() {
    try {
      setIsLoading(true);
      const res = await axios.get<ApiResponse>(`${url}?month=${month}`);
      setUnique(res.data.UniqueCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getUniqueCategories();
  }, [month]);

  if (isLoading || !unique) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="py-10">
          <p className="text-center">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  const categories = Object.keys(unique);
  const counts = Object.values(unique);

  const data = {
    labels: categories.map((cat) => cat.charAt(0).toUpperCase() + cat.slice(1)),
    datasets: [
      {
        data: counts,
        backgroundColor: [
          "rgba(255, 0, 0, 0.27)",
          "rgba(84, 84, 242, 0.27)",
          "rgba(19, 255, 0, 0.27)",
          "rgba(245, 217, 39, 0.3)",
        ],
        borderColor: ["rgba(54, 162, 235, 1)"],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const label = context.label || "";
            const value = context.raw || 0;
            const total = context.dataset.data.reduce(
              (acc: number, curr: number) => acc + curr,
              0
            );
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  const total = counts.reduce((acc, curr) => acc + curr, 0);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <h2 className="text-2xl font-bold text-center">
          Category Distribution
        </h2>
        <p className="text-center text-gray-500">Total Items: {total}</p>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <Pie data={data} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}
