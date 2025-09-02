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
xAxis: { title: { text: "Distance (miles)" } },
yAxis: { title: { text: "Fare ($)" } },
legend: { enabled: false },
tooltip: {
headerFormat: "",
pointFormat: `Trip: {point.custom.trip_id}<br/>Distance: {point.x} mi<br/>Fare: $ {point.y}`,
},
series: [{ name: "Trips", data: scatter, marker: { radius: 4 } }],
credits: { enabled: false },
accessibility: { enabled: false },
}), [scatter]);


if (loading) return <div className="card">Loading premium trips…</div>;
if (error) return <div className="card error">Error: {String(error)}</div>;
if (!data?.length) return <div className="card">No data.</div>;


return (
<div className="card">
<HighchartsReact highcharts={Highcharts} options={options} />
</div>
);
}