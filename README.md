# MLS RosterView

MLS RosterView is a roster and salary-cap tracking site for Major League Soccer. It combines team-level roster pages with leaguewide tables for GAM, cap space, spending, and DP/U22 usage.

Live site: [mlsrosterview.com](https://mlsrosterview.com)

## What The Project Does

The site is built to make MLS roster construction easier to understand. It focuses on:

- Team roster pages with player-level contract and mechanism details
- League tables for spending, GAM, cap space, position spending, and DP/U22 structure
- Estimated cap-compliance views based on the current roster data in this repo
- A frontend-only GM mode for local roster experimentation

This is an independent project and should be treated as an estimate-driven roster resource, not an official MLS or club database.

## Project Structure

```text
rosterview/
├── back-end/
│   ├── app/
│   │   ├── api.py
│   │   ├── main.py
│   │   └── models/
│   ├── data/
│   └── requirements.txt
├── front-end/
│   ├── src/
│   ├── package.json
│   └── ...
├── Club Roster Profiles_Feb 2026.pdf
├── 2025-Fall-Salary-Release.pdf
└── README.md
```

## Stack

- Frontend: React, Vite, React Router, Tailwind CSS
- Backend: FastAPI
- Data layer: hand-maintained JSON files in `back-end/data/`

## Local Development

### 1. Start the backend

```bash
cd back-end
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.api:app --reload
```

The API runs on `http://127.0.0.1:8000` by default.

### 2. Start the frontend

```bash
cd front-end
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` by default.

## Main API Endpoints

- `GET /teams`
- `GET /team/{team_id}`
- `GET /league/spending`
- `GET /league/gam`
- `GET /league/positions`
- `GET /league/dps`
- `GET /league/u22`
- `GET /league/cap-space`

## Where The Data Comes From

The project uses a mix of official source documents and manual estimation.

### Salary numbers

Base salary and guaranteed compensation figures are taken from the MLSPA salary release.

In this repo, that source is represented by:

- `2025-Fall-Salary-Release.pdf`

These numbers are the base layer for player compensation and cap-related calculations.

### Roster designations and roster status

Roster roles and designations are taken from MLS Club Roster Profiles. That includes items such as:

- Designated Player
- U22 Initiative
- TAM Player
- senior vs supplemental roster placement
- player availability/status notes when listed

In this repo, those sources are represented by:

- `Club Roster Profiles_Feb 2026.pdf`
- `Club Roster Profiles_Sept 2025_Final.pdf`

The February 2026 roster profiles are also used for international-slot totals.

### Transfer fees

Transfer fees are estimated using Transfermarkt and then entered into the team JSON data manually. These are not official MLS disclosures.

Those estimates are used to approximate:

- annualized transfer payments
- total spend
- parts of the cap-hit model where fee amortization matters

### International slots

International-slot totals are based on the February 2026 roster profiles and stored in:

- `back-end/data/_feb_2026_international_slots.json`

Usage is then derived from the player records in each team file.

## Data Model Notes

Each club has a JSON file in `back-end/data/` containing the roster and team-level metadata. The backend loads these files into model objects and derives:

- total cap hit
- total guaranteed compensation
- transfer-payment estimates
- remaining GAM
- estimated remaining cap space
- international-slot usage
- roster-compliance checks

Because MLS roster rules are complicated and not every contract term is public, some outputs are best understood as informed estimates rather than exact official accounting.

## Important Caveats

- MLS roster rules change and can contain edge cases that are not fully public.
- Transfer fees are estimated, not official.
- Some status/designation handling depends on how source documents describe a player at a given moment.
- Cap-space and GAM views are modeling tools, not official league numbers.

## Deployment

Production frontend:

- [https://mlsrosterview.com](https://mlsrosterview.com)

The frontend is configured to fetch live API data from the deployed backend.

