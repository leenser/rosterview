from .player import Player
from functools import lru_cache
from pathlib import Path
from typing import List
import json

INTERNATIONAL_SLOTS_PATH = Path(__file__).resolve().parents[2] / "data" / "_feb_2026_international_slots.json"
MLS_SALARY_CAP = 6_425_000
MLS_TAM_AVAILABLE = 2_125_000


@lru_cache(maxsize=1)
def load_international_slots():
    with open(INTERNATIONAL_SLOTS_PATH, "r") as f:
        payload = json.load(f)
    return payload.get("teams", {})

class Team:
    def __init__(
            self,
            name:str,
            roster_model: str,
            remaining_gam: int,
            starting_gam: int,
            gam_balance: int,
            international_slots: int = 8
    ):
        self.name = name
        self.roster_model = roster_model
        self.roster: List[Player] = []
        self.remaining_gam = remaining_gam
        self.starting_gam = starting_gam
        self.gam_balance = gam_balance
        self.international_slots = international_slots

    @classmethod
    def from_json(cls, path: str):
        with open(path, "r") as f:
            data = json.load(f)

        team_id = Path(path).stem
        slot_lookup = load_international_slots()
        slot_entry = slot_lookup.get(team_id)
        if slot_entry is None and team_id.endswith("-2026"):
            slot_entry = slot_lookup.get(team_id[:-5])

        team = cls(
            name=data["teamName"],
            roster_model=data["rosterModel"],
            remaining_gam=data.get("availableGAM", 0),
            starting_gam=data.get("startingGAM", 0),
            gam_balance=data.get("GAMBalance", 0),
            international_slots=(slot_entry or {}).get("international_slots", 8)
        )

        for p in data["players"]:
            team.roster.append(Player(**p))

        return team

    def is_active(self, player: Player) -> bool:
        if player.status is None:
            return True

        inactive_statuses = [
            "Unavailable – On Loan",
            "Unavailable – Off Roster",
            "Unavailable – Injured List",
            "Unavailable – SEI"
        ]

        return player.status not in inactive_statuses
    def get_roster_model(self):
        return self.roster_model
    def get_remaining_gam(self):
        return self.remaining_gam

    def get_starting_gam(self):
        return self.starting_gam
    def get_balance_gam(self):
        return self.gam_balance

    def get_estimated_gam_left(self):
        return self.remaining_gam + self.gam_balance

    def get_remaining_cap_space(self):
        remaining_cap_space = MLS_SALARY_CAP + MLS_TAM_AVAILABLE + self.starting_gam + self.gam_balance - self.total_cap_hit()
        if remaining_cap_space < 0:
            gam_offset = min(max(self.get_estimated_gam_left(), 0), abs(remaining_cap_space))
            remaining_cap_space += gam_offset
        return remaining_cap_space
    
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
    
    def count_designation(self, role) -> int:
        return sum(
            1 for p in self.active_players()
            if p.role == role
        )
    
    def count_supplemental(self) -> int:
        return sum(
            1 for p in self.roster
            if p.role == "Supplemental Roster"
        )
    
    def count_senior(self) -> int:
        return sum(
            1 for p in self.roster
            if (p.role != "Supplemental Roster" and p.status != "Unavailable \u2013 %Injured List" and p.status != "Unavailable \u2013 SEI" and p.status != "Unavailable \u2013 On Loan" and p.status != "Unavailable – Off Roster")
        )
    
    def is_dp_compliant(self) -> bool:
        return self.count_role("Designated Player") <= self.total_dp_spots()
    
    def is_U22_compliant(self) -> bool:
        return self.count_role("U22 Initiative") <= self.total_U22_spots()
    
    def total_cap_hit(self) -> int:
        return sum(p.base_budget_charge() for p in self.roster)
    
    
    def total_base_salary(self) -> int:
        return sum(p.baseSalary for p in self.roster)

    def total_guaranteed_comp(self) -> int:
        return sum(p.guaranteedComp for p in self.roster)
    
    def total_transfer_payments(self) -> int:
        return sum(p.amortized_transfer_cap_hit() for p in self.roster)
    
    
    def cap_breakdown(self):
        rows = self.roster

        return [
            {
                "name": p.name,
                "position": p.position,
                "role": p.role,
                "base_salary": p.baseSalary,
                "budget_charge": p.base_budget_charge(),
                "tam_used": 0,
                "is_international": p.international,
                "status": p.status,
                "contract_through": p.contractThru,
                "option_years": p.optionYears,
                "guaranteed_comp": p.guaranteedComp,
                "salary_estimated": p.salaryEstimated,
                "dp_buydown_eligible": p.DPBuydownEligible,
                "transfer_fee": p.transferFee,
                "amortized_transfer_fee": p.amortized_transfer_cap_hit(),
                "cap_hit": p.base_budget_charge()
            }
            for p in rows
        ]
    
    def cap_space_summary(self):
        dp_count = self.count_role("Designated Player")
        u22_count = self.count_role("U22 Initiative")

        return {
            "team": self.name,
            "remaining_cap_space": self.get_remaining_cap_space(),
            "dp_count": dp_count,
            "dp_limit": self.total_dp_spots(),
            "u22_count": u22_count,
            "u22_limit": self.total_U22_spots(),
            "remaining_gam": self.get_remaining_gam(),
            "estimated_gam_left": self.get_estimated_gam_left(),
            "international_slots_used": self.international_slots_used(),
            "international_slots_total": self.international_slots,
        }

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
                "international_slots_total": self.international_slots,
                "cap_hit": cap_hit,
                "remaining_gam": self.get_remaining_gam(),
                "starting_gam": self.starting_gam,
                "gam_balance": self.get_balance_gam(),
                "estimated_gam_left": self.get_estimated_gam_left(),
            }
        }
