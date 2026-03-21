import pandas as pd



#read Zillow data
zillow = pd.read_csv("../data/raw/Metro_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv")

#read first few rows
#print("========== HEAD ===========")
#print(zillow.head(2))

#show columns
#print("\n =========== COLUMN ===========")
#print(zillow.columns[:10])

#show shape
#print("\n============ SHAPE ===========")
#print(zillow.shape)

#find Columbia
#print("\n============= COLUMBIA ===========")
columbia_mo = zillow[(zillow["RegionName"].str.contains("Columbia", case=False, na=False)) &
                     (zillow["StateName"] == "MO")]
#print(columbia_mo)

#find MO
#print("\n============= MO ===========")
missouri = zillow[zillow["StateName"] == "MO"]
#print(missouri.head())

#print(columbia_mo.shape)

id_columns = ["RegionID", "SizeRank", "RegionName", "RegionType", "StateName"]
columbia_long = columbia_mo.melt(
    id_vars = id_columns,
    var_name = "date",
    value_name = "zhvi"
)

columbia_long["date"] = pd.to_datetime(columbia_long["date"])
#print("\n============== COLUMBIA LONG HEAD ==============")
#print(columbia_long.head())

#print("\n=============== COLUMBIA LONG DTYPES ================")
#print(columbia_long.dtypes)

#print("\n================ NULL CHECK ===============")
#print(columbia_long.isna().sum())

columbia_clean = columbia_long[["RegionName", "StateName", "date", "zhvi"]].copy()
columbia_clean = columbia_clean.dropna(subset = ["zhvi"])

#print("\n================== COLUMBIA CLEAN HEAD ================")
#print(columbia_clean.head())

#print("\n=================== COLUMBIA CLEAN SHAPE ==============")
#print(columbia_clean.shape)



#统一schema
columbia_final = columbia_clean.copy()
columbia_final["source"] = "zillow"
columbia_final["region_name"] = columbia_final["RegionName"]
columbia_final["region_type"] = "metro"
columbia_final["state"] = columbia_final["StateName"]
columbia_final["metric_name"] = "zhvi"
columbia_final["value"] = columbia_final["zhvi"]


columbia_final = columbia_final[["source", "region_name", "region_type", "state", "metric_name", "date", "value"]]
#print("\n============ FINAL FORMAT ==========")
#print(columbia_final.head())

#print(columbia_final.shape)


#导入fred数据
fred_columbia = pd.read_csv("../data/raw/fred_columbia_hpi.csv")

print("============= FRED COLUMBIA HEAD ============")
print(fred_columbia.head())

print("\n=============== FRED COLUMBIA COLUMNS ===============")
print(fred_columbia.columns)

#rename
fred_columbia = fred_columbia.rename(columns = {
    "observation_date" : "date",
    "ATNHPIUS17860Q" : "value"
})

print(fred_columbia.columns)

#转换日期
fred_columbia["date"] = pd.to_datetime(fred_columbia["date"])
#去空值
fred_columbia = fred_columbia.dropna(subset=["value"])

#统一schema
fred_columbia["source"] = "fred"
fred_columbia["region_name"] = "Columbia, MO"
fred_columbia["region_type"] = "metro"
fred_columbia["state"] = "MO"
fred_columbia["metric_name"] = "hpi"

fred_columbia_final = fred_columbia[
    ["source", "region_name", "region_type", "state", "metric_name", "date", "value"]
    ]

print("\n================== FRED FINAL ==============")
print(fred_columbia_final.head())

print("\n============= FRED SHAPE ==============")
print(fred_columbia_final.shape)

#合并数据
combined = pd.concat([columbia_final, fred_columbia_final], ignore_index=True)

print(combined.head())
print(combined.tail())
print(combined["metric_name"].unique())

#写数据到Postgresql数据库
combined.to_sql(
    "housing_metrics",
    engine,
    if_exists="replace", 
    index=False
)

print("\n=========== DATA WRITTEN TO DATABASE =========")
