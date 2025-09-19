import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import type { RootState, AppDispatch } from "../store/store";
import { Card } from "../components/ui/Card";
import Button from "../components/ui/Button";
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
import BuilderToolbar from "../components/assessment/BuilderToolbar";
import SectionEditor from "../components/assessment/SectionEditor";
import PreviewPane from "../components/assessment/PreviewPane";
import PreviewFull from "@/components/assessment/PreviewFull";
import SectionEditorPanel from "@/components/assessment/SectionEditorPanel";

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
    console.log("meow me");

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
      <BuilderToolbar
        title="Assessment Builder"
        viewMode={viewMode}
        setViewMode={setViewMode}
        onSave={saveAll}
      />

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
                  <SectionEditor
                    key={s.id}
                    section={s}
                    QUESTION_TYPES={QUESTION_TYPES}
                    updateSectionTitle={updateSectionTitle}
                    setSelectedSection={setSelectedSection}
                    removeSection={removeSection}
                    addQuestion={(sectionId: string, type: string) =>
                      addQuestion(sectionId, type as QuestionType)
                    }
                  />
                ))}
              </div>
            </Card>

            {selectedSection && (
              <SectionEditorPanel
                sections={sections}
                selectedSection={selectedSection}
                QUESTION_TYPES={QUESTION_TYPES}
                updateQuestion={updateQuestion}
                removeQuestion={removeQuestion}
              />
            )}
          </div>

          {/* Live Preview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                Live Preview
              </h2>
            </div>
            <PreviewPane
              sections={sections}
              previewAnswers={previewAnswers}
              setPreviewAnswers={setPreviewAnswers}
              isQuestionVisible={isQuestionVisible}
            />
          </div>
        </div>
      ) : (
        /* Full Preview Mode */
        <div className="max-w-4xl mx-auto">
          <PreviewFull
            sections={sections}
            previewAnswers={previewAnswers}
            setPreviewAnswers={setPreviewAnswers}
            isQuestionVisible={isQuestionVisible}
            setViewMode={setViewMode}
            saveAll={saveAll}
          />
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
