const flights = [
    {
        scheduleId: 1,
        flightNumber: "SW101",
        route: "Delhi to Mumbai",
        source: "Delhi",
        destination: "Mumbai",
        departure: "2026-05-10 08:30",
        arrival: "2026-05-10 10:40",
        aircraft: "Airbus A320",
        baseFare: 4500,
        totalSeats: 6,
        availableSeats: 4
    },
    {
        scheduleId: 2,
        flightNumber: "SW205",
        route: "Mumbai to Bengaluru",
        source: "Mumbai",
        destination: "Bengaluru",
        departure: "2026-05-11 13:15",
        arrival: "2026-05-11 15:05",
        aircraft: "Boeing 737",
        baseFare: 5200,
        totalSeats: 4,
        availableSeats: 3
    },
    {
        scheduleId: 3,
        flightNumber: "SW309",
        route: "Delhi to Kolkata",
        source: "Delhi",
        destination: "Kolkata",
        departure: "2026-05-12 18:00",
        arrival: "2026-05-12 20:20",
        aircraft: "Airbus A321",
        baseFare: 4800,
        totalSeats: 2,
        availableSeats: 2
    }
];

const API_BASE_URL = "http://localhost:3000/api";
let lastFlightSource = "sample";
let lastReservationSource = "sample";
let lastFlightError = "";
let lastReservationError = "";

const seededReservations = [
    {
        id: 1,
        passengerName: "Aarav Mehta",
        email: "aarav.mehta@example.com",
        flightNumber: "SW101",
        route: "Delhi to Mumbai",
        travelClass: "Business",
        seatNumber: "1A",
        fare: 6750,
        status: "Confirmed"
    },
    {
        id: 2,
        passengerName: "Isha Rao",
        email: "isha.rao@example.com",
        flightNumber: "SW101",
        route: "Delhi to Mumbai",
        travelClass: "Economy",
        seatNumber: "2A",
        fare: 4500,
        status: "Confirmed"
    },
    {
        id: 3,
        passengerName: "Kabir Khan",
        email: "kabir.khan@example.com",
        flightNumber: "SW205",
        route: "Mumbai to Bengaluru",
        travelClass: "Economy",
        seatNumber: "2A",
        fare: 5200,
        status: "Confirmed"
    }
];

async function fetchApi(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        headers: { "Content-Type": "application/json" },
        ...options
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Request failed." }));
        throw new Error(error.error || "Request failed.");
    }

    return response.json();
}

async function loadFlights() {
    try {
        const apiFlights = await fetchApi("/flights");
        lastFlightSource = "backend";
        lastFlightError = "";
        return apiFlights;
    } catch (error) {
        console.warn("Using local flight data:", error.message);
        lastFlightSource = "sample";
        lastFlightError = error.message;
        return [...flights, ...getLocalFlights()];
    }
}

async function loadReservations() {
    try {
        const apiReservations = await fetchApi("/reservations");
        lastReservationSource = "backend";
        lastReservationError = "";
        return apiReservations;
    } catch (error) {
        console.warn("Using local reservation data:", error.message);
        lastReservationSource = "sample";
        lastReservationError = error.message;
        return getReservations();
    }
}

function getReservations() {
    const saved = localStorage.getItem("ars_reservations");
    if (!saved) {
        localStorage.setItem("ars_reservations", JSON.stringify(seededReservations));
        return seededReservations;
    }
    return JSON.parse(saved);
}

function saveReservations(reservations) {
    localStorage.setItem("ars_reservations", JSON.stringify(reservations));
}

function getLocalFlights() {
    const saved = localStorage.getItem("ars_added_flights");
    if (!saved) return [];
    return JSON.parse(saved);
}

function saveLocalFlights(localFlights) {
    localStorage.setItem("ars_added_flights", JSON.stringify(localFlights));
}

function formatCurrency(amount) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(amount);
}

function classMultiplier(travelClass) {
    return {
        Economy: 1,
        "Premium Economy": 1.25,
        Business: 1.5,
        First: 2
    }[travelClass] || 1;
}

function statusBadge(status) {
    const badgeClass = status === "Confirmed" ? "ok" : status === "Cancelled" ? "danger" : "warn";
    return `<span class="badge ${badgeClass}">${status}</span>`;
}

function setStatus(elementId, text, type = "info") {
    const element = document.getElementById(elementId);
    if (!element) return;

    element.textContent = text;
    element.className = `status-line ${type}`;
}

async function renderDashboard() {
    const reservations = await loadReservations();
    const activeFlights = await loadFlights();
    const confirmed = reservations.filter(item => item.status === "Confirmed");
    const revenue = confirmed.reduce((sum, item) => sum + item.fare, 0);
    const totalSeats = activeFlights.reduce((sum, item) => sum + item.totalSeats, 0);
    const bookedSeats = confirmed.length;
    const occupancy = totalSeats ? Math.round((bookedSeats / totalSeats) * 100) : 0;

    document.getElementById("totalFlights").textContent = activeFlights.length;
    document.getElementById("confirmedBookings").textContent = confirmed.length;
    document.getElementById("totalRevenue").textContent = formatCurrency(revenue);
    document.getElementById("occupancyRate").textContent = `${occupancy}%`;
}

async function renderFlights() {
    setStatus("flightsStatus", "Loading flights...", "info");

    const source = document.getElementById("sourceFilter")?.value.toLowerCase() || "";
    const destination = document.getElementById("destinationFilter")?.value.toLowerCase() || "";
    const activeFlights = await loadFlights();
    const rows = activeFlights
        .filter(flight => flight.source.toLowerCase().includes(source))
        .filter(flight => flight.destination.toLowerCase().includes(destination))
        .map(flight => {
            const occupancy = flight.occupancyPercent
                ?? Math.round(((flight.totalSeats - flight.availableSeats) / flight.totalSeats) * 100);
            return `
                <tr>
                    <td>${flight.scheduleId}</td>
                    <td>${flight.flightNumber}</td>
                    <td>${flight.route}</td>
                    <td>${flight.departure}</td>
                    <td>${flight.arrival}</td>
                    <td>${flight.aircraft || "Assigned"}</td>
                    <td>${flight.availableSeats}</td>
                    <td>${occupancy}%</td>
                    <td>${flight.baseFare ? formatCurrency(flight.baseFare) : "See DB"}</td>
                </tr>
            `;
        })
        .join("");

    document.getElementById("flightsBody").innerHTML = rows || "<tr><td colspan='9'>No matching flights found.</td></tr>";
    setStatus(
        "flightsStatus",
        lastFlightSource === "backend"
            ? "Loaded flights from backend API."
            : `Backend API not available, showing local demo flights. ${lastFlightError}`,
        lastFlightSource === "backend" ? "success" : "warning"
    );
}

async function populateFlightOptions() {
    const select = document.getElementById("scheduleId");
    if (!select) return;

    const activeFlights = await loadFlights();
    select.innerHTML = activeFlights
        .map(flight => `<option value="${flight.scheduleId}">${flight.flightNumber} - ${flight.route}</option>`)
        .join("");
}

function handleBooking() {
    const form = document.getElementById("bookingForm");
    if (!form) return;

    form.addEventListener("submit", async event => {
        event.preventDefault();
        const data = new FormData(form);
        const scheduleId = Number(data.get("scheduleId"));
        const travelClass = data.get("travelClass");

        try {
            const result = await fetchApi("/book", {
                method: "POST",
                body: JSON.stringify({
                    passengerId: Number(data.get("passengerId")),
                    passengerName: data.get("passengerName"),
                    email: data.get("email"),
                    scheduleId,
                    travelClass,
                    paymentMethod: data.get("paymentMethod")
                })
            });

            form.reset();
            showMessage(`Ticket booked through backend API. Reservation ID: ${result.reservationId}`, "success");
            return;
        } catch (error) {
            console.warn("Backend booking failed, using local demo booking:", error.message);
            showMessage(`Backend booking failed: ${error.message}. Saving this as a local demo booking.`, "warning");
            const backendErrorMessage = error.message;
        
            const selectedFlight = flights.find(flight => flight.scheduleId === scheduleId);
            const reservations = getReservations();
            const confirmedCount = reservations.filter(item =>
                item.flightNumber === selectedFlight.flightNumber && item.status === "Confirmed"
            ).length;

            if (confirmedCount >= selectedFlight.totalSeats) {
                showMessage("Selected flight is fully booked.", "error");
                return;
            }

            const reservation = {
                id: Date.now(),
                passengerName: data.get("passengerName") || `Passenger ${data.get("passengerId")}`,
                email: data.get("email") || "demo@example.com",
                flightNumber: selectedFlight.flightNumber,
                route: selectedFlight.route,
                travelClass,
                seatNumber: `AUTO-${confirmedCount + 1}`,
                fare: Math.round(selectedFlight.baseFare * classMultiplier(travelClass)),
                status: "Confirmed"
            };

            reservations.push(reservation);
            saveReservations(reservations);
            form.reset();
            showMessage(`Local demo booking created (backend error: ${backendErrorMessage}). Reservation ID: ${reservation.id}`, "warning");
            return;
        }
    });
}

function showMessage(text, type) {
    const message = document.getElementById("formMessage");
    message.textContent = text;
    message.className = `message show ${type}`;
}

function showAddFlightMessage(text, type) {
    const message = document.getElementById("addFlightMessage");
    if (!message) return;

    message.textContent = text;
    message.className = `message show ${type}`;
}

function handleAddFlight() {
    const form = document.getElementById("addFlightForm");
    if (!form) return;

    form.addEventListener("submit", async event => {
        event.preventDefault();
        const data = new FormData(form);

        const payload = {
            flightNumber: data.get("flightNumber").trim(),
            airlineName: data.get("airlineName").trim(),
            sourceCity: data.get("sourceCity").trim(),
            destinationCity: data.get("destinationCity").trim(),
            baseFare: Number(data.get("baseFare")),
            aircraftType: data.get("aircraftType").trim(),
            departureTime: data.get("departureTime"),
            arrivalTime: data.get("arrivalTime"),
            businessSeats: Number(data.get("businessSeats")),
            economySeats: Number(data.get("economySeats"))
        };

        if (payload.sourceCity.toLowerCase() === payload.destinationCity.toLowerCase()) {
            showAddFlightMessage("Source and destination cannot be the same.", "error");
            return;
        }

        if (new Date(payload.arrivalTime) <= new Date(payload.departureTime)) {
            showAddFlightMessage("Arrival time must be after departure time.", "error");
            return;
        }

        try {
            const result = await fetchApi("/flights", {
                method: "POST",
                body: JSON.stringify(payload)
            });

            form.reset();
            showAddFlightMessage(
                `Flight added successfully. Schedule ID: ${result.scheduleId}`,
                "success"
            );
        } catch (error) {
            console.warn("Backend add-flight failed, saving local demo flight:", error.message);

            const localFlights = getLocalFlights();
            const existingFlights = [...flights, ...localFlights];
            const nextScheduleId = existingFlights.length
                ? Math.max(...existingFlights.map(flight => Number(flight.scheduleId) || 0)) + 1
                : 1;
            const totalSeats = payload.businessSeats + payload.economySeats;
            const fallbackFlight = {
                scheduleId: nextScheduleId,
                flightNumber: payload.flightNumber,
                route: `${payload.sourceCity} to ${payload.destinationCity}`,
                source: payload.sourceCity,
                destination: payload.destinationCity,
                departure: payload.departureTime.replace("T", " "),
                arrival: payload.arrivalTime.replace("T", " "),
                aircraft: payload.aircraftType,
                baseFare: payload.baseFare,
                totalSeats,
                availableSeats: totalSeats
            };

            localFlights.push(fallbackFlight);
            saveLocalFlights(localFlights);
            form.reset();
            showAddFlightMessage(
                `Backend unavailable (${error.message}). Flight saved locally with Schedule ID: ${fallbackFlight.scheduleId}`,
                "warning"
            );
        }
    });
}

async function renderReservations() {
    setStatus("reservationsStatus", "Loading reservations...", "info");

    const reservations = await loadReservations();
    const rows = reservations.map(item => `
        <tr>
            <td>${item.id}</td>
            <td>${item.passengerName}</td>
            <td>${item.email}</td>
            <td>${item.flightNumber}</td>
            <td>${item.route}</td>
            <td>${item.travelClass}</td>
            <td>${item.seatNumber}</td>
            <td>${formatCurrency(item.fare)}</td>
            <td>${statusBadge(item.status)}</td>
            <td>
                ${item.status === "Confirmed"
                    ? `<button class="danger" data-cancel="${item.id}">Cancel</button>`
                    : ""}
            </td>
        </tr>
    `).join("");

    document.getElementById("reservationsBody").innerHTML = rows || "<tr><td colspan='10'>No reservations found.</td></tr>";
    setStatus(
        "reservationsStatus",
        lastReservationSource === "backend"
            ? "Loaded reservations from backend API."
            : `Backend API not available, showing local demo reservations. ${lastReservationError}`,
        lastReservationSource === "backend" ? "success" : "warning"
    );

    document.querySelectorAll("[data-cancel]").forEach(button => {
        button.addEventListener("click", async () => {
            const id = Number(button.dataset.cancel);
            try {
                await fetchApi(`/cancel/${id}`, { method: "POST" });
                await renderReservations();
                setStatus("reservationsStatus", `Cancelled reservation ${id} through backend API.`, "success");
                return;
            } catch (error) {
                console.warn("Backend cancellation failed, using local demo cancellation:", error.message);
                setStatus(
                    "reservationsStatus",
                    `Backend cancellation failed: ${error.message}. Cancelling local demo reservation.`,
                    "warning"
                );
            }

            const updated = getReservations().map(item =>
                item.id === id ? { ...item, status: "Cancelled" } : item
            );
            saveReservations(updated);
            await renderReservations();
            setStatus("reservationsStatus", `Local demo reservation ${id} cancelled.`, "warning");
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("totalFlights")) renderDashboard();
    if (document.getElementById("flightsBody")) {
        renderFlights();
        document.getElementById("sourceFilter").addEventListener("input", renderFlights);
        document.getElementById("destinationFilter").addEventListener("input", renderFlights);
        document.getElementById("loadFlightsButton").addEventListener("click", renderFlights);
    }
    if (document.getElementById("bookingForm")) {
        populateFlightOptions();
        handleBooking();
    }
    if (document.getElementById("addFlightForm")) handleAddFlight();
    if (document.getElementById("reservationsBody")) {
        renderReservations();
        document.getElementById("loadReservationsButton").addEventListener("click", renderReservations);
    }
});
