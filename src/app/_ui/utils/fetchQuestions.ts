import axios from "axios" ;
export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export const fetchQuizQuestions = async (topic: string, difficulty: string) => {
  try {
    const response = await axios.post("http://localhost:8000/api/quiz/generate", { topic, difficulty , numQuestions:15 });

    console.log("API Response:", response.data); // Debugging log

    if (!response.data) {
      throw new Error("API returned no data");
    }

    if (!Array.isArray(response.data)) {
      console.warn("Expected an array, converting to array:", response.data);
      return [response.data];  // Convert single object to array
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching quiz questions:", error);
    return [];
  }
};