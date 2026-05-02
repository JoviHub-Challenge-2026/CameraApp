chat_handler flow:

Receive request → build parts → build gemini_request → send to Gemini → return response


python -m http.server 3000 -- index.
python -m uvicorn main:app --reload --main.py