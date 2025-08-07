FROM node:18-slim

# Set environment to production
ENV NODE_ENV=production

# Set working directory
WORKDIR /app

# Copy only package files for install step
COPY package*.json ./

# Install production dependencies
RUN npm ci --omit=dev && npm cache clean --force

# Copy the rest of the application code
COPY . .

# Use built-in non-root user (lighter & secure)
USER node

# Expose port
EXPOSE 5000

# Start the application
CMD ["node", "server.js"]
