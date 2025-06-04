import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../utils/db";
import "./notes.css";
import {
  deleteNote,
  favUpdate,
  not_favUpdate,
  updateNote,
} from "../../api/NoteApi";

const CustomRichTextEditor = ({ value, onChange }) => {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || "";
    }
  }, [value]);

  const handleInput = () => {
    const html = editorRef.current.innerHTML;
    onChange(html);
  };

  const execCmd = (command) => {
    document.execCommand(command, false, null);
    onChange(editorRef.current.innerHTML);
    editorRef.current.focus();
  };

  return (
    <div className="editor-wrapper">
      <div className="editor-toolbar">
        <button type="button" onClick={() => execCmd("bold")} title="Bold">
          <b>B</b>
        </button>
        <button type="button" onClick={() => execCmd("italic")} title="Italic">
          <i>I</i>
        </button>
        <button
          type="button"
          onClick={() => execCmd("underline")}
          title="Underline"
        >
          <u>U</u>
        </button>
        <button
          type="button"
          onClick={() => execCmd("insertUnorderedList")}
          title="Bullet List"
        >
          • List
        </button>
      </div>
      <div
        ref={editorRef}
        className="editor-content"
        contentEditable
        spellCheck={true}
        onInput={handleInput}
        aria-label="Note content editor"
      />
    </div>
  );
};

const NotesContainer = ({ category, id }) => {
  const [showModal, setShowModal] = useState(false);
  const [notes, setNotes] = useState([]);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteText, setNoteText] = useState("");
  const [favMap, setFavoriteMap] = useState({});
  const [viewNote, setViewNote] = useState(null);
  const [editNoteId, setEditNoteId] = useState(null);

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
      </header>

      <h2 className="category-title">{category}</h2>

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
              <div className="editor-container">
                <CustomRichTextEditor value={noteText} onChange={setNoteText} />
              </div>
              <button type="submit" className="submit-btn">
                {editNoteId ? "Update Note" : "Add Note"}
              </button>
            </form>
          </div>
        </div>
      )}

      {viewNote && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="modal-close" onClick={() => setViewNote(null)}>
              ✖
            </button>
            <h2>{viewNote.title}</h2>
            <div
              dangerouslySetInnerHTML={{ __html: viewNote.content }}
              style={{
                color: "white",
                height: "700px",
                overflowY: "auto",
              }}
            />
            <button
              className="edit-btn"
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

      <main className="card-grid">
        {notes.map((item) => (
          <div key={item.id} className="card">
            <div
              onClick={() => displayHandler(item)}
              style={{ cursor: "pointer" }}
            >
              <h3 className="card-title">{item.title}</h3>
              <div
                className="notes-content"
                dangerouslySetInnerHTML={{ __html: item.content }}
                 style={{ color:'white' }}
              />
            </div>
            <div className="fav-buttons">
              {favMap[item.id] ? (
                <button
                  onClick={() => notFavHandler(item.id)}
                  className="fav-btn"
                >
                  ★ Favorited
                </button>
              ) : (
                <button onClick={() => favHandler(item.id)} className="fav-btn">
                  ☆ Mark Fav
                </button>
              )}
              <button
                className="delete-btn"
                onClick={() => deleteHandler(item.id)}
              >
                delete
              </button>
            </div>
          </div>
        ))}
      </main>

      {/* Floating Create Button */}
      <button
        className="floating-create-btn"
        onClick={() => {
          setShowModal(true);
          setEditNoteId(null);
          setNoteTitle("");
          setNoteText("");
        }}
      >
        +
      </button>
    </div>
  );
};

export default NotesContainer;
