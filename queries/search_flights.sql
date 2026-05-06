-- Utility query: search scheduled flights by route and date.
-- Replace bind variables with your own values in SQL Developer.

SELECT
    s.schedule_id,
    f.flight_number,
    f.airline_name,
    f.source_city,
    f.destination_city,
    TO_CHAR(s.departure_time, 'DD-MON-YYYY HH24:MI') AS departure,
    TO_CHAR(s.arrival_time, 'DD-MON-YYYY HH24:MI') AS arrival,
    s.aircraft_type,
    s.available_seats,
    f.base_fare
FROM Flight f
JOIN Schedule s ON s.flight_id = f.flight_id
WHERE UPPER(f.source_city) = UPPER(:source_city)
  AND UPPER(f.destination_city) = UPPER(:destination_city)
  AND TRUNC(s.departure_time) = TO_DATE(:travel_date, 'YYYY-MM-DD')
  AND s.schedule_status = 'Scheduled'
ORDER BY s.departure_time;

