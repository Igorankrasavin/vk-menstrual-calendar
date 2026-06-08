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
