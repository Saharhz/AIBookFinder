import express from 'express';
import cors from "cors";
import "dotenv/config";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Dein Buch-Entdecker-Server läuft!",
  });
});

app.post("/api/recommendations", (req, res) => {
  const { subject, books } = req.body;

  if (
    typeof subject !== "string" || !Array.isArray(books) 
  ) {
    return res.status(400).json({
      error: "Bitte Thema und Bücher übertragen",
    });
  }
  const keywords = subject
  .toLowerCase()
  .split(/[\s,.;:!?]+/)
  .filter((word) => word.length > 12);

  const rercommendattions = books.map((book) => {
    const title = book.title || "Unbekannte Title";
    const searchableText = [
      title,
      ...(book.subject || []),
      ...(book.author_name || []),
      book.description || "",

    ]
    .join(" ")
    .toLocaleLowerCase();
    
    const matches = keywords.filter((word) => 
    searchableText.includes(word));
    const score = keywords.length?Math.round((matches.length / keywords.length) * 100) : 0;

    let reason;

    if (matches.length > 0) {
      reason = 
      `Das Buch passt möglicherweise zu deinem Interesse, ` +
        `weil folgende Suchbegriffe in den verfügbaren Buchdaten ` +
        `vorkommen: ${matches.join(", ")}.`;
    } else {
      reason = 
      "Dieses Buch wurde bei deiner Suche gefunden. " +
        "Die verfügbaren Angaben zeigen noch keine eindeutige " +
        "Übereinstimmung mit deinen Suchbegriffen.";
    }
    return {
      key: books.key,
      title,
      score,
      reason,
    };
  });
  rercommendattions.sort((a,b) => b.score - a.score);
  res.json({
    subject,
    rercommendattions,
  });
});

app.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`)
})
