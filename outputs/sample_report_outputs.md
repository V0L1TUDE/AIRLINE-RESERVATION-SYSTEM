# Sample Report Outputs

These outputs are based on the sample data in `database/03_sample_data.sql`.

## Booking History

| Passenger | Flight | Route | Seat | Status | Fare |
| --- | --- | --- | --- | --- | --- |
| Aarav Mehta | SW101 | Delhi to Mumbai | 1A | Confirmed | 6750 |
| Isha Rao | SW101 | Delhi to Mumbai | 2A | Confirmed | 4500 |
| Kabir Khan | SW205 | Mumbai to Bengaluru | 2A | Confirmed | 5200 |

## Revenue Per Flight

| Flight | Route | Confirmed Bookings | Total Revenue |
| --- | --- | ---: | ---: |
| SW101 | Delhi to Mumbai | 2 | 11250 |
| SW205 | Mumbai to Bengaluru | 1 | 5200 |
| SW309 | Delhi to Kolkata | 0 | 0 |

## Occupancy Rate

| Flight | Total Seats | Available Seats | Occupancy |
| --- | ---: | ---: | ---: |
| SW101 | 6 | 4 | 33.33% |
| SW205 | 4 | 3 | 25.00% |
| SW309 | 2 | 2 | 0.00% |

## Most Booked Routes

| Route | Confirmed Bookings |
| --- | ---: |
| Delhi to Mumbai | 2 |
| Mumbai to Bengaluru | 1 |
| Delhi to Kolkata | 0 |

