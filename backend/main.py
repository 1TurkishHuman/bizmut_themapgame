import json
import os
import random
from fastapi import FastAPI, Depends, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy.sql.expression import func

from database import engine, Base, get_db
from models import City
from schemas import QuestionResponse, AnswerCheckRequest, AnswerCheckResponse, CityBase

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Harita Öğrenme Oyunu API",
    description="Türkiye Haritası Coğrafya Oyunu Backend Servisi",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_populate_db():
    db = next(get_db())
    count = db.query(City).count()
    if count < 81:
        json_path = os.path.join(os.path.dirname(__file__), "data", "cities.json")
        if os.path.exists(json_path):
            with open(json_path, "r", encoding="utf-8") as f:
                cities_data = json.load(f)
            for c in cities_data:
                existing = db.query(City).filter(City.plate_code == c["plate_code"]).first()
                if not existing:
                    city_obj = City(
                        plate_code=c["plate_code"],
                        name=c["name"],
                        region=c["region"],
                        famous_for=c["famous_for"],
                        svg_id=c["svg_id"]
                    )
                    db.add(city_obj)
            db.commit()
    db.close()

@app.get("/")
def home():
    return {"status": "online", "message": "Harita Öğrenme Oyunu API Çalışıyor!"}

@app.get("/api/cities", response_model=list[CityBase])
def get_all_cities(db: Session = Depends(get_db)):
    return db.query(City).order_by(City.plate_code).all()

#oyun motoru endpointleri

@app.get("/api/game/question", response_model=QuestionResponse)
def get_game_question(
    mode: str = Query("find_city", description="find_city veya multiple_choice"),
    db: Session = Depends(get_db)
):
    #secilen moda gore soru uretir
    #random hedef il
    target_city = db.query(City).order_by(func.random()).first()
    if not target_city:
        raise HTTPException(status_code=500, detail="Veritabanında il bulunamadı")

    options = None

    #coktan secmeli 
    if mode == "multiple_choice":
        same_region_cities = (
            db.query(City)
            .filter(City.region == target_city.region, City.plate_code != target_city.plate_code)
            .order_by(func.random())
            .limit(3)
            .all()
        )
        
        selected_options = [target_city] + same_region_cities
        
        if len(selected_options) < 4:
            needed = 4 - len(selected_options)
            already_ids = [c.plate_code for c in selected_options]
            extra_cities = (
                db.query(City)
                .filter(~City.plate_code.in_(already_ids))
                .order_by(func.random())
                .limit(needed)
                .all()
            )
            selected_options.extend(extra_cities)
        
        random.shuffle(selected_options)
        options = selected_options

    return QuestionResponse(
        mode=mode,
        target_city=target_city,
        options=options
    )

@app.post("/api/game/check-answer", response_model=AnswerCheckResponse)
def check_player_answer(
    answer: AnswerCheckRequest,
    db: Session = Depends(get_db)
):
    #verilen cevaba gore puan ve feedback
    target = db.query(City).filter(City.plate_code == answer.target_plate).first()
    selected = db.query(City).filter(City.plate_code == answer.selected_plate).first()

    if not target or not selected:
        raise HTTPException(status_code=404, detail="İl bilgisi doğrulanamadı")

    is_correct = (answer.target_plate == answer.selected_plate)
    points = 10 if is_correct else 0

    if is_correct:
        feedback = f"Tebrikler! Doğru il olan {target.name} yerini başarıyla buldun."
    else:
        feedback = f"Maalesef yanlış. Tıkladığın yer {selected.name}, aradığımız il ise {target.name} idi."

    return AnswerCheckResponse(
        is_correct=is_correct,
        correct_plate=target.plate_code,
        correct_name=target.name,
        selected_name=selected.name,
        points_earned=points,
        feedback_message=feedback
    )