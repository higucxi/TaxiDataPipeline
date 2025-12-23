// src/layout/Dashboard.jsx
import React, { useState } from "react";
import TripCountChart from "../components/Charts/TripCountChart";
import PickupHotspotsBar from "../components/Charts/PickupHotspotsBar";
import PremiumTripsChart from "../components/Charts/PremiumTripsChart";
import GlobalFilters from "../components/Filters/GlobalFilters";
import Navbar from "./Navbar";
import "./Layout.css";

const Dashboard = () => {
  const [activeChart, setActiveChart] = useState("corporatePatterns");
  
  // Corporate Patterns filters
  const [patternsLimit, setPatternsLimit] = useState(10);
  
  // Premium Trips filters
  const [premiumLimit, setPremiumLimit] = useState(100);
  const [minFare, setMinFare] = useState(50);
  const [minDistance, setMinDistance] = useState(10);
  
  // Pickup Hotspots filters
  const [hotspotsLimit, setHotspotsLimit] = useState(10);
  const [hotspotsDays, setHotspotsDays] = useState(30);

  return (
    <div className="dashboard">
      <Navbar setActiveChart={setActiveChart} activeChart={activeChart} />
      
      <GlobalFilters
        patternsLimit={patternsLimit}
        setPatternsLimit={setPatternsLimit}
        premiumLimit={premiumLimit}
        minFare={minFare}
        minDistance={minDistance}
        setPremiumLimit={setPremiumLimit}
        setMinFare={setMinFare}
        setMinDistance={setMinDistance}
        hotspotsLimit={hotspotsLimit}
        hotspotsDays={hotspotsDays}
        setHotspotsLimit={setHotspotsLimit}
        setHotspotsDays={setHotspotsDays}
      />
      
      <div className="chart-container">
        {activeChart === "corporatePatterns" && (
          <TripCountChart limit={patternsLimit} />
        )}
        {activeChart === "topPickups" && (
          <PickupHotspotsBar limit={hotspotsLimit} days={hotspotsDays} />
        )}
        {activeChart === "premiumTrips" && (
          <PremiumTripsChart 
            limit={premiumLimit} 
            minFare={minFare} 
            minDistance={minDistance} 
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;