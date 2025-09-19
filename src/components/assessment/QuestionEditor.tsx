import { useState } from "react";

type Question = {
  id: string;
  type: string;
  title: string;
  required?: boolean;
  options?: string[];
  min?: number;
  max?: number;
  maxLength?: number;
  visibleIf?: {
    questionId: string;
    operator: "eq" | "neq" | "includes" | "excludes";
    value: string | number | boolean;
  };
};

type QuestionEditorProps = {
  question: Question;
  onChange: (next: Question) => void;
  onRemove: () => void;
  renderOptionControls?: boolean;
};

export default function QuestionEditor({
  question,
  onChange,
  onRemove,
}: QuestionEditorProps) {
  const [local, setLocal] = useState<Question>(question);

  function commit<K extends keyof Question>(key: K, value: Question[K]) {
    const next = { ...local, [key]: value } as Question;
    setLocal(next);
    onChange(next);
  }

  return (
    <div className="rounded-md border border-[#2a2a2a] bg-[#121212] p-3 space-y-2">
      <div className="flex items-center gap-2">
        <select
          value={local.type}
          onChange={(e) => commit("type", e.target.value)}
          className="px-2 py-1 rounded-md bg-[#1e1e1e] text-white border border-[#2a2a2a]"
        >
          <option value="single_choice">Single choice</option>
          <option value="multi_choice">Multi choice</option>
          <option value="short_text">Short text</option>
          <option value="long_text">Long text</option>
          <option value="numeric">Numeric</option>
          <option value="file">File</option>
        </select>
        <input
          value={local.title}
          onChange={(e) => commit("title", e.target.value)}
          placeholder="Question title"
          className="flex-1 px-2 py-1 rounded-md bg-[#1e1e1e] text-white border border-[#2a2a2a]"
        />
        <label className="text-sm text-[#e1e1e1] flex items-center gap-1">
          <input
            type="checkbox"
            checked={Boolean(local.required)}
            onChange={(e) => commit("required", e.target.checked)}
          />
          Required
        </label>
        <button
          onClick={onRemove}
          className="text-sm text-red-400 hover:text-red-300"
        >
          Remove
        </button>
      </div>

      {local.type === "numeric" && (
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={local.min ?? ""}
            onChange={(e) =>
              commit(
                "min",
                e.target.value === "" ? undefined : Number(e.target.value)
              )
            }
            placeholder="Min"
            className="w-24 px-2 py-1 rounded-md bg-[#1e1e1e] text-white border border-[#2a2a2a]"
          />
          <input
            type="number"
            value={local.max ?? ""}
            onChange={(e) =>
              commit(
                "max",
                e.target.value === "" ? undefined : Number(e.target.value)
              )
            }
            placeholder="Max"
            className="w-24 px-2 py-1 rounded-md bg-[#1e1e1e] text-white border border-[#2a2a2a]"
          />
        </div>
      )}

      {(local.type === "short_text" || local.type === "long_text") && (
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={local.maxLength ?? ""}
            onChange={(e) =>
              commit(
                "maxLength",
                e.target.value === "" ? undefined : Number(e.target.value)
              )
            }
            placeholder="Max length"
            className="w-32 px-2 py-1 rounded-md bg-[#1e1e1e] text-white border border-[#2a2a2a]"
          />
        </div>
      )}

      {(local.type === "single_choice" || local.type === "multi_choice") && (
        <ChoiceOptionsEditor
          value={local.options || []}
          onChange={(opts) => commit("options", opts)}
        />
      )}

      <ConditionalEditor
        value={local.visibleIf}
        onChange={(v) => commit("visibleIf", v as any)}
      />
    </div>
  );
}

function ChoiceOptionsEditor({
  value,
  onChange,
}: {
  value: string[];
  onChange: (opts: string[]) => void;
}) {
  const [input, setInput] = useState("");
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add option"
          className="px-2 py-1 rounded-md bg-[#1e1e1e] text-white border border-[#2a2a2a]"
        />
        <button
          type="button"
          className="px-2 py-1 rounded-md bg-[#00dac5] text-black"
          onClick={() => {
            if (!input.trim()) return;
            onChange([...(value || []), input.trim()]);
            setInput("");
          }}
        >
          Add
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {(value || []).map((opt, idx) => (
          <span
            key={`${opt}-${idx}`}
            className="inline-flex items-center gap-2 px-2 py-1 rounded bg-[#1e1e1e] border border-[#2a2a2a] text-xs text-[#e1e1e1]"
          >
            {opt}
            <button
              className="text-red-400"
              onClick={() => onChange(value.filter((_, i) => i !== idx))}
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

function ConditionalEditor({
  value,
  onChange,
}: {
  value?: Question["visibleIf"];
  onChange: (v?: Question["visibleIf"]) => void;
}) {
  const [local, setLocal] = useState<NonNullable<Question["visibleIf"]>>(
    value ?? { questionId: "", operator: "eq", value: "" }
  );
  return (
    <div className="mt-2 space-y-2">
      <div className="text-xs text-[#a0a0a0]">Conditional Visibility</div>
      <div className="flex items-center gap-2">
        <input
          value={local.questionId}
          onChange={(e) => {
            const v = { ...local, questionId: e.target.value };
            setLocal(v);
            onChange(v);
          }}
          placeholder="Depends on questionId"
          className="px-2 py-1 rounded-md bg-[#1e1e1e] text-white border border-[#2a2a2a]"
        />
        <select
          value={local.operator}
          onChange={(e) => {
            const v = { ...local, operator: e.target.value as any };
            setLocal(v);
            onChange(v);
          }}
          className="px-2 py-1 rounded-md bg-[#1e1e1e] text-white border border-[#2a2a2a]"
        >
          <option value="eq">equals</option>
          <option value="neq">not equals</option>
          <option value="includes">includes</option>
          <option value="excludes">excludes</option>
        </select>
        <input
          value={String(local.value ?? "")}
          onChange={(e) => {
            const v = { ...local, value: e.target.value };
            setLocal(v);
            onChange(v);
          }}
          placeholder="Value"
          className="px-2 py-1 rounded-md bg-[#1e1e1e] text-white border border-[#2a2a2a]"
        />
        <button
          className="text-xs text-[#a0a0a0]"
          onClick={() => onChange(undefined)}
        >
          Clear
        </button>
      </div>
    </div>
  );
}
