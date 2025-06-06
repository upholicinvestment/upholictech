// import React from "react";
// import { Treemap, ResponsiveContainer } from "recharts";

// interface TreeMapData {
//   name: string;
//   size: number;
// }

// interface CustomizedContentProps {
//   x: number;
//   y: number;
//   width: number;
//   height: number;
//   index: number;
//   name: string;
//   depth?: number;
//   root?: TreeMapData;
// }

// const data: TreeMapData[] = [
//   { name: "HDFCBANK", size: 1200 },
//   { name: "ICICIBANK", size: 1000 },
//   { name: "AXISBANK", size: 900 },
//   { name: "SBIN", size: 850 },
//   { name: "KOTAKBANK", size: 800 },
//   { name: "IDFCFIRSTB", size: 650 },
//   { name: "PNB", size: 500 },
//   { name: "BANKBARODA", size: 600 },
//   { name: "AUROPHARMA", size: 350 },
// ];

// const CustomizedContent: React.FC<CustomizedContentProps> = ({ 
//   x, 
//   y, 
//   width, 
//   height, 
//   index, 
//   name 
// }) => {
//   const colors = ["#2ecc71", "#27ae60", "#229954", "#1e8449"];
//   const color = colors[index % colors.length];

//   const isVisible = width > 60 && height > 25;
//   const fontSize = width < 70 ? 9 : 12;

//   return (
//     <g>
//       <rect
//         x={x}
//         y={y}
//         width={width}
//         height={height}
//         style={{
//           fill: color,
//           stroke: "#111827",
//           strokeWidth: 1,
//         }}
//       />
//       {isVisible ? (
//         <foreignObject x={x} y={y} width={width} height={height}>
//           <div
//             style={{
//               display: "flex",
//               justifyContent: "center",
//               alignItems: "center",
//               height: "100%",
//               width: "100%",
//               fontSize: fontSize,
//               color: "white",
//               textAlign: "center",
//               whiteSpace: "nowrap",
//               overflow: "hidden",
//               textOverflow: "ellipsis",
//               fontWeight: 500,
//             }}
//           >
//             {name}
//           </div>
//         </foreignObject>
//       ) : null}
//     </g>
//   );
// };

// const HeatmapChart: React.FC = () => {
//   return (
//     <div className="w-full max-w-5xl h-[320px] bg-gray-900 text-white p-2 rounded-xl shadow-md">
//       <h2 className="text-xl font-semibold mb-3">Heatmap</h2>
//       <ResponsiveContainer width="100%" height="100%">
//         <Treemap
//           data={data}
//           dataKey="size"
//           stroke="#fff"
//           fill="#8884d8"
//           // TypeScript will infer the props correctly here
//           content={<CustomizedContent x={0} y={0} width={0} height={0} index={0} name="" />}
//         />
//       </ResponsiveContainer>
//     </div>
//   );
// };

// export default HeatmapChart;



// import React from "react";
// import { Treemap, ResponsiveContainer } from "recharts";
// import { motion } from "framer-motion";

// interface TreeMapData {
//   name: string;
//   size: number;    
// }

// interface CustomizedContentProps {
//   x: number;
//   y: number;
//   width: number;
//   height: number;
//   index: number;
//   name: string;
//   depth?: number;
//   root?: TreeMapData;
// }

// const data: TreeMapData[] = [
//   { name: "HDFCBANK", size: 1200 },
//   { name: "ICICIBANK", size: 1000 },
//   { name: "AXISBANK", size: 900 },
//   { name: "SBIN", size: 850 },
//   { name: "KOTAKBANK", size: 800 },
//   { name: "IDFCFIRSTB", size: 650 },
//   { name: "PNB", size: 500 },
//   { name: "BANKBARODA", size: 600 },
//   { name: "AUROPHARMA", size: 350 },
// ];

// const CustomizedContent: React.FC<CustomizedContentProps> = ({ 
//   x, 
//   y, 
//   width, 
//   height, 
//   index, 
//   name 
// }) => {
//   const colors = ["#2ecc71", "#27ae60", "#229954", "#1e8449"];
//   const color = colors[index % colors.length];

//   const isVisible = width > 60 && height > 25;
//   const fontSize = width < 70 ? 9 : 12;

//   return (
//     <g>
//       <rect
//         x={x}
//         y={y}
//         width={width}
//         height={height}
//         style={{
//           fill: color,
//           stroke: "#111827",
//           strokeWidth: 1,
//         }}
//       />
//       {isVisible ? (
//         <foreignObject x={x} y={y} width={width} height={height}>
//           <div
//             style={{
//               display: "flex",
//               justifyContent: "center",
//               alignItems: "center",
//               height: "100%",
//               width: "100%",
//               fontSize: fontSize,
//               color: "white",
//               textAlign: "center",
//               whiteSpace: "nowrap",
//               overflow: "hidden",
//               textOverflow: "ellipsis",
//               fontWeight: 500,
//             }}
//           >
//             {name}
//           </div>
//         </foreignObject>
//       ) : null}
//     </g>
//   );
// };

// const HeatmapChart: React.FC = () => {
//   return (
//     <div className="relative w-full max-w-5xl h-[320px]">
//       <motion.div 
//         className="w-full h-full bg-gray-900 text-white p-2 rounded-xl shadow-md blur-sm"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ duration: 0.3 }}
//       >
//         <h2 className="text-xl font-semibold mb-3">Heatmap</h2>
//         <ResponsiveContainer width="100%" height="100%">
//           <Treemap
//             data={data}
//             dataKey="size"
//             stroke="#fff"
//             fill="#8884d8"
//             content={<CustomizedContent x={0} y={0} width={0} height={0} index={0} name="" />}
//           />
//         </ResponsiveContainer>
//       </motion.div>

//       {/* Coming Soon Overlay */}
//       <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
//         <motion.div 
//           className="bg-none bg-opacity-50 backdrop-blur-sm rounded-xl p-6 text-center max-w-md"
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ duration: 0.5 }}
//         >
//           <motion.h2 
//             className="text-3xl font-bold text-white mb-3"
//             initial={{ y: -20 }}
//             animate={{ y: 0 }}
//             transition={{ delay: 0.2 }}
//           >
//             Coming Soon
//           </motion.h2>
//           <motion.p 
//             className="text-gray-200 text-lg"
//             initial={{ y: 20 }}
//             animate={{ y: 0 }}
//             transition={{ delay: 0.3 }}
//           >
//             Heatmap Visualization in Development
//           </motion.p>
//         </motion.div>
//       </div>
//     </div>
//   );
// };

// export default HeatmapChart;




import React, { useEffect, useState } from "react";

interface StockData {
  _id: string;
  trading_symbol: string;
  LTP: string;
  close: string;
  sector: string;
  change?: number;
  [key: string]: any;
}

interface SectorData {
  name: string;
  size: number;
  topGainers: StockData[];
  topLosers: StockData[];
}

const HeatmapChart: React.FC = () => {
  const [data, setData] = useState<SectorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredSector, setHoveredSector] = useState<SectorData | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0, width: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("[Heatmap] Fetching data from API...");
        const response = await fetch("http://localhost:8000/api/heatmap");

        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        const stocks: StockData[] = await response.json();
        console.log("[Heatmap] Raw API response:", stocks);

        if (!Array.isArray(stocks)) {
          throw new Error("API response is not an array");
        }

        // Enhanced validation with detailed logging
        const validStocks = stocks.filter((stock) => {
          // Skip OI data (stocks with trading_symbol ending with "-OI")
          if (stock.trading_symbol.endsWith("-OI")) {
            console.log(`[Heatmap] Skipping OI data: ${stock.trading_symbol}`);
            return false;
          }

          // Skip invalid trading symbols (empty or not strings)
          if (typeof stock.trading_symbol !== "string" || stock.trading_symbol.trim() === "") {
            console.warn(`[Heatmap] Skipping stock with invalid symbol: ${stock._id}`);
            return false;
          }

          // Convert prices to numbers
          const closeNum = parseFloat(stock.close);
          const ltpNum = parseFloat(stock.LTP);

          // Validate prices
          const hasValidPrices = !isNaN(closeNum) && !isNaN(ltpNum) && closeNum > 0;

          // Relax sector validation to include "Unknown"
          const hasValidSector = typeof stock.sector === "string";

          if (!hasValidPrices) {
            console.warn(`[Heatmap] Skipping stock ${stock.trading_symbol}: Invalid prices (close: ${stock.close}, LTP: ${stock.LTP})`);
            return false;
          }

          if (!hasValidSector) {
            console.warn(`[Heatmap] Skipping stock ${stock.trading_symbol}: Missing sector`);
            return false;
          }
          return true;
        });
        console.log("[Heatmap] Valid stocks after filtering:", validStocks);

        if (validStocks.length === 0) {
          throw new Error("No valid stocks found with proper prices.");
        }

        // Calculate percentage changes with logging
        const stocksWithChanges = validStocks.map((stock) => {
          const closePrice = parseFloat(stock.close);
          const ltp = parseFloat(stock.LTP);
          const change = ((ltp - closePrice) / closePrice) * 100;
          console.log(`[Heatmap] Stock: ${stock.trading_symbol}, Close: ${closePrice}, LTP: ${ltp}, Change: ${change.toFixed(2)}%`);

          return {
            ...stock,
            change,
            sector: stock.sector === "Unknown" ? "Other" : stock.sector
          };
        });

        // Group by sector and find top gainers/losers per sector
        const sectorMap: Record<string, {
          sum: number,
          count: number,
          stocks: StockData[]
        }> = {};

        stocksWithChanges.forEach((stock) => {
          const sector = stock.sector;
          if (!sectorMap[sector]) {
            sectorMap[sector] = { sum: 0, count: 0, stocks: [] };
          }
          sectorMap[sector].sum += stock.change || 0;
          sectorMap[sector].count += 1;
          sectorMap[sector].stocks.push(stock);
        });

        console.log("[Heatmap] Sector data before processing:", sectorMap);

        // Calculate average change per sector and find top gainers/losers
        const sectorAverages = Object.entries(sectorMap)
          .map(([sector, {sum, count, stocks}]) => {
            const avgChange = sum / count;
            console.log(`[Heatmap] Sector: ${sector}, Avg Change: ${avgChange.toFixed(2)}%`);

            // Get unique top 3 gainers and losers
            const sortedStocks = [...stocks].sort((a, b) => (b.change || 0) - (a.change || 0));
            const topGainers: StockData[] = [];
            const topLosers: StockData[] = [];

            // Collect unique gainers
            for (const stock of sortedStocks) {
              if (stock.change && stock.change > 0 &&
                  !topGainers.some(g => g.trading_symbol === stock.trading_symbol)) {
                topGainers.push(stock);
                if (topGainers.length >= 3) break;
              }
            }

            // Collect unique losers (reverse order)
            for (const stock of [...sortedStocks].reverse()) {
              if (stock.change && stock.change < 0 &&
                  !topLosers.some(l => l.trading_symbol === stock.trading_symbol)) {
                topLosers.push(stock);
                if (topLosers.length >= 3) break;
              }
            }

            return {
              name: sector,
              size: parseFloat(avgChange.toFixed(2)),
              topGainers,
              topLosers
            };
          })
          .sort((a, b) => b.size - a.size); // Sort by change value for better visualization

        console.log("[Heatmap] Final sector averages with top stocks:", sectorAverages);
        setData(sectorAverages);
      } catch (err) {
        console.error("[Heatmap] Data processing error:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Function to determine color based on percentage change
  const getColor = (value: number) => {
    if (value >= 2) return "#16a34a"; // Bright green for high positive
    if (value > 0) return "#4ade80"; // Light green for positive
    if (value === 0) return "#6b7280"; // Gray for no change
    if (value >= -1) return "#fca5a5"; // Light red for small negative
    return "#ef4444"; // Bright red for larger negative
  };

  // Function to clean trading symbol (remove -MAY-2025-FUT and similar patterns)
  const cleanSymbol = (symbol: string) => {
    return symbol.replace(/-[A-Z]{3}-\d{4}-FUT$/i, '');
  };

  const handleMouseEnter = (sector: SectorData, event: React.MouseEvent) => {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();

    setHoveredSector(sector);
    setTooltipPosition({
      x: rect.left + window.scrollX,
      y: rect.top + window.scrollY,
      width: rect.width
    });
  };

  const handleMouseLeave = () => {
    setHoveredSector(null);
  };

  if (loading) {
    return (
      <div className="w-full max-w-6xl h-96 bg-gray-900 text-white p-4 rounded-lg flex justify-center items-center">
        <div className="text-center">
          <p>Loading sector heatmap...</p>
          <div className="w-6 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mt-2"/>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-6xl h-96 bg-gray-900 text-white p-4 rounded-lg flex flex-col justify-center items-center text-center">
        <h2 className="text-red-500 text-xl">Error Loading Data</h2>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full max-w-6xl h-96 bg-gray-900 text-white p-2 rounded-md flex justify-center items-center text-center">
        <p>No sector data available</p>
      </div>
    );
  }

  // Calculate grid dimensions - aim for 5 columns, but adjust based on data count
  const columns = Math.min(5, data.length);
  const rows = Math.ceil(data.length / columns);

  return (
  <div className="w-full max-w-6xl bg-gray-900 rounded-md p-2 relative">
    <h1 className="text-white text-lg font-bold text-center mb-4">
      Sector Heatmap
    </h1>
    <div
  className="grid gap-px" // minimal gap between boxes
  style={{
    gridTemplateColumns: `repeat(${columns}, 1fr)`
  }}
> 
  {data.map((item, index) => (
    <div
      key={index}
      className="flex flex-col items-center justify-center cursor-pointer relative"
      style={{
        backgroundColor: getColor(item.size),
        aspectRatio: "2.5", // maintains width:height ratio
        padding: "0px",      // reduced padding
        // minHeight: "5px"    // control min height if needed
      }}
      onMouseEnter={(e) => handleMouseEnter(item, e)}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="text-gray-900 font-semibold text-[10px] leading-tight w-full text-center overflow-hidden text-ellipsis"
        title={item.name}
      >
        {item.name}
      </div>
      <div className="text-gray-900 font-semibold text-[10px] leading-tight">
        {item.size > 0 ? "+" : ""}{item.size.toFixed(1)}%
      </div>
    </div>
  ))}
</div>

    {hoveredSector && (
      <div
        className="bg-white shadow-lg rounded-md p-3 z-10 w-64"
        style={{
          left: `${tooltipPosition.x + (tooltipPosition.width / 2)}px`,
          top: `${tooltipPosition.y - 20}px`,
          transform: 'translate(50%, -15rem)'
        }}
      >
        <div className="font-bold text-sm mb-2 text-center border-b pb-1">
          {hoveredSector.name} ({hoveredSector.size > 0 ? "+" : ""}{hoveredSector.size.toFixed(1)}%)
        </div>

        {hoveredSector.topGainers.length > 0 && (
          <div className="mb-2">
            <div className="text-xs font-bold text-green-600 mb-1 text-center">Top Gainers</div>
            {hoveredSector.topGainers.map((stock, idx) => {
              const displayName = cleanSymbol(stock.trading_symbol);
              return (
                <div key={`gain-${idx}`} className="text-xs flex justify-between">
                  <span className="font-medium truncate mr-2" title={displayName}>
                    {displayName}
                  </span>
                  <span className="text-green-600 whitespace-nowrap">
                    +{stock.change?.toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {hoveredSector.topLosers.length > 0 && (
          <div>
            <div className="text-xs font-bold text-red-600 mb-1 text-center">Top Losers</div>
            {hoveredSector.topLosers.map((stock, idx) => {
              const displayName = cleanSymbol(stock.trading_symbol);
              return (
                <div key={`loss-${idx}`} className="text-xs flex justify-between">
                  <span className="font-medium truncate mr-2" title={displayName}>
                    {displayName}
                  </span>
                  <span className="text-red-600 whitespace-nowrap">
                    {stock.change?.toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {hoveredSector.topGainers.length === 0 && hoveredSector.topLosers.length === 0 && (
          <div className="text-xs italic">No stock data available for this sector</div>
        )}
        {/* Tooltip arrow */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-0 h-0 border-l-4 border-r-4 border-b-0 border-t-4 border-l-transparent border-r-transparent border-t-white"></div>
      </div>
    )}
  </div>
);
};

export default HeatmapChart;