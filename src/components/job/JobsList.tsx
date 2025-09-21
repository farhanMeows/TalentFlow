import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import JobCard from "./JobCard";

type Job = any;

type Props = {
  jobs: Job[];
  onEdit: (id: number) => void;
  onToggleArchive: (id: number, current: "active" | "archived") => void;
  onDragEnd: (event: DragEndEvent) => void;
};

export default function JobsList({
  jobs,
  onEdit,
  onToggleArchive,
  onDragEnd,
}: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const jobIds = jobs.map((job) => job.id).filter(Boolean);
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext items={jobIds} strategy={verticalListSortingStrategy}>
        <div className="grid gap-3">
          {jobs && jobs.length > 0 ? (
            jobs.map((job: any) => {
              if (!job || !job.id) {
                return null;
              }

              return (
                <JobCard
                  key={job.id}
                  job={job}
                  onEdit={onEdit}
                  onToggleArchive={onToggleArchive}
                />
              );
            })
          ) : (
            <div className="text-center text-[#a0a0a0] py-8">No jobs found</div>
          )}
        </div>
      </SortableContext>
    </DndContext>
  );
}
