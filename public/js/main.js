// main.js

let currentDate = new Date();
let selectedCellElement = null;
let longPressTimer = null;
let targetClientDiv = null;
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

document.addEventListener('DOMContentLoaded', () => {
  const today = new Date();
  currentDate = today;
  generateMiniCalendar(today.getFullYear(), today.getMonth());

  const todayBtn = document.getElementById('today-btn');
  if (todayBtn) {
    todayBtn.addEventListener('click', () => {
      const today = new Date();
      currentDate = today;
      generateMiniCalendar(today.getFullYear(), today.getMonth());
    });
  }
  document.querySelectorAll(".client-entry").forEach(div => {
    addLongPressToClientDiv(div);
  });
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
    const iso = date.toISOString().split("T")[0];

    if (!clientData[iso]) clientData[iso] = [];
    clientData[iso].push({ name, time, note });

    renderClientsForCurrentWeek(); // ponovo iscrtaj sve
  }

  closeModal();
}



function addLongPressToClientDiv(div) {
  let timer;

  const start = (e) => {
    console.log("Long press započet na", div);
    targetClientDiv = div;
    timer = setTimeout(() => {
      const x = e.touches ? e.touches[0].pageX : e.pageX;
      const y = e.touches ? e.touches[0].pageY : e.pageY;
      console.log("Long press detektovan na", div, "koordinate:", x, y);
      showDeletePopup(x, y);
    }, 600);
  };

  const cancel = () => {
    console.log("Long press otkazan");
    clearTimeout(timer);
  };

  div.addEventListener("mousedown", start);
  div.addEventListener("touchstart", start, { passive: false });

  div.addEventListener("mouseup", cancel);
  div.addEventListener("mouseleave", cancel);
  div.addEventListener("touchend", cancel);
  div.addEventListener("touchcancel", cancel);

  // 🚫 Sprečava browser kontekst meni (desni klik / long press)
  div.addEventListener("contextmenu", (e) => e.preventDefault());
}

function showDeletePopup(x, y) {
  console.log("Pokušavam da prikažem delete popup na", x, y);
  let popup = document.getElementById("clientPopup");
  if (!popup) {
    console.warn("clientPopup ne postoji, kreiram ga");
    popup = document.createElement("div");
    popup.id = "clientPopup";
    popup.className = "client-popup";
    popup.innerHTML = `<button onclick="deleteClient(this.parentElement)">Obriši</button>`;
    document.body.appendChild(popup);
  }
  popup.style.top = `${y}px`;
  popup.style.left = `${x}px`;
  popup.classList.remove("hidden");
  console.log("Popup prikazan:", popup);
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


document.addEventListener("mouseup", () => {
  clearTimeout(longPressTimer);
});

document.addEventListener("mouseleave", () => {
  clearTimeout(longPressTimer);
});

document.addEventListener("click", (e) => {
  const popup = document.getElementById("clientPopup");
  if (popup && !popup.contains(e.target) && e.target !== popup) {
    popup.classList.add("hidden");
  }
});

function showDeletePopup(x, y) {
  let popup = document.getElementById("clientPopup");
  if (!popup) {
    popup = document.createElement("div");
    popup.id = "clientPopup";
    popup.className = "client-popup";
    popup.innerHTML = `<button onclick="deleteClient(this.parentElement)">Obriši</button>`;
    document.body.appendChild(popup);
  }
  popup.style.top = `${y}px`;
  popup.style.left = `${x}px`;
  popup.classList.remove("hidden");
}
function deleteClient(popupEl) {
  if (targetClientDiv && selectedCellElement) {
    const text = targetClientDiv.textContent;
    const [time, name] = text.split(" - ");

    const label = selectedCellElement.querySelector(".date-label");
    const parentH3 = selectedCellElement.querySelector("h3");
    const dayName = parentH3.textContent.split(" ")[0];

    const baseDate = getMonday(currentDate);
    const weekdays = ["Pon", "Uto", "Sre", "Čet", "Pet", "Sub", "Ned"];
    const dayIndex = weekdays.indexOf(dayName);
    const date = new Date(baseDate);
    date.setDate(baseDate.getDate() + dayIndex);
    const iso = date.toISOString().split("T")[0];

    if (clientData[iso]) {
      clientData[iso] = clientData[iso].filter(entry => !(entry.name === name && entry.time === time));
    }

    renderClientsForCurrentWeek(); // osveži prikaz
    popupEl.classList.add("hidden");
    targetClientDiv = null;
  }
}


function renderClientsForCurrentWeek() {
  const baseDate = getMonday(currentDate);
  console.log("currentDate:", currentDate, "baseDate:", baseDate);
  const dayIds = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  console.log("clientData:", clientData);

  dayIds.forEach((id, index) => {
    const dayDate = new Date(baseDate);
    dayDate.setDate(baseDate.getDate() + index);
    const iso = dayDate.toISOString().split("T")[0];
    console.log(`Obrada dana: ${id}, datum: ${iso}`);

    const cell = document.getElementById(`date-${id}`)?.closest(".cell");
    if (!cell) {
      console.error(`Nema ćelije za date-${id}`);
      return;
    }

    const eventContainer = cell.querySelector(".event");
    if (!eventContainer) {
      console.error(`Nema .event kontejnera za date-${id}`);
      return;
    }
    eventContainer.innerHTML = "";

    if (clientData[iso]) {
      console.log(`Podaci za ${iso}:`, clientData[iso]);
      const sortedClients = clientData[iso].sort((a, b) => {
        if (!a.time || !b.time || !a.time.includes(":")) {
          console.error("Neispravan format vremena:", a, b);
          return 0;
        }
        const [h1, m1] = a.time.split(":").map(Number);
        const [h2, m2] = b.time.split(":").map(Number);
        return h1 * 60 + m1 - (h2 * 60 + m2);
      });

      sortedClients.forEach((client, clientIndex) => {
        const div = document.createElement("div");
        div.classList.add("client-entry");
        div.textContent = `${client.time} - ${client.name}`;
        console.log(div, '❗❗❗client is made');

        div.addEventListener("click", (e) => {
          e.stopPropagation();
          console.log('client is clicked ➡️');
          const x = e.pageX;
          const y = e.pageY;
          try {
            showClientInfoPopup({ ...client, date: iso, index: clientIndex }, x, y);
          } catch (error) {
            console.error("Greška u showClientInfoPopup:", error);
          }
        });

        if (client.note) div.title = client.note;

        addLongPressToClientDiv(div);
        eventContainer.appendChild(div);
      });
    } else {
      console.log(`Nema podataka za ${iso}`);
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
  let popup = document.getElementById("clientInfoPopup");

  if (!popup) {
    popup = document.createElement("div");
    popup.id = "clientInfoPopup";
    popup.className = "client-info-popup md3-dialog";
    document.body.appendChild(popup);
  }

  // Prosledi date i index za uređivanje
  popup.dataset.clientData = JSON.stringify(client);
  popup.dataset.clientIndex = client.index;
  popup.dataset.clientDate = client.date;

  popup.innerHTML = `
  <div class="md3-dialog__header">
    <h3 class="md3-dialog__title" id="clientNameTitle" onclick="toggleEditName()">${client.name}</h3>
    <input type="text" id="clientNameInput" value="${client.name}" class="md3-text-field__input hidden" />
  </div>
  <div class="md3-dialog__content">
    <p><strong>Vreme:</strong></p>
    <input type="text" id="clientTimeInput" value="${client.time}" class="md3-text-field__input" />
    
    <p><strong>Napomena:</strong></p>
    <textarea id="clientNoteInput" class="md3-text-field__textarea">${client.note || ""}</textarea>
  </div>
  <div class="md3-dialog__actions">
    <button class="md3-button md3-button--text" onclick="closeClientInfoPopup()">Zatvori</button>
    <button class="md3-button md3-button--filled" onclick="saveEditedClientName()">Sačuvaj</button>
  </div>
`;
  flatpickr("#clientTimeInput", {
    enableTime: true,
    noCalendar: true,
    dateFormat: "H:i",
    time_24hr: true,
    minuteIncrement: 5
  });



  // Postavi poziciju i proveri granice ekrana
  const popupWidth = 280;
  const popupHeight = popup.offsetHeight || 200;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let adjustedX = x;
  let adjustedY = y;
  if (x + popupWidth > viewportWidth) {
    adjustedX = viewportWidth - popupWidth - 8;
  }
  if (y + popupHeight > viewportHeight) {
    adjustedY = viewportHeight - popupHeight - 8;
  }

  popup.style.left = `${adjustedX}px`;
  popup.style.top = `${adjustedY}px`;
  popup.classList.remove("hidden");
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


