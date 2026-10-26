from pydantic import BaseModel
from typing import List, Optional

class CityBase(BaseModel):
    plate_code: int
    name: str
    region: str
    svg_id: Optional[str] = None

    class Config:
        from_attributes = True

class QuestionResponse(BaseModel):
    mode: str
    target_city: CityBase
    options: Optional[List[CityBase]] = None

class AnswerCheckRequest(BaseModel):
    target_plate: int
    selected_plate: int
    mode: str

class AnswerCheckResponse(BaseModel):
    is_correct: bool
    correct_plate: int
    correct_name: str
    selected_name: str
    points_earned: int
    feedback_message: str