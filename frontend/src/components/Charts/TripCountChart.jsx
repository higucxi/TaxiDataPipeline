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
name: `${d.pickup_location_id} → ${d.dropoff_location_id}`,
y: d.trip_count,
custom: d,
}));
}, [data]);


const options = useMemo(() => ({
chart: { type: "column" },
title: { text: "Top Corporate Trip Patterns" },
xAxis: { type: "category" },
yAxis: { title: { text: "Trips" } },
legend: { enabled: false },
tooltip: {
pointFormat: `<b>{point.y}</b> trips<br/>Avg Fare: $ {point.custom.avg_fare?.toFixed?.(2) ?? "-"}`,
},
series: [{ name: "Trips", colorByPoint: true, data: seriesData }],
credits: { enabled: false },
accessibility: { enabled: false },
}), [seriesData]);


if (loading) return <div className="card">Loading corporate patterns…</div>;
if (error) return <div className="card error">Error: {String(error)}</div>;
if (!data?.length) return <div className="card">No data.</div>;


return (
<div className="card">
<HighchartsReact highcharts={Highcharts} options={options} />
</div>
);
}