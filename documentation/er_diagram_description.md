# ER Diagram Description

## Entities

### Passenger
Stores customer information such as name, gender, date of birth, email, phone number, and passport number. Each passenger can make many reservations.

### Flight
Stores flight master information such as flight number, airline name, source city, destination city, base fare, and active status. One flight can have many schedules.

### Schedule
Stores actual flight timing information for a particular flight, including departure time, arrival time, aircraft type, total seats, available seats, and schedule status.

### Seat
Stores seat-level details for each scheduled flight. Each seat belongs to one schedule and has a seat number, class, and status.

### Reservation
Stores ticket booking details. It connects a passenger, schedule, and seat. It also stores reservation date, travel class, status, and fare amount.

### Payment
Stores payment information for a reservation, including amount, payment method, payment status, transaction reference, and payment date.

## Relationships

- Passenger to Reservation: one passenger can make many reservations.
- Flight to Schedule: one flight can have many scheduled departures.
- Schedule to Seat: one schedule contains many seats.
- Schedule to Reservation: one schedule can have many reservations.
- Seat to Reservation: one seat can be assigned to one active reservation at a time.
- Reservation to Payment: each reservation has one payment record.

## Cardinality Summary

| Relationship | Cardinality |
| --- | --- |
| Passenger - Reservation | 1 to many |
| Flight - Schedule | 1 to many |
| Schedule - Seat | 1 to many |
| Schedule - Reservation | 1 to many |
| Seat - Reservation | 1 to optional 1 active booking |
| Reservation - Payment | 1 to 1 |

