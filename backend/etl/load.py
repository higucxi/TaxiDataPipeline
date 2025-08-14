import os
from sqlalchemy import create_engine, inspect
from dotenv import load_dotenv

# Load environment variables from .env in project root
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ENV_PATH = os.path.join(BASE_DIR, "../../.env")

load_dotenv(ENV_PATH)

def init_database():
    """One-time database setup (run this only once)"""
    DATABASE_URL = os.getenv("DATABASE_URL")
    engine = create_engine(DATABASE_URL)
    
    # Only create table if it doesn't exist
    if not inspect(engine).has_table('taxi_trips'):
        from sqlalchemy import MetaData, Table, Column, Integer, Float, DateTime, Sequence
        metadata = MetaData()
        
        Table('taxi_trips', metadata,
            Column('trip_id',  Integer, primary_key=True, autoincrement=True),
            Column('pickup_time', DateTime),
            Column('dropoff_time', DateTime),
            Column('passenger_count', Integer),
            Column('trip_distance', Float),
            Column('fare_amount', Float),
            Column('pickup_location_id', Integer),
            Column('dropoff_location_id', Integer)
        )
        metadata.create_all(engine)
    return engine

def load_incremental_data(df, engine):
    """Regular loading of new data"""
    df.to_sql('taxi_trips', engine, if_exists='append', index=False)  # Note: append instead of replace
