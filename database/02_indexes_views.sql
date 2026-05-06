-- Indexes improve report, lookup, and transaction performance.

CREATE INDEX idx_flight_route
    ON Flight(source_city, destination_city);

CREATE INDEX idx_schedule_flight_time
    ON Schedule(flight_id, departure_time);

CREATE INDEX idx_seat_schedule_status
    ON Seat(schedule_id, seat_status);

CREATE INDEX idx_reservation_passenger
    ON Reservation(passenger_id);

CREATE INDEX idx_reservation_schedule_status
    ON Reservation(schedule_id, reservation_status);

-- Prevent two active bookings for the same seat while still allowing cancelled history.
CREATE UNIQUE INDEX uq_confirmed_seat_schedule
    ON Reservation(
        CASE WHEN reservation_status IN ('Confirmed', 'Checked-In') THEN schedule_id END,
        CASE WHEN reservation_status IN ('Confirmed', 'Checked-In') THEN seat_id END
    );

CREATE INDEX idx_payment_status
    ON Payment(payment_status);

-- View: complete reservation details for users and reports.
CREATE OR REPLACE VIEW vw_reservation_details AS
SELECT
    r.reservation_id,
    p.passenger_id,
    p.first_name || ' ' || p.last_name AS passenger_name,
    p.email,
    f.flight_number,
    f.airline_name,
    f.source_city,
    f.destination_city,
    s.departure_time,
    s.arrival_time,
    st.seat_number,
    st.seat_class,
    r.reservation_status,
    r.fare_amount,
    pay.payment_status,
    pay.payment_method
FROM Reservation r
JOIN Passenger p ON p.passenger_id = r.passenger_id
JOIN Schedule s ON s.schedule_id = r.schedule_id
JOIN Flight f ON f.flight_id = s.flight_id
JOIN Seat st ON st.seat_id = r.seat_id
LEFT JOIN Payment pay ON pay.reservation_id = r.reservation_id;

-- View: flight availability summary.
CREATE OR REPLACE VIEW vw_flight_availability AS
SELECT
    s.schedule_id,
    f.flight_number,
    f.source_city,
    f.destination_city,
    s.departure_time,
    s.arrival_time,
    s.total_seats,
    s.available_seats,
    ROUND(((s.total_seats - s.available_seats) / s.total_seats) * 100, 2) AS occupancy_percent,
    s.schedule_status
FROM Schedule s
JOIN Flight f ON f.flight_id = s.flight_id;

-- View: revenue by scheduled flight.
CREATE OR REPLACE VIEW vw_revenue_per_flight AS
SELECT
    f.flight_number,
    f.source_city,
    f.destination_city,
    s.schedule_id,
    COUNT(CASE WHEN r.reservation_status = 'Confirmed' THEN r.reservation_id END) AS confirmed_bookings,
    NVL(SUM(CASE WHEN r.reservation_status = 'Confirmed' THEN p.amount ELSE 0 END), 0) AS total_revenue
FROM Flight f
JOIN Schedule s ON s.flight_id = f.flight_id
LEFT JOIN Reservation r ON r.schedule_id = s.schedule_id
LEFT JOIN Payment p ON p.reservation_id = r.reservation_id
GROUP BY f.flight_number, f.source_city, f.destination_city, s.schedule_id;
