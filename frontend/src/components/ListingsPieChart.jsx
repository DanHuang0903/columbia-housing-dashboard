import React, { memo } from "react";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
  } from "recharts";

  function getDisplayName(selectedField, shortName, schoolInfo) {
    if (!shortName) return shortName;
  
    const info = schoolInfo[selectedField]?.[shortName];
    if (info?.name) return info.name;
  
    return shortName;
  }
  
  function getShortDisplayName(selectedField, shortName, schoolInfo) {
    const fullName = getDisplayName(selectedField, shortName, schoolInfo);
  
    if (selectedField === "elementarySchool") {
      if (fullName === "Mary Paxton Keeley Elementary") return "MPK";
      if (fullName === "Beulah Ralph Elementary") return "Beulah Ralph";
      if (fullName === "Rock Bridge Elementary") return "Rock Bridge";
      if (fullName === "Mill Creek Elementary") return "Mill Creek";
      return fullName.replace(" Elementary", "");
    }
  
    if (selectedField === "middleSchool") {
      return fullName.replace(" Middle School", "");
    }
  
    if (selectedField === "highSchool") {
      return fullName.replace(" High School", "");
    }
  
    return fullName;
  }

  function PieCustomTooltip({ active, payload, selectedField, schoolInfo }) {
    if (!active || !payload || !payload.length) return null;
  
    const item = payload[0];
    const name = item.name;
    const value = item.value;
  
    const info = schoolInfo[selectedField]?.[name];
    const displayName = getDisplayName(selectedField, name, schoolInfo);
  
    return (
      <div
        style={{
          background: "#ffffff",
          border: "1px solid #eef2f7",
          borderRadius: "14px",
          padding: "10px 12px",
          boxShadow: "0 6px 18px rgba(15,23,42,0.08)",
          minWidth: "160px",
        }}
      >
        <div
          style={{
            fontSize: "0.9rem",
            fontWeight: 600,
            color: "#475569",
            marginBottom: "4px",
          }}
        >
          {displayName}
        </div>
  
        {info?.rating && (
          <div
            style={{
              fontSize: "0.78rem",
              color: "#64748b",
              marginBottom: "2px",
            }}
          >
            Rating: {info.rating}/10
          </div>
        )}
  
        <div
          style={{
            fontSize: "0.8rem",
            color: "#64748b",
          }}
        >
          {value} listing(s)
        </div>
  
        {info?.note && (
          <div
            style={{
              fontSize: "0.75rem",
              color: "#94a3b8",
              marginTop: "4px",
              lineHeight: 1.3,
            }}
          >
            {info.note}
          </div>
        )}
      </div>
    );
  }

const ListingsPieChart = memo(function ListingsPieChart({
  pieData,
  selectedField,
  isMobile,
  onSliceHoverOrClick,
  schoolInfo,
}) {
  return (
    <PieChart width={isMobile ? 320 : 480} height={isMobile ? 300 : 320}>
      <Pie
        data={pieData}
        dataKey="value"
        nameKey="name"
        cx={isMobile ? "55%" : "45%"}
        cy="50%"
        outerRadius={isMobile ? 110 : 125}
        labelLine={isMobile ? false : true}
        onMouseEnter={(_, index) => {
          if (!isMobile) {
            onSliceHoverOrClick(pieData[index]);
          }
        }}
        onClick={(_, index) => {
          if (isMobile) {
            onSliceHoverOrClick(pieData[index]);
          }
        }}
        label={
          isMobile
            ? (props) => {
                const {
                  cx,
                  cy,
                  midAngle,
                  innerRadius = 0,
                  outerRadius,
                  name,
                  percent,
                } = props;
                const RADIAN = Math.PI / 180;

                const radius = innerRadius + (outerRadius - innerRadius) * 0.68;
                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                const y = cy + radius * Math.sin(-midAngle * RADIAN);

                const shortLabel = getShortDisplayName(
                    selectedField,
                    name,
                    schoolInfo
                  );

                if (percent < 0.08) return null;

                return (
                  <text
                    x={x}
                    y={y}
                    fill="#fff"
                    textAnchor="middle"
                    dominantBaseline="central"
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      pointerEvents: "none",
                    }}
                  >
                    {shortLabel}
                  </text>
                );
              }
            : ({ cx, cy, midAngle, outerRadius, name }) => {
                const RADIAN = Math.PI / 180;
                const radius = outerRadius + 25;
                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                const y = cy + radius * Math.sin(-midAngle * RADIAN);
                const textAnchor = x > cx ? "start" : "end";

                return (
                  <text
                    x={x}
                    y={y}
                    fill="#64748b"
                    textAnchor={textAnchor}
                    dominantBaseline="central"
                    style={{ fontSize: "13px", fontWeight: 500 }}
                  >
                    {getShortDisplayName(selectedField, name, schoolInfo)}
                  </text>
                );
              }
        }
      >
        {pieData.map((entry, index) => (
          <Cell
            key={`cell-${index}`}
            fill={[
              "#fec2e4",
              "#2a9c9d",
              "#c09bbc",
              "#96af6f",
              "#769bbd",
              "#f4e0e1",
              "#b8dea4",
            ][index % 7]}
          />
        ))}
      </Pie>

      <Tooltip
  content={<PieCustomTooltip selectedField={selectedField} schoolInfo={schoolInfo} />}
/>
    </PieChart>
  );
});

export default ListingsPieChart;