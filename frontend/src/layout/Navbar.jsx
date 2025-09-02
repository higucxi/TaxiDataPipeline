// src/layout/Navbar.jsx
import React from "react";
import "./Layout.css";

const Navbar = ({ setActiveChart, activeChart }) => {
  return (
    <nav className="navbar">
      <h2>NYC Taxi Dashboard</h2>
      <ul className="nav-links">
        <li
          className={activeChart === "corporatePatterns" ? "active" : ""}
          onClick={() => setActiveChart("corporatePatterns")}
        >
          Corporate Patterns
        </li>
        <li
          className={activeChart === "topPickups" ? "active" : ""}
          onClick={() => setActiveChart("topPickups")}
        >
          Top Pickups
        </li>
        <li
          className={activeChart === "premiumTrips" ? "active" : ""}
          onClick={() => setActiveChart("premiumTrips")}
        >
          Premium Trips
        </li>
        <li
          className={activeChart === "tripsByPassenger" ? "active" : ""}
          onClick={() => setActiveChart("tripsByPassenger")}
        >
          Trips by Passenger Count
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
