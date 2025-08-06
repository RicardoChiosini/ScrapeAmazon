# Amazon Product Scraper

A simple full stack project to scrape the first page of Amazon product listings for a given keyword, displaying the product title, rating (stars), number of reviews, and product image.

---

## Features

- **Backend:** Bun + Express, Axios, JSDOM. Provides `/api/scrape?keyword=...` endpoint to fetch and parse Amazon search results.
- **Frontend:** Vite + Vanilla JS, HTML, CSS. User-friendly web interface for entering a keyword, searching, and viewing formatted product results.

---

## Prerequisites

- [Bun](https://bun.sh/) installed (for the backend)
- [Node.js](https://nodejs.org/) and npm installed (for the frontend with Vite)

---

## How to Run

### Backend

```bash
cd backend
bun install
bun index.ts

### Frontend

```bash
cd frontend
npm install
npm run dev