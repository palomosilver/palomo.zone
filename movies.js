function getGoogleSheetsData() {
    fetch("https://docs.google.com/spreadsheets/d/e/2PACX-1vQ3cBSwuX_prFDiu1Kl20G2yYp1bNofKC5w-fAHld128ALE4fbtPbNQYcal7QlcvjwGeCgWzm7bjTSE/pub?output=csv")
        .then(response => response.text())
        .then(data => {
            const lines = data.split('\n').filter(line => line.trim() !== '');
            const dataLines = lines.slice(1); // Skip header line

            const filmData = dataLines.map(line => {
                const cells = [];
                let regex = /("([^"]|"")*"|[^,]*)(,|$)/g; // vibe code magic
                let match;
                while ((match = regex.exec(line)) !== null) {
                    let cell = match[1];
                    // Remove surrounding quotes and unescape double quotes
                    if (cell.startsWith('"') && cell.endsWith('"')) {
                        cell = cell.slice(1, -1).replace(/""/g, '"');
                    }
                    cells.push(cell.trim());
                    if (match[3] === '') break; // End of line
                }
                console.log('Parsed cells:', cells);
                return {
                    title: cells[0] || '',
                    nativeTitle: cells[1] || '',
                    year: cells[2] || '',
                    director: cells[3] || '',
                    country: cells[4] || '',
                    language: cells[5] || '',
                    tags: cells[6] || '',
                    liked: cells[7] || '',
                    notes: cells[8] || '',
                };
            });

            if (filmData.length === 0) {
                throw new Error('No film data found');
            }
            displayFilms(filmData);
        })
        .catch(error => {
            console.error('Error fetching CSV:', error);

            // fallback: show iframe
            const container = document.getElementById('films');
            const backupSheet = document.createElement('div');
            backupSheet.className = 'backup-sheet';
            backupSheet.innerHTML = `
                <p>looks like the table is down, here's a backup:</p>
                <img src="https://media.tenor.com/42bcTn0iuVgAAAAj/under-construction-pikachu.gif" alt="Under Construction">
                <iframe src="https://docs.google.com/spreadsheets/d/e/2PACX-1vQ3cBSwuX_prFDiu1Kl20G2yYp1bNofKC5w-fAHld128ALE4fbtPbNQYcal7QlcvjwGeCgWzm7bjTSE/pubhtml" width="100%" height="500px"></iframe>
            `;
            container.appendChild(backupSheet);
        });
}

let filmsCache = [];
let sortState = {
    title: 'asc',
    year: 'asc'
};

function displayFilms(films) {
    filmsCache = films;
    const container = document.getElementById('films');
    container.innerHTML = '';

    films.forEach(film => {
        const filmRow = document.createElement('div');
        filmRow.className = 'film';
        filmRow.innerHTML = `
            <div class="cell">
                <div class="title-content">
                    ${film.title}
                    ${film.nativeTitle ? `<br><span class="native-title">${film.nativeTitle}</span>` : ''}
                </div>
                ${film.notes ? `<button class="notes-toggle">📝</button>` : ''}
            </div>
            <div class="cell">${film.year}</div>
            <div class="cell">${film.director}</div>
            <div class="cell">${film.country}</div>
            <div class="cell">${film.language}</div>
            <div class="cell">${film.tags}</div>
            <div class="cell">
                ${film.liked}
            </div>
        `;
        container.appendChild(filmRow);

        if (film.notes) {
            const notesRow = document.createElement('div');
            notesRow.className = 'notes-row';
            notesRow.innerHTML = `<div class="notes">${film.notes}</div>`;
            container.appendChild(notesRow);

            const toggleButton = filmRow.querySelector('.notes-toggle');
            toggleButton.addEventListener('click', () => {
                notesRow.classList.toggle('collapsed');
                toggleButton.textContent = notesRow.classList.contains('collapsed') ? '📝' : '📝';
            });
        }
    });
}

function updateArrows() {
    document.getElementById('arrow-title').textContent = sortState.title === 'asc' ? '▲' : '▼';
    document.getElementById('arrow-year').textContent = sortState.year === 'asc' ? '▲' : '▼';
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('sort-title').addEventListener('click', function(e) {
        e.preventDefault();
        sortState.title = sortState.title === 'asc' ? 'desc' : 'asc';
        const sorted = [...filmsCache].sort((a, b) => {
            if (sortState.title === 'asc') {
                return a.title.localeCompare(b.title);
            } else {
                return b.title.localeCompare(a.title);
            }
        });
        displayFilms(sorted);
        updateArrows();
    });

    document.getElementById('sort-year').addEventListener('click', function(e) {
        e.preventDefault();
        sortState.year = sortState.year === 'asc' ? 'desc' : 'asc';
        const sorted = [...filmsCache].sort((a, b) => {
            if (sortState.year === 'asc') {
                return (parseInt(a.year) || 0) - (parseInt(b.year) || 0);
            } else {
                return (parseInt(b.year) || 0) - (parseInt(a.year) || 0);
            }
        });
        displayFilms(sorted);
        updateArrows();
    });

    updateArrows();
});