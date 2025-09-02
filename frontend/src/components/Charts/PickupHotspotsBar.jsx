import React, { useMemo } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import useFetch from "../../utils/useFetch";
import { getTopPickups } from "../../api/taxiApi";


export default function PickupHotspotsBar({ limit, days }) {
const { data, loading, error } = useFetch(() => getTopPickups({ limit, days }), [limit, days]);


const categories = useMemo(() => (data ? data.map((d) => `${d.pickup_location_id}`) : []), [data]);
const counts = useMemo(() => (data ? data.map((d) => d.trip_count) : []), [data]);


const options = useMemo(() => ({
chart: { type: "bar" },
title: { text: `Top Pickup Hotspots (last ${days} days)` },
xAxis: { categories, title: { text: "Pickup Location ID" } },
yAxis: { min: 0, title: { text: "Trip Count" } },
legend: { enabled: false },
tooltip: { pointFormat: "<b>{point.y}</b> trips" },
series: [{ name: "Trips", data: counts }],
credits: { enabled: false },
accessibility: { enabled: false },
}), [categories, counts, days]);


if (loading) return <div className="card">Loading hotspots…</div>;
if (error) return <div className="card error">Error: {String(error)}</div>;
if (!data?.length) return <div className="card">No data.</div>;


return (
<div className="card">
<HighchartsReact highcharts={Highcharts} options={options} />
</div>
);
}