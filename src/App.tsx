// src/App.tsx

import { Routes, Route } from "react-router-dom";
import JobsPage from "./pages/JobsPage";
import JobDetailPage from "./pages/JobDetailPage";
import Navbar from "./components/Navbar";
import AssessmentBuilderPage from "./pages/AssessmentBuilderPage";
// import CandidatesPage from "./pages/CandidatesPage"; // replaced by Kanban
import CandidateProfilePage from "./pages/CandidateProfilePage";
import JobApplicantsPage from "./pages/JobApplicantsPage";
import CandidatesKanbanPage from "./pages/CandidatesKanbanPage";

function App() {
  return (
    <div className="min-h-screen bg-[#121212] text-[#e1e1e1]">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Routes>
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/:jobId" element={<JobDetailPage />} />
          <Route
            path="/jobs/:jobId/assessment"
            element={<AssessmentBuilderPage />}
          />
          <Route
            path="/jobs/:jobId/applicants"
            element={<JobApplicantsPage />}
          />
          <Route path="/candidates" element={<CandidatesKanbanPage />} />
          <Route
            path="/jobs/:jobId/candidates"
            element={<CandidatesKanbanPage />}
          />
          <Route path="/candidates/:id" element={<CandidateProfilePage />} />
          <Route path="/" element={<JobsPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
