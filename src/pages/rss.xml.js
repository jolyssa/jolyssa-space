import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
  // Get all content from all collections (excluding templates)
  const music = await getCollection('music', ({ data }) => !data.isTemplate);
  const making = await getCollection('making', ({ data }) => !data.isTemplate);
  const thoughts = await getCollection('thoughts', ({ data }) => !data.isTemplate);
  const consuming = await getCollection('consuming', ({ data }) => !data.isTemplate);
  const work = await getCollection('work', ({ data }) => !data.isTemplate);

  // Combine and sort by date
  const allPosts = [
    ...music.map(post => ({ ...post, collection: 'music' })),
    ...making.map(post => ({ ...post, collection: 'making' })),
    ...thoughts.map(post => ({ ...post, collection: 'thoughts' })),
    ...consuming.map(post => ({ ...post, collection: 'consuming' })),
    ...work.map(post => ({ ...post, collection: 'work' })),
  ].sort((a, b) => (b.data.date?.valueOf?.() || 0) - (a.data.date?.valueOf?.() || 0));

  return rss({
    title: "Jolyssa's Digital Garden",
    description: 'Music, making, thoughts, and proof of life.',
    site: context.site,
    items: allPosts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.excerpt || post.data.blurb || post.data.description || '',
      link: `/${post.collection}/${post.slug}/`,
      categories: post.data.tags || [],
    })),
    customData: `<language>en-us</language>`,
  });
}
