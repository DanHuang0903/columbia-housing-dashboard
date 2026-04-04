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
  ComposedChart,
  Legend
} from "recharts";

function App() {
  const [summary, setSummary] = useState(null);
  const [timeseries, setTimeseries] = useState([]);
  const [metric, setMetric] = useState("zhvi");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMetric, setSelectedMetric] = useState("zhvi");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [marketData, setMarketData] = useState([]);
  const [range, setRange] = useState("12");
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
    fetch("https://columbia-housing-dashboard.onrender.com/market-overview")
      .then(res => res.json())
      .then(data => setMarketData(data));
  }, []);

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

  function MarketTooltip({ active, payload, label }) {
    if (!active || !payload || !payload.length) return null;
  
    const row = payload[0].payload;
  
    const date = new Date(label).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  
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
          {date}
        </p>
  
        <p style={{ margin: "0.35rem 0 0", fontWeight: 700, color:"#6b7c93" }}>
          Inventory: {row.inventory}
        </p>
  
        {!isMobile && (
          <p style={{ margin: "0.2rem 0 0", fontWeight: 700, color:"#6b7c93" }}>
            New Listings: {row.new_listings}
          </p>
        )}
  
        <p style={{ margin: "0.2rem 0 0", fontWeight: 700, color:"#6b7c93"  }}>
          Sales Count: {row.sales_count}
        </p>
      </div>
    );
  }


  function getFilteredData() {
      if (range === "all") return marketData;
    
      const months = parseInt(range);
      return marketData.slice(-months);
    }
    
  const filteredMarketData = getFilteredData();
  console.log(filteredMarketData);
  const desktopBarSize =
  range === "12" ? 30 :
  range === "24" ? 14 :
  range === "36" ? 10 :
  8;
  const labelStyle = {
    color: "#9ca3af",
    fontSize: "0.75rem",
    fontWeight: 600,
    marginBottom: "0.3rem",
  };
  
  const valueStyle = {
    margin: 0,
    fontSize: isMobile ? "1rem" : "1.2rem",
    fontWeight: 700,
    color: "#111827",
  };
  
  const subStyle = {
    marginTop: "0.3rem",
    color: "#94a3b8",
    fontSize: "0.75rem",
  };
  const cardStyle = {
    background: "#ffffff",
    padding: isMobile ? "0.9rem" : "1rem",
    borderRadius: "18px",
    border: "1px solid #eef2f7",
    boxShadow: "0 6px 18px rgba(15,23,42,0.05)",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f9fafb",
        padding: isMobile ? "1rem" : "2rem",
        fontFamily: "Arial, sans-serif",
        color: "#1f2937",
        overflowX: "hidden"
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
        <div style={{ marginBottom: "1.2rem" }}>
            <h2
              style={{
                margin: 0,
                textAlign: "start",
                fontSize: isMobile ? "1.1rem" : "1.5rem",
                color: "#6b7280",
                fontWeight: 600,
              }}
            >
              Summary
            </h2>

            <p
              style={{
                margin: "0.45rem 0 0",
                textAlign: "start",
                color: "#94a3b8",
                fontSize: isMobile ? "0.85rem" : "0.9rem",
              }}
            >
              Key housing indicators and data coverage
            </p>
          </div>

          {summary ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "1rem",
              }}
            >
              <div style={cardStyle}>
                <p style={labelStyle}>Latest ZHVI
                <InfoTooltip text={zhviDescription} isMobile={isMobile}/>
                </p>
                <h3 style={valueStyle}>
                  {formatValue(summary.latest_zhvi?.value, "zhvi")}
                </h3>
                <p style={subStyle}>
                  {summary.latest_zhvi?.date?.slice(0, 7)}
                </p>
              </div>
              <div style={cardStyle}>
                <p style={labelStyle}>Latest HPI
                <InfoTooltip text={hpiDescription} isMobile={isMobile}/>
                </p>
                <h3 style={valueStyle}>
                  {formatValue(summary.latest_hpi?.value, "zhiv")}
                </h3>
                <p style={subStyle}>
                  {summary.latest_hpi?.date?.slice(0, 7)}
                </p>
              </div>

              <div style={cardStyle}>
                <p style={labelStyle}>Latest Annal Price Change
                </p>
                <h3 style={valueStyle}>
                  ${annualChangeData[annualChangeData.length - 1].change}
                </h3>
                <p style={subStyle}>
                {annualChangeData[annualChangeData.length - 2].year} to {annualChangeData[annualChangeData.length - 1].year}
                </p>
              </div>

              <div style={cardStyle}>
                <p style={labelStyle}>Latest Inventory
                </p>
                <h3 style={valueStyle}>
                  {filteredMarketData[filteredMarketData.length - 1].inventory}
                </h3>
                <p style={subStyle}>
                  {filteredMarketData[filteredMarketData.length - 1].date}
                </p>
              </div>
              <div style={cardStyle}>
                <p style={labelStyle}>Latest New Listings
                </p>
                <h3 style={valueStyle}>
                  {filteredMarketData[filteredMarketData.length - 1].new_listings}
                </h3>
                <p style={subStyle}>
                  {filteredMarketData[filteredMarketData.length - 1].date}
                </p>
              </div>
              <div style={cardStyle}>
                <p style={labelStyle}>Latest Sales Counts
                </p>
                <h3 style={valueStyle}>
                  {filteredMarketData[filteredMarketData.length - 1].sales_count}
                </h3>
                <p style={subStyle}>
                  {filteredMarketData[filteredMarketData.length - 1].date}
                </p>
              </div>
             
            </div>
          ) : (
            <p>Loading summary...</p>
          )}
        </section>

        {/* Chart Section */}
        <div style={{ margin: "2rem 0 1.2rem" }}>
            <h2
              style={{
                margin: 0,
                textAlign: "start",
                fontSize: isMobile ? "1.1rem" : "1.5rem",
                color: "#6b7280",
                fontWeight: 600,
              }}
            >
              Columbia Housing Trends
            </h2>

            <p
              style={{
                margin: "0.45rem 0 0",
                textAlign: "start",
                color: "#94a3b8",
                fontSize: isMobile ? "0.85rem" : "0.9rem",
              }}
            >
              Market indicators and trends for Columbia, MO
            </p>
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

          <div style={{ marginBottom: "1.25rem" }}>
            <h2
              style={{
                margin: 0,
                textAlign: "center",
                fontSize: isMobile ? "1.1rem" : "1.3rem",
                color: "#6b7280",
              }}
            >
              Trend Chart
            </h2>

            <p
              style={{
                margin: "0.45rem 0 0",
                textAlign: "center",
                color: "#94a3b8",
                fontSize: isMobile ? "0.85rem" : "0.9rem",
                lineHeight: 1.5,
              }}
            >
              Columbia, MO ·{" "}
              {metric === "zhvi"
                ? "Typical home value estimated by Zillow"
                : "Index-based measure of home price changes over time"}{" "}
              · {timeseries.length} records
            </p>
            <div
              style={{
                marginTop: "1rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "0.75rem",
                width:"100%",
                minWidth:0
              }}
            >
              {/* legend */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: isMobile ? "0.78rem" : "0.85rem",
                  color: "#6b7280",
                }}
              >
                <div
                  style={{
                    width: "16px",
                    height: "2px",
                    background: "#60a5fa",
                    borderRadius: "999px",
                  }}
                />
                <span>Typical Home Value</span>
              </div>

              {/* dropdown */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span
                  style={{
                    color: "#94a3b8",
                    fontWeight: 600,
                    fontSize: "0.82rem",
                  }}
                >
                  Metric
                </span>

                <select
                  value={metric}
                  onChange={(e) => setMetric(e.target.value)}
                  style={{
                    padding: "0.4rem 0.9rem",
                    borderRadius: "12px",
                    border: "1px solid #e5e7eb",
                    background: "#ffffff",
                    color: "#111827",
                    fontSize: "0.8rem",
                    outline: "none",
                  }}
                >
                  <option value="zhvi">ZHVI</option>
                  <option value="hpi">HPI</option>
                </select>
              </div>
            </div>
    
          </div>

          {loading ? (
            <p>Loading time series...</p>
          ) : (
            <div style={{ width: "100%", minWidth:0, marginTop: "1rem" }} className = "chart-card no-tap-highlight">
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
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "14px",
                alignItems: "center",
                fontSize: isMobile ? "0.78rem" : "0.85rem",
                color: "#6b7280",
                marginBottom: "0.8rem",
                width:"100%",
                minWidth:0
              }}
            >
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  background: "#c3eac6",
                  borderRadius: "3px",
                }}
              />
            <span>Incresed Value</span>
            <div
                style={{
                  width: "10px",
                  height: "10px",
                  background: "#f36273",
                  borderRadius: "3px",
                }}
              />
            <span>Decresed Value</span>
          </div>
          </div>
            <div className = "chart-card no-tap-highlight" style={{ width: "100%", minWidth: 0 }}>
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
       <div style={{ marginBottom: "1.25rem" }}>
        <h2
          style={{
            margin: 0,
            textAlign: "center",
            fontSize: isMobile ? "1.1rem" : "1.3rem",
            color: "#6b7280",
          }}
        >
          Market Overview
        </h2>

        <p
          style={{
            margin: "0.45rem 0 0",
            textAlign: "center",
            color: "#94a3b8",
            fontSize: isMobile ? "0.85rem" : "0.9rem",
          }}
        >
          Inventory, new listings, and sales activity in Columbia, MO
        </p>

        <div
          style={{
            marginTop: "1rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "0.75rem",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "14px",
              alignItems: "center",
              fontSize: isMobile ? "0.78rem" : "0.85rem",
              color: "#6b7280",
             
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  background: "#8884d8",
                  borderRadius: "3px",
                }}
              />
              <span>Inventory</span>
            </div>

            {!isMobile && (
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div
                  style={{
                    width: "10px",
                    height: "10px",
                    background: "#82ca9d",
                    borderRadius: "3px",
                  }}
                />
                <span>New Listings</span>
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div
                style={{
                  width: "16px",
                  height: "2px",
                  background: "#f59e0b",
                  borderRadius: "999px",
                }}
              />
              <span>Sales Count</span>
            </div>
          </div>

          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            style={{
              padding: "0.4rem 0.9rem",
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
              background: "#ffffff",
              color: "#111827",
              fontSize: "0.8rem",
              outline: "none",
            }}
          >
            <option value="12">Last 12 Months</option>
            <option value="24">Last 24 Months</option>
            <option value="36">Last 36 Months</option>
            <option value="all">All</option>
          </select>
        </div>
      </div>
       
      
        <div className = "chart-card no-tap-highlight" style={{ width: "100%", minWidth: 0 }}>
        <ResponsiveContainer width="100%" height={isMobile ? 300 : 360}>
          <ComposedChart data={filteredMarketData} barGap={8}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e5e7eb" />

            <XAxis
              dataKey="date"
              tick={{ fill: "#94a3b8", fontSize: isMobile ? 9 : 11 }}
              axisLine={false}
              tickLine={false}
              minTickGap={isMobile ? 24 : 18}
              tickFormatter={(value) => {
                const d = new Date(value);
                return d.toLocaleDateString("en-US", {
                  month: "short",
                  ...(isMobile ? {} : { year: "2-digit" }),
                });
              }}
            />

            <YAxis
              yAxisId="left"
              tick={{ fill: "#94a3b8", fontSize: isMobile ? 9 : 11 }}
              axisLine={false}
              tickLine={false}
              width={isMobile ? 40 : 52}
            />

            <Tooltip content={<MarketTooltip />} />

            <Bar
              yAxisId="left"
              dataKey="inventory"
              fill="#8884d8"
              radius={[8, 8, 0, 0]}
              barSize={
                range === "12" ? (isMobile ? 20 : 30) :
                range === "24" ? (isMobile ? 14 : 14) :
                range === "36" ? (isMobile ? 10 : 10) :
                (isMobile ? 8 : 8)
              }
              name="Inventory"
            />

            {!isMobile && (
              <Bar
                yAxisId="left"
                dataKey="new_listings"
                fill="#82ca9d"
                radius={[8, 8, 0, 0]}
                barSize={
                  range === "12" ? 30 :
                  range === "24" ? 14 :
                  range === "36" ? 10 :
                  8
                }
                name="New Listings"
              />
            )}

            <Line
              yAxisId="left"
              type="monotone"
              dataKey="sales_count"
              stroke="#f59e0b"
              strokeWidth={3}
              dot={isMobile ? { r: 2 } : { r: 3 }}
              activeDot={{ r: 5 }}
              name="Sales Count"
            />
          </ComposedChart>
        </ResponsiveContainer>
        </div>
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
