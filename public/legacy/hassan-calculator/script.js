// State
const state = {
    display: '0',      // what's shown as the main number
    expression: '',       // the expression line above
    operand: null,     // stored left-hand operand
    operator: null,     // pending operator symbol
    waitingForRHS: false,   // true right after an operator is pressed
    justEqualed: false,    // true right after = is pressed
};

// History - stores last 2 completed calculations
const history = [];

// DOM refs
const resultEl = document.getElementById('result');
const expressionEl = document.getElementById('expression');
const historyEl = document.getElementById('history');
const grid = document.querySelector('.grid');

// Arithmetic engine (no eval)
function compute(a, op, b) {
    a = parseFloat(a);
    b = parseFloat(b);
    switch (op) {
        case '+': return a + b;
        case '−': return a - b;
        case '×': return a * b;
        case '÷':
            if (b === 0) throw new Error('Division by zero');
            return a / b;
    }
}

// Format a number for display
function fmt(n) {
    if (!isFinite(n)) return 'Error';
    // Limit to 10 significant digits to avoid floating-point noise
    const s = parseFloat(n.toPrecision(10)).toString();
    // Add thousands separators only for integers
    if (!s.includes('.') && !s.includes('e')) {
        return Number(s).toLocaleString('en-US');
    }
    return s;
}

// Render
function render() {
    // Main result
    resultEl.textContent = state.display;
    resultEl.className = 'result';

    const len = state.display.replace(/[,]/g, '').length;
    if (len > 14) resultEl.classList.add('xsmall');
    else if (len > 9) resultEl.classList.add('small');

    // Expression line
    expressionEl.textContent = state.expression;

    // History strip
    historyEl.innerHTML = history
        .slice(-2)
        .map(h => `<div class="history-item">${h}</div>`)
        .join('');

    // Highlight active operator button
    document.querySelectorAll('.btn-op').forEach(btn => {
        btn.classList.toggle(
            'active-op',
            btn.dataset.op === state.operator && state.waitingForRHS && !state.justEqualed
        );
    });

    // Update AC ↔ C label
    const clearBtn = document.querySelector('[data-action="clear"]');
    clearBtn.textContent = state.display !== '0' || state.operand !== null ? 'C' : 'AC';
}

// Actions

function inputDigit(digit) {
    if (state.waitingForRHS || state.justEqualed) {
        // Start fresh right-hand side
        state.display = digit === '0' ? '0' : digit;
        state.waitingForRHS = false;
        state.justEqualed = false;
    } else {
        if (state.display === '0' && digit !== '.') {
            state.display = digit;
        } else {
            if (state.display.replace(/[^0-9.]/g, '').length >= 15) return; // cap input length
            state.display += digit;
        }
    }
}

function inputDecimal() {
    if (state.waitingForRHS || state.justEqualed) {
        state.display = '0.';
        state.waitingForRHS = false;
        state.justEqualed = false;
        return;
    }
    if (!state.display.includes('.')) {
        state.display += '.';
    }
}

function inputOperator(op) {
    const current = parseFloat(state.display);

    if (state.operand !== null && !state.waitingForRHS) {
        // Chain: compute pending op first
        try {
            const result = compute(state.operand, state.operator, current);
            const resultFmt = fmt(result);
            state.expression = `${fmt(state.operand)} ${state.operator} ${fmt(current)} =`;
            state.display = resultFmt;
            state.operand = result;
            history.push(`${fmt(state.operand)} ${op}`);
        } catch (e) {
            state.display = e.message === 'Division by zero' ? '∞' : 'Error';
            state.expression = '';
            state.operand = null;
            state.operator = null;
            resultEl.classList.add('error');
            render();
            return;
        }
    } else {
        state.operand = current;
    }

    state.operator = op;
    state.waitingForRHS = true;
    state.justEqualed = false;
    state.expression = `${fmt(state.operand)} ${op}`;
}

function calculate() {
    if (state.operator === null || state.operand === null) return;

    const rhs = parseFloat(state.display);
    const lhs = state.operand;
    const op = state.operator;

    try {
        const result = compute(lhs, op, rhs);
        const resultFmt = fmt(result);

        // Add to history
        history.push(`${fmt(lhs)} ${op} ${fmt(rhs)} = ${resultFmt}`);
        if (history.length > 10) history.shift();

        state.expression = `${fmt(lhs)} ${op} ${fmt(rhs)} =`;
        state.display = resultFmt;
        state.operand = result;   // allow chaining after =
        state.justEqualed = true;
        state.waitingForRHS = false;
    } catch (e) {
        state.display = e.message === 'Division by zero' ? '∞' : 'Error';
        state.expression = `${fmt(lhs)} ${op} ${fmt(rhs)} =`;
        state.operand = null;
        state.operator = null;
        state.justEqualed = false;
        resultEl.classList.add('error');
    }
}

function clearEntry() {
    if (state.display !== '0' && !state.justEqualed) {
        state.display = '0';           // "C" - clear current entry only
    } else {
        // "AC" - full reset
        state.display = '0';
        state.expression = '';
        state.operand = null;
        state.operator = null;
        state.waitingForRHS = false;
        state.justEqualed = false;
    }
}

function toggleNegate() {
    const n = parseFloat(state.display);
    if (isNaN(n) || n === 0) return;
    state.display = fmt(-n);
    state.justEqualed = false;
}

function applyPercent() {
    const n = parseFloat(state.display);
    if (isNaN(n)) return;
    state.display = fmt(n / 100);
    state.justEqualed = false;
}

function deleteChar() {
    // Remove last character from display
    if (state.justEqualed) {
        // If just calculated, start fresh
        state.display = '0';
        state.justEqualed = false;
    } else if (state.display.length > 1) {
        // Remove last character
        state.display = state.display.slice(0, -1);
    } else if (state.display !== '0') {
        // If single character, reset to 0
        state.display = '0';
    }
}

// Dispatch
function dispatch(action, data) {
    switch (action) {
        case 'num': inputDigit(data.val); break;
        case 'decimal': inputDecimal(); break;
        case 'op': inputOperator(data.op); break;
        case 'equals': calculate(); break;
        case 'clear': clearEntry(); break;
        case 'negate': toggleNegate(); break;
        case 'percent': applyPercent(); break;
        case 'backspace': deleteChar(); break;
    }
    render();
}

// Button click handler (event delegation)
grid.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn');
    if (!btn) return;

    // Ripple
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const rect = btn.getBoundingClientRect();
    ripple.style.left = `${e.clientX - rect.left - 30}px`;
    ripple.style.top = `${e.clientY - rect.top - 30}px`;
    btn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());

    dispatch(btn.dataset.action, btn.dataset);
});

// Keyboard support
const keyMap = {
    '0': ['num', { val: '0' }], '1': ['num', { val: '1' }],
    '2': ['num', { val: '2' }], '3': ['num', { val: '3' }],
    '4': ['num', { val: '4' }], '5': ['num', { val: '5' }],
    '6': ['num', { val: '6' }], '7': ['num', { val: '7' }],
    '8': ['num', { val: '8' }], '9': ['num', { val: '9' }],
    '.': ['decimal', {}], ',': ['decimal', {}],
    '+': ['op', { op: '+' }], '-': ['op', { op: '−' }],
    '*': ['op', { op: '×' }], '/': ['op', { op: '÷' }],
    'Enter': ['equals', {}],
    '=': ['equals', {}],
    'Backspace': ['backspace', {}],
    'Delete': ['backspace', {}],
    'Escape': ['clear', {}],
    '%': ['percent', {}],
};

document.addEventListener('keydown', (e) => {
    // Don't intercept browser shortcuts
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    const mapped = keyMap[e.key];
    if (!mapped) return;

    e.preventDefault();
    const [action, data] = mapped;

    // Flash the matching button
    let selector = null;
    if (action === 'num') selector = `[data-val="${data.val}"]`;
    else if (action === 'op') selector = `[data-op="${data.op}"]`;
    else if (action === 'equals') selector = '[data-action="equals"]';
    else if (action === 'decimal') selector = '[data-action="decimal"]';
    else if (action === 'clear') selector = '[data-action="clear"]';
    else if (action === 'percent') selector = '[data-action="percent"]';

    if (selector) {
        const btn = document.querySelector(selector);
        if (btn) {
            btn.classList.add('pressed');
            setTimeout(() => btn.classList.remove('pressed'), 120);
        }
    } else if (action === 'backspace') {
        const btn = document.querySelector('[data-action="backspace"]');
        if (btn) {
            btn.classList.add('pressed');
            setTimeout(() => btn.classList.remove('pressed'), 120);
        }
    }

    dispatch(action, data);
});

// Init
render();