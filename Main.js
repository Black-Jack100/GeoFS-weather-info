(function () {
    'use strict';

    // Prevent multiple loads
    if (window.geofsWeatherApp) {
        console.log('GeoFS Weather App already loaded!');
        return;
    }

    // UI Creation Functions
    function createWeatherUI() {
        const weatherDiv = document.createElement('div');
        weatherDiv.id = 'geofs-weather-app';
        weatherDiv.innerHTML = `
            <style>
                #geofs-weather-app {
                    position: fixed; top: 10px; right: 10px; width: 240px;
                    background: rgba(30, 41, 59, 0.7); color: white;
                    border-radius: 12px; padding: 16px;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.3); backdrop-filter: blur(10px);
                    border: 1px solid rgba(255,255,255,0.1); z-index: 10000;
                    font-size: 13px; max-height: 90vh; overflow-y: auto;
                }
                #geofs-weather-app h1 { margin: 0 0 10px 0; font-size: 18px; font-weight: bold; text-align: center; color: #60a5fa; }
                #geofs-weather-app .subtitle { text-align: center; color: #94a3b8; margin-bottom: 12px; font-size: 11px; }
                #geofs-weather-app input {
                    width: 100%; background: rgba(55,65,81,0.8); border: 1px solid #4b5563;
                    color: white; border-radius: 6px; padding: 6px 10px; margin-bottom: 8px;
                    box-sizing: border-box; text-transform: uppercase;
                }
                #geofs-weather-app input:focus {
                    outline: none; border-color: #60a5fa; box-shadow: 0 0 0 2px rgba(96,165,250,0.2);
                }
                #geofs-weather-app button {
                    width: 100%; background: #3b82f6; color: white; border: none; border-radius: 6px;
                    padding: 8px; font-weight: bold; cursor: pointer; transition: background-color 0.3s; margin-bottom: 8px;
                }
                #geofs-weather-app button:hover { background: #2563eb; }
                #geofs-weather-app .close-btn {
                    position: absolute; top: 5px; right: 10px; background: none; color: #94a3b8;
                    border: none; font-size: 18px; width: auto; padding: 0; cursor: pointer; margin: 0;
                }
                #geofs-weather-app .close-btn:hover { color: white; background: none; }
                .weather-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin: 12px 0; }
                .weather-item { background: rgba(75,85,99,0.5); padding: 8px; border-radius: 6px; }
                .weather-item.full-width { grid-column: span 2; }
                .weather-item .label { font-size: 10px; color: #9ca3af; margin-bottom: 2px; }
                .weather-item .value { font-weight: bold; font-size: 13px; color: white; }
                .weather-item .value.small { font-size: 11px; }
                .loader {
                    border: 2px solid rgba(255,255,255,0.3); border-radius: 50%;
                    border-top: 2px solid #60a5fa; width: 18px; height: 18px;
                    animation: spin 1s linear infinite; margin: 8px auto;
                }
                @keyframes spin { 0%{transform:rotate(0deg);} 100%{transform:rotate(360deg);} }
                .error {
                    background: rgba(239,68,68,0.2); border: 1px solid #ef4444; padding: 8px;
                    border-radius: 6px; margin: 8px 0; text-align: center; color: #fca5a5;
                }
                .success {
                    background: rgba(34,197,94,0.2); border: 1px solid #22c55e; padding: 8px;
                    border-radius: 6px; margin: 8px 0; text-align: center; color: #86efac;
                }
                .code-section {
                    background: rgba(0,0,0,0.3); border-radius: 6px; padding: 8px;
                    margin: 8px 0; font-family: monospace; font-size: 10px; color: #a3e635;
                    max-height: 120px; overflow-y: auto; white-space: pre-wrap; word-wrap: break-word;
                }
                .toggle-btn {
                    position: fixed; top: 10px; left: 10px; background: rgba(30,41,59,0.7);
                    color: white; border: none; border-radius: 6px; padding: 7px 10px;
                    font-size: 12px; cursor: pointer; z-index: 10001;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }
                .hidden { display: none !important; }
            </style>
            <button class="close-btn" onclick="window.geofsWeatherApp.hide()">&times;</button>
            <h1>GeoFS Weather</h1>
            <p class="subtitle">Enter ICAO code for METAR data</p>
            <input type="text" id="weather-icao" placeholder="e.g., KLAX" maxlength="4" value="CYVR">
            <button onclick="window.geofsWeatherApp.fetchWeather()">Get METAR</button>
            <div id="weather-loader" class="hidden"><div class="loader"></div></div>
            <div id="weather-error" class="error hidden"><span id="error-text"></span></div>
            <div id="weather-data" class="hidden">
                <div class="weather-grid">
                    <div class="weather-item"><div class="label">Temperature</div><div class="value" id="temp-display">-</div></div>
                    <div class="weather-item"><div class="label">Dew Point</div><div class="value" id="dewp-display">-</div></div>
                    <div class="weather-item full-width"><div class="label">Wind</div><div class="value" id="wind-display">-</div></div>
                    <div class="weather-item"><div class="label">Pressure</div><div class="value" id="pressure-display">-</div></div>
                    <div class="weather-item"><div class="label">Visibility</div><div class="value" id="visibility-display">-</div></div>
                    <div class="weather-item full-width"><div class="label">Clouds</div><div class="value small" id="clouds-display">-</div></div>
                    <div class="weather-item full-width"><div class="label">Weather</div><div class="value small" id="weather-display">-</div></div>
                </div>
                <div id="success-message" class="success hidden">Weather applied to GeoFS successfully!</div>
            </div>
        `;
        document.body.appendChild(weatherDiv);
        return weatherDiv;
    }

    function createToggleButton() {
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'toggle-btn';
        toggleBtn.textContent = 'Weather🌨';
        toggleBtn.onclick = () => window.geofsWeatherApp.toggle();
        document.body.appendChild(toggleBtn);
        return toggleBtn;
    }

    // Main Weather App Class
    class GeoFSWeatherApp {
        constructor() {
            this.ui = createWeatherUI();
            this.toggleBtn = createToggleButton();
            this.lastMetarData = null;
            this.setupEventListeners();
            console.log('GeoFS Weather App loaded! Create by blackjack100');
        }

        setupEventListeners() {
            const icaoInput = document.getElementById('weather-icao');
            icaoInput.addEventListener('keyup', (e) => {
                e.stopPropagation();
                e.target.value = e.target.value.toUpperCase();
                if (e.key === 'Enter') this.fetchWeather();
            });
            ['keydown', 'keypress'].forEach(evt =>
                icaoInput.addEventListener(evt, e => e.stopPropagation())
            );
        }

        show() {
            this.ui.classList.remove('hidden');
            this.toggleBtn.style.display = 'none';
        }

        hide() {
            this.ui.classList.add('hidden');
            this.toggleBtn.style.display = 'block';
        }

        toggle() {
            this.ui.classList.contains('hidden') ? this.show() : this.hide();
        }

        async fetchWeather() {
            const icaoInput = document.getElementById('weather-icao');
            const icao = icaoInput.value.trim().toUpperCase();
            if (!icao || !/^[A-Z0-9]{3,4}$/.test(icao)) {
                this.displayError("Please enter a valid airport code.");
                return;
            }

            const loader = document.getElementById('weather-loader');
            const errorDiv = document.getElementById('weather-error');
            const dataDiv = document.getElementById('weather-data');
            const successDiv = document.getElementById('success-message');

            loader.classList.remove('hidden');
            errorDiv.classList.add('hidden');
            dataDiv.classList.add('hidden');
            successDiv.classList.add('hidden');

            const apiUrl = `https://aviationweather.gov/api/data/metar?ids=${icao}&format=json`;

            try {
                const response = await fetch(apiUrl);
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                const data = await response.json();
                if (data.length === 0) throw new Error(`No METAR data found for ${icao}. Check the airport code.`);
                this.lastMetarData = data[0];
                this.updateWeatherDisplay(this.lastMetarData);
                this.applyToGeoFS();
                dataDiv.classList.remove('hidden');
            } catch (error) {
                console.error("Failed to fetch METAR:", error);
                this.displayError(error.message || "Could not retrieve weather data.");
            } finally {
                loader.classList.add('hidden');
            }
        }

        displayError(message) {
            document.getElementById('error-text').textContent = message;
            document.getElementById('weather-error').classList.remove('hidden');
        }

        updateWeatherDisplay(metar) {
            // Temperature
            const tempC = metar.temp, tempF = (tempC * 9 / 5 + 32).toFixed(1);
            document.getElementById('temp-display').textContent = `${tempC.toFixed(1)}°C / ${tempF}°F`;
            // Dew Point
            const dewpC = metar.dewp, dewpF = (dewpC * 9 / 5 + 32).toFixed(1);
            document.getElementById('dewp-display').textContent = `${dewpC.toFixed(1)}°C / ${dewpF}°F`;
            // Wind
            const windSpeed = metar.wspd ?? 0;
            const windDir = metar.wdir ? metar.wdir.toString().padStart(3, '0') : '000';
            document.getElementById('wind-display').textContent = `${windDir}° @ ${windSpeed} kts`;
            // Pressure
            const pressureHpa = metar.altim;
            const pressureInHg = (pressureHpa / 33.863886666667).toFixed(2);
            document.getElementById('pressure-display').textContent = `${pressureInHg} inHg`;
            // Visibility
            document.getElementById('visibility-display').textContent = `${metar.visib} SM`;
            // Clouds
            const cloudLayers = metar.rawOb.match(/(SKC|CLR|FEW\d{3}|SCT\d{3}|BKN\d{3}|OVC\d{3})/g);
            document.getElementById('clouds-display').textContent = cloudLayers ? cloudLayers.join(' ') : 'Clear';
            // Weather description
            document.getElementById('weather-display').textContent = metar.wxString || 'No Significant Weather';
        }

        applyToGeoFS() {
            if (!this.lastMetarData) return;
            try {
                const metar = this.lastMetarData;
                // Humidity
                const tempC = metar.temp, dewpC = metar.dewp;
                const humidity = 100 * (Math.exp((17.625 * dewpC) / (243.04 + dewpC)) / Math.exp((17.625 * tempC) / (243.04 + tempC)));
                // Clouds
                const clouds = [];
                const cloudLayers = metar.rawOb.match(/(FEW|SCT|BKN|OVC)(\d{3})/g) || [];
                const densityMap = { FEW: 0.2, SCT: 0.4, BKN: 0.7, OVC: 1.0 };
                for (const layer of cloudLayers) {
                    const type = layer.substring(0, 3);
                    const baseFt = parseInt(layer.substring(3)) * 100;
                    const baseMeters = baseFt * 0.3048;
                    const thickness = (type === 'BKN' || type === 'OVC') ? 600 : 300;
                    clouds.push({
                        baseMetersAGL: Math.round(baseMeters),
                        topMetersAGL: Math.round(baseMeters + thickness),
                        density: densityMap[type]
                    });
                }
                // Weather object for GeoFS
                const weatherObject = {
                    windSpeedKts: metar.wspd ?? 0,
                    windDirectionDeg: metar.wdir ?? 0,
                    temperatureC: metar.temp,
                    mslPresPa: metar.altim * 100,
                    humidity: Math.round(humidity * 100) / 100,
                    visibilityMeters: metar.visib * 1609.34,
                    clouds, precipitation: "none"
                };
                // Apply to GeoFS
                if (typeof geofs !== 'undefined' && geofs.api?.setWeather) {
                    geofs.api.setWeather(weatherObject);
                    console.log('Weather info applied to GeoFS:', weatherObject);
                }
            } catch (error) {
                console.error('Error applying weather info to GeoFS:', error);
            }
        }

        remove() {
            this.ui?.remove();
            this.toggleBtn?.remove();
            delete window.geofsWeatherApp;
            console.log('GeoFS Weather App removed');
        }
    }

    // Initialize and auto-fetch
    window.geofsWeatherApp = new GeoFSWeatherApp();
    setTimeout(() => window.geofsWeatherApp.fetchWeather(), 1000);

})();
