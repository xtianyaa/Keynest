type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
};

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <label className="search-bar">
      <span className="sr-only">搜索条目</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="搜索所有条目"
      />
    </label>
  );
}
