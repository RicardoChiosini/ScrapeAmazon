// Import necessary modules
import express from "express";
import axios from "axios";
import fs from "fs";
import { JSDOM } from "jsdom";
import cors from "cors";

// Create an Express app and define the port to use
const app = express();
const PORT = 3001;

// Enable CORS to allow requests from the frontend (running on a different port)
app.use(cors());

/**
 * GET /api/scrape
 * Example: /api/scrape?keyword=laptop
 * Returns product listings from the first page of Amazon search results for the given keyword.
 */
app.get("/api/scrape", async (req, res) => {
    const keyword = req.query.keyword as string;

    if (!keyword) {
        // Return 400 error if keyword is missing
        return res.status(400).json({ error: "Keyword is required" });
    }

    try {
        // Construct the Amazon search URL using the provided keyword
        const url = `https://www.amazon.com.br/s?k=${encodeURIComponent(keyword)}`;
        // Fetch the HTML content using a browser User-Agent to reduce bot detection
        const { data: html } = await axios.get(url, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
            },
        });

        // Optionally, save the HTML for debugging purposes
        fs.writeFileSync("last-amazon.html", html);

        // Parse the HTML with JSDOM
        const dom = new JSDOM(html);
        const document = dom.window.document;

        const products: any[] = [];
        // Select all product card nodes on the page
        const productNodes = document.querySelectorAll("div[data-component-type='s-search-result']");
        console.log("Product nodes found:", productNodes.length);

        productNodes.forEach((node) => {
            // Try to extract the product title
            let title = null;
            const titleElem = node.querySelector("h2 a span") || node.querySelector("h2 span");
            if (titleElem) title = titleElem.textContent?.trim();

            // Try to extract the product image URL
            let image = null;
            const imgElem = node.querySelector("img.s-image") || node.querySelector("img[data-image-latency]");
            if (imgElem) image = imgElem.getAttribute("src");

            // Try to extract the rating (stars)
            let rating = null;
            const ratingElem = node.querySelector("span.a-icon-alt");
            const text = ratingElem?.textContent ?? "";
            const match = text.match(/([\d.,]+)\s*(de|out of)/i);
            if (match && match[1]) {
                rating = match[1].replace(',', '.');
            }

            // Try to extract the number of reviews (fallback to text content if aria-label is missing)
            let reviews = null;
            const reviewElem = node.querySelector("span[aria-label$=' ratings'], span[aria-label$=' rating'], span.a-size-base");
            if (reviewElem) {
                reviews = reviewElem.getAttribute("aria-label") ||
                    reviewElem.textContent?.replace(/[^0-9,.]/g, "");
            }

            // For debugging: log the extracted fields
            console.log({ title, image, rating, reviews });

            // Only include products that have both a title and image
            if (title && image) {
                products.push({
                    title,
                    rating,
                    reviews,
                    image,
                });
            }
        });

        // Return the scraped product data as JSON
        res.json({ products });
    } catch (error) {
        // Log and return a 500 error in case of scraping failure
        console.error("Scraping error:", error);
        res.status(500).json({ error: "Failed to fetch products. Try again later." });
    }
});

// Start the server and listen on the defined port
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
