"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import axios from "axios"; // ✅ Ensure axios is imported
import { Button } from "@/ui/components/Button";
import { OptionList } from "./OptionList";
import { formatTime } from "../utils/formatTime";
import { QuizQuestion } from "../utils/fetchQuestions";
import { useRouter } from "next/navigation";
import { Result } from "./Result";
import {
  playCorrectAnswer,
  playWrongAnswer,
  playQuizEnd,
} from "../utils/playSound";

// Define props type
interface QuizProps {
  selectedSubject: string;
  selectedLevel: string;
}

const TIME_LIMIT = 60; // 1 minute per question

export const Quiz = ({ selectedSubject, selectedLevel }: QuizProps) => {
  const router = useRouter();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ Corrected state variable for questions
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [timePassed, setTimePassed] = useState(0);
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(-1);
  const [quizFinished, setQuizFinished] = useState(false);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);
  const [results, setResults] = useState({
    correctAnswers: 0,
    wrongAnswers: 0,
    secondsUsed: 0,
  });

  // ✅ Load questions from localStorage or fetch new ones
  useEffect(() => {
    const storedQuestions = localStorage.getItem("quizQuestions");
    if (storedQuestions) {
      setQuizQuestions(JSON.parse(storedQuestions));
    } else {
      fetchQuestions(); // ✅ Fetch from API if not stored
    }
  }, []);

  // ✅ Check if user is logged in before showing quiz
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login"); // Redirects to login page if not logged in
    }
  }, []);

  // ✅ Fetch AI-generated questions from API
  const fetchQuestions = async () => {
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/quiz/generate", {
        topic: selectedSubject,
        difficulty: selectedLevel,
      });
  
      console.log("🔹 API Response:", response.data); // ✅ Debugging
  
      if (!response.data || response.data.length === 0) {
        console.warn("⚠ No questions received from API!");
        return;
      }
  
      setQuizQuestions(response.data); // ✅ Save questions to state
      localStorage.setItem("quizQuestions", JSON.stringify(response.data)); // ✅ Store for later use
    } catch (error) {
      console.error("❌ Error fetching quiz questions:", error);
    }
  };
  

  const setupTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimePassed((prevTimePassed) =>
        prevTimePassed > TIME_LIMIT ? TIME_LIMIT : prevTimePassed + 1
      );
    }, 1000);
  };

  useEffect(() => {
    if (quizFinished) return;
    setupTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [quizFinished]);

  useEffect(() => {
    if (quizFinished || timePassed <= TIME_LIMIT) return;
    if (selectedAnswerIndex === -1) {
      setResults((prev) => ({
        ...prev,
        wrongAnswers: prev.wrongAnswers + 1,
      }));
    }
    handleNextQuestion();
    setTimePassed(0);
  }, [timePassed]);

  const handleNextQuestion = () => {
    setSelectedAnswerIndex(-1);
    if (activeQuestion + 1 < quizQuestions.length) {
      setActiveQuestion((prev) => prev + 1);
      setTimePassed(0); // Reset timer
      setupTimer();
    } else {
      playQuizEnd();
      setQuizFinished(true);
    }
  };

  const handleSelectAnswer = (answerIndex: number) => {
    clearInterval(timerRef.current!);
    setSelectedAnswerIndex(answerIndex);
    const correctAnswer = quizQuestions[activeQuestion]?.correctAnswer;
    const selectedAnswer = quizQuestions[activeQuestion]?.options[answerIndex];

    if (correctAnswer === selectedAnswer) {
      playCorrectAnswer();
      setResults((prev) => ({
        ...prev,
        secondsUsed: prev.secondsUsed + timePassed,
        correctAnswers: prev.correctAnswers + 1,
      }));
      setIsCorrectAnswer(true);
    } else {
      playWrongAnswer();
      setResults((prev) => ({
        ...prev,
        secondsUsed: prev.secondsUsed + timePassed,
        wrongAnswers: prev.wrongAnswers + 1,
      }));
      setIsCorrectAnswer(false);
    }
  };

  if (quizFinished) {
    return <Result results={results} totalQuestions={quizQuestions.length} />;
  }

  if (quizQuestions.length === 0 || !quizQuestions[activeQuestion]) {
    return <p>Loading questions...</p>;
  }

  const { question, options } = quizQuestions[activeQuestion];

  return (
    <motion.div
      key={"countdown"}
      variants={{
        initial: { background: "#FF6A66", clipPath: "circle(0% at 50% 50%)" },
        animate: { background: "#ffffff", clipPath: "circle(100% at 50% 50%)" },
      }}
      className="w-full h-full flex justify-center p-5"
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col text-black font-bold text-[32px] text-center w-full">
        <h1 className="font-bold text-base text-brand-cerulean-blue">
          Daily Practice Paper Test
        </h1>

        <div className="mt-6 rounded-2xl border border-brand-light-gray px-7 py-4 w-full mb-1">
          <h3 className="text-black font-medium text-sm">
            Question {activeQuestion + 1} / {quizQuestions.length}
          </h3>
          <h4 className="text-brand-midnight font-medium text-base mt-[34px]">
            {question}
          </h4>
        </div>

        <OptionList
          activeQuestion={quizQuestions[activeQuestion]}
          options={options}
          selectedAnswerIndex={selectedAnswerIndex}
          onAnswerSelected={handleSelectAnswer}
          isCorrectAnswer={isCorrectAnswer}
        />

        <div className="mt-auto w-full z-10">
          <Button
            disabled={selectedAnswerIndex === -1}
            block
            size="small"
            onClick={handleNextQuestion}
          >
            Next
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
