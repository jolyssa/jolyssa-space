import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  // Get all content from all collections (excluding templates)
  const music = await getCollection('music', ({ data }) => !data.isTemplate);
  const making = await getCollection('making', ({ data }) => !data.isTemplate);
  const thoughts = await getCollection('thoughts', ({ data }) => !data.isTemplate);
  const consuming = await getCollection('consuming', ({ data }) => !data.isTemplate);
  const work = await getCollection('work', ({ data }) => !data.isTemplate);

  // Combine and sort by date (newest first)
  const allPosts = [
    ...music.map(post => ({ ...post, collection: 'music' })),
    ...making.map(post => ({ ...post, collection: 'making' })),
    ...thoughts.map(post => ({ ...post, collection: 'thoughts' })),
    ...consuming.map(post => ({ ...post, collection: 'consuming' })),
    ...work.map(post => ({ ...post, collection: 'work' })),
  ]
  .filter(post => post.data.date) // Only include posts with dates
  .sort((a, b) => new Date(b.data.date) - new Date(a.data.date));

  const siteUrl = context.site || 'https://jolyssa.space';

  return rss({
    title: "Jolyssa's Digital Garden",
    description: 'Music, making, thoughts, and proof of life.',
    site: siteUrl,
    items: allPosts.map((post) => ({
      title: post.data.title || 'Untitled',
      pubDate: new Date(post.data.date),
      description: post.data.excerpt || post.data.blurb || post.data.description || post.data.notes || 'No description available',
      link: `/${post.collection}/${post.slug}/`,
      guid: `${siteUrl}/${post.collection}/${post.slug}/`,
      categories: post.data.tags || [],
      author: 'jolyssa@jolyssa.space (Jolyssa)',
    })),
    customData: `<language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <generator>Astro RSS</generator>`,
  });
}
