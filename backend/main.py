from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import requests

app = FastAPI()

# Allow frontend to make requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/matches")
def get_matches():
    headers = {"X-Auth-Token": "123a8fd359df4b9a9b19d131a94eae83"}
    url = "https://api.football-data.org/v4/competitions/PL/matches"
    res = requests.get(url, headers=headers)
    return res.json()