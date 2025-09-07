-- cinema halls and seats
-- ========= Hall A (layout0: 12 x 8) =========
INSERT INTO rooms (name, seat_rows, seat_cols) VALUES ('Hall A', 12, 8);
SET @sala1 := LAST_INSERT_ID();

INSERT INTO seats (room_id, row_idx, col_idx, label) VALUES
  (@sala1, 0, 1, 'A1'),
  (@sala1, 0, 2, 'A2'),
  (@sala1, 0, 3, 'A3'),
  (@sala1, 0, 4, 'A4'),
  (@sala1, 0, 5, 'A5'),
  (@sala1, 0, 6, 'A6'),
  (@sala1, 1, 0, 'B1'),
  (@sala1, 1, 1, 'B2'),
  (@sala1, 1, 2, 'B3'),
  (@sala1, 1, 3, 'B4'),
  (@sala1, 1, 4, 'B5'),
  (@sala1, 1, 5, 'B6'),
  (@sala1, 1, 6, 'B7'),
  (@sala1, 1, 7, 'B8'),
  (@sala1, 2, 0, 'C1'),
  (@sala1, 2, 1, 'C2'),
  (@sala1, 2, 2, 'C3'),
  (@sala1, 2, 3, 'C4'),
  (@sala1, 2, 4, 'C5'),
  (@sala1, 2, 5, 'C6'),
  (@sala1, 2, 6, 'C7'),
  (@sala1, 2, 7, 'C8'),
  (@sala1, 3, 0, 'D1'),
  (@sala1, 3, 1, 'D2'),
  (@sala1, 3, 2, 'D3'),
  (@sala1, 3, 3, 'D4'),
  (@sala1, 3, 4, 'D5'),
  (@sala1, 3, 5, 'D6'),
  (@sala1, 3, 6, 'D7'),
  (@sala1, 3, 7, 'D8'),
  (@sala1, 4, 0, 'E1'),
  (@sala1, 4, 1, 'E2'),
  (@sala1, 4, 2, 'E3'),
  (@sala1, 4, 3, 'E4'),
  (@sala1, 4, 4, 'E5'),
  (@sala1, 4, 5, 'E6'),
  (@sala1, 4, 6, 'E7'),
  (@sala1, 4, 7, 'E8'),
  (@sala1, 5, 0, 'F1'),
  (@sala1, 5, 1, 'F2'),
  (@sala1, 5, 2, 'F3'),
  (@sala1, 5, 3, 'F4'),
  (@sala1, 5, 4, 'F5'),
  (@sala1, 5, 5, 'F6'),
  (@sala1, 5, 6, 'F7'),
  (@sala1, 5, 7, 'F8'),
  (@sala1, 6, 0, 'G1'),
  (@sala1, 6, 1, 'G2'),
  (@sala1, 6, 2, 'G3'),
  (@sala1, 6, 3, 'G4'),
  (@sala1, 6, 4, 'G5'),
  (@sala1, 6, 5, 'G6'),
  (@sala1, 6, 6, 'G7'),
  (@sala1, 6, 7, 'G8'),
  (@sala1, 7, 0, 'H1'),
  (@sala1, 7, 1, 'H2'),
  (@sala1, 7, 2, 'H3'),
  (@sala1, 7, 3, 'H4'),
  (@sala1, 7, 4, 'H5'),
  (@sala1, 7, 5, 'H6'),
  (@sala1, 7, 6, 'H7'),
  (@sala1, 7, 7, 'H8'),
  (@sala1, 8, 0, 'I1'),
  (@sala1, 8, 1, 'I2'),
  (@sala1, 8, 2, 'I3'),
  (@sala1, 8, 3, 'I4'),
  (@sala1, 8, 4, 'I5'),
  (@sala1, 8, 5, 'I6'),
  (@sala1, 8, 6, 'I7'),
  (@sala1, 8, 7, 'I8'),
  (@sala1, 9, 4, 'L1'),
  (@sala1, 9, 5, 'L2'),
  (@sala1, 9, 6, 'L3'),
  (@sala1, 9, 7, 'L4'),
  (@sala1, 10, 4, 'M1'),
  (@sala1, 10, 5, 'M2'),
  (@sala1, 10, 6, 'M3'),
  (@sala1, 10, 7, 'M4'),
  (@sala1, 11, 4, 'DD1'),
  (@sala1, 11, 5, 'DD2'),
  (@sala1, 11, 6, 'DD3'),
  (@sala1, 11, 7, 'DD4');

-- ========= Hall B (layout1: 15 x 8) =========
INSERT INTO rooms (name, seat_rows, seat_cols) VALUES ('Hall B', 15, 8);
SET @sala2 := LAST_INSERT_ID();

INSERT INTO seats (room_id, row_idx, col_idx, label) VALUES
  (@sala2, 0, 1, 'A1'),
  (@sala2, 0, 2, 'A2'),
  (@sala2, 0, 3, 'A3'),
  (@sala2, 0, 4, 'A4'),
  (@sala2, 0, 5, 'A5'),
  (@sala2, 0, 6, 'A6'),
  (@sala2, 1, 0, 'B1'),
  (@sala2, 1, 1, 'B2'),
  (@sala2, 1, 2, 'B3'),
  (@sala2, 1, 3, 'B4'),
  (@sala2, 1, 4, 'B5'),
  (@sala2, 1, 5, 'B6'),
  (@sala2, 1, 6, 'B7'),
  (@sala2, 1, 7, 'B8'),
  (@sala2, 2, 0, 'C1'),
  (@sala2, 2, 1, 'C2'),
  (@sala2, 2, 2, 'C3'),
  (@sala2, 2, 3, 'C4'),
  (@sala2, 2, 4, 'C5'),
  (@sala2, 2, 5, 'C6'),
  (@sala2, 2, 6, 'C7'),
  (@sala2, 2, 7, 'C8'),
  (@sala2, 3, 0, 'D1'),
  (@sala2, 3, 1, 'D2'),
  (@sala2, 3, 2, 'D3'),
  (@sala2, 3, 3, 'D4'),
  (@sala2, 3, 4, 'D5'),
  (@sala2, 3, 5, 'D6'),
  (@sala2, 3, 6, 'D7'),
  (@sala2, 3, 7, 'D8'),
  (@sala2, 4, 0, 'E1'),
  (@sala2, 4, 1, 'E2'),
  (@sala2, 4, 2, 'E3'),
  (@sala2, 4, 3, 'E4'),
  (@sala2, 4, 4, 'E5'),
  (@sala2, 4, 5, 'E6'),
  (@sala2, 4, 6, 'E7'),
  (@sala2, 4, 7, 'E8'),
  (@sala2, 5, 0, 'F1'),
  (@sala2, 5, 1, 'F2'),
  (@sala2, 5, 2, 'F3'),
  (@sala2, 5, 3, 'F4'),
  (@sala2, 5, 4, 'F5'),
  (@sala2, 5, 5, 'F6'),
  (@sala2, 5, 6, 'F7'),
  (@sala2, 5, 7, 'F8'),
  (@sala2, 6, 0, 'G1'),
  (@sala2, 6, 1, 'G2'),
  (@sala2, 6, 2, 'G3'),
  (@sala2, 6, 3, 'G4'),
  (@sala2, 6, 4, 'G5'),
  (@sala2, 6, 5, 'G6'),
  (@sala2, 6, 6, 'G7'),
  (@sala2, 6, 7, 'G8'),
  (@sala2, 7, 0, 'H1'),
  (@sala2, 7, 1, 'H2'),
  (@sala2, 7, 2, 'H3'),
  (@sala2, 7, 3, 'H4'),
  (@sala2, 7, 4, 'H5'),
  (@sala2, 7, 5, 'H6'),
  (@sala2, 7, 6, 'H7'),
  (@sala2, 7, 7, 'H8'),
  (@sala2, 8, 0, 'I1'),
  (@sala2, 8, 1, 'I2'),
  (@sala2, 8, 2, 'I3'),
  (@sala2, 8, 3, 'I4'),
  (@sala2, 8, 4, 'I5'),
  (@sala2, 8, 5, 'I6'),
  (@sala2, 8, 6, 'I7'),
  (@sala2, 8, 7, 'I8'),
  (@sala2, 9, 0, 'L1'),
  (@sala2, 9, 1, 'L2'),
  (@sala2, 9, 2, 'L3'),
  (@sala2, 9, 3, 'L4'),
  (@sala2, 9, 4, 'L5'),
  (@sala2, 9, 5, 'L6'),
  (@sala2, 9, 6, 'L7'),
  (@sala2, 9, 7, 'L8'),
  (@sala2, 10, 0, 'M1'),
  (@sala2, 10, 1, 'M2'),
  (@sala2, 10, 2, 'M3'),
  (@sala2, 10, 3, 'M4'),
  (@sala2, 10, 4, 'M5'),
  (@sala2, 10, 5, 'M6'),
  (@sala2, 10, 6, 'M7'),
  (@sala2, 10, 7, 'M8'),
  (@sala2, 11, 0, 'N1'),
  (@sala2, 11, 1, 'N2'),
  (@sala2, 11, 2, 'N3'),
  (@sala2, 11, 3, 'N4'),
  (@sala2, 11, 4, 'N5'),
  (@sala2, 11, 5, 'N6'),
  (@sala2, 11, 6, 'N7'),
  (@sala2, 11, 7, 'N8'),
  (@sala2, 12, 1, 'O1'),
  (@sala2, 12, 2, 'O2'),
  (@sala2, 12, 3, 'O3'),
  (@sala2, 12, 4, 'O4'),
  (@sala2, 12, 5, 'O5'),
  (@sala2, 12, 6, 'O6'),
  (@sala2, 13, 1, 'P1'),
  (@sala2, 13, 2, 'P2'),
  (@sala2, 13, 3, 'P3'),
  (@sala2, 13, 4, 'P4'),
  (@sala2, 13, 5, 'P5'),
  (@sala2, 13, 6, 'P6'),
  (@sala2, 14, 1, 'Q1'),
  (@sala2, 14, 2, 'Q2'),
  (@sala2, 14, 3, 'Q3'),
  (@sala2, 14, 4, 'Q4'),
  (@sala2, 14, 5, 'Q5'),
  (@sala2, 14, 6, 'Q6');

-- ========= Hall C (layout2: 10 x 8) =========
INSERT INTO rooms (name, seat_rows, seat_cols) VALUES ('Hall C', 10, 8);
SET @sala3 := LAST_INSERT_ID();

INSERT INTO seats (room_id, row_idx, col_idx, label) VALUES
  (@sala3, 0, 1, 'A1'),
  (@sala3, 0, 2, 'A2'),
  (@sala3, 0, 3, 'A3'),
  (@sala3, 0, 4, 'A4'),
  (@sala3, 0, 5, 'A5'),
  (@sala3, 0, 6, 'A6'),
  (@sala3, 1, 0, 'B1'),
  (@sala3, 1, 1, 'B2'),
  (@sala3, 1, 2, 'B3'),
  (@sala3, 1, 3, 'B4'),
  (@sala3, 1, 4, 'B5'),
  (@sala3, 1, 5, 'B6'),
  (@sala3, 1, 6, 'B7'),
  (@sala3, 1, 7, 'B8'),
  (@sala3, 2, 0, 'C1'),
  (@sala3, 2, 1, 'C2'),
  (@sala3, 2, 2, 'C3'),
  (@sala3, 2, 3, 'C4'),
  (@sala3, 2, 4, 'C5'),
  (@sala3, 2, 5, 'C6'),
  (@sala3, 2, 6, 'C7'),
  (@sala3, 2, 7, 'C8'),
  (@sala3, 3, 0, 'D1'),
  (@sala3, 3, 1, 'D2'),
  (@sala3, 3, 2, 'D3'),
  (@sala3, 3, 3, 'D4'),
  (@sala3, 3, 4, 'D5'),
  (@sala3, 3, 5, 'D6'),
  (@sala3, 3, 6, 'D7'),
  (@sala3, 3, 7, 'D8'),
  (@sala3, 4, 0, 'E1'),
  (@sala3, 4, 1, 'E2'),
  (@sala3, 4, 2, 'E3'),
  (@sala3, 4, 3, 'E4'),
  (@sala3, 4, 4, 'E5'),
  (@sala3, 4, 5, 'E6'),
  (@sala3, 4, 6, 'E7'),
  (@sala3, 4, 7, 'E8'),
  (@sala3, 5, 0, 'F1'),
  (@sala3, 5, 1, 'F2'),
  (@sala3, 5, 2, 'F3'),
  (@sala3, 5, 3, 'F4'),
  (@sala3, 5, 4, 'F5'),
  (@sala3, 5, 5, 'F6'),
  (@sala3, 5, 6, 'F7'),
  (@sala3, 5, 7, 'F8'),
  (@sala3, 6, 0, 'G1'),
  (@sala3, 6, 1, 'G2'),
  (@sala3, 6, 2, 'G3'),
  (@sala3, 6, 3, 'G4'),
  (@sala3, 6, 4, 'G5'),
  (@sala3, 6, 5, 'G6'),
  (@sala3, 6, 6, 'G7'),
  (@sala3, 6, 7, 'G8'),
  (@sala3, 7, 0, 'H1'),
  (@sala3, 7, 1, 'H2'),
  (@sala3, 7, 2, 'H3'),
  (@sala3, 7, 3, 'H4'),
  (@sala3, 7, 4, 'H5'),
  (@sala3, 7, 5, 'H6'),
  (@sala3, 7, 6, 'H7'),
  (@sala3, 7, 7, 'H8'),
  (@sala3, 8, 1, 'I1'),
  (@sala3, 8, 2, 'I2'),
  (@sala3, 8, 3, 'I3'),
  (@sala3, 8, 4, 'I4'),
  (@sala3, 8, 5, 'I5'),
  (@sala3, 9, 1, 'L1'),
  (@sala3, 9, 2, 'L2'),
  (@sala3, 9, 3, 'L3'),
  (@sala3, 9, 4, 'L4'),
  (@sala3, 9, 5, 'L5');

-- ========= Hall D (layout3: 14 x 8) =========
INSERT INTO rooms (name, seat_rows, seat_cols) VALUES ('Hall D', 14, 8);
SET @sala4 := LAST_INSERT_ID();

INSERT INTO seats (room_id, row_idx, col_idx, label) VALUES
  (@sala4, 0, 1, 'A1'),
  (@sala4, 0, 2, 'A2'),
  (@sala4, 0, 3, 'A3'),
  (@sala4, 0, 4, 'A4'),
  (@sala4, 0, 5, 'A5'),
  (@sala4, 0, 6, 'A6'),
  (@sala4, 1, 0, 'B1'),
  (@sala4, 1, 1, 'B2'),
  (@sala4, 1, 2, 'B3'),
  (@sala4, 1, 3, 'B4'),
  (@sala4, 1, 4, 'B5'),
  (@sala4, 1, 5, 'B6'),
  (@sala4, 1, 6, 'B7'),
  (@sala4, 1, 7, 'B8'),
  (@sala4, 2, 0, 'C1'),
  (@sala4, 2, 1, 'C2'),
  (@sala4, 2, 2, 'C3'),
  (@sala4, 2, 3, 'C4'),
  (@sala4, 2, 4, 'C5'),
  (@sala4, 2, 5, 'C6'),
  (@sala4, 2, 6, 'C7'),
  (@sala4, 2, 7, 'C8'),
  (@sala4, 3, 0, 'D1'),
  (@sala4, 3, 1, 'D2'),
  (@sala4, 3, 2, 'D3'),
  (@sala4, 3, 3, 'D4'),
  (@sala4, 3, 4, 'D5'),
  (@sala4, 3, 5, 'D6'),
  (@sala4, 3, 6, 'D7'),
  (@sala4, 3, 7, 'D8'),
  (@sala4, 4, 0, 'E1'),
  (@sala4, 4, 1, 'E2'),
  (@sala4, 4, 2, 'E3'),
  (@sala4, 4, 3, 'E4'),
  (@sala4, 4, 4, 'E5'),
  (@sala4, 4, 5, 'E6'),
  (@sala4, 4, 6, 'E7'),
  (@sala4, 4, 7, 'E8'),
  (@sala4, 5, 0, 'F1'),
  (@sala4, 5, 1, 'F2'),
  (@sala4, 5, 2, 'F3'),
  (@sala4, 5, 3, 'F4'),
  (@sala4, 5, 4, 'F5'),
  (@sala4, 5, 5, 'F6'),
  (@sala4, 5, 6, 'F7'),
  (@sala4, 5, 7, 'F8'),
  (@sala4, 6, 0, 'G1'),
  (@sala4, 6, 1, 'G2'),
  (@sala4, 6, 2, 'G3'),
  (@sala4, 6, 3, 'G4'),
  (@sala4, 6, 4, 'G5'),
  (@sala4, 6, 5, 'G6'),
  (@sala4, 6, 6, 'G7'),
  (@sala4, 6, 7, 'G8'),
  (@sala4, 7, 0, 'H1'),
  (@sala4, 7, 1, 'H2'),
  (@sala4, 7, 2, 'H3'),
  (@sala4, 7, 3, 'H4'),
  (@sala4, 7, 4, 'H5'),
  (@sala4, 7, 5, 'H6'),
  (@sala4, 7, 6, 'H7'),
  (@sala4, 7, 7, 'H8'),
  (@sala4, 8, 0, 'I1'),
  (@sala4, 8, 1, 'I2'),
  (@sala4, 8, 2, 'I3'),
  (@sala4, 8, 3, 'I4'),
  (@sala4, 8, 4, 'I5'),
  (@sala4, 8, 5, 'I6'),
  (@sala4, 8, 6, 'I7'),
  (@sala4, 8, 7, 'I8'),
  (@sala4, 9, 0, 'L1'),
  (@sala4, 9, 1, 'L2'),
  (@sala4, 9, 2, 'L3'),
  (@sala4, 9, 3, 'L4'),
  (@sala4, 9, 4, 'L5'),
  (@sala4, 9, 5, 'L6'),
  (@sala4, 9, 6, 'L7'),
  (@sala4, 9, 7, 'L8'),
  (@sala4, 10, 0, 'M1'),
  (@sala4, 10, 1, 'M2'),
  (@sala4, 10, 2, 'M3'),
  (@sala4, 10, 3, 'M4'),
  (@sala4, 10, 4, 'M5'),
  (@sala4, 10, 5, 'M6'),
  (@sala4, 10, 6, 'M7'),
  (@sala4, 10, 7, 'M8'),
  (@sala4, 11, 0, 'N1'),
  (@sala4, 11, 1, 'N2'),
  (@sala4, 11, 2, 'N3'),
  (@sala4, 11, 3, 'N4'),
  (@sala4, 11, 4, 'N5'),
  (@sala4, 11, 5, 'N6'),
  (@sala4, 11, 6, 'N7'),
  (@sala4, 11, 7, 'N8'),
  (@sala4, 12, 1, 'O1'),
  (@sala4, 12, 2, 'O2'),
  (@sala4, 12, 3, 'O3'),
  (@sala4, 12, 4, 'O4'),
  (@sala4, 12, 5, 'O5'),
  (@sala4, 12, 6, 'O6');

-- Movies, alt titles and screenings
INSERT INTO movies (
  title,
  original_title,
  description,
  director,
  cast_text,
  duration_min,
  release_year,
  image_url
)
VALUES (
  'Jurassic World: Rebirth',
  'Jurassic World: Rebirth',
  'Set three years after Dominion, dinosaurs survive mostly in equatorial zones. Ex-military operative Zora Bennett teams up with paleontologist Dr. Henry Loomis on a mission to a former island lab to collect DNA from three colossal prehistoric creatures for a potential heart-disease cure. When they also cross paths with a shipwrecked family, both groups must battle mutated dinosaurs and corporate forces to make it out alive.',
  'Gareth Edwards',
  'Scarlett Johansson, Mahershala Ali, Jonathan Bailey, Rupert Friend, Ed Skrein, David Iacono, Philippine Velge',
  133,
  2025,
  '/movie-images/jurassic-world-rebirth.jpg'
);

-- Alt titles
INSERT INTO movie_alt_titles (movie_id, alt_title)
VALUES (LAST_INSERT_ID(), 'Jurassic Rebirth');

-- Screenings (showtimes)
INSERT INTO screenings (room_id, movie_id, starts_at, base_price_cents, language, three_d)
VALUES
  (1, 1, '2025-06-15 18:00:00', 800, 'EN', 0),
  (1, 1, '2025-06-15 21:00:00', 800, 'EN', 0),
  (2, 1, '2025-06-16 23:00:00', 800, 'EN', 0),
  (2, 1, '2025-06-17 19:00:00', 800, 'EN', 0);
  
  
/* =========================
   LILO & STITCH (2025)
   ========================= */
INSERT INTO movies (
  title, original_title, description, director, cast_text, duration_min, release_year, image_url
) VALUES (
  'Lilo & Stitch',
  'Lilo & Stitch',
  'After Earth becomes uninhabitable due to a lack of oxygen, a Hawaiian girl and her family find new hope thanks to a curious alien experiment: Stitch. Amidst chaos and affection, the group learns that ohana means family, and family means no one gets left behind.',
  'Dean Fleischer Camp',
  'Sydney Agudong, Zach Galifianakis, Maia Kealoha, Billy Magnussen, Tia Carrere, Chris Sanders, Amy Hill, Jason Scott Lee',
  108,
  2025,
  '/movie-images/lilo-and-stitch.jpeg'
);
SET @movie_id := LAST_INSERT_ID();

INSERT INTO movie_alt_titles (movie_id, alt_title) VALUES
(@movie_id, 'Lilo and Stitch'),
(@movie_id, 'Lilo Stitch');

/* Proiezioni (nessun conflitto con Jurassic) */
INSERT INTO screenings (room_id, movie_id, starts_at, base_price_cents, language, three_d) VALUES
-- Sun 2025-06-15 21:30 in sala 3 (libera)
(3, @movie_id, '2025-06-15 21:30:00', 800, 'IT', 0),
-- Mon 2025-06-16 23:00 spostata in sala 1 (sala 2 è occupata da Jurassic)
(1, @movie_id, '2025-06-16 23:00:00', 800, 'IT', 0),
-- Wed 2025-06-18 blocco serale in sala 2 (libera a quegli orari)
(2, @movie_id, '2025-06-18 18:00:00', 800, 'IT', 0),
(2, @movie_id, '2025-06-18 19:00:00', 800, 'IT', 0),
(2, @movie_id, '2025-06-18 21:00:00', 800, 'IT', 0),
-- Thu 2025-06-19 pomeriggio in sala 1
(1, @movie_id, '2025-06-19 17:00:00', 800, 'IT', 0),
(1, @movie_id, '2025-06-19 18:00:00', 800, 'IT', 0),
-- Fri 2025-06-20 mattina/sera in sala 2
(2, @movie_id, '2025-06-20 12:00:00', 800, 'IT', 0),
(2, @movie_id, '2025-06-20 21:00:00', 800, 'IT', 0);



/* =========================
   ADO SPECIAL LIVE ‘SHINZOU’
   ========================= */
INSERT INTO movies (
  title, original_title, description, director, cast_text, duration_min, release_year, image_url
) VALUES (
  'ADO SPECIAL LIVE ‘‘SHINZOU’’',
  'ADO SPECIAL LIVE ‘‘SHINZOU’’',
  'Filming of Ado s live performance that marked the new J-pop scene: powerful performances, striking visuals and original arrangements for a concert experience in the theatre.',
  'Ruriko Kano, Muneyoshi Nowara',
  'Ado, Takafumi Koukei, Naoki Kobayashi, Ryunosuke Morita, Sara Wakui, Shigeo Aoki',
  140,
  2025,
  '/movie-images/ado-special-live.jpg'
);
SET @movie_id := LAST_INSERT_ID();

INSERT INTO movie_alt_titles (movie_id, alt_title) VALUES
(@movie_id, 'ADO LIVE'),
(@movie_id, 'SHINZOU'),
(@movie_id, 'SHINSOU'),
(@movie_id, 'ADDO');

INSERT INTO screenings (room_id, movie_id, starts_at, base_price_cents, language, three_d) VALUES
-- Tue 2025-06-16 23:00 in sala 3 (sala 2 occupata da Jurassic)
(3, @movie_id, '2025-06-16 23:00:00', 1200, 'JA', 0),
-- Wed 2025-06-18 early-evening block in sala 1
(1, @movie_id, '2025-06-18 18:00:00', 1200, 'JA', 0),
(1, @movie_id, '2025-06-18 19:00:00', 1200, 'JA', 0),
(1, @movie_id, '2025-06-18 21:00:00', 1200, 'JA', 0),
-- Thu 2025-06-19 pomeriggio in sala 3
(3, @movie_id, '2025-06-19 17:00:00', 1200, 'JA', 0),
(3, @movie_id, '2025-06-19 18:00:00', 1200, 'JA', 0);



/* =========================
   ALBATROSS
   ========================= */
INSERT INTO movies (
  title, original_title, description, director, cast_text, duration_min, release_year, image_url
) VALUES (
  'ALBATROSS',
  'ALBATROSS',
  'A coming-of-age drama set in a small coastal community, where a young man grapples with guilt, forgiveness and freedom.',
  'Giulio Base',
  'Francesco Centorame, Michele Favaro, Linda Pani, Tommaso Santini, Luca Predonzani, Gianna Paola Scaffidi, Giancarlo Giannini, Giulio Base, Paolo Rozzi',
  90,
  2025,
  '/movie-images/albatross.jpg'
);
SET @movie_id := LAST_INSERT_ID();

-- Nessun alt title specificato
-- Show di luglio, giorni liberi
INSERT INTO screenings (room_id, movie_id, starts_at, base_price_cents, language, three_d) VALUES
(1, @movie_id, '2025-07-25 09:00:00', 700, 'IT', 0),
(1, @movie_id, '2025-07-25 11:00:00', 700, 'IT', 0),
(2, @movie_id, '2025-07-26 13:00:00', 700, 'IT', 0);



/* =========================
   DRAGON TRAINER
   ========================= */
INSERT INTO movies (
  title, original_title, description, director, cast_text, duration_min, release_year, image_url
) VALUES (
  'DRAGON TRAINER',
  'How to Train Your Dragon',
  'A young trainer and his dragon defy tradition and danger to change the fate of their village.',
  'Dean DeBlois',
  'Mason Thames, Nico Parker, Gerard Butler, Julian Dennison, Nick Frost, Bronwyn James, Gabriel Howell, Ruth Codd',
  125,
  2025,
  '/movie-images/dragon-trainer.jpg'
);
SET @movie_id := LAST_INSERT_ID();

INSERT INTO screenings (room_id, movie_id, starts_at, base_price_cents, language, three_d) VALUES
-- Sun 2025-06-15 pomeriggio in sala 2 (non confligge con Jurassic in sala 1)
(2, @movie_id, '2025-06-15 16:00:00', 900, 'IT', 0),
-- Mon 2025-06-16 sera in sala 3
(3, @movie_id, '2025-06-16 20:00:00', 900, 'IT', 0);



/* =========================
   ELIO
   ========================= */
INSERT INTO movies (
  title, original_title, description, director, cast_text, duration_min, release_year, image_url
) VALUES (
  'ELIO',
  'Elio',
  'A young boy is catapulted into an interstellar adventure that forces him to find his voice and his courage.',
  'Adrian Molina, Domee Shi, Madeline Sharafian',
  'Yonas Kibreab, Remy Edgerly, Brad Garrett, Zoe Saldana, Jameela Jamil, Brendan Hunt, Matthias Schweighöfer, Shirley Henderson',
  99,
  2025,
  '/movie-images/elio.jpg'
);
SET @movie_id := LAST_INSERT_ID();

INSERT INTO screenings (room_id, movie_id, starts_at, base_price_cents, language, three_d) VALUES
-- Sun 2025-06-15 slot pomeridiano in sala 1 (prima di Jurassic)
(1, @movie_id, '2025-06-15 14:00:00', 800, 'IT', 0),
-- Mon 2025-06-16 early-evening in sala 1 (non confligge con altri)
(1, @movie_id, '2025-06-16 18:30:00', 800, 'IT', 0),
-- Sun 2025-06-15 seconda serata in sala 3 (dopo Lilo 21:30)
(3, @movie_id, '2025-06-15 22:30:00', 800, 'IT', 0);



/* =========================
   F1
   ========================= */
INSERT INTO movies (
  title, original_title, description, director, cast_text, duration_min, release_year, image_url
) VALUES (
  'F1',
  'F1',
  'A veteran driver and a young talent compete for glory, redemption and speed in the world s most adrenaline-fuelled championship.',
  'Joseph Kosinski',
  'Brad Pitt, Kerry Condon, Damson Idris, Javier Bardem, Lewis Hamilton, Simone Ashley, Callie Cooke, Tobias Menzies',
  155,
  2025,
  '/movie-images/f1.jpg'
);
SET @movie_id := LAST_INSERT_ID();

INSERT INTO screenings (room_id, movie_id, starts_at, base_price_cents, language, three_d) VALUES
-- Sun 2025-06-15 tardo pomeriggio in sala 2 (tra ELIO 14:00 e Jurassic 18:00 in sala 1)
(2, @movie_id, '2025-06-15 17:30:00', 1000, 'EN', 0),
-- Mon 2025-06-16 seconda serata in sala 1
(1, @movie_id, '2025-06-16 21:30:00', 1000, 'EN', 0);



/* =========================
   HAPPY HOLIDAYS
   ========================= */
INSERT INTO movies (
  title, original_title, description, director, cast_text, duration_min, release_year, image_url
) VALUES (
  'Happy Holidays',
  'Happy Holidays',
  'Intertwined stories during the festive season reveal the fragility and hopes of a divided community, amid minor conflicts and unexpected gestures of solidarity.',
  'Scandar Copti',
  'Manar Shehab, Wafaa Aoun, Merav Mamorsky, Toufic Danial',
  124,
  2025,
  '/movie-images/happy-holidays.jpg'
);
SET @movie_id := LAST_INSERT_ID();

-- Nessun alt title specificato
INSERT INTO screenings (room_id, movie_id, starts_at, base_price_cents, language, three_d) VALUES
-- Tue 2025-06-17 pomeriggio in sala 1 (non confligge con Jurassic in sala 2 alle 19:00)
(1, @movie_id, '2025-06-17 16:00:00', 800, 'IT', 0),
-- Tue 2025-06-17 sera in sala 3
(3, @movie_id, '2025-06-17 21:00:00', 800, 'IT', 0);


