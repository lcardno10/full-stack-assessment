from sqlalchemy import Column, Integer, String, Float
from src.database import Base

class GapminderData(Base):
    __tablename__ = "gapminder_data"

    id = Column(Integer, primary_key=True, index=True)
    country = Column(String, index=True)
    continent = Column(String, index=True)
    year = Column(Integer, index=True)
    life_exp = Column(Float)
    pop = Column(Integer)
    gdp_per_cap = Column(Float)