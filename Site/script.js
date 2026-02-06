let weatherData = null; // variável global para guardar o retorno da API

async function getWeather(city, country) {
  try {
    const response = await fetch(`http://localhost:8080/api/weather?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}`);
    if (!response.ok) throw new Error("Erro ao buscar dados da API");

    const data = await response.json();
    weatherData = data; 

   
    updateMainCard(data.days[0], data.city, data.description, data.currentTemp);

 
    const buttons = document.querySelectorAll(".days-section button");
    buttons.forEach((btn, index) => {
      const day = data.days[index + 1]; 
      if (day) {
        const date = new Date(day.date);
        btn.querySelector(".day").textContent = date.toLocaleDateString("pt-BR", {
          weekday: "short",
        }).toUpperCase();

        
        btn.addEventListener("click", () => handleDayClick(day));
      }
    });

  } catch (error) {
    console.error("Erro:", error);
  }
}


function updateMainCard(day, city, description, currentTemp) {
  document.querySelector(".city").textContent = city;
  document.querySelector(".temperature").textContent = `${day.tempmax.toFixed(1)}°C`;
  document.querySelector(".range").textContent = `${day.tempmax.toFixed(1)}° / ${day.tempmin.toFixed(1)}°`;
  document.querySelector(".weather div:nth-child(2)").textContent = day.conditions || description;
}


function handleDayClick(day) {
  if (!weatherData) return;
  updateMainCard(day, weatherData.city, day.conditions, weatherData.currentTemp);
}


getWeather("São Paulo", "BR");
