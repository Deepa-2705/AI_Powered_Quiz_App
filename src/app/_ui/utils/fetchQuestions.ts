import axios from "axios";

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export const fetchQuizQuestions = async (subject: string, topic: string, difficulty: string) => {
  try {
    console.log(`🔹 Fetching Quiz Questions: Subject=${subject}, Topic=${topic}, Difficulty=${difficulty}`);

    const response = await axios.post("http://localhost:8000/api/quiz/generate", {
      subject,  // ✅ Ensure correct API field
      topic, 
      difficulty, 
      numQuestions: 15,
    });

    console.log("✅ API Response:", response.data); // Debugging log

    if (!response.data || !Array.isArray(response.data)) {
      console.warn("⚠ Unexpected API response format, converting to array:", response.data);
      return [response.data]; // Convert to array if needed
    }

    return response.data;
  } catch (error: any) {
    console.error("❌ Error fetching quiz questions:", error.response?.data || error.message);
    return [];
  }
};
