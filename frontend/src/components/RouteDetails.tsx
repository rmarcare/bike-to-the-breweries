import React from 'react';
import './RouteDetails.css';

import { RouteData } from '../types';

interface RouteDetailsProps {
  routeData: RouteData | null;
}

const RouteDetails: React.FC<RouteDetailsProps> = ({ routeData }) => {
  if (!routeData) {
    return (
      <div className="route-details-container placeholder">
        <p>Your planned ride and brewery stops will appear here.</p>
      </div>
    );
  }

  return (
    <div className="route-details-container">
      <h3>{routeData.route_name}</h3>
      <div className="route-stats">
        <span><strong>Distance:</strong> {routeData.distance}</span>
        <span><strong>Elevation:</strong> {routeData.elevation_gain}</span>
        <span><strong>Time:</strong> {routeData.estimated_time}</span>
      </div>
      <div className="stops-list">
        <h4>Suggested Stops</h4>
        <ul>
          {routeData.stops.map((stop, idx) => (
            <li key={idx}>
              <a href={stop.website} target="_blank" rel="noopener noreferrer">
                {stop.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RouteDetails;