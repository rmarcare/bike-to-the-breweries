# Stage 1: Build the React frontend
FROM node:18 AS build

WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm install

COPY frontend/ ./ 
ENV PUBLIC_URL=.
RUN npm run build

# Stage 2: Build the Python backend
FROM python:3.10-slim

WORKDIR /app

# Install backend dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ .

# Copy the built frontend from the build stage
COPY --from=build /app/frontend/build ./static

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application
CMD uvicorn main:app --host 0.0.0.0 --port $PORT
