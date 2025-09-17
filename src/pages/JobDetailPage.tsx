import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import { Card, CardContent, CardHeader } from "../components/ui/Card";
import Button from "../components/ui/Button";

export default function JobDetailPage() {
  const { jobId } = useParams();
  const idNum = Number(jobId);
  const job = useSelector((s: RootState) =>
    s.jobs.jobs.find((j) => j.id === idNum)
  );

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

          <div className="mt-6">
            <Button as-child variant="primary" className="px-4 py-2">
              <Link to="/jobs">Back to Jobs</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
