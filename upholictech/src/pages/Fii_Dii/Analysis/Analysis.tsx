import { useEffect, useState } from 'react';
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import dayjs from 'dayjs';

type NetOIData = {
  date: string;
  FII_Index_Futures: number;
  FII_Index_Options: number;
  Client_Index_Futures: number;
  Client_Index_Options: number;
  Nifty_Close: number;
  FII_Cash_Net: number;
  DII_Cash_Net: number;
};

const allSeries = [
  { 
    key: 'Nifty_Close', 
    label: 'Nifty Close', 
    color: '#4e73df', 
    axis: 'right',
    type: 'area' 
  },
  { 
    key: 'FII_Cash_Net', 
    label: 'FII Cash Net', 
    color: '#e74a3b', 
    axis: 'left',
    type: 'line' 
  },
  { 
    key: 'DII_Cash_Net', 
    label: 'DII Cash Net', 
    color: '#1cc88a', 
    axis: 'left',
    type: 'line' 
  },
  { 
    key: 'FII_Index_Futures', 
    label: 'FII Index Futures Net OI', 
    color: '#36b9cc', 
    axis: 'left',
    type: 'line' 
  },
  { 
    key: 'Client_Index_Futures', 
    label: 'Client Index Futures Net OI', 
    color: '#f6c23e', 
    axis: 'left',
    type: 'line' 
  },
  { 
    key: 'FII_Index_Options', 
    label: 'FII Index Options Net OI', 
    color: '#858796', 
    axis: 'left',
    type: 'line' 
  },
  { 
    key: 'Client_Index_Options', 
    label: 'Client Index Options Net OI', 
    color: '#5a5c69', 
    axis: 'left',
    type: 'line' 
  },
];

export default function NetOIChart() {
  const [data, setData] = useState<NetOIData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeries, setSelectedSeries] = useState<string[]>(allSeries.map(series => series.key));

  useEffect(() => {
    fetch('http://localhost:5000/api/net-oi')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching Net OI data:', err);
        setLoading(false);
      });
  }, []);

  const handleCheckboxChange = (key: string) => {
    setSelectedSeries(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  if (loading) {
    return <div className="text-center p-4">Loading chart...</div>;
  }

  return (
    <div className="graph-container" style={{ 
      display: 'flex', 
      gap: '2rem', 
      alignItems: 'flex-start',
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '20px'
    }}>
      {/* Chart */}
      <div className="chart-wrapper" style={{ 
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.1)',
        padding: '20px'
      }}>
        <ResponsiveContainer width="100%" height={500}>
          <ComposedChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e3e6f0" />
            <XAxis
              dataKey="date"
              tickFormatter={(tick) => dayjs(tick).format('DD MMM')}
              tick={{ fontSize: 12, fill: '#5a5c69' }}
            />
            <YAxis 
              yAxisId="left" 
              orientation="left"
              tick={{ fontSize: 12, fill: '#5a5c69' }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={['auto', 'auto']}
              tick={{ fontSize: 12, fill: '#5a5c69' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e3e6f0',
                borderRadius: '0.35rem',
                boxShadow: '0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15)'
              }}
              labelFormatter={(label) => dayjs(label).format('DD MMM YYYY')}
            />
            <Legend 
              wrapperStyle={{ 
                paddingTop: '20px',
                fontSize: '14px'
              }}
            />
            
            {allSeries.map(series => {
              if (!selectedSeries.includes(series.key)) return null;
              
              if (series.type === 'area') {
                return (
                  <Area
                    key={series.key}
                    yAxisId={series.axis}
                    type="monotone"
                    dataKey={series.key}
                    fill={`${series.color}20`} // Add opacity to fill
                    stroke={series.color}
                    strokeWidth={2}
                    activeDot={{ r: 6 }}
                    name={series.label}
                  />
                );
              } else {
                return (
                  <Line
                    key={series.key}
                    yAxisId={series.axis}
                    type="monotone"
                    dataKey={series.key}
                    stroke={series.color}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                    name={series.label}
                  />
                );
              }
            })}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Checkboxes */}
      <div className="controls-wrapper" style={{ 
        minWidth: '220px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.1)',
        padding: '20px'
      }}>
        <h3 style={{ 
          marginBottom: '15px',
          color: '#5a5c69',
          fontSize: '16px'
        }}>Toggle Series</h3>
        
        <label className="select-all" style={{ 
          display: 'block', 
          marginBottom: '15px',
          paddingBottom: '15px',
          borderBottom: '1px solid #e3e6f0'
        }}>
          <input
            type="checkbox"
            checked={selectedSeries.length === allSeries.length}
            onChange={() => {
              if (selectedSeries.length === allSeries.length) {
                setSelectedSeries([]);
              } else {
                setSelectedSeries(allSeries.map(series => series.key));
              }
            }}
          />
          <span style={{ 
            fontWeight: 'bold', 
            marginLeft: '8px',
            color: '#4e73df'
          }}>Select All</span>
        </label>

        {allSeries.map(series => (
          <label 
            key={series.key} 
            className="series-toggle" 
            style={{ 
              display: 'flex',
              alignItems: 'center',
              marginBottom: '10px',
              cursor: 'pointer'
            }}
          >
            <input
              type="checkbox"
              checked={selectedSeries.includes(series.key)}
              onChange={() => handleCheckboxChange(series.key)}
              style={{ marginRight: '8px' }}
            />
            <div style={{
              width: '12px',
              height: '12px',
              backgroundColor: series.color,
              marginRight: '8px',
              borderRadius: series.type === 'area' ? '0' : '50%'
            }}></div>
            <span style={{ 
              color: '#5a5c69',
              fontSize: '14px'
            }}>{series.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}