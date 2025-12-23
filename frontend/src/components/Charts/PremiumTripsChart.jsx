import React, { useMemo } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import useFetch from "../../utils/useFetch";
import { getPremiumTrips } from "../../api/taxiApi";

export default function PremiumTripsChart({ limit, minFare, minDistance }) {
  const { data, loading, error } = useFetch(
    () => getPremiumTrips({ limit, min_fare: minFare, min_distance: minDistance }),
    [limit, minFare, minDistance]
  );

  const scatter = useMemo(() => {
    if (!data) return [];
    return data.map((d) => ({
      x: d.trip_distance,
      y: d.fare_amount,
      name: `Trip ${d.trip_id}`,
      custom: d,
    }));
  }, [data]);

  const options = useMemo(() => ({
    chart: { type: "scatter", zoomType: "xy" },
    title: { text: "Premium Trips — Fare vs Distance" },
    subtitle: { text: "Click and drag to zoom. Hover for trip details." },
    xAxis: { 
      title: { text: "Distance (miles)" },
      gridLineWidth: 1
    },
    yAxis: { 
      title: { text: "Fare Amount ($)" }
    },
    legend: { enabled: false },
    tooltip: {
      useHTML: true,
      headerFormat: "",
      pointFormat: `
        <div style="padding: 5px;">
          <strong>Trip #{point.custom.trip_id}</strong><br/>
          <strong>Route:</strong> {point.custom.pickup_zone} → {point.custom.dropoff_zone}<br/>
          <strong>Distance:</strong> {point.x} miles<br/>
          <strong>Fare:</strong> ${point.y}<br/>
          <strong>Passengers:</strong> {point.custom.passenger_count}
        </div>
      `,
      style: { fontSize: '12px' }
    },
    plotOptions: {
      scatter: {
        marker: {
          radius: 5,
          states: {
            hover: {
              enabled: true,
              lineColor: 'rgb(100,100,100)'
            }
          }
        },
        states: {
          hover: {
            marker: {
              enabled: false
            }
          }
        }
      }
    },
    series: [{ 
      name: "Premium Trips", 
      data: scatter, 
      marker: { 
        radius: 4,
        symbol: 'circle'
      },
      color: '#764ba2'
    }],
    credits: { enabled: false },
    accessibility: { enabled: false },
  }), [scatter]);

  if (loading) return <div className="card">Loading premium trips…</div>;
  if (error) return <div className="card error">Error: {String(error)}</div>;
  if (!data?.length) return (
    <div className="card">
      <p>No premium trips found matching criteria:</p>
      <ul style={{ textAlign: 'left', marginTop: '10px' }}>
        <li>Minimum Fare: ${minFare}</li>
        <li>Minimum Distance: {minDistance} miles</li>
      </ul>
    </div>
  );

  return (
    <div className="card">
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  );
}