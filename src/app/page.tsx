"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { Countdown } from "@/ui/components/Countdown";
import { Intro } from "@/ui/components/Intro";
import { Quiz } from "@/ui/components/Quiz";
import { SubjectSelect } from "@/ui/components/SubjectSelect";

export default function Home() {
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [displayView, setDisplayView] = useState<"intro" | "subjectSelect" | "countdown" | "quiz">("intro");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      console.log("🔹 Token in localStorage:", token);

      if (!token) {
        console.warn("🔸 No token found! Redirecting to login in 2 seconds...");
        setTimeout(() => {
          router.push("/login");
        }, 2000); // 2-second delay before redirect
      } else {
        setIsAuthChecked(true);
      }
    }
  }, []);

  if (!isAuthChecked) {
    return <div>Loading...</div>; // Prevents redirect before authentication check
  }

  const onStartQuiz = (subject: string, level: string) => {
    setSelectedSubject(subject);
    setSelectedLevel(level);
    setDisplayView("countdown"); // Transition to countdown before quiz starts
  };

  return (
    <main className="h-viewport flex flex-col w-full overflow-hidden">
      <AnimatePresence mode="wait">
        {displayView === "intro" && (
          <Intro onGetStartedClick={() => setDisplayView("subjectSelect")} />
        )}

        {displayView === "subjectSelect" && (
          <SubjectSelect onStartQuiz={onStartQuiz} />
        )}

        {displayView === "countdown" && (
          <Countdown onGoClick={() => setDisplayView("quiz")} />
        )}

        {displayView === "quiz" && (
          <Quiz selectedSubject={selectedSubject} selectedLevel={selectedLevel} />
        )}
      </AnimatePresence>
    </main>
  );
}
