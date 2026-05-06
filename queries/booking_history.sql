-- Report: booking history for all passengers.

SELECT
    passenger_name,
    email,
    flight_number,
    source_city,
    destination_city,
    TO_CHAR(departure_time, 'DD-MON-YYYY HH24:MI') AS departure,
    seat_number,
    seat_class,
    reservation_status,
    fare_amount,
    payment_status
FROM vw_reservation_details
ORDER BY departure_time, passenger_name;

-- Booking history for a single passenger:
-- Replace :passenger_id with an actual passenger ID in SQL Developer.
SELECT
    reservation_id,
    passenger_name,
    flight_number,
    source_city || ' to ' || destination_city AS route,
    TO_CHAR(departure_time, 'DD-MON-YYYY HH24:MI') AS departure,
    seat_number,
    reservation_status,
    fare_amount
FROM vw_reservation_details
WHERE passenger_id = :passenger_id
ORDER BY departure_time DESC;

