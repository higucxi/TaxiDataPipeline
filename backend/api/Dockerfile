FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Don't copy the entire backend, just the API code
COPY main.py .

COPY taxi_zone_lookup.csv taxi_zone_lookup.csv

COPY .env .env

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]