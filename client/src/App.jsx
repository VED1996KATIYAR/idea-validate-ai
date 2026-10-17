import { jsPDF } from "jspdf";
import { useEffect, useState } from "react";
import {
  BrainCircuit, Sparkles, Lightbulb, ArrowRight, LoaderCircle,
  ChartNoAxesCombined, ShieldCheck, Trash2, History,
  Target, Rocket, CheckCircle2, AlertCircle, Zap
} from "lucide-react";
import { Link } from "react-router-dom";


const API = "http://localhost:5000/api";
const STORAGE_KEY = "ideavalidate-reports";

const emptyForm = {
  title: "",
  description: "",
  industry: "EdTech",
  targetAudience: "",
  problem: "",
  solution: "",
  revenueModel: "",
};

const sections = [
  { key: "strengths", title: "Strengths", color: "text-emerald-400" },
  { key: "weaknesses", title: "Weaknesses", color: "text-amber-400" },
  { key: "opportunities", title: "Opportunities", color: "text-sky-400" },
  { key: "threats", title: "Threats", color: "text-rose-400" },
];

function readHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function App() {
  const [user, setUser] = useState(() => {
  try {
    return JSON.parse(localStorage.getItem("ideaValidateUser")) || null;
  } catch {
    return null;
  }
});

useEffect(() => {
  const syncUser = () => {
    try {
      setUser(JSON.parse(localStorage.getItem("ideaValidateUser")) || null);
    } catch {
      setUser(null);
    }
  };

  window.addEventListener("storage", syncUser);
  window.addEventListener("focus", syncUser);

  return () => {
    window.removeEventListener("storage", syncUser);
    window.removeEventListener("focus", syncUser);
  };
}, []);

const handleLogout = () => {
  localStorage.removeItem("ideaValidateToken");
  localStorage.removeItem("ideaValidateUser");
  setUser(null);
  window.location.href = "/";
};
  const [form, setForm] = useState(emptyForm);
  const [report, setReport] = useState(null);
  const [history, setHistory] = useState(readHistory);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  const update = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  async function analyzeIdea(e) {
    e.preventDefault();
    setError("");
    setReport(null);
    setLoading(true);

    try {
      const response = await fetch(`${API}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to analyze idea.");
      }

      const saved = {
        id: crypto.randomUUID(),
        title: form.title,
        createdAt: new Date().toISOString(),
        report: data.report,
      };

      setReport(saved);
      setHistory((old) => [saved, ...old].slice(0, 20));
    } catch (err) {
      setError(
        err.message === "Failed to fetch"
          ? "Backend nahi mil raha. Check karo ki server port 5000 par chal raha hai."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

  function openReport(item) {
    setReport(item);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function deleteReport(id) {
    setHistory((old) => old.filter((item) => item.id !== id));
    if (report?.id === id) setReport(null);
  }

  const score = report?.report?.overallScore;
  const breakdown = report?.report?.scoreBreakdown;
  const details = report?.report;

  


const downloadReport = () => {
  if (!report || !report.report) return;

  const details = report.report;
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const maxWidth = pageWidth - margin * 2;
  let y = 20;

  const addText = (text, fontSize = 11, gap = 7) => {
    doc.setFontSize(fontSize);

    const lines = doc.splitTextToSize(
      String(text ?? "Not available"),
      maxWidth
    );

    if (y + lines.length * 6 > pageHeight - margin) {
      doc.addPage();
      y = 20;
    }

    doc.text(lines, margin, y);
    y += lines.length * 6 + gap;
  };

  const addSection = (heading, value) => {
    addText(heading, 14, 2);

    const text =
      Array.isArray(value)
        ? value.map((item) => `• ${item}`).join("\n") || "None provided"
        : typeof value === "object" && value !== null
        ? JSON.stringify(value, null, 2)
        : value ?? "Not available";

    addText(text, 10, 6);
  };

  // Report title
  doc.setFont("helvetica", "bold");
  addText("IDEAVALIDATE AI", 20, 3);
  addText("Startup Validation Report", 15, 5);

  doc.setFont("helvetica", "normal");
  addText(`Startup Name: ${report.title}`, 11);
  addText(
    `Generated: ${new Date().toLocaleString()}`,
    10,
    10
  );

  // Report details
  addSection(
    "Overall Score",
    `${details.overallScore ?? "N/A"}/100`
  );

  addSection("Summary", details.summary);
  addSection("Score Breakdown", details.scoreBreakdown);
  addSection("Strengths", details.strengths);
  addSection("Weaknesses", details.weaknesses);
  addSection("Opportunities", details.opportunities);
  addSection("Threats", details.threats);
  addSection("Key Risks", details.risks);
  addSection("Monetization Ideas", details.monetizationIdeas);
  addSection("MVP Roadmap", details.mvpRoadmap);
  addSection("Assumptions to Verify", details.assumptions);

  // Download PDF
  const filename = (report.title || "Startup")
    .replace(/[^a-z0-9_-]/gi, "_");

  doc.save(`${filename}-Validation-Report.pdf`);
};



  return (
    <div className="min-h-screen bg-[#090b13] text-slate-100">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#090b13]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <a href="#" className="flex items-center gap-3">
            <div className="rounded-xl bg-violet-500 p-2">
              <BrainCircuit size={23} />
            </div>
            <div>
              <p className="font-bold tracking-tight">
                IdeaValidate <span className="text-violet-400">AI</span>
              </p>
              <p className="text-xs text-slate-500">Startup intelligence</p>
            </div>
          </a>
          <span className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            AI-powered analysis
          </span>
          <div className="flex items-center gap-3">
  {user ? (
    <>
      <span className="text-sm text-slate-300">
        Hi, {user.name}
      </span>

      <button
        onClick={handleLogout}
        className="rounded-lg border border-white/15 px-4 py-2 text-sm"
      >
        Logout
      </button>
    </>
  ) : (
    <>
      <Link to="/login" className="rounded-lg border border-white/15 px-4 py-2 text-sm">
        Login
      </Link>

      <Link to="/signup" className="rounded-lg bg-violet-500 px-4 py-2 text-sm">
        Sign Up
      </Link>
    </>
  )}
</div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-10 md:py-14">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-4 py-2 text-sm text-violet-300">
            <Sparkles size={16} /> Your next big idea starts here
          </div>
          <h1 className="text-4xl font-black leading-tight tracking-tight md:text-6xl">
            Great ideas deserve
            <span className="block bg-gradient-to-r from-violet-400 via-fuchsia-400 to-sky-400 bg-clip-text text-transparent">
              a reality check.
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl leading-7 text-slate-400">
            Validate your startup concept with AI. Explore strengths,
            risks, revenue opportunities and a practical MVP roadmap
            before investing your time and money.
          </p>
        </div>

        <div className="mt-12 grid items-start gap-7 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-violet-950/10 md:p-7">
            <div className="mb-7 flex items-start gap-3">
              <div className="rounded-xl bg-violet-500/15 p-3 text-violet-300">
                <Lightbulb size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Tell us your idea</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Add details for a more useful analysis.
                </p>
              </div>
            </div>

            <form onSubmit={analyzeIdea} className="space-y-5">
              <Field label="Startup idea name *">
                <input
                  required maxLength={120} name="title"
                  value={form.title} onChange={update}
                  placeholder="e.g. Student Notes Marketplace"
                  className={inputStyle}
                />
              </Field>

              <Field label="Describe your idea *">
                <textarea
                  required maxLength={3000} minLength={10}
                  name="description" value={form.description}
                  onChange={update} rows={4}
                  placeholder="What are you building, and how will it work?"
                  className={`${inputStyle} resize-y`}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Industry">
                  <select name="industry" value={form.industry}
                    onChange={update} className={inputStyle}>
                    {["EdTech", "HealthTech", "FinTech", "AI / SaaS",
                      "E-commerce", "FoodTech", "Social Impact", "Other"]
                      .map((x) => <option key={x}>{x}</option>)}
                  </select>
                </Field>
                <Field label="Target audience">
                  <input name="targetAudience" value={form.targetAudience}
                    onChange={update} placeholder="e.g. College students"
                    className={inputStyle} />
                </Field>
              </div>

              <Field label="What problem will you solve?">
                <textarea name="problem" value={form.problem}
                  onChange={update} rows={2}
                  placeholder="Describe the user's main pain point"
                  className={`${inputStyle} resize-y`} />
              </Field>

              <Field label="Your proposed solution">
                <textarea name="solution" value={form.solution}
                  onChange={update} rows={2}
                  placeholder="How will your product solve this?"
                  className={`${inputStyle} resize-y`} />
              </Field>

              <Field label="Revenue model (optional)">
                <input name="revenueModel" value={form.revenueModel}
                  onChange={update}
                  placeholder="e.g. Subscription, commission, ads"
                  className={inputStyle} />
              </Field>

              {error && (
                <div role="alert" className="flex gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-300">
                  <AlertCircle size={19} className="shrink-0" />
                  {error}
                </div>
              )}

              <button disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-4 font-bold transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60">
                {loading
                  ? <><LoaderCircle className="animate-spin" size={20} /> Analyzing your idea...</>
                  : <><Sparkles size={19} /> Validate my idea <ArrowRight size={18} /></>}
              </button>
              <p className="text-center text-xs text-slate-500">
                AI-generated guidance only. Market success is not guaranteed.
              </p>
            </form>
          </section>

          <section className="min-w-0 space-y-6">
            {!report && !loading && (
              <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-dashed border-white/15 bg-white/[0.02] p-8 text-center">
                <div className="mb-5 rounded-2xl bg-violet-500/10 p-5 text-violet-300">
                  <ChartNoAxesCombined size={40} />
                </div>
                <h2 className="text-2xl font-bold">Your validation report</h2>
                <p className="mt-3 max-w-sm leading-6 text-slate-400">
                  Submit your startup idea to uncover its potential,
                  understand the risks and plan your first MVP.
                </p>
                <div className="mt-8 grid w-full max-w-md grid-cols-3 gap-3 text-left">
                  {[
                    [Target, "Market fit"],
                    [ShieldCheck, "Risk analysis"],
                    [Rocket, "MVP roadmap"],
                  ].map(([Icon, label]) => (
                    <div key={label} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                      <Icon className="mb-3 text-violet-300" size={21} />
                      <p className="text-xs text-slate-300">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {loading && (
              <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/[0.02]">
                <LoaderCircle size={48} className="animate-spin text-violet-400" />
                <h2 className="mt-6 text-xl font-bold">Thinking through your idea...</h2>
                <p className="mt-2 text-sm text-slate-400">
                  Evaluating feasibility, risks and opportunities
                </p>
              </div>
            )}

            {report && details && (

              <div className="space-y-5">
                 {/* Naya button */}
    <button
      type="button"
      onClick={downloadReport}
      className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white hover:bg-violet-500"
    >
      ⬇ Download Report
    </button>
                <div className="rounded-3xl border border-violet-400/20 bg-gradient-to-br from-violet-500/10 to-sky-500/5 p-6 md:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-violet-300">VALIDATION REPORT</p>
                      <h2 className="mt-2 text-2xl font-bold">{report.title}</h2>
                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        {details.summary}
                      </p>
                    </div>
                    <div className="flex h-28 w-28 shrink-0 flex-col items-center justify-center rounded-full border-4 border-violet-400/60 bg-violet-500/10">
                      <span className="text-3xl font-black">{score}</span>
                      <span className="text-xs text-slate-400">out of 100</span>
                    </div>
                  </div>

                  <div className="mt-7 space-y-4">
                    {breakdown && Object.entries(breakdown).map(([key, value]) => (
                      <div key={key}>
                        <div className="mb-2 flex justify-between gap-3 text-sm">
                          <span className="capitalize text-slate-300">
                            {key.replace(/([A-Z])/g, " $1")}
                          </span>
                          <span className="font-semibold">{value}/100</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-white/10">
                          <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-sky-400"
                            style={{ width: `${Math.max(0, Math.min(100, Number(value) || 0))}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-5 text-xs text-slate-500">
                    Preliminary AI assessment, not a probability of success.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {sections.map((section) => (
                    <ListCard key={section.key} section={section}
                      items={details[section.key]} />
                  ))}
                </div>

                <ListCard
                  section={{ title: "Key risks", color: "text-rose-300" }}
                  items={details.risks}
                />
                <ListCard
                  section={{ title: "Ways to make money", color: "text-emerald-300" }}
                  items={details.monetizationIdeas}
                />
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
                  <h3 className="flex items-center gap-2 text-lg font-bold">
                    <Rocket size={21} className="text-violet-300" /> Your MVP roadmap
                  </h3>
                  <div className="mt-5 space-y-4">
                    {(details.mvpRoadmap || []).map((step, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-500/15 text-sm font-bold text-violet-300">
                          {i + 1}
                        </div>
                        <p className="pt-1 text-sm leading-6 text-slate-300">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <ListCard
                  section={{ title: "Assumptions to verify", color: "text-amber-300" }}
                  items={details.assumptions}
                />
              </div>
            )}
          </section>
        </div>

        <section className="mt-14 border-t border-white/10 pt-8">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-bold">
                <History size={21} className="text-violet-300" /> Recent analyses
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Saved in this browser, not in a cloud database.
              </p>
            </div>
            {history.length > 0 && (
              <button onClick={() => {
                setHistory([]);
                setReport(null);
              }} className="text-sm text-slate-400 hover:text-rose-300">
                Clear history
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <p className="rounded-xl border border-white/10 p-6 text-center text-sm text-slate-500">
              No reports yet. Analyze your first startup idea above.
            </p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {history.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.025] p-4">
                  <button onClick={() => openReport(item)} className="min-w-0 flex-1 text-left">
                    <p className="truncate font-semibold">{item.title}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                    <p className="mt-2 text-sm text-violet-300">
                      Score: {item.report.overallScore}/100 · View report →
                    </p>
                  </button>
                  <button onClick={() => deleteReport(item.id)}
                    aria-label={`Delete ${item.title}`}
                    className="rounded-lg p-2 text-slate-500 hover:bg-rose-500/10 hover:text-rose-300">
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <footer className="mt-14 border-t border-white/10 py-6 text-center text-xs text-slate-500">
          <p className="flex items-center justify-center gap-2">
            <Zap size={14} /> Built for founders who think big.
          </p>
          <p className="mt-2">AI insights are starting points. Validate assumptions with real customers.</p>
        </footer>
      </main>
    </div>
  );
}

const inputStyle =
  "mt-2 w-full rounded-xl border border-white/10 bg-[#0d101b] px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/10";

function Field({ label, children }) {
  return (
    <label className="block text-sm font-medium text-slate-300">
      {label}
      {children}
    </label>
  );
}

function ListCard({ section, items }) {
  const list = Array.isArray(items) ? items : [];
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <h3 className={`flex items-center gap-2 font-bold ${section.color}`}>
        <CheckCircle2 size={18} /> {section.title}
      </h3>
      {list.length ? (
        <ul className="mt-4 space-y-3">
          {list.map((item, i) => (
            <li key={i} className="flex gap-2 text-sm leading-6 text-slate-300">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-70" />
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-slate-500">No details provided.</p>
      )}
    </div>
  );
}

export default App;
