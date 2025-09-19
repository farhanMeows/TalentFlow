import Button from "../ui/Button"; // adjust this import to match your project
// alternative: import { Button } from "your-ui-lib";

export type ViewMode = "builder" | "preview";

type Props = {
  title?: string;
  viewMode: ViewMode;
  setViewMode: (m: ViewMode) => void;
  onSave: () => void;
  className?: string;
};

export default function BuilderToolbar({
  title = "Assessment Builder",
  viewMode,
  setViewMode,
  onSave,
  className = "",
}: Props) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <h2 className="text-2xl font-semibold text-foreground">{title}</h2>

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
