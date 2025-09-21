import React from "react";
import JobCard from "./JobCard";

type Job = any;

type Props = {
  jobs: Job[];
  onEdit: (id: number) => void;
  onToggleArchive: (id: number, current: "active" | "archived") => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, idx: number) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, toIndex: number) => void;
  currentPage: number;
  pageSize: number;
};

export default function JobsList({
  jobs,
  onEdit,
  onToggleArchive,
  onDragStart,
  onDragOver,
  onDrop,
  currentPage,
  pageSize,
}: Props) {
  return (
    <div className="grid gap-3">
      {jobs && jobs.length > 0 ? (
        jobs.map((job: any, idx: number) => {
          if (!job || !job.id) {
            return null;
          }

          const globalIndex = (currentPage - 1) * pageSize + idx;
          return (
            <JobCard
              key={job.id}
              job={job}
              index={globalIndex}
              onEdit={onEdit}
              onToggleArchive={onToggleArchive}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDrop={onDrop}
            />
          );
        })
      ) : (
        <div className="text-center text-[#a0a0a0] py-8">No jobs found</div>
      )}
    </div>
  );
}
