import fs from 'fs';
import path from 'path';

const [,, collection, title] = process.argv;

if (!collection || !title) {
  console.error('Usage: bun run new-post <collection> "Post Title"');
  process.exit(1);
}

const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const date = new Date().toISOString().split('T')[0];
const filepath = path.join('src', 'content', collection, `${slug}.md`);

fs.mkdirSync(path.dirname(filepath), { recursive: true });

const templates = {
  music: `---
title: "${title}"
date: ${date}
type: "mix"
duration: ""
soundcloudUrl: ""
tags: []
coverImage: ""
featured: false
---

# ${title}

Your content here...
`,
  making: `---
title: "${title}"
date: ${date}
type: "diy"
status: "in-progress"
materials: []
cost: ""
tags: []
images: []
featured: false
---

# ${title}

Your content here...
`,
  thoughts: `---
title: "${title}"
date: ${date}
excerpt: ""
readingTime: "5 min read"
tags: []
featured: false
---

# ${title}

Your content here...
`,
  consuming: `---
title: "${title}"
type: "movie"
date: ${date}
rating: 5
status: "completed"
blurb: ""
tags: []
---

# ${title}

Your thoughts here...
`,
  work: `---
title: "${title}"
date: ${date}
description: ""
tech: []
liveUrl: ""
githubUrl: ""
featured: false
status: "in-progress"
---

# ${title}

Your content here...
`,
  movement: `---
month: "${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}"
year: ${new Date().getFullYear()}
workoutDays: 0
totalDays: ${new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()}
activeDays: 0
types: []
notes: ""
whatWorked: ""
whatDidnt: ""
improvements: ""
---

# ${title}

Your reflections here...
`
};

const template = templates[collection];

if (!template) {
  console.error(`Unknown collection: ${collection}`);
  console.error(`Available: ${Object.keys(templates).join(', ')}`);
  process.exit(1);
}

fs.writeFileSync(filepath, template);
console.log(`Created: ${filepath}`);
