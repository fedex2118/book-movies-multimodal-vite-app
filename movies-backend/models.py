from flask_sqlalchemy import SQLAlchemy
db = SQLAlchemy()

class Room(db.Model):
    __tablename__ = "rooms"
    id = db.Column(db.BigInteger, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    seat_rows = db.Column(db.Integer, nullable=False)
    seat_cols = db.Column(db.Integer, nullable=False)
    seats = db.relationship("Seat", backref="room", cascade="all, delete-orphan")

class Seat(db.Model):
    __tablename__ = "seats"
    id = db.Column(db.BigInteger, primary_key=True)
    room_id = db.Column(db.BigInteger, db.ForeignKey("rooms.id"), nullable=False)
    row_idx = db.Column(db.Integer, nullable=False)
    col_idx = db.Column(db.Integer, nullable=False)
    label = db.Column(db.String(16), nullable=False)

class Movie(db.Model):
    __tablename__ = "movies"
    id = db.Column(db.BigInteger, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    original_title = db.Column(db.String(200))
    description = db.Column(db.Text)
    director = db.Column(db.String(200))
    cast_text = db.Column(db.Text)
    duration_min = db.Column(db.Integer, nullable=False)
    release_year = db.Column(db.Integer)
    image_url = db.Column(db.String(500))
    screenings = db.relationship("Screening", backref="movie", cascade="all, delete-orphan")
    alt_titles = db.relationship("MovieAltTitle", backref="movie", cascade="all, delete-orphan")

class MovieAltTitle(db.Model):
    __tablename__ = "movie_alt_titles"
    id = db.Column(db.BigInteger, primary_key=True)
    movie_id = db.Column(db.BigInteger, db.ForeignKey("movies.id"), nullable=False)
    alt_title = db.Column(db.String(200), nullable=False)

class Screening(db.Model):
    __tablename__ = "screenings"
    id = db.Column(db.BigInteger, primary_key=True)
    room_id = db.Column(db.BigInteger, db.ForeignKey("rooms.id"), nullable=False)
    movie_id = db.Column(db.BigInteger, db.ForeignKey("movies.id"), nullable=False)
    starts_at = db.Column(db.DateTime, nullable=False)
    base_price_cents = db.Column(db.Integer, nullable=False)
    language = db.Column(db.String(20), default="EN")
    three_d = db.Column(db.Boolean, default=False)

    room = db.relationship("Room")