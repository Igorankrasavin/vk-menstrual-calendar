import {
    parseDateFromInput,
    formatDate,
    formatKeyDate,
    addDays,
    sameDay,
    isBetween
} from './utils.js';
import { loadNotes, getNoteForDate } from './notes.js';

export function setupCalendar(state) {
    const {
        lastPeriodInput,
        cycleLengthInput,
        periodLengthInput,
        currentDaySpan,
        nextPeriodSpan,
        ovulationDaySpan,
        monthNameDiv,
        calendarTableBody
    } = state;

    const monthNames = [
        'Январь','Февраль','Март','Апрель','Май','Июнь',
        'Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'
    ];

    state.currentCalendarYear = undefined;
    state.currentCalendarMonth = undefined;

    state.calculateCycle = () => {
        const lastPeriodDate = parseDateFromInput(lastPeriodInput);
        const cycleLength = parseInt(cycleLengthInput.value, 10);
        const periodLength = parseInt(periodLengthInput.value, 10);

        if (!lastPeriodDate || !cycleLength || cycleLength <= 0) {
            currentDaySpan.textContent = '—';
            nextPeriodSpan.textContent = '—';
            ovulationDaySpan.textContent = '—';
            renderCalendar(null, null, null, null);
            return;
        }

        const today = new Date();
        const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const lastMidnight = new Date(lastPeriodDate.getFullYear(), lastPeriodDate.getMonth(), lastPeriodDate.getDate());
        const diffMs = todayMidnight.getTime() - lastMidnight.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        let currentDayCycle = (diffDays % cycleLength) + 1;
        if (diffDays < 0) {
            currentDayCycle = 1;
        }

        currentDaySpan.textContent = diffDays >= 0 ? currentDayCycle : 'ещё не начался';

        let periodsAhead = 0;
        if (diffDays >= 0) {
            periodsAhead = Math.floor(diffDays / cycleLength) + 1;
        }
        const nextPeriodDate = addDays(lastPeriodDate, periodsAhead * cycleLength);
        nextPeriodSpan.textContent = formatDate(nextPeriodDate);

        const ovulationOffset = Math.floor(cycleLength / 2);
        const ovulationDate = addDays(lastPeriodDate, ovulationOffset);
        ovulationDaySpan.textContent = formatDate(ovulationDate);

        renderCalendar(lastPeriodDate, cycleLength, periodLength, ovulationDate);
    };

    function getFertileWindow(ovulationDate) {
        if (!ovulationDate) return null;
        const start = addDays(ovulationDate, -3);
        const end = addDays(ovulationDate, 2);
        return { start, end };
    }

    function renderCalendar(lastPeriodDate, cycleLength, periodLength, ovulationDate) {
        const today = new Date();

        if (state.currentCalendarYear === undefined || state.currentCalendarMonth === undefined) {
            state.currentCalendarYear = today.getFullYear();
            state.currentCalendarMonth = today.getMonth();
        }

        const firstDayOfMonth = new Date(state.currentCalendarYear, state.currentCalendarMonth, 1);
        const firstDayWeek = (firstDayOfMonth.getDay() + 6) % 7;
        const daysInMonth = new Date(state.currentCalendarYear, state.currentCalendarMonth + 1, 0).getDate();

        monthNameDiv.textContent = `${monthNames[state.currentCalendarMonth]} ${state.currentCalendarYear}`;

        calendarTableBody.innerHTML = '';

        let dateNumber = 1;
        const fertileWindow = ovulationDate ? getFertileWindow(ovulationDate) : null;
        const notes = loadNotes();

        for (let week = 0; week < 6; week++) {
            const row = document.createElement('tr');

            for (let weekday = 0; weekday < 7; weekday++) {
                const cell = document.createElement('td');

                if (week === 0 && weekday < firstDayWeek) {
                    cell.innerHTML = '';
                } else if (dateNumber > daysInMonth) {
                    cell.innerHTML = '';
                } else {
                    const cellDate = new Date(state.currentCalendarYear, state.currentCalendarMonth, dateNumber);
                    const span = document.createElement('span');
                    span.className = 'day-number';
                    span.textContent = dateNumber;

                    if (sameDay(cellDate, today)) {
                        cell.classList.add('today');
                    }

                    if (lastPeriodDate && cycleLength && periodLength && cycleLength > 0) {
                        for (let n = -1; n <= 3; n++) {
                            const periodStart = addDays(lastPeriodDate, n * cycleLength);
                            const periodEnd = addDays(periodStart, periodLength - 1);

                            if (isBetween(cellDate, periodStart, periodEnd)) {
                                cell.classList.add('menstruation');
                                break;
                            }
                        }
                    }

                    if (ovulationDate && sameDay(cellDate, ovulationDate)) {
                        cell.classList.add('ovulation');
                    }

                    if (fertileWindow && isBetween(cellDate, fertileWindow.start, fertileWindow.end)) {
                        cell.classList.add('fertile');
                    }

                    const dateKey = formatKeyDate(cellDate);
                    const note = getNoteForDate(dateKey, notes);
                    if (note) {
                        cell.classList.add('has-note');

                        const iconsSpan = document.createElement('span');
                        iconsSpan.style.position = 'absolute';
                        iconsSpan.style.top = '4px';
                        iconsSpan.style.right = '4px';
                        iconsSpan.style.fontSize = '11px';

                        let iconsText = '';
                        if (note.medicine && note.medicine.trim() !== '') {
                            iconsText += '💊';
                        }
                        if (note.mood) {
                            iconsText += '🙂';
                        }
                        if (Array.isArray(note.symptoms) && note.symptoms.length > 0) {
                            iconsText += '⚡';
                        }

                        if (iconsText !== '') {
                            iconsSpan.textContent = iconsText;
                            cell.appendChild(iconsSpan);
                        }
                    }

                    cell.addEventListener('click', () => {
                        state.selectedDate = new Date(cellDate.getFullYear(), cellDate.getMonth(), cellDate.getDate());
                        if (state.updateNoteDateLabel) {
                            state.updateNoteDateLabel();
                        }
                        const noteForDay = note ? note : null;
                        if (state.fillNoteFormFromData) {
                            state.fillNoteFormFromData(noteForDay);
                        }
                    });

                    cell.appendChild(span);
                    dateNumber++;
                }

                row.appendChild(cell);
            }

            calendarTableBody.appendChild(row);

            if (dateNumber > daysInMonth) {
                break;
            }
        }
    }

    state.renderCalendar = renderCalendar;
}
