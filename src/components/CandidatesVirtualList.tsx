import { useMemo, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCandidates,
  setSearch,
  setStage,
  setPage,
  setPageSize,
  type CandidateStage,
} from "../store/features/candidates/candidatesSlice";

export default function CandidatesVirtualList() {
  const dispatch = useDispatch<any>();
  const { items } = useSelector((s: any) => s.candidates);
  const [localSearch, setLocalSearch] = useState("");
  const [stage, setStageLocal] = useState<CandidateStage | "">("");

  useEffect(() => {
    dispatch(setPage(1));
    dispatch(setPageSize(1000));
    dispatch(fetchCandidates());
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      dispatch(setSearch(localSearch));
      dispatch(setStage(stage as any));
      dispatch(setPage(1));
      dispatch(fetchCandidates());
    }, 350);
    return () => clearTimeout(t);
  }, [localSearch, stage]);

  const filtered = useMemo(() => {
    const q = localSearch.toLowerCase();
    return items.filter(
      (c: any) =>
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
    );
  }, [items, localSearch]);

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
        {filtered.map((c: any) => (
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
        ))}
      </div>
    </div>
  );
}
