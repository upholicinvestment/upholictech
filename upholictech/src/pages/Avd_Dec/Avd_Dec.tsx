import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface ChartData {
  time: string;
  advances: number;
  declines: number;
}

interface MarketBreadthCurrent {
  advances: number;
  declines: number;
  total: number;
}

interface MarketBreadthData {
  current: MarketBreadthCurrent;
  chartData: ChartData[];
}

const Avd_Dec: React.FC = () => {
  const [data, setData] = useState<MarketBreadthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

const fetchMarketBreadth = async () => {
  try {
    setLoading(true);
    setError(null);

    // Add timeout and abort controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch("http://localhost:8000/api/advdec", {
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Status ${response.status}: ${text}`);
    }

    const result: MarketBreadthData = await response.json();
    setData(result);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    setError(msg);
    console.error('Fetch error:', err);
    
    // Retry after 5 seconds if connection was refused
    if (msg.includes('Failed to fetch') || msg.includes('connection refused')) {
      setTimeout(fetchMarketBreadth, 5000);
    }
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchMarketBreadth();
    const interval = setInterval(fetchMarketBreadth, 60_000);
    return () => clearInterval(interval);
  }, []);

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <motion.div
      className="w-full max-w-5xl min-h-[300px] bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-xl p-6"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );

  if (loading) {
    return (
      <Wrapper>
        <div className="flex items-center justify-center h-full text-white text-lg">
          Loading market breadth data...
        </div>
      </Wrapper>
    );
  }

  if (error) {
    return (
      <Wrapper>
        <div className="flex items-center justify-center h-full text-red-400 text-lg">
          Error: {error}
        </div>
      </Wrapper>
    );
  }

  if (!data) return null;

  const { current, chartData } = data;

  return (
    <Wrapper>
      <h2 className="text-2xl font-bold text-center text-white mb-4">
        📈 Market Breadth (Adv/Dec)
      </h2>

      <div className="flex justify-center gap-10 mb-6 text-white text-base sm:text-lg">
        <div>
          <span className="text-gray-400">Advances: </span>
          <span className="text-green-400 font-semibold">{current.advances}</span>
        </div>
        <div>
          <span className="text-gray-400">Declines: </span>
          <span className="text-red-400 font-semibold">{current.declines}</span>
        </div>
        <div>
          <span className="text-gray-400">Total: </span>
          <span className="text-blue-300 font-semibold">{current.total}</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData} margin={{ right: 20, left: -20 }}>
          <XAxis
            dataKey="time"
            stroke="#9CA3AF"
            tick={{ fill: "#9CA3AF", fontSize: 7 }}
          />
          <YAxis stroke="#9CA3AF" tick={{ fill: "#9CA3AF", fontSize: 10 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1F2937",
              borderColor: "#374151",
              borderRadius: "0.5rem",
              fontSize: 13,
            }}
            itemStyle={{ color: "#F3F4F6" }}
            formatter={(value: number, name: string) => [
              value,
              name === "advances" ? "Advances" : "Declines",
            ]}
            labelFormatter={(label) => `Time: ${label}`}
          />
          <Legend
            formatter={(value) => {
              if (value === "advances") return "📈 Advances";
              if (value === "declines") return "📉 Declines";
              return value;
            }}
            wrapperStyle={{ color: "#D1D5DB", fontSize: 14 }}
          />
          <Line
            type="monotone"
            dataKey="advances"
            stroke="#10B981"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="declines"
            stroke="#EF4444"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Wrapper>
  );
};

export default Avd_Dec;
