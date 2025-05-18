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

function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay();
  const adjusted = (day + 6) % 7;
  const diff = date.getDate() - adjusted;
  return new Date(date.getFullYear(), date.getMonth(), diff);
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
    e.preventDefault();
    targetClientDiv = div;

    timer = setTimeout(() => {
      const x = e.touches ? e.touches[0].pageX : e.pageX;
      const y = e.touches ? e.touches[0].pageY : e.pageY;
      showDeletePopup(x, y);
    }, 600); // 600ms long press
  };

  const cancel = () => {
    clearTimeout(timer);
  };

  div.addEventListener("mousedown", start);
  div.addEventListener("touchstart", start, { passive: false });

  div.addEventListener("mouseup", cancel);
  div.addEventListener("mouseleave", cancel);
  div.addEventListener("touchend", cancel);
  div.addEventListener("touchcancel", cancel);
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
    time_24hr: true
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
  const popup = document.getElementById("clientPopup");
  if (popup) {
    popup.style.top = `${y}px`;
    popup.style.left = `${x}px`;
    popup.classList.remove("hidden");
  }
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
  const dayIds = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

  dayIds.forEach((id, index) => {
    const dayDate = new Date(baseDate);
    dayDate.setDate(baseDate.getDate() + index);
    const iso = dayDate.toISOString().split("T")[0];

    const cell = document.getElementById(`date-${id}`)?.closest(".cell");
    if (cell) {
      const eventContainer = cell.querySelector(".event");
      eventContainer.innerHTML = "";

      if (clientData[iso]) {
        const sortedClients = clientData[iso].sort((a, b) => {
          const [h1, m1] = a.time.split(":").map(Number);
          const [h2, m2] = b.time.split(":").map(Number);
          return h1 * 60 + m1 - (h2 * 60 + m2);
        });

        sortedClients.forEach(client => {
          const div = document.createElement("div");
          div.classList.add("client-entry");
          div.textContent = `${client.time} - ${client.name}`;
          if (client.note) div.title = client.note;
          addLongPressToClientDiv(div);
          eventContainer.appendChild(div);
        });
      }
    }
  });
}
