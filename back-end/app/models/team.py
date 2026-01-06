from .player import Player
from typing import List
import json

class Team:
    def __init__(
            self,
            name:str,
            roster_model: str,
    ):
        self.name = name
        self.roster_model = roster_model
        self.roster: List[Player] = []
        self.tam_pool = 2250000

    @classmethod
    def from_json(cls, path: str):
        with open(path, "r") as f:
            data = json.load(f)

        team = cls(
            name=data["teamName"],
            roster_model=data["rosterModel"],
        )

        for p in data["players"]:
            team.roster.append(Player(**p))

        return team

    def _apply_tam(self, players):
        tam_remaining = self.tam_pool
        results = []

        for p in players:
            base_charge = p.base_budget_charge()
            tam_used = 0
            final_charge = base_charge

            if (
                p.role not in ["Designated Player", "U22 Initiative"]
                and p.baseSalary > base_charge
                and tam_remaining > 0
            ):
                needed = p.baseSalary - base_charge
                tam_used = min(needed, tam_remaining)
                tam_remaining -= tam_used
                final_charge = p.baseSalary - tam_used

            results.append({
                "player": p,
                "base_charge": base_charge,
                "final_charge": final_charge,
                "tam_used": tam_used
            })

        return results, tam_remaining
    
    def tam_remaining(self) -> int:
        _, remaining = self._apply_tam(self.active_players())
        return remaining
    def is_active(self, player: Player) -> bool:
        if player.status is None:
            return True

        inactive_statuses = [
            "Unavailable – SEI",
            "Unavailable – On Loan",
            "Supplemental Roster"
        ]

        return player.status not in inactive_statuses
    def get_roster_model(self):
        return self.roster_model
    
    def international_slots_used(self) -> int:
        return sum(
            1
            for p in self.active_players()
            if p.international
        )

    def total_dp_spots(self) -> int:
        if self.roster_model == "Designated Player Model":
            return 3
        return 2
    
    def total_U22_spots(self) -> int:
        if self.roster_model == "U22 Initiative Player Model":
            return 4
        return 3

    def active_players(self):
        return [p for p in self.roster if self.is_active(p)]

    def count_role(self, role: str) -> int:
        return sum(1 for p in self.active_players() if p.role == role)
    
    def is_dp_compliant(self) -> bool:
        return self.count_role("Designated Player") <= self.total_dp_spots()
    
    def is_U22_compliant(self) -> bool:
        return self.count_role("U22 Initiative Player Model") <= self.total_U22_spots()
    
    def total_cap_hit(self) -> int:
        rows, _ = self._apply_tam(self.active_players())
        return sum(r["final_charge"] for r in rows)

    
    def total_base_salary(self) -> int:
        return sum(p.baseSalary for p in self.roster)

    def total_guaranteed_comp(self) -> int:
        return sum(p.guaranteedComp for p in self.roster)
    
    def cap_breakdown(self):
        rows, _ = self._apply_tam(self.roster)

        return [
            {
                "name": r["player"].name,
                "position": r["player"].position,
                "role": r["player"].role,
                "base_salary": r["player"].baseSalary,
                "budget_charge": r["final_charge"],
                "tam_used": r["tam_used"],
                "is_international": r["player"].international,
                "status": r["player"].status
            }
            for r in rows
        ]
    
    def validate_roster(self):
        issues = []

        # DP compliance (uses existing helpers)
        dp_count = self.count_role("Designated Player")
        if not self.is_dp_compliant():
            issues.append({
                "type": "DP_LIMIT",
                "message": f"Too many Designated Players ({dp_count}/{self.total_dp_spots()})"
            })

        # U22 compliance (uses existing helpers)
        u22_count = self.count_role("U22 Initiative")
        if not self.is_U22_compliant():
            issues.append({
                "type": "U22_LIMIT",
                "message": f"Too many U22 Initiative players ({u22_count}/{self.total_U22_spots()})"
            })

        # International slots (only active players already handled)
        intl_used = self.international_slots_used()
        if hasattr(self, "international_slots"):
            if intl_used > self.international_slots:
                issues.append({
                    "type": "INTERNATIONAL_SLOTS",
                    "message": f"International slots exceeded ({intl_used}/{self.international_slots})"
                })

        # Salary cap
        cap_hit = self.total_cap_hit()
        if hasattr(self, "SALARY_CAP"):
            if cap_hit > self.SALARY_CAP:
                issues.append({
                    "type": "SALARY_CAP",
                    "message": f"Team is over the salary cap ({cap_hit:,} > {self.SALARY_CAP:,})"
                })

        return {
            "is_valid": len(issues) == 0,
            "issues": issues,
            "summary": {
                "dp_count": dp_count,
                "dp_limit": self.total_dp_spots(),
                "u22_count": u22_count,
                "u22_limit": self.total_U22_spots(),
                "international_slots_used": intl_used,
                "cap_hit": cap_hit,
                "tam_remaining": self.tam_remaining()
            }
        }
    