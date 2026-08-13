import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";

import apiClient from "../api/client";

interface RegisterPayload {
  full_name: string;
  email: string;
  password: string;
}

const register = async (payload: RegisterPayload) => {
  const response = await apiClient.post("/auth/register", payload);
  return response.data;
};

const Register = () => {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const registerMutation = useMutation({
    mutationFn: register,
    onSuccess: () => {
      navigate("/login", { replace: true });
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!fullName.trim() || !email.trim() || !password) {
      return;
    }

    registerMutation.mutate({
      full_name: fullName.trim(),
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
            Create your evaluation workspace
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-slate-800 bg-slate-900 p-6"
        >
          <div className="space-y-5">

            <div>
              <label className="mb-2 block text-sm text-slate-400">
                Full Name
              </label>

              <input
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Your name"
                autoComplete="name"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-slate-500"
              />
            </div>

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
                autoComplete="new-password"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none transition focus:border-slate-500"
              />
            </div>

            {registerMutation.isError && (
              <p className="text-sm text-red-400">
                Registration failed. Please check your details.
              </p>
            )}

            <button
              type="submit"
              disabled={
                !fullName.trim() ||
                !email.trim() ||
                !password ||
                registerMutation.isPending
              }
              className="w-full rounded-lg bg-white px-4 py-3 font-semibold text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {registerMutation.isPending
                ? "Creating account..."
                : "Create Account"}
            </button>

            <p className="text-center text-sm text-slate-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-white hover:underline"
              >
                Sign in
              </Link>
            </p>

          </div>
        </form>
      </div>
    </main>
  );
};

export default Register;