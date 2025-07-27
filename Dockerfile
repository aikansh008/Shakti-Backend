# Use official Node.js LTS image
FROM node:18

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy all app source files
COPY . .

# Copy .env file
COPY .env .env

# Expose port (same as in .env or your app config)
EXPOSE 5000

# Start the application
CMD ["node", "server.js"]
