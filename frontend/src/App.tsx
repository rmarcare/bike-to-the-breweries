import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import Jules from './components/Jules';
import Map from './components/Map';
import RouteDetails from './components/RouteDetails';


import { RouteData } from './types';

function App() {
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendMessage = async (prompt: string) => {
    setLoading(true);
    setError(null);
    try {
      // The backend is expected to be running on port 8000
      const response = await axios.post('/api/plan-ride', { prompt });
      if (response.data.error) {
        setError(response.data.error);
        setRouteData(null);
      } else {
        setRouteData(response.data);
      }
    } catch (err) {
      setError('Failed to fetch the route plan. Is the backend server running?');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>Bike to the Breweries</h1>
      </header>
      <div className="main-content">
        <aside className="sidebar">
          <Jules onSendMessage={handleSendMessage} loading={loading} />
          {error && <p className="error-message">{error}</p>}
          <RouteDetails routeData={routeData} />
        </aside>
        <main className="map-container">
          <Map 
            overview_polyline={routeData?.overview_polyline || ''} 
            stops={routeData?.stops || []} 
          />
        </main>
      </div>
    </div>
  );
}

export default App;