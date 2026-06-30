import os
from typing import List
from .team import Team


class League:
    def __init__(self, teams: List[Team]):
        self.teams = teams

    @classmethod
    def from_data_dir(cls, data_dir: str):
        teams = []

        for file in os.listdir(data_dir):
            if not file.endswith(".json") or file.startswith("_"):
                continue

            path = os.path.join(data_dir, file)
            teams.append(Team.from_json(path))

        return cls(teams)

    # ---------- Core aggregates ----------

    def spending_by_team(self):
        """
        Total cap hit and base salary per team
        """
        return [
            {
                "team": t.name,
                "base_salary": t.total_base_salary(),
                "cap_hit": t.total_cap_hit(),
                "tam_remaining": 0,
            }
            for t in self.teams
        ]

    def dp_u22_counts(self):
        """
        DP and U22 usage per team
        """
        return [
            {
                "team": t.name,
                "designated_players": t.count_role("Designated Player"),
                "u22_players": t.count_role("U22 Initiative"),
                "dp_limit": t.total_dp_spots(),
                "u22_limit": t.total_U22_spots(),
            }
            for t in self.teams
        ]

    def international_usage(self):
        """
        International slots used per team
        """
        return [
            {
                "team": t.name,
                "international_slots_used": t.international_slots_used(),
            }
            for t in self.teams
        ]
    
    def overview(self):
        return [
        {
            "team": t.name,
            "base_salary": t.total_base_salary(),
            "cap_hit": t.total_cap_hit(),
            "tam_remaining": 0,
            "designated_players": t.count_role("Designated Player"),
            "dp_limit": t.total_dp_spots(),
            "u22_players": t.count_role("U22 Initiative"),
            "u22_limit": t.total_U22_spots(),
            "international_slots_used": t.international_slots_used(),
        }
        for t in self.teams
    ]

    # ---------- League tables for frontend ----------

    def spending_profiles(self):
        """
        Spending breakdown used for the League Spending table
        """
        rows = []

        for t in self.teams:
            senior = 0
            dp = 0
            u22 = 0
            supplemental = 0

            for p in getattr(t, "roster", []):
                salary = getattr(p, "guaranteed_comp", None)
                if salary is None:
                    salary = getattr(p, "guaranteedComp", 0)

                role = getattr(p, "role", "")

                if role == "Designated Player":
                    dp += salary
                elif role == "U22 Initiative":
                    u22 += salary
                elif role == "Supplemental Roster":
                    supplemental += salary
                else:
                    senior += salary

            rows.append({
                "team": t.name,
                "senior": senior,
                "dp_spend": dp,
                "u22_spend": u22,
                "supplemental_spend": supplemental,
                "total_spend": senior + dp + u22 + supplemental
            })

        return rows


    def position_spending(self):
        """
        Salary split by position group for visualization bars
        """
        rows = []

        for t in self.teams:
            gk = defense = midfield = attack = 0

            for p in getattr(t, "roster", []):
                salary = getattr(p, "guaranteed_comp", None)
                if salary is None:
                    salary = getattr(p, "guaranteedComp", 0)

                pos = getattr(p, "position", "")

                if pos == "GK":
                    gk += salary
                elif pos in ["CB", "RB", "LB"]:
                    defense += salary
                elif pos in ["CM", "DM", "AM", "LM", "RM"]:
                    midfield += salary
                elif pos in ["ST", "LW", "RW"]:
                    attack += salary

            rows.append({
                "team": t.name,
                "gk": gk,
                "defense": defense,
                "midfield": midfield,
                "attack": attack
            })

        return rows


    def gam_table(self):
        """
        GAM table for league comparison
        """
        return [
            {
                "team": t.name,
                "remaining_gam": t.remaining_gam,
                "starting_gam": t.starting_gam,
                "gam_balance": t.gam_balance,
                "estimated_gam_left": t.get_estimated_gam_left(),
            }
            for t in self.teams
        ]
    
    
    def dp_overview(self):
        """
        Returns all Designated Players for each team with position and spend
        """
        rows = []

        for t in self.teams:
            players = []

            for p in getattr(t, "roster", []):
                role = getattr(p, "role", "")

                if role == "Designated Player":
                    name = getattr(p, "name", None)
                    if name is None:
                        name = getattr(p, "playerName", "")

                    position = getattr(p, "position", "")

                    salary = getattr(p, "guaranteed_comp", None)
                    if salary is None:
                        salary = getattr(p, "guaranteedComp", 0)

                    players.append({
                        "name": name,
                        "position": position,
                        "spend": salary,
                        "status": getattr(p, "status", None),
                        "salary_estimated": getattr(p, "salaryEstimated", False),
                        "dp_buydown_eligible": getattr(p, "dpBuydownEligible", False),
                    })

            rows.append({
                "team": t.name,
                "roster_model": t.get_roster_model(),
                "dp_limit": t.total_dp_spots(),
                "dp_count": t.count_role("Designated Player"),
                "u22_limit": t.total_U22_spots(),
                "u22_count": t.count_role("U22 Initiative"),
                "players": players
            })

        return rows

    def u22_overview(self):
        """
        Returns all U22 Initiative players for each team with position and spend
        """
        rows = []

        for t in self.teams:
            players = []

            for p in getattr(t, "roster", []):
                role = getattr(p, "role", "")

                if role == "U22 Initiative":
                    name = getattr(p, "name", None)
                    if name is None:
                        name = getattr(p, "playerName", "")

                    position = getattr(p, "position", "")

                    salary = getattr(p, "guaranteed_comp", None)
                    if salary is None:
                        salary = getattr(p, "guaranteedComp", 0)

                    players.append({
                        "name": name,
                        "position": position,
                        "spend": salary,
                        "status": getattr(p, "status", None),
                        "salary_estimated": getattr(p, "salaryEstimated", False),
                    })

            rows.append({
                "team": t.name,
                "roster_model": t.get_roster_model(),
                "dp_limit": t.total_dp_spots(),
                "dp_count": t.count_role("Designated Player"),
                "u22_limit": t.total_U22_spots(),
                "u22_count": t.count_role("U22 Initiative"),
                "players": players
            })

        return rows


    def cap_space_table(self):
        """
        Returns cap space and roster flexibility (DP/U22 spots) for each team
        """
        return [t.cap_space_summary() for t in self.teams]
