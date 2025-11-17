import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: "admin@taskly.local" },
    update: {},
    create: {
      email: "admin@taskly.local",
      password: "admin123", // TODO: ganti ke hash nanti
      role: "ADMIN",
    },
  });

  const e1 = await prisma.employee.upsert({
    where: { email: "andra@taskly.local" },
    update: {},
    create: {
      fullName: "Andra Pratama",
      email: "andra@taskly.local",
      position: "Designer",
      department: "Creative",
      joinedAt: new Date("2024-06-12"),
      status: "ACTIVE",
    },
  });

  const e2 = await prisma.employee.upsert({
    where: { email: "afrizal@taskly.local" },
    update: {},
    create: {
      fullName: "Afrizal Ramadhan",
      email: "afrizal@taskly.local",
      position: "Video Editor",
      department: "Creative",
      joinedAt: new Date("2024-08-01"),
      status: "ACTIVE",
    },
  });

  const e3 = await prisma.employee.upsert({
    where: { email: "iqbal@taskly.local" },
    update: {},
    create: {
      fullName: "Iqbal Setiawan",
      email: "iqbal@taskly.local",
      position: "Web Developer",
      department: "Tech",
      joinedAt: new Date("2025-01-10"),
      status: "PROBATION",
    },
  });

  await prisma.attendance.createMany({
    data: [
      {
        employeeId: e1.id,
        date: new Date("2025-11-01"),
        checkIn: new Date("2025-11-01T08:59:00"),
        checkOut: new Date("2025-11-01T17:12:00"),
        type: "REGULAR",
      },
      {
        employeeId: e2.id,
        date: new Date("2025-11-01"),
        checkIn: new Date("2025-11-01T09:12:00"),
        checkOut: new Date("2025-11-01T18:03:00"),
        type: "REGULAR",
      },
    ],
    skipDuplicates: true,
  });

  await prisma.leaveRequest.create({
    data: {
      employeeId: e3.id,
      dateFrom: new Date("2025-11-12"),
      dateTo: new Date("2025-11-14"),
      type: "SICK",
      status: "APPROVED",
    },
  });

  console.log("Seed done. Admin:", admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
