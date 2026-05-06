-- Sample data for college demonstration.
-- Inserts use explicit IDs so the scripts are easy to read and explain.

INSERT INTO Passenger (passenger_id, first_name, last_name, gender, date_of_birth, email, phone, passport_number)
VALUES (1, 'Aarav', 'Mehta', 'Male', DATE '1998-04-12', 'aarav.mehta@example.com', '9876543210', 'P1234567');

INSERT INTO Passenger (passenger_id, first_name, last_name, gender, date_of_birth, email, phone, passport_number)
VALUES (2, 'Isha', 'Rao', 'Female', DATE '2000-09-22', 'isha.rao@example.com', '9876500011', 'P2345678');

INSERT INTO Passenger (passenger_id, first_name, last_name, gender, date_of_birth, email, phone, passport_number)
VALUES (3, 'Kabir', 'Khan', 'Male', DATE '1995-01-05', 'kabir.khan@example.com', '9876500022', 'P3456789');

INSERT INTO Passenger (passenger_id, first_name, last_name, gender, date_of_birth, email, phone, passport_number)
VALUES (4, 'Naina', 'Kapoor', 'Female', DATE '1999-07-18', 'naina.kapoor@example.com', '9876500033', 'P4567890');

INSERT INTO Flight (flight_id, flight_number, airline_name, source_city, destination_city, base_fare, status)
VALUES (1, 'SW101', 'SkyWay Airlines', 'Delhi', 'Mumbai', 4500, 'Active');

INSERT INTO Flight (flight_id, flight_number, airline_name, source_city, destination_city, base_fare, status)
VALUES (2, 'SW205', 'SkyWay Airlines', 'Mumbai', 'Bengaluru', 5200, 'Active');

INSERT INTO Flight (flight_id, flight_number, airline_name, source_city, destination_city, base_fare, status)
VALUES (3, 'SW309', 'SkyWay Airlines', 'Delhi', 'Kolkata', 4800, 'Active');

INSERT INTO Schedule (schedule_id, flight_id, departure_time, arrival_time, aircraft_type, total_seats, available_seats, schedule_status)
VALUES (1, 1, TIMESTAMP '2026-05-10 08:30:00', TIMESTAMP '2026-05-10 10:40:00', 'Airbus A320', 6, 4, 'Scheduled');

INSERT INTO Schedule (schedule_id, flight_id, departure_time, arrival_time, aircraft_type, total_seats, available_seats, schedule_status)
VALUES (2, 2, TIMESTAMP '2026-05-11 13:15:00', TIMESTAMP '2026-05-11 15:05:00', 'Boeing 737', 4, 3, 'Scheduled');

INSERT INTO Schedule (schedule_id, flight_id, departure_time, arrival_time, aircraft_type, total_seats, available_seats, schedule_status)
VALUES (3, 3, TIMESTAMP '2026-05-12 18:00:00', TIMESTAMP '2026-05-12 20:20:00', 'Airbus A321', 2, 2, 'Scheduled');

-- Seats for each scheduled flight.
INSERT ALL
    INTO Seat (seat_id, schedule_id, seat_number, seat_class, seat_status) VALUES (1, 1, '1A', 'Business', 'Booked')
    INTO Seat (seat_id, schedule_id, seat_number, seat_class, seat_status) VALUES (2, 1, '1B', 'Business', 'Available')
    INTO Seat (seat_id, schedule_id, seat_number, seat_class, seat_status) VALUES (3, 1, '2A', 'Economy', 'Booked')
    INTO Seat (seat_id, schedule_id, seat_number, seat_class, seat_status) VALUES (4, 1, '2B', 'Economy', 'Available')
    INTO Seat (seat_id, schedule_id, seat_number, seat_class, seat_status) VALUES (5, 1, '3A', 'Economy', 'Available')
    INTO Seat (seat_id, schedule_id, seat_number, seat_class, seat_status) VALUES (6, 1, '3B', 'Economy', 'Available')
    INTO Seat (seat_id, schedule_id, seat_number, seat_class, seat_status) VALUES (7, 2, '1A', 'Business', 'Available')
    INTO Seat (seat_id, schedule_id, seat_number, seat_class, seat_status) VALUES (8, 2, '1B', 'Business', 'Available')
    INTO Seat (seat_id, schedule_id, seat_number, seat_class, seat_status) VALUES (9, 2, '2A', 'Economy', 'Booked')
    INTO Seat (seat_id, schedule_id, seat_number, seat_class, seat_status) VALUES (10, 2, '2B', 'Economy', 'Available')
    INTO Seat (seat_id, schedule_id, seat_number, seat_class, seat_status) VALUES (11, 3, '1A', 'Business', 'Available')
    INTO Seat (seat_id, schedule_id, seat_number, seat_class, seat_status) VALUES (12, 3, '2A', 'Economy', 'Available')
SELECT 1 FROM dual;

INSERT INTO Reservation (reservation_id, passenger_id, schedule_id, seat_id, reservation_date, travel_class, reservation_status, fare_amount)
VALUES (1, 1, 1, 1, DATE '2026-05-01', 'Business', 'Confirmed', 6750);

INSERT INTO Reservation (reservation_id, passenger_id, schedule_id, seat_id, reservation_date, travel_class, reservation_status, fare_amount)
VALUES (2, 2, 1, 3, DATE '2026-05-01', 'Economy', 'Confirmed', 4500);

INSERT INTO Reservation (reservation_id, passenger_id, schedule_id, seat_id, reservation_date, travel_class, reservation_status, fare_amount)
VALUES (3, 3, 2, 9, DATE '2026-05-02', 'Economy', 'Confirmed', 5200);

INSERT INTO Payment (payment_id, reservation_id, payment_date, amount, payment_method, payment_status, transaction_ref)
VALUES (1, 1, DATE '2026-05-01', 6750, 'Credit Card', 'Paid', 'TXN-SW-1001');

INSERT INTO Payment (payment_id, reservation_id, payment_date, amount, payment_method, payment_status, transaction_ref)
VALUES (2, 2, DATE '2026-05-01', 4500, 'UPI', 'Paid', 'TXN-SW-1002');

INSERT INTO Payment (payment_id, reservation_id, payment_date, amount, payment_method, payment_status, transaction_ref)
VALUES (3, 3, DATE '2026-05-02', 5200, 'Debit Card', 'Paid', 'TXN-SW-1003');

COMMIT;
