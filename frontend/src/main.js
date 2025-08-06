// Backend API URL
const apiUrl = "http://localhost:3001/api/scrape";

// Select DOM elements
const keywordInput = document.getElementById("keyword");
const scrapeBtn = document.getElementById("scrapeBtn");
const resultsDiv = document.getElementById("results");
const errorDiv = document.getElementById("error");

// Listen for the search button click
scrapeBtn.addEventListener("click", async () => {
  // Get and trim the keyword value from input
  const keyword = keywordInput.value.trim();
  // Clear previous results and errors
  resultsDiv.innerHTML = "";
  errorDiv.textContent = "";

  if (!keyword) {
    // Show error if the search field is empty
    errorDiv.textContent = "Please enter a search keyword!";
    return;
  }

  // Show loading state on button
  scrapeBtn.disabled = true;
  scrapeBtn.textContent = "Searching...";

  try {
    // Make a request to the backend API endpoint with the keyword as a query parameter
    const response = await fetch(`${apiUrl}?keyword=${encodeURIComponent(keyword)}`);
    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error || "Unknown error");
    }
    const data = await response.json();

    // Check if any products were returned
    if (!data.products || !data.products.length) {
      resultsDiv.innerHTML = "<p>No products found.</p>";
      return;
    }

    // Render the products in the page as HTML cards
    resultsDiv.innerHTML = data.products
      .map(
        (product) => `
          <div class="product">
            <img src="${product.image}" alt="${product.title}"/>
            <h2 title="${product.title}">${product.title}</h2>
            <p>⭐ ${product.rating || "N/A"} | ${product.reviews || "0"} reviews</p>
          </div>
        `
      )
      .join("");
  } catch (err) {
    // Show a user-friendly error message
    errorDiv.textContent = "Error: " + err.message;
  } finally {
    // Restore the search button to its initial state
    scrapeBtn.disabled = false;
    scrapeBtn.textContent = "Search";
  }
});
