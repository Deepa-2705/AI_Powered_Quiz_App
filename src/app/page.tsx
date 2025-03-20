"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { Countdown } from "@/ui/components/Countdown";
import { Intro } from "@/ui/components/Intro";
import { Quiz } from "@/ui/components/Quiz";
import { SubjectSelect } from "@/ui/components/SubjectSelect";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [displayView, setDisplayView] = useState<"intro" | "subjectSelect" | "countdown" | "quiz">("intro");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      console.log("🔹 Checking authentication, Token:", token);

      if (!token) {
        console.warn("🔸 No token found! Redirecting to login...");
        router.replace("/login"); // ✅ Redirect to login
      } else {
        setIsAuthenticated(true);
      }
    }
  }, []);

  if (!isAuthenticated) {
    return null; // ✅ Prevent flashing home page before redirect
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    router.push("/login"); // ✅ Redirect to login after logout
  };

  const onStartQuiz = (subject: string, level: string) => {
    setSelectedSubject(subject);
    setSelectedLevel(level);
    setDisplayView("countdown");
  };

  return (
    <main className="h-viewport flex flex-col w-full overflow-hidden">
      {/* 🔹 Logout Button at the top */}
      <div className="flex justify-between items-center p-4">
        <h1 className="text-lg font-bold">Welcome to the Quiz App</h1>
        <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">
          Logout
        </button>
      </div>

      <AnimatePresence mode="wait">
        {displayView === "intro" && <Intro onGetStartedClick={() => setDisplayView("subjectSelect")} />}
        {displayView === "subjectSelect" && <SubjectSelect onStartQuiz={onStartQuiz} />}
        {displayView === "countdown" && <Countdown onGoClick={() => setDisplayView("quiz")} />}
        {displayView === "quiz" && <Quiz selectedSubject={selectedSubject} selectedLevel={selectedLevel} />}
      </AnimatePresence>
    </main>
  );
}
