'use client';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AreaChart({ data, options = {}, height = 300 }) {
  // Add fill property to datasets if not already present
  const dataWithFill = {
    ...data,
    datasets: data.datasets.map(dataset => ({
      ...dataset,
      fill: dataset.fill !== undefined ? dataset.fill : true,
      tension: 0.4,
    }))
  };

  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
    ...options
  };

  return (
    <div style={{ height: `${height}px` }}>
      <Line data={dataWithFill} options={defaultOptions} />
    </div>
  );
}
