// main.js

let currentDate = new Date();
let selectedCellElement = null;
let flatpickrInstance = null;
const clientData = {}; // ključ: ISO datum, vrednost: niz klijenata




function updateWeekdayDates(baseDate) {
  const dayIds = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  const startOfWeek = getMonday(baseDate);
  const today = new Date().toDateString();

  dayIds.forEach((id, index) => {
    const current = new Date(startOfWeek);
    current.setDate(startOfWeek.getDate() + index);
    const label = document.getElementById(`date-${id}`);
    const parent = label?.closest(".cell");
    if (label) {
      label.textContent = `${current.getDate()}`;
    }
    if (parent) {
      if (current.toDateString() === today) {
        parent.classList.add("cell-today");
      } else {
        parent.classList.remove("cell-today");
      }
    }
  });
  renderClientsForCurrentWeek();
}

document.addEventListener("DOMContentLoaded", () => {
  const savedData = localStorage.getItem("clientData");
  if (savedData) {
    try {
      const parsedData = JSON.parse(savedData);
      for (const iso in parsedData) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
          console.warn("Invalid ISO date in clientData:", iso);
          delete parsedData[iso];
        }
      }
      Object.assign(clientData, parsedData);
      console.log("Loaded clientData from localStorage:", clientData);
    } catch (error) {
      console.error("Error parsing clientData from localStorage:", error);
      localStorage.removeItem("clientData");
    }
  } else {
    console.log("No clientData in localStorage");
  }

  if (document.getElementById("clientsList")) {
    renderClientsList();
    // Dodaj event listener za today-btn na stranici sa listom
    const todayBtn = document.getElementById("today-btn");
    if (todayBtn) {
      todayBtn.addEventListener("click", () => {
        const todayHeader = document.getElementById("today-header");
        if (todayHeader) {
          todayHeader.scrollIntoView({ behavior: "smooth", block: "start" });
          // Prisilno osveži skrolbar
          const clientsList = document.getElementById("clientsList");
          clientsList.style.height = clientsList.offsetHeight + 'px';
          clientsList.style.height = 'auto';
        }
      });
    }
  } else {
    const today = new Date();
    currentDate = today;
    generateMiniCalendar(today.getFullYear(), today.getMonth());

    const todayBtn = document.getElementById("today-btn");
    if (todayBtn) {
      todayBtn.addEventListener("click", () => {
        const today = new Date();
        currentDate = today;
        generateMiniCalendar(today.getFullYear(), today.getMonth());
      });
    }
  }
});


function generateMiniCalendar(year, month) {
  const daysContainer = document.getElementById('calendar-days');
  if (!daysContainer) return;

  console.log("Generisanje kalendara za godinu:", year, "mesec:", month);

  daysContainer.innerHTML = '';
  const firstDay = new Date(year, month, 1);
  const startDay = (firstDay.getDay() + 6) % 7; // Ponedeljak kao prvi dan
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Previous month's trailing days
  for (let i = startDay - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const prevDate = new Date(year, month - 1, dayNum);
    const prevDay = document.createElement('div');
    prevDay.classList.add('calendar-day', 'prev-month');
    prevDay.textContent = prevDate.getDate();
    prevDay.dataset.fullDate = prevDate.toISOString().split('T')[0];
    daysContainer.appendChild(prevDay);
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const day = document.createElement('div');
    day.classList.add('calendar-day');
    day.textContent = date.getDate();
    day.dataset.fullDate = date.toISOString().split('T')[0];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (
      d === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    ) {
      day.classList.add('today');
    }

    daysContainer.appendChild(day);
  }

  // Fill trailing empty cells with next month days
  const totalCells = daysContainer.children.length;
  const remaining = 42 - totalCells;
  for (let i = 1; i <= remaining; i++) {
    const date = new Date(year, month + 1, i);
    const nextDay = document.createElement('div');
    nextDay.classList.add('calendar-day', 'next-month');
    nextDay.textContent = date.getDate();
    nextDay.dataset.fullDate = date.toISOString().split('T')[0];
    daysContainer.appendChild(nextDay);
  }

  const monthName = document.getElementById('month-name');
  if (monthName) {
    const monthNames = ["Januar", "Februar", "Mart", "April", "Maj", "Jun", "Jul", "Avgust", "Septembar", "Oktobar", "Novembar", "Decembar"];
    monthName.textContent = monthNames[month];
  }

  const allDays = daysContainer.querySelectorAll('.calendar-day');
  allDays.forEach(day => {
    day.addEventListener('click', () => {
      const clickedDate = new Date(day.dataset.fullDate);
      clickedDate.setHours(0, 0, 0, 0);
      currentDate = clickedDate;
      console.log("Klik na dan, currentDate:", currentDate.toISOString());
      updateWeekdayDates(clickedDate);
      highlightWeekInCalendar(clickedDate);
    });
  });

  // Ažuriraj nedelju na osnovu trenutnog currentDate
  updateWeekdayDates(currentDate);
  highlightWeekInCalendar(currentDate);
}

function highlightWeekInCalendar(referenceDate) {
  document.querySelectorAll('.calendar-day.week-selected').forEach(el => {
    el.classList.remove('week-selected');
  });

  const monday = getMonday(referenceDate);
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    const iso = date.toISOString().split('T')[0];
    const cell = document.querySelector(`.calendar-day[data-full-date="${iso}"]`);
    if (cell) {
      cell.classList.add('week-selected');
    }
  }
}

const prevBtn = document.getElementById('prev-month');
const nextBtn = document.getElementById('next-month');

if (prevBtn) {
  prevBtn.addEventListener('click', () => {
    console.log("Prethodni mesec, currentDate pre:", currentDate.toISOString());
    const newDate = new Date(currentDate);
    newDate.setDate(1); // Postavi dan na 1
    newDate.setMonth(newDate.getMonth() - 1);
    currentDate = newDate;
    console.log("Prethodni mesec, currentDate posle:", currentDate.toISOString());
    generateMiniCalendar(currentDate.getFullYear(), currentDate.getMonth());
  });
}

if (nextBtn) {
  nextBtn.addEventListener('click', () => {
    console.log("Sledeći mesec, currentDate pre:", currentDate.toISOString());
    const newDate = new Date(currentDate);
    newDate.setDate(1); // Postavi dan na 1
    newDate.setMonth(newDate.getMonth() + 1);
    currentDate = newDate;
    console.log("Sledeći mesec, currentDate posle:", currentDate.toISOString());
    generateMiniCalendar(currentDate.getFullYear(), currentDate.getMonth());
  });
}
document.querySelectorAll(".grid .cell").forEach(cell => {
  const title = cell.querySelector("h3");
  if (title) {
    title.addEventListener("click", () => {
      const dayText = title.textContent.trim();
      selectedCellElement = cell;
      openDayModal(dayText);
    });
  }
});

function closeModal() {
  document.getElementById("dayModal").classList.add("hidden");
}

function saveClient() {
  const name = document.getElementById("clientName").value;
  const time = document.getElementById("clientTime").value;
  const note = document.getElementById("clientNote").value;

  if (!name || !time) {
    console.log("Validation failed: Missing name or time");
    alert("Unesite ime i vreme");
    return;
  }

  if (selectedCellElement) {
    const label = selectedCellElement.querySelector(".date-label");
    const parentH3 = selectedCellElement.querySelector("h3");
    const dayName = parentH3.textContent.split(" ")[0]; // npr. "Pon"
    const dayNumber = label.textContent.trim();

    const baseDate = getMonday(currentDate);
    const weekdays = ["Pon", "Uto", "Sre", "Čet", "Pet", "Sub", "Ned"];
    const dayIndex = weekdays.indexOf(dayName);

    // Kreiraj datum za odabrani dan
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + dayIndex);
    date.setHours(0, 0, 0, 0); // Osiguraj ponoć u lokalnoj zoni

    // Ručno kreiraj ISO string u lokalnoj zoni
    const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

    console.log("Saving client for date:", iso, "date object:", date, "Client:", { name, time, note });
    console.log("Current date:", currentDate, "Base date:", baseDate, "Day index:", dayIndex);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
      console.error("Invalid ISO date:", iso);
      alert("Greška pri čuvanju klijenta: nevažeći datum.");
      return;
    }

    if (!clientData[iso]) clientData[iso] = [];
    clientData[iso].push({ name, time, note, completed: false });

    try {
      localStorage.setItem("clientData", JSON.stringify(clientData));
      console.log("Saved clientData to localStorage:", JSON.stringify(clientData));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
      alert("Greška pri čuvanju podataka.");
    }

    renderClientsForCurrentWeek();
    if (document.getElementById("clientsList")) {
      renderClientsList();
    }
  } else {
    console.error("No selected cell element");
  }

  closeModal();
}

function openDayModal(dayText) {
  document.getElementById("modal-day-title").textContent = dayText;
  document.getElementById("clientName").value = "";
  document.getElementById("clientTime").value = "";
  document.getElementById("clientNote").value = "";
  document.getElementById("dayModal").classList.remove("hidden");

  if (flatpickrInstance) flatpickrInstance.destroy();
  flatpickrInstance = flatpickr("#clientTime", {
    enableTime: true,
    noCalendar: true,
    dateFormat: "H:i",
    time_24hr: true,
    minuteIncrement: 5,
    defaultHour: 12,
    defaultMinute: 0
  });
  
}

document.addEventListener("click", (e) => {
  const popup = document.getElementById("clientPopup");
  if (popup && !popup.contains(e.target) && e.target !== popup) {
    popup.classList.add("hidden");
  }
});

function deleteClient(popupEl) {
  const clientIndex = parseInt(popupEl.dataset.clientIndex);
  const isoDate = popupEl.dataset.clientDate;

  if (clientData[isoDate] && clientIndex >= 0) {
    clientData[isoDate].splice(clientIndex, 1); // Ukloni klijenta po indeksu
    localStorage.setItem("clientData", JSON.stringify(clientData));
    renderClientsForCurrentWeek();
    if (document.getElementById("clientsList")) {
      renderClientsList();
    }
  }

  closeClientInfoPopup();
}


function renderClientsForCurrentWeek() {
  console.log("Pokrećem renderClientsForCurrentWeek, currentDate:", currentDate.toISOString());
  const baseDate = getMonday(currentDate);
  console.log("Base date for week:", baseDate.toISOString());
  const dayIds = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

  dayIds.forEach((id, index) => {
    const dayDate = new Date(baseDate);
    dayDate.setDate(baseDate.getDate() + index);
    dayDate.setHours(0, 0, 0, 0); // Osiguraj ponoć u lokalnoj zoni
    const iso = `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, "0")}-${String(dayDate.getDate()).padStart(2, "0")}`; // Ručno kreiraj ISO format
    console.log(`Rendering clients for ${id} (${iso})`);

    const cell = document.getElementById(`date-${id}`)?.closest(".cell");
    if (!cell) {
      console.warn(`Cell for ${id} not found`);
      return;
    }

    const eventContainer = cell.querySelector(".event");
    if (!eventContainer) {
      console.warn(`Event container for ${id} not found`);
      return;
    }
    eventContainer.innerHTML = "";

    if (clientData[iso]) {
      console.log(`Clients for ${iso}:`, clientData[iso]);
      const sortedClients = clientData[iso].sort((a, b) => {
        if (!a.time || !b.time || !a.time.includes(":")) return 0;
        const [h1, m1] = a.time.split(":").map(Number);
        const [h2, m2] = b.time.split(":").map(Number);
        return h1 * 60 + m1 - (h2 * 60 + m2);
      });

      sortedClients.forEach((client, clientIndex) => {
        const div = document.createElement("div");
        div.classList.add("client-entry");
        if (client.completed) div.classList.add("completed");
        div.textContent = `${client.time} - ${client.name}`;

        div.addEventListener("click", (e) => {
          e.stopPropagation();
          const x = e.pageX;
          const y = e.pageY;
          try {
            showClientInfoPopup({ ...client, date: iso, index: clientIndex }, x, y);
          } catch (error) {
            console.error("Greška u showClientInfoPopup:", error);
          }
        });

        if (client.note) div.title = client.note;

        eventContainer.appendChild(div);
      });
    }
  });
}

// Primer ispravne getMonday funkcije
function getMonday(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0); // Postavi na ponoć
  const day = d.getDay(); // 0 (nedelja) do 6 (subota)
  const diff = day === 0 ? -6 : 1 - day; // Pomeraj do ponedeljka
  d.setDate(d.getDate() + diff);
  console.log("getMonday input:", date.toISOString(), "output:", d.toISOString());
  return d;
}

function closeClientInfoPopup() {
  const popup = document.getElementById("clientInfoPopup");
  if (popup) popup.classList.add("hidden");
}

function showClientInfoPopup(client, x, y) {
  console.log("Podaci o klijentu:", client);
  let popup = document.getElementById("clientInfoPopup");

  if (!popup) {
    popup = document.createElement("div");
    popup.id = "clientInfoPopup";
    document.body.appendChild(popup);
  }

  popup.classList.add("client-info-popup", "md3-dialog");

  if (!client || !client.name || !client.time || !client.date) {
    console.error("Nepotpuni podaci o klijentu:", client);
    return;
  }

  const date = new Date(client.date);
  const formattedDate = `${date.getDate()}. ${[
      "Januar",
      "Februar",
      "Mart",
      "April",
      "Maj",
      "Jun",
      "Jul",
      "Avgust",
      "Septembar",
      "Oktobar",
      "Novembar",
      "Decembar",
    ][date.getMonth()]
    } ${date.getFullYear()}`;

  popup.dataset.clientData = JSON.stringify(client);
  popup.dataset.clientIndex = client.index;
  popup.dataset.clientDate = client.date;

  popup.innerHTML = `
    <div class="md3-dialog__header">
      <p class="md3-dialog__date" id="clientDateDisplay">${formattedDate}</p>
      <input type="text" id="clientDateInput" value="${client.date}" class="md3-text-field__input hidden" />
      <h3 class="md3-dialog__title" id="clientNameTitle">${client.name || "Nepoznato ime"}</h3>
      <input type="text" id="clientNameInput" value="${client.name || ""}" class="md3-text-field__input hidden" />
    </div>
    <div class="md3-dialog__content">
      <p><strong>Vreme:</strong> <span id="clientTimeDisplay">${client.time || "Nema vremena"}</span></p>
      <input type="text" id="clientTimeInput" value="${client.time || ""}" class="md3-text-field__input hidden" />
      <p><strong>Napomena:</strong> <span id="clientNoteDisplay">${client.note || ""}</span></p>
      <textarea id="clientNoteInput" class="md3-text-field__textarea hidden">${client.note || ""}</textarea>
    </div>
    <div class="md3-dialog__actions">
      <button class="md3-button md3-button--text" onclick="event.stopPropagation(); markClientCompleted()">
        ${client.completed ? "Vrati u zakazano" : "Završeno"}
      </button>
      <button class="md3-button md3-button--text" onclick="event.stopPropagation(); toggleEditMode()">Izmeniti</button>
      <button class="md3-button md3-button--text" onclick="event.stopPropagation(); deleteClient(this.parentElement.parentElement)">Obriši</button>
    </div>
  `;

  popup.dataset.flatpickrInitialized = "false";

  // Postavljanje pozicije popup-a
  const popupWidth = 280;
  const popupHeight = popup.offsetHeight || 200;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const scrollX = window.scrollX || window.pageXOffset;
  const scrollY = window.scrollY || window.pageYOffset;

  let adjustedX = x + scrollX;
  let adjustedY = y + scrollY;

  if (adjustedX + popupWidth > viewportWidth + scrollX) {
    adjustedX = viewportWidth + scrollX - popupWidth - 8;
  }
  if (adjustedY + popupHeight > viewportHeight + scrollY) {
    adjustedY = viewportHeight + scrollY - popupHeight - 8;
  }
  if (adjustedX < scrollX) adjustedX = scrollX + 8;
  if (adjustedY < scrollY) adjustedY = scrollY + 8;

  popup.style.left = `${adjustedX}px`;
  popup.style.top = `${adjustedY}px`;
  popup.style.position = "fixed";
  popup.classList.remove("hidden");

  console.log("Popup HTML:", popup.innerHTML);
  console.log("Popup pozicija:", { left: adjustedX, top: adjustedY });

  const handleOutsideClick = (e) => {
    if (!popup.contains(e.target) && e.target !== popup) {
      closeClientInfoPopup();
      document.removeEventListener("click", handleOutsideClick);
    }
  };

  setTimeout(() => {
    document.addEventListener("click", handleOutsideClick);
  }, 0);
}

function closeClientInfoPopup() {
  const popup = document.getElementById("clientInfoPopup");
  if (popup) popup.classList.add("hidden");
}

function toggleEditName() {
  const title = document.getElementById("clientNameTitle");
  const input = document.getElementById("clientNameInput");
  if (title && input) {
    title.classList.toggle("hidden");
    input.classList.toggle("hidden");
    if (!input.classList.contains("hidden")) {
      input.focus(); // Fokusiraj input polje kada se prikaže
    }
  }
}

function saveEditedClientName() {
  const popup = document.getElementById("clientInfoPopup");
  if (!popup) return;

  const newName = document.getElementById("clientNameInput").value.trim();
  const newNote = document.getElementById("clientNoteInput").value.trim();
  const newTime = document.getElementById("clientTimeInput").value.trim();

  if (!newName || !newTime) {
    alert("Unesite ime i vreme");
    return;
  }

  const clientIndex = parseInt(popup.dataset.clientIndex);
  const isoDate = popup.dataset.clientDate;
  const client = JSON.parse(popup.dataset.clientData);

  if (clientData[isoDate] && clientIndex >= 0) {
    clientData[isoDate][clientIndex] = {
      name: newName,
      time: newTime,
      note: newNote
    };
    localStorage.setItem("clientData", JSON.stringify(clientData)); // opcionalno
  }

  renderClientsForCurrentWeek();
  closeClientInfoPopup();
}

function toggleEditMode() {
  console.log("toggleEditMode pozvana");
  const popup = document.getElementById("clientInfoPopup");
  if (!popup) {
    console.error("Greška: clientInfoPopup nije pronađen");
    return;
  }

  const nameTitle = document.getElementById("clientNameTitle");
  const nameInput = document.getElementById("clientNameInput");
  const timeDisplay = document.getElementById("clientTimeDisplay");
  const timeInput = document.getElementById("clientTimeInput");
  const noteDisplay = document.getElementById("clientNoteDisplay");
  const noteInput = document.getElementById("clientNoteInput");
  const dateDisplay = document.getElementById("clientDateDisplay");
  const dateInput = document.getElementById("clientDateInput");
  const actions = popup.querySelector(".md3-dialog__actions");

  const elements = {
    nameTitle,
    nameInput,
    timeDisplay,
    timeInput,
    noteDisplay,
    noteInput,
    dateDisplay,
    dateInput,
    actions,
  };
  for (const [key, value] of Object.entries(elements)) {
    if (!value) {
      console.error(`Greška: ${key} nije pronađen`);
      return;
    }
  }

  console.log("Pre toglovanja - nameInput hidden:", nameInput.classList.contains("hidden"));
  nameTitle.classList.toggle("hidden");
  nameInput.classList.toggle("hidden");
  timeDisplay.classList.toggle("hidden");
  timeInput.classList.toggle("hidden");
  noteDisplay.classList.toggle("hidden");
  noteInput.classList.toggle("hidden");
  dateDisplay.classList.toggle("hidden");
  dateInput.classList.toggle("hidden");
  console.log("Posle toglovanja - nameInput hidden:", nameInput.classList.contains("hidden"));

  if (!nameInput.classList.contains("hidden")) {
    console.log("Ušao u režim uređivanja");
    actions.innerHTML = `
      <button class="md3-button md3-button--text" onclick="event.stopPropagation(); closeClientInfoPopup()">Otkaži</button>
      <button class="md3-button md3-button--filled" onclick="event.stopPropagation(); saveEditedClient()">Sačuvaj</button>
    `;
    if (popup.dataset.flatpickrInitialized === "false") {
      console.log("Inicijalizujem Flatpickr za clientTimeInput i clientDateInput");
      try {
        flatpickr("#clientTimeInput", {
          enableTime: true,
          noCalendar: true,
          dateFormat: "H:i",
          time_24hr: true,
          minuteIncrement: 5,
        });
        flatpickr("#clientDateInput", {
          dateFormat: "Y-m-d",
          defaultDate: dateInput.value,
          locale: {
            firstDayOfWeek: 1, // Ponedeljak kao prvi dan
            weekdays: {
              shorthand: ["Ned", "Pon", "Uto", "Sre", "Čet", "Pet", "Sub"],
              longhand: ["Nedelja", "Ponedeljak", "Utorak", "Sreda", "Četvrtak", "Petak", "Subota"],
            },
            months: {
              shorthand: [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "Maj",
                "Jun",
                "Jul",
                "Avg",
                "Sep",
                "Okt",
                "Nov",
                "Dec",
              ],
              longhand: [
                "Januar",
                "Februar",
                "Mart",
                "April",
                "Maj",
                "Jun",
                "Jul",
                "Avgust",
                "Septembar",
                "Oktobar",
                "Novembar",
                "Decembar",
              ],
            },
          },
        });
        popup.dataset.flatpickrInitialized = "true";
      } catch (error) {
        console.error("Greška pri inicijalizaciji Flatpickr-a:", error);
      }
    }
    nameInput.focus();
  } else {
    console.log("Vratio se u prikazni režim");
    actions.innerHTML = `
      <button class="md3-button md3-button--text" onclick="event.stopPropagation(); markClientCompleted()">Završeno</button>
      <button class="md3-button md3-button--text" onclick="event.stopPropagation(); toggleEditMode()">Izmeniti</button>
      <button class="md3-button md3-button--text" onclick="event.stopPropagation(); deleteClient(this.parentElement.parentElement)">Obriši</button>
    `;
  }
}

function markClientCompleted() {
  const popup = document.getElementById("clientInfoPopup");
  if (!popup) return;

  const clientIndex = parseInt(popup.dataset.clientIndex);
  const isoDate = popup.dataset.clientDate;

  if (clientData[isoDate] && clientIndex >= 0) {
    // Prebaci stanje completed (true -> false ili false -> true)
    clientData[isoDate][clientIndex].completed = !clientData[isoDate][clientIndex].completed;
    localStorage.setItem("clientData", JSON.stringify(clientData));
    renderClientsForCurrentWeek();
    if (document.getElementById("clientsList")) {
      renderClientsList();
    }
  }

  closeClientInfoPopup();
}

function saveEditedClient() {
  const popup = document.getElementById("clientInfoPopup");
  if (!popup) return;

  const newName = document.getElementById("clientNameInput").value.trim();
  const newTime = document.getElementById("clientTimeInput").value.trim();
  const newNote = document.getElementById("clientNoteInput").value.trim();
  const newDate = document.getElementById("clientDateInput").value.trim(); // Novi datum

  if (!newName || !newTime || !newDate) {
    alert("Unesite ime, vreme i datum");
    return;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
    console.error("Invalid ISO date:", newDate);
    alert("Nevažeći format datuma.");
    return;
  }

  const clientIndex = parseInt(popup.dataset.clientIndex);
  const oldDate = popup.dataset.clientDate;

  if (clientData[oldDate] && clientIndex >= 0) {
    // Kopiraj postojeće podatke klijenta
    const client = { ...clientData[oldDate][clientIndex] };

    // Ažuriraj podatke
    client.name = newName;
    client.time = newTime;
    client.note = newNote;

    // Ako se datum promenio, premesti klijenta
    if (oldDate !== newDate) {
      // Ukloni klijenta sa starog datuma
      clientData[oldDate].splice(clientIndex, 1);
      if (clientData[oldDate].length === 0) {
        delete clientData[oldDate];
      }
      // Dodaj klijenta na novi datum
      if (!clientData[newDate]) {
        clientData[newDate] = [];
      }
      clientData[newDate].push(client);
    } else {
      // Ako datum nije promenjen, samo ažuriraj postojeće podatke
      clientData[oldDate][clientIndex] = client;
    }

    // Sačuvaj u localStorage
    localStorage.setItem("clientData", JSON.stringify(clientData));

    // Ažuriraj prikaz kalendara i liste
    renderClientsForCurrentWeek();
    if (document.getElementById("clientsList")) {
      renderClientsList();
    }
  }
  closeClientInfoPopup();
}

function renderClientsList() {
  const clientsList = document.getElementById("clientsList");
  if (!clientsList) return;

  console.log("Rendering clients list, clientData:", JSON.stringify(clientData));
  console.log("All dates in clientData:", Object.keys(clientData));

  // Današnji datum
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  // Priprema svih klijenata za sortiranje
  const allClients = [];
  for (const [isoDate, clients] of Object.entries(clientData)) {
    clients.forEach((client, index) => {
      allClients.push({
        isoDate,
        index,
        ...client,
      });
    });
  }

  // Sortiranje klijenata hronološki po datumu i vremenu
  allClients.sort((a, b) => {
    const dateA = new Date(a.isoDate);
    const dateB = new Date(b.isoDate);
    dateA.setHours(0, 0, 0, 0);
    dateB.setHours(0, 0, 0, 0);
    if (dateA.getTime() !== dateB.getTime()) {
      return dateA.getTime() - dateB.getTime();
    }
    if (!a.time || !b.time || !a.time.includes(":")) return 0;
    const [h1, m1] = a.time.split(":").map(Number);
    const [h2, m2] = b.time.split(":").map(Number);
    return h1 * 60 + m1 - (h2 * 60 + m2);
  });

  clientsList.innerHTML = "";

  const monthNames = [
    "Januar",
    "Februar",
    "Mart",
    "April",
    "Maj",
    "Jun",
    "Jul",
    "Avgust",
    "Septembar",
    "Oktobar",
    "Novembar",
    "Decembar",
  ];

  // Prikaz svih klijenata hronološki
  let lastDate = null;
  allClients.forEach(client => {
    const date = new Date(client.isoDate);
    date.setHours(0, 0, 0, 0);
    const isToday = client.isoDate === todayIso;
    const formattedDate = isToday
      ? `Danas, ${date.getDate()}. ${monthNames[date.getMonth()]} ${date.getFullYear()}`
      : `${date.getDate()}. ${monthNames[date.getMonth()]} ${date.getFullYear()}`;

    // Dodaj zaglavlje za novi datum ako je drugačiji od prethodnog
    if (!lastDate || lastDate !== client.isoDate) {
      const header = document.createElement("h2");
      header.classList.add("month-header");
      if (isToday) {
        header.id = "today-header"; // ID za skrolovanje
        header.classList.add("today-header");
      }
      header.textContent = formattedDate;
      clientsList.appendChild(header);
      lastDate = client.isoDate;
    }

    // Dodaj klijenta
    const div = document.createElement("div");
    div.classList.add("client-item");
    if (isToday) div.classList.add("today-client");
    else if (date < today) div.classList.add("past-client");
    else div.classList.add("future-client");
    if (client.completed) div.classList.add("completed");

    div.textContent = isToday
      ? `${client.time} - ${client.name}`
      : `${formattedDate} - ${client.time} - ${client.name}`;
    if (client.note) div.title = client.note;

    div.addEventListener("click", (e) => {
      e.stopPropagation();
      showClientInfoPopup(
        {
          name: client.name,
          time: client.time,
          note: client.note,
          date: client.isoDate,
          index: client.index,
          completed: client.completed,
        },
        e.pageX,
        e.pageY
      );
    });

    clientsList.appendChild(div);
  });

  if (allClients.length === 0) {
    clientsList.innerHTML = "<p>Nema zakazanih klijenata.</p>";
    console.log("No clients to display");
  }

  // Pozicioniraj skrol na sekciju "Danas"
  setTimeout(() => {
    const todayHeader = document.getElementById("today-header");
    if (todayHeader) {
      todayHeader.scrollIntoView({ behavior: "auto", block: "start" });
    }
    // Prisilno osveži skrolbar
    clientsList.style.height = clientsList.offsetHeight + 'px';
    clientsList.style.height = 'auto';
  }, 10);
}

