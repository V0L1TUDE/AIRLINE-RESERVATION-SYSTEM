-- Analytics: most booked routes.

SELECT
    source_city,
    destination_city,
    COUNT(*) AS confirmed_bookings,
    SUM(fare_amount) AS total_fare_value
FROM vw_reservation_details
WHERE reservation_status = 'Confirmed'
GROUP BY source_city, destination_city
ORDER BY confirmed_bookings DESC, total_fare_value DESC;

-- Most active passengers by number of bookings.
SELECT
    passenger_name,
    email,
    COUNT(*) AS total_reservations,
    SUM(CASE WHEN reservation_status = 'Confirmed' THEN fare_amount ELSE 0 END) AS confirmed_value
FROM vw_reservation_details
GROUP BY passenger_name, email
ORDER BY total_reservations DESC, confirmed_value DESC;

