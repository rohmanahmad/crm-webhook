#!/bin/bash
# Build Docker image with version from package.json

set -e

VERSION=$(node -p "require('./package.json').version")
IMAGE_NAME="webhook-crm3:$VERSION"

echo "Building Docker image: $IMAGE_NAME"
docker build -t $IMAGE_NAME .
echo "Docker image $IMAGE_NAME built successfully."
