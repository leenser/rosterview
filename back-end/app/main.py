from app.models.team import Team
from app.models.league import League

def money(value: int) -> str:
    return f"${value:,}"

team = Team.from_json("back-end/data/houston-dynamo-fc.json")

print(team.name)
print("Players:", len(team.roster))

print("International slots used:", team.international_slots_used())

print("Total base salary:", money(team.total_base_salary()))
print("Total cap hit:", money(team.total_cap_hit()))

print("Designated Players:", team.count_role("Designated Player"))
print("U22 Players:", team.count_role("U22 Initiative"))

# print("Roster value breakdown:")
# for row in team.cap_breakdown():
#     print(
#         row["name"],
#         "| role:", row["role"],
#         "| base:", row["base_salary"],
#         "| budget hit:", row["budget_charge"],
#         "| TAM used:", row["tam_used"],
#     )


# Summary by mechanism
dp_cap = 0
u22_cap = 0
tam_cap = 0
regular_cap = 0
total_saved = 0

dp_spend = 0
u22_spend = 0
tam_spend = 0

MAX_BUDGET_CHARGE = 743750
U22_BUDGET_CHARGE = 200000

for row in team.cap_breakdown():
    base = row["base_salary"]
    hit = row["budget_charge"]
    role = row["role"]

    if role == "Designated Player":
        dp_cap += hit
        dp_spend += base
        total_saved += max(0, base - hit)
    elif role == "U22 Initiative":
        u22_cap += hit
        u22_spend += base
        total_saved += max(0, base - hit)
    elif row["tam_used"] > 0:
        tam_cap += hit
        tam_spend += base
        total_saved += row["tam_used"]
    else:
        regular_cap += hit

print("\nCap hit by mechanism:")
print("\nMoney spent on DPs:", money(dp_spend))
print("DP cap hit:", money(dp_cap))
print("\nMoney spent on U22s", money(u22_spend))
print("U22 cap hit:", money(u22_cap))
print("\nMoney spent on TAM players:", money(tam_spend))
print("TAM cap hit:", money(tam_cap))
print("\nRegular cap hit:", money(regular_cap))

print("\nTotal cap hit (check):", money(dp_cap + u22_cap + tam_cap + regular_cap))
print("Total cap hit (method):", money(team.total_cap_hit()))
print("Total money saved by mechanisms:", money(total_saved))

validation = team.validate_roster()
print("\nRoster valid:", validation["is_valid"])
for issue in validation["issues"]:
    print("-", issue["message"])


print("\n--- League Test ---")
league = League.from_data_dir("back-end/data")
print("Teams loaded:", len(league.teams))
for t in league.teams[:5]:
    print("-", t.name)

print("\nLeague spending by team:")
for row in league.spending_by_team():
    print(
        row["team"],
        "| base:", money(row["base_salary"]),
        "| cap:", money(row["cap_hit"]),
    )
