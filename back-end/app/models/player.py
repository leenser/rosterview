from typing import Optional
class Player:
    MAX_BUDGET_CHARGE = 803125
    TAM_CEILING = 1743750
    U22_BUDGET_CHARGE = 200000

    def __init__(
            self,
            name:str,
            position:str,
            #age:int,
            baseSalary:int,
            guaranteedComp:int,
            role:Optional[str] = None,#DP, TAM, U22, SUP (Supplemental Slots), SEN (Senior Slots), GA (Gen Adidas)
            international: bool = False,
            status: Optional[str] = None,
            joinedYear: Optional[int] = None,
            guaranteedYears: Optional[int] = None,
            transferFee: Optional[int] = None,
            contractThru: Optional[str] = None,
            optionYears: Optional[str] = None
    ):
        self.name = name
        self.position = position
        #self.age = age
        self.baseSalary = baseSalary
        self.guaranteedComp = guaranteedComp
        self.role = role
        self.international = international
        self.status = status
        self.joinedYear = joinedYear
        self.transferFee = transferFee
        self.guaranteedYears = guaranteedYears
        self.contractThru = contractThru
        self.optionYears = optionYears
        
        
    
    def base_budget_charge(self) -> int:
        if self.status == "Unavailable \u2013 On Loan" or self.status == "Unavailable \u2013 Injured List" or self.status == "Unavailable \u2013 SEI" or self.role == "Supplemental Roster" or self.status == "Unavailable – Off Roster":
            return 0

        gross_charge = self.guaranteedComp + self.amortized_transfer_cap_hit()

        if self.role == "Designated Player":
            return self.MAX_BUDGET_CHARGE

        if self.role == "TAM Player":
            return min(gross_charge, self.MAX_BUDGET_CHARGE)

        if self.role == "U22 Initiative":
            return self.U22_BUDGET_CHARGE

        return gross_charge
    
    def amortized_transfer_cap_hit(self) -> int:
        # guard clauses
        if not self.transferFee or not self.guaranteedYears or not self.joinedYear:
            return 0

        current_year = 2026

        # years elapsed since joining
        years_elapsed = current_year - self.joinedYear - 1

        # if fully amortized, no remaining impact
        remaining_years = max(self.guaranteedYears - years_elapsed, 0)
        if remaining_years == 0:
            return 0

        # straight-line amortization
        annual_amort = self.transferFee / self.guaranteedYears

        return int(annual_amort)
        
        
