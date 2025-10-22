import { defineCollection, z } from 'astro:content';

// Music: DJ mixes, remixes, originals, production notes
const music = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    type: z.enum(['mix', 'remix', 'original', 'production-note', 'review', 'profile']),
    duration: z.string().optional(), // "1hr 23min"
    soundcloudUrl: z.string().optional(),
    spotifyUrl: z.string().optional(),
    tags: z.array(z.string()),
    coverImage: z.string().optional(),
    featured: z.boolean().default(false),
    isTemplate: z.boolean().default(false),
  })
});

// Making: DIY projects, woodworking, clay, furniture restoration
const making = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    type: z.enum(['diy', 'clay', 'wood', 'restoration', 'other']),
    status: z.enum(['completed', 'in-progress', 'abandoned']),
    materials: z.array(z.string()).optional(),
    cost: z.string().optional(), // "$45"
    tags: z.array(z.string()),
    images: z.array(z.string()).optional(),
    featured: z.boolean().default(false),
    isTemplate: z.boolean().default(false),
  })
});

// Movement: Monthly exercise tracking
const movement = defineCollection({
  type: 'content',
  schema: z.object({
    month: z.string(), // "January 2025"
    year: z.number(),
    workoutDays: z.number(), // Days with structured exercise
    totalDays: z.number(), // Days in month
    activeDays: z.number().optional(), // Days with any movement
    types: z.array(z.string()), // ["running", "climbing", "yoga"]
    notes: z.string(), // General reflections
    whatWorked: z.string(), // Wins
    whatDidnt: z.string(), // Struggles
    improvements: z.string(), // Focus for next month
    isTemplate: z.boolean().default(false),
  })
});

// Thoughts: Essays, musings, philosophical writing
const thoughts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    excerpt: z.string(), // For preview cards
    readingTime: z.string().optional(), // "8 min read" - will be auto-calculated if not provided
    tags: z.array(z.string()),
    mood: z.string().optional(), // "existential", "hopeful", etc
    featured: z.boolean().default(false),
    isTemplate: z.boolean().default(false),
  })
});

// Consuming: Movies, books, games, food
const consuming = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    type: z.enum(['movie', 'book', 'game', 'food']),
    date: z.date(), // When consumed/discovered
    rating: z.number().min(1).max(5).optional(),
    status: z.enum(['completed', 'current', 'abandoned', 'craving']),
    blurb: z.string(), // Short version for list view
    tags: z.array(z.string()),
    image: z.string().optional(),
    isTemplate: z.boolean().default(false),
  })
});

// Work: Dev projects for fun or learning (not client work)
const work = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
    description: z.string(),
    tech: z.array(z.string()), // Technologies used
    liveUrl: z.string().optional(),
    githubUrl: z.string().optional(),
    featured: z.boolean().default(false),
    status: z.enum(['completed', 'in-progress', 'idea']).optional(),
    isTemplate: z.boolean().default(false),
  })
});

export const collections = { 
  music, 
  making, 
  movement, 
  thoughts, 
  consuming, 
  work 
};
