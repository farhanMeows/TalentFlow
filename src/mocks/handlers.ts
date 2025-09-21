// src/mocks/handlers.ts
import { http, HttpResponse, delay } from "msw";
import { db, type CandidateStage } from "../lib/db";

export const handlers = [
  // 1. Get Jobs with Pagination & Filtering [cite: 9, 29]
  http.get("/jobs", async ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = parseInt(url.searchParams.get("pageSize") || "10");
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search");
    const tagsParam = url.searchParams.get("tags");
    const filterTags = (tagsParam || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    // Base ordering
    let query = db.jobs.orderBy("order");

    if (status) {
      query = query.filter((job) => job.status === status);
    }
    if (search) {
      query = query.filter((job) =>
        job.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (filterTags.length > 0) {
      query = query.filter((job) => {
        const jobTagsLower = job.tags.map((x) => x.toLowerCase());
        return filterTags.every((t) => jobTagsLower.includes(t.toLowerCase()));
      });
    }

    const totalCount = await query.count();
    const jobs = await query
      .offset((page - 1) * pageSize)
      .limit(pageSize)
      .toArray();

    await delay(500); // Artificial latency

    return HttpResponse.json({
      data: jobs,
      pagination: { page, pageSize, totalCount },
    });
  }),

  // 2. Create a new Job [cite: 10, 30]
  http.post("/jobs", async ({ request }) => {
    // 5–10% error rate
    if (Math.random() < 0.08) {
      await delay(400);
      return new HttpResponse("Random failure creating job", { status: 500 });
    }
    const newJobData = (await request.json()) as any;

    // Basic validation
    if (!newJobData.title) {
      return new HttpResponse("Title is required", { status: 400 });
    }

    const allJobs = await db.jobs.orderBy("order").toArray();

    // 2. Increment the order of every existing job by 1
    const updatedJobs = allJobs.map((job) => ({
      ...job,
      order: job.order + 1,
    }));

    // 3. Save the updated jobs back to the database
    if (updatedJobs.length > 0) {
      await db.jobs.bulkPut(updatedJobs);
    }

    const newJob = {
      ...newJobData,
      createdAt: new Date(),
      order: 0, // Add to the end
    };

    const id = await db.jobs.add(newJob);
    // artificial latency
    await delay(200 + Math.random() * 1000);
    return HttpResponse.json({ ...newJob, id }, { status: 201 });
  }),

  // 3. Update a Job (for editing or archiving) [cite: 11, 31]
  http.patch("/jobs/:id", async ({ request, params }) => {
    if (Math.random() < 0.08) {
      await delay(300);
      return new HttpResponse("Random failure updating job", { status: 500 });
    }
    const { id } = params;
    const updates = (await request.json()) as any;
    const updatedCount = await db.jobs.update(Number(id), updates);

    if (updatedCount === 0) {
      return new HttpResponse("Job not found", { status: 404 });
    }

    await delay(200 + Math.random() * 1000);
    const updatedJob = await db.jobs.get(Number(id));
    return HttpResponse.json(updatedJob);
  }),

  // 3b. Delete a Job and normalize order
  http.delete("/jobs/:id", async ({ params }) => {
    if (Math.random() < 0.08) {
      await delay(300);
      return new HttpResponse("Random failure deleting job", { status: 500 });
    }
    const { id } = params;
    const numericId = Number(id);
    const exists = await db.jobs.get(numericId);
    if (!exists) {
      return new HttpResponse("Job not found", { status: 404 });
    }
    await db.jobs.delete(numericId);
    // Normalize order after deletion
    const remaining = (await db.jobs.orderBy("order").toArray()).map(
      (j, idx) => ({ ...j, order: idx })
    );
    if (remaining.length > 0) {
      await db.jobs.bulkPut(remaining);
    }
    await delay(200 + Math.random() * 1000);
    return HttpResponse.json({ success: true });
  }),

  // 4. Reorder Jobs [cite: 11, 32]
  http.patch("/jobs/:id/reorder", async ({ request, params }) => {
    // Simulate a failure 10% of the time to test rollback
    if (Math.random() < 0.1) {
      await delay(200 + Math.random() * 1000);
      return new HttpResponse("Server error: Could not reorder jobs", {
        status: 500,
      });
    }

    const { id } = params;
    const body = (await request.json()) as any;
    const fromOrder = Number(body?.fromOrder);
    const toOrder = Number(body?.toOrder);
    if (!Number.isFinite(fromOrder) || !Number.isFinite(toOrder)) {
      return new HttpResponse("Invalid payload", { status: 400 });
    }

    // Fetch all, reorder, and persist new sequential order values
    const allJobs = await db.jobs.orderBy("order").toArray();
    const idx = allJobs.findIndex((j) => j.id === Number(id));
    if (idx === -1) {
      return new HttpResponse("Job not found", { status: 404 });
    }

    // Sanity: ensure fromOrder matches current job order; if not, still proceed
    const movedJob = allJobs.splice(idx, 1)[0];
    // Find target index by toOrder among remaining list
    // let targetIndex = allJobs.findIndex((j) => j.order === toOrder);
    let targetIndex = toOrder;
    if (targetIndex === -1) targetIndex = allJobs.length; // move to end if not found
    allJobs.splice(targetIndex, 0, movedJob);

    // Reassign order 0..n-1
    for (let i = 0; i < allJobs.length; i++) {
      allJobs[i].order = i;
    }
    await db.jobs.bulkPut(allJobs);

    await delay(200 + Math.random() * 1000);
    return HttpResponse.json({ message: "Reorder successful" });
  }),

  // Assessments
  http.get("/assessments/:jobId", async ({ params }) => {
    const jobId = Number(params.jobId);
    const found = await db.assessments.where("jobId").equals(jobId).first();
    await delay(300);
    if (!found) {
      return HttpResponse.json({ jobId, sections: [], updatedAt: new Date() });
    }
    return HttpResponse.json(found);
  }),

  http.put("/assessments/:jobId", async ({ params, request }) => {
    if (Math.random() < 0.08) {
      await delay(300);
      return new HttpResponse("Random failure saving assessment", {
        status: 500,
      });
    }
    const jobId = Number(params.jobId);
    const payload = (await request.json()) as any;
    const record = {
      jobId,
      sections: payload.sections || [],
      updatedAt: new Date(),
    };
    const existing = await db.assessments.where("jobId").equals(jobId).first();
    if (existing?.id) {
      await db.assessments.update(existing.id, record);
    } else {
      await db.assessments.add(record);
    }
    await delay(200 + Math.random() * 1000);
    const saved = await db.assessments.where("jobId").equals(jobId).first();
    return HttpResponse.json(saved);
  }),

  http.post("/assessments/:jobId/submit", async ({ params, request }) => {
    if (Math.random() < 0.08) {
      await delay(300);
      return new HttpResponse("Random failure submitting assessment", {
        status: 500,
      });
    }
    const jobId = Number(params.jobId);
    const answers = (await request.json()) as any;
    const response = {
      jobId,
      answers,
      createdAt: new Date(),
    };
    const id = await db.assessmentResponses.add(response);
    await delay(200 + Math.random() * 1000);
    return HttpResponse.json({ id, ...response }, { status: 201 });
  }),

  // Candidates APIs
  // GET /candidates?search=&stage=&page=
  http.get("/candidates", async ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const pageSize = parseInt(url.searchParams.get("pageSize") || "10");
    const search = url.searchParams.get("search")?.toLowerCase() || "";
    const stage = url.searchParams.get("stage") as CandidateStage | null;
    const jobIdParam = url.searchParams.get("jobId");
    const jobId = jobIdParam ? Number(jobIdParam) : null;

    let query = db.candidates.orderBy("createdAt").reverse();

    if (search) {
      query = query.filter(
        (c) =>
          c.name.toLowerCase().includes(search) ||
          c.email.toLowerCase().includes(search)
      );
    }
    if (stage) {
      query = query.filter((c) => c.stage === stage);
    }
    if (jobId !== null && Number.isFinite(jobId)) {
      query = query.filter((c) => c.jobId === jobId);
    }

    const totalCount = await query.count();
    const results = await query
      .offset((page - 1) * pageSize)
      .limit(pageSize)
      .toArray();

    await delay(300);
    return HttpResponse.json({
      data: results,
      pagination: { page, pageSize, totalCount },
    });
  }),

  // POST /candidates
  http.post("/candidates", async ({ request }) => {
    if (Math.random() < 0.08) {
      await delay(300);
      return new HttpResponse("Random failure creating candidate", {
        status: 500,
      });
    }
    const payload = (await request.json()) as any;
    if (!payload?.name || !payload?.email) {
      return new HttpResponse("name and email are required", { status: 400 });
    }
    const newCandidate = {
      name: payload.name,
      email: payload.email,
      stage: (payload.stage as CandidateStage) || "applied",
      createdAt: new Date(),
    };
    const id = await db.candidates.add(newCandidate);
    // timeline: created
    await db.candidateTimelines.add({
      candidateId: id,
      timestamp: new Date(),
      type: "created",
      payload: {},
    });
    await delay(200 + Math.random() * 1000);
    return HttpResponse.json({ id, ...newCandidate }, { status: 201 });
  }),

  // PATCH /candidates/:id (stage transitions or partial updates)
  http.patch("/candidates/:id", async ({ params, request }) => {
    // simulate occasional failure to test optimistic rollback
    if (Math.random() < 0.1) {
      await delay(200 + Math.random() * 1000);
      return new HttpResponse("Random failure", { status: 500 });
    }
    const { id } = params;
    const numericId = Number(id);
    const updates = (await request.json()) as any;
    const exists = await db.candidates.get(numericId);
    if (!exists) {
      return new HttpResponse("Candidate not found", { status: 404 });
    }
    await db.candidates.update(numericId, updates);
    if (updates.stage && updates.stage !== exists.stage) {
      await db.candidateTimelines.add({
        candidateId: numericId,
        timestamp: new Date(),
        type: "stage_change",
        payload: { from: exists.stage, to: updates.stage },
      });
    }
    const updated = await db.candidates.get(numericId);
    await delay(200 + Math.random() * 1000);
    return HttpResponse.json(updated);
  }),

  // GET /candidates/:id/timeline
  http.get("/candidates/:id/timeline", async ({ params }) => {
    const { id } = params;
    const numericId = Number(id);
    const exists = await db.candidates.get(numericId);
    if (!exists) {
      return new HttpResponse("Candidate not found", { status: 404 });
    }
    const events = await db.candidateTimelines
      .where("candidateId")
      .equals(numericId)
      .sortBy("timestamp");
    await delay(200);
    return HttpResponse.json({ candidateId: numericId, events });
  }),

  // POST /candidates/:id/timeline (add note)
  http.post("/candidates/:id/timeline", async ({ params, request }) => {
    if (Math.random() < 0.08) {
      await delay(200 + Math.random() * 1000);
      return new HttpResponse("Random failure adding note", { status: 500 });
    }
    const { id } = params;
    const numericId = Number(id);
    const exists = await db.candidates.get(numericId);
    if (!exists) {
      return new HttpResponse("Candidate not found", { status: 404 });
    }
    const payload = (await request.json()) as any;
    const entry = {
      candidateId: numericId,
      timestamp: new Date(),
      type: "note" as const,
      payload: { text: payload?.text || "" },
    };
    const entryId = await db.candidateTimelines.add(entry);
    await delay(200 + Math.random() * 1000);
    return HttpResponse.json({ id: entryId, ...entry }, { status: 201 });
  }),

  // GET /candidates/:id
  http.get("/candidates/:id", async ({ params }) => {
    const { id } = params;
    const numericId = Number(id);
    const found = await db.candidates.get(numericId);
    await delay(200);
    if (!found) return new HttpResponse("Not found", { status: 404 });
    return HttpResponse.json(found);
  }),
];
