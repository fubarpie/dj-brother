# Simple single-stage build that works reliably
FROM node:20-bullseye-slim

WORKDIR /app

# Install system dependencies needed for build and runtime
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    ffmpeg \
    curl \
    openssl \
    && rm -rf /var/lib/apt/lists/*

# Install yt-dlp
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp

# Copy package files first for better caching
COPY package.json package-lock.json ./

# Copy prisma schema BEFORE npm install so @prisma/client postinstall can find it
COPY prisma ./prisma/

# Install dependencies (this will trigger @prisma/client's postinstall which runs prisma generate)
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the Next.js application
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Production environment
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

EXPOSE 3000

# For standalone output
CMD ["node", ".next/standalone/server.js"]
