import { formatDate, formatKeyDate } from './utils.js';

const STORAGE_KEY = 'vkMenstrualNotes';

export function loadNotes() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        if (typeof parsed !== 'object' || parsed === null) return {};
        return parsed;
    } catch (e) {
        console.error('Ошибка чтения заметок', e);
        return {};
    }
}

export function saveNotes(notes) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch (e) {
        console.error('Не удалось сохранить заметки', e);
    }
}

export function getNoteForDate(dateKey, notes) {
    return notes[dateKey] || null;
}

export function setupNotesUI(state) {
    const {
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
    } = state;

    // Показ/скрытие панели
    toggleNotePanelBtn.addEventListener('click', () => {
        if (!state.selectedDate) {
            alert('Сначала выберите день в календаре.');
            return;
        }

        if (notePanel.style.display === 'none' || notePanel.style.display === '') {
            notePanel.style.display = 'block';
            toggleNotePanelBtn.textContent = 'Скрыть заметки';
        } else {
            notePanel.style.display = 'none';
            toggleNotePanelBtn.textContent = 'Заметки на день';
        }
    });

    // Вкладки
    noteTabsRow.addEventListener('click', (event) => {
        const btn = event.target.closest('.tab-btn');
        if (!btn) return;

        const targetId = btn.dataset.tab;

        tabButtons.forEach(b => b.classList.remove('active'));
        tabContents.forEach(tc => tc.classList.remove('active'));

        btn.classList.add('active');
        const targetContent = document.getElementById(targetId);
        if (targetContent) {
            targetContent.classList.add('active');
        }
    });

    // Капли
    dropsRow.addEventListener('click', (event) => {
        const btn = event.target.closest('.drop-btn');
        if (!btn) return;
        dropsRow.querySelectorAll('.drop-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });

    // Чипы
    setupChipsRow(chipsRowSex, true);
    setupChipsRow(chipsRowMood, true);
    setupChipsRow(chipsRowSymptoms, false);

    noteSaveBtn.addEventListener('click', () => {
        if (!state.selectedDate) {
            alert('Сначала выберите день в календаре.');
            return;
        }

        const dateKey = formatKeyDate(state.selectedDate);
        const notes = loadNotes();

        let flowLevel = null;
        const activeDrop = dropsRow.querySelector('.drop-btn.active');
        if (activeDrop) {
            flowLevel = parseInt(activeDrop.dataset.level, 10);
        }

        let sex = null;
        chipsRowSex.querySelectorAll('.chip').forEach(chip => {
            if (chip.classList.contains('active')) {
                sex = chip.dataset.key;
            }
        });

        const symptoms = [];
        chipsRowSymptoms.querySelectorAll('.chip').forEach(chip => {
            if (chip.classList.contains('active')) {
                symptoms.push(chip.dataset.key);
            }
        });

        let mood = null;
        chipsRowMood.querySelectorAll('.chip').forEach(chip => {
            if (chip.classList.contains('active')) {
                mood = chip.dataset.key;
            }
        });

        const weight = noteWeight.value ? parseFloat(noteWeight.value) : undefined;
        const temperature = noteTemperature.value ? parseFloat(noteTemperature.value) : undefined;

        notes[dateKey] = {
            flowLevel,
            endPeriod: noteEndPeriod.checked,
            text: noteText.value || '',
            medicine: noteMedicine.value || '',
            ovulationTest: noteOvulationTest.value || '',
            sex,
            symptoms,
            mood,
            weight,
            temperature
        };

        saveNotes(notes);
        state.recalculate();
    });

    noteClearBtn.addEventListener('click', () => {
        if (!state.selectedDate) {
            alert('Сначала выберите день в календаре.');
            return;
        }

        const dateKey = formatKeyDate(state.selectedDate);
        const notes = loadNotes();
        delete notes[dateKey];
        saveNotes(notes);

        resetNoteForm();
        state.recalculate();
    });

    function setupChipsRow(rowElement, singleSelect) {
        rowElement.addEventListener('click', (event) => {
            const chip = event.target.closest('.chip');
            if (!chip) return;

            if (singleSelect) {
                rowElement.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
            } else {
                chip.classList.toggle('active');
            }
        });
    }

    function resetNoteForm() {
        dropsRow.querySelectorAll('.drop-btn').forEach(btn => btn.classList.remove('active'));
        noteEndPeriod.checked = false;
        noteText.value = '';
        noteMedicine.value = '';
        noteOvulationTest.value = '';
        noteWeight.value = '';
        noteTemperature.value = '';
        chipsRowSex.querySelectorAll('.chip').forEach(chip => chip.classList.remove('active'));
        chipsRowSymptoms.querySelectorAll('.chip').forEach(chip => chip.classList.remove('active'));
        chipsRowMood.querySelectorAll('.chip').forEach(chip => chip.classList.remove('active'));
    }

    state.fillNoteFormFromData = (note) => {
        resetNoteForm();
        if (!note) return;

        if (note.flowLevel) {
            const btn = dropsRow.querySelector(`.drop-btn[data-level="${note.flowLevel}"]`);
            if (btn) btn.classList.add('active');
        }
        if (note.endPeriod) noteEndPeriod.checked = true;
        if (note.text) noteText.value = note.text;
        if (note.medicine) noteMedicine.value = note.medicine;
        if (note.ovulationTest) noteOvulationTest.value = note.ovulationTest;
        if (note.weight !== undefined) noteWeight.value = note.weight;
        if (note.temperature !== undefined) noteTemperature.value = note.temperature;

        if (note.sex) {
            chipsRowSex.querySelectorAll('.chip').forEach(chip => {
                if (chip.dataset.key === note.sex) {
                    chip.classList.add('active');
                }
            });
        }

        if (Array.isArray(note.symptoms)) {
            chipsRowSymptoms.querySelectorAll('.chip').forEach(chip => {
                if (note.symptoms.includes(chip.dataset.key)) {
                    chip.classList.add('active');
                }
            });
        }

        if (note.mood) {
            chipsRowMood.querySelectorAll('.chip').forEach(chip => {
                if (chip.dataset.key === note.mood) {
                    chip.classList.add('active');
                }
            });
        }
    };

    state.updateNoteDateLabel = () => {
        if (state.selectedDate) {
            noteDateLabel.textContent = formatDate(state.selectedDate);
        } else {
            noteDateLabel.textContent = 'не выбран';
        }
    };
}
