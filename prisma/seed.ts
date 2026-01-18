import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    // Add some fallback songs if library is empty
    const count = await prisma.library.count()
    if (count === 0) {
        await prisma.library.createMany({
            data: [
                { title: 'September', artist: 'Earth, Wind & Fire', filePath: '/app/music/earth-wind-fire-september.mp3' },
                { title: 'Dancing Queen', artist: 'ABBA', filePath: '/app/music/abba-dancing-queen.mp3' },
                { title: 'Don\'t Stop Believin\'', artist: 'Journey', filePath: '/app/music/journey-dont-stop-believin.mp3' },
            ]
        })
        console.log('Seeded fallback songs.')
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
