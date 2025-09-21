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

import { PREDEFINED_TAGS } from "../constants/tags";
import JobsHeader from "@/components/job/JobsHeader";
import JobsFilters from "@/components/job/JobsFilters";
import JobsList from "@/components/job/JobsList";
import PaginationControls from "@/components/ui/PaginationControls";
import JobFormModal from "@/components/job/JobFormModal";
import ConfirmDeleteModal from "@/components/job/ConfirmDeleteModal";

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
  const [reorderError, setReorderError] = useState<string | null>(null);
  const [displayError, setDisplayError] = useState<string | null>(null);

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

  // Handle general error display with auto-hide
  useEffect(() => {
    if (error) {
      setDisplayError(error);
      const timer = setTimeout(() => {
        setDisplayError(null);
      }, 4000); // Hide after 4 seconds

      return () => clearTimeout(timer);
    }
  }, [error]);

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
    const job = jobs.find((j: any) => j.id === jobId);
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

    const localFromIndex =
      fromIndex - (pagination.page - 1) * pagination.pageSize;
    const localToIndex = toIndex - (pagination.page - 1) * pagination.pageSize;

    if (
      localFromIndex < 0 ||
      localFromIndex >= jobs.length ||
      localToIndex < 0 ||
      localToIndex >= jobs.length
    ) {
      return;
    }

    const moved = jobs[localFromIndex];
    if (!moved || !moved.id) {
      console.error("Invalid job at index:", localFromIndex);
      return;
    }

    dispatch(
      optimisticallyReorderJobs({
        fromIndex: localFromIndex,
        toIndex: localToIndex,
      })
    );
    dispatch(reorderJobs({ jobId: moved.id, fromIndex, toIndex }))
      .unwrap()
      .catch((error) => {
        // Rollback the optimistic update by reversing the drag operation
        dispatch(
          optimisticallyReorderJobs({
            fromIndex: localToIndex,
            toIndex: localFromIndex,
          })
        );
        setReorderError("Failed to reorder jobs. Changes have been reverted.");
        console.error("Failed to reorder jobs:", error);

        // Clear the error message after 3 seconds
        setTimeout(() => setReorderError(null), 3000);
      });
  }
  function onDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  return (
    <div className="space-y-6 text-[#e1e1e1]">
      <JobsHeader onCreate={openCreateModal} />

      <JobsFilters
        filters={filters}
        onSearchChange={(v) => dispatch(setSearchFilter(v))}
        onStatusChange={(v) => dispatch(setStatusFilter(v as any))}
        onTagsChange={(tags) => dispatch(setTagsFilter(tags))}
        tagGroups={Object.fromEntries(
          Object.entries(PREDEFINED_TAGS).map(([k, v]) => [k, [...v]])
        )}
      />

      {status === "loading" && (
        <p className="text-sm text-[#a0a0a0]">Loading...</p>
      )}
      {displayError && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-3 text-sm text-rose-400">
          {displayError}
        </div>
      )}
      {reorderError && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-3 text-sm text-rose-400">
          {reorderError}
        </div>
      )}

      <JobsList
        jobs={jobs}
        onEdit={openEditModal}
        onToggleArchive={toggleArchive}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
        currentPage={pagination.page}
        pageSize={pagination.pageSize}
      />

      <PaginationControls
        page={pagination.page}
        totalPages={totalPages}
        pageSize={pagination.pageSize}
        totalCount={pagination.totalCount}
        onPrev={() => dispatch(setPage(Math.max(1, pagination.page - 1)))}
        onNext={() =>
          dispatch(setPage(Math.min(totalPages, pagination.page + 1)))
        }
        onPageSizeChange={(n) => dispatch(setPageSize(n))}
      />

      <JobFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editingJobId={editingJobId}
        titleValue={title}
        setTitleValue={setTitle}
        slugValue={slug}
        setSlugValue={setSlug}
        tagsInput={tagsInput}
        setTagsInput={setTagsInput}
        onSubmit={submitForm}
        formError={formError}
        onDeleteClick={
          editingJobId != null
            ? () => setConfirmDeleteId(editingJobId)
            : undefined
        }
        tagGroups={Object.fromEntries(
          Object.entries(PREDEFINED_TAGS).map(([k, v]) => [k, [...v]])
        )}
      />

      <ConfirmDeleteModal
        open={confirmDeleteId != null}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={async () => {
          if (confirmDeleteId != null) {
            await dispatch(deleteJob(confirmDeleteId));
            setConfirmDeleteId(null);
            setModalOpen(false);
            dispatch(fetchJobs());
          }
        }}
      />
    </div>
  );
}
