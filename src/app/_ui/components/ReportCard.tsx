"use client";

import { useEffect, useState } from "react";

interface ReportData {
  subject: string;
  topic: string;
  difficulty: string;
  correctAnswers: number;
  totalQuestions: number;
  timeTaken: number;
}

export const ReportCard = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);

  useEffect(() => {
    const storedReport = localStorage.getItem("quizReport");
    if (storedReport) {
      setReportData(JSON.parse(storedReport));
    }
  }, []);

  if (!reportData) {
    return <p className="text-center text-gray-500">No report data available.</p>;
  }

  const accuracy = ((reportData.correctAnswers / reportData.totalQuestions) * 100).toFixed(2);

  return (
    <div className="max-w-lg mx-auto bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-xl font-bold text-center text-gray-700">Quiz Report</h2>

      <div className="mt-4">
        <p><strong>Subject:</strong> {reportData.subject}</p>
        <p><strong>Topic:</strong> {reportData.topic}</p>
        <p><strong>Difficulty:</strong> {reportData.difficulty}</p>
        <p><strong>Correct Answers:</strong> {reportData.correctAnswers} / {reportData.totalQuestions}</p>
        <p><strong>Time Taken:</strong> {reportData.timeTaken} seconds</p>
        <p><strong>Accuracy:</strong> {accuracy}%</p>
      </div>
    </div>
  );
};
