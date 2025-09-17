// src/App.tsx or wherever your router is defined

import { Routes, Route } from "react-router-dom"; // <-- This line fixes the error
import JobsPage from "./pages/JobsPage";
import JobDetailPage from "./pages/JobDetailPage";

function App() {
  return (
    <div>
      {/* Your navigation links can go here */}
      <Routes>
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/:jobId" element={<JobDetailPage />} />
        {/* You can add a default route as well */}
        <Route path="/" element={<JobsPage />} />
      </Routes>
    </div>
  );
}

export default App;
