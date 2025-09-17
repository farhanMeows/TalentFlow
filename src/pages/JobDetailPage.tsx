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
            <p className="text-slate-700">Job not found in current page.</p>
            <Button as-child className="mt-3">
              <Link to="/jobs">Back to Jobs</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-slate-900">{job.title}</h2>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">slug: {job.slug}</p>
          <p className="text-sm text-slate-600">status: {job.status}</p>
          {job.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {job.tags.map((t) => (
                <span
                  key={t}
                  className="rounded bg-indigo-50 px-2 py-0.5 text-xs text-indigo-700"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
          <div className="mt-4">
            <Button as-child>
              <Link to="/jobs">Back to Jobs</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
