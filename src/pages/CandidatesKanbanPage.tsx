import { useEffect, useMemo, useState } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  fetchCandidates,
  setSearch,
  setJobFilter,
  setPage,
  setPageSize,
  updateCandidate,
  type CandidateStage,
} from "../store/features/candidates/candidatesSlice";
import CandidatesVirtualList from "../components/CandidatesVirtualList";

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
  }, [filters.search]);

  useEffect(() => {
    if (!jobId) {
      // Clear any stale job filter when coming from other pages
      dispatch(setJobFilter(undefined));
      dispatch(setPage(1));
      dispatch(setPageSize(1000));
      dispatch(fetchCandidates());
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
    const current = items.find((x: any) => x.id === id);
    if (!current || current.stage === stage) return;
    await dispatch(updateCandidate({ id, updates: { stage } }))
      .unwrap()
      .catch(async () => {
        await dispatch(
          updateCandidate({ id, updates: { stage: current.stage } })
        );
      });
  };

  const [showAll, setShowAll] = useState(false);

  return (
    <div className="p-6 max-w-[1500px] mx-auto">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-2xl font-semibold text-white">
          {(() => {
            if (!jobId) return "Candidates – All candidates";
            const n = Number(jobId);
            const job = Number.isFinite(n)
              ? jobs.find((j: any) => j.id === n)
              : undefined;
            return job
              ? `Candidates – ${job.title}`
              : "Candidates – All candidates";
          })()}
        </h1>
        <div className="flex items-center gap-2">
          <input
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search candidates..."
            className="px-3 py-2 rounded-md bg-[#1e1e1e] text-white border border-[#2a2a2a] focus:outline-none focus:ring-2 focus:ring-[#00dac5]"
          />
          <button
            onClick={() => setShowAll((v) => !v)}
            className="px-3 py-2 rounded-md bg-[#1e1e1e] text-white border border-[#2a2a2a] hover:bg-[#181818]"
          >
            {showAll ? "Show Kanban" : "Show All (Virtualized)"}
          </button>
        </div>
      </div>

      {showAll ? (
        <CandidatesVirtualList />
      ) : (
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
                      <div
                        className="text-[#e1e1e1] text-xs truncate max-w-[180px]"
                        title={c.email}
                      >
                        {c.email}
                      </div>
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
      )}
    </div>
  );
}
