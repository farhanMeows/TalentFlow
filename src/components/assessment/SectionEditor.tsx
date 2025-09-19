import Button from "../ui/Button"; // adjust import path
import Input from "../ui/Input"; // adjust import path

type QuestionType = {
  value: string;
  label: string;
};

type Props = {
  section: { id: string; title: string };
  QUESTION_TYPES: QuestionType[];
  updateSectionTitle: (id: string, title: string) => void;
  setSelectedSection: (id: string) => void;
  removeSection: (id: string) => void;
  addQuestion: (sectionId: string, type: string) => void;
};

export default function AssessmentSectionCard({
  section,
  QUESTION_TYPES,
  updateSectionTitle,
  setSelectedSection,
  removeSection,
  addQuestion,
}: Props) {
  return (
    <div key={section.id} className="rounded border border-border p-3">
      <div className="mb-2 flex items-center gap-2">
        <Input
          value={section.title}
          onChange={(e) => updateSectionTitle(section.id, e.target.value)}
        />
        <Button
          variant="secondary"
          onClick={() => setSelectedSection(section.id)}
        >
          Edit
        </Button>
        <Button
          variant="danger"
          onClick={() => removeSection(section.id)}
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
            onClick={() => addQuestion(section.id, qt.value)}
          >
            + {qt.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
