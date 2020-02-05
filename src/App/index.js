import React, { useState } from "react";
import ky from "ky";

import "./styles.css";

function formatBytes(a, b) {
  if (0 == a) return "0 Bytes";
  var c = 1024,
    d = b || 2,
    e = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
    f = Math.floor(Math.log(a) / Math.log(c));
  return parseFloat((a / Math.pow(c, f)).toFixed(d)) + " " + e[f];
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const KB_COST = 0.000244;

function App() {
  const [url, setUrl] = useState("");
  const [{ data, loading }, setResponse] = useState({
    loading: false,
    data: null
  });

  function handleChange({ target: { value } }) {
    setUrl(value);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setResponse({ data: null, loading: true });

    const response = await ky
      .get(`/api/site-size?url=${url}`, { timeout: false })
      .json();

    setResponse({ data: response, loading: false });
  }

  return (
    <div className="App">
      <h1>
        <span role="img" aria-label="Fire">
          🔥
        </span>{" "}
        Cuánto dinero quema tu página{" "}
        <span role="img" aria-label="Fire">
          🔥
        </span>
      </h1>
      <p>Costo del KB: ${KB_COST}</p>
      <form onSubmit={handleSubmit}>
        <label htmlFor="url">
          Sitio web (url):
          <input
            id="url"
            name="url"
            onChange={handleChange}
            type="text"
            value={url}
          />
        </label>
        <input type="submit" value="Quemar" />
      </form>
      {loading && "Cargando..."}
      {data && data.bytes && (
        <>
          <p>
            Con una página de <strong>{formatBytes(data.bytes)}</strong>
          </p>
          <p>
            Quemas (o regalas a Slim){" "}
            <strong>
              $
              {Number(
                (data.bytes / 1000) * (KB_COST * 1000 * 365)
              ).toLocaleString()}
            </strong>{" "}
            al año*
          </p>
          <br />
          <p>*considerando 2000 visitas diarias</p>
        </>
      )}
    </div>
  );
}

export default App;
