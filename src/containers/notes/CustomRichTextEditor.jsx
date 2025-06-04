import React, { useRef, useEffect } from "react";

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
    <div>
      <div style={{ marginBottom: 8 }}>
        <button type="button" onClick={() => execCmd("bold")}>
          <b>B</b>
        </button>
        <button type="button" onClick={() => execCmd("italic")}>
          <i>I</i>
        </button>
        <button type="button" onClick={() => execCmd("underline")}>
          <u>U</u>
        </button>
      </div>
      <div
        ref={editorRef}
        onInput={handleInput}
        contentEditable
        spellCheck={true}
        style={{
          minHeight: "150px",
          border: "1px solid #ccc",
          padding: "8px",
          borderRadius: "4px",
          fontSize: "16px",
          direction: "ltr",
          textAlign: "left",
          outline: "none",
          whiteSpace: "pre-wrap",
          overflowWrap: "break-word",
          backgroundColor: "white",
          cursor: "text",
          color: "black",
        }}
      />
    </div>
  );
};

export default CustomRichTextEditor;
