import Input from "../ui/Input";
import Select from "../ui/Select";
import TagGroupPicker from "../TagPicker";

type Filters = {
  search: string;
  status: string;
  tags: string[];
};

type Props = {
  filters: Filters;
  onSearchChange: (v: string) => void;
  onStatusChange: (v: string) => void;
  onTagsChange: (tags: string[]) => void;
  tagGroups: Record<string, string[]>;
};

export default function JobsFilters({
  filters,
  onSearchChange,
  onStatusChange,
  onTagsChange,
  tagGroups,
}: Props) {
  return (
    <div className="mb-6 flex flex-col gap-3 rounded-lg bg-[#1e1e1e] p-4 shadow-sm border border-[rgba(255,255,255,0.02)]">
      <Input
        value={filters.search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search title"
        aria-label="Search title"
        className="bg-[#121212] text-[#e1e1e1] placeholder-[#a0a0a0] border-[rgba(255,255,255,0.03)]"
      />
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={filters.status}
          onChange={(e) => onStatusChange(e.target.value)}
          aria-label="Status filter"
          className="bg-[#121212] text-[#e1e1e1] border-[rgba(255,255,255,0.03)] w-44"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </Select>

        <div className="text-sm text-[#a0a0a0]">Filter by tags:</div>

        <div className="w-full md:w-auto">
          <TagGroupPicker
            groups={tagGroups}
            selected={filters.tags}
            onChange={(tags: string[]) => onTagsChange(tags)}
            size="sm"
          />
        </div>
      </div>
    </div>
  );
}
