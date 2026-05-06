-- Optional cleanup script. Run only when you want to rebuild the database.

DROP VIEW vw_revenue_per_flight;
DROP VIEW vw_flight_availability;
DROP VIEW vw_reservation_details;

DROP TABLE Payment CASCADE CONSTRAINTS;
DROP TABLE Reservation CASCADE CONSTRAINTS;
DROP TABLE Seat CASCADE CONSTRAINTS;
DROP TABLE Schedule CASCADE CONSTRAINTS;
DROP TABLE Flight CASCADE CONSTRAINTS;
DROP TABLE Passenger CASCADE CONSTRAINTS;

