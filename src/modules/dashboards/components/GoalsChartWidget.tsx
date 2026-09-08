import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface GoalsChartWidgetProps {
  goalsEvolution: {
    tournament_name: string
    data: {
      period: string
      goals: number
    }[]
  }[]
}

export function GoalsChartWidget({ goalsEvolution }: GoalsChartWidgetProps) {
  const chartData = {
    labels: goalsEvolution[0]?.data.map(d => d.period) || [],
    datasets: goalsEvolution.map((evol, idx) => ({
      label: evol.tournament_name,
      data: evol.data.map(d => d.goals),
      backgroundColor: idx === 0 ? '#94d3c1' : idx === 1 ? '#e9c349' : '#1B4D3E',
      borderColor: idx === 0 ? '#94d3c1' : idx === 1 ? '#e9c349' : '#1B4D3E',
      borderWidth: 1,
      borderRadius: 4,
    })) || [],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: '#bfc9c4',
          font: {
            family: 'Inter, sans-serif',
            size: 10,
            weight: 'bold' as const,
          },
        },
      },
      tooltip: {
        backgroundColor: '#102034',
        titleColor: '#bfc9c4',
        bodyColor: '#ffffff',
        borderColor: '#26364a',
        borderWidth: 1,
        titleFont: {
          family: 'Inter, sans-serif',
          weight: 'bold' as const,
        },
        bodyFont: {
          family: 'Inter, sans-serif',
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#bfc9c4',
          font: {
            family: 'Inter, sans-serif',
            size: 9,
          },
        },
      },
      y: {
        grid: {
          color: 'rgba(38, 54, 74, 0.3)',
        },
        ticks: {
          color: '#bfc9c4',
          font: {
            family: 'Inter, sans-serif',
            size: 9,
          },
        },
      },
    },
  }

  return <Bar data={chartData} options={chartOptions} />
}
