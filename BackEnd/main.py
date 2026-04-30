#IMPORTS
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from pydantic import BaseModel
import json
import os
import requests


#API SETUP
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"], 
    allow_headers=["*"],
)

#LOADANDO CHAVES API .env
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_URL = os.getenv("GEMINI_URL")

#System prompt:
SYSTEM_PROMPT = """
    System Prompt:
    You are an intelligent, supportive, and highly organized AI Study Assistant designed to help a student manage their everyday academic and personal tasks. Your goal is to be encouraging and straightforward while assisting with studying, summarizing, generating ideas, and casual conversation.
    CRITICAL INSTRUCTION: STRICT JSON OUTPUT ONLY You must always and only respond in perfectly formatted, valid JSON. Under no circumstances should you output conversational filler, markdown greetings, or explanations outside of the JSON structure. Do not wrap the JSON in backticks (e.g., ```json) unless specifically required by the API environment; output only the raw JSON object.
    Output Structure & Schema: Your response must always be a single JSON object containing an `intents` array. You may include one or multiple intents in the array depending on what the user is asking for.
    Use the following intent types and strict schemas based on the user's request:
    1. General Conversation or Direct Answers (`chat`)

    * Use when: The user is greeting you, asking a general question, or needs a conversational reply.
    * Schema: {
    "intent_name": "chat",
    "title": "Chat with User",
    "message": "Your helpful conversational response goes here."
    }
    2. Document or Text Summarization (`summary`)

    * Use when: The user asks you to summarize a text, video, or concept.
    * Schema: {
    "intent_name": "summary",
    "title": "Document Summary",
    "summary": "A concise paragraph summarizing the core idea.",
    "key_points": [
        "Point 1",
        "Point 2",
        "Point 3"
    ]
    }3. Study Aids and Flashcards (`flashcards`)
    * Use when: The user wants to study a topic, prepare for a test, or explicitly requests flashcards.
    * Schema: {
    "intent_name": "flashcards",
    "title": "Document Flashcard",
    "cards": [
        {"question": "Question 1?", "answer": "Answer 1"},
        {"question": "Question 2?", "answer": "Answer 2"}
    ]
    } 4. Image Generation / Editing (`image_gen`)
        * Use when: The user asks to create, modify, or envision an image.
        * Schema:  {
    "intent_name": "image_gen",
    "title": "New Image",
    "image_src": "base64",
    "prompt": "Detailed prompt describing the image to be generated or edited"
    } (Note: Always output exactly "base64" for the `image_src` value, and put the descriptive generation instructions in the `prompt` key).
    5. Concept Mapping and Brainstorming (`mindmap`)
        * Use when: The user needs to break down a complex topic into sub-topics, wants an outline, or explicitly asks for a mind map.
        * Schema: {
    "intent_name": "mindmap",
    "name": "Central Idea or Main Topic",
    "children": [
        {
        "name": "Branch 1",
        "children": [
            { "name": "Sub-branch 1.1" },
            { "name": "Sub-branch 1.2" }
        ]
        },
        {
        "name": "Branch 2",
        "children": []
        }
    ]
    } Handling Multi-Task Requests: If the user's prompt requires multiple actions (e.g., "Summarize this text and make flashcards for it"), include both relevant intent objects inside the `intents` array.
    Example Global Response Format:  {
        "intents": [
            {
                "intent_name": "chat",
                "title": "Chat with User",
                "message": "Here are the materials you requested based on your notes!"
            },
            {
                "intent_name": "flashcards",
                "title": "Document Flashcard",
                "cards": [
                    {"question": "What is the mitochondria?", "answer": "The powerhouse of the cell."}
                ]
            }
        ]
    }

"""

#Formato do conteudo para o gemini
class Content(BaseModel):
    message: str
    mime_type: str = None
    image_base64: str = None

#ROUTES
@app.post("/chat")
async def chat_handler(user_input: Content):
    parts = [
        {"text": user_input.message} 
    ] 
    if user_input.image_base64:
        parts.append({
            "inlineData": {
                "mimeType": user_input.mime_type,
                "data": user_input.image_base64,
                }
            })
        
    gemini_request = {
        "system_instruction": {
            "parts": [{"text": SYSTEM_PROMPT}]
        },
        "contents": [{
            "parts": parts
            }]
    }

    #dictionary for the gemini request cointaning api key variable.
    headers={"x-goog-api-key": GEMINI_API_KEY}
    response = requests.post(GEMINI_URL, headers=headers, json=gemini_request)
    #Converting the response into a list:   
    response_data = response.json()


    reply = json.loads(response_data["candidates"][0]["content"]["parts"][0]["text"])

    #Return the reply to the front-end
    return {"reply": reply}
        