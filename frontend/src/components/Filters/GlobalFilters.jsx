import React from "react";


export default function GlobalFilters({
patternsLimit, setPatternsLimit,
premiumLimit, minFare, minDistance, setPremiumLimit, setMinFare, setMinDistance,
hotspotsLimit, hotspotsDays, setHotspotsLimit, setHotspotsDays,
}) {
return (
<div className="filters">
<div className="filter-group">
<h3>Corporate Patterns</h3>
<label>Limit
<input type="number" min={1} value={patternsLimit}
onChange={(e) => setPatternsLimit(Number(e.target.value) || 1)} />
</label>
</div>


<div className="filter-group">
<h3>Premium Trips</h3>
<label>Limit
<input type="number" min={1} value={premiumLimit}
onChange={(e) => setPremiumLimit(Number(e.target.value) || 1)} />
</label>
<label>Min Fare ($)
<input type="number" min={0} step={1} value={minFare}
onChange={(e) => setMinFare(Number(e.target.value) || 0)} />
</label>
<label>Min Distance (mi)
<input type="number" min={0} step={0.1} value={minDistance}
onChange={(e) => setMinDistance(Number(e.target.value) || 0)} />
</label>
</div>


<div className="filter-group">
<h3>Pickup Hotspots</h3>
<label>Limit
<input type="number" min={1} value={hotspotsLimit}
onChange={(e) => setHotspotsLimit(Number(e.target.value) || 1)} />
</label>
<label>Days
<input type="number" min={1} value={hotspotsDays}
onChange={(e) => setHotspotsDays(Number(e.target.value) || 1)} />
</label>
</div>
</div>
);
}