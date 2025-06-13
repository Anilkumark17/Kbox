import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../utils/db";
import {
  getTeamSpaceNotes,
  createTeamSpaceNote,
  updateTeamSpaceNote,
  deleteTeamSpaceNote,
} from "../../api/TeamSpaceApi";

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

const TeamSpaceNotes = ({ spaceId, categoryId, categoryName }) => {
  const [showModal, setShowModal] = useState(false);
  const [notes, setNotes] = useState([]);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [favMap, setFavoriteMap] = useState({});
  const [viewNote, setViewNote] = useState(null);
  const [editNoteId, setEditNoteId] = useState(null);

  useEffect(() => {
    if (categoryId) {
      fetchNotes();
      setupRealtimeSubscription();
    }
  }, [categoryId]);

  const fetchNotes = async () => {
    try {
      const notesData = await getTeamSpaceNotes(categoryId);
      setNotes(notesData);

      const favs = {};
      notesData.forEach((note) => {
        favs[note.id] = note.is_favorite || false;
      });
      setFavoriteMap(favs);
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  const setupRealtimeSubscription = () => {
    const subscription = supabase
      .channel(`team_space_notes_${categoryId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "team_space_notes",
          filter: `category_id=eq.${categoryId}`,
        },
        () => {
          fetchNotes();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const handleCreateNote = async (e) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;

    try {
      const payload = {
        category_id: categoryId,
        title: noteTitle,
        content: noteContent,
      };

      if (editNoteId) {
        await updateTeamSpaceNote(editNoteId, payload);
      } else {
        await createTeamSpaceNote(payload);
      }

      setNoteTitle("");
      setNoteContent("");
      setEditNoteId(null);
      setShowModal(false);
      fetchNotes();
    } catch (error) {
      console.error("Error saving note:", error);
      alert("Failed to save note");
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      try {
        await deleteTeamSpaceNote(noteId);
        fetchNotes();
      } catch (error) {
        console.error("Error deleting note:", error);
        alert("Failed to delete note");
      }
    }
  };

  const handleToggleFavorite = async (noteId) => {
    try {
      const newFavoriteStatus = !favMap[noteId];
      await updateTeamSpaceNote(noteId, { is_favorite: newFavoriteStatus });
      setFavoriteMap((prev) => ({ ...prev, [noteId]: newFavoriteStatus }));
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const handleEditNote = (note) => {
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setEditNoteId(note.id);
    setShowModal(true);
    setViewNote(null);
  };

  const displayNote = (note) => {
    setViewNote(note);
  };

  return (
    <div className="container">
      <header className="header">
        <div className="logo">Team Notes</div>
      </header>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <button className="modal-close" onClick={() => setShowModal(false)}>
              ✖
            </button>
            <form className="modal-form" onSubmit={handleCreateNote}>
              <input
                type="text"
                placeholder="Note Title"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                className="input"
                required
              />
              <div className="editor-container">
                <CustomRichTextEditor 
                  value={noteContent} 
                  onChange={setNoteContent} 
                />
              </div>
              <button type="submit" className="submit-btn">
                {editNoteId ? "Update Note" : "Add Note"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* View Note Modal */}
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
                height: "400px",
                overflowY: "auto",
                padding: "1rem",
                border: "1px solid #444",
                borderRadius: "8px",
                marginBottom: "1rem",
              }}
            />
            <button
              className="edit-btn"
              onClick={() => handleEditNote(viewNote)}
            >
              ✎ Edit Note
            </button>
          </div>
        </div>
      )}

      {/* Notes Grid */}
      <main className="card-grid">
        {notes.map((note) => (
          <div key={note.id} className="card">
            <div onClick={() => displayNote(note)} style={{ cursor: "pointer" }}>
              <h3 className="card-title">{note.title}</h3>
              <div
                className="notes-content"
                dangerouslySetInnerHTML={{ __html: note.content }}
                style={{ 
                  color: "white",
                  maxHeight: "100px",
                  overflow: "hidden"
                }}
              />
            </div>
            <div className="fav-buttons">
              <button
                onClick={() => handleToggleFavorite(note.id)}
                className="fav-btn"
              >
                {favMap[note.id] ? "★ Favorited" : "☆ Mark Fav"}
              </button>
              <button
                className="delete-btn"
                onClick={() => handleDeleteNote(note.id)}
              >
                Delete
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
          setNoteContent("");
        }}
      >
        +
      </button>
    </div>
  );
};

export default TeamSpaceNotes;