"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { SubjectSelect } from "@/ui/components/SubjectSelect";
import { Countdown } from "@/ui/components/Countdown";
import { Quiz } from "@/ui/components/Quiz";

// 🔹 Mock Valid Test Codes (Replace with API validation if needed)
const VALID_TEST_CODES = ["TEST123", "QUIZ456", "CODE789"];

export default function TestCodePage() {
  const [testCode, setTestCode] = useState("");
  const [error, setError] = useState("");
  const [displayView, setDisplayView] = useState<"testCode" | "subjectSelect" | "countdown" | "quiz">("testCode");

  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string>("");

  const handleSubmitTestCode = (e: React.FormEvent) => {
    e.preventDefault();

    if (!VALID_TEST_CODES.includes(testCode.trim())) {
      setError("❌ Invalid Test Code. Please enter a valid code.");
      return;
    }

    setDisplayView("subjectSelect"); // ✅ Move to subject selection
  };

  const onStartQuiz = (subject: string, topic: string, level: string) => {
    setSelectedSubject(subject);
    setSelectedTopic(topic);
    setSelectedLevel(level);
    setDisplayView("countdown"); // ✅ Move to countdown
  };

  return (
    <motion.div
      key="test-code-flow"
      className={`w-full h-screen flex flex-col items-center justify-center p-4 
        ${displayView === "countdown" ? "bg-red-500 text-white" : "bg-gray-100"}
      `}
    >
      {displayView === "testCode" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-6 rounded-lg shadow-md text-center w-96"
        >
          <h1 className="text-xl font-bold mb-4">Enter Test Code</h1>

          <form onSubmit={handleSubmitTestCode} className="space-y-4">
            <input
              type="text"
              value={testCode}
              onChange={(e) => setTestCode(e.target.value)}
              placeholder="Enter your Test Code"
              className="p-2 border rounded-lg w-full"
            />

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full">
              Submit
            </button>
          </form>
        </motion.div>
      )}

      {displayView === "subjectSelect" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-10 w-full"
        >
          <SubjectSelect testCode={testCode} onStartQuiz={onStartQuiz} />
        </motion.div>
      )}

      {displayView === "countdown" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 flex justify-center items-center"
        >
          <Countdown onGoClick={() => setDisplayView("quiz")} />
        </motion.div>
      )}

      {displayView === "quiz" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-10 w-full"
        >
          <Quiz selectedSubject={selectedSubject} selectedTopic={selectedTopic} selectedLevel={selectedLevel} />
        </motion.div>
      )}
    </motion.div>
  );
}
