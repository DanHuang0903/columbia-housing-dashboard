import { useEffect, useState } from "react";
import {LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

function App() {
  const [summary, setSummary] = useState(null);
  const [timeseries, setTimeseries] = useState([]);
  const [metric, setMetric] = useState("zhvi");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSummary();
  }, []);

  useEffect(() => {
    fetchTimeseries(metric);
  }, [metric]);

  async function fetchSummary() {
    try {
      const res = await fetch("http://127.0.0.1:8000/summary");
      const data = await res.json();
      //console.log(data);
      data.start_date = data.start_date.slice(0, 10);
      data.end_date = data.end_date.slice(0, 10);
      data.latest_hpi.date = data.latest_hpi.date.slice(0, 10);
      data.latest_zhvi.date = data.latest_zhvi.date.slice(0, 10);
      setSummary(data);
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
      //console.log(data[0]);
      const formatted = data.map((d) => ({
        ...d,
        date: d.date.slice(0, 10),
        value: Number(d.value)
      })).filter((d) => !Number.isNaN(d.value));
      console.log(formatted[0]);
      setTimeseries(formatted);
      setError("");
    } catch (err) {
      setError("Failed to load time series data.");
    } finally {
      setLoading(false);
    }
  }
  console.log("timeseries length:", timeseries.length);
  console.log("timeseries sample:", timeseries.slice(0, 3));

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Columbia Housing Dashboard</h1>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Summary</h2>
        {summary ? (
          <div>
            <p><strong>Total Rows:</strong> {summary.total_rows}</p>
            <p><strong>Start Date:</strong> {summary.start_date}</p>
            <p><strong>End Date:</strong> {summary.end_date}</p>
            <p>
              <strong>Latest ZHVI:</strong>{" "}
              {summary.latest_zhvi?.value} ({summary.latest_zhvi?.date})
            </p>
            <p>
              <strong>Latest HPI:</strong>{" "}
              {summary.latest_hpi?.value} ({summary.latest_hpi?.date})
            </p>
          </div>
        ) : (
          <p>Loading summary...</p>
        )}
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2>Time Series</h2>

        <label htmlFor="metric-select"><strong>Select Metric: </strong></label>
        <select
          id="metric-select"
          value={metric}
          onChange={(e) => setMetric(e.target.value)}
        >
          <option value="zhvi">ZHVI</option>
          <option value="hpi">HPI</option>
        </select>

        {loading ? (
          <p>Loading time series...</p>
        ) : (
          <div style={{ width:"100%", marginTop: "1rem" }}>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={timeseries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize:12 }}/>
                <YAxis type="number" domain={["dataMin", "dataMax"]} tick={{ fontSize:12 }}/>
                <Tooltip/>
                <Line type="monotone" dataKey="value" strokeWidth={2} dot={ false } isAnimationActive={false} />
        
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}
    </div>
  );
}

export default App;
