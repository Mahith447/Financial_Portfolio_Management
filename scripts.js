// Global variables
var transactionHistory = [];
var investmentData = {
  labels: ["Stocks", "Bonds", "Commodities", "Cash", "ETFs"],
  datasets: [{
    label: "Investments",
    data: [0, 0, 0, 0, 0],
    backgroundColor: [
      '#ff6384',
      '#36a2eb',
      '#ffce56',
      '#4bc0c0',
      '#9966ff'
    ],
    borderColor: '#fff',
    borderWidth: 1
  }]
};

var ctx = document.getElementById('investment-graph').getContext('2d');
var investmentGraph = new Chart(ctx, {
  type: 'bar',
  data: investmentData,
  options: {
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
});

var pieCtx = document.getElementById('investment-pie-chart').getContext('2d');
var investmentPieChart = new Chart(pieCtx, {
  type: 'pie',
  data: investmentData,
  options: {
    plugins: {
      legend: {
        position: 'right',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            var label = context.label || '';
            if (context.parsed) {
              label += ': ₹';
              label += context.parsed.toFixed(2);
            }
            return label;
          }
        }
      }
    }
  }
});

function addInvestment() {
  var type = document.getElementById("investment-type").value;
  var name = document.getElementById("investment-name").value;
  var amount = parseFloat(document.getElementById("investment-amount").value);
  if (isNaN(amount)) {
    alert("Please enter a valid number for the investment amount.");
    return;
  }
  var dateTime = new Date();
  var date = dateTime.toLocaleDateString('en-GB');
  var time = dateTime.toLocaleTimeString();

  switch (type) {
    case "stock":
      investmentData.datasets[0].data[0] += amount;
      break;
    case "bond":
      investmentData.datasets[0].data[1] += amount;
      break;
    case "commodity":
      investmentData.datasets[0].data[2] += amount;
      break;
    case "cash":
      investmentData.datasets[0].data[3] += amount;
      break;
    case "ETF":
      investmentData.datasets[0].data[4] += amount;
      break;
  }

  investmentGraph.update();
  investmentPieChart.update();
  displayInvestmentDetails(type, name, amount, date, time);
  transactionHistory.push({
    type: type,
    name: name,
    amount: amount,
    date: date,
    time: time
  });
  updateTransactionHistory();
  updateAssetBalances();
  document.getElementById("investment-name").value = "";
  document.getElementById("investment-amount").value = "";
}

function displayInvestmentDetails(type, name, amount, date, time) {
  var investmentList = document.getElementById("investment-list");
  var listItem = document.createElement("li");
  listItem.className = "list-group-item d-flex justify-content-between align-items-center";
  listItem.innerHTML = `Type: ${type}, Name: ${name}, Amount: ₹${amount.toFixed(2)}, Date: ${date}, Time: ${time}`;
  
  var editButton = document.createElement("button");
  editButton.className = "btn btn-warning btn-sm me-2";
  editButton.textContent = "Edit";
  editButton.addEventListener("click", function() {
    editInvestment(name, amount, type);
  });

  var deleteButton = document.createElement("button");
  deleteButton.className = "btn btn-danger btn-sm";
  deleteButton.textContent = "Delete";
  deleteButton.addEventListener("click", function() {
    deleteInvestment(listItem, type, amount);
  });

  listItem.appendChild(editButton);
  listItem.appendChild(deleteButton);
  investmentList.appendChild(listItem);
}

function editInvestment(name, amount, type) {
  document.getElementById("investment-name").value = name;
  document.getElementById("investment-amount").value = amount;
  document.getElementById("investment-type").value = type;
}

function deleteInvestment(listItem, type, amount) {
  var index = transactionHistory.findIndex(transaction => transaction.name === listItem.textContent.split(',')[1].split(':')[1].trim() && transaction.type === type && transaction.amount === amount);
  if (index !== -1) {
    transactionHistory.splice(index, 1);
    investmentData.datasets[0].data = [0, 0, 0, 0, 0];
    transactionHistory.forEach(transaction => {
      switch (transaction.type) {
        case "stock":
          investmentData.datasets[0].data[0] += transaction.amount;
          break;
        case "bond":
          investmentData.datasets[0].data[1] += transaction.amount;
          break;
        case "commodity":
          investmentData.datasets[0].data[2] += transaction.amount;
          break;
        case "cash":
          investmentData.datasets[0].data[3] += transaction.amount;
          break;
        case "ETF":
          investmentData.datasets[0].data[4] += transaction.amount;
          break;
      }
    });
    investmentGraph.update();
    investmentPieChart.update();
    updateTransactionHistory();
    updateAssetBalances();
    listItem.remove();
  }
}

function updateTransactionHistory() {
  var transactionHistoryBody = document.getElementById("transaction-history-body");
  transactionHistoryBody.innerHTML = "";
  transactionHistory.forEach(function(transaction, index) {
    var row = document.createElement("tr");
    row.innerHTML = `<td>${index + 1}</td><td>${transaction.type}</td><td>${transaction.name}</td><td class="${transaction.amount >= 0 ? 'text-success' : 'text-danger'}">₹${transaction.amount.toFixed(2)}</td><td>${transaction.date}</td><td>${transaction.time}</td><td><button class="btn btn-warning btn-sm" onclick="editInvestment('${transaction.name}', ${transaction.amount}, '${transaction.type}')">Edit</button><button class="btn btn-danger btn-sm ms-2" onclick="deleteInvestment(this.closest('tr'), '${transaction.type}', ${transaction.amount})">Delete</button></td>`;
    transactionHistoryBody.appendChild(row);
  });
}

function updateAssetBalances() {
  document.getElementById("stock-balance").textContent = `Stocks: ₹${investmentData.datasets[0].data[0].toFixed(2)}`;
  document.getElementById("bond-balance").textContent = `Bonds: ₹${investmentData.datasets[0].data[1].toFixed(2)}`;
  document.getElementById("commodity-balance").textContent = `Commodities: ₹${investmentData.datasets[0].data[2].toFixed(2)}`;
  document.getElementById("cash-balance").textContent = `Cash: ₹${investmentData.datasets[0].data[3].toFixed(2)}`;
  document.getElementById("ETF-balance").textContent = `ETFs: ₹${investmentData.datasets[0].data[4].toFixed(2)}`;
}

function downloadInvestmentData() {
  var csvContent = "S.No,Type,Name,Amount,Date,Time\n";
  transactionHistory.forEach(function(transaction, index) {
    csvContent += `${index + 1},${transaction.type},${transaction.name},${transaction.amount.toFixed(2)},${transaction.date},${transaction.time}\n`;
  });
  var encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
  var link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "investment_data.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
