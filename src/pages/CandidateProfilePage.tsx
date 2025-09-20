import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import {
  addTimelineNote,
  fetchTimeline,
  fetchCandidateById,
} from "../store/features/candidates/candidatesSlice";

const EMPTY_EVENTS: any[] = [];

export default function CandidateProfilePage() {
  const params = useParams();
  const navigate = useNavigate();
  const id = Number(params.id);
  const dispatch = useDispatch<any>();
  const candidate = useSelector((s: any) =>
    s.candidates.items.find((c: any) => c.id === id)
  );
  const events = useSelector(
    (s: any) => s.candidates.timelineById[id] ?? EMPTY_EVENTS
  );
  // Hardcoded interviewers for @mentions
  const INTERVIEWERS: string[] = [
    "Abhishek",
    "Farhan",
    "Rituraj",
    "Sweta",
    "Pandey",
  ];
  const [note, setNote] = useState("");
  const [mentionQuery, setMentionQuery] = useState<string>("");
  const [showMentions, setShowMentions] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const mentionSuggestions = ((): string[] => {
    if (!mentionQuery) return INTERVIEWERS.slice(0, 5);
    const q = mentionQuery.toLowerCase();
    return INTERVIEWERS.filter((name) => name.toLowerCase().includes(q)).slice(
      0,
      5
    );
  })();

  useEffect(() => {
    if (!candidate) {
      dispatch(fetchCandidateById(id));
    }
    dispatch(fetchTimeline(id));
  }, [id]);

  const submitNote = async () => {
    if (!note.trim()) return;
    await dispatch(addTimelineNote({ candidateId: id, text: note.trim() }));
    setNote("");
  };

  function handleTextChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = e.target.value;
    setNote(value);
    // find the token starting with '@' before cursor
    const cursor = e.target.selectionStart || value.length;
    const uptoCursor = value.slice(0, cursor);
    const match = uptoCursor.match(/(^|\s)@([\w\- ]*)$/);
    if (match) {
      const query = match[2] || "";
      setMentionQuery(query);
      setShowMentions(true);
    } else {
      setMentionQuery("");
      setShowMentions(false);
    }
  }

  function insertMention(name: string) {
    const el = textareaRef.current;
    if (!el) return;
    const value = note;
    const cursor = el.selectionStart || value.length;
    const uptoCursor = value.slice(0, cursor);
    const afterCursor = value.slice(cursor);
    const match = uptoCursor.match(/(^|\s)@([\w\- ]*)$/);
    if (!match) return;
    const start = (match.index ?? uptoCursor.length - 1) + match[1].length; // position after leading space/boundary
    const newBefore = uptoCursor.slice(0, start) + "@" + name + " ";
    const next = newBefore + afterCursor;
    setNote(next);
    setShowMentions(false);
    setMentionQuery("");
    // restore caret after inserted mention
    const newPos = newBefore.length;
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(newPos, newPos);
    });
  }

  function goBack() {
    try {
      // history length > 1 usually means there is something to go back to
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate("/candidates");
      }
    } catch {
      navigate("/candidates");
    }
  }

  if (!candidate) return <div className="p-6 text-white">Loading...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto text-white">
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={goBack}
          aria-label="Go back"
          className="inline-flex items-center justify-center rounded-md p-2 bg-[#1e1e1e] border border-[#2a2a2a] hover:bg-[#2a2a2a] focus:outline-none focus:ring-2 focus:ring-[#bb85fb]"
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </button>

        <div>
          <h1 className="text-2xl font-semibold">{candidate.name}</h1>
          <p className="text-sm text-[#e1e1e1]">{candidate.email}</p>
        </div>
      </div>
      <div className="mt-2">
        <span className="px-2 py-1 rounded bg-[#1e1e1e] border border-[#2a2a2a] text-[#bb85fb]">
          {candidate.stage}
        </span>
      </div>

      <div className="mt-8 grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <h2 className="text-xl mb-3">Timeline</h2>
          <div className="space-y-3">
            {events.length === 0 ? (
              <div className="text-[#a0a0a0]">No events yet.</div>
            ) : (
              events.map((e: any) => (
                <div
                  key={e.id}
                  className="p-3 rounded border border-[#2a2a2a] bg-[#121212]"
                >
                  <div className="text-sm text-[#e1e1e1]">
                    {new Date(e.timestamp).toLocaleString()} • {e.type}
                  </div>
                  {e.type === "note" ? (
                    <div className="mt-1">
                      {String((e.payload || {}).text || "")}
                    </div>
                  ) : e.type === "stage_change" ? (
                    <div className="mt-1">
                      Stage: {String((e.payload || {}).from)} →{" "}
                      {String((e.payload || {}).to)}
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </div>
        <div>
          <h2 className="text-xl mb-3">Notes</h2>
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={note}
              onChange={handleTextChange}
              onBlur={() => setTimeout(() => setShowMentions(false), 200)}
              placeholder="Add a note... Use @mention text only for now."
              className="w-full h-32 p-3 rounded bg-[#1e1e1e] text-white border border-[#2a2a2a] focus:outline-none focus:ring-2 focus:ring-[#bb85fb]"
            />
            {showMentions && mentionSuggestions.length > 0 && (
              <div className="absolute left-3 right-3 top-3 z-10 mt-10 rounded border border-[#2a2a2a] bg-[#121212] shadow-lg">
                {mentionSuggestions.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => insertMention(name)}
                    className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[#1e1e1e]"
                  >
                    @{name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={submitNote}
            className="mt-2 px-3 py-2 rounded bg-[#00dac5] text-black"
          >
            Add Note
          </button>
          {candidate.jobId ? (
            <a
              href={`/jobs/${candidate.jobId}/assessment`}
              className="mt-4 inline-block px-3 py-2 rounded bg-[#1e1e1e] border border-[#2a2a2a] text-white"
            >
              Assessment Builder
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
