"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "./Button";
import { fetchQuizQuestions } from "../utils/fetchQuestions";

// Subjects and Topics Mapping
const subjectsWithTopics: { [key: string]: string[] } = {
  Mathematics: ["Algebra", "Geometry", "Calculus"],
  Science: ["Physics", "Biology", "Chemistry"],
  History: ["Ancient", "Medieval", "Modern"],
  "General Knowledge": ["Current Affairs", "Geography", "Politics"],
  "Machine Learning": ["Neural Networks", "Supervised Learning", "Unsupervised Learning"],
};

const levels = ["Easy", "Medium", "Hard"];

// Mock valid test codes (Replace with API validation if needed)
const validTestCodes = ["TEST123", "QUIZ456", "STUDENT789"];

// ✅ Add `onStartQuiz` to the prop types
interface SubjectSelectProps {
  testCode?: string;
  onStartQuiz: (subject: string, topic: string, level: string) => void;
}

export const SubjectSelect = ({ testCode, onStartQuiz }: SubjectSelectProps) => {
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [loading, setLoading] = useState(false);
  const [isValidTestCode, setIsValidTestCode] = useState<boolean>(true);

  // ✅ Validate Test Code
  useEffect(() => {
    if (testCode) {
      setIsValidTestCode(validTestCodes.includes(testCode));
    } else {
      setIsValidTestCode(true); // ✅ Allow normal quiz flow when no test code
    }
  }, [testCode]);

  const handleContinue = async () => {
    if (!selectedSubject || !selectedTopic || !selectedLevel || (testCode && !isValidTestCode)) return;
    setLoading(true);

    try {
      const quizQuestions = await fetchQuizQuestions(selectedSubject, selectedTopic, selectedLevel);
      localStorage.setItem("quizQuestions", JSON.stringify(quizQuestions)); // Store questions
      onStartQuiz(selectedSubject, selectedTopic, selectedLevel);
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
        Select Subject, Topic, and Level
      </h1>

      {/* ✅ Display Test Code Validation */}
      {testCode && (
        <p className={`text-center text-sm ${isValidTestCode ? "text-green-600" : "text-red-500"}`}>
          {isValidTestCode ? `✔ Test Code Verified: ${testCode}` : "❌ Invalid Test Code"}
        </p>
      )}

      <div className="flex flex-col flex-1 space-y-4">
        {/* Subject Selection */}
        <div>
          <h2 className="text-sm font-semibold mb-2">Subject</h2>
          <select
            value={selectedSubject}
            onChange={(e) => {
              setSelectedSubject(e.target.value);
              setSelectedTopic(""); // Reset topic when subject changes
            }}
            className="w-full p-2 border rounded-lg"
            disabled={testCode ? !isValidTestCode : false} // ✅ Fix: Proper boolean check
          >
            <option value="">Select Subject</option>
            {Object.keys(subjectsWithTopics).map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>

        {/* Topic Selection (Dependent on Subject) */}
        {selectedSubject && (
          <div>
            <h2 className="text-sm font-semibold mb-2">Topic</h2>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full p-2 border rounded-lg"
              disabled={testCode ? !isValidTestCode : false} // ✅ Fix: Proper boolean check
            >
              <option value="">Select Topic</option>
              {subjectsWithTopics[selectedSubject].map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>
        )}

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
                disabled={testCode ? !isValidTestCode : false} // ✅ Fix: Proper boolean check
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <div className="sticky bottom-0 bg-white p-3 border-t">
        <Button
          block
          size="small"
          disabled={!selectedSubject || !selectedTopic || !selectedLevel || loading || (testCode ? !isValidTestCode : false)}
          onClick={handleContinue}
        >
          {loading ? "Loading..." : "Continue"}
        </Button>
      </div>
    </motion.div>
  );
};
