import React, { useMemo } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import useFetch from "../../utils/useFetch";
import { getTopPickups } from "../../api/taxiApi";

export default function PickupHotspotsBar({ limit, days }) {
  const { data, loading, error } = useFetch(() => getTopPickups({ limit, days }), [limit, days]);

  // Use zone names instead of location IDs
  const categories = useMemo(() => (
    data ? data.map((d) => d.pickup_zone || `Location ${d.pickup_location_id}`) : []
  ), [data]);
  
  const counts = useMemo(() => (
    data ? data.map((d) => d.trip_count) : []
  ), [data]);

  const options = useMemo(() => ({
    chart: { type: "bar", height: Math.max(400, categories.length * 40) },
    title: { text: `Top Pickup Hotspots (Last ${days} Days)` },
    xAxis: { 
      categories, 
      title: { text: "Pickup Location" },
      labels: {
        style: { fontSize: '11px' }
      }
    },
    yAxis: { 
      min: 0, 
      title: { text: "Number of Trips" }
    },
    legend: { enabled: false },
    tooltip: { 
      pointFormat: "<b>{point.y}</b> trips from this location",
      style: { fontSize: '12px' }
    },
    plotOptions: {
      bar: {
        dataLabels: {
          enabled: true,
          format: '{point.y}'
        },
        colorByPoint: true
      }
    },
    series: [{ name: "Trips", data: counts }],
    credits: { enabled: false },
    accessibility: { enabled: false },
  }), [categories, counts, days]);

  if (loading) return <div className="card">Loading hotspots…</div>;
  if (error) return <div className="card error">Error: {String(error)}</div>;
  if (!data?.length) return <div className="card">No data available for the selected time period.</div>;

  return (
    <div className="card">
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  );
}