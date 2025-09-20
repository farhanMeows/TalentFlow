import { useEffect, useMemo, useState } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import {
  fetchCandidates,
  setSearch,
  setJobFilter,
  setPage,
  setPageSize,
  updateCandidate,
  type CandidateStage,
} from "../store/features/candidates/candidatesSlice";
import CandidatesVirtualList from "../components/candidates/CandidatesVirtualList";
import PaginationControls from "@/components/ui/PaginationControls";
import { fetchJobs } from "@/store/features/jobs/jobsSlice";

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
  // now select pagination from store as well
  const { items, filters, pagination } = useSelector(
    (s: any) => s.candidates,
    shallowEqual
  );
  const jobs = useSelector((s: any) => s.jobs.jobs, shallowEqual);
  const [localSearch, setLocalSearch] = useState(filters.search);
  const { jobId } = useParams();

  // debounce local search -> push to store
  useEffect(() => {
    const t = setTimeout(() => {
      if (localSearch !== filters.search) dispatch(setSearch(localSearch));
    }, 400);
    return () => clearTimeout(t);
  }, [localSearch, filters.search, dispatch]);

  // fetch whenever search, job filter or pagination changes
  useEffect(() => {
    dispatch(fetchJobs());
    dispatch(fetchCandidates());
  }, [
    filters.search,
    filters.jobId,
    pagination?.page,
    pagination?.pageSize,
    dispatch,
  ]);

  // keep job filter in sync with route param (if present)
  useEffect(() => {
    if (!jobId) {
      dispatch(setJobFilter(undefined));
    } else {
      dispatch(setJobFilter(Number(jobId)));
      dispatch(setPage(1)); // reset paging when route param sets job filter
    }
    // don't include dispatch in dep array to avoid re-running unnecessarily
  }, [jobId, dispatch]);

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

  // pagination helpers
  const page = pagination?.page ?? 1;
  const pageSize = pagination?.pageSize ?? 10;
  const totalCount = pagination?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / (pageSize || 1)));

  // Handler for job filter select
  function handleJobFilterChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    if (!val) {
      dispatch(setJobFilter(undefined));
    } else {
      dispatch(setJobFilter(Number(val)));
    }
    dispatch(setPage(1)); // reset page when filter changes
  }

  return (
    <div className="space-y-6">
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
        <div className="w-full">
          <div className="flex flex-col md:flex-row md:items-center gap-2">
            <div className="w-full md:w-auto flex-1">
              <input
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Search candidates..."
                className="w-full px-3 py-2 rounded-md bg-[#1e1e1e] text-white border border-[#2a2a2a] focus:outline-none focus:ring-2 focus:ring-[#00dac5]"
              />
            </div>

            <div className="flex w-full md:w-auto gap-2 md:items-center md:justify-end flex-col sm:flex-row">
              <select
                value={filters.jobId ?? ""}
                onChange={handleJobFilterChange}
                className="w-full sm:w-auto px-3 py-2 rounded-md bg-[#1e1e1e] text-white border border-[#2a2a2a] focus:outline-none"
                aria-label="Filter by job"
              >
                <option value="">All jobs</option>
                {jobs.map((j: any) => (
                  <option key={j.id} value={j.id}>
                    {j.title}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setShowAll((v) => !v)}
                className="w-full sm:w-auto px-3 py-2 rounded-md bg-[#1e1e1e] text-white border border-[#2a2a2a] hover:bg-[#181818]"
                aria-pressed={showAll}
              >
                {showAll ? "Show Kanban" : "Show All (Virtualized)"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showAll ? (
        <CandidatesVirtualList />
      ) : (
        <>
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
                  className="min-h-[200px] max-h-[60vh] overflow-auto p-2 space-y-2"
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
                        {/* <a
                          href={`/candidates/${c.id}`}
                          className="mt-2 inline-block text-xs text-[#00dac5]"
                        >
                          Open profile
                        </a> */}
                        <Link
                          to={`/candidates/${c.id}`}
                          className="text-xs text-[#00dac5]"
                        >
                          Open profile
                        </Link>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <PaginationControls
              page={page}
              totalPages={totalPages}
              pageSize={pageSize}
              totalCount={totalCount}
              onPrev={() => dispatch(setPage(Math.max(1, page - 1)))}
              onNext={() => dispatch(setPage(Math.min(totalPages, page + 1)))}
              onPageSizeChange={(n: number) => {
                dispatch(setPageSize(n));
                dispatch(setPage(1));
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}
