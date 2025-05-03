import warnings
warnings.filterwarnings("ignore")

from pydantic import BaseModel
from typing import List,Optional

# Input/Output models for tools

class AddInput(BaseModel):
    a: int
    b: int

class AddOutput(BaseModel):
    result: int

class SqrtInput(BaseModel):
    a: int

class SqrtOutput(BaseModel):
    result: float

class StringsToIntsInput(BaseModel):
    string: str

class StringsToIntsOutput(BaseModel):
    ascii_values: List[int]

class ExpSumInput(BaseModel):
    int_list: List[int]

class ExpSumOutput(BaseModel):
    result: float

class MCQS(BaseModel):
    Question: str
    A: str
    B: str
    C: str
    D: str
    Answer: str
    Explanation: str

# The agent and decision logic output a list of dicts with keys matching the MCQS fields, not wrapped in an MCQList dict.
# Therefore, we will remove MCQList and use List[MCQS] directly.

# You can now use List[MCQS] directly in your tool signatures and throughout your pipeline.