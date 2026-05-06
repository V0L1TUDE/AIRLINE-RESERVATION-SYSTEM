-- Report: revenue per scheduled flight.

SELECT
    flight_number,
    source_city,
    destination_city,
    schedule_id,
    confirmed_bookings,
    total_revenue
FROM vw_revenue_per_flight
ORDER BY total_revenue DESC, flight_number;

-- Revenue by route.
SELECT
    source_city,
    destination_city,
    COUNT(reservation_id) AS total_bookings,
    SUM(CASE WHEN payment_status = 'Paid' THEN fare_amount ELSE 0 END) AS route_revenue
FROM vw_reservation_details
WHERE reservation_status = 'Confirmed'
GROUP BY source_city, destination_city
ORDER BY route_revenue DESC;

