import os
import httpx
import json
import re
import random  # ✅ Import for shuffling
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

router = APIRouter()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent"

class QuizRequest(BaseModel):
    subject: str
    topic: str
    difficulty: str

@router.post("/generate")
async def generate_quiz(request: QuizRequest):
    """
    Calls Gemini API to generate structured quiz questions with shuffled answer choices.
    """
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API key is missing.")

    prompt = f"""
    Generate 15 multiple-choice questions on {request.topic} ({request.subject}) at {request.difficulty} difficulty.
    Format the response as JSON:
    [
        {{
            "question": "What is 2 + 2?",
            "options": ["1", "2", "3", "4"],
            "correctAnswer": "4"
        }},
        ...
    ]
    """

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(
                GEMINI_API_URL,
                json={"contents": [{"parts": [{"text": prompt}]}]},
                headers={"Content-Type": "application/json"},
                params={"key": GEMINI_API_KEY},
            )
        
        # Debugging Logs
        print("🔹 Gemini API Status:", response.status_code)
        print("🔹 Gemini API Response:", response.text)

        if response.status_code != 200:
            raise HTTPException(status_code=500, detail=f"Gemini API Error: {response.text}")

        response_data = response.json()

        # Extract response
        if "candidates" not in response_data:
            raise HTTPException(status_code=500, detail="Invalid response from Gemini API.")

        generated_text = response_data["candidates"][0]["content"]["parts"][0]["text"]

        # Debugging logs to check response
        print("Raw Response from Gemini:", generated_text)

        # Clean up Gemini response and parse JSON
        try:
            cleaned_text = generated_text.strip().strip("```json").strip("```")  # ✅ Remove unnecessary formatting
            quiz_data = json.loads(cleaned_text)
        except json.JSONDecodeError:
            print("❌ Gemini response was not valid JSON, trying to parse manually...")
            quiz_data = parse_quiz_text(generated_text)

        if not isinstance(quiz_data, list):
            raise HTTPException(status_code=500, detail="Gemini response is not a valid quiz format.")

        # ✅ Shuffle answer choices for each question
        shuffled_quiz = [shuffle_options(q) for q in quiz_data]

        return shuffled_quiz  # ✅ Return shuffled questions

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating quiz: {str(e)}")


def shuffle_options(question_data):
    """
    Takes a dictionary with 'options' and 'correctAnswer' and shuffles the options.
    Ensures correctAnswer is placed randomly.
    """
    options = question_data["options"]
    correct_answer = question_data["correctAnswer"]

    # ✅ Shuffle options while keeping track of the correct answer
    random.shuffle(options)

    return {
        "question": question_data["question"],
        "options": options,
        "correctAnswer": correct_answer  # ✅ Correct answer remains the same
    }


def parse_quiz_text(text):
    """
    Parses Gemini's unstructured text output into structured JSON.
    """
    questions = []
    quiz_items = text.strip().split("\n\n")  # Split by double newlines

    for item in quiz_items:
        lines = item.strip().split("\n")
        if len(lines) >= 5:  # Ensure at least 1 question + 4 options
            question = lines[0].strip()
            options = [re.sub(r"^[a-dA-D]\)", "", opt).strip() for opt in lines[1:5]]
            
            # ✅ Shuffle options before storing them
            random.shuffle(options)

            correct_answer = options[-1]  # Assume last option is correct (can be adjusted)

            questions.append({
                "question": question,
                "options": options,
                "correctAnswer": correct_answer
            })

    return questions
