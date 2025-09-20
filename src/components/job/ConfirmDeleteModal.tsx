import Modal from "../ui/Modal";
import Button from "../ui/Button";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
};

export default function ConfirmDeleteModal({
  open,
  onClose,
  onConfirm,
}: Props) {
  return (
    <Modal open={open} onClose={onClose} title="Confirm delete">
      <p className="text-sm text-[#e1e1e1]">This action cannot be undone.</p>

      <div className="mt-4 flex justify-end gap-3">
        <Button
          variant="secondary"
          className="border-[rgba(255,255,255,0.03)] bg-[#121212] text-[#e1e1e1] hover:bg-[#151515]"
          onClick={onClose}
        >
          Cancel
        </Button>

        <Button
          variant="danger"
          className="bg-rose-600 hover:bg-rose-700"
          onClick={onConfirm}
        >
          Delete
        </Button>
      </div>
    </Modal>
  );
}
