FROM node:20-bullseye-slim

# Install system dependencies including ffmpeg and python3
# We use bullseye-slim because it has stable ffmpeg packages
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    ffmpeg \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install yt-dlp
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp

WORKDIR /app

COPY package*.json ./
# Use --omit=dev to keep the image smaller, but we need devDeps for build if using next build
# So we install all, build, then prune
RUN npm install

COPY . .
RUN npx prisma generate
RUN npm run build

# Optional: Prune dev dependencies after build to save space
# RUN npm prune --production

EXPOSE 3000

CMD ["npm", "start"]
