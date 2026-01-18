# dj-brother 🎧

An automated, request-aware wedding DJ software. Built for a simple, self-hosted experience.

## The Concept

- **The Billboard**: A beautiful, minimalist display for the wedding guests to see what's playing. It also acts as the audio engine with automatic crossfading.
- **The Request System**: Guests scan a QR code, search for a song via MusicBrainz, and it gets slotted into the night's schedule.
- **The Logic**: Automatically checks your library. If a song is missing, it uses `yt-dlp` to download it and integrates with Lidarr for management.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (React, TypeScript)
- **Database**: [Prisma](https://www.prisma.io/) with SQLite
- **Audio**: Web Audio API for seamless crossfading
- **Search**: MusicBrainz API
- **Downloader**: `yt-dlp`
- **Deployment**: Docker & Docker Compose

## Quick Start (with Docker)

1.  **Clone the repo**:
    ```bash
    git clone https://github.com/yourusername/dj-brother.git
    cd dj-brother
    ```

2.  **Configure environment**:
    Create a `.env` file or use the defaults in `docker-compose.yml`.
    ```bash
    MUSIC_DIR=./music
    ```

3.  **Run with Docker Compose**:
    ```bash
    docker-compose up -d
    ```

4.  **Access the app**:
    - **Billboard**: `http://localhost:3000` (Open this on your DJ laptop)
    - **Requests**: `http://localhost:3000/request` (Guests will see this via QR code)
    - **Admin**: `http://localhost:3000/admin`

## Development

```bash
npm install
npx prisma migrate dev
npm run dev
```

## Contributing

This is an open-source project. Feel free to submit PRs for new features or bug fixes.

## License

MIT
