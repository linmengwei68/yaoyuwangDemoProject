import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const jobTitles = [
  'Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'Data Analyst', 'Product Manager', 'UX Designer', 'DevOps Engineer',
  'QA Engineer', 'Mobile Developer', 'Machine Learning Engineer', 'Cloud Architect',
  'Security Analyst', 'Technical Writer', 'Scrum Master', 'Business Analyst',
  'Database Administrator', 'Network Engineer', 'Systems Administrator', 'IT Support Specialist',
  'Graphic Designer', 'Marketing Manager', 'Sales Representative', 'HR Coordinator',
  'Project Coordinator', 'Financial Analyst', 'Operations Manager', 'Customer Success Manager',
  'Content Strategist', 'SEO Specialist', 'Copywriter', 'Event Planner',
  'Legal Advisor', 'Compliance Officer', 'Research Scientist', 'Lab Technician',
  'Mechanical Engineer', 'Civil Engineer', 'Electrical Engineer', 'Chemical Engineer',
  'Biomedical Engineer', 'Environmental Scientist', 'Urban Planner', 'Supply Chain Manager',
  'Logistics Coordinator', 'Warehouse Manager', 'Procurement Specialist', 'Inventory Analyst',
  'Account Executive', 'Client Relations Manager',
];

const companies = [
  'Acme Corp', 'Globex Inc', 'Initech', 'Umbrella Corp', 'Stark Industries',
  'Wayne Enterprises', 'Cyberdyne Systems', 'Aperture Science', 'Oscorp', 'LexCorp',
  'Massive Dynamic', 'Hooli', 'Pied Piper', 'Soylent Corp', 'Tyrell Corporation',
];

const descriptions = [
  'We are looking for a talented professional to join our growing team.',
  'Exciting opportunity to work on cutting-edge technology projects.',
  'Join a dynamic team and contribute to innovative solutions.',
  'Great role for someone passionate about making an impact.',
  'Be part of a collaborative environment focused on excellence.',
  'Remote-friendly position with flexible working hours.',
  'Fast-paced environment with opportunities for growth and learning.',
  'Work with industry leaders on challenging problems.',
  'Contribute to products used by millions of people worldwide.',
  'Opportunity to mentor junior team members and drive best practices.',
];

const skills = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'Go', 'Rust', 'Ruby',
  'React', 'Angular', 'Vue.js', 'Node.js', 'Django', 'Spring Boot', 'ASP.NET',
  'PostgreSQL', 'MongoDB', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP',
  'Git', 'CI/CD', 'Agile', 'REST API', 'GraphQL', 'Microservices', 'TDD',
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN(arr, n) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(startYear = 2024, endYear = 2025) {
  const start = new Date(startYear, 0, 1).getTime();
  const end = new Date(endYear, 11, 31).getTime();
  return new Date(start + Math.random() * (end - start));
}

function generateQuestions() {
  const count = randomInt(1, 5);
  // 8 default required fields (must always be first)
  const defaultFields = [
    { title: 'Email', type: 'text', required: true },
    { title: 'Phone', type: 'text', required: true },
    { title: 'Nickname', type: 'text', required: true },
    { title: 'Country', type: 'select', required: true, options: [] },
    { title: 'State', type: 'select', required: true, options: [] },
    { title: 'Address', type: 'text', required: true },
    { title: 'Postcode', type: 'text', required: true },
    { title: 'Resume', type: 'file', required: true },
  ];
  const questions = [...defaultFields];
  const possibleQuestions = [
    { title: 'Why do you want to work here?', type: 'textarea' },
    { title: 'Years of experience', type: 'number' },
    { title: 'Preferred work mode', type: 'select', options: ['Remote', 'On-site', 'Hybrid'] },
    { title: 'Available start date', type: 'text' },
    { title: 'Relevant skills', type: 'select', options: pickN(skills, 6) },
    { title: 'Expected salary range', type: 'select', options: ['50k-70k', '70k-90k', '90k-120k', '120k+'] },
    { title: 'Do you have a valid work permit?', type: 'select', options: ['Yes', 'No'] },
    { title: 'Tell us about a challenging project', type: 'textarea' },
    { title: 'Upload your portfolio', type: 'file' },
    { title: 'Highest education level', type: 'select', options: ['High School', 'Bachelor', 'Master', 'PhD'] },
  ];
  const selected = pickN(possibleQuestions, count);
  for (const q of selected) {
    const item = { title: q.title, type: q.type, required: Math.random() > 0.3 };
    if (q.options) item.options = q.options;
    questions.push(item);
  }
  return questions;
}

async function main() {
  // Idempotency: skip if test data already exists
  const existing = await prisma.user.findUnique({ where: { email: 'testowner1@test.com' } });
  if (existing) {
    const postCount = await prisma.jobPost.count({ where: { userId: existing.id } });
    if (postCount > 0) {
      console.log('Test data already exists, skipping seed-test-data.');
      return;
    }
  }

  const role = await prisma.role.findUnique({ where: { name: 'Project Owner' } });
  if (!role) {
    console.error('Role "Project Owner" not found. Run the base seed first.');
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash('123456', 10);

  console.log('Creating 100 test users with 50 job posts each...');

  for (let i = 1; i <= 100; i++) {
    const email = `testowner${i}@test.com`;

    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        password: hashedPassword,
        roles: { connect: { name: 'Project Owner' } },
      },
    });

    const posts = [];
    for (let j = 0; j < 50; j++) {
      const title = `${pick(jobTitles)} - ${pick(companies)}`;
      const desc = `${pick(descriptions)}\n\nRequired skills: ${pickN(skills, randomInt(2, 5)).join(', ')}.\n\nThis is a ${pick(['full-time', 'part-time', 'contract'])} position.`;
      posts.push({
        title,
        jobDescription: desc,
        state: Math.random() > 0.3 ? 'active' : 'closed',
        questions: generateQuestions(),
        postedAt: randomDate(),
        postedBy: email,
        userId: user.id,
      });
    }

    await prisma.jobPost.createMany({ data: posts });

    if (i % 10 === 0) console.log(`  Created user ${i}/100 with 50 posts`);
  }

  console.log('Done! Created 100 users and 5000 job posts.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
