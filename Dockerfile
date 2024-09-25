# Use a specific version of Node.js for consistency
FROM node:20.3.0

# Set the working directory
WORKDIR /app-express

# Copy package.json and package-lock.json separately to leverage Docker cache
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Generate the Prisma client
RUN npx prisma generate

# Expose the application port
EXPOSE 3001

# Set default environment variable
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"]
