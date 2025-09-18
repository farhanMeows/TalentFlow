// src/pages/NotFoundPage.tsx

import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#121212] text-center text-[#e1e1e1] px-6">
      <h1 className="text-6xl font-extrabold text-white">404</h1>
      <p className="mt-4 text-lg text-[#a0a0a0]">
        Oops! The page you’re looking for doesn’t exist.
      </p>
      <Link
        to="/"
        className="mt-6 inline-block rounded-md bg-[#bb85fb] px-5 py-3 font-semibold text-black transition hover:opacity-90"
      >
        Go Home
      </Link>
    </div>
  );
}
