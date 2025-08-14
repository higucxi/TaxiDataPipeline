import pandas as pd

def download_nyc_taxi_data(year: int = 2023, month: int = 1) -> pd.DataFrame:
    """Downloads NYC Taxi trip data from TLC website."""
    url = f"https://d37ci6vzurychx.cloudfront.net/trip-data/yellow_tripdata_{year}-{month:02d}.parquet"
    return pd.read_parquet(url)

def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    """Cleans raw taxi data and selects key columns."""
    return df[[
        'tpep_pickup_datetime', 
        'tpep_dropoff_datetime',
        'passenger_count',
        'trip_distance',
        'fare_amount',
        'PULocationID',  # Pickup location ID
        'DOLocationID'   # Dropoff location ID
    ]].rename(columns={
        'tpep_pickup_datetime': 'pickup_time',
        'tpep_dropoff_datetime': 'dropoff_time',
        'PULocationID': 'pickup_location_id',
        'DOLocationID': 'dropoff_location_id'
    })

# Example usage:
if __name__ == "__main__":
    raw_data = download_nyc_taxi_data()
    cleaned_data = clean_data(raw_data)
    print(cleaned_data.head())