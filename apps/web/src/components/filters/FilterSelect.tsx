interface FilterSelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  allLabel?: string;
  disabled?: boolean;
}

export function FilterSelect({
  id,
  label,
  value,
  onChange,
  options,
  allLabel = 'All',
  disabled = false,
}: FilterSelectProps) {
  return (
    <label className="filter-field">
      <span className="filter-field__label">{label}</span>
      <select
        id={id}
        className="filter-field__select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        <option value="">{allLabel}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
