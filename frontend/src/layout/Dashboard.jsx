// src/layout/Dashboard.jsx
import React, { useState, useEffect } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import {
  getCorporatePatterns,
  getTopPickups,
  getPremiumTrips,
  getTripsByPassengerCount,
} from "../api/taxiApi";
import Navbar from "./Navbar";
import "./Layout.css";

const Dashboard = () => {
  const [activeChart, setActiveChart] = useState("corporatePatterns");
  const [chartOptions, setChartOptions] = useState({});

  // Fetch and render the active chart
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (activeChart === "corporatePatterns") {
          const data = await getCorporatePatterns();
          setChartOptions({
            chart: { type: "column" },
            title: { text: "Corporate Patterns" },
            xAxis: { categories: data.map((d) => d.company) },
            yAxis: { title: { text: "Trips" } },
            series: [{ name: "Trips", data: data.map((d) => d.trips) }],
          });
        } else if (activeChart === "topPickups") {
          const data = await getTopPickups();
          setChartOptions({
            chart: { type: "bar" },
            title: { text: "Top Pickup Locations" },
            xAxis: { categories: data.map((d) => d.location) },
            yAxis: { title: { text: "Pickups" } },
            series: [{ name: "Pickups", data: data.map((d) => d.count) }],
          });
        } else if (activeChart === "premiumTrips") {
          const data = await getPremiumTrips();
          setChartOptions({
            chart: { type: "scatter", zoomType: "xy" },
            title: { text: "Premium Trips" },
            xAxis: { title: { text: "Distance (miles)" } },
            yAxis: { title: { text: "Fare ($)" } },
            series: [
              {
                name: "Trips",
                data: data.map((d) => [d.distance, d.fare]),
              },
            ],
          });
        } else if (activeChart === "tripsByPassenger") {
          const data = await getTripsByPassengerCount({ passenger_count: 2 });
          setChartOptions({
            chart: { type: "line" },
            title: { text: "Trips by Passenger Count" },
            xAxis: { categories: data.map((d) => d.trip_id) },
            yAxis: { title: { text: "Fare ($)" } },
            series: [{ name: "Fare", data: data.map((d) => d.fare_amount) }],
          });
        }
      } catch (error) {
        console.error("Error fetching chart data:", error);
      }
    };

    fetchData();
  }, [activeChart]);

  return (
    <div className="dashboard">
      <Navbar setActiveChart={setActiveChart} activeChart={activeChart} />
      <div className="chart-container">
        <HighchartsReact highcharts={Highcharts} options={chartOptions} />
      </div>
    </div>
  );
};

export default Dashboard;
