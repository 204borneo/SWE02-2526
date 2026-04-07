// Classwork 02 - Bjorni Pasha
// Currency Exchange using RapidAPI (currency-conversion-and-exchange-rates)

const API_KEY = "a4f0285db0msh4bf275306cb1060p1a5d17jsnfd7b9ceabf7e"; // 🔑 Replace with your RapidAPI key
const API_HOST = "currency-conversion-and-exchange-rates.p.rapidapi.com";

const currencies = [
  "USD", "EUR", "GBP", "JPY", "CAD", "AUD", "CHF", "CNY",
  "SEK", "NOK", "DKK", "NZD", "SGD", "HKD", "KRW", "INR",
  "BRL", "MXN", "ZAR", "TRY", "RUB", "AED", "SAR", "PLN",
  "THB", "IDR", "HUF", "CZK", "ILS", "PHP", "MYR", "RON"
];

function populateDropdowns() {
  const fromSelect = document.getElementById("from");
  const toSelect = document.getElementById("to");

  currencies.forEach(code => {
    fromSelect.innerHTML += `<option value="${code}">${code}</option>`;
    toSelect.innerHTML += `<option value="${code}">${code}</option>`;
  });

  fromSelect.value = "USD";
  toSelect.value = "EUR";

  // Set date input to today by default
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("date").value = today;
  document.getElementById("date").max = today; // Can't pick future dates
}

async function convertCurrency() {
  const amount = parseFloat(document.getElementById("amount").value);
  const from = document.getElementById("from").value;
  const to = document.getElementById("to").value;
  const selectedDate = document.getElementById("date").value;

  const resultDiv = document.getElementById("result");
  const errorDiv = document.getElementById("error");
  const spinner = document.getElementById("spinner");
  const btn = document.getElementById("convertBtn");

  // Reset UI
  resultDiv.style.display = "none";
  errorDiv.style.display = "none";

  if (!amount || amount <= 0) {
    errorDiv.textContent = "Please enter a valid amount greater than 0.";
    errorDiv.style.display = "block";
    return;
  }

  if (from === to) {
    document.getElementById("outputAmount").textContent = `${amount.toFixed(2)} ${to}`;
    document.getElementById("rateInfo").textContent = `1 ${from} = 1 ${to}`;
    resultDiv.style.display = "block";
    return;
  }

  spinner.style.display = "block";
  btn.disabled = true;

  try {
    const today = new Date().toISOString().split("T")[0];
    const isToday = selectedDate === today;

    let url;

    if (isToday) {
      // Live conversion endpoint
      url = `https://${API_HOST}/convert?from=${from}&to=${to}&amount=${amount}`;
    } else {
      // Historical rates endpoint
      url = `https://${API_HOST}/${selectedDate}?base=${from}&symbols=${to}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-rapidapi-key": API_KEY,
        "x-rapidapi-host": API_HOST
      }
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    let convertedAmount, rate;

    if (isToday) {
      if (data.result === undefined) throw new Error("Unexpected response. Check your API key.");
      convertedAmount = data.result.toFixed(2);
      rate = (data.result / amount).toFixed(6);
    } else {
      if (!data.rates || !data.rates[to]) throw new Error("No historical data for this date/currency.");
      rate = data.rates[to].toFixed(6);
      convertedAmount = (amount * data.rates[to]).toFixed(2);
    }

    const dateLabel = isToday ? "Live rate" : `Rate on ${selectedDate}`;

    document.getElementById("outputAmount").textContent = `${convertedAmount} ${to}`;
    document.getElementById("rateInfo").textContent = `1 ${from} = ${rate} ${to}  •  ${dateLabel}  •  Amount: ${amount} ${from}`;
    resultDiv.style.display = "block";

  } catch (err) {
    errorDiv.textContent = `❌ ${err.message}`;
    errorDiv.style.display = "block";
  } finally {
    spinner.style.display = "none";
    btn.disabled = false;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  populateDropdowns();

  document.getElementById("amount").addEventListener("keydown", (e) => {
    if (e.key === "Enter") convertCurrency();
  });
});