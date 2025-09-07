delete from movies;
delete from movie_alt_titles;
delete from screenings;
delete from bookings;
delete from booking_seats;
delete from seats;
delete from rooms;

-- reset id counters
ALTER TABLE movies AUTO_INCREMENT = 1;
ALTER TABLE movie_alt_titles AUTO_INCREMENT = 1;
ALTER TABLE screenings AUTO_INCREMENT = 1;
ALTER TABLE bookings AUTO_INCREMENT = 1;
ALTER TABLE booking_seats AUTO_INCREMENT = 1;
ALTER TABLE seats AUTO_INCREMENT = 1;
ALTER TABLE rooms AUTO_INCREMENT = 1;