import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
    const [stocks, setStocks] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:5000/stocks")
            .then(response => setStocks(response.data))
            .catch(error => console.error("Error fetching stocks:", error));
    }, []);

    return (
        <div>
            <h1>📈 Stock Screener</h1>
            {stocks.length > 0 ? (
                <ul>
                    {stocks.map(stock => (
                        <li key={stock.stock}>
                            <strong>{stock.stock}</strong> - P/E: {stock.peRatio.toFixed(2)}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No stocks passed the criteria.</p>
            )}
        </div>
    );
}

export default App;
