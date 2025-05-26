import React from "react";
import { Treemap, ResponsiveContainer, TreemapProps } from "recharts";

interface TreeMapData {
  name: string;
  size: number;
}

interface CustomizedContentProps {
  x: number;
  y: number;
  width: number;
  height: number;
  index: number;
  name: string;
  depth?: number;
  root?: TreeMapData;
}

const data: TreeMapData[] = [
  { name: "HDFCBANK", size: 1200 },
  { name: "ICICIBANK", size: 1000 },
  { name: "AXISBANK", size: 900 },
  { name: "SBIN", size: 850 },
  { name: "KOTAKBANK", size: 800 },
  { name: "IDFCFIRSTB", size: 650 },
  { name: "PNB", size: 500 },
  { name: "BANKBARODA", size: 600 },
  { name: "AUROPHARMA", size: 350 },
];

const CustomizedContent: React.FC<CustomizedContentProps> = ({ 
  x, 
  y, 
  width, 
  height, 
  index, 
  name 
}) => {
  const colors = ["#2ecc71", "#27ae60", "#229954", "#1e8449"];
  const color = colors[index % colors.length];

  const isVisible = width > 60 && height > 25;
  const fontSize = width < 70 ? 9 : 12;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: color,
          stroke: "#111827",
          strokeWidth: 1,
        }}
      />
      {isVisible ? (
        <foreignObject x={x} y={y} width={width} height={height}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              width: "100%",
              fontSize: fontSize,
              color: "white",
              textAlign: "center",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              fontWeight: 500,
            }}
          >
            {name}
          </div>
        </foreignObject>
      ) : null}
    </g>
  );
};

const HeatmapChart: React.FC = () => {
  return (
    <div className="w-full max-w-5xl h-[320px] bg-gray-900 text-white p-2 rounded-xl shadow-md">
      <h2 className="text-xl font-semibold mb-3">Heatmap</h2>
      <ResponsiveContainer width="100%" height="100%">
        <Treemap
          data={data}
          dataKey="size"
          stroke="#fff"
          fill="#8884d8"
          content={<CustomizedContent 
            x={0} 
            y={0} 
            width={0} 
            height={0} 
            index={0} 
            name="" 
          />}
        />
      </ResponsiveContainer>
    </div>
  );
};

export default HeatmapChart;