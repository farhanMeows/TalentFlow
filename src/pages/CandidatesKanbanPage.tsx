import { useEffect, useMemo, useState } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  fetchCandidates,
  setSearch,
  setJobFilter,
  updateCandidate,
  type CandidateStage,
} from "../store/features/candidates/candidatesSlice";

const STAGES: CandidateStage[] = [
  "applied",
  "screen",
  "tech",
  "offer",
  "hired",
  "rejected",
];

export default function CandidatesKanbanPage() {
  const dispatch = useDispatch<any>();
  const { items, filters } = useSelector(
    (s: any) => s.candidates,
    shallowEqual
  );
  const jobs = useSelector((s: any) => s.jobs.jobs, shallowEqual);
  const [localSearch, setLocalSearch] = useState(filters.search);
  const { jobId } = useParams();

  useEffect(() => {
    const t = setTimeout(() => {
      if (localSearch !== filters.search) dispatch(setSearch(localSearch));
    }, 400);
    return () => clearTimeout(t);
  }, [localSearch]);

  useEffect(() => {
    dispatch(fetchCandidates());
  }, [filters.search, filters.jobId]);

  // when jobId param exists, set filter accordingly
  useEffect(() => {
    if (jobId) {
      const n = Number(jobId);
      if (Number.isFinite(n)) dispatch(setJobFilter(n));
    }
  }, [jobId]);

  const byStage = useMemo(() => {
    const map: Record<string, any[]> = Object.fromEntries(
      STAGES.map((s) => [s, []])
    );
    for (const c of items) {
      const key = (c.stage as CandidateStage) || "applied";
      if (!map[key]) map[key] = [];
      map[key].push(c);
    }
    return map;
  }, [items]);

  const jobTitleById = useMemo(() => {
    const m: Record<number, string> = {};
    for (const j of jobs) {
      if (j?.id) m[j.id] = j.title;
    }
    return m;
  }, [jobs]);

  const onDragStart = (e: React.DragEvent, id: number) => {
    e.dataTransfer.setData("text/plain", String(id));
  };
  const onDrop = async (e: React.DragEvent, stage: CandidateStage) => {
    const id = Number(e.dataTransfer.getData("text/plain"));
    if (!Number.isFinite(id)) return;
    // optimistic update
    // backup current
    const current = items.find((x: any) => x.id === id);
    if (!current || current.stage === stage) return;
    // local optimistic mutation via direct dispatch to update reducer
    await dispatch(updateCandidate({ id, updates: { stage } }))
      .unwrap()
      .catch(async () => {
        // rollback: update back to previous stage
        await dispatch(
          updateCandidate({ id, updates: { stage: current.stage } })
        );
      });
  };

  return (
    <div className="p-6 max-w-[1500px] mx-auto">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-2xl font-semibold text-white">Candidates Kanban</h1>
        <div className="flex items-center gap-2">
          <select
            value={filters.jobId ?? ""}
            onChange={(e) =>
              dispatch(
                setJobFilter(
                  e.target.value ? Number(e.target.value) : undefined
                )
              )
            }
            className="px-3 py-2 rounded-md bg-[#1e1e1e] text-white border border-[#2a2a2a] focus:outline-none focus:ring-2 focus:ring-[#bb85fb]"
          >
            <option value="">All jobs</option>
            {jobs.map((j: any) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </select>
          <input
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search candidates..."
            className="px-3 py-2 rounded-md bg-[#1e1e1e] text-white border border-[#2a2a2a] focus:outline-none focus:ring-2 focus:ring-[#00dac5]"
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {STAGES.map((stage) => (
          <div
            key={stage}
            className="rounded-lg border border-[#2a2a2a] bg-[#121212]"
          >
            <div className="px-3 py-2 border-b border-[#2a2a2a] text-[#bb85fb] font-medium">
              {stage}
            </div>
            <div
              className="min-h-[200px] max-h-[70vh] overflow-auto p-2 space-y-2"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => onDrop(e, stage)}
            >
              {byStage[stage].length === 0 ? (
                <div className="text-[#a0a0a0] text-sm px-2 py-3">
                  No candidates
                </div>
              ) : (
                byStage[stage].map((c: any) => (
                  <div
                    key={c.id}
                    draggable
                    onDragStart={(e) => onDragStart(e, c.id)}
                    className="p-3 rounded-md bg-[#1e1e1e] border border-[#2a2a2a] cursor-grab active:cursor-grabbing"
                  >
                    <div className="font-medium text-white">{c.name}</div>
                    <div className="text-[#e1e1e1] text-sm">{c.email}</div>
                    {c.jobId ? (
                      <div className="mt-1 text-xs text-[#a0a0a0]">
                        Job:{" "}
                        <span className="text-[#bb85fb]">
                          {jobTitleById[c.jobId] || `#${c.jobId}`}
                        </span>
                      </div>
                    ) : null}
                    <a
                      href={`/candidates/${c.id}`}
                      className="mt-2 inline-block text-xs text-[#00dac5]"
                    >
                      Open profile
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
