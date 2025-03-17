"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "./Button";
import { fetchQuizQuestions } from "../utils/fetchQuestions";

const subjects = [
  "Mathematics",
  "Science",
  "History",
  "General Knowledge",
  "Machine Learning",
];

const levels = ["Easy", "Medium", "Hard"];

export const SubjectSelect = ({ onStartQuiz }: { onStartQuiz: (subject: string, level: string) => void ;}) => {
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

      onStartQuiz(selectedSubject , selectedLevel); //Navigate to the quiz
    } catch (error) {
      console.error(" Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      key="subject-select"
      variants={{
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
      }}
      className="w-full h-full flex flex-col p-5"
      initial="initial"
      animate="animate"
      exit="initial"
    >
      <div className="flex-1 flex flex-col">
        <h1 className="text-brand-cerulean-blue font-bold text-2xl text-center mb-8">
          Select Your Subject and Level
        </h1>

        <div className="space-y-6">
          {/* Subject Selection */}
          <div>
            <h2 className="text-lg font-medium mb-3">Subject</h2>
            <div className="grid grid-cols-1 gap-2">
              {subjects.map((subject) => (
                <button
                  key={subject}
                  onClick={() => setSelectedSubject(subject)}
                  className={`p-4 rounded-xl border ${
                    selectedSubject === subject
                      ? "border-brand-cerulean-blue bg-brand-cerulean-blue/10"
                      : "border-brand-light-gray"
                  }`}
                >
                  {subject}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Selection */}
          <div>
            <h2 className="text-lg font-medium mb-3">Difficulty Level</h2>
            <div className="grid grid-cols-3 gap-2">
              {levels.map((level) => (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className={`p-4 rounded-xl border ${
                    selectedLevel === level
                      ? "border-brand-cerulean-blue bg-brand-cerulean-blue/10"
                      : "border-brand-light-gray"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <Button block size="small" disabled={!selectedSubject || !selectedLevel || loading} onClick={handleContinue}>
        {loading ? "Loading..." : "Continue"}
      </Button>
    </motion.div>
  );
};
