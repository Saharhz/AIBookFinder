import { useState } from 'react'
import './App.css'

function BookCard({ book }) {
  const coverUrl = book.cover_i
    ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
    : null;

  return (
    <>
     <article className="book-card">
      {coverUrl ? (
        <img
          className="book-cover"
          src={coverUrl}
          alt={`Cover von ${book.title || "Unbekanntes Buch"}`}
        />
      ) : (
        <div className="book-cover placeholder">
          Kein Cover verfügbar
        </div>
      )}

      <div className="book-info">
        <h2>{book.title || "Unbekannter Titel"}</h2>

        <p className="author">
          {book.author_name?.join(", ") || "Autor unbekannt"}
        </p>

        {book.first_publish_year && (
          <p className="published">
            Erstveröffentlichung: {book.first_publish_year}
          </p>
        )}

        {book.key && (
          <a
            href={`https://openlibrary.org${book.key}`}
            target="_blank"
            rel="noreferrer"
          >
            Buchdetails ansehen ↗
          </a>
        )}
      </div>
    </article>
    </>
  )
}

export default function App() {
  const [subject, setSubject] = useState("");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);


  async function searchBooks(event) {
    //prevent the page from reloading the page
    event.preventDefault();
     console.log("1. Suchfunktion wurde gestartet!");
    const query = subject.trim();

    if (!query) {
    console.log("Kein Suchbegriff eingegeben.");
    return;
    }

    setLoading(true);
    setBooks([]);
    setError("");
    try {
      const url = new URL(
        //Google Books API: "https://www.googleapis.com/books/v1/volumes" it didn't work
        // I used Open Library API
        "https://openlibrary.org/search.json"
      );
      url.searchParams.set("q", query);
      url.searchParams.set("limit", "20");
      url.searchParams.set(
      "fields",
      "key,title,author_name,first_publish_year,cover_i,description"
    );

    console.log("2. API-URL:", url.toString());

      const response = await fetch(url);
      console.log("3. HTTP-Status:", response.status);

      if (!response.ok) {
      throw new Error(`Fehler beim Buchkatalog: HTTP ${response.status}`);
      }

     const data = await response.json();
     console.log("4. Gesamte API-Antwort:", data);
    console.log("5. Erstes Buch:", data.docs?.[0]);

      // setBooks(data.docs || []);

      const foundbooks = data.docs || [];
      setBooks(foundbooks);
      await getRecommendations(foundbooks, query);

      if (!data.docs?.length) {
        setError("Keine Bücher gefunden. Bitte suchen Sie nach einem anderen Begriff.");
      }

      } catch (error) {
        console.error("Fehler bei der Buchsuche:", error);
        setError(error.message || "Es ist ein Fehler aufgetreten.");
      } finally {
      setLoading(false);
    }
  }
  async function getRecommendations(foundbooks, query) {
    setRecommendationsLoading(true);
    setRecommendations([]);

    try {
      const response = await fetch ("http://localhost:3001/api/recommendations",
        {method: "POST",
          headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify ({
          subject: query,
          books: foundbooks,
        }),
        }
      );

      if (!response.ok) {
        throw new Error ("Empfehlung konnte nicht geladen werden");
      }
      const data = await response.json();
      console.log(
  "Vollständige Serverantwort:",
  JSON.stringify(data, null, 2)
);
     
      setRecommendations(data.recommendations || []);
       console.log("Empfehlungen:", data.recommendations);
    } catch (error) {
      console.error("Fehler bei Empfelung:", error);
      setError(`Empfehlungsfehler: ${error.message}`);
    } finally {
      setRecommendationsLoading(false)
    }

  }
  return (
    <main className='app'>
      <header className='hero'>
        <p className='eyebrow'>DEIN PERSÖNLICHER BUCH-ENTDECKER</p>
        <h1>Finde dein nächstes Lieblingsbuch</h1>
        <p className='subtitle'>Finde Bücher zu deinen Interessen und entdecke Neues.</p>

        <form className='search-form' onSubmit={searchBooks}>
          <input
          type="text"
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          placeholder='Politik, KI oder Geschichte...' 
          aria-label='Thema eingeben'/>
          <button type='submit' disabled={loading || !subject.trim()}>
            {loading ? "Suchen..." : "Bücher finden"}
          </button>
        </form>
      </header>
      <section className='result'>
        {loading && <p>Buchkatalog wird durchsucht …</p> }
        {error && <p className='error'>{error}</p> }
        
        {!loading && books.length > 0 && (
          <h2>
             {books.length} Bücher zum Thema "{subject}" gefunden
          </h2>
        )}
        <div className="book-list">
  {books.map((book) => {
    const recommendation = recommendations.find(
      (item) => 
        (item.key && item.key === book.key || item.title === book.title)
    );

    return (
      <div key={book.key || book.title}>
        <BookCard book={book} />

        {recommendationsLoading && (
          <p>Empfehlung wird berechnet …</p>
        )}

        {recommendation && (
          <div className="recommendation">
            <strong>
              Warum könnte das Buch passen?
            </strong>
            <p>{recommendation.reason}</p>
            <p>
              Übereinstimmung: {recommendation.score} %
            </p>
          </div>
        )}
      </div>
    );
  })}
</div>

      </section>
    </main>
  )
}
