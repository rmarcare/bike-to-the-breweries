FROM python:3.10-slim

WORKDIR /app

# Install node and npm
RUN apt-get update && apt-get install -y nodejs npm

# Install backend dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ .

# Install frontend dependencies and build
COPY frontend/ ./
RUN npm install
RUN npm run build

# Copy the built frontend to the static directory
RUN mkdir -p static
RUN cp -r /app/build/* /app/static/

# Expose the port the app runs on
EXPOSE 8080

# Command to run the application
CMD uvicorn main:app --host 0.0.0.0 --port $PORT
