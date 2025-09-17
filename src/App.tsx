// src/App.tsx or wherever your router is defined

import { Routes, Route } from "react-router-dom"; // <-- This line fixes the error
import JobsPage from "./pages/JobsPage";
import JobDetailPage from "./pages/JobDetailPage";
import Navbar from "./components/Navbar";

function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Routes>
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/:jobId" element={<JobDetailPage />} />
          <Route path="/" element={<JobsPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
