#!/bin/bash

# Build and deploy script for Social MCP Server

# Set your Docker Hub username
DOCKER_USERNAME="johndoeklein"
IMAGE_NAME="social-mcp-server"
TAG="latest"

echo "Building Docker image..."
docker build -t $DOCKER_USERNAME/$IMAGE_NAME:$TAG .

echo "Tagging image..."
docker tag $DOCKER_USERNAME/$IMAGE_NAME:$TAG $DOCKER_USERNAME/$IMAGE_NAME:$TAG

echo "Pushing to Docker Hub..."
docker push $DOCKER_USERNAME/$IMAGE_NAME:$TAG

echo "Deployment complete!"
echo "Your MCP server is now available at: $DOCKER_USERNAME/$IMAGE_NAME:$TAG"