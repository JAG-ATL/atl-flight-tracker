# Use Node.js 20 as base
FROM node:20-slim

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm install --omit=dev

# Copy the rest of the app (including server.js, data/, and dist/)
COPY . .

# Ensure the app runs on the port specified by the environment
ENV PORT=8080
EXPOSE 8080

# Start the server
CMD [ "npm", "start" ]
