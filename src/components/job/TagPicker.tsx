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
    "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-transform transform-gpu";
  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-xs",
  } as const;

  return (
    <div className="w-full rounded-2xl p-4 shadow-[0_8px_24px_rgba(0,0,0,0.6)] bg-[#1e1e1e] border border-[rgba(255,255,255,0.04)]">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Object.entries(groups).map(([group, tags]) => (
          <div key={group} className="flex flex-col gap-3">
            <div className="text-sm font-semibold text-[#e1e1e1]">{group}</div>

            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                const isActive = selected.includes(tag as string);
                return (
                  <button
                    key={tag as string}
                    type="button"
                    onClick={() => toggle(tag as string)}
                    aria-pressed={isActive}
                    className={clsx(
                      base,
                      sizes[size],
                      // active styles
                      isActive
                        ? "border-transparent text-white shadow-[0_6px_18px_rgba(187,133,251,0.12)] hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#bb85fb]/40 bg-gradient-to-r from-[#bb85fb]/10 to-[#00dac5]/6 backdrop-blur-sm"
                        : "border-[rgba(255,255,255,0.06)] text-[#a0a0a0] hover:scale-105 hover:border-[#333333] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00dac5]/20 bg-[#121212]"
                    )}
                  >
                    <span
                      className={clsx(
                        isActive
                          ? "text-white font-semibold"
                          : "text-[#a0a0a0] font-semibold"
                      )}
                    >
                      {tag as string}
                    </span>
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
