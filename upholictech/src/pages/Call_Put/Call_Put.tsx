// import { Chart } from 'react-chartjs-2';
// import { motion } from 'framer-motion';
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   LineElement,
//   LineController,
//   PointElement,
//   Title,
//   Tooltip,
//   Legend,
// } from 'chart.js';
// import type { ChartData, ChartOptions } from 'chart.js';

// // ✅ Register all required elements and controllers
// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   LineElement,
//   LineController,
//   PointElement,
//   Title,
//   Tooltip,
//   Legend
// );

// export default function Call_Put() {
//   const labels = ['23000', '23500', '24000', '24500', '25000', '25500', '26000'];

//   const data: ChartData<'bar' | 'line', number[], string> = {
//     labels,
//     datasets: [
//       {
//         type: 'bar',
//         label: 'Call OI',
//         data: [2, 4, 8, 12, 16, 10, 18],
//         backgroundColor: 'rgba(16, 185, 129, 0.7)', // Emerald green
//         borderColor: 'rgba(16, 185, 129, 1)',
//         borderWidth: 1,
//       },
//       {
//         type: 'bar',
//         label: 'Put OI',
//         data: [1, 3, 6, 10, 14, 18, 22],
//         backgroundColor: 'rgba(239, 68, 68, 0.7)', // Red-500
//         borderColor: 'rgba(239, 68, 68, 1)',
//         borderWidth: 1,
//       },
//       {
//         type: 'line',
//         label: 'NIFTY Spot',
//         data: [23000, 23400, 24100, 24400, 24800, 25300, 25900],
//         borderColor: '#A78BFA', // Purple-400
//         backgroundColor: '#A78BFA',
//         borderWidth: 2,
//         tension: 0.4,
//         pointRadius: 0,
//         yAxisID: 'y1',
//       },
//     ],
//   };

//   const options: ChartOptions<'bar' | 'line'> = {
//     responsive: true,
//     maintainAspectRatio: false,
//     interaction: {
//       mode: 'index',
//       intersect: false,
//     },
//     plugins: {
//       legend: {
//         labels: {
//           color: '#E5E7EB', // Light gray text
//         },
//       },
//       tooltip: {
//         backgroundColor: '#1F2937', // gray-800
//         titleColor: '#F3F4F6', // gray-100
//         bodyColor: '#E5E7EB', // gray-200
//         borderColor: '#4B5563', // gray-600
//         borderWidth: 1,
//       },
//     },
//     scales: {
//       x: {
//         grid: {
//           color: '#374151', // gray-700
//         },
//         ticks: {
//           color: '#9CA3AF', // gray-400
//         },
//       },
//       y: {
//         type: 'linear',
//         position: 'left',
//         grid: {
//           color: '#374151',
//         },
//         ticks: {
//           color: '#9CA3AF',
//         },
//         title: {
//           display: true,
//           text: 'OI Volume (in M)',
//           color: '#D1D5DB',
//         },
//       },
//       y1: {
//         type: 'linear',
//         position: 'right',
//         grid: {
//           drawOnChartArea: false,
//         },
//         ticks: {
//           color: '#9CA3AF',
//         },
//         title: {
//           display: true,
//           text: 'Spot Price',
//           color: '#D1D5DB',
//         },
//       },
//     },
//   };

//   return (
//     <motion.div
//       className="w-full p-6 bg-gray-900 rounded-xl shadow-lg"
//       initial={{ opacity: 0, y: 40 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.8 }}
//     >
//       <h2 className="text-lg font-bold text-center mb-4 text-white">Call/Put (NIFTY)</h2>
//       <div className="h-[250px]">
//         <Chart type="bar" data={data} options={options} />
//       </div>
//     </motion.div>
//   );
// }













import { Chart } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  LineController,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import type { ChartData, ChartOptions } from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  LineController,
  PointElement,
  Title,
  Tooltip,
  Legend
);

export default function Call_Put() {
  const labels = ['23000', '23500', '24000', '24500', '25000', '25500', '26000'];

  const data: ChartData<'bar' | 'line', number[], string> = {
    labels,
    datasets: [
      {
        type: 'bar',
        label: 'Call OI',
        data: [2, 4, 8, 12, 16, 10, 18],
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
      },
      {
        type: 'bar',
        label: 'Put OI',
        data: [1, 3, 6, 10, 14, 18, 22],
        backgroundColor: 'rgba(239, 68, 68, 0.7)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1,
      },
      {
        type: 'line',
        label: 'NIFTY Spot',
        data: [23000, 23400, 24100, 24400, 24800, 25300, 25900],
        borderColor: '#A78BFA',
        backgroundColor: '#A78BFA',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
        yAxisID: 'y1',
      },
    ],
  };

  const options: ChartOptions<'bar' | 'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        labels: {
          color: '#E5E7EB',
        },
      },
      tooltip: {
        backgroundColor: '#1F2937',
        titleColor: '#F3F4F6',
        bodyColor: '#E5E7EB',
        borderColor: '#4B5563',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          color: '#374151',
        },
        ticks: {
          color: '#9CA3AF',
        },
      },
      y: {
        type: 'linear',
        position: 'left',
        grid: {
          color: '#374151',
        },
        ticks: {
          color: '#9CA3AF',
        },
        title: {
          display: true,
          text: 'OI Volume (in M)',
          color: '#D1D5DB',
        },
      },
      y1: {
        type: 'linear',
        position: 'right',
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: '#9CA3AF',
        },
        title: {
          display: true,
          text: 'Spot Price',
          color: '#D1D5DB',
        },
      },
    },
  };

  return (
    <div className="relative">
      <motion.div
        className="w-full p-6 bg-gray-900 rounded-xl shadow-lg blur-sm"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-lg font-bold text-center mb-4 text-white">Call/Put (NIFTY)</h2>
        <div className="h-[250px]">
          <Chart type="bar" data={data} options={options} />
        </div>
      </motion.div>

      {/* Coming Soon Overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div 
          className="bg-none bg-opacity-50 backdrop-blur-sm rounded-xl p-6 text-center max-w-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h2 
            className="text-3xl font-bold text-white mb-3"
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Coming Soon
          </motion.h2>
          <motion.p 
            className="text-gray-200 text-lg"
            initial={{ y: 20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Call/Put Analysis in Development
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}



// api 
// import { useEffect, useState } from 'react';
// import { Chart } from 'react-chartjs-2';
// import { motion } from 'framer-motion';
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   LineElement,
//   PointElement,
//   Title,
//   Tooltip,
//   Legend,
// } from 'chart.js';
// import type { ChartData, ChartOptions } from 'chart.js';

// ChartJS.register(
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   LineElement,
//   PointElement,
//   Title,
//   Tooltip,
//   Legend
// );

// type CallPutEntry = {
//   strikePrice: string;
//   callOI: number;
//   putOI: number;
//   niftySpot: number;
// };

// export default function Call_Put() {
//   const [data, setData] = useState<ChartData<'bar' | 'line', number[], string>>({
//     labels: [],
//     datasets: [],
//   });

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const res = await fetch('http://localhost:5000/api/call-put-data');
//         const json: CallPutEntry[] = await res.json();

//         const labels = json.map(entry => entry.strikePrice);
//         const callData = json.map(entry => entry.callOI);
//         const putData = json.map(entry => entry.putOI);
//         const niftySpot = json.map(entry => entry.niftySpot);

//         setData({
//           labels,
//           datasets: [
//             {
//               type: 'bar',
//               label: 'Call OI',
//               data: callData,
//               backgroundColor: 'rgba(16, 185, 129, 0.7)',
//               borderColor: 'rgba(16, 185, 129, 1)',
//               borderWidth: 1,
//             },
//             {
//               type: 'bar',
//               label: 'Put OI',
//               data: putData,
//               backgroundColor: 'rgba(239, 68, 68, 0.7)',
//               borderColor: 'rgba(239, 68, 68, 1)',
//               borderWidth: 1,
//             },
//             {
//               type: 'line',
//               label: 'NIFTY Spot',
//               data: niftySpot,
//               borderColor: '#A78BFA',
//               backgroundColor: '#A78BFA',
//               borderWidth: 2,
//               tension: 0.4,
//               pointRadius: 0,
//               yAxisID: 'y1',
//             },
//           ],
//         });
//       } catch (err) {
//         console.error('Failed to fetch call-put data:', err);
//       }
//     };

//     fetchData();
//   }, []);

//   const options: ChartOptions<'bar' | 'line'> = {
//     responsive: true,
//     maintainAspectRatio: false,
//     interaction: {
//       mode: 'index',
//       intersect: false,
//     },
//     plugins: {
//       legend: {
//         labels: {
//           color: '#E5E7EB',
//         },
//       },
//       tooltip: {
//         backgroundColor: '#1F2937',
//         titleColor: '#F3F4F6',
//         bodyColor: '#E5E7EB',
//         borderColor: '#4B5563',
//         borderWidth: 1,
//       },
//     },
//     scales: {
//       x: {
//         grid: { color: '#374151' },
//         ticks: { color: '#9CA3AF' },
//       },
//       y: {
//         type: 'linear',
//         display: true,
//         position: 'left',
//         grid: { color: '#374151' },
//         ticks: { color: '#9CA3AF' },
//         title: {
//           display: true,
//           text: 'OI Volume (in M)',
//           color: '#D1D5DB',
//         },
//       },
//       y1: {
//         type: 'linear',
//         display: true,
//         position: 'right',
//         grid: { drawOnChartArea: false },
//         ticks: { color: '#9CA3AF' },
//         title: {
//           display: true,
//           text: 'Spot Price',
//           color: '#D1D5DB',
//         },
//       },
//     },
//   };

//   return (
//     <motion.div
//       className="w-full p-6 bg-gray-900 rounded-xl shadow-lg"
//       initial={{ opacity: 0, y: 40 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.8 }}
//     >
//       <h2 className="text-lg font-bold text-center mb-4 text-white">Call/Put (NIFTY)</h2>
//       <div className="h-[250px]">
//         <Chart type="bar" data={data} options={options} />
//       </div>
//     </motion.div>
//   );
// }
