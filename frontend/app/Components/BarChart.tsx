import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";
import axios from "axios";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const url = "http://localhost:3010/api/stats/range";

export default function RangeBarChart({ month }: { month: string }) {
  const [rangeData, setRangeData] = useState([]);
  async function getData() {
    const res = await axios.get(`${url}?month=${month}`);
    const data = res.data;
    setRangeData(data);
  }
  useEffect(() => {
    getData();
  }, [month]);
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: `Statistics for month - ${month}`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  const data = {
    labels: rangeData.map((item) => item.range),
    datasets: [
      {
        label: "Sale Count",
        data: rangeData.map((item) => item.count),
        backgroundColor: "rgba(53, 162, 235, 0.5)",
        borderColor: "rgb(53, 162, 235)",
        borderWidth: 1,
      },
    ],
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <h2 className="text-2xl font-bold">Range Distribution</h2>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <Bar options={options} data={data} />
        </div>
      </CardContent>
    </Card>
  );
}
