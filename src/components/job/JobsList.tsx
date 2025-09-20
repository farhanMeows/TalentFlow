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
};

export default function JobsList({
  jobs,
  onEdit,
  onToggleArchive,
  onDragStart,
  onDragOver,
  onDrop,
}: Props) {
  return (
    <div className="grid gap-3">
      {jobs.map((job: any, idx: number) => (
        <JobCard
          key={job.id}
          job={job}
          index={idx}
          onEdit={onEdit}
          onToggleArchive={onToggleArchive}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDrop={onDrop}
        />
      ))}
    </div>
  );
}
