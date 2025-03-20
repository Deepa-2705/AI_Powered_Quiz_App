"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import React from "react";
import { Result } from "./Result";

interface HistoryEntry {
  subject: string;
  score: number;
  totalQuestions: number;
  difficulty: string;
  date: string;
}

export default function ResultDashboard() {
  const [userHistory, setUserHistory] = useState<HistoryEntry[]>([]);
  const [currentResult, setCurrentResult] = useState<HistoryEntry | null>(null);
  const [isSidePaneOpen, setIsSidePaneOpen] = useState(false);
  const username =
    typeof window !== "undefined" ? localStorage.getItem("username") : null;

  useEffect(() => {
    if (!username) return;

    axios
      .get(`http://localhost:5000/api/users/history/${username}`)
      .then((res) => {
        setUserHistory(res.data);
        if (res.data.length > 0) {
          setCurrentResult(res.data[res.data.length - 1]); // Show latest result
        }
      })
      .catch(() => {
        console.error("Failed to load quiz history");
      });
  }, [username]);

  // Close side pane when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidePane = document.getElementById("side-pane");
      const profileButton = document.getElementById("profile-button");

      if (
        sidePane &&
        !sidePane.contains(event.target as Node) &&
        profileButton &&
        !profileButton.contains(event.target as Node)
      ) {
        setIsSidePaneOpen(false);
      }
    };

    if (isSidePaneOpen) {
      document.addEventListener("click", handleClickOutside);
      document.body.style.overflow = "hidden"; // Prevent scrolling when sidebar is open
    } else {
      document.body.style.overflow = "auto"; // Restore scrolling
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.body.style.overflow = "auto";
    };
  }, [isSidePaneOpen]);

  // Group quiz history by subject
  const subjectWiseStats = userHistory.reduce((acc, entry) => {
    if (!acc[entry.subject]) {
      acc[entry.subject] = { attempts: 0, bestScore: 0 };
    }
    acc[entry.subject].attempts += 1;
    acc[entry.subject].bestScore = Math.max(acc[entry.subject].bestScore, entry.score);
    return acc;
  }, {} as Record<string, { attempts: number; bestScore: number }>);

  return (
    <div className="relative h-screen overflow-y-auto bg-gray-100 p-6">
      {/* Profile Button at Top Left */}
      <button
        id="profile-button"
        className="fixed top-4 left-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-5 py-2 rounded-full shadow-lg hover:scale-105 transition flex items-center space-x-2 z-50"
        onClick={() => setIsSidePaneOpen(!isSidePaneOpen)}
      >
        <span className="text-lg">👤</span>
        <span className="font-semibold">Profile</span>
      </button>

      {/* Overlay (Dim Background When Sidebar Opens) */}
      {isSidePaneOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 transition-opacity z-40"
          onClick={() => setIsSidePaneOpen(false)}
        />
      )}

      {/* Side Pane - Always Appears in Front */}
      <div
        id="side-pane"
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ${
          isSidePaneOpen ? "translate-x-0" : "-translate-x-full"
        } overflow-y-auto p-6 rounded-r-2xl border-r-2 border-gray-300 z-50`}
      >
        {/* Profile Section */}
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-500 text-white flex items-center justify-center rounded-full text-xl font-bold shadow-md">
            {username?.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-2xl font-bold mt-3">{username}</h2>
        </div>

        {/* Quiz Statistics */}
        <div className="mt-6">
          <h3 className="text-lg font-semibold border-b pb-2">Subject-wise Performance</h3>
          <div className="mt-4 space-y-3">
            {Object.entries(subjectWiseStats).map(([subject, stats], index) => (
              <div key={index} className="p-3 bg-gray-100 rounded-lg shadow-sm">
                <h4 className="font-semibold text-blue-600">{subject}</h4>
                <p className="text-gray-700 text-sm">Attempts: {stats.attempts}</p>
                <p className="text-gray-700 text-sm">Best Score: {stats.bestScore}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* **Main Content: Shows the latest quiz result using Result.tsx** */}
      <div className="flex justify-center items-center min-h-screen">
        {currentResult && (
          <Result
            results={{
              correctAnswers: currentResult.score,
              wrongAnswers: currentResult.totalQuestions - currentResult.score,
              secondsUsed: 0, // Adjust if needed
            }}
            totalQuestions={currentResult.totalQuestions}
          />
        )}
      </div>
    </div>
  );
}
