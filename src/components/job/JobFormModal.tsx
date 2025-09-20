import Modal from "../ui/Modal";
import Input from "../ui/Input";
import TagGroupPicker from "../TagPicker";
import Button from "../ui/Button";

type Props = {
  open: boolean;
  onClose: () => void;
  editingJobId: number | null;
  titleValue: string;
  setTitleValue: (v: string) => void;
  slugValue: string;
  setSlugValue: (v: string) => void;
  tagsInput: string;
  setTagsInput: (v: string) => void;
  onSubmit: () => Promise<void> | void;
  formError?: string | null;
  onDeleteClick?: () => void;
  tagGroups: Record<string, string[]>;
};

export default function JobFormModal({
  open,
  onClose,
  editingJobId,
  titleValue,
  setTitleValue,
  slugValue,
  setSlugValue,
  tagsInput,
  setTagsInput,
  onSubmit,
  formError,
  onDeleteClick,
  tagGroups,
}: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editingJobId == null ? "Create Job" : "Edit Job"}
    >
      <div className="flex flex-col gap-3">
        <label className="text-sm font-medium text-[#a0a0a0]">
          Title
          <Input
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
          />
        </label>

        <label className="text-sm font-medium text-[#a0a0a0]">
          Slug
          <Input
            value={slugValue}
            onChange={(e) => setSlugValue(e.target.value)}
          />
        </label>

        <div className="text-sm font-medium text-[#a0a0a0]">Tags</div>

        <TagGroupPicker
          groups={tagGroups}
          selected={tagsInput
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)}
          onChange={(tags) => setTagsInput(tags.join(", "))}
        />

        {formError && <p className="text-sm text-rose-400">{formError}</p>}

        <div className="mt-2 flex justify-between gap-3">
          {editingJobId != null && onDeleteClick && (
            <Button
              variant="danger"
              className="bg-rose-600 hover:bg-rose-700"
              onClick={onDeleteClick}
            >
              Delete Job
            </Button>
          )}

          <div className="ml-auto flex gap-3">
            <Button
              variant="secondary"
              className="border-[rgba(255,255,255,0.03)] bg-[#121212] text-[#e1e1e1] hover:bg-[#151515]"
              onClick={onClose}
            >
              Cancel
            </Button>

            <Button
              className="bg-[#bb85fb] hover:bg-[#a46df0]"
              onClick={onSubmit}
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
