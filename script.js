document.addEventListener('DOMContentLoaded', () => {
    // --- DOM ELEMENT SELECTORS ---
    const navItems = document.querySelectorAll('.nav-item');
    const addTransactionBtns = document.querySelectorAll('.add-transaction-btn');
    
    // Modals
    const transactionModal = document.getElementById('transaction-modal');
    const budgetModal = document.getElementById('set-budget-modal');
    
    // Forms & Inputs
    const transactionForm = document.getElementById('transaction-form');
    const budgetForm = document.getElementById('budget-form');
    const chatForm = document.getElementById('chat-input-form');
    const chatInput = document.getElementById('chat-input');
    
    // Dynamic Content Areas
    const transactionList = document.getElementById('transaction-list');
    const recentTransactionList = document.getElementById('recent-transaction-list');
    const chatBox = document.getElementById('chat-box');
    const suggestionChipsContainer = document.getElementById('suggestion-chips'); // Added for suggestions
    
    // Empty States
    const emptyState = document.getElementById('empty-state');
    const recentEmptyState = document.getElementById('recent-empty-state');
    const emptyStateChart = document.getElementById('empty-state-chart');

    // Metric Elements
    const balanceValueEl = document.getElementById('balance-value');
    const incomeValueEl = document.getElementById('income-value');
    const expensesValueEl = document.getElementById('expenses-value');
    const totalIncomeEl = document.getElementById('total-income');
    const totalExpensesEl = document.getElementById('total-expenses');
    const totalBudgetEl = document.getElementById('total-budget');
    const totalSpentBudgetEl = document.getElementById('total-spent-budget');

    // Chart.js Canvas
    const ctx = document.getElementById('category-chart').getContext('2d');
    let categoryChart;

    // --- STATE MANAGEMENT ---
    let transactions = [];
    let budgets = {}; 

    // --- INITIALIZATION ---
    initializeChart();
    updateDateHeaders();
    addInitialBotMessage();
    
    // Initial animations
    gsap.from(".sidebar", { duration: 0.8, x: -250, opacity: 0, ease: "power3.out" });
    gsap.from(".page-content.active > *", {
        duration: 0.7, y: 40, opacity: 0, stagger: 0.1, delay: 0.3, ease: "power2.out"
    });

    // --- EVENT LISTENERS ---
    navItems.forEach(item => item.addEventListener('click', handleNavClick));
    addTransactionBtns.forEach(btn => btn.addEventListener('click', () => showModal(transactionModal)));
    transactionModal.addEventListener('click', (e) => e.target === transactionModal && hideModal(transactionModal));
    transactionForm.addEventListener('submit', handleTransactionSubmit);

    document.getElementById('set-budget-btn').addEventListener('click', () => showModal(budgetModal));
    budgetModal.addEventListener('click', (e) => e.target === budgetModal && hideModal(budgetModal));
    budgetForm.addEventListener('submit', handleBudgetSubmit);
    
    document.getElementById('cancel-btn').addEventListener('click', () => hideModal(transactionModal));
    document.getElementById('cancel-budget-btn').addEventListener('click', () => hideModal(budgetModal));
    
    // Updated Chat Listeners
    chatForm.addEventListener('submit', handleChatSubmit);
    if (suggestionChipsContainer) {
        suggestionChipsContainer.addEventListener('click', handleSuggestionClick);
    }

    // --- MAIN FUNCTIONS ---
    function handleNavClick(e) {
        e.preventDefault();
        const targetPage = this.dataset.page;
        if (!targetPage || this.classList.contains('active')) return;

        navItems.forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');
        switchPage(targetPage);
    }

    function switchPage(targetPageId) {
        const currentPage = document.querySelector('.page-content.active');
        const nextPage = document.getElementById(`${targetPageId}-page-content`);
        if (!nextPage) return;

        gsap.to(currentPage, {
            duration: 0.3, autoAlpha: 0, y: 20, ease: 'power2.in',
            onComplete: () => {
                currentPage.classList.remove('active');
                nextPage.classList.add('active');
                gsap.fromTo(nextPage, { autoAlpha: 0, y: -20 }, { duration: 0.4, autoAlpha: 1, y: 0, ease: 'power2.out' });
                gsap.from(nextPage.children, { duration: 0.5, y: 30, opacity: 0, stagger: 0.1, ease: "power2.out" });
            }
        });
    }

    function showModal(modalElement) {
        modalElement.classList.add('active');
        gsap.to(modalElement, { duration: 0.3, opacity: 1 });
        gsap.from(modalElement.querySelector('.modal-content'), { duration: 0.3, scale: 0.9, y: -20, ease: 'power2.out' });
    }

    function hideModal(modalElement) {
        gsap.to(modalElement, {
            duration: 0.3, opacity: 0, onComplete: () => modalElement.classList.remove('active')
        });
    }

    function handleTransactionSubmit(e) {
        e.preventDefault();
        const description = this.querySelector('#description').value;
        const amount = parseFloat(this.querySelector('#amount').value);
        const type = this.querySelector('input[name="type"]:checked').value;
        const category = this.querySelector('#category').value;

        if (!description || isNaN(amount) || amount <= 0) {
            alert('Please enter a valid description and amount.');
            return;
        }

        transactions.unshift({ id: Date.now(), description, amount, type, category });
        runAllUpdates();
        this.reset();
        hideModal(transactionModal);
    }

    function handleBudgetSubmit(e) {
        e.preventDefault();
        const category = this.querySelector('#budget-category').value;
        const amount = parseFloat(this.querySelector('#budget-amount').value);

        if (isNaN(amount) || amount < 0) {
            alert('Please enter a valid budget amount.');
            return;
        }
        budgets[category] = amount;
        runAllUpdates();
        this.reset();
        hideModal(budgetModal);
    }
    
    // --- UI UPDATE FUNCTIONS --- (No Changes Here) ---
    
    function runAllUpdates() {
        updateTotals();
        renderFullTransactionList();
        renderRecentTransactions();
        updateCategoryChart();
        updateBudgetDisplay();
    }
    
    function updateTotals() {
        const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
        const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
        const balance = totalIncome - totalExpenses;

        balanceValueEl.textContent = `$${balance.toFixed(2)}`;
        incomeValueEl.textContent = `$${totalIncome.toFixed(2)}`;
        expensesValueEl.textContent = `$${totalExpenses.toFixed(2)}`;
        totalIncomeEl.textContent = `$${totalIncome.toFixed(2)}`;
        totalExpensesEl.textContent = `$${totalExpenses.toFixed(2)}`;
        totalSpentBudgetEl.textContent = `$${totalExpenses.toFixed(2)}`;
    }

    function renderTransactionList(listEl, transactionArr, emptyEl) {
        listEl.innerHTML = '';
        emptyEl.classList.toggle('active', transactionArr.length === 0);
        if (transactionArr.length > 0) {
            transactionArr.forEach(t => addTransactionToDOM(listEl, t));
        }
    }

    function renderFullTransactionList() { renderTransactionList(transactionList, transactions, emptyState); }
    function renderRecentTransactions() { renderTransactionList(recentTransactionList, transactions.slice(0, 3), recentEmptyState); }

    function addTransactionToDOM(listEl, transaction) {
        const item = document.createElement('li');
        item.className = 'transaction-item';
        
        const isIncome = transaction.type === 'income';
        const sign = isIncome ? '+' : '-';
        const icon = isIncome ? 
            `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V4M17 9l-5-5-5 5"/></svg>` : 
            `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v16m5-5-5 5-5-5"/></svg>`;

        item.innerHTML = `
            <div class="transaction-details">
                <div class="transaction-icon ${transaction.type}">
                    ${icon}
                </div>
                <div>
                    <div class="transaction-desc">${transaction.description}</div>
                    <div class="transaction-category">${transaction.category}</div>
                </div>
            </div>
            <div class="transaction-amount ${transaction.type}">
                ${sign}$${transaction.amount.toFixed(2)}
            </div>
        `;
        listEl.appendChild(item);
    }

    function updateBudgetDisplay() {
        let totalBudget = 0;
        document.querySelectorAll('.budget-category-card').forEach(card => {
            const category = card.dataset.category;
            const budgetAmount = budgets[category];
            const spentAmount = transactions.filter(t => t.type === 'expense' && t.category === category).reduce((acc, t) => acc + t.amount, 0);
            
            const statusText = card.querySelector('.budget-status-text');
            const spentText = card.querySelector('.budget-spent-text');
            const progressBar = card.querySelector('.budget-progress-bar');
            
            spentText.textContent = `$${spentAmount.toFixed(2)} spent`;
            
            if (budgetAmount > 0) {
                totalBudget += budgetAmount;
                const percentSpent = Math.min((spentAmount / budgetAmount) * 100, 100);
                statusText.textContent = `$${spentAmount.toFixed(2)} of $${budgetAmount.toFixed(2)}`;
                progressBar.style.width = `${percentSpent}%`;
                
                progressBar.classList.remove('warning', 'danger');
                spentText.classList.remove('over-budget');
                
                if (percentSpent > 90) {
                    progressBar.classList.add('danger');
                } else if (percentSpent > 70) {
                    progressBar.classList.add('warning');
                }
                if (spentAmount > budgetAmount) {
                    spentText.classList.add('over-budget');
                    statusText.textContent = `$${(spentAmount - budgetAmount).toFixed(2)} over budget`;
                }
            } else {
                statusText.textContent = 'No budget set';
                progressBar.style.width = '0%';
                spentText.classList.remove('over-budget');
            }
        });
        totalBudgetEl.textContent = `$${totalBudget.toFixed(2)}`;
    }

    function updateCategoryChart() {
        const expenses = transactions.filter(t => t.type === 'expense');
        emptyStateChart.classList.toggle('active', expenses.length === 0);
        ctx.canvas.style.display = expenses.length === 0 ? 'none' : 'block';
        
        if (expenses.length > 0) {
            const spendingByCategory = expenses.reduce((acc, t) => {
                acc[t.category] = (acc[t.category] || 0) + t.amount;
                return acc;
            }, {});
            categoryChart.data.labels = Object.keys(spendingByCategory);
            categoryChart.data.datasets[0].data = Object.values(spendingByCategory);
            categoryChart.update();
        }
    }

    function updateDateHeaders() {
        const date = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const monthYearOptions = { year: 'numeric', month: 'long' };
        document.getElementById('dashboard-date').textContent = date.toLocaleDateString('en-US', options);
        document.getElementById('budget-month').textContent = `Set spending limits for ${date.toLocaleDateString('en-US', monthYearOptions)}`;
    }
    
    // --- CHART INITIALIZATION ---
    function initializeChart() {
        categoryChart = new Chart(ctx, {
            type: 'doughnut',
            data: { 
                labels: [], 
                datasets: [{ 
                    data: [], 
                    backgroundColor: ['#6096BA', '#A3CEF1', '#8B8C89', '#FF6B6B', '#FF9933', '#28a745', '#3E6B9B'], 
                    borderColor: '#F8F9FA', // Added border for separation
                    borderWidth: 4 
                }] 
            },
            options: { 
                responsive: true, 
                maintainAspectRatio: false, 
                cutout: '70%', 
                plugins: { 
                    legend: { 
                        position: 'bottom', 
                        labels: { 
                            padding: 20, 
                            font: { family: "'Inter', sans-serif" } 
                        } 
                    } 
                } 
            }
        });
    }

// ===============================================
    // === WISEBOT API FUNCTIONS (CORRECTED) ===
    // ===============================================

    // --- 1. SET YOUR API KEY ---
    // Get your NEW key from https://console.groq.com/
    
    // ▼▼▼ PASTE YOUR *NEW* API KEY HERE ▼▼▼
    const GROQ_API_KEY = '/////////E'; 
    
    const API_URL = 'https://api.groq.com/openai/v1/chat/completions';

    /**
     * Handles the chat form submission
     */
    function handleChatSubmit(e) {
        e.preventDefault();
        const userMessage = chatInput.value.trim();
        if (userMessage === '') return;
        
        addChatMessage(userMessage, 'user');
        chatInput.value = '';
        
        // Call the new async function
        fetchGrokResponse(userMessage);
    }

    /**
     * Handles clicking on a suggestion chip
     */
    function handleSuggestionClick(event) {
        if (event.target.classList.contains('suggestion-chip')) {
            const userMessage = event.target.dataset.prompt;
            addChatMessage(userMessage, 'user');
            fetchGrokResponse(userMessage);
        }
    }

    /**
     * Fetches a response from the Groq API
     * @param {string} userMessage - The message from the user
     */
    async function fetchGrokResponse(userMessage) {
        
        // This is the CORRECTED check.
        // It checks if you've replaced the placeholder text above.
        // ▼▼▼ DO NOT CHANGE THIS IF-STATEMENT ▼▼▼
        if (GROQ_API_KEY === 'PASTE_YOUR_NEW_API_KEY_HERE' || GROQ_API_KEY === 'YOUR_API_KEY_HERE') {
            addChatMessage("Please add your new Groq API key to the script.js file first! (Around line 211)", 'bot');
            return;
        }

        showTypingIndicator();

        // System prompt to give the AI context
        const systemPrompt = `You are WiseBot, a friendly and helpful financial assistant for students and teenagers. 
        Your goal is to provide simple, clear, and actionable financial advice. 
        Keep your answers concise (2-3 sentences max) and easy to understand. Use emojis where appropriate.
        The user is using an app called SpendWise.
        Based on the user's transactions:
        - Total Income: ${totalIncomeEl.textContent}
        - Total Expenses: ${totalExpensesEl.textContent}
        - Current Balance: ${balanceValueEl.textContent}
        Use this data if the user asks about their spending, but don't state it unless asked.`;

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`, // Uses the key from the const variable
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'llama3-8b-8192', // Fast and capable model
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userMessage }
                    ],
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                const errorBody = await response.text();
                console.error('API Error Response:', errorBody); // Helps you debug in F12 Console
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            const botResponse = data.choices[0].message.content;
            
            addChatMessage(botResponse, 'bot');

        } catch (error) {
            console.error('Error fetching Groq response:', error);
            addChatMessage("Oops! I'm having a little trouble connecting. Please try again in a moment. 🛠️", 'bot');
        } finally {
            hideTypingIndicator();
        }
    }

    /**
     * Adds the initial welcome message to the chat
     */
    function addInitialBotMessage() {
        const welcomeMessage = "Hi! I'm WiseBot, your personal financial coach! 🤖 Ask me about the 50/30/20 rule, or how you can save more money.";
        addChatMessage(welcomeMessage, 'bot');
    }
    
    /**
     * Adds a message to the chat DOM
     * @param {string} message - The text of the message
     * @param {string} sender - 'user' or 'bot'
     */
    function addChatMessage(message, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', `${sender}-message`);
        messageElement.textContent = message; // Use textContent for security
        chatBox.appendChild(messageElement);
        
        gsap.from(messageElement, { duration: 0.5, opacity: 0, y: 20, ease: 'power3.out' });
        scrollToChatBottom();
    }

    /**
     * Shows a "typing..." indicator
     * THIS FUNCTION IS NOW FIXED
     */
    function showTypingIndicator() {
        if (chatBox.querySelector('.typing-indicator')) return; // Already showing
        
        const typingElement = document.createElement('div');
        typingElement.classList.add('chat-message', 'bot-message', 'typing-indicator');
        
        // This is the corrected HTML with no typos
        typingElement.innerHTML = `
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
        `;
        
        chatBox.appendChild(typingElement);
        scrollToChatBottom();
    }

    /**
     * Hides the "typing..." indicator
     */
    function hideTypingIndicator() {
        const typingElement = chatBox.querySelector('.typing-indicator');
        if (typingElement) {
            chatBox.removeChild(typingElement);
        }
    }

    /**
     * Scrolls the chat box to the bottom
     */
    function scrollToChatBottom() {
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}); function handleStartLesson(event) {
        const lessonId = event.currentTarget.dataset.lesson;
        const lesson = lessons[lessonId];

        if (!lesson) {
            console.error('Lesson not found:', lessonId);
            return;
        }

        // 1. Populate the lesson page
        document.getElementById('lesson-page-title').textContent = lesson.title;
        document.getElementById('lesson-page-level').textContent = lesson.level;
        document.getElementById('lesson-page-level').className = `lesson-page-level ${lesson.level}`;
        document.getElementById('lesson-page-content-body').innerHTML = lesson.content;
        
        // Find the XP span and update its text content
        const xpSpan = document.getElementById('lesson-page-xp');
        // Rebuild the XP content to include the SVG
        xpSpan.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            ${lesson.xp}
        `;

        // 2. Switch pages
        switchPage('lesson-detail');
    }

    function handleBackToLearning() {
        // Switch pages (from Lesson Detail back to Learning Hub)
        switchPage('learning');
    }