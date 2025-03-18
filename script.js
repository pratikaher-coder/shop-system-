let dayCounter = localStorage.getItem('dayCounter') ? parseInt(localStorage.getItem('dayCounter')) : 0;
let isShopOpen = false;
let previousStock = JSON.parse(localStorage.getItem('previousStock')) || []; // Load previous stock from localStorage

// Function to enable/disable all buttons and inputs
function toggleFunctionality(isEnabled) {
    const productInputs = document.querySelectorAll('#productForm input, #productForm button');
    const expenseInputs = document.querySelectorAll('#expenseForm input, #expenseForm button');
    const sellButtons = document.querySelectorAll('.sell-btn');
    const deleteButtons = document.querySelectorAll('.delete-btn');

    // Enable/disable product and expense forms
    productInputs.forEach(element => element.disabled = !isEnabled);
    expenseInputs.forEach(element => element.disabled = !isEnabled);

    // Enable/disable sell and delete buttons in tables
    sellButtons.forEach(button => button.disabled = !isEnabled);
    deleteButtons.forEach(button => button.disabled = !isEnabled);
}

// Open Button: Enable functionality and load previous stock
document.getElementById('openBtn').addEventListener('click', function() {
    if (!isShopOpen) {
        isShopOpen = true;
        dayCounter++;
        localStorage.setItem('dayCounter', dayCounter); // Save dayCounter to localStorage
        document.getElementById('dayCounter').textContent = `Day: ${dayCounter}`;
        toggleFunctionality(true);

        // Load previous stock
        if (previousStock.length > 0) {
            previousStock.forEach(product => {
                addProductToTable(product.name, product.price, product.quantity);
            });
        }
    }
});

// Close Button: Disable functionality, save current stock, and show summary popup
document.getElementById('closeBtn').addEventListener('click', function() {
    if (isShopOpen) {
        isShopOpen = false;
        toggleFunctionality(false);

        // Save current stock
        const productRows = document.querySelectorAll('#productTable tbody tr');
        previousStock = [];
        productRows.forEach(row => {
            const name = row.cells[0].textContent;
            const price = row.cells[1].textContent.replace('₹', '');
            const quantity = row.cells[2].textContent;
            previousStock.push({ name, price, quantity });
        });
        localStorage.setItem('previousStock', JSON.stringify(previousStock)); // Save previousStock to localStorage

        // Clear tables
        document.querySelector('#productTable tbody').innerHTML = '';
        document.querySelector('#expenseTable tbody').innerHTML = '';

        // Show the daily summary popup
        showSummaryPopup();
    }
});

// Function to show the daily summary popup
function showSummaryPopup() {
    const totalSales = calculateTotalSales();
    const totalExpenses = calculateTotalExpenses();
    const netProfitLoss = totalSales - totalExpenses;

    // Update the popup content
    document.getElementById('totalSales').textContent = totalSales.toFixed(2);
    document.getElementById('totalExpensesSummary').textContent = totalExpenses.toFixed(2);
    document.getElementById('netProfitLossSummary').textContent = netProfitLoss.toFixed(2);

    // Show the popup
    const popup = document.getElementById('summaryPopup');
    popup.style.display = 'flex';
}

// Function to calculate total sales
function calculateTotalSales() {
    const productRows = document.querySelectorAll('#productTable tbody tr');
    let totalSales = 0;

    productRows.forEach(row => {
        const price = parseFloat(row.cells[1].textContent.replace('₹', ''));
        const initialQuantity = parseInt(row.dataset.initialQuantity);
        const currentQuantity = parseInt(row.cells[2].textContent);
        const soldQuantity = initialQuantity - currentQuantity;
        totalSales += price * soldQuantity;
    });

    return totalSales;
}

// Function to calculate total expenses
function calculateTotalExpenses() {
    const expenseRows = document.querySelectorAll('#expenseTable tbody tr');
    let totalExpenses = 0;

    expenseRows.forEach(row => {
        const amount = parseFloat(row.cells[1].textContent.replace('₹', ''));
        totalExpenses += amount;
    });

    return totalExpenses;
}

// Close the popup when the "Close" button is clicked
document.getElementById('closePopup').addEventListener('click', function() {
    const popup = document.getElementById('summaryPopup');
    popup.style.display = 'none';
});

// Handle Product Form Submission
document.getElementById('productForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const productName = document.getElementById('productName').value;
    const productPrice = document.getElementById('productPrice').value;
    const productQuantity = document.getElementById('productQuantity').value;

    if (productName && productPrice && productQuantity) {
        addProductToTable(productName, productPrice, productQuantity);
        document.getElementById('productForm').reset();
    } else {
        alert('Please fill in all fields for the product.');
    }
});

// Handle Expense Form Submission
document.getElementById('expenseForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const expenseDescription = document.getElementById('expenseName').value;
    const expenseAmount = document.getElementById('expensePrice').value;

    if (expenseDescription && expenseAmount) {
        addExpenseToTable(expenseDescription, expenseAmount);
        document.getElementById('expenseForm').reset();
    } else {
        alert('Please fill in all fields for the expense.');
    }
});

// Function to add a product to the product table
function addProductToTable(name, price, quantity) {
    const productTableBody = document.querySelector('#productTable tbody');
    const newRow = document.createElement('tr');

    newRow.innerHTML = `
        <td>${name}</td>
        <td>₹${price}</td>
        <td>${quantity}</td>
        <td><button class="sell-btn" onclick="sellProduct(this)">Sell</button></td>
        <td><button class="delete-btn" onclick="deleteProduct(this)">Delete</button></td>
    `;

    // Store the initial quantity in a data attribute
    newRow.dataset.initialQuantity = quantity;

    productTableBody.appendChild(newRow);
}

// Function to add an expense to the expense table
function addExpenseToTable(description, amount) {
    const expenseTableBody = document.querySelector('#expenseTable tbody');
    const newRow = document.createElement('tr');

    newRow.innerHTML = `
        <td>${description}</td>
        <td>₹${amount}</td>
        <td><button class="delete-btn" onclick="deleteExpense(this)">Delete</button></td>
    `;

    expenseTableBody.appendChild(newRow);
}

// Function to handle selling a product
function sellProduct(button) {
    const row = button.closest('tr');
    const quantityCell = row.cells[2];
    let quantity = parseInt(quantityCell.textContent);

    if (quantity > 0) {
        quantity--;
        quantityCell.textContent = quantity;
    } else {
        alert('No more stock available for this product.');
    }
}

// Function to handle deleting a product
function deleteProduct(button) {
    const row = button.closest('tr');
    row.remove();
}

// Function to handle deleting an expense
function deleteExpense(button) {
    const row = button.closest('tr');
    row.remove();
}

// Calculator Functionality
document.getElementById('calculatorBtn').addEventListener('click', function() {
    const calculatorPopup = document.getElementById('calculatorPopup');
    calculatorPopup.style.display = 'flex';
});

document.querySelectorAll('.calculator-buttons button').forEach(button => {
    button.addEventListener('click', function() {
        const input = document.getElementById('calculatorInput');
        if (button.textContent === 'C') {
            input.value = '';
        } else if (button.textContent === '=') {
            try {
                input.value = eval(input.value);
            } catch {
                input.value = 'Error';
            }
        } else {
            input.value += button.textContent;
        }
    });
});

document.getElementById('cancelBtn').addEventListener('click', function() {
    const calculatorPopup = document.getElementById('calculatorPopup');
    calculatorPopup.style.display = 'none';
});

// Bill Generation Functionality
document.getElementById('generateBillBtn').addEventListener('click', function() {
    const billPopup = document.getElementById('billPopup');
    billPopup.style.display = 'flex';

    // Populate bill items
    const productRows = document.querySelectorAll('#productTable tbody tr');
    const billItems = document.getElementById('billItems');
    billItems.innerHTML = '';

    productRows.forEach(row => {
        const name = row.cells[0].textContent;
        const price = row.cells[1].textContent.replace('₹', '');
        const quantity = row.cells[2].textContent;

        if (quantity > 0) {
            const item = document.createElement('div');
            item.innerHTML = `
                <p>${name} - ₹${price} x ${quantity}</p>
            `;
            billItems.appendChild(item);
        }
    });
});

document.getElementById('closeBillPopup').addEventListener('click', function() {
    const billPopup = document.getElementById('billPopup');
    billPopup.style.display = 'none';
});

document.getElementById('billForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const customerName = document.getElementById('customerName').value;
    const discount = parseFloat(document.getElementById('discount').value);

    let totalAmount = 0;
    const productRows = document.querySelectorAll('#productTable tbody tr');
    productRows.forEach(row => {
        const price = parseFloat(row.cells[1].textContent.replace('₹', ''));
        const quantity = parseFloat(row.cells[2].textContent);
        totalAmount += price * quantity;
    });

    const discountedAmount = totalAmount - (totalAmount * (discount / 100));
