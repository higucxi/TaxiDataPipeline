import os
import csv
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import Integer, Float, DateTime, select, text, desc, func
from sqlalchemy.orm import declarative_base, Mapped, mapped_column
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from dotenv import load_dotenv

# ------------------------
# Database Config
# ------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ENV_PATH = os.path.join(BASE_DIR, ".env")

load_dotenv(ENV_PATH)

DB_USER = os.getenv("DB_USER")
DB_PASS = os.getenv("DB_PASS")
DB_HOST = os.getenv("INSIDE_DOCKER_HOST")
DB_PORT = os.getenv("INSIDE_DOCKER_PORT")
DB_NAME = os.getenv("DB_NAME")

DATABASE_URL = f"postgresql+asyncpg://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
print(DATABASE_URL)

# ------------------------
# SQLAlchemy Setup
# ------------------------
engine = create_async_engine(DATABASE_URL, echo=True, future=True)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)
Base = declarative_base()

# ------------------------
# ORM Model
# ------------------------
class TaxiTrip(Base):
    __tablename__ = "taxi_trips"

    trip_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    pickup_time: Mapped[DateTime] = mapped_column(DateTime)
    dropoff_time: Mapped[DateTime] = mapped_column(DateTime)
    passenger_count: Mapped[int] = mapped_column(Integer)
    trip_distance: Mapped[float] = mapped_column(Float)
    fare_amount: Mapped[float] = mapped_column(Float)
    pickup_location_id: Mapped[int] = mapped_column(Integer)
    dropoff_location_id: Mapped[int] = mapped_column(Integer)

# ------------------------
# Dependency
# ------------------------
async def get_session() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session

# ------------------------
# Helper Functions
# ------------------------
zone_lookup = {}

def load_zone_lookup():
    """Load TLC taxi zone CSV into memory as a dictionary"""
    global zone_lookup
    file_path = os.path.join(BASE_DIR, "taxi_zone_lookup.csv")

    with open(file_path, mode="r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        zone_lookup = {int(row["LocationID"]): row for row in reader}
    
    print(f"✅ Loaded {len(zone_lookup)} taxi zones")

def get_zone_name(location_id: int) -> str:
    """Helper to get zone name from location ID"""
    zone_data = zone_lookup.get(location_id, {})
    zone = zone_data.get("Zone", "Unknown")
    borough = zone_data.get("Borough", "")
    
    # Return formatted string with borough for clarity
    if zone != "Unknown" and borough and borough != "Unknown":
        return f"{zone} ({borough})"
    return zone

load_zone_lookup()

# ------------------------
# FastAPI App Setup
# ------------------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_headers=["*"]
)

@app.get("/corporate/patterns")
async def corporate_trip_patterns(limit: int = 10, session: AsyncSession = Depends(get_session)):
    """Identify repeat customers (potential corporate accounts)"""
    result = await session.execute(
        select(
            TaxiTrip.pickup_location_id,
            TaxiTrip.dropoff_location_id,
            func.count().label("trip_count"),
            func.avg(TaxiTrip.fare_amount).label("avg_fare")
        ).group_by(
            TaxiTrip.pickup_location_id,
            TaxiTrip.dropoff_location_id
        ).having(func.count() > 10).order_by(desc("trip_count")).limit(limit)
    )
    trips = result.all()
    return [
        {
            "pickup_location_id": t.pickup_location_id,
            "pickup_zone": get_zone_name(t.pickup_location_id),
            "dropoff_location_id": t.dropoff_location_id,
            "dropoff_zone": get_zone_name(t.dropoff_location_id),
            "trip_count": t.trip_count,
            "avg_fare": round(float(t.avg_fare), 2) if t.avg_fare else 0
        }
        for t in trips
    ]

@app.get("/hotspots/pickup")
async def top_pickup_locations(limit: int = 10, days: int = 30, session: AsyncSession = Depends(get_session)):
    """Identify popular business districts for ad targeting"""
    max_pickup_time_subq = select(func.max(TaxiTrip.pickup_time)).scalar_subquery()

    result = await session.execute(
        select(
            TaxiTrip.pickup_location_id,
            func.count().label("trip_count")
        ).where(
            TaxiTrip.pickup_time >= max_pickup_time_subq - text(f"INTERVAL '{days} days'")
        ).group_by(TaxiTrip.pickup_location_id).order_by(desc("trip_count")).limit(limit)
    )
    trips = result.all()
    return [
        {
            "pickup_location_id": t.pickup_location_id,
            "pickup_zone": get_zone_name(t.pickup_location_id),
            "trip_count": t.trip_count
        }
        for t in trips
    ]

@app.get("/trips/premium")
async def premium_trips(
    limit: int = 100, 
    min_fare: float = 50, 
    min_distance: float = 10, 
    session: AsyncSession = Depends(get_session)
):
    """Find luxury/long-distance trips for premium customer targeting"""
    result = await session.execute(
        select(TaxiTrip).where(
            TaxiTrip.fare_amount >= min_fare, 
            TaxiTrip.trip_distance >= min_distance
        ).order_by(desc(TaxiTrip.fare_amount)).limit(limit)
    )
    trips = result.scalars().all()
    return [
        {
            "trip_id": t.trip_id,
            "pickup_time": t.pickup_time.isoformat() if t.pickup_time else None,
            "dropoff_time": t.dropoff_time.isoformat() if t.dropoff_time else None,
            "passenger_count": t.passenger_count,
            "trip_distance": round(float(t.trip_distance), 2),
            "fare_amount": round(float(t.fare_amount), 2),
            "pickup_location_id": t.pickup_location_id,
            "pickup_zone": get_zone_name(t.pickup_location_id),
            "dropoff_location_id": t.dropoff_location_id,
            "dropoff_zone": get_zone_name(t.dropoff_location_id)
        }
        for t in trips
    ]

@app.get("/customers/{passenger_count}/trips")
async def trips_by_passenger_count(
    passenger_count: int, 
    session: AsyncSession = Depends(get_session), 
    limit: int = 1000
):
    """Get all trips with specific passenger count (identify group travelers)"""
    result = await session.execute(
        select(TaxiTrip).where(
            TaxiTrip.passenger_count == passenger_count
        ).limit(limit)
    )
    trips = result.scalars().all()
    return [
        {
            "trip_id": t.trip_id,
            "pickup_time": t.pickup_time.isoformat() if t.pickup_time else None,
            "dropoff_time": t.dropoff_time.isoformat() if t.dropoff_time else None,
            "passenger_count": t.passenger_count,
            "trip_distance": round(float(t.trip_distance), 2),
            "fare_amount": round(float(t.fare_amount), 2),
            "pickup_location_id": t.pickup_location_id,
            "pickup_zone": get_zone_name(t.pickup_location_id),
            "dropoff_location_id": t.dropoff_location_id,
            "dropoff_zone": get_zone_name(t.dropoff_location_id)
        }
        for t in trips
    ]

@app.get("/trips")
async def get_trips(limit: int = 1000, session: AsyncSession = Depends(get_session)):
    """Get general trip data"""
    result = await session.execute(select(TaxiTrip).limit(limit))
    trips = result.scalars().all()

    return [
        {
            "trip_id": t.trip_id,
            "pickup_time": t.pickup_time.isoformat() if t.pickup_time else None,
            "dropoff_time": t.dropoff_time.isoformat() if t.dropoff_time else None,
            "passenger_count": t.passenger_count,
            "trip_distance": round(float(t.trip_distance), 2),
            "fare_amount": round(float(t.fare_amount), 2),
            "pickup_location_id": t.pickup_location_id,
            "pickup_zone": get_zone_name(t.pickup_location_id),
            "dropoff_location_id": t.dropoff_location_id,
            "dropoff_zone": get_zone_name(t.dropoff_location_id)
        }
        for t in trips
    ]

@app.get("/test-db")
async def test_db(session: AsyncSession = Depends(get_session)):
    """Test database connection"""
    try:
        await session.execute(select(TaxiTrip).limit(1))
        return {"status": "Database connection successful"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "zones_loaded": len(zone_lookup)}

@app.get("/zones")
async def get_zones():
    """Get all available zones for reference"""
    return [
        {
            "location_id": location_id,
            "zone": data.get("Zone"),
            "borough": data.get("Borough"),
            "service_zone": data.get("service_zone")
        }
        for location_id, data in sorted(zone_lookup.items())
    ]