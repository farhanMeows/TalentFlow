import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  fetchCandidates,
  setJobFilter,
  bulkStageChange,
} from "../store/features/candidates/candidatesSlice";

export default function JobApplicantsPage() {
  const { jobId } = useParams();
  const dispatch = useDispatch<any>();
  const { items, loading } = useSelector((s: any) => s.candidates);
  const job = useSelector((s: any) =>
    s.jobs.jobs.find((j: any) => j.id === jid)
  );
  const jid = Number(jobId);

  useEffect(() => {
    dispatch(setJobFilter(jid));
    dispatch(fetchCandidates());
  }, [jid]);

  return (
    <div className="p-6 max-w-6xl mx-auto text-white">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          Applicants for {job ? job.title : `Job #${jid}`}
        </h1>
        <div className="flex gap-2">
          <a
            href={`/jobs/${jid}/assessment`}
            className="px-3 py-2 rounded bg-[#1e1e1e] border border-[#2a2a2a]"
          >
            Assessment Builder
          </a>
        </div>
      </div>

      <div className="mt-6 grid gap-3">
        {loading ? (
          <div className="text-[#a0a0a0]">Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-[#a0a0a0]">No applicants yet.</div>
        ) : (
          items.map((c: any) => (
            <div
              key={c.id}
              className="p-4 rounded border border-[#2a2a2a] bg-[#121212] flex items-center justify-between"
            >
              <div>
                <div className="font-medium">{c.name}</div>
                <div className="text-[#e1e1e1] text-sm">{c.email}</div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`/candidates/${c.id}`}
                  className="px-3 py-2 rounded bg-[#1e1e1e] border border-[#2a2a2a]"
                >
                  View
                </a>
                <button
                  onClick={() =>
                    (dispatch as any)(
                      bulkStageChange({ ids: [c.id], stage: "screen" })
                    )
                  }
                  className="px-3 py-2 rounded bg-[#00dac5] text-black"
                >
                  Next Stage
                </button>
                <button
                  onClick={() =>
                    (dispatch as any)(
                      bulkStageChange({ ids: [c.id], stage: "rejected" })
                    )
                  }
                  className="px-3 py-2 rounded bg-[#1e1e1e] border border-[#2a2a2a]"
                >
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
