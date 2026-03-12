from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.models.team import Team
from app.models.league import League
import os
import json

DATA_DIR = "data"
league = League.from_data_dir(DATA_DIR)


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
        "remaining_gam": team.get_remaining_gam(),
        "international_slots_used": team.international_slots_used(),
        "cap": {
            "total_base_salary": team.total_base_salary(),
            "total_cap_hit": team.total_cap_hit(),
            "total_comp": team.total_guaranteed_comp()
        },
        "counts": {
            "designated_players": team.count_designation("Designated Player"),
            "u22_players": team.count_designation("U22 Initiative"),
            "tam_players": team.count_designation("TAM Player"),
            "supplemental_players": team.count_supplemental()
        },
        "cap_breakdown": team.cap_breakdown(),
        "validation": team.validate_roster()
    }

@app.get("/teams")
def get_teams():
    teams = []
    data_dir = DATA_DIR

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

@app.get("/league/spending")
def league_spending():
    return league.spending_profiles()


@app.get("/league/positions")
def league_positions():
    return league.position_spending()


@app.get("/league/gam")
def league_gam():
    return league.gam_table()

@app.get("/league/dps")
def league_dps():
    league = League.from_data_dir(DATA_DIR)
    return league.dp_overview()

@app.get("/league/u22")
def league_u22():
    """
    Returns all U22 Initiative players for each team
    """
    league = League.from_data_dir(DATA_DIR)
    return league.u22_overview()