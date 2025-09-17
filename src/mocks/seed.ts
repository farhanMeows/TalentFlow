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
  const assessmentCount = await db.assessments.count();

  if (jobCount > 0 && assessmentCount > 0) {
    console.log("database already seeded.");
    return;
  }

  console.log("seeding database with initial data...");

  // Seed jobs if not already present
  if (jobCount === 0) {
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
    console.log("Jobs seeded successfully!");
  }

  // Get the first 3 job IDs for assessments
  const firstThreeJobs = await db.jobs.orderBy("id").limit(3).toArray();
  const jobIds = firstThreeJobs.map((job) => job.id!);

  // Seed comprehensive assessments for the first 3 jobs
  const assessments: Assessment[] = [
    {
      jobId: jobIds[0],
      sections: [
        {
          id: "section-1",
          title: "Personal Information",
          questions: [
            {
              id: "q1",
              type: "short_text",
              title: "Full Name",
              required: true,
              maxLength: 100,
            },
            {
              id: "q2",
              type: "short_text",
              title: "Email Address",
              required: true,
              maxLength: 255,
            },
            {
              id: "q3",
              type: "short_text",
              title: "Phone Number",
              required: true,
              maxLength: 20,
            },
            {
              id: "q4",
              type: "single_choice",
              title: "Years of Professional Experience",
              required: true,
              options: [
                "0-1 years",
                "2-3 years",
                "4-5 years",
                "6-10 years",
                "10+ years",
              ],
            },
            {
              id: "q5",
              type: "single_choice",
              title: "Current Employment Status",
              required: true,
              options: [
                "Employed",
                "Unemployed",
                "Freelancer",
                "Student",
                "Other",
              ],
            },
          ],
        },
        {
          id: "section-2",
          title: "Technical Skills",
          questions: [
            {
              id: "q6",
              type: "multi_choice",
              title: "Programming Languages (Select all that apply)",
              required: true,
              options: [
                "JavaScript",
                "TypeScript",
                "Python",
                "Java",
                "C#",
                "Go",
                "Rust",
                "PHP",
                "Ruby",
                "Swift",
              ],
            },
            {
              id: "q7",
              type: "multi_choice",
              title: "Frameworks & Libraries",
              required: true,
              options: [
                "React",
                "Vue.js",
                "Angular",
                "Node.js",
                "Express",
                "Django",
                "Spring",
                "Laravel",
                "Next.js",
                "Nuxt.js",
              ],
            },
            {
              id: "q8",
              type: "single_choice",
              title: "Database Experience",
              required: true,
              options: [
                "MySQL",
                "PostgreSQL",
                "MongoDB",
                "Redis",
                "SQLite",
                "Oracle",
                "SQL Server",
              ],
            },
            {
              id: "q9",
              type: "multi_choice",
              title: "Cloud Platforms",
              required: true,
              options: [
                "AWS",
                "Google Cloud",
                "Azure",
                "DigitalOcean",
                "Heroku",
                "Vercel",
                "Netlify",
              ],
            },
            {
              id: "q10",
              type: "numeric",
              title: "Rate your problem-solving skills (1-10)",
              required: true,
              min: 1,
              max: 10,
            },
            {
              id: "q11",
              type: "long_text",
              title:
                "Describe a challenging technical problem you solved recently",
              required: true,
              maxLength: 1000,
            },
          ],
        },
        {
          id: "section-3",
          title: "Experience & Projects",
          questions: [
            {
              id: "q12",
              type: "long_text",
              title:
                "Describe your most significant project and your role in it",
              required: true,
              maxLength: 1500,
            },
            {
              id: "q13",
              type: "single_choice",
              title: "Team Size Preference",
              required: true,
              options: [
                "Solo work",
                "2-5 people",
                "6-10 people",
                "10+ people",
                "No preference",
              ],
            },
            {
              id: "q14",
              type: "file",
              title: "Upload your resume/CV",
              required: true,
            },
          ],
        },
      ],
      updatedAt: new Date(),
    },
    {
      jobId: jobIds[1],
      sections: [
        {
          id: "section-1",
          title: "Background Information",
          questions: [
            {
              id: "q1",
              type: "short_text",
              title: "Full Name",
              required: true,
              maxLength: 100,
            },
            {
              id: "q2",
              type: "short_text",
              title: "Email Address",
              required: true,
              maxLength: 255,
            },
            {
              id: "q3",
              type: "single_choice",
              title: "Education Level",
              required: true,
              options: [
                "High School",
                "Associate Degree",
                "Bachelor's Degree",
                "Master's Degree",
                "PhD",
                "Other",
              ],
            },
            {
              id: "q4",
              type: "single_choice",
              title: "Years of Experience in DevOps",
              required: true,
              options: [
                "0-1 years",
                "2-3 years",
                "4-5 years",
                "6-10 years",
                "10+ years",
              ],
            },
            {
              id: "q5",
              type: "single_choice",
              title: "Are you familiar with containerization?",
              required: true,
              options: ["Yes", "No"],
            },
            {
              id: "q6",
              type: "multi_choice",
              title: "Container Technologies (Select all that apply)",
              required: false,
              options: [
                "Docker",
                "Kubernetes",
                "Podman",
                "OpenShift",
                "Docker Swarm",
              ],
              visibleIf: {
                questionId: "q5",
                operator: "eq",
                value: "Yes",
              },
            },
          ],
        },
        {
          id: "section-2",
          title: "Technical Expertise",
          questions: [
            {
              id: "q7",
              type: "multi_choice",
              title: "CI/CD Tools Experience",
              required: true,
              options: [
                "Jenkins",
                "GitLab CI",
                "GitHub Actions",
                "Azure DevOps",
                "CircleCI",
                "Travis CI",
                "Bamboo",
              ],
            },
            {
              id: "q8",
              type: "multi_choice",
              title: "Infrastructure as Code Tools",
              required: true,
              options: [
                "Terraform",
                "Ansible",
                "Chef",
                "Puppet",
                "CloudFormation",
                "Pulumi",
              ],
            },
            {
              id: "q9",
              type: "single_choice",
              title: "Monitoring & Logging Experience",
              required: true,
              options: [
                "Prometheus",
                "Grafana",
                "ELK Stack",
                "Datadog",
                "New Relic",
                "Splunk",
              ],
            },
            {
              id: "q10",
              type: "numeric",
              title: "Rate your Linux/Unix administration skills (1-10)",
              required: true,
              min: 1,
              max: 10,
            },
            {
              id: "q11",
              type: "long_text",
              title:
                "Describe your experience with cloud infrastructure management",
              required: true,
              maxLength: 1000,
            },
            {
              id: "q12",
              type: "single_choice",
              title: "Security Best Practices Knowledge",
              required: true,
              options: ["Beginner", "Intermediate", "Advanced", "Expert"],
            },
          ],
        },
        {
          id: "section-3",
          title: "Scenario-Based Questions",
          questions: [
            {
              id: "q13",
              type: "long_text",
              title: "How would you handle a production outage at 2 AM?",
              required: true,
              maxLength: 1000,
            },
            {
              id: "q14",
              type: "long_text",
              title:
                "Describe your approach to implementing zero-downtime deployments",
              required: true,
              maxLength: 1000,
            },
            {
              id: "q15",
              type: "file",
              title: "Upload any relevant certifications",
              required: false,
            },
          ],
        },
      ],
      updatedAt: new Date(),
    },
    {
      jobId: jobIds[2],
      sections: [
        {
          id: "section-1",
          title: "Personal Details",
          questions: [
            {
              id: "q1",
              type: "short_text",
              title: "Full Name",
              required: true,
              maxLength: 100,
            },
            {
              id: "q2",
              type: "short_text",
              title: "Email Address",
              required: true,
              maxLength: 255,
            },
            {
              id: "q3",
              type: "single_choice",
              title: "Design Experience Level",
              required: true,
              options: [
                "Entry Level",
                "Mid Level",
                "Senior Level",
                "Lead/Principal",
              ],
            },
            {
              id: "q4",
              type: "single_choice",
              title: "Primary Design Focus",
              required: true,
              options: [
                "UI Design",
                "UX Design",
                "Both UI & UX",
                "Product Design",
                "Visual Design",
              ],
            },
            {
              id: "q5",
              type: "single_choice",
              title: "Years of Design Experience",
              required: true,
              options: [
                "0-1 years",
                "2-3 years",
                "4-5 years",
                "6-10 years",
                "10+ years",
              ],
            },
          ],
        },
        {
          id: "section-2",
          title: "Design Skills & Tools",
          questions: [
            {
              id: "q6",
              type: "multi_choice",
              title: "Design Tools (Select all that apply)",
              required: true,
              options: [
                "Figma",
                "Sketch",
                "Adobe XD",
                "InVision",
                "Principle",
                "Framer",
                "Adobe Creative Suite",
              ],
            },
            {
              id: "q7",
              type: "multi_choice",
              title: "Prototyping Tools",
              required: true,
              options: [
                "Figma",
                "Principle",
                "Framer",
                "Proto.io",
                "Marvel",
                "InVision",
                "Axure",
              ],
            },
            {
              id: "q8",
              type: "single_choice",
              title: "User Research Experience",
              required: true,
              options: ["None", "Basic", "Intermediate", "Advanced"],
            },
            {
              id: "q9",
              type: "multi_choice",
              title: "Research Methods (Select all that apply)",
              required: false,
              options: [
                "User Interviews",
                "Surveys",
                "Usability Testing",
                "A/B Testing",
                "Card Sorting",
                "Personas",
              ],
              visibleIf: {
                questionId: "q8",
                operator: "neq",
                value: "None",
              },
            },
            {
              id: "q10",
              type: "numeric",
              title: "Rate your visual design skills (1-10)",
              required: true,
              min: 1,
              max: 10,
            },
            {
              id: "q11",
              type: "numeric",
              title: "Rate your interaction design skills (1-10)",
              required: true,
              min: 1,
              max: 10,
            },
          ],
        },
        {
          id: "section-3",
          title: "Portfolio & Experience",
          questions: [
            {
              id: "q12",
              type: "long_text",
              title:
                "Describe your design process from research to final implementation",
              required: true,
              maxLength: 1500,
            },
            {
              id: "q13",
              type: "long_text",
              title:
                "Tell us about a project where you significantly improved user experience",
              required: true,
              maxLength: 1000,
            },
            {
              id: "q14",
              type: "single_choice",
              title: "Design System Experience",
              required: true,
              options: [
                "None",
                "Used existing systems",
                "Contributed to systems",
                "Created design systems",
              ],
            },
            {
              id: "q15",
              type: "file",
              title: "Upload your portfolio or design samples",
              required: true,
            },
            {
              id: "q16",
              type: "long_text",
              title: "What design trends do you find most exciting and why?",
              required: true,
              maxLength: 500,
            },
          ],
        },
      ],
      updatedAt: new Date(),
    },
  ];

  // Seed assessments if not already present
  if (assessmentCount === 0) {
    await db.assessments.bulkAdd(assessments);
    console.log("Assessments seeded successfully!");
  }

  console.log("Database seeding completed!");
}

// Function to seed only assessments (useful for adding assessments to existing jobs)
export async function seedAssessments() {
  const assessmentCount = await db.assessments.count();

  if (assessmentCount > 0) {
    console.log(
      "Assessments already exist. Use clearAllData() first if you want to reseed."
    );
    return;
  }

  console.log("Seeding assessments...");

  // Get the first 3 job IDs for assessments
  const firstThreeJobs = await db.jobs.orderBy("id").limit(3).toArray();
  const jobIds = firstThreeJobs.map((job) => job.id!);

  if (jobIds.length < 3) {
    console.log("Not enough jobs found. Please seed jobs first.");
    return;
  }

  const assessments: Assessment[] = [
    {
      jobId: jobIds[0],
      sections: [
        {
          id: "section-1",
          title: "Personal Information",
          questions: [
            {
              id: "q1",
              type: "short_text",
              title: "Full Name",
              required: true,
              maxLength: 100,
            },
            {
              id: "q2",
              type: "short_text",
              title: "Email Address",
              required: true,
              maxLength: 255,
            },
            {
              id: "q3",
              type: "short_text",
              title: "Phone Number",
              required: true,
              maxLength: 20,
            },
            {
              id: "q4",
              type: "single_choice",
              title: "Years of Professional Experience",
              required: true,
              options: [
                "0-1 years",
                "2-3 years",
                "4-5 years",
                "6-10 years",
                "10+ years",
              ],
            },
            {
              id: "q5",
              type: "single_choice",
              title: "Current Employment Status",
              required: true,
              options: [
                "Employed",
                "Unemployed",
                "Freelancer",
                "Student",
                "Other",
              ],
            },
          ],
        },
        {
          id: "section-2",
          title: "Technical Skills",
          questions: [
            {
              id: "q6",
              type: "multi_choice",
              title: "Programming Languages (Select all that apply)",
              required: true,
              options: [
                "JavaScript",
                "TypeScript",
                "Python",
                "Java",
                "C#",
                "Go",
                "Rust",
                "PHP",
                "Ruby",
                "Swift",
              ],
            },
            {
              id: "q7",
              type: "multi_choice",
              title: "Frameworks & Libraries",
              required: true,
              options: [
                "React",
                "Vue.js",
                "Angular",
                "Node.js",
                "Express",
                "Django",
                "Spring",
                "Laravel",
                "Next.js",
                "Nuxt.js",
              ],
            },
            {
              id: "q8",
              type: "single_choice",
              title: "Database Experience",
              required: true,
              options: [
                "MySQL",
                "PostgreSQL",
                "MongoDB",
                "Redis",
                "SQLite",
                "Oracle",
                "SQL Server",
              ],
            },
            {
              id: "q9",
              type: "multi_choice",
              title: "Cloud Platforms",
              required: true,
              options: [
                "AWS",
                "Google Cloud",
                "Azure",
                "DigitalOcean",
                "Heroku",
                "Vercel",
                "Netlify",
              ],
            },
            {
              id: "q10",
              type: "numeric",
              title: "Rate your problem-solving skills (1-10)",
              required: true,
              min: 1,
              max: 10,
            },
            {
              id: "q11",
              type: "long_text",
              title:
                "Describe a challenging technical problem you solved recently",
              required: true,
              maxLength: 1000,
            },
          ],
        },
        {
          id: "section-3",
          title: "Experience & Projects",
          questions: [
            {
              id: "q12",
              type: "long_text",
              title:
                "Describe your most significant project and your role in it",
              required: true,
              maxLength: 1500,
            },
            {
              id: "q13",
              type: "single_choice",
              title: "Team Size Preference",
              required: true,
              options: [
                "Solo work",
                "2-5 people",
                "6-10 people",
                "10+ people",
                "No preference",
              ],
            },
            {
              id: "q14",
              type: "file",
              title: "Upload your resume/CV",
              required: true,
            },
          ],
        },
      ],
      updatedAt: new Date(),
    },
    {
      jobId: jobIds[1],
      sections: [
        {
          id: "section-1",
          title: "Background Information",
          questions: [
            {
              id: "q1",
              type: "short_text",
              title: "Full Name",
              required: true,
              maxLength: 100,
            },
            {
              id: "q2",
              type: "short_text",
              title: "Email Address",
              required: true,
              maxLength: 255,
            },
            {
              id: "q3",
              type: "single_choice",
              title: "Education Level",
              required: true,
              options: [
                "High School",
                "Associate Degree",
                "Bachelor's Degree",
                "Master's Degree",
                "PhD",
                "Other",
              ],
            },
            {
              id: "q4",
              type: "single_choice",
              title: "Years of Experience in DevOps",
              required: true,
              options: [
                "0-1 years",
                "2-3 years",
                "4-5 years",
                "6-10 years",
                "10+ years",
              ],
            },
            {
              id: "q5",
              type: "single_choice",
              title: "Are you familiar with containerization?",
              required: true,
              options: ["Yes", "No"],
            },
            {
              id: "q6",
              type: "multi_choice",
              title: "Container Technologies (Select all that apply)",
              required: false,
              options: [
                "Docker",
                "Kubernetes",
                "Podman",
                "OpenShift",
                "Docker Swarm",
              ],
              visibleIf: {
                questionId: "q5",
                operator: "eq",
                value: "Yes",
              },
            },
          ],
        },
        {
          id: "section-2",
          title: "Technical Expertise",
          questions: [
            {
              id: "q7",
              type: "multi_choice",
              title: "CI/CD Tools Experience",
              required: true,
              options: [
                "Jenkins",
                "GitLab CI",
                "GitHub Actions",
                "Azure DevOps",
                "CircleCI",
                "Travis CI",
                "Bamboo",
              ],
            },
            {
              id: "q8",
              type: "multi_choice",
              title: "Infrastructure as Code Tools",
              required: true,
              options: [
                "Terraform",
                "Ansible",
                "Chef",
                "Puppet",
                "CloudFormation",
                "Pulumi",
              ],
            },
            {
              id: "q9",
              type: "single_choice",
              title: "Monitoring & Logging Experience",
              required: true,
              options: [
                "Prometheus",
                "Grafana",
                "ELK Stack",
                "Datadog",
                "New Relic",
                "Splunk",
              ],
            },
            {
              id: "q10",
              type: "numeric",
              title: "Rate your Linux/Unix administration skills (1-10)",
              required: true,
              min: 1,
              max: 10,
            },
            {
              id: "q11",
              type: "long_text",
              title:
                "Describe your experience with cloud infrastructure management",
              required: true,
              maxLength: 1000,
            },
            {
              id: "q12",
              type: "single_choice",
              title: "Security Best Practices Knowledge",
              required: true,
              options: ["Beginner", "Intermediate", "Advanced", "Expert"],
            },
          ],
        },
        {
          id: "section-3",
          title: "Scenario-Based Questions",
          questions: [
            {
              id: "q13",
              type: "long_text",
              title: "How would you handle a production outage at 2 AM?",
              required: true,
              maxLength: 1000,
            },
            {
              id: "q14",
              type: "long_text",
              title:
                "Describe your approach to implementing zero-downtime deployments",
              required: true,
              maxLength: 1000,
            },
            {
              id: "q15",
              type: "file",
              title: "Upload any relevant certifications",
              required: false,
            },
          ],
        },
      ],
      updatedAt: new Date(),
    },
    {
      jobId: jobIds[2],
      sections: [
        {
          id: "section-1",
          title: "Personal Details",
          questions: [
            {
              id: "q1",
              type: "short_text",
              title: "Full Name",
              required: true,
              maxLength: 100,
            },
            {
              id: "q2",
              type: "short_text",
              title: "Email Address",
              required: true,
              maxLength: 255,
            },
            {
              id: "q3",
              type: "single_choice",
              title: "Design Experience Level",
              required: true,
              options: [
                "Entry Level",
                "Mid Level",
                "Senior Level",
                "Lead/Principal",
              ],
            },
            {
              id: "q4",
              type: "single_choice",
              title: "Primary Design Focus",
              required: true,
              options: [
                "UI Design",
                "UX Design",
                "Both UI & UX",
                "Product Design",
                "Visual Design",
              ],
            },
            {
              id: "q5",
              type: "single_choice",
              title: "Years of Design Experience",
              required: true,
              options: [
                "0-1 years",
                "2-3 years",
                "4-5 years",
                "6-10 years",
                "10+ years",
              ],
            },
          ],
        },
        {
          id: "section-2",
          title: "Design Skills & Tools",
          questions: [
            {
              id: "q6",
              type: "multi_choice",
              title: "Design Tools (Select all that apply)",
              required: true,
              options: [
                "Figma",
                "Sketch",
                "Adobe XD",
                "InVision",
                "Principle",
                "Framer",
                "Adobe Creative Suite",
              ],
            },
            {
              id: "q7",
              type: "multi_choice",
              title: "Prototyping Tools",
              required: true,
              options: [
                "Figma",
                "Principle",
                "Framer",
                "Proto.io",
                "Marvel",
                "InVision",
                "Axure",
              ],
            },
            {
              id: "q8",
              type: "single_choice",
              title: "User Research Experience",
              required: true,
              options: ["None", "Basic", "Intermediate", "Advanced"],
            },
            {
              id: "q9",
              type: "multi_choice",
              title: "Research Methods (Select all that apply)",
              required: false,
              options: [
                "User Interviews",
                "Surveys",
                "Usability Testing",
                "A/B Testing",
                "Card Sorting",
                "Personas",
              ],
              visibleIf: {
                questionId: "q8",
                operator: "neq",
                value: "None",
              },
            },
            {
              id: "q10",
              type: "numeric",
              title: "Rate your visual design skills (1-10)",
              required: true,
              min: 1,
              max: 10,
            },
            {
              id: "q11",
              type: "numeric",
              title: "Rate your interaction design skills (1-10)",
              required: true,
              min: 1,
              max: 10,
            },
          ],
        },
        {
          id: "section-3",
          title: "Portfolio & Experience",
          questions: [
            {
              id: "q12",
              type: "long_text",
              title:
                "Describe your design process from research to final implementation",
              required: true,
              maxLength: 1500,
            },
            {
              id: "q13",
              type: "long_text",
              title:
                "Tell us about a project where you significantly improved user experience",
              required: true,
              maxLength: 1000,
            },
            {
              id: "q14",
              type: "single_choice",
              title: "Design System Experience",
              required: true,
              options: [
                "None",
                "Used existing systems",
                "Contributed to systems",
                "Created design systems",
              ],
            },
            {
              id: "q15",
              type: "file",
              title: "Upload your portfolio or design samples",
              required: true,
            },
            {
              id: "q16",
              type: "long_text",
              title: "What design trends do you find most exciting and why?",
              required: true,
              maxLength: 500,
            },
          ],
        },
      ],
      updatedAt: new Date(),
    },
  ];

  await db.assessments.bulkAdd(assessments);
  console.log("3 comprehensive assessments seeded successfully!");
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
