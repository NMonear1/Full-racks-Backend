import express from "express";
const router = express.Router();

const BASE_URL = "https://api.stockdata.org/v1/data";
const API_KEY = process.env.STOCKDATA_API_KEY;

router.get("/:symbol", async (req, res) => {
  try {
    const { symbol } = req.params;

    const response = await fetch(
      `${BASE_URL}/quote?symbols=${symbol}&api_token=${API_KEY}`
    );

    const data = await response.json();

    if (!data || !data.data || data.data.length === 0) {
      return res.status(404).json({ error: "Stock data not found" });
    }

    res.json(data);
  } catch (error) {
    console.error("Error fetching stock data:", error);
    res.status(500).json({ error: "Error fetching stock data" });
  }
});

export default router;
