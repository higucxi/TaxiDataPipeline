import React, { useMemo } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import useFetch from "../../utils/useFetch";
import { getCorporatePatterns } from "../../api/taxiApi";

export default function TripCountChart({ limit }) {
  const { data, loading, error } = useFetch(() => getCorporatePatterns({ limit }), [limit]);

  const seriesData = useMemo(() => {
    if (!data) return [];
    return data.map((d) => ({
      // Use zone names for better readability
      name: `${d.pickup_zone} → ${d.dropoff_zone}`,
      y: d.trip_count,
      custom: d,
    }));
  }, [data]);

  const options = useMemo(() => ({
    chart: { 
      type: "column",
      height: Math.max(450, seriesData.length * 35)
    },
    title: { text: "Top Corporate Trip Patterns" },
    subtitle: { 
      text: "Routes with more than 10 trips — potential corporate accounts" 
    },
    xAxis: { 
      type: "category",
      labels: {
        rotation: -45,
        style: { fontSize: '10px' }
      }
    },
    yAxis: { 
      title: { text: "Number of Trips" }
    },
    legend: { enabled: false },
    tooltip: {
      useHTML: true,
      headerFormat: "",
      pointFormat: `
        <div style="padding: 5px;">
          <strong>Route:</strong> {point.custom.pickup_zone} → {point.custom.dropoff_zone}<br/>
          <strong>Total Trips:</strong> <b>{point.y}</b><br/>
          <strong>Average Fare:</strong> ${point.custom.avg_fare}
        </div>
      `,
      style: { fontSize: '12px' }
    },
    plotOptions: {
      column: {
        colorByPoint: true,
        dataLabels: {
          enabled: true,
          format: '{point.y}',
          style: { fontSize: '11px', fontWeight: 'bold' }
        }
      }
    },
    series: [{ 
      name: "Trips", 
      data: seriesData 
    }],
    credits: { enabled: false },
    accessibility: { enabled: false },
  }), [seriesData]);

  if (loading) return <div className="card">Loading corporate patterns…</div>;
  if (error) return <div className="card error">Error: {String(error)}</div>;
  if (!data?.length) return (
    <div className="card">
      No corporate patterns found. This might mean there are no routes with more than 10 trips in your dataset.
    </div>
  );

  return (
    <div className="card">
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  );
}