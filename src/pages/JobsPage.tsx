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
  deleteJob,
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
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchJobs());
  }, [
    dispatch,
    pagination.page,
    pagination.pageSize,
    filters.status,
    filters.search,
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
    <div className="space-y-6 text-[#e1e1e1]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Jobs</h1>
        <Button
          className="shadow-md shadow-[#bb85fb]/20"
          onClick={openCreateModal}
        >
          New Job
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 rounded-lg bg-[#1e1e1e] p-4 shadow-sm border border-[rgba(255,255,255,0.02)]">
        <Input
          value={filters.search}
          onChange={(e) => dispatch(setSearchFilter(e.target.value))}
          placeholder="Search title"
          aria-label="Search title"
          className="bg-[#121212] text-[#e1e1e1] placeholder-[#a0a0a0] border-[rgba(255,255,255,0.03)]"
        />
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={filters.status}
            onChange={(e) => dispatch(setStatusFilter(e.target.value as any))}
            aria-label="Status filter"
            className="bg-[#121212] text-[#e1e1e1] border-[rgba(255,255,255,0.03)] w-44"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </Select>

          <div className="text-sm text-[#a0a0a0]">Filter by tags:</div>

          <div className="w-full md:w-auto">
            <TagGroupPicker
              groups={PREDEFINED_TAGS}
              selected={filters.tags}
              onChange={(tags) => dispatch(setTagsFilter(tags))}
              size="sm"
            />
          </div>
        </div>
      </div>

      {/* Loading / Error */}
      {status === "loading" && (
        <p className="text-sm text-[#a0a0a0]">Loading...</p>
      )}
      {error && <p className="text-sm text-rose-400">{error}</p>}

      {/* Jobs list */}
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
            className="flex items-center justify-between gap-3 bg-[#1e1e1e] text-[#e1e1e1] hover:shadow-lg transition-shadow"
          >
            <div className="flex flex-col">
              <Link
                to={`/jobs/${job.id}`}
                className="text-base font-semibold text-white hover:text-[#bb85fb] transition-colors"
              >
                {job.title}
              </Link>

              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#a0a0a0]">
                <span className="rounded bg-[#121212] px-2 py-0.5">
                  slug: {job.slug}
                </span>

                <span
                  className={
                    "rounded px-2 py-0.5 text-xs font-semibold " +
                    (job.status === "active"
                      ? "bg-[#00dac5]/20 text-[#00dac5]"
                      : "bg-[rgba(255,255,255,0.02)] text-[#a0a0a0]")
                  }
                >
                  {job.status}
                </span>

                {job.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded px-2 py-0.5 text-xs font-semibold bg-[#bb85fb]/12 text-[#bb85fb]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                className="border-[rgba(255,255,255,0.03)] bg-[#121212] text-[#e1e1e1] hover:bg-[#151515]"
                onClick={() => openEditModal(job.id!)}
              >
                Edit
              </Button>

              <Button
                variant="primary"
                className="bg-[#bb85fb] hover:bg-[#a46df0]"
                onClick={() => toggleArchive(job.id!, job.status)}
              >
                {job.status === "active" ? "Archive" : "Unarchive"}
              </Button>

              <Button
                variant="ghost"
                className="border-[rgba(255,255,255,0.03)] bg-[#121212] text-[#e1e1e1] hover:bg-[#151515]"
                asChild
              >
                <Link to={`/jobs/${job.id}/assessment`}>Assessment</Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button
          variant="secondary"
          className="border-[rgba(255,255,255,0.03)] bg-[#121212] text-[#e1e1e1] hover:bg-[#151515]"
          onClick={() => dispatch(setPage(Math.max(1, pagination.page - 1)))}
          disabled={pagination.page === 1}
        >
          Prev
        </Button>

        <span className="text-sm text-[#a0a0a0]">
          Page {pagination.page} / {totalPages}
        </span>

        <Button
          variant="secondary"
          className="border-[rgba(255,255,255,0.03)] bg-[#121212] text-[#e1e1e1] hover:bg-[#151515]"
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
          className="w-28 border-[rgba(255,255,255,0.03)] bg-[#121212] text-[#e1e1e1]"
        >
          {[5, 10, 20].map((n) => (
            <option key={n} value={n}>
              {n} / page
            </option>
          ))}
        </Select>

        <span className="text-sm text-[#a0a0a0]">
          total: {pagination.totalCount}
        </span>
      </div>

      {/* Create / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingJobId == null ? "Create Job" : "Edit Job"}
      >
        <div className="flex flex-col gap-3">
          <label className="text-sm font-medium text-[#a0a0a0]">
            Title
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>

          <label className="text-sm font-medium text-[#a0a0a0]">
            Slug
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
          </label>

          <div className="text-sm font-medium text-[#a0a0a0]">Tags</div>

          <TagGroupPicker
            groups={PREDEFINED_TAGS}
            selected={tagsInput
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)}
            onChange={(tags) => setTagsInput(tags.join(", "))}
          />

          {formError && <p className="text-sm text-rose-400">{formError}</p>}

          <div className="mt-2 flex justify-between gap-3">
            {editingJobId != null && (
              <Button
                variant="danger"
                className="bg-rose-600 hover:bg-rose-700"
                onClick={() => setConfirmDeleteId(editingJobId)}
              >
                Delete Job
              </Button>
            )}

            <div className="ml-auto flex gap-3">
              <Button
                variant="secondary"
                className="border-[rgba(255,255,255,0.03)] bg-[#121212] text-[#e1e1e1] hover:bg-[#151515]"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </Button>

              <Button
                className="bg-[#bb85fb] hover:bg-[#a46df0]"
                onClick={submitForm}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Confirm Delete Modal */}
      <Modal
        open={confirmDeleteId != null}
        onClose={() => setConfirmDeleteId(null)}
        title="Confirm delete"
      >
        <p className="text-sm text-[#e1e1e1]">This action cannot be undone.</p>

        <div className="mt-4 flex justify-end gap-3">
          <Button
            variant="secondary"
            className="border-[rgba(255,255,255,0.03)] bg-[#121212] text-[#e1e1e1] hover:bg-[#151515]"
            onClick={() => setConfirmDeleteId(null)}
          >
            Cancel
          </Button>

          <Button
            variant="danger"
            className="bg-rose-600 hover:bg-rose-700"
            onClick={async () => {
              if (confirmDeleteId != null) {
                await dispatch(deleteJob(confirmDeleteId));
                setConfirmDeleteId(null);
                setModalOpen(false);
                dispatch(fetchJobs());
              }
            }}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
