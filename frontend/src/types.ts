
export interface Stop {
  name: string;
  type: string;
  location: [number, number];
  website?: string;
}

export interface RouteData {
  route_name: string;
  distance: string;
  elevation_gain: string;
  estimated_time: string;
  overview_polyline: string;
  stops: Stop[];
}
