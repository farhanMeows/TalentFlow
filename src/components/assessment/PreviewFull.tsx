import React from "react";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import type {
  AssessmentSection,
  AssessmentQuestion,
  QuestionType,
} from "../../lib/db"; // adjust to your actual types path

type Props = {
  sections: AssessmentSection[];
  previewAnswers: Record<string, any>;
  setPreviewAnswers: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  isQuestionVisible: (q: AssessmentQuestion) => boolean;
  setViewMode: (mode: "builder" | "preview") => void;
  saveAll: () => Promise<void> | void;
};

export default function PreviewFull({
  sections,
  previewAnswers,
  setPreviewAnswers,
  isQuestionVisible,
  setViewMode,
  saveAll,
}: Props) {
  return (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-card p-6">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Assessment Preview
          </h3>
          <p className="text-muted-foreground">
            This is how candidates will see the assessment
          </p>
        </div>

        {sections.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              No assessment sections created yet
            </p>
            <Button onClick={() => setViewMode("builder")}>
              Start Building
            </Button>
          </div>
        ) : (
          <form className="space-y-6">
            {sections.map((s) => (
              <div key={s.id} className="rounded-lg border border-border p-6">
                <h4 className="text-lg font-semibold text-foreground mb-4">
                  {s.title}
                </h4>
                <div className="space-y-4">
                  {s.questions.map((q) => {
                    const isVisible = isQuestionVisible(q);
                    if (!isVisible) return null;

                    return (
                      <div key={q.id} className="space-y-2">
                        <label className="block text-sm font-medium text-foreground">
                          {q.title}
                          {q.required && (
                            <span className="text-red-400 ml-1">*</span>
                          )}
                        </label>

                        {q.type === "short_text" && (
                          <Input
                            placeholder="Enter your answer..."
                            className="max-w-md"
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
                            className="min-h-[100px] w-full rounded-md border border-border bg-card p-3 text-sm text-foreground"
                            placeholder="Enter your answer..."
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
                            placeholder="Enter a number..."
                            className="max-w-md"
                            value={previewAnswers[q.id] || ""}
                            onChange={(e) =>
                              setPreviewAnswers({
                                ...previewAnswers,
                                [q.id]: e.target.value,
                              })
                            }
                          />
                        )}

                        {q.type === "file" && (
                          <Input type="file" className="max-w-md" />
                        )}

                        {(q.type === "single_choice" ||
                          q.type === "multi_choice") && (
                          <div className="space-y-2">
                            {(q.options || []).map((opt, idx) => (
                              <label
                                key={idx}
                                className="flex items-center space-x-2"
                              >
                                <input
                                  type={
                                    q.type === "single_choice"
                                      ? "radio"
                                      : "checkbox"
                                  }
                                  name={q.id}
                                  className="text-[#bb85fb] focus:ring-[#bb85fb]"
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
                                <span className="text-sm text-foreground">
                                  {opt}
                                </span>
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

            <div className="flex justify-end pt-4">
              <Button onClick={saveAll} className="px-8">
                Submit Assessment
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
