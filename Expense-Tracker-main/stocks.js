const logoMap = {
  GOOGL: "icons8-google.svg",
  AAPL: "icons8-apple-logo.svg",
  IBM: "icons8-ibm.svg",
  MSFT: "icons8-microsoft.svg",
  AMZN: "icons8-amazon.svg",
};

function formatPrice(open, close) {
  const openValue = parseFloat(open);
  const closeValue = parseFloat(close);
  const color1 = closeValue > openValue ? "text-green-500" : closeValue < openValue ? "text-red-500" : "text-gray-50";
  const color2 = closeValue > openValue ? "text-red-500" : closeValue < openValue ? "text-green-500" : "text-gray-50";
  const changePercentage = (((closeValue - openValue) / openValue) * 100).toFixed(2);
  const arrow = changePercentage > 0.00 ? "⬆️" : changePercentage < 0.00 ? "⬇️" : "➡️";

  return `
    <span class="${color2}">Open: $${openValue.toFixed(2)}</span><br>
    <span class="${color1}">Close: $${closeValue.toFixed(2)}</span>
    <span class="${color1}">${changePercentage}% ${arrow}</span>
  `;
}

async function fetchMultipleCompaniesData() {
  try {
    const response = await fetch("/api/stocks");
    const data = await response.json();

    const companies = {
      GOOGL: "google-summary",
      AAPL: "apple-summary",
      IBM: "ibm-summary",
      MSFT: "microsoft-summary",
      AMZN: "amazon-summary"
    };

    for (const symbol in companies) {
      const summaryId = companies[symbol];
      const stockData = data[symbol];
      if (stockData?.status === "ok") {
        const latest = stockData.values[0];
        const logo = `./assests/${logoMap[symbol] || "default.png"}`;
        const companyName = symbol === "AAPL" ? "Apple" : symbol === "GOOGL" ? "Google" : symbol === "MSFT" ? "Microsoft" : symbol === "AMZN" ? "Amazon" : "IBM";

        document.getElementById(summaryId).innerHTML = `
          <img src="${logo}" alt="${companyName} Logo" class="h-6 w-6 mr-2" />
          ${companyName} (${symbol})<br>${formatPrice(latest.open, latest.close)}
        `;
      }
    }
  } catch (error) {
    console.error("Frontend error:", error);
  }
}

fetchMultipleCompaniesData();
