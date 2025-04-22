#!/bin/bash

# Set AWS_DUMMY environment variable to true
export AWS_DUMMY=true

# Start the application with the dummy mode enabled
echo "Starting application in dummy mode (AWS_DUMMY=true)"
echo "All AWS SDK operations will be mocked and delays will be shortened"
echo "------------------------------------------------------------"

# Run the development server
npm run dev