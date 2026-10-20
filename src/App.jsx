import { useState } from 'react'
import './App.css'

function BookCard({book}) {
  const info = book.volumeInfo || {};

  return (
    <>
     <article className="book-card">
      {info.imageLinks?.thumbnail ? (
        <img
          className="book-cover"
          src={info.imageLinks.thumbnail.replace(
            "http://",
            "https://"
          )}
          alt={`Cover of ${info.title || "Unbenanntes Buch"}`}
        />
      ) : (
        <div className="book-cover placeholder">
          Cover nicht verfügbar
        </div>
      )}

        <div className='book-info'>
          <h2>{info.title || 'Unbenanntes Buch'}</h2>
          <p className='author'>
            {info.author?.join(", ") || 'Autor unbekannt'}
          </p>
          <p className='description'>
            {info.description ? info.description.replace(/<[^>]*>/g, "").slice(0.400)
          : "Keine Beschreibung verfügbar"  
          }
          </p>
          {info.publishedDate && (
            <p className='published'>
              Published: {info.publishedDate}
            </p>
          )}
          {info.infoLink && (
            <a href={info.infoLink} target="_blank" rel="noreferrer">
              "Buchdetails anzeigen ↗"
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

  async function searchBooks(event) {
    //prevent the page from reloading the page
    event.preventDefault();
    const query = subject.trim();
    if (!query) return;

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
      url.searchParams.set("maxResults", "20");
      url.searchParams.set("orderBy", "relevance");
      url.searchParams.set("printType", "books");

      const response = await fetch(url);
      if (!response.ok) {
      throw new Error("Der Zugriff auf den Buchkatalog ist derzeit nicht möglich.");
      }

     const data = await response.json();
      setBooks(data.docs || []);

      if (!data.docs?.length) {
        setError("Keine Bücher gefunden. Bitte suchen Sie nach einem anderen Begriff.");
      }

      } catch (error) {
        setError(error.message || "Es ist ein Fehler aufgetreten.");
      } finally {
      setLoading(false);
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
        <div className='book-list'>
          {books.map ((book) => (
            <BookCard key={book.id} book = {book} />
          ))}
        </div>
      </section>
    </main>
  )
}
