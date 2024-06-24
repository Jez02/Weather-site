import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './weather.css';

const getWeatherEmoji = (weatherCondition) => {
    switch (weatherCondition.toLowerCase()) {
        case 'clear':
            return ' ☀️';
        case 'clouds':
            return ' ☁️';
        case 'rain':
            return ' 🌧️';
        case 'drizzle':
            return ' 🌦️';
        case 'mist':
            return ' 🌫️';
        case 'fog':
            return ' 🌫️';
        case 'snow':
            return ' ❄️';
        default:
            return '';
    }
};

const getTemperatureEmoji = (temperature) => {
    if (temperature < 0) {
        return ' 🥶';
    } else if (temperature > 30) {
        return ' 🔥'; 
    } else {
        return ' 🌡️'; 
    }
};

const Weather = () => {
    const [city, setCity] = useState('');
    const [weatherData, setWeatherData] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [timezone, setTimezone] = useState('');
    const [backgroundImage, setBackgroundImage] = useState('images/clear1.gif');

    const apiKey = '49a4112d9dd85c83a967e67fee3df7fd';
    const googleMapsApiKey = 'AIzaSyCZcMEtwBEWG6AxW4cF6be7zSU_0cfNc6Y';

    const [futureWeatherData, setFutureWeatherData] = useState(null);

    const getWeatherData = async () => {
        try {
            if (!city) {
                alert('Please enter a city name.');
                return;
            }

            // Fetch current weather data
            const currentWeatherResponse = await axios.get(
                `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}`
            );

            if (currentWeatherResponse.status !== 200) {
                throw new Error(`Failed to fetch current weather data. Status: ${currentWeatherResponse.status}`);
            }

            setWeatherData(currentWeatherResponse.data);

            if (currentWeatherResponse.data.timezone) {
                console.log('Timezone:', currentWeatherResponse.data.timezone);
                setTimezone(currentWeatherResponse.data.timezone);
            }

            const weatherCondition = currentWeatherResponse.data.weather[0].main.toLowerCase();
            setBackgroundImage(getBackgroundImage(weatherCondition));

            // Fetch 16-day daily forecast data
            const dailyForecastResponse = await axios.get(
                `https://api.openweathermap.org/data/2.5/forecast/daily?q=${encodeURIComponent(city)}&cnt=16&appid=${apiKey}`
            );

            if (dailyForecastResponse.status !== 200) {
                throw new Error(`Failed to fetch 16-day daily forecast data. Status: ${dailyForecastResponse.status}`);
            }

            setFutureWeatherData(dailyForecastResponse.data);
        } catch (error) {
            console.error('Error fetching weather data:', error.message);
        }
    };

    const getBackgroundImage = (weatherCondition) => {
        switch (weatherCondition) {
            case 'clear':
                return 'images/clear1.gif';
            case 'clouds':
                return 'images/cloudy1.gif';
            case 'rain':
                return 'images/rain.gif';
            case 'drizzle':
                return 'images/driz.gif';
            case 'mist':
                return 'images/mist.gif';
            case 'fog':
                return 'images/mist.gif';
            case 'snow':
                return 'images/snow.gif';
            default:
                return 'images/BK.jpeg';
        }
    };

    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        setTimezone('');

        if (city) {
            getWeatherData();
        }
    }, [city]);

    const getLocalTime = () => {
        if (timezone) {
            const offsetInMilliseconds = timezone * 1000; // Convert seconds to milliseconds

            const localTime = new Date(currentTime.getTime() + offsetInMilliseconds);

            const year = localTime.getFullYear();
            const month = String(localTime.getMonth() + 1).padStart(2, '0');
            const day = String(localTime.getDate()).padStart(2, '0');
            const hours = String(localTime.getHours()).padStart(2, '0');
            const minutes = String(localTime.getMinutes()).padStart(2, '0');
            const seconds = String(localTime.getSeconds()).padStart(2, '0');

            return (
                <div>
                    <strong>Date:</strong> {day}-{month}-{year}
                    <br />
                    <strong>Time:</strong> {hours} hr {minutes} min {seconds} sec
                </div>
            );
        }

        const currentYear = currentTime.getFullYear();
        const currentMonth = String(currentTime.getMonth() + 1).padStart(2, '0');
        const currentDay = String(currentTime.getDate()).padStart(2, '0');

        return (
            <div>
                <strong>Date:</strong> {currentDay}-{currentMonth}-{currentYear} 
                <br />
                <strong>Time:</strong> {currentTime.getHours()} hr {currentTime.getMinutes()} min{' '} {currentTime.getSeconds()} sec
            </div>
        );
    };

    return (
        <div className="weather-box" style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
        }}>
            <div className="weather-container">
                <h1>Weather And Time</h1>
                <div>
                    {weatherData ? (
                        <p>
                            Current Date and Time In <strong>{weatherData.name}:</strong> {getLocalTime()}
                        </p>
                    ) : (
                        city && !weatherData ? (
                            <p>Loading...</p>
                        ) : (
                            <p>Enter a city to get the time and weather information</p>
                        )
                    )}
                </div>

                <input
                    type="text"
                    placeholder="Enter city name"
                    value={city}
                    onChange={(e) => {
                        setCity(e.target.value);
                        setWeatherData(null);
                    }}
                />
                <br></br>
                <button className="get-weather-button" onClick={getWeatherData}>
                    Get Weather and Time
                </button>

                {weatherData && (
                    <div className="info">
                        <h2>
                            <strong>{weatherData.name}</strong>
                        </h2>
                        <p>
                            {weatherData.weather[0].description} {getWeatherEmoji(weatherData.weather[0].main)}
                        </p>
                        {weatherData.main && (
                            <p>
                                Temperature: {(weatherData.main.temp - 273.15).toFixed(2)} °C
                                {getTemperatureEmoji(weatherData.main.temp - 273.15)}
                            </p>
                        )}
                    </div>
                )}

                {futureWeatherData && (
                    <div>
                        <h2>Future Weather</h2>
                        {futureWeatherData.daily.map((day, index) => (
                            <div key={index}>
                                <p>Date: {new Date(day.dt * 1000).toLocaleDateString()}</p>
                                <p>Temperature: {day.temp.day.toFixed(2)} °C</p>
                                <p>{day.weather[0].description} {getWeatherEmoji(day.weather[0].main)}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Weather;
