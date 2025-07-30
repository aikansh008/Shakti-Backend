FROM node:18

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (builds bcrypt for Linux)
RUN npm ci --only=production && npm cache clean --force

# Copy application code (excluding node_modules via .dockerignore)
COPY . .
COPY .env ./
# Create non-root user
RUN groupadd --gid 1001 --system nodejs && \
    useradd --uid 1001 --system --gid nodejs --shell /bin/bash --create-home nextjs

# Change ownership
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 5000

# Start application
CMD ["node", "server.js"] 

