import type { PropsWithChildren } from "react";
import { clsx } from "clsx";

export interface GroupedTags {
  [groupLabel: string]: readonly string[];
}

interface TagGroupPickerProps {
  groups: GroupedTags;
  selected: string[];
  onChange: (tags: string[]) => void;
  size?: "sm" | "md";
}

export default function TagGroupPicker({
  groups,
  selected,
  onChange,
  size = "md",
}: PropsWithChildren<TagGroupPickerProps>) {
  function toggle(tag: string) {
    if (selected.includes(tag)) {
      onChange(selected.filter((t) => t !== tag));
    } else {
      onChange([...selected, tag]);
    }
  }

  const base =
    "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition";
  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-xs",
  } as const;

  return (
    <div className="w-full rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Object.entries(groups).map(([group, tags]) => (
          <div key={group} className="flex flex-col gap-2">
            <div className="text-xs font-semibold text-slate-600">{group}</div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                const isActive = selected.includes(tag as string);
                return (
                  <button
                    key={tag as string}
                    type="button"
                    onClick={() => toggle(tag as string)}
                    className={clsx(
                      base,
                      sizes[size],
                      isActive
                        ? "border-indigo-300 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                    )}
                  >
                    {tag as string}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
