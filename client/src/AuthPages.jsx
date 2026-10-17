
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API = "http://localhost:5000/api";

export default function AuthPages({ mode }) {
  const isSignup = mode === "signup";
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const endpoint = isSignup ? "signup" : "login";

      const response = await fetch(`${API}/auth/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          isSignup
            ? { name, email, password }
            : { email, password }
        ),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      if (isSignup) {
        setMessage("Account created! You can now log in.");
        setTimeout(() => navigate("/login"), 800);
      } else {
        localStorage.setItem("ideaValidateToken", data.token);
        localStorage.setItem(
          "ideaValidateUser",
          JSON.stringify(data.user)
        );
        navigate("/");
      }
    } catch (err) {
      setError(err.message || "Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-5">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-8 shadow-xl">
        <Link to="/" className="text-sm text-cyan-400 hover:text-cyan-300">
          ← Back to IdeaValidate AI
        </Link>

        <h1 className="mt-6 text-3xl font-bold">
          {isSignup ? "Create your account" : "Welcome back"}
        </h1>

        <p className="mt-2 text-slate-400">
          {isSignup
            ? "Join IdeaValidate AI and evaluate your startup ideas."
            : "Log in to your IdeaValidate AI account."}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {isSignup && (
            <div>
              <label className="mb-1 block text-sm">Full name</label>
              <input
                className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 outline-none focus:border-cyan-400"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoComplete="name"
                required
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm">Email</label>
            <input
              className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 outline-none focus:border-cyan-400"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm">Password</label>
            <input
              className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 outline-none focus:border-cyan-400"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              autoComplete={isSignup ? "new-password" : "current-password"}
              minLength={isSignup ? 8 : undefined}
              required
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-400">
              {error}
            </p>
          )}

          {message && (
            <p role="status" className="text-sm text-green-400">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-cyan-500 p-3 font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50"
          >
            {loading
              ? "Please wait..."
              : isSignup
                ? "Create Account"
                : "Log In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          {isSignup ? "Already have an account? " : "New to IdeaValidate AI? "}
          <Link
            className="font-semibold text-cyan-400 hover:underline"
            to={isSignup ? "/login" : "/signup"}
          >
            {isSignup ? "Log in" : "Sign up"}
          </Link>
        </p>
      </div>
    </main>
  );
}
