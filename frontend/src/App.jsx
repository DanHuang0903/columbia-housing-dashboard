import { useEffect, useState, useRef } from "react";
import {
  LineChart,
  Line,
  Area,
  BarChart,
  Bar,
  Cell,
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

  const zhviDescription = "ZHVI stands for Zillow Home Value Index. It represents the typical home value in a given region, estimated by Zillow.";
  const hpiDescription = "HPI stands for House Price Index. It is an index-based measure of home price changes over time, provided here from FRED.";

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
      const res = await fetch("https://columbia-housing-dashboard.onrender.com/summary");
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
        `https://columbia-housing-dashboard.onrender.com/timeseries?metric_name=${selectedMetric}`
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


    function InfoTooltip({ text, isMobile }) {
      const [open, setOpen] = useState(false);
      const wrapperRef = useRef(null);
    
      useEffect(() => {
        function handleClickOutside(event) {
          if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
            setOpen(false);
          }
        }
    
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchstart", handleClickOutside);
    
        return () => {
          document.removeEventListener("mousedown", handleClickOutside);
          document.removeEventListener("touchstart", handleClickOutside);
        };
      }, []);
    
      function handleToggle() {
        if (isMobile) {
          setOpen((prev) => !prev);
        }
      }
    
      return (
        <span
          ref={wrapperRef}
          className={`info-tooltip-wrapper ${open ? "open" : ""}`}
          style={{
            position: "relative",
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          <button
            type="button"
            onClick={handleToggle}
            aria-label="More information"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "18px",
              height: "18px",
              marginLeft: "6px",
              borderRadius: "999px",
              border: "none",
              background: "#e2e8f0",
              color: "#475569",
              fontSize: "11px",
              fontWeight: 700,
              cursor: "pointer",
              userSelect: "none",
              padding: 0,
              flexShrink: 0,
            }}
          >
            i
          </button>
    
          <span
            className="info-tooltip-box"
            style={{
              position: "absolute",
              top: "calc(100% + 10px)",
              left: isMobile ? "0" : "50%",
              transform: isMobile ? "translateX(0)" : "translateX(-50%)",
              width: isMobile ? "220px" : "260px",
              maxWidth: "72vw",
              background: "rgba(255,255,255,0.98)",
              color: "#334155",
              fontSize: "0.82rem",
              lineHeight: 1.5,
              padding: "0.85rem 0.95rem",
              borderRadius: "14px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 14px 36px rgba(15,23,42,0.12)",
              opacity: 0,
              visibility: "hidden",
              transition: "all 0.18s ease",
              zIndex: 30,
              pointerEvents: "none",
              backdropFilter: "blur(10px)",
            }}
          >
            <span
              style={{
                position: "absolute",
                top: "-6px",
                left: isMobile ? "12px" : "50%",
                transform: isMobile ? "none" : "translateX(-50%) rotate(45deg)",
                width: "12px",
                height: "12px",
                background: "rgba(255,255,255,0.98)",
                borderLeft: "1px solid #e5e7eb",
                borderTop: "1px solid #e5e7eb",
                rotate: isMobile ? "45deg" : undefined,
              }}
            />
            <span style={{ position: "relative", zIndex: 1 }}>{text}</span>
          </span>
        </span>
      );
    }

    function getAnnualChangeData(data) {
      if (!data || data.length === 0) return [];
    
      const yearlyMap = {};
    
      data.forEach((item) => {
        const year = new Date(item.date).getFullYear();
        yearlyMap[year] = item.value;
      });
    
      const years = Object.keys(yearlyMap).sort();
      const result = [];
    
      for (let i = 1; i < years.length; i++) {
        const currentYear = years[i];
        const prevYear = years[i - 1];
    
        const change = yearlyMap[currentYear] - yearlyMap[prevYear];
    
        result.push({
          year: currentYear,
          change: Math.round(change),
        });
      }
    
      return result;
    }

  const annualChangeData = metric === "zhvi" ? getAnnualChangeData(timeseries) : [];
  console.log(annualChangeData);

  function BarTooltip({ active, payload, label }) {
    if (!active || !payload || !payload.length) return null;
  
    const value = payload[0].value;
    const isPositive = value >= 0;
  
    return (
      <div
        style={{
          background: "rgba(255,255,255,0.98)",
          border: "1px solid #e5e7eb",
          borderRadius: "14px",
          padding: "0.8rem 0.95rem",
          boxShadow: "0 14px 36px rgba(15,23,42,0.12)",
        }}
      >
        <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.78rem" }}>
          Year: {label}
        </p>
        <p
          style={{
            margin: "0.35rem 0 0",
            color: "#6b7c93",
            fontWeight: 700,
          }}
        >
          {value >= 0 ? "+" : ""}${Math.round(value).toLocaleString()}
        </p>
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

      <div style={{ margin: "0 auto"}}>
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
        <hr style={{ marginBottom: "3rem", color: "#9ca3af"}}/>

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
                <p style={{ color: "#9ca3af", marginBottom: "0.4rem", fontSize:"0.8rem", alignItems:"center" }}>
                  Latest ZHVI
                  <InfoTooltip text={zhviDescription} isMobile={isMobile}/>
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
                <p style={{ color: "#9ca3af", marginBottom: "0.4rem", fontSize:"0.8rem", alignItems:"center"}}>
                  Latest HPI
                  <InfoTooltip text={hpiDescription} isMobile={isMobile}/>
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
              <p style={{ color: "#94a3b8"}}>
                Columbia, MO - {metric.toUpperCase() == "ZHVI" ? "Typical home value estimated by Zillow" : "Index-based measure of home price changes over time"}  - {timeseries.length} records
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
                <option style={{ color: "#6b7280"}} value="zhvi">ZHVI</option>
                <option style={{ color: "#6b7280"}} value="hpi">HPI</option>
              </select>
            </div>
           
          </div>

          {loading ? (
            <p>Loading time series...</p>
          ) : (
            <div style={{ width: "100%", marginTop: "1rem" }} className = "chart-card no-tap-highlight">
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

        {metric === "zhvi" && (
          <section
            style={{
              background: "#ffffff",
              padding: isMobile ? "1rem" : "1.4rem",
              borderRadius: "20px",
              border: "1px solid #eef2f7",
              boxShadow: "0 12px 32px rgba(15,23,42,0.06)",
              marginTop: "1.5rem",
            }}
          >
            <div style={{ marginBottom: "1rem" }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: isMobile ? "1.1rem" : "1.3rem",
                  color: "#6b7280",
                }}
              >
                Annual ZHVI Change
              </h2>
              <p
                style={{
                  color: "#94a3b8",
                  marginTop: "0.45rem",
                  marginBottom: 0,
                  fontSize: isMobile ? "0.85rem" : "0.9rem",
                }}
              >
                Year-over-year change of typical home values in Columbia, MO 
              </p>
            </div>
            <div className = "chart-card no-tap-highlight">
            <ResponsiveContainer width="100%" height={isMobile ? 280 : 320}>
              <BarChart data={annualChangeData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="year"
                  tick={{ fill: "#94a3b8", fontSize: isMobile ? 9 : 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#94a3b8", fontSize: isMobile ? 9 : 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `$${Math.round(value / 1000)}k`}
                  width={isMobile ? 45 : 60}
                  domain={["auto", "auto"]}
                />
                <Tooltip
                  content={<BarTooltip/>}
                />
                <Bar dataKey="change" radius={[6, 6, 0, 0]}>
                  {annualChangeData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.change >=0 ? "#c3eac6" : "#f36273"}
                    />
                  ))}
                </Bar>
                
              </BarChart>
            </ResponsiveContainer>
            </div>
          </section>
        )}

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
