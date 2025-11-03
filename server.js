const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/convert", (req, res) => {
  const { type, from, to, value } = req.body;

  if (!type || !from || !to || value === undefined) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  let result;

  switch (type) {
    case "temperature":
      result = convertTemperature(from, to, value);
      break;

    case "length":
      result = convertLength(from, to, value);
      break;

    case "weight":
      result = convertWeight(from, to, value);
      break;

    default:
      return res.status(400).json({ error: "Unsupported conversion type" });
  }

  if (result === null) {
    return res.status(400).json({ error: "Invalid unit conversion" });
  }

  res.json({
    type,
    from,
    to,
    value,
    result,
    timestamp: new Date().toISOString()
  });
});


// 🌡️ Temperature conversions
function convertTemperature(from, to, value) {
  let result = null;
  if (from === "c" && to === "f") result = (value * 9 / 5) + 32;
  else if (from === "f" && to === "c") result = (value - 32) * 5 / 9;
  else if (from === "c" && to === "k") result = value + 273.15;
  else if (from === "k" && to === "c") result = value - 273.15;
  else if (from === "f" && to === "k") result = (value - 32) * 5 / 9 + 273.15;
  else if (from === "k" && to === "f") result = (value - 273.15) * 9 / 5 + 32;
  else if (from === to) result = value;
  return result;
}


// 📏 Length conversions (convert everything to meters first)
function convertLength(from, to, value) {
  const toMeters = {
    mm: 0.001,
    cm: 0.01,
    m: 1,
    km: 1000,
    in: 0.0254,
    ft: 0.3048,
    yd: 0.9144,
    mi: 1609.34
  };

  if (!toMeters[from] || !toMeters[to]) return null;

  const valueInMeters = value * toMeters[from];
  return valueInMeters / toMeters[to];
}


// ⚖️ Weight conversions (convert everything to kilograms first)
function convertWeight(from, to, value) {
  const toKilograms = {
    mg: 0.000001,
    g: 0.001,
    kg: 1,
    oz: 0.0283495,
    lb: 0.453592
  };

  if (!toKilograms[from] || !toKilograms[to]) return null;

  const valueInKg = value * toKilograms[from];
  return valueInKg / toKilograms[to];
}


// Start server
const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
