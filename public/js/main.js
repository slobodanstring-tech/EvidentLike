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

  daysContainer.innerHTML = '';
  const firstDay = new Date(year, month, 1);
  const startDay = (firstDay.getDay() + 6) % 7;
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
      currentDate = clickedDate;
      updateWeekdayDates(clickedDate);
      highlightWeekInCalendar(clickedDate);
    });
  });

  // Po defaultu selektuj today ili prvu nedelju ako nije isti mesec
  const today = new Date();
  if (today.getMonth() === month && today.getFullYear() === year) {
    currentDate = today;
    updateWeekdayDates(today);
    highlightWeekInCalendar(today);
  } else {
    const firstOfMonth = new Date(year, month, 1);
    currentDate = firstOfMonth;
    updateWeekdayDates(firstOfMonth);
    highlightWeekInCalendar(firstOfMonth);
  }
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
    currentDate.setMonth(currentDate.getMonth() - 1);
    generateMiniCalendar(currentDate.getFullYear(), currentDate.getMonth());
  });
}

if (nextBtn) {
  nextBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
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
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + dayIndex);
    date.setHours(0, 0, 0, 0); // Osiguraj ponoć
    const iso = date.toISOString().split("T")[0];

    console.log("Saving client for date:", iso, "Client:", { name, time, note });
    console.log("Current date:", currentDate, "Base date:", baseDate);

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
  const baseDate = getMonday(currentDate);
  console.log("Base date for week:", baseDate.toISOString());
  const dayIds = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

  dayIds.forEach((id, index) => {
    const dayDate = new Date(baseDate);
    dayDate.setDate(baseDate.getDate() + index);
    dayDate.setHours(0, 0, 0, 0);
    const iso = dayDate.toISOString().split("T")[0];
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
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  console.log("getMonday input:", date, "output:", d);
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

  // Uvek osiguraj da popup ima potrebne klase
  popup.classList.add("client-info-popup", "md3-dialog");

  // Proveri da li su klase prisutne
  console.log("Klase popup-a:", popup.className);

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
      <p class="md3-dialog__date">${formattedDate}</p>
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
  const actions = popup.querySelector(".md3-dialog__actions");

  const elements = { nameTitle, nameInput, timeDisplay, timeInput, noteDisplay, noteInput, actions };
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
  console.log("Posle toglovanja - nameInput hidden:", nameInput.classList.contains("hidden"));

  if (!nameInput.classList.contains("hidden")) {
    console.log("Ušao u režim uređivanja");
    actions.innerHTML = `
      <button class="md3-button md3-button--text" onclick="event.stopPropagation(); closeClientInfoPopup()">Otkaži</button>
      <button class="md3-button md3-button--filled" onclick="event.stopPropagation(); saveEditedClient()">Sačuvaj</button>
    `;
    if (popup.dataset.flatpickrInitialized === "false") {
      console.log("Inicijalizujem Flatpickr za clientTimeInput");
      try {
        flatpickr("#clientTimeInput", {
          enableTime: true,
          noCalendar: true,
          dateFormat: "H:i",
          time_24hr: true,
          minuteIncrement: 5,
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

  if (!newName || !newTime) {
    alert("Unesite ime i vreme");
    return;
  }

  const clientIndex = parseInt(popup.dataset.clientIndex);
  const isoDate = popup.dataset.clientDate;

  if (clientData[isoDate] && clientIndex >= 0) {
    clientData[isoDate][clientIndex] = {
      ...clientData[isoDate][clientIndex],
      name: newName,
      time: newTime,
      note: newNote,
    };
    localStorage.setItem("clientData", JSON.stringify(clientData)); // Sačuvaj u localStorage
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

  allClients.sort((a, b) => {
    const dateA = new Date(a.isoDate);
    const dateB = new Date(b.isoDate);
    if (dateA.getTime() !== dateB.getTime()) {
      return dateA.getTime() - dateB.getTime();
    }
    const [h1, m1] = a.time.split(":").map(Number);
    const [h2, m2] = b.time.split(":").map(Number);
    return h1 * 60 + m1 - (h2 * 60 + m2);
  });

  clientsList.innerHTML = "";
  if (allClients.length === 0) {
    clientsList.innerHTML = "<p>Nema zakazanih klijenata.</p>";
    console.log("No clients to display");
  } else {
    allClients.forEach((client) => {
      const date = new Date(client.isoDate);
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
      ][date.getMonth()]} ${date.getFullYear()}`;
      const div = document.createElement("div");
      div.classList.add("client-item");
      if (client.completed) div.classList.add("completed");
      div.textContent = `${formattedDate} - ${client.time} - ${client.name}`;
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
  }
}
