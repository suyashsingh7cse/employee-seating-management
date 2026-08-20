import { useState } from "react";
import { Sparkles, Loader2, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { api, ApiError } from "../services/api";

const EXAMPLES = [
  "Move Rahul to B03",
  "Assign Priya Patel to an available seat",
  "Remove John Mathew from his seat",
  "Find an available seat",
];

export default function AIAssistantPage({ data }) {
  const [command, setCommand] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState([]); // [{command, ok, message}]

  async function runCommand(text) {
    const trimmed = text.trim();
    if (!trimmed) return;
    setSubmitting(true);
    try {
      const result = await api.post("/ai/command", { command: trimmed });
      setHistory((h) => [{ command: trimmed, ok: true, message: result.message }, ...h]);
      await data.refresh();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Could not reach the AI assistant.";
      setHistory((h) => [{ command: trimmed, ok: false, message }, ...h]);
    } finally {
      setSubmitting(false);
      setCommand("");
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="w-5 h-5 text-brand" />
        <h1 className="text-lg font-semibold">AI Seating Assistant</h1>
      </div>
      <p className="text-sm text-ink-soft mb-6">
        Describe a seating change in plain English. Gemini interprets the request — Flask validates and
        applies it using the same rules as manual changes.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          runCommand(command);
        }}
        className="flex gap-2 mb-3"
      >
        <input
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="e.g. Move Rahul to B03"
          className="flex-1 px-4 py-3 rounded-lg border border-line bg-surface text-sm focus:border-brand"
          disabled={submitting}
        />
        <button
          type="submit"
          disabled={submitting || !command.trim()}
          className="flex items-center gap-2 bg-sidebar text-white text-sm font-medium px-5 rounded-lg hover:bg-black transition-colors disabled:opacity-60"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Execute"}
        </button>
      </form>

      <div className="flex flex-wrap gap-2 mb-8">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            onClick={() => runCommand(ex)}
            disabled={submitting}
            className="text-xs text-ink-soft border border-line rounded-full px-3 py-1.5 hover:border-brand hover:text-brand-dark transition-colors disabled:opacity-50"
          >
            {ex}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {history.length === 0 && (
          <p className="text-sm text-ink-faint text-center py-8">Run a command to see the result here.</p>
        )}
        {history.map((item, i) => (
          <div key={i} className="bg-surface border border-line rounded-xl p-4">
            <div className="flex items-center gap-2 text-sm font-medium mb-2">
              <ArrowRight className="w-3.5 h-3.5 text-ink-faint" />
              {item.command}
            </div>
            <div
              className={`flex items-start gap-2 text-sm rounded-lg px-3 py-2 ${
                item.ok ? "bg-seat-open-soft text-seat-open" : "bg-seat-error-soft text-seat-error"
              }`}
            >
              {item.ok ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <span>{item.message}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
