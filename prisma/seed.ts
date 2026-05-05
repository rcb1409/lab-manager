import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting execution of seed.ts...');

  // 1. Create a dummy admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@university.edu' },
    update: {},
    create: {
      email: 'admin@university.edu',
      name: 'Lab Admin',
      role: 'ADMIN',
    },
  });

  // 2. Create labs
  const lab1 = await prisma.lab.create({
    data: {
      name: 'Advanced Material Science Lab',
      building: 'Engineering Building',
      room: '101A',
    },
  });

  const lab2 = await prisma.lab.create({
    data: {
      name: 'Robotics Prototyping Center',
      building: 'Maker Space',
      room: '205B',
    },
  });

  console.log(`Created labs: ${lab1.name}, ${lab2.name}`);

  // 3. Create equipment for Lab 1
  await prisma.equipment.createMany({
    data: [
      {
        labId: lab1.id,
        name: 'Scanning Electron Microscope (SEM)',
        type: 'Microscope',
      },
      {
        labId: lab1.id,
        name: 'Atomic Force Microscope (AFM)',
        type: 'Microscope',
      },
      {
        labId: lab1.id,
        name: 'X-Ray Diffractometer',
        type: 'Spectrometer',
      },
    ],
  });

  // 4. Create equipment for Lab 2
  await prisma.equipment.createMany({
    data: [
      {
        labId: lab2.id,
        name: 'Prusa i3 MK3S+ 3D Printer',
        type: '3D Printer',
      },
      {
        labId: lab2.id,
        name: 'Ultimaker S5',
        type: '3D Printer',
      },
      {
        labId: lab2.id,
        name: 'Universal Laser System VLS6.60',
        type: 'Laser Cutter',
      },
      {
        labId: lab2.id,
        name: 'CNC Milling Machine',
        type: 'CNC',
      },
    ],
  });

  console.log('Created equipment for all labs.');
  console.log('Seeding finished successfully.');
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
