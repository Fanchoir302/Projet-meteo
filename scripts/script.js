//Clem JOURDIN, INFO1 TD1TP2

window.addEventListener("DOMContentLoaded", init);

function init() {
  let n = 24;     //Prévisions météo sur les n prochaines heures

  let show_chart = false;

  let graph = document.getElementById("graphe");

  const div_GUI = document.getElementById("GUI");
  let title = document.getElementById("titre");

  //Boutons
  const btn_city = document.createElement('button');
  const btn_update = document.createElement('button');
  const btn_chart = document.createElement('button');

  const _Text_prompt_city = "Veuillez choisir une ville en France :";
  let place = "Lannion";
  let link_weather = "https://api.open-meteo.com/v1/forecast?latitude=48.7326&longitude=-3.4566&current=temperature_2m,is_day,precipitation,rain,snowfall,cloud_cover,wind_speed_10m&hourly=temperature_2m,precipitation,rain,snowfall,cloud_cover,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,rain_sum,snowfall_sum,wind_speed_10m_max&timezone=Europe%2FBerlin";
  update_data(link_weather, place);

  btn_city.innerHTML = "Changer la ville";
  btn_update.innerHTML = "Actualiser";
  btn_chart.innerHTML = "Afficher le graphe";

  div_GUI.appendChild(btn_city);
  div_GUI.appendChild(btn_update);
  div_GUI.appendChild(btn_chart);

  let titre = "Météo à " + place;

  title.innerHTML = titre;

  //Création du tableau (initialement rempli avec les donneés de Lannion)
  var tab = document.getElementById("meteo");

  let data_row_array = [];
  let day_cell_array = [];
  let hour_cell_array = [];
  let temperature_cell_array = [];
  let sun_cell_array = [];
  let precipitation_cell_array = [];
  let wind_cell_array = [];

  let cloud_image_array = [];
  let precipitation_image_array = [];
  let wind_image_array = [];

  for (i = 0; i <= n; i++) {
    const data_row = document.createElement("TR");
    const day_cell = document.createElement("TD");
    const hour_cell = document.createElement("TD");
    const temperature_cell = document.createElement("TD");
    const sun_cell = document.createElement("TD");
    const precipitation_cell = document.createElement("TD");
    const wind_cell = document.createElement("TD");

    let cloud_image = document.createElement("img");
    let precipitation_image = document.createElement("img");
    let wind_image = document.createElement("img");

    let day = '-';
    let hour = '-';
    let temperature = "-";
    let sun = "-";
    let precipitation = "-";
    let wind = "-";

    day_cell.innerHTML = day;
    hour_cell.innerHTML = hour;
    temperature_cell.innerHTML = temperature;
    sun_cell.innerHTML = sun;
    precipitation_cell.innerHTML = precipitation;
    wind_cell.innerHTML = wind;

    cloud_image.src = "images/logo.png";
    precipitation_image.src = "images/logo.png";
    wind_image.src = "images/logo.png";

    cloud_image.style.height = "50px";
    precipitation_image.style.height = "50px";
    wind_image.style.height = "50px";

    data_row.appendChild(day_cell);
    data_row.appendChild(hour_cell);
    data_row.appendChild(temperature_cell);
    data_row.appendChild(sun_cell);
    data_row.appendChild(cloud_image);
    data_row.appendChild(precipitation_cell);
    data_row.appendChild(precipitation_image);
    data_row.appendChild(wind_cell);
    data_row.appendChild(wind_image);

    tab.appendChild(data_row);

    data_row_array.push(data_row);
    day_cell_array.push(day_cell);
    hour_cell_array.push(hour_cell);
    temperature_cell_array.push(temperature_cell);
    sun_cell_array.push(sun_cell);
    precipitation_cell_array.push(precipitation_cell);
    wind_cell_array.push(wind_cell);

    cloud_image_array.push(cloud_image);
    precipitation_image_array.push(precipitation_image);
    wind_image_array.push(wind_image);
  }


  btn_city.addEventListener(
    "click",
    function (theEvent) {
      //Changement de ville
      theEvent.stopPropagation();
      let prompt_city = prompt(_Text_prompt_city);

      if (prompt_city != null) {
        place = prompt_city;
      }

      let link_place = "https://api-adresse.data.gouv.fr/search/?q=" + place + "&type=municipality";
      title.innerHTML = "Météo à " + place;

      fetch(link_place)
        .then(function (response) {
          return response.json();
        })
        .then((data) => {
          let longitude = data.features[0].geometry.coordinates[0];
          let latitude = data.features[0].geometry.coordinates[1];

          link_weather = "https://api.open-meteo.com/v1/forecast?latitude=" + latitude + "&longitude=" + longitude + "&current=temperature_2m,is_day,precipitation,rain,snowfall,cloud_cover,wind_speed_10m&hourly=temperature_2m,precipitation,rain,snowfall,cloud_cover,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,rain_sum,snowfall_sum,wind_speed_10m_max&timezone=Europe%2FBerlin";

          update_data(link_weather, place);

          const delay = 3000;
          const id = setInterval(update_data(link_weather, place), delay);
        }
        )
    }
  )

  btn_update.addEventListener(
    "click",
    function (theEvent) {
      //Mise à jour des données par appel de la fonction update_data
      theEvent.stopPropagation();
      update_data(link_weather, place);
    }
  )

  btn_chart.addEventListener(
    "click",
    function (theEvent) {
      theEvent.stopPropagation();
      if (show_chart) {
        show_chart = false;
        btn_chart.innerHTML = "Afficher le graphe";
      }
      else {
        show_chart = true;
        btn_chart.innerHTML = "Cacher le graphe";
      }
      update_data(link_weather, place);
    }
  )

  function same_day(time1, time2) {
    //Renvoie true si time1 et time2 en format iso8601 correspondent au même jour et false sinon
    let res = true;
    let i = 0;
    while (i < time1.length && time1[i] != 'T' && res) {
      if (time1[i] != time2[i]) {
        res = false;
      }
      i++;
    }
    return res;
  }

  function same_day_same_hour(time1, time2) {
    //Renvoie true si time1 et time2 en format iso8601 correspondent au même jour et à la même heure et false sinon
    let res = true;
    let i = 0;
    while (i < time1.length && time1[i] != ':' && res) {
      if (time1[i] != time2[i]) {
        res = false;
      }
      i++;
    }
    return res;
  }

  function update_data(link_weather, place) {
    //Mise à jour des données affichées par le tableau et affichage du graphe
    fetch(link_weather)
      .then(function (response) {
        return response.json();
      })
      .then((data) => {
        //Mise à jour des données :
        
        let current_time = data.current.time;

        const current_hour = parseInt(current_time[11] + current_time[12]);

        let i = 0;

        while (i < data.hourly.time.length && !same_day_same_hour(data.hourly.time[i], current_time)) {
          i++;
        }
        const current_time_index = i;

        let j = 0;

        while (j < data.daily.time.length && !same_day(data.daily.time[j], current_time)) {
          j++;
        }

        const current_day_index = j;

        const sunrise_time = data.daily.sunrise[current_day_index];
        const sunset_time = data.daily.sunset[current_day_index];

        const sunrise_hour = sunrise_time[11] + sunset_time[12];
        const sunset_hour = sunset_time[11] + sunset_time[12];

        //Unités :
        const unit_temperature_2m = data.hourly_units.temperature_2m;
        const unit_rain = data.hourly_units.rain;
        const unit_snowfall = data.hourly_units.snowfall;
        const unit_cloud_cover = data.hourly_units.cloud_cover;
        const unit_wind_speed_10m = data.hourly_units.wind_speed_10m;

        for (i = 0; i <= n; i++) {
          let day = "Aujourd'hui"

          let hour = (current_hour + i) % 24;

          if (Math.trunc((current_hour + i) / 24) == 1) {
            day = "Demain";
          }
          else if (Math.trunc((current_hour + i) / 24) > 1) {
            day = "J + " + Math.trunc((current_hour + i) / 24);
          }

          let current_time = current_time_index + i;

          temperature_2m = data.hourly.temperature_2m[current_time];
          rain = data.hourly.rain[current_time];
          snowfall = data.hourly.snowfall[current_time];
          cloud_cover = data.hourly.cloud_cover[current_time];
          wind_speed_10m = data.hourly.wind_speed_10m[current_time];

          day_cell_array[i].innerHTML = day;
          hour_cell_array[i].innerHTML = hour + "h";
          temperature_cell_array[i].innerHTML = temperature_2m + unit_temperature_2m
          sun_cell_array[i].innerHTML = cloud_cover + unit_cloud_cover + " de nuages";
          wind_cell_array[i].innerHTML = wind_speed_10m + unit_wind_speed_10m;

          if (cloud_cover <= 25) {
            cloud_image_array[i].src = "images/Plein_Soleil.PNG";
          }
          else if (cloud_cover <= 75) {
            cloud_image_array[i].src = "images/Mi_Soleil.PNG";
          }
          else {
            cloud_image_array[i].src = "images/Couvert.PNG";
          }

          if (wind_speed_10m <= 11.3) {
            wind_image_array[i].src = "images/Aucun_Vent.PNG";
          }
          else if (wind_speed_10m <= 51.5) {
            wind_image_array[i].src = "images/Vent_Moyen.PNG";
          }
          else {
            wind_image_array[i].src = "images/Grand_Vent.PNG";
          }

          if (rain == 0 && snowfall == 0) {
            precipitation_cell_array[i].innerHTML = "Aucune";
            precipitation_image_array[i].src = "images/Aucune_Precipitation.PNG";
          }
          else if (rain > snowfall) {
            precipitation_cell_array[i].innerHTML = rain + unit_rain + " de pluie";
            precipitation_image_array[i].src = "images/Pluie.PNG";
          }
          else {
            precipitation_cell_array[i].innerHTML = snowfall + unit_snowfall + " de neige";
            precipitation_image_array[i].src = "images/Neige.PNG";
          }

          if (hour < sunrise_hour || hour > sunset_hour) {
            //Mode nuit
            data_row_array[i].style.backgroundColor = "rgb(28, 56, 85)";
            data_row_array[i].style.color = "white";
          }
          else {
            //Mode jour
            data_row_array[i].style.backgroundColor = "rgb(72, 144, 216)";
            data_row_array[i].style.color = "black";
          }
        }
        titre = "Météo à " + place;

        //Affichage du graphe
        let graphe = new Chart(
          document.getElementById("graphe"),
          {
            type: 'line',
            data: {
              labels: ["Aujourd'hui", "J+1", "J+2", "J+3", "J+4", "J+5", "J+6"],
              datasets: [
                {
                  label: "Température maximale (" + data.daily_units.temperature_2m_max + ")",
                  data: data.daily.temperature_2m_max,
                  borderColor: "rgb(144, 48, 48)",
                  fill: false,
                }, {
                  label: "Température minimale (" + data.daily_units.temperature_2m_min + ")",
                  data: data.daily.temperature_2m_min,
                  borderColor: "rgb(48, 144, 139)",
                  fill: false,
                }, {
                  label: "Pluie (" + data.daily_units.rain_sum + ")",
                  data: data.daily.rain_sum,
                  borderColor: "rgb(48, 62, 144)",
                  fill: false,
                }, {
                  label: "Neige (" + data.daily_units.snowfall_sum + ")",
                  data: data.daily.snowfall_sum,
                  borderColor: "rgb(124, 130, 136)",
                  fill: false,
                }, {
                  label: "Vent maximal (" + data.daily_units.wind_speed_10m_max + ")",
                  data: data.daily.wind_speed_10m_max,
                  borderColor: "rgb(78, 144, 48)",
                  fill: false,
                }
              ]
            },
            options: {
              title: {
                display: true,
                text: "Prévisions météo de la semaine à " + place,
                fontSize: 40
              },
              scales: {
                yAxes: [{
                  ticks: {
                    fontSize: 23
                  }
                }],
                xAxes: [{
                  ticks: {
                    fontSize: 23
                  }
                }]
              }
            }
          }
        );

        if (show_chart) {
          graph.style.display = 'block';
        }
        else{
          graph.style.display = 'none';
        }
      }
    )
  }
}