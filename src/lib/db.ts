import Dexie, { type Table } from "dexie";

export interface Job {
  id?: number;
  title: string;
  slug: string;
  status: "active" | "archived";
  tags: string[];
  order: number;
  createdAt: Date;
}

export type QuestionType =
  | "single_choice"
  | "multi_choice"
  | "short_text"
  | "long_text"
  | "numeric"
  | "file"; // stub only

export interface AssessmentQuestion {
  id: string; // uuid
  type: QuestionType;
  title: string;
  required?: boolean;
  // for choice questions
  options?: string[];
  // for numeric
  min?: number;
  max?: number;
  // validation
  maxLength?: number;
  // conditional visibility
  visibleIf?: {
    questionId: string;
    operator: "eq" | "neq" | "includes" | "excludes";
    value: string | number | boolean;
  };
}

export interface AssessmentSection {
  id: string; // uuid
  title: string;
  questions: AssessmentQuestion[];
}

export interface Assessment {
  id?: number;
  jobId: number;
  sections: AssessmentSection[];
  updatedAt: Date;
}

export interface AssessmentResponse {
  id?: number;
  jobId: number;
  // store flat answers keyed by questionId
  answers: Record<string, unknown>;
  createdAt: Date;
}

export class MySubClassedDexie extends Dexie {
  jobs!: Table<Job>;
  assessments!: Table<Assessment>;
  assessmentResponses!: Table<AssessmentResponse>;

  constructor() {
    super("talentFlowDB");
    this.version(2)
      .stores({
        jobs: "++id, &slug, title, status, order, *tags",
        assessments: "++id, jobId, updatedAt",
        assessmentResponses: "++id, jobId, createdAt",
      })
      .upgrade(async (tx) => {
        // if coming from v1, just ensure tables exist; nothing to migrate for now
        await tx.table("assessments");
        await tx.table("assessmentResponses");
      });
  }
}

export const db = new MySubClassedDexie();
