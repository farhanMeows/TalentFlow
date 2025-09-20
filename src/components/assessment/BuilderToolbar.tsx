import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Button from "../ui/Button";

export default function Header({
  title,
  viewMode,
  setViewMode,
  onSave,
  className = "",
}: {
  title: string;
  viewMode: "builder" | "preview";
  setViewMode: (mode: "builder" | "preview") => void;
  onSave: () => void;
  className?: string;
}) {
  const navigate = useNavigate();

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="inline-flex items-center justify-center rounded-md p-2 bg-[#1e1e1e] border border-[#2a2a2a] hover:bg-[#2a2a2a] focus:outline-none focus:ring-2 focus:ring-[#bb85fb]"
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </button>

        <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex rounded-lg bg-[#1e1e1e] p-1">
          <button
            onClick={() => setViewMode("builder")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              viewMode === "builder"
                ? "bg-[#bb85fb] text-white"
                : "text-[#a0a0a0] hover:text-white"
            }`}
          >
            Builder
          </button>

          <button
            onClick={() => setViewMode("preview")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              viewMode === "preview"
                ? "bg-[#bb85fb] text-white"
                : "text-[#a0a0a0] hover:text-white"
            }`}
          >
            Preview
          </button>
        </div>

        <Button onClick={onSave}>Save Assessment</Button>
      </div>
    </div>
  );
}
