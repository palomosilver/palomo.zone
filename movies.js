function getGoogleSheetsData() {
    fetch("https://docs.google.com/spreadsheets/d/e/2PACX-1vQ3cBSwuX_prFDiu1Kl20G2yYp1bNofKC5w-fAHld128ALE4fbtPbNQYcal7QlcvjwGeCgWzm7bjTSE/pubhtml")
    .then(response => response.text())
    .then(data => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(data, 'text/html');
        const rows = doc.querySelectorAll('tr');

        filmData = Array.from(rows).map(row => {
            const cells = row.querySelectorAll('td');
            return {
                title: cells[0]?.textContent?.trim() || '',
                nativeTitle: cells[1]?.textContent?.trim() || '',
                year: cells[2]?.textContent?.trim() || '',
                director: cells[3]?.textContent?.trim() || '',
                country: cells[4]?.textContent?.trim() || '',
                language: cells[5]?.textContent?.trim() || '',
                tags: cells[6]?.textContent?.trim() || '',
                liked: cells[7]?.textContent?.trim() || '',
                notes: cells[8]?.textContent?.trim() || '',
            }
        });

        // Remove the first two entries (header rows) from filmData
        filmData = filmData.slice(2);
        
        displayFilms(filmData);
    })
    .catch(error => {
        console.error('Error fetching data:', error);
        
        // display the sheet directly in an iframe on error
        // not working rn, need to fix
        const container = document.getElementById('films');
        backupSheet = document.createElement('div');
        backupSheet.className = 'backup-sheet';
        backupSheet.innerHTML = `
            <p>looks like the sheet is down, here's a backup:</p>
            <img src="https://media.tenor.com/42bcTn0iuVgAAAAj/under-construction-pikachu.gif" alt="Under Construction">
            <iframe src="https://docs.google.com/spreadsheets/d/e/2PACX-1vQ3cBSwuX_prFDiu1Kl20G2yYp1bNofKC5w-fAHld128ALE4fbtPbNQYcal7QlcvjwGeCgWzm7bjTSE/pubhtml" width="100%" height="500px"></iframe>
        `;
        container.appendChild(backupSheet);
    });
}

function displayFilms(films) {
    const container = document.getElementById('films');

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
            <div class="cell"${film.liked === 'y' ? ' style="background-color: red;"' : ''}>
            ${film.liked}
            </div>
        `;
        container.appendChild(filmRow);

        if (film.notes) {
            const notesRow = document.createElement('div');
            notesRow.className = 'notes-row';  // Start uncollapsed
            notesRow.innerHTML = `
                <div class="notes">${film.notes}</div>
            `;
            container.appendChild(notesRow);

            const toggleButton = filmRow.querySelector('.notes-toggle');
            toggleButton.addEventListener('click', () => {
                notesRow.classList.toggle('collapsed');
                toggleButton.textContent = notesRow.classList.contains('collapsed') ? '📝' : '📝';
            });
        }
    });
}