CREATE DATABASE  IF NOT EXISTS `book-movies-multimodal` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `book-movies-multimodal`;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE rooms (
  id           BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(80) NOT NULL,
  seat_rows    INT NOT NULL,
  seat_cols    INT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE seats (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  room_id     BIGINT UNSIGNED NOT NULL,
  row_idx     INT NOT NULL,
  col_idx     INT NOT NULL,
  label       VARCHAR(16) NOT NULL,
  UNIQUE KEY uk_seat_room_pos (room_id, row_idx, col_idx),
  UNIQUE KEY uk_seat_room_label (room_id, label),
  CONSTRAINT fk_seats_room
    FOREIGN KEY (room_id) REFERENCES rooms(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE movies (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title           VARCHAR(200) NOT NULL,
  original_title  VARCHAR(200),
  description     TEXT,
  director        VARCHAR(200),
  cast_text       TEXT,
  duration_min    INT NOT NULL,
  release_year    INT,
  image_url       VARCHAR(500),
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FULLTEXT KEY ft_movies_title (title, original_title)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE movie_alt_titles (
  id        BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  movie_id  BIGINT UNSIGNED NOT NULL,
  alt_title VARCHAR(200) NOT NULL,
  CONSTRAINT fk_alt_movie
    FOREIGN KEY (movie_id) REFERENCES movies(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY uk_movie_alt (movie_id, alt_title)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE screenings (
  id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  room_id           BIGINT UNSIGNED NOT NULL,
  movie_id          BIGINT UNSIGNED NOT NULL,
  starts_at         DATETIME NOT NULL,
  base_price_cents  INT NOT NULL,
  language          VARCHAR(20) DEFAULT 'EN',
  three_d           TINYINT(1) NOT NULL DEFAULT 0,
  UNIQUE KEY uk_room_start (room_id, starts_at),
  KEY idx_screenings_movie (movie_id, starts_at),
  CONSTRAINT fk_screenings_room
    FOREIGN KEY (room_id) REFERENCES rooms(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_screenings_movie
    FOREIGN KEY (movie_id) REFERENCES movies(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE bookings (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  screening_id    BIGINT UNSIGNED NOT NULL,
  status          ENUM('PENDING','CONFIRMED','CANCELLED','EXPIRED') NOT NULL DEFAULT 'PENDING',
  total_cents     INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  confirmed_at    DATETIME NULL,
  KEY idx_booking_status (status),
  CONSTRAINT fk_booking_screening
    FOREIGN KEY (screening_id) REFERENCES screenings(id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE booking_seats (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  booking_id    BIGINT UNSIGNED NOT NULL,
  seat_id       BIGINT UNSIGNED NOT NULL,
  price_cents   INT NOT NULL,
  UNIQUE KEY uk_booking_seat (booking_id, seat_id),
  KEY idx_booking_seats_seat (seat_id),
  CONSTRAINT fk_bseats_booking
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_bseats_seat
    FOREIGN KEY (seat_id) REFERENCES seats(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;
