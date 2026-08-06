import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type WeatherData = {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  current: {
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    precipitation: number;
    weather_code: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    precipitation_probability: number[];
    weather_code: number[];
    wind_speed_10m: number[];
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weather_code: number[];
  };
};

const presets = ["Lucknow", "Mumbai", "Delhi"];

function weatherLabel(code: number) {
  if (code === 0) return "Clear sky";
  if (code <= 3) return "Partly cloudy";
  if (code <= 48) return "Cloudy";
  if (code <= 67) return "Rain showers";
  if (code <= 77) return "Snow showers";
  if (code <= 82) return "Rain showers";
  if (code <= 99) return "Thunderstorms";
  return "Mixed conditions";
}

function weatherGlyph(code: number) {
  if (code === 0) return "☼";
  if (code <= 3) return "◔";
  if (code <= 48) return "☁";
  if (code <= 77) return "☂";
  return "ϟ";
}

function compass(degrees: number) {
  return ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][
    Math.round(degrees / 45) % 8
  ];
}

function formatDay(date: string, index: number) {
  if (index === 0) return "Today";
  return new Intl.DateTimeFormat("en", { weekday: "short" }).format(
    new Date(`${date}T12:00:00`),
  );
}

export default function App() {
  const [query, setQuery] = useState("Lucknow");
  const [location, setLocation] = useState("Lucknow");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState(new Date());

  const loadWeather = useCallback(async (place: string) => {
    setLoading(true);
    setError("");

    try {
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          place,
        )}&count=1&language=en&format=json`,
      );
      const geo = await geoResponse.json();
      if (!geo.results?.[0]) throw new Error("Location not found");
      const found = geo.results[0];
      const params = new URLSearchParams({
        latitude: found.latitude,
        longitude: found.longitude,
        current:
          "temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_direction_10m",
        hourly:
          "temperature_2m,precipitation_probability,weather_code,wind_speed_10m",
        daily: "temperature_2m_max,temperature_2m_min,weather_code",
        timezone: "auto",
        forecast_days: "7",
      });

      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?${params}`,
      );
      const result = await response.json();
      setWeather({
        ...result,
        city: found.name,
        country: found.country_code,
      });
      setLocation(found.name);
      setUpdatedAt(new Date());
    } catch {
      setError("We couldn’t find that place. Try a city name, like Paris.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWeather("Lucknow");
  }, [loadWeather]);

  const hourly = useMemo(() => {
    if (!weather) return [];
    const now = new Date();
    const start = Math.max(
      0,
      weather.hourly.time.findIndex((time) => new Date(time) >= now),
    );
    return Array.from({ length: 8 }, (_, i) =>
      weather.hourly.time[start + i]
        ? {
            time: weather.hourly.time[start + i],
            temp: Math.round(weather.hourly.temperature_2m[start + i]),
            rain: weather.hourly.precipitation_probability[start + i],
            code: weather.hourly.weather_code[start + i],
            wind: Math.round(weather.hourly.wind_speed_10m[start + i]),
          }
        : null,
    )
      .filter(Boolean)
      .map((item) => item as {
        time: string;
        temp: number;
        rain: number;
        code: number;
        wind: number;
      });
  }, [weather]);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (query.trim()) loadWeather(query.trim());
  }

  const current = weather?.current;

  return (
    <main className="weather-app">
      <nav className="topbar">
        <a className="brand" href="#top" aria-label="Skyline Weather home">
          <span className="brand-mark">◒</span>
          <span>
            skyline<span className="brand-dot">.</span>
          </span>
        </a>
        <div className="nav-label">LIVE WEATHER</div>
        <div className="nav-status">
          <span className="status-dot" /> Updated{' '}
          {updatedAt.toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
          })}
        </div>
      </nav>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">REAL-TIME CONDITIONS</p>
          <h1>
            Know the sky
            <br />
            <em>before you go.</em>
          </h1>
          <p className="lede">
            Accurate, live weather insights for wherever your day takes you.
          </p>
        </div>
        <form className="search" onSubmit={submit}>
          <span>⌕</span>
          <input
            aria-label="Search for a city"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search a city"
          />
          <button type="submit">Search</button>
        </form>
        <div className="presets">
          {presets.map((place) => (
            <button
              key={place}
              onClick={() => {
                setQuery(place);
                loadWeather(place);
              }}
            >
              {place}
            </button>
          ))}
        </div>
      </section>

      {error && <p className="error">{error}</p>}
      <section className="dashboard">
        <div className="location-row">
          <div>
            <p className="eyebrow">CURRENTLY IN</p>
            <h2>
              {location}
              {weather?.country ? <span>, {weather.country}</span> : null}
            </h2>
          </div>
          <div className="coordinates">
            {weather
              ? `${weather.latitude.toFixed(2)}° N · ${Math.abs(
                  weather.longitude,
                ).toFixed(2)}° W`
              : "Locating..."}
          </div>
        </div>
        <div className="primary-grid">
          <article className="current-card">
            <div className="card-top">
              <span>NOW</span>
              <span>
                {current ? weatherLabel(current.weather_code).toUpperCase() : "LOADING"}
              </span>
            </div>
            <div className="temperature">
              {loading || !current ? "—" : Math.round(current.temperature_2m)}
              <sup>°</sup>
            </div>
            <div className="condition-line">
              <span className="big-glyph">{current ? weatherGlyph(current.weather_code) : "◌"}</span>
              <span>
                Feels like {current ? Math.round(current.apparent_temperature) : "—"}°
              </span>
            </div>
            <div className="card-footer">
              <span>H {weather ? Math.round(weather.daily.temperature_2m_max[0]) : "—"}°</span>
              <span>L {weather ? Math.round(weather.daily.temperature_2m_min[0]) : "—"}°</span>
            </div>
          </article>
          <article className="wind-card">
            <div className="card-top">
              <span>WIND</span>
              <span>LIVE</span>
            </div>
            <div className="wind-reading">
              <strong>{current ? Math.round(current.wind_speed_10m) : "—"}</strong>
              <span>km/h</span>
            </div>
            <div className="wind-direction">
              <span className="direction-arrow" style={{ transform: `rotate(${current?.wind_direction_10m ?? 0}deg)` }}>
                ↑
              </span>
              <div>
                <strong>{current ? compass(current.wind_direction_10m) : "—"}</strong>
                <span>{current ? `${Math.round(current.wind_direction_10m)}° direction` : "Reading..."}</span>
              </div>
            </div>
            <div className="wind-scale">
              <span>CALM</span>
              <div className="scale-line"><i /></div>
              <span>GALE</span>
            </div>
          </article>
        </div>
        <div className="metrics">
          <div>
            <span>HUMIDITY</span>
            <strong>
              {current ? current.relative_humidity_2m : "—"}
              <small>%</small>
            </strong>
          </div>
          <div>
            <span>PRECIPITATION</span>
            <strong>
              {current ? current.precipitation.toFixed(1) : "—"}
              <small> mm</small>
            </strong>
          </div>
          <div>
            <span>VISIBILITY</span>
            <strong>10<small> km</small></strong>
          </div>
          <div>
            <span>PRESSURE</span>
            <strong>1013<small> hPa</small></strong>
          </div>
        </div>
        <div className="section-heading">
          <div>
            <p className="eyebrow">NEXT 8 HOURS</p>
            <h3>Hourly outlook</h3>
          </div>
          <span className="muted">Local time</span>
        </div>
        <div className="hourly-row">
          {hourly.length ? (
            hourly.map((hour) => (
              <div className="hour" key={hour.time}>
                <span>{new Date(hour.time).toLocaleTimeString([], { hour: "numeric" })}</span>
                <b>{weatherGlyph(hour.code)}</b>
                <strong>{hour.temp}°</strong>
                <small>☂ {hour.rain}%</small>
                <small>↗ {hour.wind} km/h</small>
              </div>
            ))
          ) : (
            <div className="loading-copy">Loading the latest forecast…</div>
          )}
        </div>
        <div className="section-heading forecast-heading">
          <div>
            <p className="eyebrow">THE WEEK AHEAD</p>
            <h3>7-day forecast</h3>
          </div>
        </div>
        <div className="daily-row">
          {weather?.daily.time.map((day, index) => (
            <div className="day" key={day}>
              <strong>{formatDay(day, index)}</strong>
              <span className="day-glyph">{weatherGlyph(weather.daily.weather_code[index])}</span>
              <div>
                <b>{Math.round(weather.daily.temperature_2m_max[index])}°</b>
                <span>{Math.round(weather.daily.temperature_2m_min[index])}°</span>
              </div>
              <small>{weatherLabel(weather.daily.weather_code[index])}</small>
            </div>
          ))}
        </div>
      </section>
      <footer>
        <span>SKYLINE WEATHER</span>
        <span>Live data powered by Open-Meteo · Refreshes on search</span>
      </footer>
    </main>
  );
}
