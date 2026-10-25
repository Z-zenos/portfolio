// All site content lives here. Edit this file to make the portfolio yours.
// Values marked EDIT are placeholders.

export const SKILLS = {
  python: { label: 'Python', icon: 'python/python-original', group: 'backend' },
  fastapi: { label: 'FastAPI', icon: 'fastapi/fastapi-original', group: 'backend' },
  nodejs: { label: 'Node.js', icon: 'nodejs/nodejs-original', group: 'backend' },
  typescript: { label: 'TypeScript', icon: 'typescript/typescript-original', group: 'frontend' },
  react: { label: 'React', icon: 'react/react-original', group: 'frontend' },
  nextjs: { label: 'Next.js', icon: 'nextjs/nextjs-original', group: 'frontend' },
  postgresql: { label: 'PostgreSQL', icon: 'postgresql/postgresql-original', group: 'data' },
  mongodb: { label: 'MongoDB', icon: 'mongodb/mongodb-original', group: 'data' },
  redis: { label: 'Redis', icon: 'redis/redis-original', group: 'data' },
  docker: { label: 'Docker', icon: 'docker/docker-original', group: 'devops' },
  aws: { label: 'AWS', icon: 'amazonwebservices/amazonwebservices-plain-wordmark', group: 'devops' },
  linux: { label: 'Linux', icon: 'linux/linux-original', group: 'devops' },
  git: { label: 'Git', icon: 'git/git-original', group: 'devops' },
  githubactions: { label: 'CI/CD', icon: 'githubactions/githubactions-original', group: 'devops' },
  canvas: { label: 'Canvas', icon: 'html5/html5-original', group: 'frontend' },
};

export const SKILL_GROUPS = [
  { key: 'all', label: 'All' },
  { key: 'backend', label: 'Backend' },
  { key: 'frontend', label: 'Frontend' },
  { key: 'data', label: 'Databases' },
  { key: 'devops', label: 'DevOps & Cloud' },
];

export const profile = {
  domain: 'TUANHA.DEV', // EDIT
  name: 'HOANG ANH TUAN', // EDIT
  nameJa: 'ホアン・アイン・トゥアン', // EDIT: your name in katakana
  status: 'STATUS: ACTIVE · OPEN TO NEW QUESTS',
  roles: ['Software Engineer', 'Backend Builder', 'Pixel Art Tinkerer', 'Problem Solver'], // EDIT
  location: 'Vietnam', // EDIT
  experience: '5+ Years Experience', // EDIT
  heroSkills: ['python', 'fastapi', 'react', 'typescript', 'postgresql', 'docker'], // EDIT
  links: {
    // EDIT
    resume: '#',
    github: 'https://github.com/',
    linkedin: 'https://www.linkedin.com/',
    email: 'hung_dx@amira.vn',
    featured: { label: 'Pixel Map', url: '#work' },
  },

  about: {
    subtitle: 'Software engineer · builder of calm systems · Vietnam',
    level: 'LVL 99 · ACTIVE',
    photo: 'assets/player/cat.png', // EDIT: your photo (3:4 works best)
    stats: [
      // EDIT
      { label: 'EXP', ja: '経験', value: '5+ YRS', note: 'Production Systems', color: 'red' },
      { label: 'SHIPPED', ja: '実績', value: '20+', note: 'Features Launched', color: 'green' },
      { label: 'SCALE', ja: '規模', value: '1M+', note: 'Requests / Day', color: 'gold' },
      { label: 'CRAFT', ja: '創作', value: '34', note: 'Pixel Provinces', color: 'navy' },
    ],
    vitals: [
      { label: 'Clean Code', value: 97, color: 'green' },
      { label: 'Uptime', value: 99, color: 'navy' },
      { label: 'Coffee Level', value: 95, color: 'red' },
    ],
    skills: ['python', 'fastapi', 'react', 'typescript', 'postgresql', 'redis', 'docker'],
    story: [
      // EDIT
      'I am a software engineer from Vietnam who builds reliable backend services, data pipelines and web apps. I care about systems that stay simple as they grow, and interfaces that feel good to use.',
      'Outside of work I draw my country in pixels: one animated scene per province, with its streets, food, crafts and festivals. This site starts in Hoi An.',
    ],
    featured: {
      name: 'VIETNAM PIXEL MAP',
      url: '#work',
      text: 'All 34 provinces of Vietnam as animated pixel scenes of landmarks, cuisine, crafts and festivals, starting with Hoi An.',
    },
    quote: 'Simple things, built carefully, last longest. Like the old wooden houses of Hoi An.',
  },

  expertise: [
    // EDIT: icon is a file name in assets/icons (bolt, monitor, stopwatch, lantern, dice, mail, scroll, lixi)
    { icon: 'bolt', tag: 'Python / FastAPI', color: 'red', title: 'Backend & APIs', text: 'Scalable REST and async APIs, background jobs, and clean service boundaries.' },
    { icon: 'monitor', tag: 'React / TS', color: 'navy', title: 'Modern Web Apps', text: 'Fast, accessible interfaces with React and TypeScript, from dashboards to playful sites.' },
    { icon: 'stopwatch', tag: 'Postgres / Redis', color: 'green', title: 'Data & Performance', text: 'Schema design, query tuning, caching and indexing for systems that stay quick under load.' },
    { icon: 'lantern', tag: 'Canvas / Pixel', color: 'gold', title: 'Creative Coding', text: 'Pixel art scenes, generative audio and small animated worlds rendered in the browser.' },
  ],

  quests: [
    // EDIT: newest first
    {
      badge: 'ACTIVE',
      period: '2023 — PRESENT',
      company: 'Your Company',
      role: 'Software Engineer',
      location: 'Vietnam',
      summary: 'One or two sentences on what you own and the impact of your work.',
      achievements: [
        'An achievement with a measurable result.',
        'A system you designed or improved, and why it mattered.',
        'Something you led, shipped or automated.',
      ],
      skills: ['python', 'fastapi', 'postgresql', 'docker'],
    },
    {
      badge: 'QUEST #02',
      period: '2021 — 2023',
      company: 'Previous Company',
      role: 'Backend Developer',
      location: 'Vietnam',
      summary: 'One or two sentences on the team, product and your role.',
      achievements: ['An achievement with a measurable result.', 'Another notable contribution.'],
      skills: ['nodejs', 'mongodb', 'redis'],
    },
    {
      badge: 'QUEST #01',
      period: '2020 — 2021',
      company: 'First Company',
      role: 'Junior Developer',
      location: 'Vietnam',
      summary: 'Where the adventure started.',
      achievements: ['What you learned and built first.'],
      skills: ['react', 'typescript', 'git'],
    },
  ],

  projects: [
    // EDIT
    {
      logo: 'VN',
      name: 'Vietnam Pixel Map',
      subtitle: 'Creator · Interactive pixel atlas of Vietnam',
      badge: { text: 'IN PROGRESS · HOI AN PILOT', color: 'red' },
      text: 'An interactive map of all 34 provinces of Vietnam, each with an animated pixel scene of its landmarks, cuisine, crafts and festivals. Layered parallax art, sprite animation and ambient effects, all rendered in the browser.',
      tags: ['Canvas', 'Pixel Art', 'Animation', 'Vanilla JS'],
      link: { label: 'View project', url: '#' },
    },
    {
      logo: 'P2',
      name: 'Project Two',
      subtitle: 'Your role · What it is',
      badge: { text: 'GITHUB ★', color: 'gold' },
      text: 'Describe the problem, what you built and the result. Mention scale, users or performance numbers if you have them.',
      tags: ['React', 'Node.js', 'PostgreSQL'],
      link: { label: 'View on GitHub', url: 'https://github.com/' },
    },
  ],

  contact: {
    text: 'Open to engineering roles, freelance builds and creative collaborations. Send a lantern down the river and I will answer.',
  },
};
