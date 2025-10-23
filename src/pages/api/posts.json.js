import { getCollection } from 'astro:content';

export async function GET() {
  const music = await getCollection('music', ({ data }) => !data.isTemplate);
  const making = await getCollection('making', ({ data }) => !data.isTemplate);
  const thoughts = await getCollection('thoughts', ({ data }) => !data.isTemplate);
  const consuming = await getCollection('consuming', ({ data }) => !data.isTemplate);
  const work = await getCollection('work', ({ data }) => !data.isTemplate);

  const allPosts = [
    ...music.map(p => ({ 
      url: `/music/${p.slug}/`,
      date: p.data.date,
      isTemplate: p.data.isTemplate,
      published: p.data.published
    })),
    ...making.map(p => ({ 
      url: `/making/${p.slug}/`,
      date: p.data.date,
      isTemplate: p.data.isTemplate,
      published: p.data.published
    })),
    ...thoughts.map(p => ({ 
      url: `/thoughts/${p.slug}/`,
      date: p.data.date,
      isTemplate: p.data.isTemplate,
      published: p.data.published
    })),
    ...consuming.map(p => ({ 
      url: `/consuming/${p.slug}/`,
      date: p.data.date,
      isTemplate: p.data.isTemplate,
      published: p.data.published
    })),
    ...work.map(p => ({ 
      url: `/work/${p.slug}/`,
      date: p.data.date,
      isTemplate: p.data.isTemplate,
      published: p.data.published
    })),
  ];

  return new Response(JSON.stringify(allPosts), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}