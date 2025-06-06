// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
// } from "recharts";
// import { motion } from "framer-motion";
// import { useEffect, useState } from "react";

// interface ChartData {
//   time: string;
//   advances: number;
//   declines: number;
// }

// interface MarketBreadthCurrent {
//   advances: number;
//   declines: number;
//   total: number;
// }

// interface MarketBreadthData {
//   current: MarketBreadthCurrent;
//   chartData: ChartData[];
// }

// const Avd_Dec: React.FC = () => {
//   const [data, setData] = useState<MarketBreadthData | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const fetchMarketBreadth = async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       // Create an AbortController with a 10-second timeout
//       const controller = new AbortController();
//       const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds

//       const response = await fetch("http://localhost:8000/api/advdec", {
//         signal: controller.signal,
//       });

//       clearTimeout(timeoutId);

//       if (!response.ok) {
//         const text = await response.text();
//         throw new Error(`Status ${response.status}: ${text}`);
//       }

//       const result: MarketBreadthData = await response.json();
//       setData(result);
//       setLoading(false); // Only set loading to false on successful fetch
//     } catch (err) {
//       const msg = err instanceof Error ? err.message : "Unknown error";
//       setError(msg);
//       console.error("Fetch error:", err);

//       // Retry after 5 seconds if connection was refused or aborted
//       if (
//         msg.includes("Failed to fetch") ||
//         msg.includes("connection refused") ||
//         msg.includes("aborted") ||
//         msg.includes("TimeoutError")
//       ) {
//         setTimeout(fetchMarketBreadth, 5000);
//       }
//     }
//   };

//   useEffect(() => {
//     fetchMarketBreadth();
//     const interval = setInterval(fetchMarketBreadth, 60_000);
//     return () => clearInterval(interval);
//   }, []);

//   const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
//     <motion.div
//       className="w-full max-w-5xl min-h-[300px] bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-xl p-6"
//       initial={{ opacity: 0, y: 50 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.6, ease: "easeOut" }}
//     >
//       {children}
//     </motion.div>
//   );

//   if (loading) {
//     return (
//       <Wrapper>
//         <div className="flex items-center justify-center h-full text-white text-lg">
//           Loading market breadth data...
//         </div>
//       </Wrapper>
//     );
//   }

//   if (error) {
//     return (
//       <Wrapper>
//         <div className="flex items-center justify-center h-full text-red-400 text-lg">
//           Error: {error}
//         </div>
//       </Wrapper>
//     );
//   }

//   if (!data) return null;

//   const { current, chartData } = data;

//   return (
//     <Wrapper>
//       <h2 className="text-2xl font-bold text-center text-white mb-4">
//         📈 Market Breadth (Adv/Dec)
//       </h2>

//       <div className="flex justify-center gap-10 mb-6 text-white text-base sm:text-lg">
//         <div>
//           <span className="text-gray-400">Advances: </span>
//           <span className="text-green-400 font-semibold">
//             {current.advances}
//           </span>
//         </div>
//         <div>
//           <span className="text-gray-400">Declines: </span>
//           <span className="text-red-400 font-semibold">
//             {current.declines}
//           </span>
//         </div>
//         <div>
//           <span className="text-gray-400">Total: </span>
//           <span className="text-blue-300 font-semibold">{current.total}</span>
//         </div>
//       </div>

//       <ResponsiveContainer width="100%" height={200}>
//         <LineChart data={chartData} margin={{ right: 20, left: -20 }}>
//           <XAxis
//             dataKey="time"
//             stroke="#9CA3AF"
//             tick={{ fill: "#9CA3AF", fontSize: 7 }}
//           />
//           <YAxis stroke="#9CA3AF" tick={{ fill: "#9CA3AF", fontSize: 10 }} />
//           <Tooltip
//             contentStyle={{
//               backgroundColor: "#1F2937",
//               borderColor: "#374151",
//               borderRadius: "0.5rem",
//               fontSize: 13,
//             }}
//             itemStyle={{ color: "#F3F4F6" }}
//             formatter={(value: number, name: string) => [
//               value,
//               name === "advances" ? "Advances" : "Declines",
//             ]}
//             labelFormatter={(label) => `Time: ${label}`}
//           />
//           <Legend
//             formatter={(value) => {
//               if (value === "advances") return "📈 Advances";
//               if (value === "declines") return "📉 Declines";
//               return value;
//             }}
//             wrapperStyle={{ color: "#D1D5DB", fontSize: 14 }}
//           />
//           <Line
//             type="monotone"
//             dataKey="advances"
//             stroke="#10B981"
//             strokeWidth={2}
//             dot={false}
//             activeDot={{ r: 5 }}
//           />
//           <Line
//             type="monotone"
//             dataKey="declines"
//             stroke="#EF4444"
//             strokeWidth={2}
//             dot={false}
//             activeDot={{ r: 5 }}
//           />
//         </LineChart>
//       </ResponsiveContainer>
//     </Wrapper>
//   );
// };

// export default Avd_Dec;








// import React from 'react';
// import {
//   Chart as ChartJS,
//   LineElement,
//   LineController,
//   PointElement,
//   CategoryScale,
//   LinearScale,
//   Tooltip,
//   Legend,
//   Title,
// } from 'chart.js';
// import { Line } from 'react-chartjs-2';
// import { motion } from 'framer-motion';

// // ✅ Register required Chart.js components
// ChartJS.register(
//   LineElement,
//   LineController,
//   PointElement,
//   CategoryScale,
//   LinearScale,
//   Tooltip,
//   Legend,
//   Title
// );

// // ✅ Data & Config
// const chartData = {
//   labels: [
//     '09:30', '10:00', '10:30', '11:00', '11:30',
//     '12:00', '12:30', '13:00', '13:30', '14:00',
//     '14:30', '15:00',
//   ],
//   datasets: [
//     {
//       label: '📈 Advances',
//       data: [200, 350, 500, 650, 800, 900, 950, 1050, 1150, 1200, 1230, 1250],
//       borderColor: '#10B981',
//       backgroundColor: '#10B981',
//       tension: 0.4,
//       fill: false,
//     },
//     {
//       label: '📉 Declines',
//       data: [150, 250, 300, 400, 500, 600, 650, 700, 750, 800, 820, 850],
//       borderColor: '#EF4444',
//       backgroundColor: '#EF4444',
//       tension: 0.4,
//       fill: false,
//     },
//   ],
// };

// const chartOptions = {
//   responsive: true,
//   plugins: {
//     legend: {
//       labels: {
//         color: '#D1D5DB',
//         font: {
//           size: 13,
//         },
//       },
//     },
//     tooltip: {
//       backgroundColor: '#1F2937',
//       titleColor: '#F3F4F6',
//       bodyColor: '#F3F4F6',
//       borderColor: '#374151',
//       borderWidth: 1,
//     },
//   },
//   scales: {
//     x: {
//       ticks: {
//         color: '#9CA3AF',
//         font: {
//           size: 10,
//         },
//       },
//       grid: {
//         color: '#374151',
//       },
//     },
//     y: {
//       ticks: {
//         color: '#9CA3AF',
//         font: {
//           size: 10,
//         },
//       },
//       grid: {
//         color: '#374151',
//       },
//     },
//   },
// };

// const MarketBreadthChart: React.FC = () => {
//   const advances = 1250;
//   const declines = 850;
//   const total = 2100;

//   return (
//     <motion.div
//       className="w-full max-w-5xl min-h-[300px] bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-xl p-6 mx-auto"
//       initial={{ opacity: 0, y: 50 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.6, ease: 'easeOut' }}
//     >
//       <h2 className="text-2xl font-bold text-center text-white mb-4">
//         📈 Market Breadth (Adv/Dec)
//       </h2>

//       <div className="flex justify-center gap-10 mb-6 text-white text-base sm:text-lg">
//         <div>
//           <span className="text-gray-400">Advances: </span>
//           <span className="text-green-400 font-semibold">{advances}</span>
//         </div>
//         <div>
//           <span className="text-gray-400">Declines: </span>
//           <span className="text-red-400 font-semibold">{declines}</span>
//         </div>
//         <div>
//           <span className="text-gray-400">Total: </span>
//           <span className="text-blue-300 font-semibold">{total}</span>
//         </div>
//       </div>

//       <Line data={chartData} options={chartOptions} />
//     </motion.div>
//   );
// };

// export default MarketBreadthChart;






import React from 'react';
import {
  Chart as ChartJS,
  LineElement,
  LineController,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { motion } from 'framer-motion';

ChartJS.register(
  LineElement,
  LineController,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title
);

const chartData = {
  labels: [
    '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00',
    '14:30', '15:00',
  ],
  datasets: [
    {
      label: '📈 Advances',
      data: [200, 350, 500, 650, 800, 900, 950, 1050, 1150, 1200, 1230, 1250],
      borderColor: '#10B981',
      backgroundColor: '#10B981',
      tension: 0.4,
      fill: false,
    },
    {
      label: '📉 Declines',
      data: [150, 250, 300, 400, 500, 600, 650, 700, 750, 800, 820, 850],
      borderColor: '#EF4444',
      backgroundColor: '#EF4444',
      tension: 0.4,
      fill: false,
    },
  ],
};

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      labels: {
        color: '#D1D5DB',
        font: {
          size: 13,
        },
      },
    },
    tooltip: {
      backgroundColor: '#1F2937',
      titleColor: '#F3F4F6',
      bodyColor: '#F3F4F6',
      borderColor: '#374151',
      borderWidth: 1,
    },
  },
  scales: {
    x: {
      ticks: {
        color: '#9CA3AF',
        font: {
          size: 10,
        },
      },
      grid: {
        color: '#374151',
      },
    },
    y: {
      ticks: {
        color: '#9CA3AF',
        font: {
          size: 10,
        },
      },
      grid: {
        color: '#374151',
      },
    },
  },
};

const MarketBreadthChart: React.FC = () => {
  const advances = 1250;
  const declines = 850;
  const total = 2100;

  return (
    <div className="relative w-full max-w-5xl min-h-[300px]">
      <motion.div
        className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-xl p-6 mx-auto blur-sm"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <h2 className="text-2xl font-bold text-center text-white mb-4">
          📈 Market Breadth (Adv/Dec)
        </h2>

        <div className="flex justify-center gap-10 mb-6 text-white text-base sm:text-lg">
          <div>
            <span className="text-gray-400">Advances: </span>
            <span className="text-green-400 font-semibold">{advances}</span>
          </div>
          <div>
            <span className="text-gray-400">Declines: </span>
            <span className="text-red-400 font-semibold">{declines}</span>
          </div>
          <div>
            <span className="text-gray-400">Total: </span>
            <span className="text-blue-300 font-semibold">{total}</span>
          </div>
        </div>

        <Line data={chartData} options={chartOptions} />
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
            Market Breadth Analysis in Development
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default MarketBreadthChart;