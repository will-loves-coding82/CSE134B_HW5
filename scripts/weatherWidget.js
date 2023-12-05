class WeatherWidget extends HTMLElement {

    constructor() {
        super();
        // Create a shadow root to encapsulate styles.
		this.attachShadow({ mode: 'open' });

        this.weatherDisplay = document.createElement('div');

        this.weatherDisplay.innerHTML = `

        <section id = "weatherCardHeader">
            <slot name = "noJS"></slot>
            <span id = "weaterTitleBox">
                <img id = "currentWeatherIcon" alt = "today's weather icon">
                <div >
                    <h2>San Diego</h2>
                    <date></date>
                </div>
                
            </span>
            <div>
                <progress id="humidityBar" max="100" value="0"></progress>
                <p id="humidityText"></p>

            </div>
        </section>

        <h2 id = "currentDegrees"></h2>
        <p id = "currentShortForecast"></p>

        <section id = "extraWeatherInfo">
            <p id = "humidity"></p>
            <p id = "windSpeed"></p>
        <section>

        <section id = "weeklyForecastGrid"></section>
        `

        this.shadowStyle = document.createElement("style");
        this.shadowStyle.textContent = `


            div:first-child  {
                max-width: 800px;
                margin: auto;
                font-family: var(--font-family-base);
                padding: 2rem;
                border-radius: 20px;
                box-shadow: 1px 1px 5px lightgrey;
            }

            div * {
                margin: 0;
            }

            section#weatherCardHeader {
                display: flex;
                flex-direction: row;
                justify-content: space-between;
            }

            #weaterTitleBox {
                display: flex;
                & date {
                    color: grey;
                }
                & h2, date{
                    margin: 0 20px 0 20px;
                }

                & img#currentWeatherIcon {
                    width: 24px;
                    height: 24px;
                    background: rgb(150, 190, 250);
                    padding: 12px;
                    border-radius: 8px;
                }
            }

            progress {
                width: 120px;
                position: relative;
                -webkit-appearance: none;     
            }

            progress::-webkit-progress-bar {
                background-color:rgb(200, 220, 0);
                height: 10px;
                border-radius: 20px
            }

            progress::-webkit-progress-value {
                border-radius: 20px;
                background-color:  rgb(150, 200, 0);
            }

            #humidityText {
                font-size: 0.7rem;
                color: grey;
            }

            #currentDegrees {
                margin-top: 1rem;
                font-size: 2rem;
                font-weight: 300;
            }

            #currentShortForecast {
                color: grey;
            }

            #weeklyForecastGrid {
                display: flex;
                flex-direction: row;
                justify-content: space-between;
                margin-top: 2rem;
            }

            #weeklyForecastGrid #weekDayForecastCard{
                
                display: flex;
                flex-direction: column;
                text-align: center;
                justify-content: center;

                & img#weeklyWeatherIcon {
                    width: 24px;
                    height: 24px;
                    padding: 12px;
                }

                & p#weekDayName{
                    color: grey;
                }

                & p#degrees {
                    padding-left: 8px;
                }

                    
            } 
        `
        this.shadowRoot.appendChild(this.weatherDisplay);
        this.shadowRoot.appendChild(this.shadowStyle);
        
        this.currentWeatherIcon = this.shadowRoot.querySelector('#currentWeatherIcon');

        this.degrees = this.shadowRoot.querySelector('#currentDegrees');
        this.shortForecast = this.shadowRoot.querySelector('#currentShortForecast');
        this.date = this.shadowRoot.querySelector('date');
        this.humidityBar = this.shadowRoot.querySelector('progress');
        this.humidityText = this.shadowRoot.querySelector('#humidityText');

        this.weeklyForecastGrid = this.shadowRoot.querySelector('#weeklyForecastGrid');
    }

    connectedCallback() {
        fetch('https://api.weather.gov/points/32.841991,-117.273018')
            .then(response => {
                if(!response.ok) {
                    throw new Error('network response was not ok')
                }
                return response.json();
            })
            .then(data => {
                console.log(data)
                this.fetchForecast(data.properties)
            })
            .catch(error => {
				console.error('Fetch error:', error);
			});

    }

    fetchForecast(props) {
        fetch(props['forecast'])
        .then(response => {
            if(!response.ok) {
                throw new Error('network response was not ok')
            }
            return response.json();
        })
        .then(data => {
            console.log(data)
            this.updateContent(data.properties)
        })
        .catch(error => {
            console.error('Fetch error:', error);
        });
    }

    updateContent(data) {

        const dayNameMapping = {
            'Sunday': 'Sun',
            'Monday': 'Mon',
            'Tuesday': 'Tue',
            'Wednesday': 'Wed',
            'Thursday': 'Thu',
            'Friday': 'Fri',
            'Saturday': 'Sat'
        };

        // Current date
        const currentDate = new Date();
        const options = {  month: 'short', day: '2-digit', year: 'numeric' };
        const formattedDate = currentDate.toLocaleDateString('en-US', options);
        this.date.textContent = formattedDate;

        

        // periods is an array of forecasts over a 7 day period
        const weeklyForecast = Array.from(data["periods"]);
        const currentForecast = Array.from(data["periods"])[0];

        // choose an icon for today's weather
        const currentWeatherIcon = this.renderIcon(currentForecast["detailedForecast"]);
        this.currentWeatherIcon.setAttribute("src", currentWeatherIcon);

        this.degrees.textContent = `${currentForecast["temperature"]}° F`
        this.shortForecast.textContent = `${currentForecast["shortForecast"]}`

        this.humidityBar.setAttribute("value", currentForecast["relativeHumidity"]["value"])
        this.humidityText.textContent = `Humidity: ${currentForecast["relativeHumidity"]["value"]}%`;



        // Create the weekly forecast for this week
        weeklyForecast.forEach((day, index) => {

            if (index % 2 == 0 && index != 0) {

                const weekForecastCard = document.createElement('span');
                const weeklyWeatherIcon = this.renderIcon(day["detailedForecast"]);
                console.log(day["detailedForecast"])
                weekForecastCard.innerHTML = `
                    <span id = "weekDayForecastCard">
                        <p id = "weekDayName">${dayNameMapping[day.name]}</p>
                        <img id = "weeklyWeatherIcon" src = ${weeklyWeatherIcon} alt = "icon of weather condition">

                        <p id = "degrees">${day.temperature}°</p>
                        
                    </span> 
                `
                this.weeklyForecastGrid.appendChild(weekForecastCard)
            }
        })
    }


    // Chooses an appropriate icon based on weather description
    renderIcon(weather) {
        
        console.log(weather)
        let weatherIcon = "./icons/cloudy.png";


        if(weather.toLowerCase().includes("sunny") || weather.toLowerCase().includes("mostly sunny")) {
            weatherIcon = "./icons/sunny.png";
        }
        
        if (weather.toLowerCase().includes("partly sunny") || (weather.toLowerCase().includes("partly cloudy"))) {
            weatherIcon = "./icons/partly-cloudy.png";
        }
        if (weather.toLowerCase().includes("cloudy")) {
            weatherIcon = "./icons/cloudy.png";
        }
        if (weather.toLowerCase().includes("rainy")) {
            weatherIcon = "./icons/rainy.png";
        }
        if (weather.toLowerCase().includes("fog")) {
            weatherIcon = "./icons/foggy.png";
        }

        return weatherIcon;

       
    }
}

customElements.define('weather-widget', WeatherWidget);