import { useEffect, useState } from "react";
import React from "react";
import axios from "axios";

interface QuizHistory {
  subject: string;
  score: number;
  totalQuestions: number;
  difficulty: string;
  date: string;
}

interface SubjectStats {
  attempts: number;
  bestScore: number;
}

interface ProfileCardProps {
  username: string;
  isVisible?: boolean; // Control visibility (only in side pane)
}

const ProfileCard: React.FC<ProfileCardProps> = ({ username, isVisible }) => {
  const [history, setHistory] = useState<QuizHistory[]>([]);
  const [subjectStats, setSubjectStats] = useState<{ [key: string]: SubjectStats }>({});
  const [showHistory, setShowHistory] = useState(false); // Toggle history view

  useEffect(() => {
    if (username) {
      axios.get(`http://localhost:5000/api/users/history/${username}`)
        .then((res) => {
          setHistory(res.data);

          // Calculate subject-wise attempts & best scores
          const stats: { [key: string]: SubjectStats } = {};
          res.data.forEach((quiz: QuizHistory) => {
            if (!stats[quiz.subject]) {
              stats[quiz.subject] = { attempts: 0, bestScore: 0 };
            }
            stats[quiz.subject].attempts++;
            stats[quiz.subject].bestScore = Math.max(stats[quiz.subject].bestScore, quiz.score);
          });
          setSubjectStats(stats);
        })
        .catch(() => {
          setHistory([]);
        });
    }
  }, [username]);

  // **Ensure ProfileCard is only rendered in the side pane**
  if (!isVisible) return null;

  return (
    <div className="bg-white border border-gray-300 shadow-md rounded-lg p-4 w-full text-center">
      <h2 className="text-lg font-semibold text-gray-800">{username}</h2>

      {/* Toggle Button for Performance Stats */}
      <button
        onClick={() => setShowHistory(!showHistory)}
        className="mt-2 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition"
      >
        {showHistory ? "Hide History" : "View History"}
      </button>

      {showHistory && (
        <div className="mt-4 bg-gray-100 p-4 rounded-lg shadow-inner max-h-60 overflow-y-auto">
          <h3 className="text-md font-semibold mb-2">Subject-wise Stats</h3>
          {Object.entries(subjectStats).map(([subject, stats]) => (
            <div key={subject} className="p-2 border-b border-gray-300 text-left">
              <p className="font-medium">{subject}</p>
              <p>Attempts: {stats.attempts}</p>
              <p>Best Score: {stats.bestScore}</p>
            </div>
          ))}

          {/* History of All Attempts */}
          <h3 className="text-md font-semibold mt-4">Quiz History</h3>
          {history.map((entry, index) => (
            <div key={index} className="p-2 border-b border-gray-300 text-left">
              <p className="font-medium">{entry.subject}</p>
              <p>Score: {entry.score}/{entry.totalQuestions}</p>
              <p>Difficulty: {entry.difficulty}</p>
              <p>
                Date & Time:{" "}
                {new Date(entry.date).toLocaleDateString()}{" "}
                {new Date(entry.date).toLocaleTimeString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfileCard;
