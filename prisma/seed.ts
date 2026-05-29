import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: { email: "admin@olaadtv.com" },
    update: {},
    create: {
      name: "Admin Olaad",
      email: "admin@olaadtv.com",
      password: adminPassword,
      role: "ADMIN",
      subscriptionStatus: "PREMIUM",
    },
  });

  const categories = [
    "Drama",
    "Action",
    "Thriller",
    "Comedy",
    "Documentary",
    "Sci-Fi",
    "Romance",
    "Adventure",
  ];

  for (const name of categories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  const movies = [
    {
      title: "Amina's Promise",
      description: "A sweeping drama about a young woman rebuilding her life through music and faith in Lagos.",
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      trailerUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
      thumbnail: "https://images.unsplash.com/photo-1513106580091-1d82408b8cd6?auto=format&fit=crop&w=900&q=80",
      genre: ["Drama", "Romance"],
      year: 2025,
      cast: ["Ayesha K", "Daniel F"],
      duration: 112,
      views: 12400,
      rating: 8.8,
      language: "English",
      isSeries: false,
      featured: true,
    },
    {
      title: "Jungle Heist",
      description: "An adrenaline-filled action thriller set across the South African wilderness.",
      videoUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
      trailerUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
      thumbnail: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=80",
      genre: ["Action", "Thriller"],
      year: 2024,
      cast: ["Kareem J", "Lila M"],
      duration: 132,
      views: 18650,
      rating: 9.1,
      language: "English",
      isSeries: false,
      featured: true,
    },
    {
      title: "Nairobi Nights",
      description: "A stylish crime saga exploring power, ambition, and betrayal in the city of lights.",
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
      trailerUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
      thumbnail: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=900&q=80",
      genre: ["Drama", "Thriller"],
      year: 2023,
      cast: ["Nana K", "Olamide P"],
      duration: 118,
      views: 17320,
      rating: 8.2,
      language: "English",
      isSeries: false,
      featured: true,
    },
    {
      title: "Sunset Rebels",
      description: "A fast-moving comedy following a group of rising creatives in Accra.",
      videoUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
      trailerUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
      thumbnail: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=900&q=80",
      genre: ["Comedy"],
      year: 2024,
      cast: ["Tosin O", "Yemi R"],
      duration: 104,
      views: 14210,
      rating: 7.9,
      language: "English",
      isSeries: false,
      featured: false,
    },
    {
      title: "Voices of the Nile",
      description: "Award-winning documentary series about river communities and conservation efforts.",
      videoUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
      trailerUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
      thumbnail: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
      genre: ["Documentary"],
      year: 2022,
      cast: ["Mira L"],
      duration: 96,
      views: 22130,
      rating: 9.4,
      language: "English",
      isSeries: true,
      episodeCount: 8,
      featured: true,
    },
  ];

  for (const movie of movies) {
    const category = await prisma.category.findFirst({ where: { name: movie.genre[0] } });

    await prisma.movie.upsert({
      where: { title: movie.title },
      update: {},
      create: {
        ...movie,
        categoryId: category?.id,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
