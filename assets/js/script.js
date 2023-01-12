
    const apiKey = '2912dc5a22b0732d6666c08f1e222443';
    const cityEl = $('#city');
    const dateEl = $('#date');
    const weatherIconEl = $('#weather-icon');
    const temperatureEl = $('#temperature');
    const humidityEl = $('#humidity');
    const windEl = $('#wind');
    const cityListEl = $('.cityList');
    const cityInput = $('#city-input');

    let pastCities = [];



$(document).ready(function () {




//makes it not case sensitive 
function compare(a, b) {
    return a.city.toUpperCase().localeCompare(b.city.toUpperCase());
}



    // local storage
    function loadCities() {
        const storedCities = JSON.parse(localStorage.getItem('pastCities'));
        if (storedCities) {
            pastCities = storedCities;
        }
    }

    // store cities 
    function storeCities() {
        localStorage.setItem('pastCities', JSON.stringify(pastCities));
    }

   // Functions for the OpenWeather API call

    function buildURLcity(city) {
        if (city) {
            return `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
        }
    }

    function buildURLId(id) {
        return `https://api.openweathermap.org/data/2.5/weather?id=${id}&appid=${apiKey}`;
    }

     // this will display the 5 cities
     // having trouble with it populating 
    function displayCities(pastCities) {
        cityListEl.empty();
        pastCities.length = 5; // Keep only the first 5 elements
        let sortedCities = [...pastCities].sort(compare);
        for (let location of sortedCities) {
            let cityDiv = $('<div>', {class: 'col-12 city'});
            let cityBtn = $('<button>', {
                class: 'btn btn-light city-btn',
                text: location.city
            });
            cityDiv.append(cityBtn);
            cityListEl.append(cityDiv);
        }
    }
    

    // Search for weather conditions by calling the OpenWeather API
    function searchWeather(queryURL) {

        //AJAX call to retrieve weather data
        $.ajax({
            url: queryURL,
            method: 'GET'
        }).then(function (response) {

            // Store current city in past cities
            let city = response.name;
            let id = response.id;
            // Remove duplicate cities
            if (pastCities[0]) {
                pastCities = $.grep(pastCities, function (storedCity) {
                    return id !== storedCity.id;
                })
            }
            pastCities.unshift({ city, id });
            storeCities();
            displayCities(pastCities);
            
            // Display current weather 
            cityEl.text(response.name);
            let formattedDate = moment.unix(response.dt).format('L');
            dateEl.text(formattedDate);
            let weatherIcon = response.weather[0].icon;
            weatherIconEl.attr('src', `http://openweathermap.org/img/wn/${weatherIcon}.png`).attr('alt', response.weather[0].description);
            temperatureEl.html(((response.main.temp - 273.15) * 1.8 + 32).toFixed(1));
            humidityEl.text(response.main.humidity);
            windEl.text((response.wind.speed * 2.237).toFixed(1));


                // this will show the weather for 5days
                //having trouble

                fiveDay.forEach((currDay, i) => {
                    if (i <= 5) {
                        $(`div.day-${i} .card-title`).text(moment.unix(currDay.dt).format('L'));
                        $(`div.day-${i} .fiveDay-img`).attr(
                            'src',
                            `http://openweathermap.org/img/wn/${currDay.weather[0].icon}.png`
                        ).attr('alt', currDay.weather[0].description);
                        $(`div.day-${i} .fiveDay-temp`).text(((currDay.temp.day - 273.15) * 1.8 + 32).toFixed(1));
                        $(`div.day-${i} .fiveDay-humid`).text(currDay.humidity);
                    }
                });
            });
        
    }

     // Function to display the last searched city
    function displayLastSearchedCity() {
        if (pastCities[0]) {
            let queryURL = buildURLId(pastCities[0].id);
            searchWeather(queryURL);
        } else {
            // if no past searched cities, load Detroit weather data
            let queryURL = buildURLcity("Tucson");
            searchWeather(queryURL);
        }
    }

    
    $('#search-btn').on('click', function (event) {
        // prevents refresh page
        event.preventDefault();


        let city = cityInput.val().trim();
        city = city.replace(' ', '%20');

        // Clear the input fields
        cityInput.val('');

        // Build the query url with the city and searchWeather
        if (city) {
            let queryURL = buildURLcity(city);
            searchWeather(queryURL);
        }
    }); 
    
    
    $(document).on("click", "button.city-btn", function (event) {
        let clickedCity = $(this).text();
        let foundCity = $.grep(pastCities, function (storedCity) {
            return clickedCity === storedCity.city;
        })
        let queryURL = buildURLId(foundCity[0].id)
        searchWeather(queryURL);
    });


    // cities into array
    loadCities();
    displayCities(pastCities);

    // Display weather for last searched city
    displayLastSearchedCity();

});

//GIVEN a weather dashboard with form inputs
//WHEN I search for a city
//THEN I am presented with current and future conditions for that city and that city is added to the search history
//WHEN I view current weather conditions for that city
//THEN I am presented with the city name, the date, an icon representation of weather conditions, the temperature, the humidity, and the wind speed
//WHEN I view future weather conditions for that city
//THEN I am presented with a 5-day forecast that displays the date, an icon representation of weather conditions, the temperature, the wind speed, and the humidity
//WHEN I click on a city in the search history
//THEN I am again presented with current and future conditions for that city