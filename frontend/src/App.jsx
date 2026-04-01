import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
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



  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f7f8fc",
        padding: isMobile ? "1rem" : "2rem",
        fontFamily: "Arial, sans-serif",
        color: "#1f2937",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <header style={{ marginBottom: "2rem" }}>
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

        {/* Summary Cards */}
        <section style={{ marginBottom: "2rem" }}>
          <h2 style={{ marginBottom: "1rem" }}>Summary</h2>

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
                  background: "white",
                  padding: "1rem",
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
              >
                <p style={{ color: "#6b7280", marginBottom: "0.5rem" }}>
                  Total Months
                </p>
                <h3 style={{ margin: 0 }}>{summary.total_rows}</h3>
              </div>

              <div
                style={{
                  background: "white",
                  padding: "1rem",
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
              >
                <p style={{ color: "#6b7280", marginBottom: "0.5rem" }}>
                  Latest ZHVI
                </p>
                <h3 style={{ margin: 0 }}>
                  {formatValue(summary.latest_zhvi?.value, "zhvi")}
                </h3>
                <p style={{ marginTop: "0.5rem", color: "#6b7280" }}>
                  {summary.latest_zhvi?.date}
                </p>
              </div>

              <div
                style={{
                  background: "white",
                  padding: "1rem",
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
              >
                <p style={{ color: "#6b7280", marginBottom: "0.5rem" }}>
                  Latest HPI
                </p>
                <h3 style={{ margin: 0 }}>
                  {formatValue(summary.latest_hpi?.value, "hpi")}
                </h3>
                <p style={{ marginTop: "0.5rem", color: "#6b7280" }}>
                  {summary.latest_hpi?.date}
                </p>
              </div>

              <div
                style={{
                  background: "white",
                  padding: "1rem",
                  borderRadius: "12px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
              >
                <p style={{ color: "#6b7280", marginBottom: "0.5rem" }}>
                  Data Coverage
                </p>
                <h3 style={{ margin: 0, fontSize: "1rem" }}>
                  {summary.start_date}
                </h3>
                <p> to </p>
                <h3 style={{ margin: 0, fontSize: "1rem" }}>
                  {summary.end_date}
                </h3>
              </div>
            </div>
          ) : (
            <p>Loading summary...</p>
          )}
        </section>

        {/* Chart Section */}
        <section
          style={{
            background: "white",
            padding: "1.5rem",
            borderRadius: "16px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: isMobile ? "column" : "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2 style={{color: "#6b7280", marginBottom: "1rem" }}>Trend Chart</h2>
              <p style={{ color: "#6b7280", marginTop: "0.5rem" }}>
                Current metric: {metric.toUpperCase()}
              </p>
            </div>

            <div>
              <label htmlFor="metric-select" style={{ marginRight: "0.5rem" }}>
                Metric:
              </label>
              <select
                id="metric-select"
                value={metric}
                onChange={(e) => setMetric(e.target.value)}
                style={{
                  padding: "0.5rem 0.75rem",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  background: "white",
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
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: isMobile ? "0.8rem" : "1rem" }} minTickGap={30} />
                  <YAxis
                    type="number"
                    domain={["dataMin", "dataMax"]}
                    tick={{ fontSize: isMobile ? "0.8rem" : "1rem" }}
                    tickFormatter={(value) =>
                      metric === "zhvi"
                        ? `$${Math.round(value / 1000)}k`
                        : value.toFixed(0)
                    }
                  />
                  <Tooltip
                    formatter={(value) => formatValue(value, metric)}
                    labelFormatter={(label) => `Date: ${formatDate(label)}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    strokeWidth={2}
                    dot={false}
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
