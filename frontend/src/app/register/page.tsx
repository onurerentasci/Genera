"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AtSymbolIcon, LockClosedIcon, UserIcon } from "@heroicons/react/24/outline";

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [formError, setFormError] = useState("");
  const router = useRouter();
  const { register, isLoading, error } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (formData.password !== formData.confirmPassword) {
      setFormError("Passwords do not match");
      return;
    }
    if (formData.password.length < 6) {
      setFormError("Password must be at least 6 characters long");
      return;
    }
    try {
      await register(formData.username, formData.email, formData.password);
      router.push("/");
    } catch (err) {
      // Error is handled by the auth context
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-950 via-purple-800 to-fuchsia-900 p-4">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-fuchsia-200 animate-fade-in">
        <h2 className="text-3xl font-extrabold text-center text-purple-900 mb-2 tracking-tight">Create an Account</h2>
        <p className="text-center text-gray-500 mb-6">Join Genera and start sharing your AI art!</p>
        {(error || formError) && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
            {error || formError}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <UserIcon className="w-5 h-5 absolute left-3 top-3 text-fuchsia-400" />
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-2 text-purple-900 rounded-lg border border-fuchsia-200 focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-200 outline-none transition"
              required
            />
          </div>
          <div className="relative">
            <AtSymbolIcon className="w-5 h-5 absolute left-3 top-3 text-fuchsia-400" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-2 text-purple-900 rounded-lg border border-fuchsia-200 focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-200 outline-none transition"
              required
            />
          </div>
          <div className="relative">
            <LockClosedIcon className="w-5 h-5 absolute left-3 top-3 text-fuchsia-400" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-2 text-purple-900 rounded-lg border border-fuchsia-200 focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-200 outline-none transition"
              required
            />
          </div>
          <div className="relative">
            <LockClosedIcon className="w-5 h-5 absolute left-3 top-3 text-fuchsia-400" />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full pl-10 pr-3 py-2 text-purple-900 rounded-lg border border-fuchsia-200 focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-200 outline-none transition"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold text-lg shadow transition disabled:opacity-60"
            disabled={isLoading}
          >
            {isLoading ? "Registering..." : "Register"}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <a href="/login" className="text-fuchsia-600 hover:underline font-semibold">Login</a>
        </div>
      </div>
    </div>
  );
}