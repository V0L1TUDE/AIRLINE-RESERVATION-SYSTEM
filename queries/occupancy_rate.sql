-- Analytics: occupancy rate for every schedule.

SELECT
    flight_number,
    source_city,
    destination_city,
    TO_CHAR(departure_time, 'DD-MON-YYYY HH24:MI') AS departure,
    total_seats,
    available_seats,
    total_seats - available_seats AS booked_seats,
    occupancy_percent
FROM vw_flight_availability
ORDER BY occupancy_percent DESC;

-- Average occupancy by route.
SELECT
    source_city,
    destination_city,
    ROUND(AVG(occupancy_percent), 2) AS average_occupancy_percent
FROM vw_flight_availability
GROUP BY source_city, destination_city
ORDER BY average_occupancy_percent DESC;

