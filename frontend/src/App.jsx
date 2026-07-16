import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

function useToast() {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);
  const push = useCallback((message, type = "success") => {
    const id = ++idRef.current;
    setToasts((p) => [...p, { id, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3000);
  }, []);
  return { toasts, push };
}

export default function App() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toasts, push: toast } = useToast();

  const fetchBooks = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/api/books`);
      setBooks(data);
      setError(null);
    } catch {
      setError("Could not load books. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await axios.post(`${API}/api/books`, {
        title: title.trim(),
        author: author.trim(),
      });
      setBooks((p) => [data, ...p]);
      setTitle("");
      setAuthor("");
      toast(`"${data.title}" added to your library!`);
    } catch {
      toast("Failed to add book", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (book) => {
    const next = !book.is_read;
    setBooks((p) =>
      p.map((b) => (b.id === book.id ? { ...b, is_read: next } : b))
    );
    try {
      await axios.put(`${API}/api/books/${book.id}`, { is_read: next });
      toast(
        next
          ? `"${book.title}" marked as read`
          : `"${book.title}" back to unread`
      );
    } catch {
      setBooks((p) =>
        p.map((b) => (b.id === book.id ? { ...b, is_read: !next } : b))
      );
      toast("Failed to update status", "error");
    }
  };

  const handleDelete = async (book) => {
    setBooks((p) => p.filter((b) => b.id !== book.id));
    try {
      await axios.delete(`${API}/api/books/${book.id}`);
      toast(`"${book.title}" deleted`);
    } catch {
      setBooks((p) => [...p, book].sort((a, b) => b.id - a.id));
      toast("Failed to delete book", "error");
    }
  };

  const total = books.length;
  const readCount = books.filter((b) => b.is_read).length;

  return (
    <div className="min-h-screen relative pb-20">
      {/* Top Navigation */}
      <nav className="p-4 sticky top-0 z-50 bg-cream">
        <div className="max-w-5xl mx-auto flex justify-between items-center bg-white p-4 border-2 border-black shadow-neo rounded-2xl">
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            <span className="text-3xl">📚</span> LibraryHub
          </h1>
          <a
            href="#add-book-section"
            className="neo-btn bg-emerald text-white px-6 py-2 block"
          >
            Add Book
          </a>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 mt-8">
        {/* Error Banner */}
        {error && (
          <div className="bg-coral text-black font-bold p-4 border-2 border-black shadow-neo rounded-xl mb-8">
            {error}
          </div>
        )}

        {/* Hero Section */}
        <section className="bg-powder border-2 border-black shadow-neo rounded-2xl p-8 mb-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-4xl md:text-5xl font-black mb-4 uppercase tracking-tighter">
              Manage Your Books,
              <br /> Anytime, Anywhere!
            </h2>
            <p className="text-lg font-bold opacity-80 mb-6">
              Keep track of your reading journey with our brutalist tracker.
            </p>
            <div className="flex gap-4 justify-center md:justify-start">
              <div className="bg-white border-2 border-black shadow-neo rounded-xl px-4 py-2 font-bold text-lg">
                Total Books: {total}
              </div>
              <div className="bg-emerald text-white border-2 border-black shadow-neo rounded-xl px-4 py-2 font-bold text-lg">
                Books Read: {readCount}
              </div>
            </div>
          </div>
        </section>

        {/* Add Book Section */}
        <section id="add-book-section" className="mb-12">
          <div className="bg-white border-2 border-black shadow-neo rounded-2xl p-6 md:p-8">
            <h3 className="text-2xl font-black mb-6 uppercase">
              Add a New Book
            </h3>
            <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="Book Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="neo-input flex-1"
                required
              />
              <input
                type="text"
                placeholder="Author Name"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="neo-input flex-1"
                required
              />
              <button
                type="submit"
                disabled={submitting || !title.trim() || !author.trim()}
                className="neo-btn bg-emerald text-white px-8 py-3 uppercase text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Adding..." : "Add"}
              </button>
            </form>
          </div>
        </section>

        {/* Book List Grid */}
        <section>
          <h3 className="text-2xl font-black mb-6 uppercase">Your Collection</h3>
          {loading ? (
            <div className="text-xl font-bold p-8 text-center border-2 border-black shadow-neo rounded-2xl bg-white">
              Loading books...
            </div>
          ) : total === 0 ? (
            <div className="text-center bg-white border-2 border-black shadow-neo rounded-2xl p-12">
              <div className="text-5xl mb-4">📖</div>
              <h3 className="text-2xl font-black mb-2">Shelf is empty!</h3>
              <p className="font-bold">Add some books above to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.map((book) => (
                <div key={book.id} className="neo-card flex flex-col h-full">
                  <div
                    className={`h-4 border-b-2 border-black ${
                      book.is_read ? "bg-emerald" : "bg-powder"
                    }`}
                  ></div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4
                        className={`text-xl font-black mb-1 line-clamp-2 ${
                          book.is_read ? "line-through opacity-70" : ""
                        }`}
                      >
                        {book.title}
                      </h4>
                      <p className="font-bold text-gray-700 text-sm mb-4">
                        by {book.author}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-4 border-t-2 border-black border-dashed">
                      <button
                        onClick={() => handleToggle(book)}
                        className={`neo-btn px-4 py-1.5 text-sm ${
                          book.is_read
                            ? "bg-emerald text-white"
                            : "bg-powder text-black"
                        }`}
                      >
                        {book.is_read ? "✓ Read" : "Mark Read"}
                      </button>
                      <button
                        onClick={() => handleDelete(book)}
                        className="neo-btn bg-coral text-black px-3 py-1.5 text-sm"
                        aria-label="Delete Book"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Toasts */}
      {toasts.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-4">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`border-2 border-black shadow-neo rounded-xl px-6 py-4 font-bold ${
                t.type === "error" ? "bg-coral text-black" : "bg-white text-black"
              } animate-[bounce_0.3s_ease-in-out]`}
            >
              {t.message}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
