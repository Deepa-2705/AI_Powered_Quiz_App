import requests
import os

# Define the API endpoint
url = "http://127.0.0.1:8000/api/quiz/generate"

# Define the request payload (Example: Topic & Difficulty)
data = {
    "topic": "Mathematics",
    "difficulty": "Easy"
}

# GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
# url = f"https://generativelanguage.googleapis.com/v1/models?key=AIzaSyC5W5OnKmtge0FX9RmjRaa6dK3g4DHlovg"

# response = requests.get(url)
# print(response.json())  # Shows available models


# Send a POST request
response = requests.post(url, json=data)

# Print the response
print("Status Code:", response.status_code)
print("Response JSON:", response.json())
