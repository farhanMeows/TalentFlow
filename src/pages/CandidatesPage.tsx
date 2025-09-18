import { useEffect, useState } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import {
  fetchCandidates,
  setPage,
  setSearch,
  setStage,
  setSelected,
  bulkStageChange,
  type CandidateStage,
} from "../store/features/candidates/candidatesSlice";

// simple RootState typing without central types file
// no RootState types available; use any for store selector here

export default function CandidatesPage() {
  const dispatch = useDispatch<any>();
  const { items, loading, pagination, filters, selectedIds } = useSelector(
    (s: any) => s.candidates,
    shallowEqual
  );
  const jobs = useSelector((s: any) => s.jobs.jobs, shallowEqual);
  const [localSearch, setLocalSearch] = useState(filters.search);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      if (localSearch !== filters.search) dispatch(setSearch(localSearch));
    }, 400);
    return () => clearTimeout(t);
  }, [localSearch]);

  useEffect(() => {
    dispatch(fetchCandidates());
  }, [
    dispatch,
    filters.search,
    filters.stage,
    filters.jobId,
    pagination.page,
    pagination.pageSize,
  ]);

  const allSelected =
    selectedIds.length > 0 && selectedIds.length === items.length;
  const toggleAll = () => {
    dispatch(setSelected(allSelected ? [] : items.map((c: any) => c.id)));
  };

  const onBulkStage = async (stage: CandidateStage) => {
    if (selectedIds.length === 0) return;
    await dispatch(bulkStageChange({ ids: selectedIds, stage }));
    dispatch(setSelected([]));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-semibold text-white">Candidates</h1>
        <div className="flex gap-3 items-center">
          <input
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search name or email..."
            className="px-3 py-2 rounded-md bg-[#1e1e1e] text-white border border-[#2a2a2a] focus:outline-none focus:ring-2 focus:ring-[#00dac5]"
          />
          <select
            value={filters.stage}
            onChange={(e) => dispatch(setStage(e.target.value as any))}
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
          <button
            onClick={() => onBulkStage("screen")}
            className="px-3 py-2 rounded-md bg-[#00dac5] text-black hover:opacity-90"
          >
            Move to Screen
          </button>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-[#2a2a2a]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#1e1e1e] text-[#e1e1e1]">
            <tr>
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                />
              </th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Stage</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2a2a] bg-[#121212] text-white">
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-[#a0a0a0]"
                >
                  Loading...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-6 text-center text-[#a0a0a0]"
                >
                  No candidates
                </td>
              </tr>
            ) : (
              items.map((c: any) => (
                <tr key={c.id} className="hover:bg-[#181818]">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(c.id)}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...selectedIds, c.id]
                          : selectedIds.filter((id: number) => id !== c.id);
                        (dispatch as any)(setSelected(next));
                      }}
                    />
                  </td>
                  <td className="px-4 py-3">{c.name}</td>
                  <td className="px-4 py-3 text-[#e1e1e1]">{c.email}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-md bg-[#1e1e1e] border border-[#2a2a2a] text-[#bb85fb]">
                      {c.stage}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {c.jobId ? (
                      <span className="text-xs text-[#a0a0a0]">
                        {jobs.find((j: any) => j.id === c.jobId)?.title ||
                          `Job #${c.jobId}`}
                      </span>
                    ) : (
                      <span className="text-xs text-[#a0a0a0]">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={`/candidates/${c.id}`}
                      className="px-2 py-1 rounded bg-[#1e1e1e] border border-[#2a2a2a] text-white"
                    >
                      View
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-center gap-3">
        <button
          onClick={() => dispatch(setPage(Math.max(1, pagination.page - 1)))}
          className="px-3 py-2 rounded-md bg-[#1e1e1e] text-white border border-[#2a2a2a] disabled:opacity-50"
          disabled={pagination.page <= 1}
        >
          Prev
        </button>
        <span className="text-[#e1e1e1]">Page {pagination.page}</span>
        <button
          onClick={() => dispatch(setPage(pagination.page + 1))}
          className="px-3 py-2 rounded-md bg-[#1e1e1e] text-white border border-[#2a2a2a]"
        >
          Next
        </button>
      </div>
    </div>
  );
}
