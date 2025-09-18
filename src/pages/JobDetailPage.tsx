import { useParams, Link } from "react-router-dom";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import {
  fetchCandidates,
  setJobFilter,
  setSearch as setCandidateSearch,
  setPage as setCandidatePage,
  setPageSize as setCandidatePageSize,
} from "../store/features/candidates/candidatesSlice";
import type { RootState } from "../store/store";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import Button from "../components/ui/Button";
// Import a Loader component (example provided below)
import Loader from "../components/ui/Loader";

export default function JobDetailPage() {
  const { jobId } = useParams();
  const idNum = Number(jobId);
  const dispatch = useDispatch<any>();

  const job = useSelector((s: RootState) =>
    s.jobs.jobs.find((j) => j.id === idNum)
  );

  // 1. Get the loading status from the candidates slice
  const isLoadingCandidates = useSelector(
    (s: RootState) => s.candidates.loading
  );

  const applicants = useSelector(
    (s: RootState) => s.candidates.items.filter((c) => c.jobId === idNum),
    shallowEqual
  );

  // Ensure candidates for this job are loaded
  useEffect(() => {
    if (!Number.isFinite(idNum)) return;
    dispatch(setJobFilter(idNum));
    dispatch(setCandidateSearch(""));
    dispatch(setCandidatePage(1));
    dispatch(setCandidatePageSize(1000));
    dispatch(fetchCandidates());
  }, [idNum]);

  if (!job) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent>
            <p className="text-[#e1e1e1]">Job not found in current page.</p>
            <div className="mt-3">
              <Button as-child variant="secondary" className="px-3 py-1.5">
                <Link to="/jobs">Back to Jobs</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Job Details Card - No Changes Here */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold text-[#e1e1e1]">{job.title}</h2>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col gap-1 text-sm">
            <p className="text-[#a0a0a0]">
              slug: <span className="text-[#e1e1e1]">{job.slug}</span>
            </p>

            <p className="text-[#a0a0a0]">
              status:{" "}
              <span
                className={
                  job.status === "active"
                    ? "inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold bg-green-500/20 text-green-400"
                    : "inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold bg-[rgba(255,255,255,0.02)] text-[#a0a0a0]"
                }
              >
                {job.status}
              </span>
            </p>
          </div>

          {job.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {job.tags.map((t) => (
                <span
                  key={t}
                  className="rounded px-2 py-0.5 text-xs font-semibold bg-[#bb85fb]/12 text-[#bb85fb]"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <Button as-child variant="primary" className="px-4 py-2">
              <Link to="/jobs">Back to Jobs</Link>
            </Button>

            <Button as-child variant="secondary" className="px-4 py-2">
              <Link to={`/jobs/${job.id}/assessment`}>Assessment Builder</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Applicants section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[#e1e1e1]">
              Applicants {/* 2. Hide count during loading */}
              {!isLoadingCandidates && `(${applicants.length})`}
            </h3>
            <Button as-child variant="secondary" className="px-3 py-1.5">
              <Link to={`/jobs/${job.id}/candidates`}>View all</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* 3. Add conditional rendering for the loader */}
          {isLoadingCandidates ? (
            <Loader />
          ) : applicants.length === 0 ? (
            <p className="text-sm text-[#a0a0a0]">No applicants yet.</p>
          ) : (
            <ul className="divide-y divide-[#2a2a2a]">
              {applicants.map((c) => (
                <li
                  key={c.id}
                  className="py-3 flex items-center justify-between"
                >
                  <div>
                    <div className="text-sm text-white font-medium">
                      {c.name}
                    </div>
                    <div className="text-xs text-[#e1e1e1]">{c.email}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 rounded bg-[#1e1e1e] border border-[#2a2a2a] text-[#bb85fb] text-xs">
                      {c.stage}
                    </span>
                    <Button
                      as-child
                      variant="ghost"
                      className="px-2 py-1 text-xs"
                    >
                      <Link to={`/candidates/${c.id}`}>Profile</Link>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
