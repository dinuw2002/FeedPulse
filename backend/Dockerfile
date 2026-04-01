# Use Node.js LTS
FROM node:20-alpine

WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the backend source
COPY . .

# Build TypeScript
RUN npm run build

EXPOSE 4000

# Start the application
CMD ["npm", "start"]