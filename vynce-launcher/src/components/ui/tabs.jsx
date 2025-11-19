export function Tabs({ labels = [], active, onChange }) {
  return (
    <div className="flex gap-2 bg-gray-100 rounded-xl p-1">
      {labels.map((label) => (
        <button
          key={label}
          onClick={() => onChange(label)}
          className={`px-4 py-2 rounded-lg font-medium ${
            active === label
              ? "bg-white shadow text-blue-600"
              : "text-gray-600"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
