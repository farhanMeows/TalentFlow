import Button from "../ui/Button";

type Props = {
  onCreate: () => void;
  title?: string;
};

export default function JobsHeader({ onCreate, title = "Jobs" }: Props) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-semibold text-white">{title}</h1>
      <Button className="shadow-md shadow-[#bb85fb]/20" onClick={onCreate}>
        New Job
      </Button>
    </div>
  );
}
