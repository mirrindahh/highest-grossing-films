let sortDirections = [true, true, true, true, true];

fetch("films.json")
    .then(response => response.json())
    .then(films => {
        let table = document.getElementById("films-table");
        let boxOfficeByCountry = {};
        let moviesByYear = {};
        let directorsBoxOffice = {};
        let topFilms = [];

        films.forEach(film => {
            let row = table.insertRow();
            row.insertCell(0).innerText = film.Title;
            row.insertCell(1).innerText = film.Year;
            row.insertCell(2).innerText = film.Director;
            row.insertCell(3).innerText = film.BoxOffice;
            row.insertCell(4).innerText = film.Country;

            let revenue = parseFloat(film.BoxOffice.replace(/[$,]/g, "")) || 0;

            film.Country.split(", ").forEach(country => {
                boxOfficeByCountry[country] = (boxOfficeByCountry[country] || 0) + revenue;
            });

            moviesByYear[film.Year] = (moviesByYear[film.Year] || 0) + 1;

            film.Director.split(", ").forEach(director => {
                directorsBoxOffice[director] = (directorsBoxOffice[director] || 0) + revenue;
            });

            topFilms.push({ title: film.Title, revenue });
        });

        showTopDirectors(directorsBoxOffice);
        showTopFilms(topFilms);
        createBoxOfficeByCountryChart(boxOfficeByCountry);
        createMoviesByYearChart(moviesByYear);
    });

function filterFilms() {
    let input = document.getElementById("search").value.toLowerCase();
    let rows = document.querySelectorAll("#films-table tr");

    rows.forEach(row => {
        let title = row.cells[0].innerText.toLowerCase();
        row.style.display = title.includes(input) ? "" : "none";
    });
}

function sortTable(n) {
    let table = document.querySelector("table");
    let rows = Array.from(table.rows).slice(1);
    let ascending = sortDirections[n];

    let sortedRows = rows.sort((a, b) => {
        let valA = a.cells[n].innerText;
        let valB = b.cells[n].innerText;

        if (!isNaN(valA) && !isNaN(valB)) {
            return ascending ? valA - valB : valB - valA;
        }

        return ascending ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });

    table.tBodies[0].append(...sortedRows);
    sortDirections[n] = !ascending;
}

function showTopDirectors(data) {
    let sorted = Object.entries(data).sort((a, b) => b[1] - a[1]).slice(0, 3);
    let list = document.getElementById("topDirectors");
    list.innerHTML = sorted.map(([name, revenue]) => 
        `<p><strong>${name}</strong>: $${revenue.toLocaleString()}</p>`
    ).join("");
}

function showTopFilms(data) {
    let sorted = data.sort((a, b) => b.revenue - a.revenue).slice(0, 3);
    let list = document.getElementById("topFilms");
    list.innerHTML = sorted.map(film => 
        `<p><strong>${film.title}</strong>: $${film.revenue.toLocaleString()}</p>`
    ).join("");
}


function createBoxOfficeByCountryChart(data) {
    let ctx = document.getElementById("boxOfficeByCountry").getContext("2d");
    let sortedEntries = Object.entries(data).sort((a, b) => b[1] - a[1]);
    let labels = Object.keys(data);
    let values = Object.values(data);
    let total = values.reduce((sum, val) => sum + val, 0);
    let percentages = values.map(val => ((val / total) * 100).toFixed(1));

    new Chart(ctx, {
        type: "pie",
        data: {
            labels,
            datasets: [{
                data: percentages,
                backgroundColor: ["#40BA21", "#91A3B0", "#EDF1F5", "#333333", "#000000"]
            }]
        }
    });
}

function createMoviesByYearChart(data) {
    let ctx = document.getElementById("moviesByYear").getContext("2d");
    let labels = Object.keys(data).sort((a, b) => a - b);
    let values = labels.map(year => data[year]);

    new Chart(ctx, {
        type: "bar",
        data: {
            labels,
            datasets: [{
                label: "Movies Count",
                data: values,
                backgroundColor: "#40BA21"
            }]
        }
    });
}
