from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from src.database import get_db
from src.models import GapminderData

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"status": "Ready"}

@app.get("/api/gapminder")
async def get_gapminder_data(db: Session = Depends(get_db)):
    data = db.query(GapminderData).all()
    return [
        {
            "country": item.country,
            "continent": item.continent,
            "year": item.year,
            "lifeExp": item.life_exp,
            "pop": item.pop,
            "gdpPercap": item.gdp_per_cap
        }
        for item in data
    ]