from extract_transform import download_nyc_taxi_data, clean_data
from load import init_database, load_incremental_data

# First time setup (run once)
# init_database()  # Uncomment this line only on first run

# Regular ETL process
def run_etl():
    engine = init_database()
    new_data = download_nyc_taxi_data(year=2023, month=6)  # Example: June 2023 data
    cleaned_data = clean_data(new_data)
    load_incremental_data(cleaned_data, engine)

if __name__ == "__main__":  
    run_etl()