import React from "react";
import NotesContainer from "../../containers/notes/NotesContainer";
const Notes = ({ category, id }) => {
  return (
    <div>
      <NotesContainer category={category} id={id} />
    </div>
  );
};

export default Notes;
