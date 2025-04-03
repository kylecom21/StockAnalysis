const express = require("express");
const cors = require("cors");
const axios = require("axios");
const yahooFinance = require("yahoo-finance2").default;
require("dotenv").config();

const app = express();

// ✅ Allow frontend requests
app.use(cors({ origin: "http://localhost:3000", credentials: true }));

app.use(express.json());

const PORT = process.env.PORT || 5000;
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || "YOUR_API_KEY_HERE"; // Replace with your API key

async function getAllStocks() {
    try {
        const response = await axios.get(`https://finnhub.io/api/v1/stock/symbol?exchange=US&token=${FINNHUB_API_KEY}`);
        return response.data.map(stock => stock.symbol);
    } catch (error) {
        console.error("❌ Error fetching stock list:", error.message);
        return [];
    }
}

async function analyzeStock(stock) {
    try {
        const data = await yahooFinance.quoteSummary(stock, { modules: ["financialData", "summaryDetail"] });

        if (!data.financialData || !data.summaryDetail) {
            console.warn(`⚠️ Missing data for ${stock}`);
            return null;
        }

        const revenueGrowth = data.financialData.revenueGrowth || 0;
        const peRatio = data.summaryDetail.trailingPE || 100;
        const pegRatio = data.summaryDetail.pegRatio || 100;
        const roe = data.financialData.returnOnEquity || 0;
        const quickRatio = data.financialData.quickRatio || 0;

        if (revenueGrowth * 100 < 10 || peRatio > 25 || pegRatio > 2 || roe * 100 < 5 || quickRatio < 1.5) {
            return null;
        }

        return { stock, revenueGrowth, peRatio, pegRatio, roe, quickRatio };
    } catch (error) {
        console.error(`❌ Error fetching data for ${stock}:`, error.message);
        return null;
    }
}

app.get("/stocks", async (req, res) => {
    const stockList = await getAllStocks();
    if (stockList.length === 0) {
        return res.status(500).json({ error: "Failed to fetch stock list" });
    }

    console.log(`📊 Analyzing ${stockList.length} stocks...`);

    const results = await Promise.all(stockList.slice(0, 20).map(analyzeStock));

    res.json(results.filter(stock => stock !== null));
});

app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));
