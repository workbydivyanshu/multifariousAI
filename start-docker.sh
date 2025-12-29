#!/usr/bin/env bash

echo Starting MultifariousAI with Docker Compose...

# Check if .env file exists
if [ -f .env ]; then
    echo Using local .env file
else
    echo Creating .env from .env.example...
    cp .env.example .env
    echo Please edit .env file with your API keys if needed
    echo
fi

# Stop any existing containers
docker-compose down -v 2>/dev/null

# Build and start services
echo Building Docker image...
docker-compose up --build

echo.
echo MultifariousAI is starting...
echo Open in your browser: http://localhost:3000
echo Press Ctrl+C to stop
docker-compose logs -f