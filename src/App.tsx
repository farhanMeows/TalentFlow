import { Routes, Route, Outlet } from "react-router-dom";
import JobsPage from "./pages/JobsPage";
import JobDetailPage from "./pages/JobDetailPage";
import Navbar from "./components/ui/Navbar";
import AssessmentBuilderPage from "./pages/AssessmentBuilderPage";
import CandidateProfilePage from "./pages/CandidateProfilePage";
import JobApplicantsPage from "./pages/JobApplicantsPage";
import CandidatesKanbanPage from "./pages/CandidatesKanbanPage";
import LandingPage from "./pages/LandingPage";
import NotFoundPage from "./pages/NotFoundPage";

function Layout() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-[#121212] text-[#e1e1e1]">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route element={<Layout />}>
          <Route path="jobs" element={<JobsPage />} />
          <Route path="jobs/:jobId" element={<JobDetailPage />} />
          <Route
            path="jobs/:jobId/assessment"
            element={<AssessmentBuilderPage />}
          />
          <Route
            path="jobs/:jobId/applicants"
            element={<JobApplicantsPage />}
          />
          <Route
            path="jobs/:jobId/candidates"
            element={<CandidatesKanbanPage />}
          />
          <Route path="candidates" element={<CandidatesKanbanPage />} />
          <Route path="candidates/:id" element={<CandidateProfilePage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

export default App;
