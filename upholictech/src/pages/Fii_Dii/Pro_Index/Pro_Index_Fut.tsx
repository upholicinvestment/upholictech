import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  ComposedChart,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ReferenceLine
} from "recharts";

interface FIIData {
  Date: string;
  Pro_Index_Futures: string | number;
  NIFTY_Value: string | number;
}

interface ChartData {
  date: string;
  callChange: number;
  niftyValue: number;
  month: string;
}

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const parseValue = (value: string | number): number => {
  if (typeof value === "number") return value;

  let cleaned = value.replace(/,/g, "").trim();
  if (cleaned.includes("L")) {
    cleaned = cleaned.replace("L", "");
    return parseFloat(cleaned) * 100000;
  }
  return parseFloat(cleaned);
};

const Pro_Index_Fut: React.FC = () => {
  const [data, setData] = useState<ChartData[]>([]);
  const [filteredData, setFilteredData] = useState<ChartData[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [months, setMonths] = useState<string[]>([]);
  const [niftyRange, setNiftyRange] = useState<{ min: number; max: number }>({ min: 22000, max: 23600 });

  useEffect(() => {
    axios
      .get<FIIData[]>("http://localhost:5000/api/Pro_Index_Fut/data")
      .then((response) => {
        const formattedData = response.data.map((item) => {
          const dateObj = new Date(item.Date);
          const month = monthNames[dateObj.getMonth()];
          return {
            date: item.Date,
            callChange: parseValue(item.Pro_Index_Futures),
            niftyValue: parseValue(item.NIFTY_Value),
            month: month,
          };
        });

        const uniqueMonths = Array.from(new Set(formattedData.map(d => d.month)));
        const niftyValues = formattedData.map(d => d.niftyValue);
        
        setData(formattedData);
        setMonths(uniqueMonths);
        setSelectedMonth(uniqueMonths[0] || "");
        setNiftyRange({
          min: Math.min(...niftyValues) * 0.995,
          max: Math.max(...niftyValues) * 1.005
        });
      })
      .catch(error => console.error("Error fetching data:", error));
  }, []);

  useEffect(() => {
    const filtered = data.filter(item => item.month === selectedMonth);
    setFilteredData(filtered);
  }, [selectedMonth, data]);

  return (
    <div style={{ 
      width: "100%", 
      height: "500px", 
      paddingBottom: "100px",
      backgroundColor: "#f8f9fa",
      borderRadius: "10px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      padding: "20px"
    }}>
      <div style={{ 
        marginBottom: "20px", 
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}>
        <h2 style={{ 
          color: "#343a40", 
          marginBottom: "15px",
          fontSize: "1.5rem",
          fontWeight: "600"
        }}>
          Professional Activity in Index Futures
        </h2>
        <div style={{ 
          display: "flex", 
          flexWrap: "wrap", 
          justifyContent: "center",
          gap: "8px"
        }}>
          {months.map(month => (
            <button
              key={month}
              onClick={() => setSelectedMonth(month)}
              style={{
                padding: "8px 16px",
                borderRadius: "20px",
                backgroundColor: selectedMonth === month ? "#495057" : "#e9ecef",
                color: selectedMonth === month ? "white" : "#495057",
                border: "none",
                cursor: "pointer",
                fontWeight: "500",
                transition: "all 0.2s ease",
                boxShadow: selectedMonth === month ? "0 2px 4px rgba(0,0,0,0.1)" : "none"
              }}
            >
              {month}
            </button>
          ))}
        </div>
      </div>
      
      <div style={{ 
        height: "100%",
        width: "100%",
        maxWidth: "1200px",
        margin: "0 auto",
        backgroundColor: "white",
        borderRadius: "8px",
        padding: "15px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
      }}>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart 
            data={filteredData} 
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12, fill: "#6c757d" }}
              tickMargin={10}
            />
            <YAxis 
              yAxisId="left" 
              domain={[niftyRange.min, niftyRange.max]}
              tick={{ fontSize: 12, fill: "#6c757d" }}
              label={{ 
                value: "NIFTY Value", 
                angle: -90, 
                position: "insideLeft",
                fontSize: 12,
                fill: "#495057"
              }} 
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              tick={{ fontSize: 12, fill: "#6c757d" }}
              label={{ 
                value: "Pro Activity (₹ Cr)", 
                angle: -90, 
                position: "insideRight",
                fontSize: 12,
                fill: "#495057"
              }} 
            />
            <ReferenceLine yAxisId="right" y={0} stroke="#495057" strokeDasharray="3 3" />
            <Tooltip 
              contentStyle={{
                backgroundColor: "rgba(255,255,255,0.98)",
                border: "1px solid #dee2e6",
                borderRadius: "6px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                fontSize: "12px"
              }}
              formatter={(value, name) => {
                if (name === "Pro Index Futures") {
                  return [value.toLocaleString() + " Cr", name];
                }
                return [value, name];
              }}
            />
            <Legend 
              wrapperStyle={{
                paddingTop: "20px",
                fontSize: "12px"
              }}
            />
            <Bar 
              yAxisId="right" 
              dataKey="callChange" 
              name="Pro Index Futures"
              barSize={20}
            >
              {filteredData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.callChange < 0 ? "#ff6b6b" : "#4ecdc4"} 
                />
              ))}
            </Bar>
            <Area 
              yAxisId="left" 
              type="monotone" 
              dataKey="niftyValue" 
              fill="#8884d8" 
              stroke="#5c6bc0" 
              name="NIFTY" 
              fillOpacity={0.1}
              strokeWidth={2}
              activeDot={{ r: 6, fill: "#5c6bc0", strokeWidth: 0 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Pro_Index_Fut;