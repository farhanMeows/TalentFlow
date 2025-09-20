import React from "react";
import { Link } from "react-router-dom";
import Button from "../ui/Button";
import { Card } from "../ui/Card";

type Job = {
  id?: number;
  title: string;
  slug: string;
  status: "active" | "archived";
  tags: string[];
};

type Props = {
  job: Job;
  index: number;
  onEdit: (jobId: number) => void;
  onToggleArchive: (jobId: number, current: "active" | "archived") => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, idx: number) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, toIndex: number) => void;
};

export default function JobCard({
  job,
  index,
  onEdit,
  onToggleArchive,
  onDragStart,
  onDragOver,
  onDrop,
}: Props) {
  return (
    <Card
      key={job.id}
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e)}
      onDrop={(e) => onDrop(e, index)}
      className="flex items-center justify-between gap-3 cursor-grab active:cursor-grabbing bg-[#1e1e1e] text-[#e1e1e1] hover:shadow-lg transition-shadow"
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
          onClick={() => onEdit(job.id!)}
        >
          Edit
        </Button>

        <Button
          variant="primary"
          className="bg-[#bb85fb] hover:bg-[#a46df0]"
          onClick={() => onToggleArchive(job.id!, job.status)}
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
  );
}
