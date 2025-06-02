import React, { useState, useEffect } from "react";
import { supabase } from "../../utils/db";
import "./notes.css";
import {
  deleteNote,
  favUpdate,
  not_favUpdate,
  updateNote,
} from "../../api/NoteApi";

const NotesContainer = ({ category, id }) => {
  const [showModal, setShowModal] = useState(false);
  const [notes, setNotes] = useState([]);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteText, setNoteText] = useState("");
  const [favMap, setFavoriteMap] = useState({});
  const [viewNote, setViewNote] = useState(null);
  const [editNoteId, setEditNoteId] = useState(null); // used for edit flow

  const fetchNotes = async () => {
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .eq("category_id", id);

    if (error) {
      console.error("Fetch error:", error.message);
    } else {
      setNotes(data);
      const favs = {};
      data.forEach((note) => {
        favs[note.id] = note.is_favorite || false;
      });
      setFavoriteMap(favs);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: noteTitle,
        content: noteText,
        category_id: id,
      };

      if (editNoteId) {
        await updateNote(editNoteId, payload);
      } else {
        const { error } = await supabase.from("notes").insert([payload]);
        if (error) {
          console.error("Insert error:", error.message);
          return;
        }
      }

      setNoteTitle("");
      setNoteText("");
      setEditNoteId(null);
      setShowModal(false);
      fetchNotes();
    } catch (err) {
      console.error("Caught exception:", err.message);
    }
  };

  const deleteHandler = async (noteId) => {
    await deleteNote(noteId);
    setNotes((prev) => prev.filter((note) => note.id !== noteId));
  };

  const favHandler = async (noteId) => {
    await favUpdate(noteId);
    setFavoriteMap((prev) => ({ ...prev, [noteId]: true }));
  };

  const notFavHandler = async (noteId) => {
    await not_favUpdate(noteId);
    setFavoriteMap((prev) => ({ ...prev, [noteId]: false }));
  };

  const displayHandler = (note) => {
    setViewNote(note);
  };

  useEffect(() => {
    if (id) fetchNotes();
  }, [id]);

  return (
    <div className="container">
      <header className="header">
        <div className="logo">Notes Page</div>
        <button className="create-btn" onClick={() => {
          setShowModal(true);
          setEditNoteId(null);
          setNoteTitle("");
          setNoteText("");
        }}>
          + Create
        </button>
      </header>

      <h2 className="category-title">{category}</h2>

      {/* Modal: Create or Edit */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="modal-close" onClick={() => setShowModal(false)}>
              ✖
            </button>
            <form className="modal-form" onSubmit={submitHandler}>
              <input
                type="text"
                placeholder="Title"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                className="input"
                required
              />
              <textarea
                className="textarea"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Write something important..."
                required
              />
              <button type="submit" className="submit-btn">
                {editNoteId ? "Update Note" : "Add Note"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Note */}
      {viewNote && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="modal-close" onClick={() => setViewNote(null)}>
              ✖
            </button>
            <h2>{viewNote.title}</h2>
            <p>{viewNote.content}</p>
            <button
              className="edit"
              onClick={() => {
                setNoteTitle(viewNote.title);
                setNoteText(viewNote.content);
                setEditNoteId(viewNote.id);
                setShowModal(true);
                setViewNote(null);
              }}
            >
              ✎ Edit Note
            </button>
          </div>
        </div>
      )}

      {/* Notes Grid */}
      <main className="card-grid">
        {notes.map((item) => (
          <div key={item.id} className="card">
            <div onClick={() => displayHandler(item)}>
              <h3 className="card-title">{item.title}</h3>
              <p
                className="notes-content"
                style={{
                  WebkitLineClamp: 3,
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                }}
              >
                {item.content}
              </p>
            </div>
            <div className="fav-button">
              <div className="fav">
                {favMap[item.id] ? (
                  <button onClick={() => notFavHandler(item.id)} className="fav">
                    ★ Favorited
                  </button>
                ) : (
                  <button onClick={() => favHandler(item.id)} className="fav">
                    ☆ Mark Fav
                  </button>
                )}
              </div>
              <button className="delete" onClick={() => deleteHandler(item.id)}>
                delete
              </button>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
};

export default NotesContainer;
