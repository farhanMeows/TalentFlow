export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col">
      <section className="relative flex flex-1 items-center justify-center overflow-hidden">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1e1e1e] via-transparent to-[#1e1e1e]" />

        {/* Accent blobs */}
        <div
          className="absolute -top-32 -left-32 h-96 w-96 rounded-full blur-3xl opacity-30"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, #bb85fb, transparent 60%)",
          }}
        />
        <div
          className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full blur-3xl opacity-30"
          style={{
            background:
              "radial-gradient(circle at 70% 70%, #00dac5, transparent 60%)",
          }}
        />

        <div className="relative w-full px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            TALENTFLOW
          </h1>
          <p className="mt-3 text-lg md:text-xl text-[#e1e1e1]">
            A mini hiring platform for modern teams — Jobs, Assessments, and
            Candidates.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <a
              href="/jobs"
              className="px-5 py-3 rounded-md bg-[#bb85fb] text-black font-semibold hover:opacity-90 transition"
            >
              Manage Jobs
            </a>
            <a
              href="/candidates"
              className="px-5 py-3 rounded-md bg-[#1e1e1e] border border-[#2a2a2a] text-white hover:bg-[#181818] transition"
            >
              View Candidates
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
