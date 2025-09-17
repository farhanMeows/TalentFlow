import { db } from "../lib/db";
import type { Job, Assessment } from "../lib/db";
import { PREDEFINED_TAGS } from "../constants/tags";

const JOB_TITLES = [
  "Senior Frontend Developer",
  "Full Stack Engineer",
  "DevOps Engineer",
  "Product Manager",
  "UX/UI Designer",
  "Data Scientist",
  "Backend Developer",
  "Mobile App Developer",
  "QA Engineer",
  "Technical Lead",
  "Cloud Architect",
  "Machine Learning Engineer",
  "Cybersecurity Specialist",
  "Database Administrator",
  "Solutions Architect",
  "React Developer",
  "Node.js Developer",
  "Python Developer",
  "Java Developer",
  "iOS Developer",
  "Android Developer",
  "Blockchain Developer",
  "AI Research Scientist",
  "Site Reliability Engineer",
  "Technical Writer",
  "Scrum Master",
  "Business Analyst",
  "System Administrator",
  "Network Engineer",
  "Software Architect",
];

export async function seedDatabase() {
  const jobCount = await db.jobs.count();
  if (jobCount > 0) {
    console.log("database already seeded.");
    return;
  }

  console.log("seeding database with initial data...");
  const jobsToSeed: Job[] = [];
  const allTags = Object.values(PREDEFINED_TAGS).flat();

  for (let i = 0; i < 25; i++) {
    const title = JOB_TITLES[i % JOB_TITLES.length];
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
}

// Function to clear all data from the database

export async function clearAllData() {
  console.log("Clearing all data from database...");

  try {
    // Clear all tables
    await db.jobs.clear();
    await db.assessments.clear();
    await db.assessmentResponses.clear();

    console.log("All data cleared successfully!");
  } catch (error) {
    console.error("Error clearing database:", error);
    throw error;
  }
}
