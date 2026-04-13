import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import Papa from "papaparse";

import { ExternalLink } from "lucide-react";
import ListingsPieChart from "./ListingsPieChart";

const GOOGLE_SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/12UIAyTGpmpSUIiknHputt-SX8hxHSfMZSVoc-X12-o8/export?format=csv&gid=0";

const FILTER_OPTIONS = [
  { label: "Property Type", value: "type" },
  { label: "Status", value: "status" },
  { label: "Listing Type", value: "listingType" },
  { label: "Elementary School", value: "elementarySchool" },
  { label: "Middle School", value: "middleSchool" },
  { label: "High School", value: "highSchool" },
];



const SCHOOL_INFO = {
    elementarySchool: {
      MP: {
        name: "Mary Paxton Keeley Elementary",
        note:
          "Mary Paxton Keeley is one of the more sought-after elementary schools in Columbia, known for strong parent interest and consistent demand in surrounding neighborhoods.",
        rating: 9,
      },
      MC: {
        name: "Mill Creek Elementary",
        note:
          "Mill Creek is widely considered a strong elementary option locally, often attracting family buyers looking for desirable school zones.",
        rating: 10,
      },
      RB: {
        name: "Rock Bridge Elementary",
        note:
          "Schools in the Rock Bridge area typically see higher market attention, with strong demand from family-oriented buyers.",
        rating: 8,
      },
      BR: {
        name: "Beulah Ralph Elementary",
        note:
          "Beulah Ralph serves several established neighborhoods and is commonly included in searches for family-friendly areas.",
        rating: 9,
      },
      Other: {
        name: "Other",
        note: "",
        rating: "",
      },
    },
  
    middleSchool: {
      Smithton: {
        name: "Smithton Middle School",
        note:
          "Smithton is one of the more recognized middle schools in Columbia and is generally well regarded by local families.",
        rating: 5,
      },
      Gentry: {
        name: "Gentry Middle School",
        note:
          "Gentry Middle School serves a growing residential area and is commonly associated with newer developments.",
        rating: 7,
      },
      JW: {
        name: "John Warner Middle School",
        note:
          "John Warner is a highly sought-after middle school and often a key factor for buyers prioritizing school districts.",
        rating: 9,
      },
      Jefferson: {
        name: "Jefferson Middle School",
        note:
          "Jefferson covers a wide area of Columbia and frequently appears across diverse listing types.",
        rating: 9,
      },
      Other: {
        name: "Other",
        note: "",
        rating: "",
      },
    },
  
    highSchool: {
      Hickman: {
        name: "Hickman High School",
        note:
          "Hickman High School is one of the primary high schools in Columbia with broad district coverage.",
        rating: 7,
      },
      RB: {
        name: "Rock Bridge High School",
        note:
          "Rock Bridge High School typically draws strong buyer interest and is often a major consideration for family-focused purchases.",
        rating: 9,
      },
      Other: {
        name: "Other",
        note: "",
        rating: "",
      },
    },
  };

function normalizeRow(row) {
    return {
      mls: row["mls#"]?.trim() || "",
      address: row["Address"]?.trim() || "",
      type: row["type"]?.trim() || "Unknown",
      status: row["status"]?.trim() || "Unknown",
      listingType: row["listing type"]?.trim() || "Unknown",
      price: row["price"]?.trim() || "",
      sqft: row["Sqft"]?.trim() || "",
      bedrooms: row["Bedrooms"]?.trim() || "",
      bathrooms: row["Bathrooms"]?.trim() || "",
      builtYear: row["Built year"]?.trim() || "",
      daysOnMarket: row["Days on market"]?.trim() || "",
      link: row["link"]?.trim() || "",
      elementarySchool:
        row["Elementary school"]?.trim() ||
        row["Elementary School"]?.trim() ||
        row["elementary school"]?.trim() ||
        "Unknown",
      middleSchool:
        row["Middle school"]?.trim() ||
        row["Middle School"]?.trim() ||
        row["middle school"]?.trim() ||
        "Unknown",
      highSchool:
        row["High school"]?.trim() ||
        row["High School"]?.trim() ||
        row["high school"]?.trim() ||
        "Unknown",
    };
  }

function buildPieData(listings, selectedField) {
  const counts = {};

  listings.forEach((item) => {
    const key = item[selectedField] || "Unknown";
    counts[key] = (counts[key] || 0) + 1;
  });

  return Object.entries(counts).map(([name, value]) => ({
    name,
    value,
  }));
}



function getDescription(selectedField, pieData) {
  if (
    selectedField !== "elementarySchool" &&
    selectedField !== "middleSchool" &&
    selectedField !== "highSchool"
  ) {
    const labelMap = {
      type: "property type",
      status: "status",
      listingType: "listing type",
    };

    return {
      title: "Current View",
      text: `This chart shows the distribution of Lihua's listings by ${labelMap[selectedField]}.`,
      bullets: pieData.map((item) => `${item.name}: ${item.value} listing(s)`),
    };
  }

  const schoolMeta = SCHOOL_INFO[selectedField] || {};
  const bullets = pieData.filter((item) => item.name !== "Other").map((item) => {
    const info = SCHOOL_INFO[selectedField]?.[item.name];
  
    if (!info) return `${item.name}: ${item.value} listing(s)`;
  
    return `${info.name} · Rating ${info.rating}/10`;
  });

  let text =
    "This chart shows how Lihua's listings are distributed across schools.";

  if (selectedField === "elementarySchool") {
    text =
      "This view highlights the elementary schools attached to the current listings. Schools such as Rock Bridge area schools, Mill Creek, and Mary Paxton Keeley are often points of interest for family buyers.";
  }

  if (selectedField === "middleSchool") {
    text =
      "This view highlights the middle school distribution for the current listings, which can help users quickly understand school-area coverage.";
  }

  if (selectedField === "highSchool") {
    text =
      "This view highlights the high school distribution for the current listings. Rock Bridge and Hickman are especially recognizable names for many Columbia home searches.";
  }

  return {
    title: "School Area Overview",
    text,
    bullets,
  };
}

function getDisplayName(selectedField, shortName) {
  if (!shortName) return shortName;

  const info = SCHOOL_INFO[selectedField]?.[shortName];
  if (info?.name) return info.name;

  return shortName;
}



function getShortDisplayName(selectedField, shortName) {
  const fullName = getDisplayName(selectedField, shortName);

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

export default function MyListingsSection() {
  const [listings, setListings] = useState([]);
  const [selectedField, setSelectedField] = useState("type");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  //const [activeSlice, setActiveSlice] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const isMobile = windowWidth < 768;
  const hoverSliceRef = useRef(null);
  const summaryCardStyle = {
    background: "#ffffff",
    padding: isMobile ? "0.9rem" : "1rem",
    borderRadius: "18px",
    border: "1px solid #eef2f7",
    boxShadow: "0 6px 18px rgba(15,23,42,0.05)",
  };

  const pieData = useMemo(() => {
    return buildPieData(listings, selectedField);
  }, [listings, selectedField]);

  const summary = useMemo(() => {
    const forSaleCount = listings.filter(
      (item) => item.listingType.toLowerCase() === "for sale"
    ).length;

    const forLeaseCount = listings.filter(
      (item) => item.listingType.toLowerCase() === "for lease"
    ).length;

    const activeCount = listings.filter(
        (item) => item.status.toLowerCase() === "active"
      ).length;

    const pendingCount = listings.filter(
      (item) => item.status.toLowerCase() === "pending"
    ).length;

    return {
      forSaleCount,
      forLeaseCount,
      pendingCount,
      activeCount
    };
  }, [listings]);

  const today = new Date();

  const formattedDate = today.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const dateStyle = {
    margin: "0.25rem 0 0",
    fontSize: "0.7rem",
    color: "#94a3b8",
  };



  const [listingSlice, setListingSlice] = useState(null);



  //切换group时候清空div
  useEffect(() => {
    setListingSlice(null);
  }, [selectedField]);

  //过滤listings
  const filteredListings = useMemo(() => {
    if (!listingSlice) return [];
  
    return listings.filter(
      (item) => item[selectedField] === listingSlice.name
    );
  }, [listings, selectedField, listingSlice]);


  const handleSliceHoverOrClick = useCallback((slice) => {
    setListingSlice(slice);
  }, []);



  useEffect(() => {
    async function fetchSheetData() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(GOOGLE_SHEET_CSV_URL);
        const csvText = await response.text();

        const parsed = Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
        });
        // check point
        console.log("headers:", Object.keys(parsed.data[0] || {}));
        console.log("first row:", parsed.data[0]);

        const normalized = parsed.data.map(normalizeRow);
        setListings(normalized);
      } catch (err) {
        console.error("Failed to fetch Google Sheet data:", err);
        setError("Failed to load listing data.");
      } finally {
        setLoading(false);
      }
    }

    fetchSheetData();
  }, []);
  

  useEffect(() => {
    function handleResize() {
      setWindowWidth(window.innerWidth);
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
 



  function CustomTooltip({ active, payload, label }) {
    if (!active || !payload || !payload.length) return null;
  
    const item = payload[0];
    const name = item.name;
    const value = item.value;
  
    const info = SCHOOL_INFO[selectedField]?.[name];
    const displayName = getDisplayName(selectedField, name);
    
  
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

  const description = useMemo(() => {
    return getDescription(selectedField, pieData);
  }, [selectedField, pieData]);

  if (loading) {
    return (
      <section className="mt-10 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-stone-800">My Listings</h2>
        <p className="mt-3 text-stone-500">Loading listing data...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mt-10 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-stone-800">My Listings</h2>
        <p className="mt-3 text-red-500">{error}</p>
      </section>
    );
  }



  return (
    <>
      <div style={{ margin: "5rem 0 1.2rem" }}>
        <h2
          style={{
            margin: 0,
            textAlign: "start",
            fontSize: isMobile ? "1.1rem" : "1.5rem",
            color: "#6b7280",
            fontWeight: 600,
          }}
        >
          My Listings
        </h2>
  
        <p
          style={{
            margin: "0.45rem 0 0",
            textAlign: "start",
            color: "#94a3b8",
            fontSize: isMobile ? "0.85rem" : "0.9rem",
          }}
        >
          Active listings and school-area distribution for Lihua He
        </p>
      </div>
      <section style={{ marginBottom: "1.25rem" }}>
        <div
            style={{
            display: "grid",
            gridTemplateColumns: isMobile
                ? "repeat(2, 1fr)"
                : "repeat(4, minmax(0, 1fr))",
            gap: "1rem",
            }}
        >
            <div style={summaryCardStyle}>
            <p style={{ margin: 0, color: "#9ca3af", fontSize: "0.75rem", fontWeight: 600 }}>
                My Listings For Sale
            </p>
            <h3 style={{ margin: "0.35rem 0 0", fontSize: isMobile ? "1rem" : "1.2rem", color: "#111827" }}>
                {summary.forSaleCount}
            </h3>
            <p style={dateStyle}>Updated {formattedDate}</p>
            </div>

            <div style={summaryCardStyle}>
            <p style={{ margin: 0, color: "#9ca3af", fontSize: "0.75rem", fontWeight: 600 }}>
                My Listing For Lease
            </p>
            <h3 style={{ margin: "0.35rem 0 0", fontSize: isMobile ? "1rem" : "1.2rem", color: "#111827" }}>
                {summary.forLeaseCount}
            </h3>
            <p style={dateStyle}>Updated {formattedDate}</p>
            </div>

            <div style={summaryCardStyle}>
            <p style={{ margin: 0, color: "#9ca3af", fontSize: "0.75rem", fontWeight: 600 }}>
                Active Listings
            </p>
            <h3 style={{ margin: "0.35rem 0 0", fontSize: isMobile ? "1rem" : "1.2rem", color: "#111827" }}>
                {summary.activeCount}
            </h3>
            <p style={dateStyle}>Updated {formattedDate}</p>
            </div>

            <div style={summaryCardStyle}>
            <p style={{ margin: 0, color: "#9ca3af", fontSize: "0.75rem", fontWeight: 600 }}>
                Pending
            </p>
            <h3 style={{ margin: "0.35rem 0 0", fontSize: isMobile ? "1rem" : "1.2rem", color: "#111827" }}>
                {summary.pendingCount}
            </h3>
            <p style={dateStyle}>Updated {formattedDate}</p>
            </div>
        </div>
        </section>
      <section
        style={{
          background: "#ffffff",
          padding: isMobile ? "1rem" : "1.5rem",
          borderRadius: "18px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
          border: "1px solid #eef2f7",
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
            Listings Distribution
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
            Explore Lihua He&apos;s listings by property type, status, listing type,
            and school area
          </p>
     
          <div
            style={{
                marginTop: "1rem",
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "minmax(0, 1fr) auto",
                alignItems: "start",
                gap: "0.75rem 1rem",
                width: "100%",
                minWidth: 0,
            }}
            >
            
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    flexWrap: "wrap",
                }}
                >
                {pieData.map((item, index) => (
                    <div
                    key={index}
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
                        width: "12px",
                        height: "12px",
                        borderRadius: "2px",
                        background: [
                            "#fec2e4",
                            "#2a9c9d",
                            "#c09bbc",
                            "#96af6f",
                            "#769bbd",
                            "#f4e0e1",
                            "#b8dea4",
                        ][index % 7],
                        }}
                    />
                    {getDisplayName(selectedField, item.name)}
                    </div>
                ))}
                </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span
                style={{
                  color: "#94a3b8",
                  fontWeight: 600,
                  fontSize: "0.82rem",
                }}
              >
                Group by
              </span>
  
              <select
                value={selectedField}
                onChange={(e) => setSelectedField(e.target.value)}
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
                {FILTER_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
  
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))",
            gap: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          
  
         
  
         
        </div>
  
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "minmax(0, 1fr) 360px",
            gap: "24px",
            alignItems: "start",
          }}
        >
        <div className = "chart-card no-tap-highlight" >
        <ListingsPieChart
          pieData={pieData}
          selectedField={selectedField}
          isMobile={isMobile}
          onSliceHoverOrClick={handleSliceHoverOrClick}
          // getDisplayName={getDisplayName}
          // getShortDisplayName={getShortDisplayName}
          // CustomTooltip={CustomTooltip}
          schoolInfo = {SCHOOL_INFO}
        />
           
        </div>
        {isMobile && listingSlice && filteredListings.length > 0 && (
          <div
            style={{
              marginTop: "1.25rem",
              background: "#ffffff",
              border: "1px solid #eef2f7",
              borderRadius: "18px",
              padding: "1rem",
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: "1rem",
                color: "#6b7280",
                marginBottom: "0.75rem",
                textAlign: "left",
              }}
            >
              Listings by {FILTER_OPTIONS.find(option => option.value === selectedField)?.label} 
              <p
              style={{
              fontSize: "0.8rem",
              color: "#94a3b8",
              marginTop: "4px",
              textAlign: "left",
              }}
              >
              {getDisplayName(selectedField, listingSlice.name)}
              </p>
              
            </h3>

            <div style={{ display: "grid", gap: "0.75rem" }}>
            {filteredListings.map((item, i) => {
              const card = (
                <div
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #eef2f7",
                    borderRadius: "12px",
                    padding: "0.9rem 1rem",
                    textAlign: "left",
                    cursor: item.link ? "pointer" : "default",
                    transition: "all 0.18s ease",
                    boxShadow: "0 0 0 rgba(0,0,0,0)",
                    position: "relative",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 8px 18px rgba(15,23,42,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 0 0 rgba(0,0,0,0)";
                  }}
                >
                  {item.link && (
                    <ExternalLink
                      size={14}
                      strokeWidth={2}
                      style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        color: "#94a3b8",
                        pointerEvents: "none",
                      }}
                    />
                  )}
                  <div
                    style={{
                      fontWeight: 600,
                      color: "#475569",
                      fontSize: "0.95rem",
                      textAlign: "left",
                    }}
                  >
                    {item.address}
                  </div>

                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "#94a3b8",
                      marginTop: "4px",
                      textAlign: "left",
                    }}
                  >
                    {item.price}
                    {item.bedrooms ? ` · ${item.bedrooms} bd` : ""}
                    {item.bathrooms ? ` · ${item.bathrooms} ba` : ""}
                  </div>
                </div>
              );

              return item.link ? (
                <a
                  key={i}
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "block",
                    textDecoration: "none",
                  }}
                >
                  {card}
                </a>
              ) : (
                <div key={i}>{card}</div>
              );
            })}
            </div>
          </div>
        )}
        
          <div
            style={{
              
              background: "#ffffff",
              padding: isMobile ? "1rem" : "1.1rem",
              borderRadius: "18px",
              border: "1px solid #eef2f7",
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: isMobile ? "1.05rem" : "1.15rem",
                color: "#6b7280",
              }}
            >
              {description.title}
            </h3>
  
            <p
              style={{
                margin: "0.75rem 0 0",
                color: "#94a3b8",
                fontSize: isMobile ? "0.84rem" : "0.88rem",
                lineHeight: 1.6,
              }}
            >
              {description.text}
            </p>
  
            <div
              style={{
                marginTop: "1rem",
                display: "grid",
                gap: "0.6rem",
              }}
            >
              {isMobile? null: description.bullets.map((bullet, index) => (
                
                <div
                  key={index}
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #eef2f7",
                    borderRadius: "12px",
                    padding: "0.7rem 0.8rem",
                    color: "#6b7280",
                    fontSize: "0.84rem",
                    lineHeight: 1.45,
                  }}
                >
                  {bullet}
                </div>
              ))}
            </div>
          </div>
        </div>
        {!isMobile && listingSlice && filteredListings.length > 0 && (
          <div
            style={{
              marginTop: "1.25rem",
              background: "#ffffff",
              border: "1px solid #eef2f7",
              borderRadius: "18px",
              padding: "1rem",
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: "1rem",
                color: "#6b7280",
                marginBottom: "0.75rem",
                textAlign: "left",
              }}
            >
              Listings by {FILTER_OPTIONS.find(option => option.value === selectedField)?.label} 
              <p
              style={{
              fontSize: "0.8rem",
              color: "#94a3b8",
              marginTop: "4px",
              textAlign: "left",
              }}
              >
              {getDisplayName(selectedField, listingSlice.name)}
              </p>
            </h3>

            <div style={{ display: "grid", gap: "0.75rem" }}>
            {filteredListings.map((item, i) => {
              const card = (
                <div
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #eef2f7",
                    borderRadius: "12px",
                    padding: "0.9rem 1rem",
                    textAlign: "left",
                    cursor: item.link ? "pointer" : "default",
                    transition: "all 0.18s ease",
                    boxShadow: "0 0 0 rgba(0,0,0,0)",
                    position: "relative",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 8px 18px rgba(15,23,42,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 0 0 rgba(0,0,0,0)";
                  }}
                >
                  {item.link && (
                    <ExternalLink
                      size={14}
                      strokeWidth={2}
                      style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        color: "#94a3b8",
                        pointerEvents: "none",
                      }}
                    />
                  )}
                  <div
                    style={{
                      fontWeight: 600,
                      color: "#475569",
                      fontSize: "0.95rem",
                      textAlign: "left",
                    }}
                  >
                    {item.address}
                  </div>

                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "#94a3b8",
                      marginTop: "4px",
                      textAlign: "left",
                    }}
                  >
                    {item.price}
                    {item.bedrooms ? ` · ${item.bedrooms} bd` : ""}
                    {item.bathrooms ? ` · ${item.bathrooms} ba` : ""}
                  </div>
                </div>
              );

              return item.link ? (
                <a
                  key={i}
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "block",
                    textDecoration: "none",
                  }}
                >
                  {card}
                </a>
              ) : (
                <div key={i}>{card}</div>
              );
            })}
            </div>
          </div>
        )}
        
      </section>
    </>
  );
}