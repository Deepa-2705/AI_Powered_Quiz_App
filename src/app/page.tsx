"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { Countdown } from "@/ui/components/Countdown";
import { Intro } from "@/ui/components/Intro";
import { Quiz } from "@/ui/components/Quiz";
import { SubjectSelect } from "@/ui/components/SubjectSelect";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [displayView, setDisplayView] = useState<"intro" | "subjectSelect" | "countdown" | "quiz">("intro");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const searchParams = useSearchParams();
  const testCode = searchParams.get("testCode") || ""; // ✅ Read test code from URL
  const router = useRouter();

  // 🔹 Authentication Check
  useState(() => {
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
  });

  if (!isAuthenticated) {
    return null; // ✅ Prevent flashing home page before redirect
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    router.push("/login"); // ✅ Redirect to login after logout
  };

  // ✅ Function to handle quiz start
  const handleStartQuiz = (subject: string, topic: string, level: string) => {
    setSelectedSubject(subject);
    setSelectedTopic(topic);
    setSelectedLevel(level);
    setDisplayView("countdown");
  };

  return (
    <main className="h-viewport flex flex-col w-full overflow-hidden bg-[url('/path-to-background-image.png')] bg-cover bg-center">
      {/* 🔹 Logout Button at the top */}
      <div className="flex justify-between items-center p-4">
        <h1 className="text-lg font-bold">Welcome to the Quiz App</h1>
        <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">
          Logout
        </button>
      </div>

      <AnimatePresence mode="wait">
        {displayView === "intro" && (
          <div className="flex flex-col items-center">
            {/* ✅ Keeping Intro.tsx (without the "Let's Get Started" button) */}
            <Intro onGetStartedClick={() => {}} /> {/* 🔹 Fixed missing prop error */}

            {/* 🔹 Two Navigation Options */}
            <div className="mt-6 flex flex-col gap-4 text-center">
              {/* ✅ Attempt Without Test Code -> Navigates to Subject Selector */}
              <button
                onClick={() => setDisplayView("subjectSelect")}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg text-lg font-semibold shadow-md"
              >
                Attempt Without Test Code
              </button>

              {/* ✅ Link to Attempt Using Test Code */}
              <a
                href="/test-code"
                className="text-blue-600 text-lg font-semibold underline hover:text-blue-800"
              >
                Attempt Using Test Code
              </a>
            </div>
          </div>
        )}

        {/* ✅ Navigates to Subject Select when "Attempt Without Test Code" is clicked */}
        {displayView === "subjectSelect" && <SubjectSelect testCode={testCode} onStartQuiz={handleStartQuiz} />}
        {displayView === "countdown" && <Countdown onGoClick={() => setDisplayView("quiz")} />}
        {displayView === "quiz" && (
          <Quiz selectedSubject={selectedSubject} selectedTopic={selectedTopic} selectedLevel={selectedLevel} />
        )}
      </AnimatePresence>
    </main>
  );
}
