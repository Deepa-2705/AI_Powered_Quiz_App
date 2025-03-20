"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "./Button";
import { fetchQuizQuestions } from "../utils/fetchQuestions";

const subjects = ["Mathematics", "Science", "History", "General Knowledge", "Machine Learning"];
const levels = ["Easy", "Medium", "Hard"];

export const SubjectSelect = ({ onStartQuiz }: { onStartQuiz: (subject: string, level: string) => void; }) => {
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleContinue = async () => {
    if (!selectedSubject || !selectedLevel) return;
    setLoading(true);

    try {
      const quizQuestions = await fetchQuizQuestions(selectedSubject, selectedLevel);
      localStorage.setItem("quizQuestions", JSON.stringify(quizQuestions)); // Store questions
      onStartQuiz(selectedSubject, selectedLevel);
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      key="subject-select"
      variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } }}
      className="w-full h-full flex flex-col justify-between p-4"
      initial="initial"
      animate="animate"
      exit="initial"
    >
      <h1 className="text-brand-cerulean-blue font-bold text-xl text-center mb-4">
        Select Your Subject and Level
      </h1>

      <div className="flex flex-col flex-1 space-y-4">
        {/* Subject Selection */}
        <div>
          <h2 className="text-sm font-semibold mb-2">Subject</h2>
          <div className="grid gap-1">
            {subjects.map((subject) => (
              <button
                key={subject}
                onClick={() => setSelectedSubject(subject)}
                className={`py-2 px-3 rounded-lg border text-sm ${
                  selectedSubject === subject ? "border-brand-cerulean-blue bg-brand-cerulean-blue/10" : "border-gray-300"
                }`}
              >
                {subject}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Selection */}
        <div>
          <h2 className="text-sm font-semibold mb-2">Difficulty Level</h2>
          <div className="grid grid-cols-3 gap-1">
            {levels.map((level) => (
              <button
                key={level}
                onClick={() => setSelectedLevel(level)}
                className={`py-2 px-3 rounded-lg border text-sm ${
                  selectedLevel === level ? "border-brand-cerulean-blue bg-brand-cerulean-blue/10" : "border-gray-300"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Continue Button - Sticky at the Bottom */}
      <div className="sticky bottom-0 bg-white p-3 border-t">
        <Button block size="small" disabled={!selectedSubject || !selectedLevel || loading} onClick={handleContinue}>
          {loading ? "Loading..." : "Continue"}
        </Button>
      </div>
    </motion.div>
  );
};
