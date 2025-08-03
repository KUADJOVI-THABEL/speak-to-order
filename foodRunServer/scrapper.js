(function () {
  const products = document.querySelectorAll('[data-test-id="list-element"]');
  const result = [];

  products.forEach((product) => {
    const name = product.querySelector('[data-test-id="product-row-name__highlighter"]')?.innerText.trim().replace(/\s+/g, '');
    const description = product.querySelector('[data-test-id="product-row-description__highlighter"]')?.innerText.trim();
    const price = product.querySelector('[data-test-id="product-price-effective"]')?.innerText.trim();
    const image_url = product.querySelector('img[data-test-id="img-formats"]')?.src;

    result.push({
      name: name || "Unknown",
      description: description || "No description",
      price: price || "No price",
      image_url: image_url || "No image"
    });
  });

  console.log(result);

  // Download the JSON as a file
  const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "products.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
})();
