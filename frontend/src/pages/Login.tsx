import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";

import { login } from "../api/auth";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (token) => {
      localStorage.setItem("access_token", token);
      navigate("/dashboard", { replace: true });
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!email.trim() || !password) {
      return;
    }

    loginMutation.mutate({
      email: email.trim(),
      password,
    });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">EvalForge AI</h1>

          <p className="mt-2 text-slate-400">
            Sign in to your evaluation workspace
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-slate-800 bg-slate-900 p-6"
        >
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm text-slate-400">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-slate-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-400">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-slate-500"
              />
            </div>

            {loginMutation.isError && (
              <p className="text-sm text-red-400">
                Invalid email or password.
              </p>
            )}

            <button
              type="submit"
              disabled={
                !email.trim() ||
                !password ||
                loginMutation.isPending
              }
              className="w-full rounded-lg bg-white px-4 py-3 font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loginMutation.isPending
                ? "Signing in..."
                : "Sign In"}
            </button>

            <p className="text-center text-sm text-slate-400">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-white hover:underline"
              >
                Create account
              </Link>
            </p>
          </div>
        </form>
      </div>
    </main>
  );
};

export default Login;