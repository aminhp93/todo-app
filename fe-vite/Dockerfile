# Use lightweight Node.js 18 on Alpine Linux as base image
FROM node:18-alpine

# Create a non-root group and user 'app' for security best practices
RUN addgroup app && adduser -S -G app app

# Switch execution context to non-root 'app' user
USER app

# Set the working directory inside the container to /app
WORKDIR /app

# Copy dependency configuration files first to leverage Docker layer caching
COPY package*.json ./

# Switch back to root user temporarily to adjust permissions
USER root

# Change ownership of the workspace directory and files to 'app' user
RUN chown -R app:app .

# Switch back to non-root 'app' user
USER app

# Install node dependencies defined in package.json
RUN npm install

# Copy all application source code into container
COPY --chown=app:app . .

# Inform Docker that the container listens on port 5173 (Vite dev server)
EXPOSE 5173

# Start Vite development server when container launches
CMD ["npm", "run", "dev"]
