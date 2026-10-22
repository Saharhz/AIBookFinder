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
  /* const keywords = subject
  .toLowerCase()
  .split(/[\s,.;:!?]+/)
  .filter((word) => word.length > 12); */

  const normalizeWords = (value) => {
    const text = Array.isArray(value) ? value.join(" ") : String((value ?? ""));

    return text
    .toLocaleLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .match(/[a-z0-9]+/g) || [];
  };

  const keywords = [
    ...new Set(
      normalizeWords (subject).filter((word) => word.length > 2)
    ),
  ];

  const recommendations = books.map((book) => {
    const title = book.title || "Unbekannte Title";

    const titleWords = new Set(normalizeWords(title));
  const authorWords = new Set(normalizeWords(book.author_name));
  const subjectWords = new Set(normalizeWords(book.subject));
  const descriptionWords = new Set(normalizeWords(book.description));

    /* const searchableText = [
      title,
      ...(book.subject || []),
      ...(book.author_name || []),
      book.description || "",

    ]
    .join(" ")
    .toLocaleLowerCase(); */
    
    /* const matches = keywords.filter((word) => 
    searchableText.includes(word)); */

    const matches = keywords.filter(
    (word) =>
      titleWords.has(word) ||
      authorWords.has(word) ||
      subjectWords.has(word) ||
      descriptionWords.has(word)
  );

  const points = keywords.reduce((total, word) => {
    if (titleWords.has(word)) return total + 3;
    if (subjectWords.has(word)) return total +2;

    if (authorWords.has(word) || descriptionWords.has(word))
    {
      return total + 1;
    }
    return total
  }, 0);

  const maxPoints = keywords.length * 3;

const score = maxPoints > 0
  ? Math.round((points / maxPoints) * 100)
  : 0;
      

    // const score = keywords.length ? Math.round((points / keywords.length * 1) * 100) : 0;
    console.log({ keywords, points, score });

    let reason;

    if (matches.length > 0) {
      reason = 
      `Das Buch passt möglicherweise zu deinem Interesse, ` +
        `weil folgende Suchbegriffe in den verfügbaren Buchdaten ` +
        `vorkommen: ${matches.join(", ")}.`;
    } else {
      reason = 
        "In den verfügbaren Buchdaten wurden keine passenden " +
      "Suchbegriffe gefunden. Das bedeutet nicht automatisch, " +
      "dass das Buch ungeeignet ist.";
    }
    return {
      key: book.key,
      title,
      score,
      reason,
    };
  });
  recommendations.sort((a,b) => b.score - a.score);
  res.json({
    subject,
    recommendations,
  });
});

app.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`)
})
