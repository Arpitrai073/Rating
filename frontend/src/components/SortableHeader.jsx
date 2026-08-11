export default function SortableHeader({ label, field, sortBy, sortOrder, onSort }) {
  const active = sortBy === field;
  return (
    <th>
      <button
        type="button"
        className={`sort-btn ${active ? 'active' : ''}`}
        onClick={() => onSort(field)}
      >
        {label}
        <span className="sort-icon">{active ? (sortOrder === 'ASC' ? '↑' : '↓') : '↕'}</span>
      </button>
    </th>
  );
}
