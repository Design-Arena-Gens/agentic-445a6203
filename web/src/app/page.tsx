'use client';

import { useMemo, useState } from "react";
import { generateWorkflow } from "@/lib/n8nGenerator";

const EXAMPLE_PROMPTS = [
  "When a new row is added to Google Sheets, format the data, send it to Slack, and follow up with an email summary.",
  "Every morning at 9 AM fetch the latest posts from a webhook, filter for mentions of n8n, and store them in Airtable.",
  "Receive a webhook from Stripe for new payments, wait 5 minutes, then notify the customer success team in Slack.",
];

export default function Home() {
  const [prompt, setPrompt] = useState(EXAMPLE_PROMPTS[0]);
  const [copied, setCopied] = useState(false);

  const generated = useMemo(() => generateWorkflow(prompt), [prompt]);
  const jsonOutput = useMemo(
    () => JSON.stringify(generated.workflow, null, 2),
    [generated.workflow],
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonOutput);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Clipboard error", error);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([jsonOutput], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "workflow.json";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-100 py-16 font-sans text-slate-900">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6">
        <header className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
              n8n builder
            </span>
            <h1 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
              Describe your workflow. Get production-ready n8n JSON instantly.
            </h1>
          </div>
          <p className="max-w-3xl text-lg text-slate-500">
            Type a prompt explaining the automation you want. We translate it
            into a structured workflow with nodes, connections, notes, and
            sensible defaults that you can import straight into n8n.
          </p>
        </header>

        <section className="grid gap-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex flex-col gap-2">
              <label
                className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400"
                htmlFor="prompt"
              >
                prompt
              </label>
              <textarea
                id="prompt"
                className="min-h-[180px] w-full resize-vertical rounded-2xl border border-slate-200 bg-slate-50 p-4 text-base text-slate-800 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="Explain the automation you need..."
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {EXAMPLE_PROMPTS.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => setPrompt(example)}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  {example.slice(0, 45)}...
                </button>
              ))}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                workflow steps
              </h2>
              <ol className="space-y-3">
                {generated.steps.map((step, index) => (
                  <li
                    key={`${step.nodeName}-${index}`}
                    className="flex gap-3 rounded-xl bg-white p-4 shadow-sm"
                  >
                    <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                      {index + 1}
                    </span>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                        {step.nodeName}
                      </span>
                      <p className="text-base leading-relaxed text-slate-600">
                        {step.summary}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-slate-900 p-8 text-slate-100 shadow-lg">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
                generated json
              </span>
              <p className="text-base text-slate-300">
                Copy or download this workflow file and import it into your n8n
                instance. Nodes are sequentially connected with helpful notes to
                keep context from your prompt.
              </p>
            </div>
            <pre className="flex-1 overflow-auto rounded-2xl border border-slate-800 bg-slate-950 p-4 text-[13px] leading-6 text-slate-100">
              {jsonOutput}
            </pre>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleCopy}
                className="flex-1 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                {copied ? "Copied!" : "Copy JSON"}
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="flex-1 rounded-full border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-400"
              >
                Download .json
              </button>
            </div>
          </div>
        </section>

        <footer className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-8 text-sm text-slate-500">
          Import tip: In n8n, open the workflow list, click the dropdown next to
          “Add workflow”, choose “Import from file”, and select the downloaded
          JSON. Adjust credentials on each node before activating.
        </footer>
      </main>
    </div>
  );
}
