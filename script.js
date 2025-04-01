// Check authentication
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    // Display username
    document.getElementById('usernameDisplay').textContent = currentUser.username;
    
    // Logout functionality
    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        sessionStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    });
    
    // Rest of your existing initialization code...
});
// Shop Management Script - Fixed Version
let dayCounter = localStorage.getItem('dayCounter') ? parseInt(localStorage.getItem('dayCounter')) : 0;
let isShopOpen = false;
let products = JSON.parse(localStorage.getItem('products')) || [];
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    updateDayCounter();
    renderProducts();
    renderExpenses();
});

// Toggle shop functionality
function toggleFunctionality(isEnabled) {
    document.querySelectorAll('#productForm input, #productForm button, #expenseForm input, #expenseForm button')
        .forEach(el => el.disabled = !isEnabled);
}

// Open Shop
document.getElementById('openBtn').addEventListener('click', function() {
    if (!isShopOpen) {
        isShopOpen = true;
        dayCounter++;
        localStorage.setItem('dayCounter', dayCounter);
        updateDayCounter();
        toggleFunctionality(true);
    }
});

// Close Shop
document.getElementById('closeBtn').addEventListener('click', function() {
    if (isShopOpen) {
        isShopOpen = false;
        toggleFunctionality(false);
        
        // Reset daily counters
        products.forEach(p => p.soldToday = 0);
        localStorage.setItem('products', JSON.stringify(products));
        
        showSummaryPopup();
    }
});

// Product Form
document.getElementById('productForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('productName').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const quantity = parseInt(document.getElementById('productQuantity').value);

    if (name && price > 0 && quantity > 0) 
    {     
        products.push({ name, price, quantity, sold: 0, soldToday: 0 }); 
        localStorage.setItem('products', JSON.stringify(products));
        renderProducts();
        this.reset();
    }
});

// Expense Form
document.getElementById('expenseForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('expenseName').value;
    const amount = parseFloat(document.getElementById('expensePrice').value);

    if (name && amount > 0) {
        expenses.push({ name, amount });
        localStorage.setItem('expenses', JSON.stringify(expenses));
        renderExpenses();
        this.reset();
    }
});

// Render Products
function renderProducts() {
    const tbody = document.querySelector('#productTable tbody');
    tbody.innerHTML = '';
    
    products.forEach((product, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${product.name}</td>
            <td>₹${product.price.toFixed(2)}</td>
            <td>${product.quantity}</td>
            <td>${product.sold}</td>
            <td>
                <button class="sell-btn" data-index="${index}">Sell</button>
                <button class="delete-btn" data-index="${index}">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Add event listeners for new buttons
    document.querySelectorAll('.sell-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = this.dataset.index;
            sellProduct(index);
        });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = this.dataset.index;
            deleteProduct(index);
        });
    });
}

// Render Expenses
function renderExpenses() {
    const tbody = document.querySelector('#expenseTable tbody');
    tbody.innerHTML = '';
    
    expenses.forEach((expense, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${expense.name}</td>
            <td>₹${expense.amount.toFixed(2)}</td>
            <td><button class="delete-btn" data-index="${index}">Delete</button></td>
        `;
        tbody.appendChild(tr);
    });

    document.querySelectorAll('#expenseTable .delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = this.dataset.index;
            deleteExpense(index);
        });
    });
}

// Product Actions
function sellProduct(index) {
    if (products[index].quantity > 0) {
        products[index].quantity--;
        products[index].sold++;         // For bills
        products[index].soldToday++;    // For daily summary
        localStorage.setItem('products', JSON.stringify(products));
        renderProducts();
    } else {
        alert('No more stock available!');
    }
}

function deleteProduct(index) {
    products.splice(index, 1);
    localStorage.setItem('products', JSON.stringify(products));
    renderProducts();
}

function deleteExpense(index) {
    expenses.splice(index, 1);
    localStorage.setItem('expenses', JSON.stringify(expenses));
    renderExpenses();
}

// Summary Calculations
function showSummaryPopup() {
    // Use soldToday instead of sold
    const totalSales = products.reduce((sum, p) => sum + (p.soldToday * p.price), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    
    document.getElementById('totalSales').textContent = totalSales.toFixed(2);
    document.getElementById('totalExpensesSummary').textContent = totalExpenses.toFixed(2);
    document.getElementById('netProfitLossSummary').textContent = (totalSales - totalExpenses).toFixed(2);
}
// Bill Generation Functionality
// ===== BILL GENERATION (UPDATED) ===== //
document.getElementById('generateBillBtn').addEventListener('click', function() {
    if (!isShopOpen) {
        alert('Please open the shop first!');
        return;
    }
    
    const billItems = document.getElementById('billItems');
    billItems.innerHTML = '';
    
    // Show only products with current sales (sold > 0)
    const currentBillItems = products.filter(p => p.sold > 0);
    
    if (currentBillItems.length === 0) {
        billItems.innerHTML = '<p>No items sold in this session!</p>';
    } else {
        let subtotal = 0;
        
        currentBillItems.forEach(product => {
            const itemTotal = product.price * product.sold;
            subtotal += itemTotal;
            
            const itemDiv = document.createElement('div');
            itemDiv.className = 'bill-item';
            itemDiv.innerHTML = `
                <p>${product.name} - ₹${product.price.toFixed(2)} × ${product.sold} = ₹${itemTotal.toFixed(2)}</p>
            `;
            billItems.appendChild(itemDiv);
        });
        
        const totalDiv = document.createElement('div');
        totalDiv.className = 'bill-total';
        totalDiv.innerHTML = `<h3>Subtotal: ₹${subtotal.toFixed(2)}</h3>`;
        billItems.appendChild(totalDiv);
    }
    
    document.getElementById('billPopup').style.display = 'flex';
});

document.getElementById('billForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const customerName = document.getElementById('customerName').value;
    const discount = parseFloat(document.getElementById('discount').value) || 0;
    
    // 1. Capture items sold ONLY in this billing session
    const currentBillItems = products.filter(p => p.sold > 0);
    const subtotal = currentBillItems.reduce((sum, p) => sum + (p.price * p.sold), 0);
    const total = subtotal * (1 - discount/100);
    
    // 2. Generate receipt
    alert(`BILL RECEIPT\n
Customer: ${customerName}\n
${currentBillItems.map(p => 
    `${p.name} - ${p.sold} × ₹${p.price.toFixed(2)} = ₹${(p.sold * p.price).toFixed(2)}`
).join('\n')}\n
Subtotal: ₹${subtotal.toFixed(2)}\n
Discount: ${discount}%\n
Total: ₹${total.toFixed(2)}`);
    
    // 3. Reset SOLD quantities (but keep soldToday for daily summary)
    products.forEach(p => p.sold = 0);
    localStorage.setItem('products', JSON.stringify(products));
    
    // 4. Close popup and refresh UI
    document.getElementById('billPopup').style.display = 'none';
    this.reset();
    renderProducts(); // Update the table display
});

document.getElementById('closeBillPopup').addEventListener('click', function() {
    document.getElementById('billPopup').style.display = 'none';
});
// Calculator Functionality
document.getElementById('calculatorBtn').addEventListener('click', function() {
    document.getElementById('calculatorPopup').style.display = 'flex';
    document.getElementById('calculatorInput').value = '';
});

document.querySelector('#calculatorPopup .calculator-content').addEventListener('click', function(e) {
    e.stopPropagation();
});

document.getElementById('calculatorPopup').addEventListener('click', function() {
    this.style.display = 'none';
});

const calculatorButtons = document.querySelectorAll('.calculator-buttons button');
calculatorButtons.forEach(button => {
    button.addEventListener('click', function() {
        const input = document.getElementById('calculatorInput');
        const value = this.textContent;
        
        if (value === 'C') {
            input.value = '';
        } else if (value === '=') {
            try {
                input.value = eval(input.value);
            } catch {
                input.value = 'Error';
                setTimeout(() => input.value = '', 1500);
            }
        } else {
            input.value += value;
        }
    });
});
// Update day counter display
function updateDayCounter() {
    document.getElementById('dayCounter').textContent = `Day: ${dayCounter}`;
}

// Close popup
document.getElementById('closePopup').addEventListener('click', function() {
    document.getElementById('summaryPopup').style.display = 'none';
});

// Reset data for new day (optional)
function resetForNewDay() {
    products.forEach(product => {
        product.quantity += product.sold; // Restore sold items
        product.sold = 0;
    });
    expenses = [];
    localStorage.setItem('products', JSON.stringify(products));
    localStorage.setItem('expenses', JSON.stringify(expenses));
    renderProducts();
    renderExpenses();
}
