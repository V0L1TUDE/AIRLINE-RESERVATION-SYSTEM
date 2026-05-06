# Normalization Explanation

The Airline Reservation System schema is normalized to reduce redundancy and improve data consistency.

## First Normal Form (1NF)

The design satisfies 1NF because every table has atomic values and no repeating groups.

Examples:

- Passenger names, emails, and phone numbers are stored in separate columns.
- Each seat is stored as an individual row in the Seat table.
- Each payment is stored as a separate row in the Payment table.

## Second Normal Form (2NF)

The design satisfies 2NF because all non-key attributes fully depend on the primary key of their table.

Examples:

- In Passenger, email and passport number depend only on passenger_id.
- In Flight, source_city, destination_city, and base_fare depend only on flight_id.
- In Seat, seat_number, seat_class, and seat_status depend only on seat_id.

## Third Normal Form (3NF)

The design satisfies 3NF because non-key attributes do not depend on other non-key attributes.

Examples:

- Flight data is separated from Schedule data. This avoids repeating route and fare data for each scheduled departure.
- Payment data is separated from Reservation data. This avoids storing payment method and transaction details in the reservation table.
- Seat data is separated from Reservation data. This allows seat availability to be managed independently.

## Benefits Of This Design

- Avoids duplicate passenger, flight, and payment information.
- Improves data integrity through foreign keys.
- Makes reports easier to write using joins and views.
- Supports cancellation history while preventing two active reservations for the same seat.

