const Note = ({ note, toggleImportance, del }) => {
  const label = note.important ? "make not important" : "make important";

  return (
    <li className="note">
      {note.content}
      <button onClick={toggleImportance}>{label}</button>
      <button onClick={() => del(note.id)}>delete</button>
    </li>
  );
};

export default Note;

