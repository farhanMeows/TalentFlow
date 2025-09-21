import { Link } from "react-router-dom";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Button from "../ui/Button";

type Job = {
  id?: number;
  title: string;
  slug: string;
  status: "active" | "archived";
  tags: string[];
};

type Props = {
  job: Job;
  onEdit: (jobId: number) => void;
  onToggleArchive: (jobId: number, current: "active" | "archived") => void;
};

export default function JobCard({ job, onEdit, onToggleArchive }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: job.id! });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`rounded-xl border p-4 shadow-[0_8px_24px_rgba(0,0,0,0.6)] bg-[#1e1e1e] border-[rgba(255,255,255,0.04)] flex items-center justify-between gap-3 cursor-grab active:cursor-grabbing text-[#e1e1e1] hover:shadow-lg transition-shadow ${
        isDragging ? "opacity-50" : ""
      }`}
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
    </div>
  );
}
