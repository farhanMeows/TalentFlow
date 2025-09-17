import { db } from "../lib/db";
import type { Job } from "../lib/db";

export async function seedDatabase() {
  const jobCount = await db.jobs.count();
  if (jobCount > 0) {
    console.log("database already seeded.");
    return;
  }

  console.log("seeding database with initail data...");
  const jobsToSeed: Job[] = [];
  for (let i = 0; i < 25; i++) {
    const title = `Software Engineer ${i + 1}`;
    jobsToSeed.push({
      title: title,
      slug: title.toLowerCase().replace(/\s+/g, "-"),
      status: "active",
      tags: ["Engineering", i % 2 === 0 ? "Remote" : "On-site"],
      order: i,
      createdAt: new Date(),
    });
  }

  await db.jobs.bulkAdd(jobsToSeed);
  console.log("database seeded successfully!");
}
