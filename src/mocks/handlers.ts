// src/mocks/handlers.ts
import { http, HttpResponse, delay } from "msw";
import { db } from "../lib/db";

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
    await delay(800);
    return HttpResponse.json({ ...newJob, id }, { status: 201 });
  }),

  // 3. Update a Job (for editing or archiving) [cite: 11, 31]
  http.patch("/jobs/:id", async ({ request, params }) => {
    const { id } = params;
    const updates = (await request.json()) as any;
    const updatedCount = await db.jobs.update(Number(id), updates);

    if (updatedCount === 0) {
      return new HttpResponse("Job not found", { status: 404 });
    }

    await delay(600);
    const updatedJob = await db.jobs.get(Number(id));
    return HttpResponse.json(updatedJob);
  }),

  // 3b. Delete a Job and normalize order
  http.delete("/jobs/:id", async ({ params }) => {
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
    await delay(400);
    return HttpResponse.json({ success: true });
  }),

  // 4. Reorder Jobs [cite: 11, 32]
  http.patch("/jobs/:id/reorder", async ({ request, params }) => {
    // Simulate a failure 10% of the time to test rollback
    if (Math.random() < 0.1) {
      await delay(1200);
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
    let targetIndex = allJobs.findIndex((j) => j.order === toOrder);
    if (targetIndex === -1) targetIndex = allJobs.length; // move to end if not found
    allJobs.splice(targetIndex, 0, movedJob);

    // Reassign order 0..n-1
    for (let i = 0; i < allJobs.length; i++) {
      allJobs[i].order = i;
    }
    await db.jobs.bulkPut(allJobs);

    await delay(500);
    return HttpResponse.json({ message: "Reorder successful" });
  }),
];
