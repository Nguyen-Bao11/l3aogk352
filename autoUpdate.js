import fs from "fs";
import fetch from "node-fetch";

const updateURL = "https://example.com/siggy-update.json";

export async function autoUpdate() {

  try {

    console.log("🔄 Checking for updates...");

    const response = await fetch(updateURL);

    const data = await response.json();

    const localVersion = "1.0";

    if (data.version !== localVersion) {

      console.log("⚡ New update found");

      const file = await fetch(data.file);
      const code = await file.text();

      fs.writeFileSync("update.js", code);

      console.log("✅ Update downloaded");

    } else {

      console.log("✔ Siggy is up to date");

    }

  } catch (err) {

    console.log("Update check failed");

  }

}
