The Ideal Prompt

  "I want to build and deploy a full-stack web application called 'Bike to the Breweries'.

  Core Functionality:
  The user visits the site and sees a map and a text input. They enter a starting location (e.g., "Fort Collins,
  Colorado"). The application then:
   1. Uses the Google Maps API to geocode the starting location.
   2. Finds up to 5 nearby breweries and wineries using the Google Places API.
   3. Calculates an optimized, bike-friendly route connecting the starting point and the found locations using the
      Google Directions API.
   4. Displays the resulting route polyline on the map, lists the stops with their names and websites, and shows the
      total distance and estimated biking time.

  Technology Stack:
   * Frontend: A React single-page application built with TypeScript and Create React App. Use the react-leaflet
     library to display the map.
   * Backend: A Python API built with FastAPI.

  Implementation & Deployment Architecture:

   1. Single Container Deployment: The entire application must be containerized in a single Docker image for deployment
      to Google Cloud Run.
   2. Multi-Stage Dockerfile: Create an optimized, multi-stage Dockerfile.
       * Build Stage: Use a node:18-alpine image to build the React frontend. Ensure the package.json includes
         "homepage": "." to create a portable build with relative asset paths.
       * Final Stage: Use a python:3.10-slim image. Copy the Python backend code and its requirements.txt. Then, copy
         the entire contents of the React build directory from the build stage directly into the /app directory of the
         final image.
   3. FastAPI Serves Frontend: The FastAPI application must serve the built React app.
       * Mount the /static directory using StaticFiles(directory="static").
       * Create a catch-all route (@app.get("/{full_path:path}")) that returns the FileResponse("index.html") for
         client-side routing.
   4. Continuous Deployment:
       * Set up the project as a Git repository on GitHub.
       * Create a cloudbuild.yaml file that defines a Cloud Build trigger. The trigger should:
           * Build the Docker image using the Dockerfile.
           * Push the image to Google Artifact Registry.
           * Deploy the image to a public-facing (allow unauthenticated) Cloud Run service.
   5. Secrets Management:
       * The GOOGLE_MAPS_API_KEY is a secret. The Python code should be written to first check for the key in a file at
         /etc/secrets/GOOGLE_MAPS_API_KEY (for Cloud Run) and fall back to reading it from a .env file for local
         development.

  Please build this application, including all frontend components, backend API endpoints, the Dockerfile, and the
  cloudbuild.yaml file, ready for the initial git push to trigger the deployment."

  ---

  Why this prompt is more efficient:

   * Specificity: It dictates the exact technologies, libraries, and architecture, leaving no room for ambiguity.
   * Anticipates Problems: It explicitly includes the solutions to every problem we encountered: the "homepage": "."
     setting, the multi-stage build, the correct file copying logic in the Dockerfile, and the secret management
     strategy.
   * End-to-End: It defines the project from local development (.env file) all the way to a production deployment
     pipeline (cloudbuild.yaml), making it a true end-to-end request.
  ---

  By providing this level of detail, you would have enabled me to build the final application in just a few steps, bypassing all the incremental debugging and refinement we went through. It was a great project to build
  with you
