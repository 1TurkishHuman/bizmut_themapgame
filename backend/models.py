from sqlalchemy import Column, Integer, String, Text
from database import Base

class City(Base):
    __tablename__ = "cities"

    plate_code = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False, unique=True)
    region = Column(String(50), nullable=False)
    famous_for = Column(Text, nullable=True)
    svg_id = Column(String(20), nullable=True)