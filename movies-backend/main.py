import os
import locale

from flask import Flask, jsonify
from datetime import datetime
from models import db, Movie, Screening, Room, Seat, MovieAltTitle
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv

from flask_cors import CORS
from flask import request
from sqlalchemy import func
import re

# Carica le variabili da .env
load_dotenv()

app = Flask(__name__)

# Config da variabili ambiente
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# to enable frontend calls
CORS(app)

db.init_app(app)

# Forziamo i nomi dei giorni/mesi in inglese per aderire al front (Monday 15 June)
try:
    locale.setlocale(locale.LC_TIME, "en_US.UTF-8")
except locale.Error:
    # fallback: su alcuni sistemi non è disponibile: useremo formattazione manuale
    pass

def day_label(dt: datetime) -> str:
    # "Monday 15 June"
    try:
        return dt.strftime("%A %d %B")
    except Exception:
        # mini fallback inglese senza locale
        days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]
        months = ["January","February","March","April","May","June","July","August","September","October","November","December"]
        return f"{days[dt.weekday()]} {dt.day:02d} {months[dt.month-1]}"

@app.route("/movies")
def get_movies():
    movies = Movie.query.all()
    results = []

    for m in movies:
        ss = (Screening.query
                .filter_by(movie_id=m.id)
                .order_by(Screening.starts_at.asc())
                .all())
        day_map = {}
        for s in ss:
            dlab = day_label(s.starts_at)             # "Monday 15 June"
            time_str = s.starts_at.strftime("%H:%M")  # "21:00"
            day_map.setdefault(dlab, []).append({
                "time": time_str,
                "screeningId": s.id,
                "roomId": s.room_id,
            })

        showtimes = [{"day": d, "times": t} for d, t in day_map.items()]

        results.append({
            "title": m.title,
            "altTitles": [a.alt_title for a in m.alt_titles],
            "description": m.description or "",
            "director": m.director or "",
            "cast": (m.cast_text or ""),
            "duration": m.duration_min,
            "showtimes": showtimes,   # times: [{time, screeningId, roomId}]
            "image": m.image_url or ""
        })
    return jsonify(results)

@app.route("/screenings/<int:screening_id>/layout")
def get_layout(screening_id: int):
    s = Screening.query.get_or_404(screening_id)
    room = s.room
    seats = Seat.query.filter_by(room_id=room.id).all()

    # crea una griglia seat_rows x seat_cols con null
    grid = [[None for _ in range(room.seat_cols)] for __ in range(room.seat_rows)]
    for seat in seats:
        if 0 <= seat.row_idx < room.seat_rows and 0 <= seat.col_idx < room.seat_cols:
            grid[seat.row_idx][seat.col_idx] = seat.label

    return jsonify(grid)

# Endpoint minimale per creare una booking con seat labels
# (demo: nessun hold; verifica semplice che i posti esistano)
from flask import request
@app.route("/bookings", methods=["POST"])
def create_booking():
    data = request.get_json(force=True)
    screening_id = data.get("screeningId")
    seat_labels = data.get("seatLabels", [])  # es: ["A1","A2"]

    s = Screening.query.get_or_404(screening_id)
    room_id = s.room_id

    # mappa label -> seat
    seats = Seat.query.filter(Seat.room_id==room_id, Seat.label.in_(seat_labels)).all()
    if len(seats) != len(seat_labels):
        return jsonify({"error":"Some seats not found in this room"}), 400

    # (Facoltativo) controlla che i posti non siano già prenotati CONFIRMED
    # per questa demo possiamo saltare o implementare check semplice.

    from models import db, Booking, BookingSeat
    b = Booking(screening_id=screening_id, status="CONFIRMED")  # demo: confermiamo subito
    db.session.add(b)
    db.session.flush()

    total = 0
    for st in seats:
        price = s.base_price_cents  # demo: prezzo base fisso
        db.session.add(BookingSeat(booking_id=b.id, seat_id=st.id, price_cents=price))
        total += price

    b.total_cents = total
    db.session.commit()

    return jsonify({"bookingId": b.id, "status": b.status, "total_cents": b.total_cents})

def normalize_day_label(s: str) -> str:
    # rimuove suffissi ordinali: 1st, 2nd, 3rd, 4th...
    s = re.sub(r'(\d+)(st|nd|rd|th)', r'\1', s, flags=re.IGNORECASE).strip()
    return s

@app.route("/resolve-screening")
def resolve_screening():
    """
    Query params:
      - title: titolo del film (accetta anche altTitles)
      - day:   stringa tipo "Monday 15 June" o "Monday 15th June"
      - time:  "HH:MM" (24h)
    Return: { screeningId, roomId } oppure 404
    """
    title = request.args.get("title", type=str)
    day_s = request.args.get("day", type=str)
    time_s = request.args.get("time", type=str)

    if not title or not day_s or not time_s:
        return {"error": "Missing title/day/time"}, 400

    day_norm = normalize_day_label(day_s)

    # trova il movie per titolo o altTitle (case-insensitive)
    movie = (Movie.query
        .filter(func.lower(Movie.title) == title.lower())
        .first())

    if not movie:
        alt = (MovieAltTitle.query
               .filter(func.lower(MovieAltTitle.alt_title) == title.lower())
               .first())
        if alt:
            movie = alt.movie

    if not movie:
        return {"error": "Movie not found"}, 404

    # cerca screenings del movie e confronta giorno+ora formattati come nel front
    scr = (Screening.query
           .filter_by(movie_id=movie.id)
           .order_by(Screening.starts_at.asc())
           .all())

    # normalizza "Monday 15 June"
    def fmt_day(dt):
        try:
            return dt.strftime("%A %d %B")
        except Exception:
            days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]
            months = ["January","February","March","April","May","June","July","August","September","October","November","December"]
            return f"{days[dt.weekday()]} {dt.day:02d} {months[dt.month-1]}"

    target = None
    for s in scr:
        dlabel = normalize_day_label(fmt_day(s.starts_at))
        tlabel = s.starts_at.strftime("%H:%M")
        if dlabel.lower() == day_norm.lower() and tlabel == time_s:
            target = s
            break

    if not target:
        return {"error": "Screening not found for given day/time"}, 404

    return {"screeningId": target.id, "roomId": target.room_id}


if __name__ == "__main__":
    app.run(debug=True)