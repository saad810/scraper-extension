document.getElementById("scrape").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: scrapePage
  });
});

function scrapePage() {
  const links = [...document.querySelectorAll('a[href^="/companies/"]')];

  const companies = links.map(a => {
    const name = a.querySelector('._coName_i9oky_470')?.innerText?.trim() || "";
    const location = a.querySelector('._coLocation_i9oky_486')?.innerText?.trim() || "";
    const description = a.querySelector('div.text-sm > span')?.innerText?.trim() || "";
    const img = a.querySelector('img')?.src || "";
    const href = a.getAttribute('href');
    const url = "https://www.ycombinator.com" + href;

    // Get all pill/tags
    const tagSpans = a.querySelectorAll("._pill_i9oky_33");
    let batch = "";
    const categories = [];

    tagSpans.forEach(span => {
      const text = span.innerText.trim();
      if (/Spring|Summer|Winter|Fall/i.test(text)) {
        batch = text;
      } else {
        categories.push(text);
      }
    });

    return {
      name,
      location,
      description,
      batch,
      categories,
      url,
      img
    };
  });

  console.log(companies);


  const json = JSON.stringify(companies, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const filename = "data.json";

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();

  console.log("✅ YC Companies scraped", companies);
}
