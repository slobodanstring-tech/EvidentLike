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
    const targetView = view === "clients" ? "new-client-view" : view === "all-clients" ? "clients-view" : `${view}-view`;
    if (v.id === targetView) {
      console.log(`Prikazujem view: ${v.id}`);
      v.classList.remove("hidden");
      v.classList.add("active");
    } else {
      console.log(`Sakrivam view: ${v.id}`);
      v.classList.add("hidden");
      v.classList.remove("active");
    }
  });

  // Ažuriraj navigacionu traku
  navItems.forEach((item) => {
    item.classList.remove("active");
    const icon = item.querySelector("i");
    const span = item.querySelector("span");
    if (icon && span) {
      icon.classList.remove("active");
      span.classList.remove("active");
    }
    if (item.dataset.view === view) {
      console.log(`Aktiviram nav-item: ${item.dataset.view}`);
      item.classList.add("active");
      if (icon && span) {
        icon.classList.add("active");
        span.classList.add("active");
      }
    }
  });

  // Ažuriraj top-bar
  console.log(`Ažuriram top-bar za prikaz: ${view}`);
  if (view === "all-clients") {
    console.log("Sakrivam all-clients-btn i prikazujem clients-top");
    calendarTop.classList.add("hidden");
    clientsTop.classList.remove("hidden");
    allClientsBtn.classList.add("hidden");
    rightTop.classList.add("clients-mode");
    renderClientsList();
  } else {
    console.log("Prikazujem all-clients-btn i sakrivam clients-top");
    calendarTop.classList.remove("hidden");
    clientsTop.classList.add("hidden");
    allClientsBtn.classList.remove("hidden");
    rightTop.classList.remove("clients-mode");
    if (view !== "clients") {
      generateMiniCalendar(currentDate.getFullYear(), currentDate.getMonth());
      updateWeekdayDates(currentDate);
    }
  }

  // Dodaj prikaz klijenata ispod dugmeta za 'clients' view
  if (view === "clients") {
    renderClientsBelowButton();
  }
}


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
        switchView("all-clients");
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

        const isClientsViewActive = document.getElementById("clients-view").classList.contains("active");

        if (isClientsViewActive) {
          console.log("Lista klijenata je aktivna, skrolujem na 'Danas'");
          renderClientsList();
          setTimeout(() => {
            const todayHeader = document.getElementById("today-header");
            if (todayHeader) {
              todayHeader.scrollIntoView({ behavior: "smooth", block: "start" });
            } else {
              console.warn("today-header nije pronađen u clients-view");
            }
          }, 100);
        } else {
          console.log("Prebacujem na prikaz kalendara");
          switchView("calendar");
          generateMiniCalendar(today.getFullYear(), today.getMonth());
          updateWeekdayDates(today);
        }
      });
    } else {
      console.error('today-btn NIJE PRONAĐEN u DOM-u! Proveri index.ejs za id="today-btn".');
    }

    // Postavi event listenere za navigaciju
    document.querySelectorAll(".nav-item").forEach((item) => {
      console.log(`Postavljam event listener za nav-item: ${item.dataset.view}`);
      item.addEventListener("click", () => {
        const view = item.dataset.view;
        console.log("Klik na nav-item, prelazim na prikaz:", view);
        switchView(view);
      });
    });

    // Dodaj event listener za new-client-btn
    const newClientBtn = document.getElementById("new-client-btn");
    if (newClientBtn) {
      console.log("Pronađen new-client-btn, postavljanje event listenera");
      newClientBtn.addEventListener("click", () => {
        console.log("Kliknuto na dugme 'Novi klijent'");
        openNewClientModal();
      });
    } else {
      console.error("new-client-btn NIJE PRONAĐEN u DOM-u! Proveri index.ejs za id='new-client-btn'.");
    }

    // Dodaj delegaciju događaja za klik na naslov dana
    const grid = document.querySelector(".grid");
    if (grid) {
      grid.addEventListener("click", (e) => {
        const title = e.target.closest("h3");
        if (title) {
          console.log("Klik na naslov dana:", title.textContent.trim());
          const cell = title.closest(".cell");
          if (cell) {
            selectedCellElement = cell;
            const dayText = title.textContent.trim();
            openDayModal(dayText);
          } else {
            console.error("Greška: .cell nije pronađen za naslov", title);
          }
        }
      });
    } else {
      console.error("Greška: .grid element nije pronađen!");
    }

  } catch (error) {
    console.error("Greška pri inicijalizaciji:", error);
  }
  const clientSearchInput = document.getElementById("client-search");
  if (clientSearchInput) {
    console.log("Pronađen client-search input, postavljanje event listenera");
    clientSearchInput.addEventListener("input", (e) => {
      const searchTerm = e.target.value;
      console.log("Pretraga klijenata, termin:", searchTerm);
      renderClientsBelowButton(searchTerm);
    });
  } else {
    console.warn("client-search input nije pronađen u DOM-u! Pretraga neće biti dostupna.");
  }
});

// Ažuriraj renderClientsForCurrentWeek da koristi delegaciju događaja za .client-entry
// renderClientsForCurrentWeek
function renderClientsForCurrentWeek() {
  console.log("Pokrećem renderClientsForCurrentWeek, currentDate:", currentDate.toISOString());
  const baseDate = getMonday(currentDate);
  const dayIds = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

  dayIds.forEach((id, index) => {
    const dayDate = new Date(baseDate);
    dayDate.setDate(baseDate.getDate() + index);
    dayDate.setHours(0, 0, 0, 0);
    const iso = `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, "0")}-${String(dayDate.getDate()).padStart(2, "0")}`;
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
        div.dataset.clientData = JSON.stringify({ ...client, date: iso, index: clientIndex });
        if (client.completed) div.classList.add("completed");
        div.textContent = `${client.time} - ${client.name}`;
        if (client.note) div.title = client.note;
        eventContainer.appendChild(div);
      });
    }
  });

  // Dodaj delegaciju za .client-entry
  const grid = document.querySelector(".grid");
  if (grid) {
    grid.removeEventListener("click", handleClientClick); // Ukloni stari listener
    grid.addEventListener("click", handleClientClick);
  } else {
    console.error("Greška: .grid element nije pronađen!");
  }
}

function handleClientClick(e) {
  const clientEntry = e.target.closest(".client-entry");
  if (clientEntry) {
    console.log("Klik na klijenta:", clientEntry.textContent);
    e.stopPropagation();
    const clientData = JSON.parse(clientEntry.dataset.clientData);
    const x = e.pageX;
    const y = e.pageY;
    try {
      showClientInfoPopup(clientData, x, y);
    } catch (error) {
      console.error("Greška u showClientInfoPopup:", error);
      alert("Greška pri otvaranju pop-up-a!");
    }
  }
}


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
    console.error("Greška: calendar-days element nije pronađen! Proveri index.ejs za id='calendar-days'.");
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
    if (d === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
      day.classList.add("today");
    }

    daysContainer.appendChild(day);
  }

  // Next month's trailing days
  const totalCells = daysContainer.children.length;
  const remaining = 42 - totalCells; // 6 redova po 7 dana
  for (let i = 1; i <= remaining; i++) {
    const date = new Date(year, month + 1, i);
    const nextDay = document.createElement("div");
    nextDay.classList.add("calendar-day", "next-month");
    nextDay.textContent = date.getDate();
    nextDay.dataset.fullDate = date.toISOString().split("T")[0];
    daysContainer.appendChild(nextDay);
  }

  // Ažuriraj naziv meseca
  const monthName = document.querySelector("span#month-name");
  if (monthName) {
    const monthNames = [
      "Januar", "Februar", "Mart", "April", "Maj", "Jun",
      "Jul", "Avgust", "Septembar", "Oktobar", "Novembar", "Decembar",
    ];
    monthName.textContent = monthNames[month];
  } else {
    console.warn("month-name element nije pronađen u DOM-u!");
  }

  // Dodaj event listenere za sve dane
  const allDays = daysContainer.querySelectorAll(".calendar-day");
  allDays.forEach((day) => {
    day.addEventListener("click", () => {
      const clickedDate = new Date(day.dataset.fullDate);
      clickedDate.setHours(0, 0, 0, 0);
      currentDate = clickedDate;
      console.log("Klik na dan u mini kalendaru, currentDate:", currentDate.toISOString());
      updateWeekdayDates(clickedDate);
      highlightWeekInCalendar(clickedDate);
    });
  });

  // Ažuriraj nedelju i dane
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
      console.log(`Označavam dan u mini kalendaru: ${iso}`);
    } else {
      console.warn(`Ćelija za datum ${iso} nije pronađena u mini kalendaru`);
    }
  }
  console.log("Označeni dani:", Array.from(document.querySelectorAll(".calendar-day.week-selected")).map(el => el.dataset.fullDate));
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
  console.log("Pokrećem closeModal");
  const modal = document.getElementById("dayModal");
  if (modal) {
    console.log("Dodajem 'hidden' i uklanjam 'active' na #dayModal");
    modal.classList.add("hidden");
    modal.classList.remove("active");
    if (flatpickrInstance) {
      console.log("Uništavam flatpickrInstance");
      flatpickrInstance.destroy();
      flatpickrInstance = null;
    }
  } else {
    console.error("Greška: #dayModal nije pronađen u DOM-u!");
  }
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
  console.log("Pokrećem openDayModal, dayText:", dayText, "selectedDate:", selectedDate);
  const modal = document.getElementById("dayModal");
  if (!modal) {
    console.error("Greška: #dayModal nije pronađen u DOM-u!");
    alert("Greška: Modal za zakazivanje nije dostupan.");
    return;
  }

  const titleElement = document.getElementById("modal-day-title");
  const clientNameInput = document.getElementById("clientName");
  const clientTimeInput = document.getElementById("clientTime");
  const clientNoteInput = document.getElementById("clientNote");

  if (!titleElement || !clientNameInput || !clientTimeInput || !clientNoteInput) {
    console.error("Greška: Nedostaju elementi u #dayModal", {
      titleElement: !!titleElement,
      clientNameInput: !!clientNameInput,
      clientTimeInput: !!clientTimeInput,
      clientNoteInput: !!clientNoteInput,
    });
    alert("Greška: Nepotpuni elementi u modalu.");
    return;
  }

  // Postavi naslov i očisti input polja
  titleElement.textContent = dayText;
  clientNameInput.value = "";
  clientTimeInput.value = "";
  clientNoteInput.value = "";

  // Ukloni hidden klasu i dodaj active
  console.log("Uklanjam 'hidden' i dodajem 'active' na #dayModal");
  modal.classList.remove("hidden");
  modal.classList.add("active");

  // Postavi fokus na polje za ime
  console.log("Fokusiram na clientName input");
  clientNameInput.focus();

  // Sačuvaj izabrani datum u modalu
  modal.dataset.selectedDate = selectedDate ? selectedDate.toISOString().split("T")[0] : "";
  console.log("Postavljen dataset.selectedDate:", modal.dataset.selectedDate);

  // Inicijalizuj Flatpickr
  if (flatpickrInstance) {
    console.log("Uništavam postojeći flatpickrInstance");
    flatpickrInstance.destroy();
  }
  try {
    console.log("Inicijalizujem novi Flatpickr za #clientTime");
    flatpickrInstance = flatpickr("#clientTime", {
      enableTime: true,
      noCalendar: true,
      dateFormat: "H:i",
      time_24hr: true,
      minuteIncrement: 5,
      defaultHour: 12,
      defaultMinute: 0,
    });
  } catch (error) {
    console.error("Greška pri inicijalizaciji Flatpickr-a:", error);
  }
}

document.addEventListener("click", (e) => {
  const popup = document.getElementById("clientPopup");
  if (popup && !popup.contains(e.target) && e.target !== popup) {
    popup.classList.add("hidden");
  }
});

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
  if (popup) {
    console.log("Zatvaram clientInfoPopup");
    popup.classList.add("hidden");
    popup.classList.remove("active");
    // Očisti sadržaj da izbegnemo memorijske curenja
    popup.innerHTML = "";
    // Ukloni event listenere ako su postavljeni dinamički
    const clonedPopup = popup.cloneNode(false);
    popup.parentNode.replaceChild(clonedPopup, popup);
  } else {
    console.warn("clientInfoPopup nije pronađen!");
  }
}

function showClientInfoPopup(client, x, y) {
  console.log("Pokrećem showClientInfoPopup, podaci o klijentu:", client);
  let popup = document.getElementById("clientInfoPopup");

  // Ukloni stari pop-up ako postoji
  if (popup) {
    console.log("Uklanjam stari #clientInfoPopup");
    popup.remove();
  }

  // Kreiraj novi pop-up
  popup = document.createElement("div");
  popup.id = "clientInfoPopup";
  popup.classList.add("client-info-popup", "md3-dialog");
  document.body.appendChild(popup);

  // Proveri podatke o klijentu
  if (!client || !client.name || !client.time || !client.date) {
    console.error("Nepotpuni podaci o klijentu:", client);
    alert("Greška: Nepotpuni podaci o klijentu.");
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

  // Postavi dataset atribut
  popup.dataset.clientData = JSON.stringify(client);
  popup.dataset.clientIndex = client.index;
  popup.dataset.clientDate = client.date;

  // Postavi HTML sa tri dugmeta
  popup.innerHTML = `
    <div class="md3-dialog__header">
      <p class="md3-dialog__date" id="clientDateDisplay">${formattedDate}</p>
      <span class="close-icon"><i class="fas fa-times"></i></span>
      <input type="text" id="clientDateInput" name="client_date" value="${client.date}" class="md3-text-field__input hidden" autocomplete="off" tabindex="1" />
      <h3 class="md3-dialog__title" id="clientNameTitle">${client.name || "Nepoznato ime"}</h3>
      <input type="text" id="clientNameInput" name="client_name" value="${client.name || ""}" class="md3-text-field__input hidden" autocomplete="off" tabindex="2" />
    </div>
    <div class="md3-dialog__content">
      <p><strong>Vreme:</strong> <span id="clientTimeDisplay">${client.time || "Nema vremena"}</span></p>
      <input type="text" id="clientTimeInput" name="client_time" value="${client.time || ""}" class="md3-text-field__input hidden" autocomplete="off" tabindex="3" />
      <p><strong>Napomena:</strong> <span id="clientNoteDisplay">${client.note || ""}</span></p>
      <textarea id="clientNoteInput" name="client_note" class="md3-text-field__textarea hidden" autocomplete="off" tabindex="4">${client.note || ""}</textarea>
    </div>
    <div class="md3-dialog__actions">
      <button class="md3-button md3-button--text completed-btn">
        ${client.completed ? "Vrati u zakazano" : "Završeno"}
      </button>
      <button class="md3-button md3-button--text edit-btn">Izmeniti</button>
      <button class="md3-button md3-button--text delete-btn">Obriši</button>
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
  popup.classList.add("active");
  console.log("Popup postavljen na poziciju:", { left: adjustedX, top: adjustedY });

  // Dodaj event listenere
  popup.addEventListener("click", (e) => {
    const target = e.target.closest(".close-icon, .completed-btn, .edit-btn, .delete-btn");
    if (!target) return;
    e.stopPropagation();

    if (target.classList.contains("close-icon")) {
      console.log("Klik na close-icon");
      closeClientInfoPopup();
    } else if (target.classList.contains("completed-btn")) {
      console.log("Klik na Završeno/Vrati u zakazano");
      markClientCompleted();
    } else if (target.classList.contains("edit-btn")) {
      console.log("Klik na Izmeniti");
      toggleEditMode();
    } else if (target.classList.contains("delete-btn")) {
      console.log("Klik na Obriši");
      deleteClient(popup);
    }
  });

  // Zatvaranje klikom van pop-up-a
  const handleOutsideClick = (e) => {
    if (!popup.contains(e.target) && e.target !== popup) {
      const selection = window.getSelection();
      if (selection.toString().length > 0 && popup.contains(selection.anchorNode)) {
        return;
      }
      console.log("Zatvaram popup zbog klika van njega");
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

  const isEditing = !nameInput.classList.contains("hidden");
  console.log("Trenutno stanje - edit mod:", isEditing);

  nameTitle.classList.toggle("hidden");
  nameInput.classList.toggle("hidden");
  timeDisplay.classList.toggle("hidden");
  timeInput.classList.toggle("hidden");
  noteDisplay.classList.toggle("hidden");
  noteInput.classList.toggle("hidden");
  dateDisplay.classList.toggle("hidden");
  dateInput.classList.toggle("hidden");

  if (!isEditing) {
    console.log("Ušao u režim uređivanja");
    nameInput.focus();
    actions.innerHTML = `
      <button class="md3-button md3-button--text cancel-btn">Otkaži</button>
      <button class="md3-button md3-button--filled save-btn">Sačuvaj</button>
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
          locale: { firstDayOfWeek: 1 /* ... ostatak lokalizacije */ },
        });
        popup.dataset.flatpickrInitialized = "true";
      } catch (error) {
        console.error("Greška pri inicijalizaciji Flatpickr-a:", error);
      }
    }

    // Dodaj listenere za cancel i save
    const cancelBtn = actions.querySelector(".cancel-btn");
    const saveBtn = actions.querySelector(".save-btn");
    cancelBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      console.log("Klik na Otkaži");
      closeClientInfoPopup();
    });
    saveBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      console.log("Klik na Sačuvaj");
      saveEditedClient();
    });
  } else {
    console.log("Vratio se u prikazni režim");
    actions.innerHTML = `
      <button class="md3-button md3-button--text completed-btn">${JSON.parse(popup.dataset.clientData).completed ? "Vrati u zakazano" : "Završeno"}</button>
      <button class="md3-button md3-button--text edit-btn">Izmeniti</button>
      <button class="md3-button md3-button--text delete-btn">Obriši</button>
    `;
  }
}


async function markClientCompleted() {
  const popup = document.getElementById("clientInfoPopup");
  if (!popup) {
    console.error("clientInfoPopup nije pronađen!");
    alert("Greška: Pop-up nije pronađen!");
    return;
  }

  const clientIndex = parseInt(popup.dataset.clientIndex);
  const isoDate = popup.dataset.clientDate;
  if (!clientData[isoDate] || !clientData[isoDate][clientIndex]) {
    console.error("Klijent nije pronađen u clientData:", { isoDate, clientIndex });
    alert("Greška: Klijent nije pronađen!");
    closeClientInfoPopup();
    return;
  }

  const client = clientData[isoDate][clientIndex];
  const clientId = client._id || client.id; // Prilagođeno za različite formate ID-a
  if (!clientId) {
    console.error("clientId nije definisan za klijenta:", client);
    alert("Greška: ID klijenta nije definisan!");
    closeClientInfoPopup();
    return;
  }

  try {
    console.log("Šaljem PATCH zahtev za označavanje klijenta:", { clientId });
    const response = await fetch(`/api/clients/${clientId}/complete`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !client.completed }),
    });
    const responseText = await response.text();
    console.log("Odgovor servera:", { status: response.status, text: responseText });

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { message: responseText };
      }
      throw new Error(errorData.message || `Greška pri označavanju klijenta, status: ${response.status}`);
    }

    const updatedClient = JSON.parse(responseText);
    clientData[isoDate][clientIndex] = updatedClient;
    renderClientsForCurrentWeek();
    if (document.getElementById("clientsList")) {
      renderClientsList();
    }
    closeClientInfoPopup();
  } catch (error) {
    console.error("Greška pri označavanju klijenta:", error.message);
    alert(`Greška pri označavanju klijenta: ${error.message}`);
  }
}

async function deleteClient(popupEl) {
  const popup = popupEl || document.getElementById("clientInfoPopup");
  if (!popup) {
    console.error("clientInfoPopup nije pronađen!");
    alert("Greška: Pop-up nije pronađen!");
    return;
  }

  const clientIndex = parseInt(popup.dataset.clientIndex);
  const isoDate = popup.dataset.clientDate;
  if (!clientData[isoDate] || !clientData[isoDate][clientIndex]) {
    console.error("Klijent nije pronađen u clientData:", { isoDate, clientIndex });
    alert("Greška: Klijent nije pronađen!");
    closeClientInfoPopup();
    return;
  }

  const client = clientData[isoDate][clientIndex];
  const clientId = client._id || client.id;
  if (!clientId) {
    console.error("clientId nije definisan za klijenta:", client);
    alert("Greška: ID klijenta nije definisan!");
    closeClientInfoPopup();
    return;
  }

  try {
    console.log("Šaljem DELETE zahtev za klijenta:", { clientId });
    const response = await fetch(`/api/clients/${clientId}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
    const responseText = await response.text();
    console.log("Odgovor servera:", { status: response.status, text: responseText });

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { message: responseText };
      }
      throw new Error(errorData.message || `Greška pri brisanju klijenta, status: ${response.status}`);
    }

    clientData[isoDate].splice(clientIndex, 1);
    if (clientData[isoDate].length === 0) delete clientData[isoDate];
    renderClientsForCurrentWeek();
    if (document.getElementById("clientsList")) {
      renderClientsList();
    }
    closeClientInfoPopup();
  } catch (error) {
    console.error("Greška pri brisanju klijenta:", error.message);
    alert(`Greška pri brisanju klijenta: ${error.message}`);
  }
}

async function saveEditedClient() {
  const popup = document.getElementById("clientInfoPopup");
  if (!popup) {
    console.error("clientInfoPopup nije pronađen!");
    return;
  }

  const newName = document.getElementById("clientNameInput").value.trim();
  const newTime = document.getElementById("clientTimeInput").value.trim();
  const newNote = document.getElementById("clientNoteInput").value.trim();
  const newDate = document.getElementById("clientDateInput").value.trim();

  if (!newName || !newTime || !newDate) {
    console.warn("Unesite ime, vreme i datum!");
    alert("Unesite ime, vreme i datum");
    return;
  }

  const clientIndex = parseInt(popup.dataset.clientIndex);
  const oldDate = popup.dataset.clientDate;
  const clientId = clientData[oldDate][clientIndex].id;

  try {
    console.log("Šaljem PUT zahtev za ažuriranje klijenta:", { clientId, newName, newTime, newDate, newNote });
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
    const responseText = await response.text();
    console.log("Odgovor servera:", { status: response.status, text: responseText });

    if (!response.ok) {
      throw new Error(`Greška pri ažuriranju klijenta, status: ${response.status}`);
    }

    const updatedClient = JSON.parse(responseText);
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
    console.error("Greška pri ažuriranju klijenta:", error.message);
    alert(`Greška pri ažuriranju klijenta: ${error.message}`);
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

function openNewClientModal() {
  console.log("Pokrećem openNewClientModal");
  const modal = document.getElementById("newClientModal");
  if (modal) {
    console.log("newClientModal pronađen, uklanjam 'hidden' i dodajem 'active'");
    modal.classList.remove("hidden");
    modal.classList.add("active");
    const nameInput = document.getElementById("newClientName");
    if (nameInput) {
      console.log("Fokusiram na newClientName input");
      nameInput.focus();
    } else {
      console.error("newClientName input nije pronađen!");
    }
  } else {
    console.error("newClientModal nije pronađen u DOM-u!");
  }
}

function closeNewClientModal() {
  console.log("Pokrećem closeNewClientModal");
  const modal = document.getElementById("newClientModal");
  if (modal) {
    console.log("newClientModal pronađen, dodajem 'hidden' i uklanjam 'active'");
    modal.classList.add("hidden");
    modal.classList.remove("active");
    const nameInput = document.getElementById("newClientName");
    const phoneInput = document.getElementById("newClientPhone");
    const emailInput = document.getElementById("newClientEmail");
    if (nameInput) nameInput.value = "";
    if (phoneInput) phoneInput.value = "";
    if (emailInput) emailInput.value = "";
  } else {
    console.error("newClientModal nije pronađen!");
  }
}

async function saveNewClient() {
  console.log("Pokrećem saveNewClient");
  const name = document.getElementById("newClientName").value.trim();
  const phone = document.getElementById("newClientPhone").value.trim();
  const email = document.getElementById("newClientEmail").value.trim();

  if (!name) {
    console.warn("Ime i prezime su obavezni!");
    alert("Ime i prezime su obavezni!");
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailRegex.test(email)) {
    console.warn("Nevažeća e-mail adresa:", email);
    alert("Unesite važeću e-mail adresu!");
    return;
  }

  const phoneRegex = /^\+?[\d\s-]{9,}$/;
  if (phone && !phoneRegex.test(phone)) {
    console.warn("Nevažeći broj telefona:", phone);
    alert("Unesite važeći broj telefona!");
    return;
  }

  const newClient = {
    name,
    phone,
    email,
    date: new Date().toISOString().split("T")[0], // Danas kao podrazumevani datum
    time: "00:00", // Privremeno vreme
    note: "",
    completed: false,
  };

  try {
    const response = await fetch("/api/clients/new", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newClient),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Greška pri dodavanju klijenta");
    }
    const savedClient = await response.json();
    console.log("Klijent sačuvan na serveru:", savedClient);

    // Ažuriraj clientData
    const isoDate = savedClient.date;
    if (!clientData[isoDate]) clientData[isoDate] = [];
    clientData[isoDate].push(savedClient);
    console.log("clientData ažuriran:", clientData);

    // Zatvori modal
    closeNewClientModal();
    alert("Klijent uspešno sačuvan!");

    // Osveži prikaze
    renderClientsForCurrentWeek();
    if (document.getElementById("clients-view").classList.contains("active")) {
      renderClientsList();
    }
    // DODATO: Osveži listu klijenata u new-client-view ako je aktivan
    if (document.getElementById("new-client-view").classList.contains("active")) {
      const searchTerm = document.getElementById("client-search")?.value || '';
      renderClientsBelowButton(searchTerm);
    }
  } catch (error) {
    console.error("Greška pri čuvanju klijenta:", error.message);
    alert(`Greška pri čuvanju klijenta: ${error.message}`);
  }
}

// Dohvatanje jedinstvenih klijenata
async function fetchUniqueClients() {
  try {
    const response = await fetch('/api/clients/unique');
    if (!response.ok) throw new Error('Neuspešan zahtev');
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('Error fetching unique clients:', err);
    return [];
  }
}

// Ažuriranje renderClientsBelowButton za tri kolone
async function renderClientsBelowButton(searchTerm = '') {
  console.log("Pokrećem renderClientsBelowButton sa searchTerm:", searchTerm);
  const clientsBelowBtn = document.getElementById('clients-below-btn');
  if (!clientsBelowBtn) {
    console.error('Div #clients-below-btn nije pronađen.');
    return;
  }

  clientsBelowBtn.innerHTML = '<p class="loading">Učitavanje...</p>';

  const uniqueClients = await fetchUniqueClients();
  clientsBelowBtn.innerHTML = '';

  if (!uniqueClients || uniqueClients.length === 0) {
    clientsBelowBtn.innerHTML = '<p>Nema klijenata u bazi.</p>';
    return;
  }

  const maxNameLength = 20;
  const maxPhoneLength = 15;

  // Filtriranje i sortiranje po relevantnosti
  let filteredClients = uniqueClients;
  if (searchTerm) {
    const lowerSearchTerm = searchTerm.toLowerCase();
    filteredClients = uniqueClients
      .map(client => {
        const nameMatch = client.name.toLowerCase();
        const phoneMatch = (client.phone || '').toLowerCase();
        // Računamo "score" za relevantnost
        let score = 0;
        if (nameMatch.startsWith(lowerSearchTerm)) score += 10; // Prioritet za početak imena
        else if (nameMatch.includes(lowerSearchTerm)) score += 5; // Podudaranje u imenu
        if (phoneMatch.startsWith(lowerSearchTerm)) score += 8; // Prioritet za početak telefona
        else if (phoneMatch.includes(lowerSearchTerm)) score += 3; // Podudaranje u telefonu
        return { client, score };
      })
      .filter(item => item.score > 0) // Zadrži samo podudaranja
      .sort((a, b) => {
        // Sortiraj po score-u (opadajuće), zatim po imenu (A-Z)
        if (b.score !== a.score) return b.score - a.score;
        return a.client.name.localeCompare(b.client.name, 'sr', { sensitivity: 'base' });
      })
      .map(item => item.client); // Vrati samo klijente
  } else {
    // Ako nema pretrage, sortiraj po imenu
    filteredClients.sort((a, b) => a.name.localeCompare(b.name, 'sr', { sensitivity: 'base' }));
  }

  if (filteredClients.length === 0) {
    clientsBelowBtn.innerHTML = '<p>Nema rezultata za pretragu.</p>';
    return;
  }

  filteredClients.forEach(client => {
    const clientDiv = document.createElement('div');
    clientDiv.classList.add('client-item');

    const displayName = client.name.length > maxNameLength
      ? client.name.substring(0, maxNameLength) + '...'
      : client.name;

    const displayPhone = client.phone && client.phone !== 'Nema broja' && client.phone.length > maxPhoneLength
      ? client.phone.substring(0, maxPhoneLength) + '...'
      : client.phone || 'Nema broja';

    const createdAt = client.createdAt ? new Date(client.createdAt) : null;
    const displayDate = createdAt
      ? createdAt.toLocaleDateString('sr-RS', { day: '2-digit', month: '2-digit', year: 'numeric' })
      : 'Nepoznato';

    clientDiv.innerHTML = `
      <span class="client-name" title="${client.name}">${displayName}</span>
      <span class="client-phone" title="${client.phone || 'Nema broja'}">${displayPhone}</span>
      <span class="client-created" title="${displayDate}">${displayDate}</span>
    `;
    clientDiv.addEventListener('click', () => {
      alert(`Klijent: ${client.name}, Telefon: ${client.phone || 'Nema broja'}, Kreiran: ${displayDate}`);
    });
    clientsBelowBtn.appendChild(clientDiv);
  });
}