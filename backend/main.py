from fastapi import FastAPI
from pydantic import BaseModel
import json
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import random
import os
import re
from dotenv import load_dotenv
import googlemaps

# Load environment variables from .env file
load_dotenv()

# --- API Clients and Configuration ---
def get_google_maps_api_key():
    # Check for the secret file first (for Cloud Run)
    secret_path = "/etc/secrets/GOOGLE_MAPS_API_KEY"
    if os.path.exists(secret_path):
        with open(secret_path, "r") as f:
            return f.read().strip()
    # Fallback to environment variable (for local development)
    return os.getenv("GOOGLE_MAPS_API_KEY")

API_KEY = get_google_maps_api_key()
gmaps = googlemaps.Client(key=API_KEY) if API_KEY else None

app = FastAPI()

# --- Middleware ---

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://bike-to-the-breweries-ulqnobp4ja-uc.a.run.app"], 
    allow_credentials=True,
    allow_methods=["POST"],
    allow_headers=["Content-Type"],
)

# --- Pydantic Models ---
class RideRequest(BaseModel):
    prompt: str

# --- API Endpoints ---

@app.post("/api/plan-ride")
def plan_ride(request: RideRequest):
    if not gmaps:
        return {"error": "Google Maps API key is not configured on the server."}

    try:
        # 1. Geocode the location from the prompt
        geocode_result = gmaps.geocode(request.prompt)
        if not geocode_result:
            return {"error": "Could not determine a location from your request."}
        
        start_location = geocode_result[0]['geometry']['location']
        city_name = geocode_result[0]['address_components'][0]['long_name']
        origin = (start_location['lat'], start_location['lng'])

        # 2. Find nearby breweries and wineries
        try:
            breweries = gmaps.places_nearby(location=origin, radius=15000, keyword='brewery', type='brewery').get('results', [])
            wineries = gmaps.places_nearby(location=origin, radius=15000, keyword='winery', type='winery').get('results', [])
        except googlemaps.exceptions.ApiError as e:
            if e.status == 'REQUEST_DENIED':
                return {"error": "The Google Places API request was denied. Please ensure the 'Places API' is enabled in your Google Cloud Console and that your API key is correct."}
            return {"error": f"An unexpected error occurred with the Places API: {e}"}

        all_places = breweries + wineries

        if not all_places:
            return {"error": f"Could not find any breweries or wineries near {city_name}. Try a larger city?"}

        # 3. Create a list of waypoints for the tour
        tour_stops = all_places[:5]
        if len(tour_stops) < 2:
            return {"error": f"Not enough breweries/wineries found near {city_name} to create a tour."}

        destination = (tour_stops[-1]['geometry']['location']['lat'], tour_stops[-1]['geometry']['location']['lng'])
        waypoints = [(stop['geometry']['location']['lat'], stop['geometry']['location']['lng']) for stop in tour_stops[:-1]]

        # 4. Get real bike-friendly directions with waypoints
        directions_result = gmaps.directions(
            origin=origin,
            destination=destination,
            mode="bicycling",
            waypoints=waypoints,
            optimize_waypoints=True
        )

        if not directions_result:
            return {"error": "Could not find a bike-friendly route to the selected destinations."}

        # 5. Reorder stops based on optimized waypoint order and format them
        ordered_stops = []
        waypoint_order = directions_result[0].get('waypoint_order', [])
        
        ordered_tour_places = [tour_stops[i] for i in waypoint_order] + [tour_stops[-1]]

        for place in ordered_tour_places:
            place_id = place.get('place_id')
            website = '#'
            if place_id:
                place_details = gmaps.place(place_id=place_id, fields=['website'])
                website = place_details.get('result', {}).get('website', '#')

            ordered_stops.append({
                "name": place.get('name'),
                "type": place.get('types', ['establishment'])[0],
                "location": [place['geometry']['location']['lat'], place['geometry']['location']['lng']],
                "website": website
            })
        
        # 6. Calculate total distance and time from all legs of the journey
        total_distance_meters = sum(leg['distance']['value'] for leg in directions_result[0]['legs'])
        total_duration_seconds = sum(leg['duration']['value'] for leg in directions_result[0]['legs'])
        distance_miles = total_distance_meters * 0.000621371
        duration_minutes = total_duration_seconds / 60

        response = {
            "route_name": f"Brewery & Winery Tour in {city_name}",
            "distance": f"{distance_miles:.1f} miles",
            "elevation_gain": "N/A",
            "estimated_time": f"{duration_minutes:.0f} minutes",
            "overview_polyline": directions_result[0]['overview_polyline']['points'],
            "stops": ordered_stops
        }
        return response

    except Exception as e:
        return {"error": f"An unexpected error occurred: {e}"}

# --- Static Files and Catch-all Route ---

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/logo192.png")
async def read_logo192():
    return FileResponse("logo192.png")

@app.get("/logo512.png")
async def read_logo512():
    return FileResponse("logo512.png")

@app.get("/manifest.json")
async def read_manifest():
    return FileResponse("manifest.json")

@app.get("/{full_path:path}")
async def catch_all(full_path: str):
    return FileResponse("index.html")