from typing import Optional
class Player:
    MAX_BUDGET_CHARGE = 743750
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
            status: Optional[str] = None
    ):
        self.name = name
        self.position = position
        #self.age = age
        self.baseSalary = baseSalary
        self.guaranteedComp = guaranteedComp
        self.role = role
        self.international = international
        self.status = status
    
    def base_budget_charge(self) -> int:
        if self.role == "Designated Player":
            return self.MAX_BUDGET_CHARGE
        if self.role == "U22 Initiative":
            return self.U22_BUDGET_CHARGE
        return min(self.baseSalary, self.MAX_BUDGET_CHARGE)
        
        
    


