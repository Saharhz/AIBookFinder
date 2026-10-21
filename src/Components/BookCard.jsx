
function BookCard({ book }) {
  const coverUrl = book.cover_i
    ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
    : null;

  return (
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
  );
}
