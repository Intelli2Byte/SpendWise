# SpendWise: The Gamified Financial Literacy App 💸

Welcome to **SpendWise**! This is a fun, interactive web dashboard designed to help students and teenagers learn financial literacy by turning it into a game.

Instead of a boring spreadsheet, SpendWise lets you track your spending, set budgets, and earn XP and achievement badges for making smart money decisions. It also features an AI-powered coach (WiseBot) to answer all your financial questions!
This project was built from scratch using HTML, CSS, and vanilla JavaScript, with a few powerful libraries to make it awesome.
## Key Features

* **📈 Interactive Dashboard:** See your balance, income, and expenses at a glance.
* **📊 Expense Tracking:** Log every transaction and see your spending broken down by category with a dynamic doughnut chart (using Chart.js).
* **🎯 Smart Budgeting:** Set monthly budgets for categories like 'Food' and 'Shopping' and get visual feedback as you spend.
* **🤖 AI-Powered WiseBot:** Ask any finance question (like "What's the 50/30/20 rule?") and get a real, instant answer from an AI coach (powered by the Groq LLaMA 3 API).
* **🏆 Gamified Rewards:** Earn XP, level up, and unlock 6 achievement badges for good financial habits like setting your first budget or starting a saving streak.
* **📚 Learning Hub:** Complete 5 bite-sized, interactive lessons on core topics like 'Compound Interest', 'Credit Cards', and 'Investing'.
* # 🛠️ Tech Stack

This project is 100% frontend and runs right in your browser.

* **Core:** HTML5, CSS3, JavaScript (ES6+)
* **Animations:** [**GSAP (GreenSock)**](https://greensock.com/gsap/) for smooth page transitions and modal animations.
* **Charting:** [**Chart.js**](https://www.chartjs.org/) for the "Spending by Category" chart on the dashboard.
* **AI:** [**Groq API**](https://groq.com/) to power the WiseBot with the `llama3-8b-8192` model.

## Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/Intelli2Byte/SpendWise.gitt](https://github.com/Intelli2Byte)
    ```
    (Or just download the ZIP file and unzip it).

2.  **Navigate to the project directory:**
    ```bash
    cd spendwise-project
    ```

3.  **Run with Live Server (Easy Way):**
    * In VS Code, open the "Extensions" tab and install **Live Server**.
    * Right-click on the `index.html` file.
    * Select **"Open with Live Server"**.
    * This will automatically open the app in your browser (at a URL like `http://127.0.0.1:5500`), and everything will work!

---

## ⚙️ Configuration

The **WiseBot AI Coach will not work** until you add your own free Groq API key.

1.  **Get a Free API Key:**
    * Go to [console.groq.com](https://console.groq.com/).
    * Sign up for a free account.
    * On your dashboard, go to **"API Keys"** and create a new secret key.
    * Copy the key.

2.  **Add the Key to the Code:**
    * Open the `script.js` file.
    * Find the line (around line 430) that says:
        ```javascript
        // ▼▼▼ PASTE YOUR *NEW* API KEY HERE ▼▼▼
        const GROQ_API_KEY = 'PASTE_YOUR_NEW_API_KEY_HERE';
        ```
    * Paste your **new** API key inside the quotes.

3.  **Restart your Live Server** (if it's running) and the WiseBot will now be fully functional!

---

## 🎮 How to Use the App

1.  **Add Transactions:** Click the "Add Transaction" button to log your income (like an allowance) or expenses (like buying coffee).
2.  **Set Budgets:** Go to the "Budget" page to set spending limits for different categories.
3.  **Chat with WiseBot:** Go to the "WiseBot" page and ask the AI coach for saving tips or to explain financial terms.
4.  **Learn & Earn:** Visit the "Learning Hub" to read short lessons. Click "Start Lesson" to see the details.
5.  **Get Rewarded:** Go to the "Rewards" page to see your level and which badges you've unlocked!

---let's Connect on [Linkeldn](www.linkedin.com/in/neha-maurya-644a1a290)
