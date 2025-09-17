import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import type { RootState, AppDispatch } from "../store/store";
import { Card } from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Toast from "../components/ui/Toast";
import {
  fetchAssessment,
  saveAssessment,
  setLocalSections,
} from "../store/features/assessments/assessmentsSlice";
import type {
  AssessmentSection,
  AssessmentQuestion,
  QuestionType,
} from "../lib/db";

const QUESTION_TYPES: { label: string; value: QuestionType }[] = [
  { label: "Single choice", value: "single_choice" },
  { label: "Multi choice", value: "multi_choice" },
  { label: "Short text", value: "short_text" },
  { label: "Long text", value: "long_text" },
  { label: "Numeric", value: "numeric" },
  { label: "File upload (stub)", value: "file" },
];

function generateId() {
  return Math.random().toString(36).slice(2);
}

export default function AssessmentBuilderPage() {
  const { jobId } = useParams();
  const numericJobId = Number(jobId);
  const dispatch = useDispatch<AppDispatch>();
  const assessment = useSelector(
    (s: RootState) => s.assessments.byJobId[numericJobId]
  );
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"builder" | "preview">("builder");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [previewAnswers, setPreviewAnswers] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!Number.isFinite(numericJobId)) return;
    dispatch(fetchAssessment(numericJobId));
  }, [dispatch, numericJobId]);

  const sections: AssessmentSection[] = useMemo(
    () => assessment?.sections || [],
    [assessment]
  );

  function updateSections(next: AssessmentSection[]) {
    dispatch(setLocalSections({ jobId: numericJobId, sections: next }));
  }

  function addSection() {
    const next: AssessmentSection = {
      id: generateId(),
      title: "New Section",
      questions: [],
    };
    updateSections([...(sections || []), next]);
    setSelectedSection(next.id);
  }

  function updateSectionTitle(id: string, title: string) {
    updateSections(sections.map((s) => (s.id === id ? { ...s, title } : s)));
  }

  function addQuestion(sectionId: string, type: QuestionType) {
    const q: AssessmentQuestion = {
      id: generateId(),
      type,
      title: "Untitled",
      required: false,
    };
    const next = sections.map((s) =>
      s.id === sectionId ? { ...s, questions: [...s.questions, q] } : s
    );
    updateSections(next);
  }

  function updateQuestion(
    sectionId: string,
    questionId: string,
    updates: Partial<AssessmentQuestion>
  ) {
    const next = sections.map((s) =>
      s.id === sectionId
        ? {
            ...s,
            questions: s.questions.map((q) =>
              q.id === questionId ? { ...q, ...updates } : q
            ),
          }
        : s
    );
    updateSections(next);
  }

  function removeQuestion(sectionId: string, questionId: string) {
    const next = sections.map((s) =>
      s.id === sectionId
        ? { ...s, questions: s.questions.filter((q) => q.id !== questionId) }
        : s
    );
    updateSections(next);
  }

  function removeSection(sectionId: string) {
    const next = sections.filter((s) => s.id !== sectionId);
    updateSections(next);
    if (selectedSection === sectionId) {
      setSelectedSection(null);
    }
  }

  async function saveAll() {
    try {
      await dispatch(
        saveAssessment({ jobId: numericJobId, sections })
      ).unwrap();
      setToast({ message: "Assessment saved successfully!", type: "success" });
    } catch (error) {
      setToast({
        message: "Failed to save assessment. Please try again.",
        type: "error",
      });
    }
  }

  function isQuestionVisible(question: AssessmentQuestion): boolean {
    if (!question.visibleIf) return true;

    const { questionId, operator, value } = question.visibleIf;
    const answer = previewAnswers[questionId];

    if (answer === undefined || answer === null || answer === "") return false;

    switch (operator) {
      case "eq":
        return answer === value;
      case "neq":
        return answer !== value;
      case "includes":
        return Array.isArray(answer)
          ? answer.includes(value)
          : answer.toString().includes(value.toString());
      case "excludes":
        return Array.isArray(answer)
          ? !answer.includes(value)
          : !answer.toString().includes(value.toString());
      default:
        return true;
    }
  }

  return (
    <div className="space-y-4">
      {/* Header with mode toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-foreground">
          Assessment Builder
        </h2>
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
          <Button onClick={saveAll}>Save Assessment</Button>
        </div>
      </div>

      {viewMode === "builder" ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <Card className="bg-card p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-medium text-foreground">Sections</h3>
                <Button variant="secondary" onClick={addSection}>
                  Add section
                </Button>
              </div>
              <div className="space-y-3">
                {sections.map((s) => (
                  <div key={s.id} className="rounded border border-border p-3">
                    <div className="mb-2 flex items-center gap-2">
                      <Input
                        value={s.title}
                        onChange={(e) =>
                          updateSectionTitle(s.id, e.target.value)
                        }
                      />
                      <Button
                        variant="secondary"
                        onClick={() => setSelectedSection(s.id)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => removeSection(s.id)}
                        className="px-2 py-1 text-xs"
                      >
                        Remove
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      {QUESTION_TYPES.map((qt) => (
                        <Button
                          key={qt.value}
                          variant="ghost"
                          onClick={() => addQuestion(s.id, qt.value)}
                        >
                          + {qt.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {selectedSection && (
              <Card className="bg-card p-4">
                <h3 className="mb-2 font-medium text-foreground">
                  Edit Section
                </h3>
                {sections
                  .find((s) => s.id === selectedSection)
                  ?.questions.map((q) => (
                    <div
                      key={q.id}
                      className="mb-3 rounded border border-border p-3"
                    >
                      <div className="mb-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                        <Input
                          value={q.title}
                          onChange={(e) =>
                            updateQuestion(selectedSection, q.id, {
                              title: e.target.value,
                            })
                          }
                          placeholder="Question title"
                        />
                        <Select
                          value={q.type}
                          onChange={(e) =>
                            updateQuestion(selectedSection, q.id, {
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
                              updateQuestion(selectedSection, q.id, {
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
                                updateQuestion(selectedSection, q.id, {
                                  min: Number(e.target.value),
                                })
                              }
                            />
                            <Input
                              type="number"
                              placeholder="Max"
                              onChange={(e) =>
                                updateQuestion(selectedSection, q.id, {
                                  max: Number(e.target.value),
                                })
                              }
                            />
                          </>
                        )}
                        {(q.type === "short_text" ||
                          q.type === "long_text") && (
                          <Input
                            type="number"
                            placeholder="Max length"
                            onChange={(e) =>
                              updateQuestion(selectedSection, q.id, {
                                maxLength: Number(e.target.value),
                              })
                            }
                          />
                        )}
                      </div>
                      {(q.type === "single_choice" ||
                        q.type === "multi_choice") && (
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
                                      updateQuestion(selectedSection, q.id, {
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
                                  const value = input.value.trim();
                                  if (value) {
                                    const currentOptions = q.options || [];
                                    updateQuestion(selectedSection, q.id, {
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
                                  <span className="text-sm text-foreground">
                                    {option}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const currentOptions = q.options || [];
                                      updateQuestion(selectedSection, q.id, {
                                        options: currentOptions.filter(
                                          (_, i) => i !== idx
                                        ),
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
                              updateQuestion(selectedSection, q.id, {
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
                                  updateQuestion(selectedSection, q.id, {
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
                                  updateQuestion(selectedSection, q.id, {
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
                                  updateQuestion(selectedSection, q.id, {
                                    visibleIf: {
                                      ...q.visibleIf!,
                                      value: e.target.value,
                                    },
                                  })
                                }
                              />
                            </div>
                            <p className="text-xs text-muted-foreground">
                              This question will only show when the selected
                              question's answer matches the condition.
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="mt-2 flex justify-end">
                        <Button
                          variant="danger"
                          onClick={() => removeQuestion(selectedSection, q.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
              </Card>
            )}
          </div>

          {/* Live Preview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                Live Preview
              </h2>
            </div>
            <Card className="bg-card p-4">
              {sections.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No sections yet. Add one to start building.
                </p>
              )}
              <form className="space-y-4">
                {sections.map((s) => (
                  <div key={s.id} className="rounded border border-border p-3">
                    <h3 className="mb-2 font-medium text-foreground">
                      {s.title}
                    </h3>
                    <div className="space-y-3">
                      {s.questions.map((q) => {
                        const isVisible = isQuestionVisible(q);
                        if (!isVisible) return null;

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
                                          : Array.isArray(
                                              previewAnswers[q.id]
                                            ) &&
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
          </div>
        </div>
      ) : (
        /* Full Preview Mode */
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
                  <div
                    key={s.id}
                    className="rounded-lg border border-border p-6"
                  >
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
                                          : Array.isArray(
                                              previewAnswers[q.id]
                                            ) &&
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
                  <Button className="px-8">Submit Assessment</Button>
                </div>
              </form>
            )}
          </Card>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
