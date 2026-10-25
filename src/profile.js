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
  nestjs: { label: 'NestJS', icon: 'nestjs/nestjs-original', group: 'backend' },
  threejs: { label: 'three.js', icon: 'threejs/threejs-original', group: 'frontend' },
  nuxt: { label: 'Nuxt', icon: 'nuxtjs/nuxtjs-original', group: 'frontend' },
  terraform: { label: 'Terraform', icon: 'terraform/terraform-original', group: 'devops' },
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
  roles: ['Software Engineer', 'Full-stack Engineer', '3D Web Builder', 'Pixel Art Tinkerer'],
  location: 'Vietnam', // EDIT
  experience: '2+ Years at Amira', // EDIT if you have experience before Amira
  heroSkills: ['python', 'fastapi', 'nestjs', 'typescript', 'react', 'aws'],
  links: {
    // EDIT
    resume: '#',
    github: 'https://github.com/',
    linkedin: 'https://www.linkedin.com/',
    email: 'hoanganhtuanbk2001@gmail.com',
    featured: { label: 'Pixel Map', url: '#work' },
  },

  about: {
    subtitle: 'Software engineer · builder of calm systems · Vietnam',
    level: 'LVL 99 · ACTIVE',
    photo: 'assets/player/cat.png', // EDIT: your photo (3:4 works best)
    stats: [
      { label: 'EXP', ja: '経験', value: '2+ YRS', note: 'Amira · 2024 – now', color: 'red' },
      { label: 'SHIPPED', ja: '実績', value: '2,000+', note: 'Commits · 10 repos', color: 'green' },
      { label: 'TUNED', ja: '最適化', value: '−93%', note: 'Vertices per 3D tile', color: 'gold' },
      { label: 'CRAFT', ja: '創作', value: '34', note: 'Pixel Provinces', color: 'navy' },
    ],
    vitals: [
      { label: 'Clean Code', value: 97, color: 'green' },
      { label: 'Uptime', value: 99, color: 'navy' },
      { label: 'Coffee Level', value: 95, color: 'red' },
    ],
    skills: ['python', 'fastapi', 'nestjs', 'typescript', 'react', 'threejs', 'postgresql', 'redis', 'aws', 'terraform'],
    story: [
      'I am a software engineer at Amira in Vietnam. I started on the backend of Bookyou, a bilingual work marketplace, where I owned the money and points logic, the booking lifecycle jobs and notifications in NestJS.',
      'Now I work across the stack of a drone inspection platform: FastAPI services and AWS pipelines that turn drone photos into point clouds and 3D Tiles, and the browser viewers where inspectors measure, slice and fly through them.',
      'Outside work I draw my country in pixels: one animated scene per province. This site starts in Hoi An.',
    ],
    featured: { label: 'Pixel Map', url: '#work' },
  },

  about: {
    subtitle: 'Software engineer · builder of calm systems · Vietnam',
    level: 'LVL 99 · ACTIVE',
    photo: 'assets/player/cat.png', // EDIT: your photo (3:4 works best)
    stats: [
      { label: 'EXP', ja: '経験', value: '2+ YRS', note: 'Amira · 2024 – now', color: 'red' },
      { label: 'SHIPPED', ja: '実績', value: '2,000+', note: 'Commits · 10 repos', color: 'green' },
      { label: 'TUNED', ja: '最適化', value: '−93%', note: 'Vertices per 3D tile', color: 'gold' },
      { label: 'CRAFT', ja: '創作', value: '34', note: 'Pixel Provinces', color: 'navy' },
    ],
    vitals: [
      { label: 'Clean Code', value: 97, color: 'green' },
      { label: 'Uptime', value: 99, color: 'navy' },
      { label: 'Coffee Level', value: 95, color: 'red' },
    ],
    skills: ['python', 'fastapi', 'nestjs', 'typescript', 'react', 'threejs', 'postgresql', 'redis', 'aws', 'terraform'],
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
    // icon is a file name in assets/icons (bolt, monitor, stopwatch, lantern, dice, mail, scroll, lixi)
    { icon: 'bolt', tag: 'FastAPI / NestJS', color: 'red', title: 'Backend & APIs', text: 'Async APIs on PostgreSQL and PostGIS, scheduled jobs, auth, caching and the business rules money depends on.' },
    { icon: 'stopwatch', tag: 'AWS / Terraform', color: 'green', title: 'Cloud Pipelines', text: 'Batch, Fargate and Lambda jobs that turn raw drone imagery into browser-ready 3D, all as code.' },
    { icon: 'monitor', tag: 'Cesium / three.js', color: 'navy', title: '3D on the Web', text: 'Point clouds, meshes and maps in the browser, with the camera math to tie photos to the model.' },
    { icon: 'lantern', tag: 'Canvas / Pixel', color: 'gold', title: 'Creative Coding', text: 'Pixel art scenes, generative audio and small animated worlds rendered in the browser.' },
  ],

  quests: [
    // newest first
    {
      badge: 'ACTIVE',
      period: 'NOV 2025 — PRESENT',
      company: 'Amira',
      project: 'Drone Inspection Platform',
      role: 'Full-stack Engineer',
      location: 'Vietnam',
      summary: 'Top committer on the backend of a cloud platform for drone-based infrastructure inspection, and builder of its browser 3D viewer and flight operations console.',
      achievements: [
        'Built the FastAPI/PostGIS backend for projects, map dashboards, guest sharing and 3D datasets, with multipart S3 uploads and per-organization storage quotas.',
        'Designed the 3D pipeline on AWS: OpenDroneMap on Batch, then Fargate jobs that convert point clouds to COPC and meshes to Draco-compressed 3D Tiles, served through CloudFront signed cookies.',
        'Switched mesh tiling to an octree, cutting median vertices per tile by 93% (310,883 to 22,230) at the same build time.',
        'Linked drone photos to the 3D model: fly to where a photo was taken, highlight its footprint, or click a point to list every photo that saw it.',
        'Built a point-cloud cross-section tool, a live operations console with drone video and waypoint tracking, and a drone simulator CLI with 17 scenarios and 609 tests.',
      ],
      skills: ['python', 'fastapi', 'postgresql', 'aws', 'terraform', 'react', 'typescript', 'threejs'],
    },
    {
      badge: 'QUEST #01',
      period: 'SEP 2024 — JUL 2025',
      company: 'Amira',
      project: 'Bookyou Marketplace',
      role: 'Backend Engineer',
      location: 'Vietnam',
      summary: 'Backend engineer on a bilingual (EN/JA) two-sided work marketplace with bookings, chat, points, rewards and payouts.',
      achievements: [
        'Moved scattered reward, fee and point rules into one MoneyService, unifying pricing, refunds and payslip calculations for bookings and recruitment.',
        'Built the scheduled jobs of the booking lifecycle: auto-completion, deadline reminders, point expiry, refunds and late-rate statistics.',
        'Added a Redis response-cache decorator and a duplicate-request throttle, and moved uploads to S3 presigned URLs.',
        'Delivered identity verification, email verification codes, bilingual notifications with deep links and server-side AppsFlyer attribution.',
        'Built admin and web pages in Nuxt 3: support inquiries with AI translation, point adjustments and transaction lists.',
      ],
      skills: ['nestjs', 'typescript', 'postgresql', 'redis', 'nuxt', 'aws'],
    },
  ],

  projects: [
    {
      logo: '3D',
      name: 'Drone Inspection 3D Pipeline',
      subtitle: 'Amira · Backend and cloud',
      badge: { text: 'AMIRA · 2025 – NOW', color: 'red' },
      text: 'Turns drone survey photos into browser-ready 3D. Images upload straight to S3, a Lambda adds thumbnails and geotags, OpenDroneMap runs on AWS Batch, and Fargate jobs convert the output into Cloud Optimized Point Clouds and Draco-compressed 3D Tiles. Camera poses are linked back to every photo and assets are served through CloudFront signed cookies.',
      tags: ['Python', 'FastAPI', 'PostGIS', 'AWS Batch', 'ECS Fargate', 'Lambda', 'Terraform', 'PDAL', '3D Tiles'],
      link: { label: 'Ask me about it', url: '#contact' },
    },
    {
      logo: 'VW',
      name: 'Inspection 3D Viewer',
      subtitle: 'Amira · Frontend',
      badge: { text: 'AMIRA · 2025 – NOW', color: 'navy' },
      text: 'A web viewer for orthophotos, elevation models, point clouds and meshes that switches between Cesium, Potree and three.js. Photos are tied to the model: fly to where a photo was taken, or click a point to list every photo that saw it. A cross-section tool slices the cloud into a measurable profile.',
      tags: ['React', 'TypeScript', 'CesiumJS', 'Potree', 'three.js', 'proj4', 'COPC'],
      link: { label: 'Read the notes', url: '/blog/' },
    },
    {
      logo: 'FO',
      name: 'Flight Operations Console',
      subtitle: 'Amira · Frontend and tooling',
      badge: { text: 'AMIRA · 2026', color: 'green' },
      text: 'The operator console for drone missions: pre-flight checks, live video over HLS and WebRTC, remote camera control, waypoint tracking on the map and flight logs. I also wrote a drone simulator CLI that replays YAML scenarios over MQTT and the DJI Cloud API for end-to-end tests.',
      tags: ['React', 'WebRTC', 'HLS', 'Python', 'MQTT', 'GitHub Actions'],
      link: { label: 'Ask me about it', url: '#contact' },
    },
    {
      logo: 'BY',
      name: 'Bookyou',
      subtitle: 'Amira · Backend',
      badge: { text: 'AMIRA · 2024 – 2025', color: 'gold' },
      text: 'A two-sided work marketplace where people book workers for online, offline and project jobs, chat and call, and earn or spend points. I worked mainly on the NestJS API: money and points logic, booking jobs, verification, bilingual notifications and caching, plus pages in the Nuxt admin.',
      tags: ['NestJS', 'TypeORM', 'PostgreSQL', 'Redis', 'Nuxt 3', 'i18n'],
      link: { label: 'Ask me about it', url: '#contact' },
    },
    {
      logo: 'VN',
      name: 'Vietnam Pixel Map',
      subtitle: 'Personal · Interactive pixel atlas of Vietnam',
      badge: { text: 'IN PROGRESS · HOI AN PILOT', color: 'red' },
      text: 'An interactive map of all 34 provinces of Vietnam, each with an animated pixel scene of its landmarks, cuisine, crafts and festivals. Layered parallax art, sprite animation and ambient effects, all rendered in the browser.',
      tags: ['Canvas', 'Pixel Art', 'Animation', 'Vanilla JS'],
      link: { label: 'View project', url: '#' },
    },
  ],

  contact: {
    text: 'Open to engineering roles, freelance builds and creative collaborations. Send a lantern down the river and I will answer.',
  },
};
