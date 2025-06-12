import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const ChartBar = ({ data, label, title, color = "rgba(54, 162, 235, 0.6)" }) => {
  const canvasRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = canvasRef.current.getContext("2d");
    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: Object.keys(data),
        datasets: [
          {
            label,
            data: Object.values(data),
            backgroundColor: color,
            borderRadius: 5,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: !!title,
            text: title,
          },
          legend: {
            display: false,
          },
        },
      },
    });
  }, [data, label, title, color]);

  return <canvas ref={canvasRef}></canvas>;
};

export default ChartBar;
