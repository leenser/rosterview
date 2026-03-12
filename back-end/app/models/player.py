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
            contractThru:str = "2025",
            optionYears:str = "2026"
    ):
        self.name = name
        self.position = position
        #self.age = age
        self.baseSalary = baseSalary
        self.guaranteedComp = guaranteedComp
        self.role = role
        self.international = international
        self.status = status
        self.contractThru = contractThru
        self.optionYears = optionYears
        
        
    
    def base_budget_charge(self) -> int:
        if self.status == "Unavailable \u2013 On Loan" or self.status == "Unavailable \u2013 SEI" or self.role == "Supplemental Roster":
            return 0
        if self.role == "Designated Player":
            return self.MAX_BUDGET_CHARGE
        
        # if self.role == "TAM Player" and self.guaranteedComp > self.TAM_CEILING:
        #     return self.TAM_CEILING
        
        if self.role == "U22 Initiative":
            return self.U22_BUDGET_CHARGE
        return self.guaranteedComp
        
        
    


