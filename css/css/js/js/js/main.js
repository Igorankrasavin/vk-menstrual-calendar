import { addDays, parseDateFromInput } from './utils.js';
import { setupNotesUI } from './notes.js';
import { setupCalendar } from './calendar.js';

const state = {
    selectedDate: null
};

// DOM элементы
const lastPeriodInput = document.getElementById('lastPeriod');
const lastPeriodPrevBtn = document.getElementById('lastPeriodPrevBtn');
const lastPeriodNextBtn = document.getElementById('lastPeriodNextBtn');
const cycleLengthInput = document.getElementById('cycleLength');
const periodLengthInput = document.getElementById('periodLength');

const currentDaySpan = document.getElementById('currentDay');
const nextPeriodSpan = document.getElementById('nextPeriod');
const ovulationDaySpan = document.getElementById('ovulationDay');

const monthNameDiv = document.getElementById('monthName');
const calendarTableBody = document.querySelector('#calendarTable tbody');
const prevMonthBtn = document.getElementById('prevMonthBtn');
const nextMonthBtn = document.getElementById('nextMonthBtn');

const notePanel = document.getElementById('notePanel');
const toggleNotePanelBtn = document.getElementById('toggleNotePanelBtn');
const noteDateLabel = document.getElementById('noteDateLabel');

const dropsRow = document.getElementById('dropsRow');
const noteEndPeriod = document.getElementById('noteEndPeriod');
const noteText = document.getElementById('noteText');
const noteMedicine = document.getElementById('noteMedicine');
const noteOvulationTest = document.getElementById('noteOvulationTest');

const chipsRowSex = document.getElementById('chipsRowSex');
const chipsRowSymptoms = document.getElementById('chipsRowSymptoms');
const chipsRowMood = document.getElementById('chipsRowMood');

const noteWeight = document.getElementById('noteWeight');
const noteTemperature = document.getElementById('noteTemperature');

const noteSaveBtn = document.getElementById('noteSaveBtn');
const noteClearBtn = document.getElementById('noteClearBtn');

const noteTabsRow = document.getElementById('noteTabs');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Заполняем state
Object.assign(state, {
    lastPeriodInput,
    cycleLengthInput,
    periodLengthInput,
    currentDaySpan,
    nextPeriodSpan,
    ovulationDaySpan,
    monthNameDiv,
    calendarTableBody,
    notePanel,
    toggleNotePanelBtn,
    noteDateLabel,
    dropsRow,
    noteEndPeriod,
    noteText,
    noteMedicine,
    noteOvulationTest,
    chipsRowSex,
    chipsRowSymptoms,
    chipsRowMood,
    noteWeight,
    noteTemperature,
    noteSaveBtn,
    noteClearBtn,
    noteTabsRow,
    tabButtons,
    tabContents
});

// Настраиваем календарь и заметки
setupCalendar(state);
setupNotesUI(state);

// Функция перерасчёта (используется в notes.js)
state.recalculate = () => {
    state.calculateCycle();
};

// Стрелки для даты последней менструации
function setDateInput(input, date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    input.value = `${year}-${month}-${day}`;
}

function shiftLastPeriod(daysShift) {
    let currentDate = parseDateFromInput(lastPeriodInput);
    if (!currentDate) {
        currentDate = new Date();
    }
    currentDate = addDays(currentDate, daysShift);
    setDateInput(lastPeriodInput, currentDate);
    state.calculateCycle();
}

lastPeriodPrevBtn.addEventListener('click', () => {
    shiftLastPeriod(-1);
});

lastPeriodNextBtn.addEventListener('click', () => {
    shiftLastPeriod(1);
});

// Навешиваем события на inputs
lastPeriodInput.addEventListener('change', () => state.calculateCycle());
cycleLengthInput.addEventListener('input', () => state.calculateCycle());
periodLengthInput.addEventListener('input', () => state.calculateCycle());

// Переключение месяца
prevMonthBtn.addEventListener('click', () => {
    if (state.currentCalendarMonth === 0) {
        state.currentCalendarMonth = 11;
        state.currentCalendarYear--;
    } else {
        state.currentCalendarMonth--;
    }
    state.calculateCycle();
});

nextMonthBtn.addEventListener('click', () => {
    if (state.currentCalendarMonth === 11) {
        state.currentCalendarMonth = 0;
        state.currentCalendarYear++;
    } else {
        state.currentCalendarMonth++;
    }
    state.calculateCycle();
});

// Первый рендер
state.calculateCycle();
