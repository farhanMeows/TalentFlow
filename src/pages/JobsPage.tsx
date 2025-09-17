import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../store/store";
import {
  fetchJobs,
  setPage,
  setPageSize,
  setSearchFilter,
  setStatusFilter,
  setTagsFilter,
  createJob,
  updateJob,
  optimisticallyReorderJobs,
  reorderJobs,
} from "../store/features/jobs/jobsSlice";

import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import { Card } from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import TagGroupPicker from "../components/ui/TagPicker";
import { PREDEFINED_TAGS } from "../constants/tags";

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
    // refetch when tags change
    filters.tags,
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Jobs</h1>
        <Button onClick={openCreateModal}>New Job</Button>
      </div>
      <div className="mb-6 flex flex-col gap-3">
        <Input
          value={filters.search}
          onChange={(e) => dispatch(setSearchFilter(e.target.value))}
          placeholder="Search title"
          aria-label="Search title"
        />
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={filters.status}
            onChange={(e) => dispatch(setStatusFilter(e.target.value as any))}
            aria-label="Status filter"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </Select>
          <div className="text-sm text-slate-600">Filter by tags:</div>
          <TagGroupPicker
            groups={PREDEFINED_TAGS}
            selected={filters.tags}
            onChange={(tags) => dispatch(setTagsFilter(tags))}
            size="sm"
          />
        </div>
      </div>

      {status === "loading" && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className="grid gap-3">
        {jobs.map((job, idx) => (
          <Card
            key={job.id}
            draggable
            onDragStart={(e: React.DragEvent<HTMLDivElement>) =>
              onDragStart(e, idx)
            }
            onDragOver={(e: React.DragEvent<HTMLDivElement>) => onDragOver(e)}
            onDrop={(e: React.DragEvent<HTMLDivElement>) => onDrop(e, idx)}
            className="flex items-center justify-between gap-3"
          >
            <div className="flex flex-col">
              <Link
                to={`/jobs/${job.id}`}
                className="text-base font-semibold text-slate-900 hover:text-indigo-700"
              >
                {job.title}
              </Link>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="rounded bg-slate-100 px-2 py-0.5">
                  slug: {job.slug}
                </span>
                <span
                  className={
                    "rounded px-2 py-0.5 " +
                    (job.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-200 text-slate-700")
                  }
                >
                  {job.status}
                </span>
                {job.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded bg-indigo-50 px-2 py-0.5 text-indigo-700"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => openEditModal(job.id!)}
              >
                Edit
              </Button>
              <Button
                variant="primary"
                onClick={() => toggleArchive(job.id!, job.status)}
              >
                {job.status === "active" ? "Archive" : "Unarchive"}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button
          variant="secondary"
          onClick={() => dispatch(setPage(Math.max(1, pagination.page - 1)))}
          disabled={pagination.page === 1}
        >
          Prev
        </Button>
        <span className="text-sm text-slate-600">
          Page {pagination.page} / {totalPages}
        </span>
        <Button
          variant="secondary"
          onClick={() =>
            dispatch(setPage(Math.min(totalPages, pagination.page + 1)))
          }
          disabled={pagination.page >= totalPages}
        >
          Next
        </Button>
        <Select
          value={pagination.pageSize}
          onChange={(e) => dispatch(setPageSize(Number(e.target.value)))}
        >
          {[5, 10, 20].map((n) => (
            <option key={n} value={n}>
              {n} / page
            </option>
          ))}
        </Select>
        <span className="text-sm text-slate-600">
          total: {pagination.totalCount}
        </span>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingJobId == null ? "Create Job" : "Edit Job"}
      >
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-slate-700">
            Title
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Slug
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
          </label>
          <div className="text-sm font-medium text-slate-700">Tags</div>
          <TagGroupPicker
            groups={PREDEFINED_TAGS}
            selected={tagsInput
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)}
            onChange={(tags) => setTagsInput(tags.join(", "))}
          />
          {formError && <p className="text-sm text-red-600">{formError}</p>}
          <div className="mt-2 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitForm}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
