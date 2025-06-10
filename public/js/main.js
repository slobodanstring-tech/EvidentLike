// main.js
let currentDate = new Date();
let selectedCellElement = null;
let flatpickrInstance = null;
let clientData = {}; // ključ: ISO datum, vrednost: niz klijenata

// Funkcija za prebacivanje između prikaza
function switchView(view) {
  console.log("Prebacujem na prikaz:", view);

  // Pronađi elemente
  const views = document.querySelectorAll(".view");
  const navItems = document.querySelectorAll(".nav-item");
  const calendarTop = document.getElementById("calendar-top");
  const clientsTop = document.querySelector(".clients-top");
  const allClientsBtn = document.getElementById("all-clients-btn");
  const rightTop = document.getElementById("right-top");

  // Provera da li su svi elementi prisutni
  if (!calendarTop || !clientsTop || !allClientsBtn || !rightTop) {
    console.error("Greška: Neki elementi top-bara nisu pronađeni!", {
      calendarTop: !!calendarTop,
      clientsTop: !!clientsTop,
      allClientsBtn: !!allClientsBtn,
      rightTop: !!rightTop,
    });
    return;
  }

  // Ažuriraj vidljivost prikaza
  views.forEach((v) => {
    if (v.id === `${view}-view`) {
      console.log(`Prikazujem view: ${v.id}`);
      v.classList.remove("hidden");
      v.classList.add("active");
    } else {
      console.log(`Sakrivam view: ${v.id}`);
      v.classList.add("hidden");
      v.classList.remove("active");
    }
  });

  // Ažuriraj navigacionu traku, isključujući "clients"
  navItems.forEach((item) => {
    item.classList.remove("active");
    const icon = item.querySelector("i");
    const span = item.querySelector("span");
    if (icon && span) {
      icon.classList.remove("active");
      span.classList.remove("active");
    }
    // Dodaj klasu active samo ako nije "clients"
    if (item.dataset.view === view && item.dataset.view !== "clients") {
      console.log(`Aktiviram nav-item: ${item.dataset.view}`);
      item.classList.add("active");
      if (icon && span) {
        icon.classList.add("active");
        span.classList.add("active");
      }
    } else {
      console.log(`Ne aktiviram nav-item: ${item.dataset.view}`);
    }
  });

  // Ažuriraj top-bar
  console.log(`Ažuriram top-bar za prikaz: ${view}`);
  if (view === "clients") {
    console.log("Sakrivam all-clients-btn i prikazujem clients-top");
    calendarTop.classList.add("hidden");
    clientsTop.classList.remove("hidden");
    allClientsBtn.classList.add("hidden"); // Dodaj klasu hidden
    console.log("all-clients-btn klase:", allClientsBtn.classList.toString());
    console.log("all-clients-btn computed style display:", window.getComputedStyle(allClientsBtn).display);
    rightTop.classList.add("clients-mode");
    renderClientsList();
  } else {
    console.log("Prikazujem all-clients-btn i sakrivam clients-top");
    calendarTop.classList.remove("hidden");
    clientsTop.classList.add("hidden");
    allClientsBtn.classList.remove("hidden"); // Ukloni klasu hidden
    console.log("all-clients-btn klase:", allClientsBtn.classList.toString());
    console.log("all-clients-btn computed style display:", window.getComputedStyle(allClientsBtn).display);
    rightTop.classList.remove("clients-mode");
    generateMiniCalendar(currentDate.getFullYear(), currentDate.getMonth());
    updateWeekdayDates(currentDate);
  }
}

// Ažurirani DOMContentLoaded događaj
// Ažurirani DOMContentLoaded događaj
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("/api/clients");
    if (!response.ok) throw new Error("Greška pri dohvatanju klijenata");
    clientData = await response.json();
    console.log("Učitani podaci sa servera:", clientData);

    // Inicijalno prikazivanje kalendara
    const today = new Date();
    currentDate = today;
    generateMiniCalendar(today.getFullYear(), today.getMonth());
    updateWeekdayDates(today);

    // Postavi event listener za all-clients-btn
    const allClientsBtn = document.getElementById("all-clients-btn");
    if (allClientsBtn) {
      console.log("Pronađen all-clients-btn, postavljanje event listenera");
      allClientsBtn.addEventListener("click", (e) => {
        e.preventDefault();
        console.log("Klik na all-clients-btn, prelazim na prikaz klijenata");
        switchView("clients");
      });
    } else {
      console.error('all-clients-btn NIJE PRONAĐEN u DOM-u! Proveri index.ejs za id="all-clients-btn".');
    }

    // Postavi event listener za today-btn
    const todayBtn = document.getElementById("today-btn");
    if (todayBtn) {
      console.log("Pronađen today-btn, postavljanje event listenera");
      todayBtn.addEventListener("click", () => {
        console.log("Klik na today-btn");
        const today = new Date();
        currentDate = today;

        // Proveri koji je trenutni prikaz
        const isClientsViewActive = document.getElementById("clients-view").classList.contains("active");

        if (isClientsViewActive) {
          // Ako je lista klijenata aktivna, samo skroluj na "Danas"
          console.log("Lista klijenata je aktivna, skrolujem na 'Danas'");
          renderClientsList(); // Osveži listu klijenata
          setTimeout(() => {
            const todayHeader = document.getElementById("today-header");
            if (todayHeader) {
              todayHeader.scrollIntoView({ behavior: "smooth", block: "start" });
            } else {
              console.warn("today-header nije pronađen u clients-view");
            }
          }, 100); // Dodat mali delay da osiguramo da je renderClientsList završen
        } else {
          // Ako nije lista klijenata, prebaci na kalendar
          console.log("Prebacujem na prikaz kalendara");
          switchView("calendar");
          generateMiniCalendar(today.getFullYear(), today.getMonth());
          updateWeekdayDates(today);
        }
      });
    } else {
      console.error('today-btn NIJE PRONAĐEN u DOM-u! Proveri index.html za id="today-btn".');
    }

    // Postavi event listenere za navigaciju, isključujući "clients" i "expenses"
    document.querySelectorAll(".nav-item").forEach((item) => {
      if (item.dataset.view !== "clients" && item.dataset.view !== "expenses") {
        console.log(`Postavljam event listener za nav-item: ${item.dataset.view}`);
        item.addEventListener("click", () => {
          const view = item.dataset.view;
          console.log("Klik na nav-item, prelazim na prikaz:", view);
          switchView(view);
        });
      } else {
        console.log(`Preskačem event listener za nav-item: ${item.dataset.view}`);
      }
    });
  } catch (error) {
    console.error("Greška pri inicijalizaciji:", error);
  }
}); 

// Ostatak koda ostaje isti
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

function generateMiniCalendar(year, month) {
  const daysContainer = document.getElementById("calendar-days");
  if (!daysContainer) {
    console.error("Greška: calendar-days element nije pronađen!");
    return;
  }

  console.log("Generisanje kalendara za godinu:", year, "mesec:", month);

  daysContainer.innerHTML = "";
  const firstDay = new Date(year, month, 1);
  const startDay = (firstDay.getDay() + 6) % 7; // Ponedeljak kao prvi dan
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Previous month's trailing days
  for (let i = startDay - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const prevDate = new Date(year, month - 1, dayNum);
    const prevDay = document.createElement("div");
    prevDay.classList.add("calendar-day", "prev-month");
    prevDay.textContent = prevDate.getDate();
    prevDay.dataset.fullDate = prevDate.toISOString().split("T")[0];
    daysContainer.appendChild(prevDay);
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    const day = document.createElement("div");
    day.classList.add("calendar-day");
    day.textContent = date.getDate();
    day.dataset.fullDate = date.toISOString().split("T")[0];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (
      d === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    ) {
      day.classList.add("today");
    }

    daysContainer.appendChild(day);
  }

  // Fill trailing empty cells with next month days
  const totalCells = daysContainer.children.length;
  const remaining = 42 - totalCells;
  for (let i = 1; i <= remaining; i++) {
    const date = new Date(year, month + 1, i);
    const nextDay = document.createElement("div");
    nextDay.classList.add("calendar-day", "next-month");
    nextDay.textContent = date.getDate();
    nextDay.dataset.fullDate = date.toISOString().split("T")[0];
    daysContainer.appendChild(nextDay);
  }

  // Ispravka: Koristi document.querySelector umesto document.get
  const monthName = document.querySelector("span#month-name");
  if (monthName) {
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
    monthName.textContent = monthNames[month];
  } else {
    console.warn("month-name element nije pronađen u DOM-u!");
  }

  const allDays = daysContainer.querySelectorAll(".calendar-day");
  allDays.forEach((day) => {
    day.addEventListener("click", () => {
      const clickedDate = new Date(day.dataset.fullDate);
      clickedDate.setHours(0, 0, 0, 0);
      currentDate = clickedDate;
      console.log(
        "Klik na dan u mini kalendaru, currentDate:",
        currentDate.toISOString()
      );
      updateWeekdayDates(clickedDate);
      highlightWeekInCalendar(clickedDate);
    });
  });

  // Ažuriraj nedelju na osnovu trenutnog currentDate
  updateWeekdayDates(currentDate);
  highlightWeekInCalendar(currentDate);
}

function highlightWeekInCalendar(referenceDate) {
  document.querySelectorAll(".calendar-day.week-selected").forEach((el) => {
    el.classList.remove("week-selected");
  });

  const monday = getMonday(referenceDate);
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    const iso = date.toISOString().split("T")[0];
    const cell = document.querySelector(`.calendar-day[data-full-date="${iso}"]`);
    if (cell) {
      cell.classList.add("week-selected");
    }
  }
}

const prevBtn = document.getElementById("prev-month");
const nextBtn = document.getElementById("next-month");

if (prevBtn) {
  prevBtn.addEventListener("click", () => {
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
  nextBtn.addEventListener("click", () => {
    console.log("Sledeći mesec, currentDate pre:", currentDate.toISOString());
    const newDate = new Date(currentDate);
    newDate.setDate(1); // Postavi dan na 1
    newDate.setMonth(newDate.getMonth() + 1);
    currentDate = newDate;
    console.log("Sledeći mesec, currentDate posle:", currentDate.toISOString());
    generateMiniCalendar(currentDate.getFullYear(), currentDate.getMonth());
  });
}

document.querySelectorAll(".grid .cell").forEach((cell) => {
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

async function saveClient() {
  const name = document.getElementById("clientName").value;
  const time = document.getElementById("clientTime").value;
  const note = document.getElementById("clientNote").value;

  if (!name || !time) {
    alert("Unesite ime i vreme");
    return;
  }

  let iso;
  const modal = document.getElementById("dayModal");

  if (!modal) {
    console.error("Greška: dayModal nije pronađen u DOM-u");
    alert("Greška: Modal nije dostupan.");
    return;
  }

  if (modal.dataset.selectedDate) {
    iso = modal.dataset.selectedDate;
  } else if (selectedCellElement) {
    const label = selectedCellElement.querySelector("span.date-label");
    const parentH3 = selectedCellElement.querySelector("h3");

    if (!label || !parentH3) {
      console.error("Greška: label ili h3 nisu pronađeni u selectedCellElement", {
        label: !!label,
        parentH3: !!parentH3,
      });
      alert("Greška: Nisu pronađeni potrebni elementi za datum.");
      return;
    }

    const dayName = parentH3.textContent.split(" ")[0];
    const dayNumber = label.textContent.trim();

    const baseDate = getMonday(currentDate);
    const weekdays = ["Pon", "Uto", "Sre", "Čet", "Pet", "Sub", "Ned"];
    const dayIndex = weekdays.indexOf(dayName);

    if (dayIndex === -1) {
      console.error("Greška: Dan nije pronađen u weekdays nizu:", dayName);
      alert("Greška: Nevažeći dan.");
      return;
    }

    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + dayIndex);
    date.setHours(0, 0, 0, 0);

    iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  } else {
    console.error("Greška: Niti je izabran datum u modalu niti je postavljen selectedCellElement");
    alert("Greška: Nije izabran datum.");
    return;
  }

  try {
    const response = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: iso, name, time, note }),
    });
    if (!response.ok) throw new Error("Greška pri dodavanju klijenta");
    const newClient = await response.json();
    if (!clientData[iso]) clientData[iso] = [];
    clientData[iso].push(newClient);
    renderClientsForCurrentWeek();
    if (document.getElementById("clientsList")) {
      renderClientsList();
    }
    closeModal();
  } catch (error) {
    console.error("Greška pri čuvanju klijenta:", error);
    alert("Greška pri čuvanju klijenta");
  }
}

function openDayModal(dayText, selectedDate) {
  document.getElementById("modal-day-title").textContent = dayText;
  document.getElementById("clientName").value = "";
  document.getElementById("clientTime").value = "";
  document.getElementById("clientNote").value = "";
  document.getElementById("dayModal").classList.remove("hidden");

  // Postavi fokus na polje za ime
  const clientNameInput = document.getElementById("clientName");
  clientNameInput.focus();

  // Sačuvaj izabrani datum u modalu za kasnije čuvanje
  const modal = document.getElementById("dayModal");
  modal.dataset.selectedDate = selectedDate ? selectedDate.toISOString().split("T")[0] : "";

  if (flatpickrInstance) flatpickrInstance.destroy();
  flatpickrInstance = flatpickr("#clientTime", {
    enableTime: true,
    noCalendar: true,
    dateFormat: "H:i",
    time_24hr: true,
    minuteIncrement: 5,
    defaultHour: 12,
    defaultMinute: 0,
  });
}

document.addEventListener("click", (e) => {
  const popup = document.getElementById("clientPopup");
  if (popup && !popup.contains(e.target) && e.target !== popup) {
    popup.classList.add("hidden");
  }
});

async function deleteClient(popupEl) {
  const clientIndex = parseInt(popupEl.dataset.clientIndex);
  const isoDate = popupEl.dataset.clientDate;
  const clientId = clientData[isoDate][clientIndex].id;

  try {
    const response = await fetch(`/api/clients/${clientId}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Greška pri brisanju klijenta");
    clientData[isoDate].splice(clientIndex, 1);
    if (clientData[isoDate].length === 0) delete clientData[isoDate];
    renderClientsForCurrentWeek();
    if (document.getElementById("clientsList")) {
      renderClientsList();
    }
    closeClientInfoPopup();
  } catch (error) {
    console.error("Greška pri brisanju klijenta:", error);
    alert("Greška pri brisanju klijenta");
  }
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
  ][date.getMonth()]} ${date.getFullYear()}`;

  popup.dataset.clientData = JSON.stringify(client);
  popup.dataset.clientIndex = client.index;
  popup.dataset.clientDate = client.date;

  popup.innerHTML = `
  <div class="md3-dialog__header">
    <p class="md3-dialog__date" id="clientDateDisplay">${formattedDate}</p>
    <span class="close-icon" onclick="closeClientInfoPopup()"><i class="fas fa-times"></i></span>
    <input type="text" id="clientDateInput" name="client_date" value="${client.date}" class="md3-text-field__input hidden" autocomplete="off" tabindex="1" />
    <h3 class="md3-dialog__title" id="clientNameTitle">${client.name || "Nepoznato ime"}</h3>
    <input type="text" id="clientNameInput" name="client_name" value="${client.name || ""}" class="md3-text-field__input hidden" autocomplete="off" tabindex="2" />
  </div>
  <div class="md3-dialog__content">
    <p><strong>Vreme:</strong> <span id="clientTimeDisplay">${client.time || "Nema vremena"}</span></p>
    <input type="text" id="clientTimeInput" name="client_time" value="${client.time || ""}" class="md3-text-field__input hidden" autocomplete="off" tabindex="3" />
    <p><strong>Napomena:</strong> <span id="clientNoteDisplay">${client.note || ""}</span></p>
    <textarea id="clientNoteInput" name="client_note" class="md3-text-field__textarea hidden" tabindex="4">${client.note || ""}</textarea>
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

  // Pozicioniranje pop-up-a
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

  // Event listener za zatvaranje pop-up-a, ali dozvoli selekciju teksta
  const handleOutsideClick = (e) => {
    if (!popup.contains(e.target) && e.target !== popup) {
      const selection = window.getSelection();
      if (selection.toString().length > 0 && popup.contains(selection.anchorNode)) {
        return; // Ne zatvaraj pop-up ako je tekst selektovan
      }
      closeClientInfoPopup();
      document.removeEventListener("click", handleOutsideClick);
    }
  };

  setTimeout(() => {
    document.addEventListener("click", handleOutsideClick);
  }, 0);
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
    // Fokusiraj nameInput za bolji UX
    nameInput.focus();

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
            firstDayOfWeek: 1,
            weekdays: {
              shorthand: ["Ned", "Pon", "Uto", "Sre", "Čet", "Pet", "Sub"],
              longhand: [
                "Nedelja",
                "Ponedeljak",
                "Utorak",
                "Sreda",
                "Četvrtak",
                "Petak",
                "Subota",
              ],
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
  } else {
    console.log("Vratio se u prikazni režim");
    actions.innerHTML = `
      <button class="md3-button md3-button--text" onclick="event.stopPropagation(); markClientCompleted()">${popup.dataset.clientData && JSON.parse(popup.dataset.clientData).completed
        ? "Vrati u zakazano"
        : "Završeno"
      }</button>
      <button class="md3-button md3-button--text" onclick="event.stopPropagation(); toggleEditMode()">Izmeniti</button>
      <button class="md3-button md3-button--text" onclick="event.stopPropagation(); deleteClient(this.parentElement.parentElement)">Obriši</button>
    `;
  }
}

async function markClientCompleted() {
  const popup = document.getElementById("clientInfoPopup");
  if (!popup) return;

  const clientIndex = parseInt(popup.dataset.clientIndex);
  const isoDate = popup.dataset.clientDate;
  const clientId = clientData[isoDate][clientIndex].id;

  try {
    const response = await fetch(`/api/clients/${clientId}/complete`, {
      method: "PATCH",
    });
    if (!response.ok) throw new Error("Greška pri označavanju klijenta");
    const updatedClient = await response.json();

    clientData[isoDate][clientIndex] = updatedClient;
    renderClientsForCurrentWeek();
    if (document.getElementById("clientsList")) {
      renderClientsList();
    }
    closeClientInfoPopup();
  } catch (error) {
    console.error("Greška pri označavanju klijenta:", error);
    alert("Greška pri označavanju klijenta");
  }
}

async function saveEditedClient() {
  const popup = document.getElementById("clientInfoPopup");
  if (!popup) return;

  const newName = document.getElementById("clientNameInput").value.trim();
  const newTime = document.getElementById("clientTimeInput").value.trim();
  const newNote = document.getElementById("clientNoteInput").value.trim();
  const newDate = document.getElementById("clientDateInput").value.trim();

  if (!newName || !newTime || !newDate) {
    alert("Unesite ime, vreme i datum");
    return;
  }

  const clientIndex = parseInt(popup.dataset.clientIndex);
  const oldDate = popup.dataset.clientDate;
  const clientId = clientData[oldDate][clientIndex].id;

  try {
    const response = await fetch(`/api/clients/${clientId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: newDate,
        name: newName,
        time: newTime,
        note: newNote,
        completed: clientData[oldDate][clientIndex].completed,
      }),
    });
    if (!response.ok) throw new Error("Greška pri ažuriranju klijenta");
    const updatedClient = await response.json();
    // Ažuriraj clientData
    clientData[oldDate].splice(clientIndex, 1);
    if (clientData[oldDate].length === 0) delete clientData[oldDate];
    if (!clientData[newDate]) clientData[newDate] = [];
    clientData[newDate].push(updatedClient);

    renderClientsForCurrentWeek();
    if (document.getElementById("clientsList")) {
      renderClientsList();
    }
    closeClientInfoPopup();
  } catch (error) {
    console.error("Greška pri ažuriranju klijenta:", error);
    alert("Greška pri ažuriranju klijenta");
  }
}

/**
 * Prikazuje listu svih klijenata u hronološkom poretku po datumu i vremenu.
 * Sortira klijente po datumu, a zatim po vremenu. Ako nema klijenata za današnji
 * dan, prikazuje poruku. Ako nema klijenata uopšte, ne dodaje dodatnu poruku.
 * Osim toga, pozicionira skrol na sekciju "Danas".
 */
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

  // Dodaj današnji dan u listu datuma ako već nije prisutan
  const allDates = [...new Set(allClients.map((client) => client.isoDate))];
  if (!allDates.includes(todayIso)) {
    allDates.push(todayIso);
  }
  allDates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

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

  // Prikaz svih datuma i klijenata hronološki
  allDates.forEach((isoDate) => {
    const date = new Date(isoDate);
    date.setHours(0, 0, 0, 0);
    const isToday = isoDate === todayIso;
    const formattedDate = isToday
      ? `Danas, ${date.getDate()}. ${monthNames[date.getMonth()]} ${date.getFullYear()}`
      : `${date.getDate()}. ${monthNames[date.getMonth()]} ${date.getFullYear()}`;

    // Dodaj zaglavlje za datum
    const header = document.createElement("h2");
    header.classList.add("month-header");
    if (isToday) {
      header.id = "today-header"; // ID za skrolovanje
      header.classList.add("today-header");
    }
    header.textContent = formattedDate;
    clientsList.appendChild(header);

    // Pronađi klijente za trenutni datum
    const clientsForDate = allClients.filter((client) => client.isoDate === isoDate);

    // Ako nema klijenata za današnji dan, prikaži poruku
    if (isToday && clientsForDate.length === 0) {
      const noClientsDiv = document.createElement("div");
      noClientsDiv.classList.add("client-item", "today-client");
      noClientsDiv.textContent = "Još uvek nema nikog zakazanog";
      clientsList.appendChild(noClientsDiv);
    }

    // Dodaj klijente za trenutni datum
    clientsForDate.forEach((client) => {
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
  });

  // Ako nema klijenata i nema današnjih unosa, prikaži samo današnji dan
  if (allDates.length === 1 && allDates[0] === todayIso && allClients.length === 0) {
    // Već je dodato zaglavlje i poruka za današnji dan iznad
  } else if (allClients.length === 0 && allDates.length === 0) {
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
    clientsList.style.height = clientsList.offsetHeight + "px";
    clientsList.style.height = "auto";
  }, 10);
}