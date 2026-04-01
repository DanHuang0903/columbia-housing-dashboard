import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

function App() {
  const [summary, setSummary] = useState(null);
  const [timeseries, setTimeseries] = useState([]);
  const [metric, setMetric] = useState("zhvi");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMetric, setSelectedMetric] = useState("zhvi");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const isMobile = windowWidth < 768;

  useEffect(() => {
    fetchSummary();
  }, []);

  useEffect(() => {
    fetchTimeseries(metric);
  }, [metric]);

  useEffect(() => {
    function handleResize(){
      setWindowWidth(window.innerWidth);
    }
    window.addEventListener("resize", handleResize);

    return() => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  async function fetchSummary() {
    try {
      const res = await fetch("http://127.0.0.1:8000/summary");
      const data = await res.json();
      console.log(data);
      setSummary(data);
      data.start_date = data.start_date.slice(0, 10);
      data.end_date = data.end_date.slice(0, 10);
      data.latest_hpi.date = data.latest_hpi.date.slice(0, 10);
      data.latest_zhvi.date = data.latest_zhvi.date.slice(0, 10);
    } catch (err) {
      setError("Failed to load summary data.");
    }
  }

  async function fetchTimeseries(selectedMetric) {
    try {
      setLoading(true);

      const res = await fetch(
        `http://127.0.0.1:8000/timeseries?metric_name=${selectedMetric}`
      );

      const data = await res.json();

      const formatted = data
        .map((d) => ({
          ...d,
          date: d.date.slice(0, 10),
          value: Number(d.value),
        }))
        .filter((d) => !Number.isNaN(d.value));

      setTimeseries(formatted);
      setError("");
    } catch (err) {
      setError("Failed to load time series data.");
    } finally {
      setLoading(false);
    }
  }

  function formatValue(value, metricName) {
    if (value == null) return "N/A";

    if (metricName === "zhvi") {
      return `$${Math.round(value).toLocaleString()}`;
    }

    return Number(value).toFixed(2);
  }

  function formatDate(dateString) {
    return dateString;
  }

  function CustomTooltip({active, payload, label, metric}) {
    if(!active || !payload || !payload.length) return null;
    
    const value = payload[0].value;

    const formattedValue = metric === "zhvi" ? `$${Math.round(value).toLocaleString()}`
                                            : Number(value).toFixed(2);

    const date = new Date(label).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short"
     });
      
    return(
      <div style={{
        background: "rgba(255,255,255,0.96)",
        border: "1px solid #e5e7eb",
        borderRadius:"14px",
        padding: "0.8rem 0.95rem",
        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.10)",
        backdropFilter: "blur(9px)"
      }}>
        <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.78rem"}}>{date}</p>
        <p style={{ margin: "0.35rem 0 0", fontWeight: 700, color: "#6b7c93"}}>{formattedValue}</p>
      </div>
    );
    }



  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f9fafb",
        padding: isMobile ? "1rem" : "2rem",
        fontFamily: "Arial, sans-serif",
        color: "#1f2937",
      }}
    >
   
      <div style={{ margin: "0 auto" }}>
        {/* Header */}

        <header style={{marginBottom: "3rem"}}>
          <h1 style={{ 
            color: "#6b7280", 
            marginBottom: "1.5rem", 
            fontSize: isMobile ? "1.5rem" : "2rem",
            lineHeight: isMobile ? 1.15 : 1.2,
            textAlign: "center",
            wordBreak: "break-word", 
            }}>Columbia Housing Dashboard</h1>
          <p style={{ color: "#6b7280", margin: "0.5rem" }}>
            Columbia, MO housing trends using Zillow ZHVI and FRED HPI data.
          </p>
        </header>
        <hr style={{ marginBottom: "3rem", color: "#9ca3af" }}/>

        {/* Summary Cards */}
        <section style={{ marginBottom: "2rem", marginTop:"1rem"}}>
        <div style={{ width:"100%", display:"flex", alignItems:"flex-start", marginBottom:"1rem"}}>
          <h2 style={{ marginBottom: "1rem", color: "#6b7280"}}>Summary</h2>
          </div>

          {summary ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "1rem",
              }}
            >
              <div
                style={{
                  background: "#ffffff",
                  padding: isMobile ? "1rem" : "1.1rem",
                  borderRadius: "18px",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
                  border: "1px solid #f1f5f9"
                }}
              >
                <p style={{ color: "#9ca3af", marginBottom: "0.4rem", fontSize:"0.8rem" }}>
                  Total Months
                </p>
                <h3 style={{ margin: 0, fontSize:"1.2rem", color:"#111827" }}>{summary.total_rows}</h3>
              </div>

              <div
                style={{
                  background: "#ffffff",
                  padding: isMobile ? "1rem" : "1.1rem",
                  borderRadius: "18px",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
                  border: "1px solid #f1f5f9"
                }}
              >
                <p style={{ color: "#9ca3af", marginBottom: "0.4rem", fontSize:"0.8rem" }}>
                  Latest ZHVI
                </p>
                <h3 style={{ margin: 0, fontSize:"1.2rem", color:"#111827" }}>
                  {formatValue(summary.latest_zhvi?.value, "zhvi")}
                </h3>
                <p style={{ marginTop: "0.4rem", color: "#9ca3af", fontSize:"0.85rem" }}>
                  {summary.latest_zhvi?.date}
                </p>
              </div>

              <div
                style={{
                  background: "#ffffff",
                  padding: isMobile ? "1rem" : "1.1rem",
                  borderRadius: "18px",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
                  border: "1px solid #f1f5f9"
                }}
              >
                <p style={{ color: "#9ca3af", marginBottom: "0.4rem", fontSize:"0.8rem"}}>
                  Latest HPI
                </p>
                <h3 style={{ margin: 0, fontSize:"1.2rem", color:"#111827" }}>
                  {formatValue(summary.latest_hpi?.value, "hpi")}
                </h3>
                <p style={{ color: "#9ca3af", marginBottom: "0.4rem", fontSize:"0.8rem" }}>
                  {summary.latest_hpi?.date}
                </p>
              </div>

              <div
                style={{
                  background: "white",
                  padding: isMobile ? "0.9rem" : "1rem",
                  borderRadius: "16px",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.05)",
                  border: "1px solid #eef2f7"
                }}
              >
                <p style={{ color: "#9ca3af", marginBottom: "0.4rem", fontSize:"0.8rem" }}>
                  Data Coverage
                </p>
                <h3 style={{ margin: 0, fontSize:"1.2rem", color:"#111827" }}>
                  {summary.start_date.slice(0,7)}
                </h3>
                <p style={{ color: "#9ca3af", fontSize:"0.8rem" }}> to </p> 
                <h3 style={{ margin: 0, fontSize:"1.2rem", color:"#111827" }}>
                  {summary.end_date.slice(0,7)}
                </h3>
              </div>
            </div>
          ) : (
            <p>Loading summary...</p>
          )}
        </section>

        {/* Chart Section */}
        <div style={{ width:"100%", marginBottom:"1rem", display:"flex", alignItems:"start"}}>
            <span
              style={{
                width: "6px",
                height: "6px",
                background: "#50a6c5",
                borderRadius: "50%",
              }}
              />
              <h2 style={{color: "#6b7280"}}>Trend Chart</h2> 
        </div>
        <section
          style={{
            background: "white",
            padding: isMobile ? "1rem" : "1.5rem",
            borderRadius: "18px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
            border: "1px solid #eef2f7"
          }}
        >
          
          <div
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              justifyContent: "space-between",
              alignItems: isMobile ? "stretch" : "center",
              marginBottom: "1rem",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
         
        
            
            <div style={{ width:"100%", display:"flex", alignItems:"flex-start"}}>
              <p style={{ color: "#6b7280"}}>
                Columbia, MO - {metric.toUpperCase()} - {timeseries.length} records
              </p>   
            </div>
              
            
       
            <div style={{display: "flex", alignItems:"flex-end"}}>
              <label htmlFor="metric-select" style={{ marginRight: "0.5rem", color:"#94a3b8", fontWeight:600, fontSize:"0.8rem" }}>
                Metric:
              </label>
              <select
                id="metric-select"
                value={metric}
                onChange={(e) => setMetric(e.target.value)}
                style={{
                  padding: "0.4rem 0.9rem",
                  borderRadius: "12px",
                  border: "1px solid #e5e7eb",
                  background: "#ffffff",
                  color:"#111827",
                  fontWeight:500,
                  fontSize:"0.8rem",
                  outline:"none",
                  appearance:"none",
                  WebkitAppearance:"none",
                  MozAppearance:"none",
                  marginTop: isMobile ? "0.5rem" : 0
                }}
              >
                <option value="zhvi">ZHVI</option>
                <option value="hpi">HPI</option>
              </select>
            </div>
           
          </div>

          {loading ? (
            <p>Loading time series...</p>
          ) : (
            <div style={{ width: "100%", marginTop: "1rem" }}>
              <ResponsiveContainer width="100%" height={isMobile? 200 : 420}>
                <LineChart data={timeseries}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6b7c93" stopOpacity={0.24}/>
                      <stop offset="95%" stopColor="#6b7c93" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                 
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false}/>
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: isMobile ? 9 : 11, fill: "#94a3b8" }} 
                    minTickGap={isMobile ? 50 : 32} 
                    tickFormatter={formatDate}
                    axisLine={false}
                    tickLine={false}/>
                  <YAxis
                    type="number"
                    domain={["dataMin", "dataMax"]}
                    tick={{ fontSize: isMobile ? 9 : 11, fill:"#94a3b8" }}
                    tickFormatter={(value) =>
                      metric === "zhvi"
                        ? `$${Math.round(value / 1000)}k`
                        : value.toFixed(0)
                    }
                    axisLine={false}
                    tickLine={false}
                    width={isMobile ? 46 : 62}
                  />
                  <Tooltip
                    formatter={(value) => formatValue(value, metric)}
                    labelFormatter={(label) => `Date: ${formatDate(label)}`}
                    content={<CustomTooltip metric={metric}/>}
                  />
                 
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#50a6c5"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6, stroke: "#4a93ad", strokeWidth: 2, fill: "#fff"}}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        {error && (
          <p style={{ color: "red", marginTop: "1rem" }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

export default App;
