import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCandidates,
  setSearch,
  setStage,
  setPage,
  setPageSize,
  type CandidateStage,
} from "../../store/features/candidates/candidatesSlice";
import PaginationControls from "../ui/PaginationControls";

export default function CandidatesVirtualList() {
  const dispatch = useDispatch<any>();
  const candidatesState = useSelector(
    (s: any) => s.candidates || { items: [], pagination: {}, filters: {} }
  );

  const items: any[] = candidatesState.items ?? [];
  const pagination = candidatesState.pagination ?? {
    page: 1,
    pageSize: 10,
    totalCount: 0,
  };
  const filters = candidatesState.filters ?? { search: "", stage: "" };

  const [localSearch, setLocalSearch] = useState<string>(filters.search ?? "");
  const [stage, setStageLocal] = useState<CandidateStage | "">(
    filters.stage ?? ""
  );

  useEffect(() => {
    if (filters.search !== undefined && filters.search !== localSearch) {
      setLocalSearch(filters.search);
    }
    if (filters.stage !== undefined && filters.stage !== stage) {
      setStageLocal(filters.stage);
    }
  }, [filters.search, filters.stage]);

  useEffect(() => {
    dispatch(fetchCandidates());
  }, [
    dispatch,
    pagination.page,
    pagination.pageSize,
    filters.search,
    filters.stage,
  ]);

  useEffect(() => {
    const t = setTimeout(() => {
      const searchChanged = localSearch !== (filters.search ?? "");
      const stageChanged = stage !== (filters.stage ?? "");

      // update store filters if they changed
      if (searchChanged) dispatch(setSearch(localSearch));
      if (stageChanged) dispatch(setStage(stage as any));

      // only reset page to 1 if either filter actually changed
      if (searchChanged || stageChanged) {
        dispatch(setPage(1));
      }
    }, 350);

    return () => clearTimeout(t);
  }, [localSearch, stage, dispatch, filters.search, filters.stage]);

  const totalPages = Math.max(
    1,
    Math.ceil((pagination.totalCount ?? 0) / (pagination.pageSize || 1))
  );

  return (
    <div className="p-2">
      <div className="flex gap-2 mb-3">
        <input
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Search name or email..."
          className="px-3 py-2 rounded-md bg-[#1e1e1e] text-white border border-[#2a2a2a] focus:outline-none focus:ring-2 focus:ring-[#00dac5]"
        />
        <select
          value={stage}
          onChange={(e) => setStageLocal(e.target.value as any)}
          className="px-3 py-2 rounded-md bg-[#1e1e1e] text-white border border-[#2a2a2a] focus:outline-none focus:ring-2 focus:ring-[#bb85fb]"
        >
          <option value="">All stages</option>
          {(
            [
              "applied",
              "screen",
              "tech",
              "offer",
              "hired",
              "rejected",
            ] as CandidateStage[]
          ).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="max-h-[70vh] overflow-auto divide-y divide-[#2a2a2a] rounded border border-[#2a2a2a] bg-[#121212]">
        {items.length === 0 ? (
          <div className="p-4 text-center text-sm text-[#a0a0a0]">
            No candidates found.
          </div>
        ) : (
          items.map((c: any) => (
            <div
              key={c.id}
              className="px-3 py-2 flex items-center justify-between hover:bg-[#181818]"
            >
              <div>
                <div className="text-white text-sm font-medium">{c.name}</div>
                <div className="text-[#e1e1e1] text-xs">{c.email}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 rounded-md bg-[#1e1e1e] border border-[#2a2a2a] text-[#bb85fb] text-xs">
                  {c.stage}
                </span>
                <a
                  href={`/candidates/${c.id}`}
                  className="text-xs text-[#00dac5]"
                >
                  View
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4">
        <PaginationControls
          page={pagination.page}
          totalPages={totalPages}
          pageSize={pagination.pageSize}
          totalCount={pagination.totalCount ?? 0}
          onPrev={() => dispatch(setPage(Math.max(1, pagination.page - 1)))}
          onNext={() =>
            dispatch(setPage(Math.min(totalPages, pagination.page + 1)))
          }
          onPageSizeChange={(n: number) => {
            dispatch(setPageSize(n));
            dispatch(setPage(1));
          }}
        />
      </div>
    </div>
  );
}
