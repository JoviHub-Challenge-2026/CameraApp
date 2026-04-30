#IMPORTS
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from pydantic import BaseModel
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
        "contents": [{
            "parts": parts
            }]
    }

    #dictionary for the gemini request cointaning api key variable.
    headers={"x-goog-api-key": GEMINI_API_KEY}
    response = requests.post(GEMINI_URL, headers=headers, json=gemini_request)
    #Converting the response into a list:   
    response_data = response.json()


    reply = response_data["candidates"][0]["content"]["parts"][0]["text"]

    #Return the reply to the front-end
    return {"reply": reply}
        