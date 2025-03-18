let isDayOpen = false;
let products = [];
let soldItems = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    checkDayStatus();
});

// Day Controls
function toggleDay() {
    isDayOpen = !isDayOpen;
    localStorage.setItem('isDayOpen', isDayOpen);
    checkDayStatus();
    if(!isDayOpen) resetSoldItems();
}

function checkDayStatus() {
    const status = localStorage.getItem('isDayOpen') === 'true';
    isDayOpen = status;
    document.getElementById('toggleDay').textContent = status ? 'Close Day' : 'Open Day';
    document.getElementById('dayStatus').textContent = `Status: ${status ? 'Open' : 'Closed'}`;
    document.getElementById('addBtn').disabled = !status;
    document.getElementById('billBtn').disabled = !status;
}

// Product Management
function addProduct() {
    const name = document.getElementById('productName').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const stock = parseInt(document.getElementById('productStock').value);

    if(name && price && stock) {
        const product = {
            id: Date.now(),
            name,
            price,
            stock,
            sold: 0
        };
        products.push(product);
        saveProducts();
        renderProducts();
        clearForm();
    }
}

function sellProduct(id) {
    const product = products.find(p => p.id === id);
    if(product.stock > 0) {
        product.stock--;
        product.sold++;
        soldItems.push({...product, time: new Date()});
        saveProducts();
        renderProducts();
    }
}

function deleteProduct(id) {
    products = products.filter(p => p.id !== id);
    saveProducts();
    renderProducts();
}

// Bill Generation
function showBill() {
    const modal = document.getElementById('billModal');
    const billItems = document.getElementById('billItems');
    let total = 0;
    
    billItems.innerHTML = products.filter(p => p.sold > 0)
        .map(p => {
            total += p.price * p.sold;
            return `<div>${p.name} x${p.sold} = $${(p.price * p.sold).toFixed(2)}</div>`;
        }).join('');
    
    document.getElementById('totalAmount').textContent = `Total: $${total.toFixed(2)}`;
    modal.style.display = 'block';
}

// Calculator
function showCalculator() {
    document.getElementById('calcModal').style.display = 'block';
    const display = document.getElementById('calcDisplay');
    let currentValue = '';

    document.querySelectorAll('.calc-buttons button').forEach(btn => {
        btn.onclick = () => {
            if(btn.textContent === '=') {
                try {
                    currentValue = eval(currentValue).toString();
                } catch {
                    currentValue = 'Error';
                }
            } else if(btn.textContent === 'C') {
                currentValue = '';
            } else {
                currentValue += btn.textContent;
            }
            display.value = currentValue;
        };
    });
}

// Helpers
function closeModal() {
    document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
}

function saveProducts() {
    localStorage.setItem('products', JSON.stringify(products));
}

function loadProducts() {
    products = JSON.parse(localStorage.getItem('products') || []);
    renderProducts();
}

function renderProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filtered = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm)
    );
    
    const html = filtered.map(p => `
        <div class="product-item">
            <div>
                <h3>${p.name}</h3>
                <p>Price: $${p.price.toFixed(2)}</p>
                <p>Stock: ${p.stock}</p>
            </div>
            <div>
                <button onclick="sellProduct(${p.id})">Sell</button>
                <button onclick="deleteProduct(${p.id})">Delete</button>
            </div>
        </div>
    `).join('');
    document.getElementById('productList').innerHTML = html;
}

function clearForm() {
    document.getElementById('productName').value = '';
    document.getElementById('productPrice').value = '';
    document.getElementById('productStock').value = '';
}

function resetSoldItems() {
    products.forEach(p => p.sold = 0);
    saveProducts();
}

// Search
document.getElementById('searchInput').addEventListener('input', renderProducts);
document.getElementById('toggleDay').addEventListener('click', toggleDay);

// Close modal when clicking outside
window.onclick = function(event) {
    if(event.target.classList.contains('modal')) {
        closeModal();
    }
}
