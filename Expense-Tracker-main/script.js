const menuToggle = document.getElementById("menu-toggle");
const mobileMenu = document.getElementById("mobile-menu");

menuToggle.addEventListener("click", () => {
  mobileMenu.classList.toggle("hidden");
});

const isBackendEnabled = true;

let budget = 0;
let totalExpenses = 0;
let totalIncome = 0;

const WARNING_THRESHOLD = 0.8; // 80% of the budget
const EXCEEDED_THRESHOLD = 1.0; // 100% of the budget

function setBudget() {
  budget = 0;
  updateDashboard();
  initializeChart();
  initializeBarChart();
  initializeLineChart();
}

function addIncome() {
  const incomeInput =
    parseFloat(document.getElementById("income-input").value) || 0;
  const category = document.getElementById("income-category").value;
  const description =
    document.getElementById("income-description").value || "No description";

  if (incomeInput > 0) {
    totalIncome += incomeInput;
    budget += incomeInput; // Increase budget by income amount

    // Clear input fields
    document.getElementById("income-input").value = "";
    document.getElementById("income-description").value = "";

    // Create a unique ID for the income item
    const incomeId = `income-${Date.now()}`;

    // Add income to the primary income list
    const incomeList = document.getElementById("income-list");
    const listItem = document.createElement("li");
    listItem.className = "income-item";
    listItem.id = incomeId; // Set unique ID for primary list item

    listItem.innerHTML = `
      <span class="income-category">${category} | $${incomeInput.toFixed(
        2
      )} | ${description}</span>
      <button class="delete-income-btn" onclick="deleteIncome('${incomeId}', ${incomeInput})">Delete</button>
    `;
    incomeList.appendChild(listItem);

    // Add income to the dashboard income list
    const incomeList1 = document.getElementById("income-list-1");
    const listItem1 = document.createElement("li");
    listItem1.className = "income-item";
    listItem1.id = `dashboard-${incomeId}`; // Set unique ID for dashboard list item

    listItem1.innerHTML = `
      <span class="income-category">Income: $${incomeInput.toFixed(
        2
      )} - ${description} (${category})</span>
    `;
    incomeList1.appendChild(listItem1);

    // Update dashboard and charts
    updateDashboard();
    updateBarChart();
    updateLineChart();
    updateChart();

    if (isBackendEnabled) {
      fetch('/api/incomes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incomeid: incomeId ,category, description, amount: incomeInput })
      });
    }    
  }
}

function deleteIncome(incomeId, incomeAmount) {
  // Adjust totals by removing the income amount
  totalIncome -= incomeAmount;
  budget -= incomeAmount;

  // Remove the income item from the primary list
  const primaryItem = document.getElementById(incomeId);
  if (primaryItem) {
    primaryItem.remove();
  }

  // Remove the corresponding item from the dashboard list
  const dashboardItem = document.getElementById(`dashboard-${incomeId}`);
  if (dashboardItem) {
    dashboardItem.remove();
  }

  // Update dashboard and charts after deletion
  updateDashboard();
  updateBarChart();
  updateLineChart();
  updateChart();

  if (isBackendEnabled) {
    fetch(`/api/incomes`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: incomeId }) // Optional, better to pass unique ID when backend supports delete
    });
  }  
}

function addExpense() {
  const expenseCategory = document.getElementById("expense-category").value;
  const expenseDesc =
    document.getElementById("expense-desc").value || "No description";
  const expenseAmount =
    parseFloat(document.getElementById("expense-amount").value) || 0;

  if (expenseDesc && expenseAmount > 0) {
    totalExpenses += expenseAmount;

    // Create a unique ID for the expense item
    const expenseId = `expense-${Date.now()}`;

    // Add expense to the primary list
    const expenseList = document.getElementById("expense-list");
    const listItem = document.createElement("li");
    listItem.className = "expense-item";
    listItem.id = expenseId; // Set unique ID

    listItem.innerHTML = `
      <span class="expense-category">${expenseCategory} | $${expenseAmount.toFixed(2)} | ${expenseDesc}</span>
      <button class="delete-btn" onclick="deleteExpense('${expenseId}', ${expenseAmount})">Delete</button>
    `;
    expenseList.appendChild(listItem);

    // Add expense to the secondary dashboard list
    const expenseList1 = document.getElementById("expense-list-1");
    const listItem1 = document.createElement("li");
    listItem1.className = "expense-item";
    listItem1.id = `dashboard-${expenseId}`; // Set unique ID for secondary list

    listItem1.innerHTML = `
      <span class="expense-category">Expense: $${expenseAmount.toFixed(
        2
      )} - ${expenseDesc} (${expenseCategory})</span>
    `;
    expenseList1.appendChild(listItem1);

    // Clear input fields
    document.getElementById("expense-desc").value = "";
    document.getElementById("expense-amount").value = "";
    document.getElementById("expense-category").value = "Other";

    // Update dashboard and charts
    updateDashboard();
    updateBarChart();
    updateLineChart();
    updateChart();

    if (isBackendEnabled) {
      fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expenseid: expenseId, category: expenseCategory, description: expenseDesc, amount: expenseAmount })
      });
    }    
  }
}

function deleteExpense(expenseId, expenseAmount) {
  // Decrease total expenses
  totalExpenses -= expenseAmount;

  // Remove the item from the primary list
  const primaryItem = document.getElementById(expenseId);
  if (primaryItem) {
    primaryItem.remove();
  }

  // Remove the corresponding item from the secondary dashboard list
  const secondaryItem = document.getElementById(`dashboard-${expenseId}`);
  if (secondaryItem) {
    secondaryItem.remove();
  }

  // Update dashboard and charts after deletion
  updateDashboard();
  updateBarChart();
  updateLineChart();
  updateChart();

  if (isBackendEnabled) {
    fetch(`/api/expenses`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expenseid: expenseId }) 
    });
  }  
}

function updateDashboard() {
  const remainingBudget = budget - totalExpenses;
  document.getElementById(
    "remaining-budget"
  ).textContent = `$${remainingBudget.toFixed(2)}`;
  document.getElementById("total-income").textContent = `$${totalIncome.toFixed(
    2
  )}`;
  document.getElementById(
    "total-expenses"
  ).textContent = `$${totalExpenses.toFixed(2)}`;

  // Check for budget alerts
  checkBudgetAlert(remainingBudget);
}


function checkBudgetAlert(remainingBudget) {
  const expenseRatio = totalExpenses / budget;

  // Check if expenses are near or over the budget
  if (expenseRatio >= EXCEEDED_THRESHOLD) {
    showAlert(
      "Budget Exceeded",
      "You have exceeded your budget! Consider reducing expenses."
    );
    alert("You have exceeded your budget! Consider reducing expenses.");
  } else if (expenseRatio >= WARNING_THRESHOLD) {
    showAlert(
      "Warning: Budget Approaching Limit",
      "You are approaching your budget limit. Spend cautiously."
    );
    alert("You are approaching your budget limit. Spend cautiously.");
  } else {
    clearAlert();
  }
}

// Function to show an alert message on the UI
function showAlert(title, message) {
  const alertBox = document.getElementById("alert-box");
  alertBox.innerHTML = `
    <div class="bg-red-600 text-white p-4 rounded-lg shadow-lg mt-4">
      <strong>${title}</strong><br>${message}
    </div>
  `;
}

// Function to clear the alert message
function clearAlert() {
  const alertBox = document.getElementById("alert-box");
  alertBox.innerHTML = "";
}


// Initialize and update the Chart
function initializeChart() {
  const ctx = document.getElementById("budgetChart").getContext("2d");
  budgetChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Remaining Budget", "Total Expenses", "Total Income"],
      datasets: [
        {
          data: [
            budget - totalExpenses - totalIncome,
            totalExpenses,
            totalIncome,
          ],
          backgroundColor: ["#00BFFF", "#ED7C63", "#63EDAA"], // Yellow, green and red colors
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  });
}

function updateChart() {
  if (!budgetChart) return; // Avoid updating if chart isn't initialized

  // Update chart data
  budgetChart.data.datasets[0].data = [
    budget - totalExpenses - totalIncome,
    totalExpenses,
    totalIncome,
  ];
  budgetChart.update();
}

let budgetBarChart;

function initializeBarChart() {
  const ctx = document.getElementById("budgetBarChart").getContext("2d");

  budgetBarChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Total Budget", "Total Expenses", "Total Income"],
      datasets: [
        {
          label: "Budget Analysis",
          data: [budget - totalExpenses, totalExpenses, totalIncome],
          backgroundColor: ["#00BFFF", "#ED7C63", "#63EDAA"], // Yellow for remaining budget, red for expenses, green for income
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          suggestedMax: budget, // Set y-axis max to the initial budget value
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function (tooltipItem) {
              return `$${tooltipItem.raw.toFixed(2)}`;
            },
          },
        },
      },
    },
  });
}

function updateBarChart() {
  if (!budgetBarChart) return;

  // Update the data in the bar chart with new values
  budgetBarChart.data.datasets[0].data = [
    budget - totalExpenses, // Total budget
    totalExpenses, // Total expenses
    totalIncome, // Total income
  ];

  // Update y-axis maximum to be close to the budget value for scaling
  budgetBarChart.options.scales.y.suggestedMax = budget;

  budgetBarChart.update(); // Refresh the chart with updated values
}

function initializeLineChart() {
  const ctx = document
    .getElementById("incomeExpenseLineChart")
    .getContext("2d");

  // Initialize an empty chart
  incomeExpenseLineChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Income",
          data: [],
          borderColor: "green",
          backgroundColor: "#63EDAA",
          fill: false,
          tension: 0.1,
        },
        {
          label: "Expense",
          data: [],
          borderColor: "red",
          backgroundColor: "#ED7C63",
          fill: false,
          tension: 0.1,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        x: {
          title: {
            display: true,
            text: "Item Number",
          },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Amount",
          },
        },
      },
      plugins: {
        legend: {
          display: true,
          position: "top",
        },
      },
    },
  });
}

function updateLineChart() {
  const incomeItems = document.querySelectorAll("#income-list .income-item");
  const expenseItems = document.querySelectorAll("#expense-list .expense-item");

  const incomeData = [];
  const expenseData = [];
  
  // Determine the maximum number of records between income and expenses
  const maxRecords = Math.max(incomeItems.length, expenseItems.length);
  
  const labels = Array.from({ length: maxRecords }, (_, index) => `Record ${index + 1}`);

  // Populate incomeData with income amounts, or 0 if there are fewer income records
  incomeItems.forEach((item, index) => {
    const amount = parseFloat(
      item
        .querySelector(".income-category")
        .innerText.split(" | ")[1]
        .replace("$", "")
        .trim()
    );
    incomeData[index] = amount;
  });

  // Fill any missing income records with 0 for alignment with the maxRecords length
  while (incomeData.length < maxRecords) {
    incomeData.push(0);
  }

  // Populate expenseData with expense amounts, or 0 if there are fewer expense records
  expenseItems.forEach((item, index) => {
    const amount = parseFloat(
      item
        .querySelector(".expense-category")
        .innerText.split(" | ")[1]
        .replace("$", "")
        .trim()
    );
    expenseData[index] = amount;
  });

  // Fill any missing expense records with 0 for alignment with the maxRecords length
  while (expenseData.length < maxRecords) {
    expenseData.push(0);
  }

  // Update the chart with aligned data and labels
  incomeExpenseLineChart.data.labels = labels;
  incomeExpenseLineChart.data.datasets[0].data = incomeData;
  incomeExpenseLineChart.data.datasets[1].data = expenseData;
  incomeExpenseLineChart.update();
}


async function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Capture the dashboard area using html2canvas
  const dashboardElement = document.getElementById("dashboard");

  // Convert the dashboard element to canvas
  const canvas = await html2canvas(dashboardElement, { scale: 2 });
  const imgData = canvas.toDataURL("image/png");

  // Set dark background color
  doc.setFillColor(0, 0, 0); // Dark gray background (RGB)
  doc.rect(
    0,
    0,
    doc.internal.pageSize.width,
    doc.internal.pageSize.height,
    "F"
  ); // Full page rectangle

  // Set white font color for all text
  doc.setTextColor(255, 255, 255); // White color

  // Title and basic information
  doc.setFont("helvetica", "bold");

  // Watermark
  doc.setFontSize(70);
  doc.setFont("helvetica", "bold");
  doc.setGState(new doc.GState({ opacity: 0.2 })); // Set opacity

  // Position watermark in the center and rotate
  doc.text("EXPENSE\nTRACKER", 35, 150, { angle: 45 });

  // Restore default settings
  doc.setGState(new doc.GState({ opacity: 1 }));
  doc.setFontSize(12); // Reset font size after watermark

  // Add title and basic info
  doc.setFontSize(15);
  doc.text(
    "<---------------------------------Expense Tracker Report----------------------------->",
    10,
    10
  );
  doc.setFontSize(10);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 10, 20);
  doc.setFontSize(12);
  doc.text("Financial Overview:", 10, 40);

  // Display total income, expenses, and budget
  doc.setFontSize(10);
  doc.text(`Total Income: $${totalIncome.toFixed(2)}`, 10, 50);
  doc.text(`Total Expenses: $${totalExpenses.toFixed(2)}`, 10, 60);
  doc.text(`Remaining Budget: $${(budget - totalExpenses).toFixed(2)}`, 10, 70);

  // Insert dashboard snapshot image into the PDF
  const imgWidth = 100; // Set the width of the image
  const imgHeight = (canvas.height * imgWidth) / canvas.width; // Maintain aspect ratio
  doc.addImage(imgData, "PNG", 100, 15, imgWidth, imgHeight);

  // Move yOffset to place text below the image
  let yOffset = 80 + 10;

  // Add income entries
  doc.setFontSize(12);
  doc.text("Income Entries:", 10, yOffset);
  yOffset += 10;
  document
    .querySelectorAll("#income-list .income-item")
    .forEach((item, index) => {
      const text = item.innerText.replace("Delete", "").trim();
      doc.setFontSize(10);
      doc.text(`${index + 1}. ${text}`, 10, yOffset);
      yOffset += 10;
    });

  // Add expense entries
  doc.setFontSize(12);
  doc.text("Expense Entries:", 10, yOffset + 10);
  yOffset += 20;
  document
    .querySelectorAll("#expense-list .expense-item")
    .forEach((item, index) => {
      const text = item.innerText.replace("Delete", "").trim();
      doc.setFontSize(10);
      doc.text(`${index + 1}. ${text}`, 10, yOffset);
      yOffset += 10;
    });

  // Add a random financial quote at the end
  doc.setFontSize(12);
  doc.text("Financial Quote:", 100, 110);
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  doc.setFontSize(10);
  doc.text(randomQuote, 100, 120, { maxWidth: 90 });

  yOffset += 10;

  doc.text(
    "<--------------------------------------------------Thank You for using our Expense Tracker---------------------------------------------->",
    10,
    yOffset + 20
  );

  // Download the generated PDF
  doc.save("expense_report.pdf");
}

function downloadCSV() {
  // Define the CSV header
  let csvContent = "Data Type,Category,Amount,Description\n";

  // Add Income entries to CSV
  const incomeItems = document.querySelectorAll("#income-list .income-item");
  incomeItems.forEach((item) => {
    const textContent = item.querySelector(".income-category").innerText;
    const [category, amount, description] = textContent.split(" | ");
    csvContent += `Income,${category.trim()},${amount
      .replace("$", "")
      .trim()},${description.trim()}\n`;
  });

  // Add Expense entries to CSV
  const expenseItems = document.querySelectorAll("#expense-list .expense-item");
  expenseItems.forEach((item) => {
    const textContent = item.querySelector(".expense-category").innerText;
    const [category, amount, description] = textContent.split(" | ");
    csvContent += `Expense,${category.trim()},${amount
      .replace("$", "")
      .trim()},${description.trim()}\n`;
  });

  // Add summary (total income, total expenses, remaining budget)
  csvContent += "\nSummary,,,\n"; // Summary section header
  csvContent += `Total Income,,${totalIncome.toFixed(2)},\n`;
  csvContent += `Total Expenses,,${totalExpenses.toFixed(2)},\n`;
  csvContent += `Remaining Budget,,${(budget - totalExpenses).toFixed(2)},\n`;

  // Create a Blob and use it to generate a downloadable link
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.setAttribute("href", url);
  link.setAttribute("download", "expense_report.csv");
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

const quotes = [
  "An investment in knowledge pays the best interest.\n\n - Benjamin Franklin",
  "Do not save what is left after spending, but spend what is left after saving.\n\n - Warren Buffett",
  "The quickest way to double your money is to fold it over and put it back in your pocket.\n\n - Will Rogers",
  "Beware of little expenses; a small leak will sink a great ship.\n\n - Benjamin Franklin",
  "Money is only a tool. It will take you wherever you wish, but it will not replace you as the driver.\n\n - Ayn Rand",
  "It's not your salary that makes you rich, it's your spending habits.\n\n - Charles A. Jaffe",
  "A penny saved is a penny earned.\n\n - Benjamin Franklin",
  "In investing, what is comfortable is rarely profitable.\n\n - Robert Arnott",
  "The only wealth which you will keep forever is the wealth you have given away.\n\n - Marcus Aurelius",
  "Price is what you pay. Value is what you get.\n\n - Warren Buffett",
  "Financial freedom is available to those who learn about it and work for it.\n\n - Robert Kiyosaki",
  "The best way to predict the future is to create it.\n\n - Peter Drucker",
  "Do not wait to strike till the iron is hot, but make it hot by striking.\n\n - William Butler Yeats",
  "If you live for having it all, what you have is never enough.\n\n - Vicki Robin",
  "It's not about having the money, it's about managing it well.\n\n - T. Harv Eker",
  "Time is more valuable than money. You can get more money, but you cannot get more time.\n\n - Jim Rohn",
];

function newQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  document.getElementById("quote").innerText = quotes[randomIndex];
}

function submitForm() {
  // Display the alert message
  alert("Thank you for your Response!");

  // Clear the form inputs
  document.getElementById("name").value = "";
  document.getElementById("email").value = "";
  document.getElementById("message").value = "";
}

window.addEventListener("DOMContentLoaded", async () => {
  setBudget();
  if (!isBackendEnabled){
    return;
  }

  const [incomeRes, expenseRes] = await Promise.all([
    fetch('/api/incomes'),
    fetch('/api/expenses')
  ]);

  const incomes = await incomeRes.json();
  const expenses = await expenseRes.json();

  incomes.forEach((income) => {
    totalIncome += income.amount;
    budget += income.amount;

    updateDashboard();
  // initializeChart();
  // initializeBarChart();
  // initializeLineChart();
  updateChart();
  updateBarChart();
  updateLineChart();

    // Manually add UI element
    const incomeId = `income-${Date.now()}-${Math.random()}`;
    const listItem = document.createElement("li");
    listItem.className = "income-item";
    listItem.id = incomeId;
    listItem.innerHTML = `
      <span class="income-category">${income.category} | $${income.amount.toFixed(2)} | ${income.description}</span>
    `;
    document.getElementById("income-list").appendChild(listItem);

    const dashboardItem = document.createElement("li");
    dashboardItem.className = "income-item";
    dashboardItem.id = `dashboard-${incomeId}`;
    dashboardItem.innerHTML = `
      <span class="income-category">Income: $${income.amount.toFixed(2)} - ${income.description} (${income.category})</span>
    `;
    document.getElementById("income-list-1").appendChild(dashboardItem);
  });

  expenses.forEach((expense) => {
    totalExpenses += expense.amount;
    updateDashboard();
  updateChart();
  updateBarChart();
  updateLineChart();

    const expenseId = `expense-${Date.now()}-${Math.random()}`;
    const listItem = document.createElement("li");
    listItem.className = "expense-item";
    listItem.id = expenseId;
    listItem.innerHTML = `
      <span class="expense-category">${expense.category} | $${expense.amount.toFixed(2)} | ${expense.description}</span>
      <button class="delete-btn" onclick="deleteExpense(${expense.expenseid}, ${expense.amount})">Delete</button>
    `;
    document.getElementById("expense-list").appendChild(listItem);

    const dashboardItem = document.createElement("li");
    dashboardItem.className = "expense-item";
    dashboardItem.id = `dashboard-${expenseId}`;
    dashboardItem.innerHTML = `
      <span class="expense-category">Expense: $${expense.amount.toFixed(2)} - ${expense.description} (${expense.category})</span>
    `;
    document.getElementById("expense-list-1").appendChild(dashboardItem);
  });
});