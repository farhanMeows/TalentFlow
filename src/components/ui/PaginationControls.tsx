import Button from "../ui/Button";
import Select from "../ui/Select";

type Props = {
  page: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  onPrev: () => void;
  onNext: () => void;
  onPageSizeChange: (n: number) => void;
};

export default function PaginationControls({
  page,
  totalPages,
  pageSize,
  totalCount,
  onPrev,
  onNext,
  onPageSizeChange,
}: Props) {
  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
      <Button
        variant="secondary"
        className="border-[rgba(255,255,255,0.03)] bg-[#121212] text-[#e1e1e1] hover:bg-[#151515]"
        onClick={onPrev}
        disabled={page === 1}
      >
        Prev
      </Button>

      <span className="text-sm text-[#a0a0a0]">
        Page {page} / {totalPages}
      </span>

      <Button
        variant="secondary"
        className="border-[rgba(255,255,255,0.03)] bg-[#121212] text-[#e1e1e1] hover:bg-[#151515]"
        onClick={onNext}
        disabled={page >= totalPages}
      >
        Next
      </Button>

      <Select
        value={pageSize}
        onChange={(e) => onPageSizeChange(Number(e.target.value))}
        className="w-28 border-[rgba(255,255,255,0.03)] bg-[#121212] text-[#e1e1e1]"
      >
        {[5, 10, 20].map((n) => (
          <option key={n} value={n}>
            {n} / page
          </option>
        ))}
      </Select>

      <span className="text-sm text-[#a0a0a0]">total: {totalCount}</span>
    </div>
  );
}
