import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
// Replace these imports with your actual types file if you have one
import type {
  AssessmentSection,
  AssessmentQuestion,
  QuestionType,
} from "../../lib/db";

type Props = {
  sections: AssessmentSection[];
  selectedSection: string | null;
  QUESTION_TYPES: { value: string; label: string }[];
  updateQuestion: (
    sectionId: string,
    questionId: string,
    updates: Partial<AssessmentQuestion>
  ) => void;
  removeQuestion: (sectionId: string, questionId: string) => void;
};

export default function SectionEditorPanel({
  sections,
  selectedSection,
  QUESTION_TYPES,
  updateQuestion,
  removeQuestion,
}: Props) {
  const section = sections.find((s) => s.id === selectedSection);

  return (
    <Card className="bg-card p-4">
      <h3 className="mb-2 font-medium text-foreground">Edit Section</h3>

      {section?.questions.map((q) => (
        <div key={q.id} className="mb-3 rounded border border-border p-3">
          <div className="mb-2 grid grid-cols-1 gap-2 md:grid-cols-2">
            <Input
              value={q.title}
              onChange={(e) =>
                updateQuestion(selectedSection!, q.id, {
                  title: e.target.value,
                })
              }
              placeholder="Question title"
            />
            <Select
              value={q.type}
              onChange={(e) =>
                updateQuestion(selectedSection!, q.id, {
                  type: e.target.value as QuestionType,
                })
              }
            >
              {QUESTION_TYPES.map((qt) => (
                <option key={qt.value} value={qt.value}>
                  {qt.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="mb-2 flex items-center gap-2">
            <label className="text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={!!q.required}
                onChange={(e) =>
                  updateQuestion(selectedSection!, q.id, {
                    required: e.target.checked,
                  })
                }
                className="mr-2"
              />
              Required
            </label>

            {q.type === "numeric" && (
              <>
                <Input
                  type="number"
                  placeholder="Min"
                  onChange={(e) =>
                    updateQuestion(selectedSection!, q.id, {
                      min: Number(e.target.value),
                    })
                  }
                />
                <Input
                  type="number"
                  placeholder="Max"
                  onChange={(e) =>
                    updateQuestion(selectedSection!, q.id, {
                      max: Number(e.target.value),
                    })
                  }
                />
              </>
            )}

            {(q.type === "short_text" || q.type === "long_text") && (
              <Input
                type="number"
                placeholder="Max length"
                onChange={(e) =>
                  updateQuestion(selectedSection!, q.id, {
                    maxLength: Number(e.target.value),
                  })
                }
              />
            )}
          </div>

          {(q.type === "single_choice" || q.type === "multi_choice") && (
            <div className="mb-2">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add option..."
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const input = e.target as HTMLInputElement;
                        const value = input.value.trim();
                        if (value) {
                          const currentOptions = q.options || [];
                          updateQuestion(selectedSection!, q.id, {
                            options: [...currentOptions, value],
                          });
                          input.value = "";
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={(e) => {
                      const input = (
                        e.target as HTMLElement
                      ).parentElement?.querySelector(
                        "input"
                      ) as HTMLInputElement;
                      const value = input?.value.trim();
                      if (value) {
                        const currentOptions = q.options || [];
                        updateQuestion(selectedSection!, q.id, {
                          options: [...currentOptions, value],
                        });
                        input.value = "";
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>

                <div className="space-y-1">
                  {(q.options || []).map((option, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-[#1e1e1e] rounded px-2 py-1"
                    >
                      <span className="text-sm text-foreground">{option}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const currentOptions = q.options || [];
                          updateQuestion(selectedSection!, q.id, {
                            options: currentOptions.filter((_, i) => i !== idx),
                          });
                        }}
                        className="text-red-400 hover:text-red-300 text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Conditional Logic */}
          <div className="mb-2 p-3 bg-[#1e1e1e] rounded border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">
                Conditional Logic
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  const currentVisibleIf = q.visibleIf;
                  updateQuestion(selectedSection!, q.id, {
                    visibleIf: currentVisibleIf
                      ? undefined
                      : {
                          questionId: "",
                          operator: "eq",
                          value: "",
                        },
                  });
                }}
              >
                {q.visibleIf ? "Remove Condition" : "Add Condition"}
              </Button>
            </div>

            {q.visibleIf && (
              <div className="space-y-2">
                <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                  <Select
                    value={q.visibleIf.questionId}
                    onChange={(e) =>
                      updateQuestion(selectedSection!, q.id, {
                        visibleIf: {
                          ...q.visibleIf!,
                          questionId: e.target.value,
                        },
                      })
                    }
                  >
                    <option value="">Select question...</option>
                    {sections
                      .flatMap((s) => s.questions)
                      .filter((otherQ) => otherQ.id !== q.id)
                      .map((otherQ) => (
                        <option key={otherQ.id} value={otherQ.id}>
                          {otherQ.title}
                        </option>
                      ))}
                  </Select>

                  <Select
                    value={q.visibleIf.operator || "eq"}
                    onChange={(e) =>
                      updateQuestion(selectedSection!, q.id, {
                        visibleIf: {
                          ...q.visibleIf!,
                          operator: e.target.value as any,
                        },
                      })
                    }
                  >
                    <option value="eq">equals</option>
                    <option value="neq">not equals</option>
                    <option value="includes">includes</option>
                    <option value="excludes">excludes</option>
                  </Select>

                  <Input
                    placeholder="Value to match..."
                    value={String(q.visibleIf.value || "")}
                    onChange={(e) =>
                      updateQuestion(selectedSection!, q.id, {
                        visibleIf: {
                          ...q.visibleIf!,
                          value: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  This question will only show when the selected question's
                  answer matches the condition.
                </p>
              </div>
            )}
          </div>

          <div className="mt-2 flex justify-end">
            <Button
              variant="danger"
              onClick={() => removeQuestion(selectedSection!, q.id)}
            >
              Remove
            </Button>
          </div>
        </div>
      ))}
    </Card>
  );
}
