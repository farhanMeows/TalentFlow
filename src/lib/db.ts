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

export class MySubClassedDexie extends Dexie {
  jobs!: Table<Job>;

  constructor() {
    super("talentFlowDB");
    this.version(1).stores({
      jobs: "++id, &slug, title, status, order, *tags",
    });
  }
}

export const db = new MySubClassedDexie();
