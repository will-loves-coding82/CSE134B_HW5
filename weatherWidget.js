class WeatherWidget extends HTMLElement {

    constructor() {
        super();
        // Create a shadow root to encapsulate styles.
		this.attachShadow({ mode: 'open' });

        this.weatherDisplay = document.createElement('div');

        this.weatherDisplay.innerHTML = `

        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />

        <section id = "weatherCardHeader">
            <span id = "weaterTitleBox">
                <span class="material-symbols-outlined">cloud</span>

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
            }

            progress {
                width: 120px;
                position: relative;
                -webkit-appearance: none;     
            }

            progress::-webkit-progress-bar {
                background-color: lightgreen;
                height: 10px;
                border-radius: 20px
            }

            progress::-webkit-progress-value {
                border-radius: 20px;
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

            #weaterTitleBox .material-symbols-outlined {
                background-color: rgb(100, 190, 220);
                padding: 12px;
                border-radius: 10px;
                height: 24px;

                margin-top: 4px;
                font-variation-settings:
                'FILL' 0,
                'wght' 400,
                'GRAD' 0,
                'opsz' 24
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

                & p#weekDayName{
                    color: grey;
                }

                & p#degrees {
                    padding-left: 8px;
                }

                & .material-symbols-outlined {
                    margin-top: 0.5rem;
                    color: grey;
                    font-variation-settings:
                    'FILL' 1;
                }        
            } 
        `
        this.shadowRoot.appendChild(this.weatherDisplay);
        this.shadowRoot.appendChild(this.shadowStyle);

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

        this.degrees.textContent = `${currentForecast["temperature"]}° F`
        this.shortForecast.textContent = `${currentForecast["shortForecast"]}`

        this.humidityBar.setAttribute("value", currentForecast["relativeHumidity"]["value"])
        this.humidityText.textContent = `Humidity: ${currentForecast["relativeHumidity"]["value"]}%`;

        // Create the weekly forecast for this week
        weeklyForecast.forEach((day, index) => {

            if (index % 2 == 0 && index != 0) {

                const weekForecastCard = document.createElement('span');
                weekForecastCard.innerHTML = `
                    <span id = "weekDayForecastCard">
                        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
                        <p id = "weekDayName">${dayNameMapping[day.name]}</p>
                        <span class="material-symbols-outlined">cloud</span>

                        <p id = "degrees">${day.temperature}°</p>
                        
                    </span> 
                `
                this.weeklyForecastGrid.appendChild(weekForecastCard)
            }
        })
    }
}

customElements.define('weather-widget', WeatherWidget);