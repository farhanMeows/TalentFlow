export const PREDEFINED_TAGS = {
  "By Role & Specialty": ["Frontend", "Backend", "Full Stack", "DevOps"],
  "By Key Technologies & Languages": [
    "JavaScript",
    "TypeScript",
    "Python",
    "Java",
    "Go",
    "Rust",
  ],
  "By Work Style & Location": ["Remote", "Hybrid", "On-site"],
  "By Experience Level": ["Internship", "Junior", "Mid-level", "Senior"],
} as const;

export const ALL_TAGS: string[] = Object.values(PREDEFINED_TAGS).flat();
