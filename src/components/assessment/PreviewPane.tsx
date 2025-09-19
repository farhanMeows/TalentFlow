import React from "react";
import { Card } from "@/components/ui/Card"; // adjust import if needed
import Input from "@/components/ui/Input"; // adjust import if needed
import type { AssessmentSection, AssessmentQuestion } from "../../lib/db"; // use your actual types

type Props = {
  sections: AssessmentSection[];
  previewAnswers: Record<string, any>;
  setPreviewAnswers: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  isQuestionVisible: (q: AssessmentQuestion) => boolean;
};

export default function PreviewPane({
  sections,
  previewAnswers,
  setPreviewAnswers,
  isQuestionVisible,
}: Props) {
  return (
    <Card className="bg-card p-4">
      {sections.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No sections yet. Add one to start building.
        </p>
      )}

      <form className="space-y-4">
        {sections.map((s) => (
          <div key={s.id} className="rounded border border-border p-3">
            <h3 className="mb-2 font-medium text-foreground">{s.title}</h3>

            <div className="space-y-3">
              {s.questions.map((q) => {
                if (!isQuestionVisible(q)) return null;

                return (
                  <div key={q.id} className="space-y-1">
                    <label className="text-sm text-foreground">
                      {q.title}
                      {q.required ? " *" : ""}
                    </label>

                    {q.type === "short_text" && (
                      <Input
                        value={previewAnswers[q.id] || ""}
                        onChange={(e) =>
                          setPreviewAnswers({
                            ...previewAnswers,
                            [q.id]: e.target.value,
                          })
                        }
                      />
                    )}

                    {q.type === "long_text" && (
                      <textarea
                        className="min-h-[72px] w-full rounded-md border border-border bg-card p-2 text-sm text-foreground"
                        value={previewAnswers[q.id] || ""}
                        onChange={(e) =>
                          setPreviewAnswers({
                            ...previewAnswers,
                            [q.id]: e.target.value,
                          })
                        }
                      />
                    )}

                    {q.type === "numeric" && (
                      <Input
                        type="number"
                        value={previewAnswers[q.id] || ""}
                        onChange={(e) =>
                          setPreviewAnswers({
                            ...previewAnswers,
                            [q.id]: e.target.value,
                          })
                        }
                      />
                    )}

                    {q.type === "file" && <Input type="file" />}

                    {(q.type === "single_choice" ||
                      q.type === "multi_choice") && (
                      <div className="flex flex-wrap gap-2">
                        {(q.options || []).map((opt, idx) => (
                          <label
                            key={idx}
                            className="text-sm text-muted-foreground"
                          >
                            <input
                              type={
                                q.type === "single_choice"
                                  ? "radio"
                                  : "checkbox"
                              }
                              name={q.id}
                              className="mr-2"
                              checked={
                                q.type === "single_choice"
                                  ? previewAnswers[q.id] === opt
                                  : Array.isArray(previewAnswers[q.id]) &&
                                    previewAnswers[q.id].includes(opt)
                              }
                              onChange={(e) => {
                                if (q.type === "single_choice") {
                                  setPreviewAnswers({
                                    ...previewAnswers,
                                    [q.id]: opt,
                                  });
                                } else {
                                  const current = Array.isArray(
                                    previewAnswers[q.id]
                                  )
                                    ? previewAnswers[q.id]
                                    : [];
                                  if (e.target.checked) {
                                    setPreviewAnswers({
                                      ...previewAnswers,
                                      [q.id]: [...current, opt],
                                    });
                                  } else {
                                    setPreviewAnswers({
                                      ...previewAnswers,
                                      [q.id]: current.filter(
                                        (item: string) => item !== opt
                                      ),
                                    });
                                  }
                                }
                              }}
                            />
                            {opt}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </form>
    </Card>
  );
}
