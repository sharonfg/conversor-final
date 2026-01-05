// script-enhanced.js - Versión mejorada para la interfaz bonita

console.log('🎨 Conversor Mejorado - Cargando...');

// Elementos del DOM para la nueva interfaz
const elements = {
    amount: document.getElementById('amount'),
    fromCurrency: document.getElementById('from-currency'),
    toCurrency: document.getElementById('to-currency'),
    convertBtn: document.getElementById('convert-btn'),
    swapBtn: document.getElementById('swap-currencies'),
    resultSection: document.getElementById('result-section'),
    loading: document.getElementById('loading'),
    originalAmount: document.getElementById('original-amount'),
    originalCurrency: document.getElementById('original-currency'),
    convertedAmount: document.getElementById('converted-amount'),
    convertedCurrency: document.getElementById('converted-currency'),
    rateValue: document.getElementById('rate-value'),
    updateTime: document.getElementById('update-time'),
    ratesGrid: document.getElementById('rates-grid'),
    amountError: document.getElementById('amount-error')
};

// Variables globales
let exchangeRates = {};
let popularCurrencies = ['USD', 'EUR', 'MXN', 'COP', 'ARS', 'BRL', 'CLP', 'PEN', 'GBP', 'JPY'];

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Interfaz mejorada lista!');
    initializeApp();
});

function initializeApp() {
    setupEventListeners();
    loadExchangeRates();
    initializeRatesGrid();
}

function setupEventListeners() {
    // Botón de conversión
    elements.convertBtn.addEventListener('click', function(e) {
        e.preventDefault();
        handleConversion();
    });
    
    // Botón de intercambio
    elements.swapBtn.addEventListener('click', swapCurrencies);
    
    // Validación en tiempo real
    elements.amount.addEventListener('input', validateAmount);
    
    // Enter para convertir
    elements.amount.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleConversion();
        }
    });
    
    // Botones de acción
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const text = this.querySelector('i').className;
            if (text.includes('fa-copy')) {
                copyResult();
            } else if (text.includes('fa-history')) {
                resetConverter();
            }
        });
    });
}

async function loadExchangeRates() {
    showLoading(true);
    
    try {
        const response = await fetch(`${BASE_URL}?apikey=${API_KEY}`);
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.rates) {
            exchangeRates = data.rates;
            exchangeRates['USD'] = 1; // Base USD
            
            updateDisplayTime();
            updateRatesGrid();
            showLoading(false);
            
            // Conversión inicial
            setTimeout(() => handleConversion(), 300);
            
            console.log('✅ Tasas cargadas:', Object.keys(exchangeRates).length, 'monedas');
        }
    } catch (error) {
        console.warn('⚠️ Usando tasas de respaldo:', error.message);
        loadBackupRates();
        showLoading(false);
    }
}

function loadBackupRates() {
    exchangeRates = {
        'USD': 1,
        'EUR': 0.92,
        'MXN': 16.85,
        'COP': 3900,
        'ARS': 850,
        'BRL': 5.05,
        'CLP': 950,
        'PEN': 3.75,
        'GBP': 0.79,
        'JPY': 150
    };
    
    updateDisplayTime();
    updateRatesGrid();
    handleConversion();
}

function validateAmount() {
    const amount = parseFloat(elements.amount.value);
    
    if (isNaN(amount)) {
        elements.amountError.textContent = '❌ Por favor ingresa un número válido';
        elements.amount.style.borderColor = '#e53e3e';
        return false;
    }
    
    if (amount <= 0) {
        elements.amountError.textContent = '❌ La cantidad debe ser mayor a 0';
        elements.amount.style.borderColor = '#e53e3e';
        return false;
    }
    
    elements.amountError.textContent = '';
    elements.amount.style.borderColor = '#48bb78';
    return true;
}

function handleConversion() {
    if (!validateAmount()) return;
    
    const amount = parseFloat(elements.amount.value);
    const from = elements.fromCurrency.value;
    const to = elements.toCurrency.value;
    
    if (from === to) {
        elements.amountError.textContent = '⚠️ Selecciona monedas diferentes';
        return;
    }
    
    const convertedAmount = convertCurrency(amount, from, to);
    const rate = getExchangeRate(from, to);
    
    displayResult(amount, from, convertedAmount, to, rate);
}

function convertCurrency(amount, from, to) {
    if (!exchangeRates[from] || !exchangeRates[to]) {
        return amount * 16.8; // Tasa aproximada USD/MXN
    }
    
    const amountInUSD = from === 'USD' ? amount : amount / exchangeRates[from];
    return to === 'USD' ? amountInUSD : amountInUSD * exchangeRates[to];
}

function getExchangeRate(from, to) {
    if (!exchangeRates[from] || !exchangeRates[to]) return 16.8;
    
    if (from === 'USD') return exchangeRates[to];
    if (to === 'USD') return 1 / exchangeRates[from];
    
    return exchangeRates[to] / exchangeRates[from];
}

function displayResult(amount, from, convertedAmount, to, rate) {
    // Formatear números
    const formattedAmount = amount.toLocaleString('es-MX', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    
    const formattedConverted = convertedAmount.toLocaleString('es-MX', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    
    // Actualizar elementos
    elements.originalAmount.textContent = formattedAmount;
    elements.originalCurrency.textContent = from;
    elements.convertedAmount.textContent = formattedConverted;
    elements.convertedCurrency.textContent = to;
    elements.rateValue.textContent = `1 ${from} = ${rate.toFixed(4)} ${to}`;
    
    // Mostrar resultado con animación
    elements.resultSection.classList.remove('hidden');
    
    // Efecto visual
    elements.convertedAmount.classList.add('highlighted');
    setTimeout(() => {
        elements.convertedAmount.classList.remove('highlighted');
    }, 1000);
    
    console.log(`💰 ${amount} ${from} = ${convertedAmount.toFixed(2)} ${to}`);
}

function swapCurrencies() {
    const fromValue = elements.fromCurrency.value;
    const toValue = elements.toCurrency.value;
    
    elements.fromCurrency.value = toValue;
    elements.toCurrency.value = fromValue;
    
    // Animar el botón
    elements.swapBtn.style.transform = 'rotate(360deg)';
    setTimeout(() => {
        elements.swapBtn.style.transform = '';
    }, 300);
    
    // Convertir automáticamente
    if (!elements.resultSection.classList.contains('hidden')) {
        handleConversion();
    }
}

function updateDisplayTime() {
    const now = new Date();
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    elements.updateTime.textContent = now.toLocaleDateString('es-MX', options);
}

function initializeRatesGrid() {
    const rates = [
        { code: 'USD', name: 'Dólar USA', rate: 1.0000, trend: 'stable' },
        { code: 'EUR', name: 'Euro', rate: 0.9200, trend: 'up' },
        { code: 'MXN', name: 'Peso MX', rate: 16.8500, trend: 'down' },
        { code: 'COP', name: 'Peso CO', rate: 3900.00, trend: 'stable' },
        { code: 'ARS', name: 'Peso AR', rate: 850.00, trend: 'down' },
        { code: 'BRL', name: 'Real BR', rate: 5.0500, trend: 'up' }
    ];
    
    updateRatesGrid(rates);
}

function updateRatesGrid(ratesData) {
    if (!ratesData) {
        ratesData = popularCurrencies.map(code => ({
            code,
            name: getCurrencyName(code),
            rate: exchangeRates[code] || 0,
            trend: 'stable'
        }));
    }
    
    elements.ratesGrid.innerHTML = '';
    
    ratesData.forEach(rate => {
        const card = document.createElement('div');
        card.className = 'rate-card';
        card.innerHTML = `
            <div class="currency">${rate.code} - ${rate.name}</div>
            <div class="rate">${rate.rate.toFixed(4)}</div>
            <div class="change">
                <i class="fas fa-arrow-${rate.trend === 'up' ? 'up' : 'down'}"></i>
                ${rate.trend === 'up' ? 'Subiendo' : 'Bajando'}
            </div>
        `;
        
        card.addEventListener('click', () => {
            elements.fromCurrency.value = 'USD';
            elements.toCurrency.value = rate.code;
            handleConversion();
        });
        
        elements.ratesGrid.appendChild(card);
    });
}

function getCurrencyName(code) {
    const names = {
        'USD': 'Dólar USA',
        'EUR': 'Euro',
        'MXN': 'Peso MX',
        'COP': 'Peso CO',
        'ARS': 'Peso AR',
        'BRL': 'Real BR',
        'CLP': 'Peso CL',
        'PEN': 'Sol PE',
        'GBP': 'Libra UK',
        'JPY': 'Yen JP'
    };
    return names[code] || code;
}

function showLoading(show) {
    elements.loading.classList.toggle('hidden', !show);
    if (show) {
        elements.resultSection.classList.add('hidden');
    }
}

function copyResult() {
    const text = `${elements.originalAmount.textContent} ${elements.originalCurrency.textContent} = ${elements.convertedAmount.textContent} ${elements.convertedCurrency.textContent}`;
    
    navigator.clipboard.writeText(text).then(() => {
        alert('✅ Resultado copiado al portapapeles!');
    });
}

function resetConverter() {
    elements.amount.value = '100';
    elements.fromCurrency.value = 'USD';
    elements.toCurrency.value = 'MXN';
    elements.resultSection.classList.add('hidden');
    elements.amountError.textContent = '';
    elements.amount.style.borderColor = '#e2e8f0';
}

// Inicializar la aplicación
console.log('✨ Conversor Mejorado - Listo para usar!');