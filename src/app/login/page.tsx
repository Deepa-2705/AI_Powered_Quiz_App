"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // ✅ Handle Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("⚠ Email and password are required.");
      setLoading(false);
      return;
    }

    try {
      console.log(`🔹 Sending ${isSignup ? "signup" : "login"} request...`);
      const response = await axios.post(
        `http://127.0.0.1:8000/api/auth/${isSignup ? "register" : "login"}`,
        JSON.stringify({ email, password }), // ✅ Ensure JSON format
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("✅ Success:", response.data);

      if (!isSignup) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("username", response.data.username);
        router.push("/"); // ✅ Redirect after login
      } else {
        alert("🎉 Account created! You can now log in.");
        setIsSignup(false); // ✅ Switch to login mode after signup
      }
    } catch (err: any) {
      console.error("❌ API Error:", err.response?.data || err.message);

      // ✅ Fix: Extract error message properly
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          setError(err.response.data.detail.map((d: any) => d.msg).join(", "));
        } else {
          setError(err.response.data.detail);
        }
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex items-center justify-center h-screen">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-80">
        <h2 className="text-xl font-bold mb-4">{isSignup ? "Create an Account" : "Login"}</h2>
        {error && <p className="text-red-500">{error}</p>}

        <input
          type="email"
          placeholder="Enter your email"
          className="border p-2 w-full mb-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Enter your password"
          className="border p-2 w-full mb-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="bg-blue-500 text-white px-4 py-2 w-full" disabled={loading}>
          {loading ? "Processing..." : isSignup ? "Sign Up" : "Login"}
        </button>

        <p className="mt-4 text-center text-sm">
          {isSignup ? "Already have an account?" : "Don't have an account?"}
          <span className="text-blue-500 cursor-pointer ml-1" onClick={() => setIsSignup((prev) => !prev)}>
            {isSignup ? " Login" : " Create an Account"}
          </span>
        </p>
      </form>
    </div>
  );
}
