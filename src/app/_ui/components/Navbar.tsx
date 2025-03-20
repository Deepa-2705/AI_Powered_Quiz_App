"use client";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    router.push("/login"); // ✅ Redirect to login
  };

  return (
    <nav className="bg-blue-600 p-4 flex justify-between items-center">
      <h1 className="text-white text-xl font-bold">Quiz App</h1>
      <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">
        Logout
      </button>
    </nav>
  );
}
