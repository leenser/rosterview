from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.models.team import Team
import os
import json


app = FastAPI(title="MLS RosterView API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/team/{team_id}")
def get_team(team_id: str):
    try:
        team = Team.from_json(f"data/{team_id}.json")
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Team not found")

    return {
        "team": team.name,
        "players": len(team.roster),
        "roster_model": team.get_roster_model(),
        "international_slots_used": team.international_slots_used(),
        "cap": {
            "total_base_salary": team.total_base_salary(),
            "total_cap_hit": team.total_cap_hit(),
            "tam_remaining": team.tam_remaining()
        },
        "counts": {
            "designated_players": team.count_role("Designated Player"),
            "u22_players": team.count_role("U22 Initiative")
        },
        "cap_breakdown": team.cap_breakdown(),
        "validation": team.validate_roster()
    }

@app.get("/teams")
def get_teams():
    teams = []
    data_dir = "data"

    for file in os.listdir(data_dir):
        if not file.endswith(".json"):
            continue

        team_id = file.replace(".json", "")
        path = os.path.join(data_dir, file)

        try:
            with open(path, "r") as f:
                data = json.load(f)
                teams.append({
                    "id": team_id,
                    "name": data.get("teamName", team_id)
                })
        except Exception:
            continue
    teams.sort(key=lambda t: t["name"])
    return teams