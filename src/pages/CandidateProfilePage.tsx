import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  addTimelineNote,
  fetchTimeline,
  fetchCandidateById,
} from "../store/features/candidates/candidatesSlice";

const EMPTY_EVENTS: any[] = [];

export default function CandidateProfilePage() {
  const params = useParams();
  const id = Number(params.id);
  const dispatch = useDispatch<any>();
  const candidate = useSelector((s: any) =>
    s.candidates.items.find((c: any) => c.id === id)
  );
  const events = useSelector(
    (s: any) => s.candidates.timelineById[id] ?? EMPTY_EVENTS
  );
  const [note, setNote] = useState("");

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

  if (!candidate) return <div className="p-6 text-white">Loading...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto text-white">
      <h1 className="text-2xl font-semibold">{candidate.name}</h1>
      <p className="text-[#e1e1e1]">{candidate.email}</p>
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
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note... Use @mention text only for now."
            className="w-full h-32 p-3 rounded bg-[#1e1e1e] text-white border border-[#2a2a2a] focus:outline-none focus:ring-2 focus:ring-[#bb85fb]"
          />
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
