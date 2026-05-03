// scratch/list_bibles.js

async function fetchTranslations() {
  const url = "https://bible.helloao.org/api/available_translations.json";

  try {
    console.log(`Node Version: ${process.version}`);
    console.log(`Fetching from: ${url}...`);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const translations = data.translations || data;

    console.log("\nID".padEnd(10) + " | " + "Name");
    console.log("-".repeat(30));

    translations.forEach((t) => {
      console.log(`${t.id.padEnd(10)} | ${t.name}`);
    });
  } catch (error) {
    console.error("\n--- FETCH FAILED ---");
    console.error("Message:", error.message);
    if (error.cause) {
      console.error("Cause:", error.cause.code); // This shows the specific system error (e.g., ENOTFOUND)
    }
  }
}

fetchTranslations();
