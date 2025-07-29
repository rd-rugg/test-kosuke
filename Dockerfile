FROM node:20-alpine

# Set up template directory first
WORKDIR /template

# Environment variables for template configuration
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1
ENV TEMPLATE_VERSION=1.0.0

# Copy template files to /template (not /app to avoid volume mount conflicts)
COPY package*.json ./
COPY . .

# Pre-install dependencies for faster container startup
RUN npm ci --production=false && npm cache clean --force

# Copy and set up entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Set working directory for the actual project
WORKDIR /app

# Expose port for Next.js
EXPOSE 3000

# Use entrypoint for template initialization
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["npm", "run", "dev", "--", "-H", "0.0.0.0"] 