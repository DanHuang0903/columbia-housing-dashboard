import pandas as pd
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
DATA_DIR = BASE_DIR / "data" / "raw"

def load_and_transform(file_path, metric_name):
    df = pd.read_csv(file_path)

    # Zillow月份列
    date_cols = df.columns[5:]

    df_long = df.melt(
        id_vars=df.columns[:5],
        value_vars=date_cols,
        var_name="date",
        value_name=metric_name
    )

    df_long["date"] = pd.to_datetime(df_long["date"])
    return df_long


def filter_columbia(df):
    return df[df["RegionName"] == "Columbia, MO"]


def load_market_data():
    inventory_df = load_and_transform(
        DATA_DIR / "Metro_invt_fs_uc_sfrcondo_sm_month.csv",
        "inventory"
    )
    new_listings_df = load_and_transform(
        DATA_DIR / "Metro_new_listings_uc_sfrcondo_sm_month.csv",
        "new_listings"
    )
    sales_df = load_and_transform(
        DATA_DIR / "Metro_sales_count_now_uc_sfrcondo_month.csv",
        "sales_count"
    )

    inventory_df = filter_columbia(inventory_df)
    new_listings_df = filter_columbia(new_listings_df)
    sales_df = filter_columbia(sales_df)

    df = inventory_df.merge(
        new_listings_df,
        on=["RegionName", "date"],
        how="inner"
    ).merge(
        sales_df,
        on=["RegionName", "date"],
        how="inner"
    )

    df = df[["date", "inventory", "new_listings", "sales_count"]]
    df = df.dropna().sort_values("date")
    df["date"] = df["date"].dt.strftime("%Y-%m")

    return df.to_dict(orient="records")