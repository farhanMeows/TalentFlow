import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../store/store";
import {
  fetchJobs,
  setPage,
  setPageSize,
  setSearchFilter,
  setStatusFilter,
  setSort,
  createJob,
  updateJob,
  optimisticallyReorderJobs,
  reorderJobs,
} from "../store/features/jobs/jobsSlice";

import { Link } from "react-router-dom";

export default function JobsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { jobs, pagination, filters, status, error } = useSelector(
    (s: RootState) => s.jobs
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [editingJobId, setEditingJobId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchJobs());
  }, [
    dispatch,
    pagination.page,
    pagination.pageSize,
    filters.status,
    filters.search,
  ]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(pagination.totalCount / pagination.pageSize));
  }, [pagination.totalCount, pagination.pageSize]);

  function openCreateModal() {
    setEditingJobId(null);
    setTitle("");
    setSlug("");
    setTagsInput("");
    setFormError(null);
    setModalOpen(true);
  }

  function openEditModal(jobId: number) {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;
    setEditingJobId(jobId);
    setTitle(job.title);
    setSlug(job.slug);
    setTagsInput(job.tags.join(", "));
    setFormError(null);
    setModalOpen(true);
  }

  async function submitForm() {
    if (!title.trim()) {
      setFormError("Title is required");
      return;
    }
    const payload = {
      title: title.trim(),
      slug: slug.trim() || title.trim().toLowerCase().replace(/\s+/g, "-"),
      status: "active" as const,
      tags: tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };
    try {
      if (editingJobId == null) {
        await dispatch(createJob(payload)).unwrap();
      } else {
        await dispatch(
          updateJob({ id: editingJobId, updates: payload })
        ).unwrap();
      }
      setModalOpen(false);
      dispatch(fetchJobs());
    } catch (e: any) {
      setFormError(String(e));
    }
  }

  async function toggleArchive(jobId: number, current: "active" | "archived") {
    await dispatch(
      updateJob({
        id: jobId,
        updates: { status: current === "active" ? "archived" : "active" },
      })
    );
    dispatch(fetchJobs());
  }

  function onDragStart(e: React.DragEvent<HTMLDivElement>, index: number) {
    e.dataTransfer.setData("text/plain", String(index));
  }
  function onDrop(e: React.DragEvent<HTMLDivElement>, toIndex: number) {
    const fromIndex = Number(e.dataTransfer.getData("text/plain"));
    if (Number.isNaN(fromIndex) || fromIndex === toIndex) return;
    const moved = jobs[fromIndex];
    dispatch(optimisticallyReorderJobs({ fromIndex, toIndex }));
    dispatch(reorderJobs({ jobId: moved.id!, fromIndex, toIndex }))
      .unwrap()
      .catch(() => {
        dispatch(fetchJobs());
      });
  }
  function onDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  return (
    <div style={{ padding: 16 }}>
      <h1>Jobs</h1>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          value={filters.search}
          onChange={(e) => dispatch(setSearchFilter(e.target.value))}
          placeholder="Search title"
        />
        <select
          value={filters.status}
          onChange={(e) => dispatch(setStatusFilter(e.target.value as any))}
        >
          <option value="">All</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
        <select
          value={filters.sort}
          onChange={(e) => dispatch(setSort(e.target.value as any))}
        >
          <option value="orderAsc">Order ↑</option>
          <option value="orderDesc">Order ↓</option>
          <option value="createdAtAsc">Created ↑</option>
          <option value="createdAtDesc">Created ↓</option>
          <option value="titleAsc">Title A→Z</option>
          <option value="titleDesc">Title Z→A</option>
        </select>
        <button onClick={openCreateModal}>New Job</button>
      </div>

      {status === "loading" && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {jobs.map((job, idx) => (
          <div
            key={job.id}
            draggable
            onDragStart={(e) => onDragStart(e, idx)}
            onDragOver={onDragOver}
            onDrop={(e) => onDrop(e, idx)}
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <Link to={`/jobs/${job.id}`}>{job.title}</Link>
              <small>slug: {job.slug}</small>
              <small>status: {job.status}</small>
              {job.tags.length > 0 && (
                <small>tags: {job.tags.join(", ")}</small>
              )}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => openEditModal(job.id!)}>Edit</button>
              <button onClick={() => toggleArchive(job.id!, job.status)}>
                {job.status === "active" ? "Archive" : "Unarchive"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center" }}
      >
        <button
          onClick={() => dispatch(setPage(Math.max(1, pagination.page - 1)))}
          disabled={pagination.page === 1}
        >
          Prev
        </button>
        <span>
          Page {pagination.page} / {totalPages}
        </span>
        <button
          onClick={() =>
            dispatch(setPage(Math.min(totalPages, pagination.page + 1)))
          }
          disabled={pagination.page >= totalPages}
        >
          Next
        </button>
        <select
          value={pagination.pageSize}
          onChange={(e) => dispatch(setPageSize(Number(e.target.value)))}
        >
          {[5, 10, 20].map((n) => (
            <option key={n} value={n}>
              {n} / page
            </option>
          ))}
        </select>
        <span>total: {pagination.totalCount}</span>
      </div>

      {modalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setModalOpen(false)}
        >
          <div
            style={{
              background: "white",
              padding: 16,
              borderRadius: 8,
              minWidth: 360,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>{editingJobId == null ? "Create Job" : "Edit Job"}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label>
                Title
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </label>
              <label>
                Slug
                <input value={slug} onChange={(e) => setSlug(e.target.value)} />
              </label>
              <label>
                Tags (comma separated)
                <input
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                />
              </label>
              {formError && <p style={{ color: "red" }}>{formError}</p>}
              <div
                style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}
              >
                <button onClick={() => setModalOpen(false)}>Cancel</button>
                <button onClick={submitForm}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
