import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const projects = [
    {
      project_id: 'popo-portfolio',
      project_title: 'Aesthetic Portfolio',
      project_subtitle: 'I developed a professional portfolio website for Po Po Thae Khine, a recent accounting graduate, to showcase her qualifications and expertise. The site features sections on her education, certifications (including HSK 2 and NLA FAA Levels 1 & 2), skills in critical thinking and wealth management, and practical experience as a Financial Assistant. It also provides contact information and options to download her CV, effectively presenting her credentials to potential employers.',
      project_cover_img: '/uploads/random-cover1.png',
      project_tech_stacks: ['TypeScript', 'ShadcnUi', 'Next.js', 'React', 'Framer-Motion', 'GSAP'],
      project_link: 'https://popothaekhine.vercel.app/',
      github_link: 'https://github.com/PrimeBeyonder/Popo',
      project_status: 'Completed',
      personal: true,
      createdAt: new Date('2025-01-15T11:10:00.000Z'),
      updatedAt: new Date('2025-03-02T13:55:00.000Z'),
    },
    {
      project_id: 'bookborrow-app',
      project_title: 'BookBorrow App',
      project_subtitle: 'A modern library management system with AI-powered recommendations.',
      project_cover_img: '/uploads/bookborrow-cover.png',
      project_tech_stacks: ['TypeScript', 'Next.js', 'Bun', 'Prisma', 'PostgreSQL', 'Redis', 'Stripe', 'Resend', 'Shadcn UI', 'TailwindCSS', 'Zod', 'Framer Motion'],
      project_link: 'https://github.com/PrimeBeyonder/full_stack_bookBorrow_app',
      github_link: 'https://github.com/PrimeBeyonder/full_stack_bookBorrow_app',
      project_status: 'In Progress',
      personal: true,
      createdAt: new Date('2025-03-06T10:00:00.000Z'),
      updatedAt: new Date('2025-03-06T10:00:00.000Z'),
    },
    {
      project_id: 'zentry-clone',
      project_title: 'Zentry Clone',
      project_subtitle: 'A clone of Zentry.com to practice advanced UI interactions.',
      project_cover_img: '/uploads/zentry-clone-cover.png',
      project_tech_stacks: ['React.js', 'GSAP', 'TailwindCSS', 'JavaScript'],
      project_link: 'https://github.com/PrimeBeyonder/zentry__',
      github_link: 'https://github.com/PrimeBeyonder/zentry__',
      project_status: 'Completed',
      personal: true,
      createdAt: new Date('2025-03-06T10:00:00.000Z'),
      updatedAt: new Date('2025-03-06T10:00:00.000Z'),
    },
  ];

  for (const project of projects) {
    await prisma.ProjectIndex.create({
      data: project,
    });
  }

  console.log('Projects have been seeded successfully.');
}

main()
  .catch(e => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
