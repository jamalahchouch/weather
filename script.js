    const apiKey = "8f4e71b8ecd180eb2cada956d09b1077";
    const toutesLesVilles = [
      "Casablanca", "Rabat", "Marrakech", "Fès", "Tanger", "Agadir", "Oujda", "Tétouan", "Safi", "Khouribga",
      "El Jadida", "Béni Mellal", "Errachidia", "Meknès", "Nador", "Larache", "Settat", "Ouarzazate", "Kenitra", "Guelmim"
    ];
    const weatherGrid = document.getElementById("weatherGrid");
    const searchInput = document.getElementById("searchInput");
    const modal = document.getElementById("forecastModal");
    const modalTitle = document.getElementById("modalTitle");
    const pagination = document.getElementById("pagination");

    const villesParPage = 4;
    let pageActuelle = 1;

    async function fetchWeather(city) {
      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city},MA&appid=${apiKey}&units=metric&lang=fr`);
        return await res.json();
    }

    async function fetchForecast(city) {
      const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city},MA&appid=${apiKey}&units=metric&lang=fr`);
        return await res.json();
    }
    

    function createCard(city, data) {
      const div = document.createElement("div");
      div.className = "card";
      div.setAttribute("data-city", city.toLowerCase());
      div.innerHTML = `
        <h3>${city}</h3>
        <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="">
        <p>${data.weather[0].description}</p>
        <p><strong>${data.main.temp}°C</strong></p>
        <p>Humidité : ${data.main.humidity}%</p>
        <button onclick="showForecast('${city}')">Voir prévisions</button>
      `;
      weatherGrid.appendChild(div);
    }

   let currentChart = null; 

 function showForecast(city) {
  fetchForecast(city).then(data => {
    modal.style.display = "block";
    modalTitle.innerText = `Prévision 5 jours - ${city}`;

    const labels = [];
    const temps = [];

    data.list.forEach((entry, index) => {
      if (index % 8 === 0) {
        labels.push(entry.dt_txt.split(" ")[0]); 
        temps.push(entry.main.temp);
      }
    });

    
    if (currentChart) {
      currentChart.destroy();
    }

    const ctx = document.getElementById("forecastChart").getContext("2d");
    currentChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: labels,
        datasets: [{
          label: "Température (°C)",
          data: temps,
          borderColor: "#007BFF",
          backgroundColor: "rgba(0,123,255,0.2)",
          tension: 0.3
        }]
      },
      options: {
        responsive: true
      }
    });
  });
}

     

    function closeModal() {
      modal.style.display = "none";
      
    }

    window.onclick = function(event) {
      if (event.target == modal) closeModal();
      if (event.target == document.getElementById("locationModal")) {
        document.getElementById("locationModal").style.display = "none";
      }
      
    }

    // Recherche dynamique
    searchInput.addEventListener("input", () => {
      const value = searchInput.value.toLowerCase();
      weatherGrid.innerHTML = "";
      const filtered = toutesLesVilles.filter(ville => ville.toLowerCase().includes(value));
      filtered.forEach(city => {
        fetchWeather(city).then(data => createCard(city, data));
      });
    });

    function afficherPage(page) {
      weatherGrid.innerHTML = "";
      const debut = (page - 1) * villesParPage;
      const fin = debut + villesParPage;
      const villesPage = toutesLesVilles.slice(debut, fin);
      villesPage.forEach(city => {
        fetchWeather(city).then(data => createCard(city, data));
      });
      afficherPagination();
    }

    function afficherPagination() {
      pagination.innerHTML = "";
      const totalPages = Math.ceil(toutesLesVilles.length / villesParPage);
      for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement("button");
        btn.innerText = i;
        btn.onclick = () => {
          pageActuelle = i;
          afficherPage(pageActuelle);
        };
        pagination.appendChild(btn);
      }
    }

    afficherPage(pageActuelle);

    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=fr`)
          .then(res => res.json())
          .then(data => {
            document.getElementById("locationModal").style.display = "block";
            document.getElementById("locationWeather").innerHTML = `
              <h3>${data.name}</h3>
              <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="">
              <p>${data.weather[0].description}</p>
              <p><strong>${data.main.temp}°C</strong></p>
              <p>Humidité : ${data.main.humidity}%</p>
            `;
             showForecast(city)
          });
      });
    }