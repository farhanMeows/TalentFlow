import { db } from "../lib/db";
import type { Job } from "../lib/db";
import { PREDEFINED_TAGS } from "../constants/tags";

export async function seedDatabase() {
  const jobCount = await db.jobs.count();
  if (jobCount > 0) {
    console.log("database already seeded.");
    return;
  }

  console.log("seeding database with initail data...");
  const jobsToSeed: Job[] = [];
  const allTags = Object.values(PREDEFINED_TAGS).flat();
  for (let i = 0; i < 25; i++) {
    const title = `Software Engineer ${i + 1}`;
    jobsToSeed.push({
      title: title,
      slug: title.toLowerCase().replace(/\s+/g, "-"),
      status: "active",
      tags: [allTags[i % allTags.length]],
      order: i,
      createdAt: new Date(),
    });
  }

  await db.jobs.bulkAdd(jobsToSeed);
  console.log("database seeded successfully!");
}
