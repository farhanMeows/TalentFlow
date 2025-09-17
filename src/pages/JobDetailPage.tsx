import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";

export default function JobDetailPage() {
  const { jobId } = useParams();
  const idNum = Number(jobId);
  const job = useSelector((s: RootState) =>
    s.jobs.jobs.find((j) => j.id === idNum)
  );

  if (!job) {
    return (
      <div style={{ padding: 16 }}>
        <p>Job not found in current page.</p>
        <Link to="/jobs">Back to Jobs</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>{job.title}</h2>
      <p>slug: {job.slug}</p>
      <p>status: {job.status}</p>
      {job.tags.length > 0 && <p>tags: {job.tags.join(", ")}</p>}
      <Link to="/jobs">Back to Jobs</Link>
    </div>
  );
}
