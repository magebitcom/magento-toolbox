import { getIn, useFormikContext } from 'formik';
import { useMemo, useRef, useState } from 'react';
import { WizardAutocompleteField } from 'types/webview';

interface Props {
  field: WizardAutocompleteField;
  prefix?: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
}

const MAX_VISIBLE_SUGGESTIONS = 20;

export const AutocompleteInput: React.FC<Props> = ({
  field,
  prefix,
  name,
  value,
  onChange,
  onBlur,
}) => {
  const { values } = useFormikContext<Record<string, unknown>>();
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo<string[]>(() => {
    if (field.suggestions && field.suggestions.length > 0) {
      return field.suggestions;
    }
    if (!field.suggestionsFrom) {
      return [];
    }

    const source = field.suggestionsFrom;
    const rows = getIn(values, source.fieldId);
    if (!Array.isArray(rows)) {
      return [];
    }

    let filtered = rows as Array<Record<string, unknown>>;
    if (source.filterBy && prefix) {
      const currentRow = getIn(values, prefix) as Record<string, unknown> | undefined;
      const filterValue = currentRow?.[source.filterBy.fromField];
      if (filterValue !== undefined && filterValue !== '') {
        filtered = filtered.filter(r => r[source.filterBy!.column] === filterValue);
      }
    }

    const seen = new Set<string>();
    const result: string[] = [];
    for (const row of filtered) {
      const v = row[source.column];
      if (typeof v === 'string' && v.length > 0 && !seen.has(v)) {
        seen.add(v);
        result.push(v);
      }
    }
    return result;
  }, [field.suggestions, field.suggestionsFrom, values, prefix]);

  const matched = useMemo(() => {
    if (!value) {
      return suggestions.slice(0, MAX_VISIBLE_SUGGESTIONS);
    }
    const lower = value.toLowerCase();
    return suggestions
      .filter(s => s.toLowerCase().includes(lower))
      .slice(0, MAX_VISIBLE_SUGGESTIONS);
  }, [suggestions, value]);

  const shouldShow = focused && matched.length > 0;

  const pick = (selection: string) => {
    onChange(selection);
    setFocused(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!shouldShow) {
      return;
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex(prev => Math.min(prev + 1, matched.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex(prev => Math.max(prev - 1, -1));
    } else if (event.key === 'Enter') {
      if (activeIndex >= 0 && activeIndex < matched.length) {
        event.preventDefault();
        pick(matched[activeIndex]);
      }
    } else if (event.key === 'Escape') {
      setFocused(false);
      setActiveIndex(-1);
    }
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    // Keep the panel open when focus moves to a child (suggestion click).
    if (containerRef.current?.contains(event.relatedTarget as Node | null)) {
      return;
    }
    setFocused(false);
    setActiveIndex(-1);
    onBlur();
  };

  return (
    <div ref={containerRef} className="autocomplete">
      <input
        className="autocomplete-input"
        type="text"
        name={name}
        value={value}
        placeholder={field.placeholder}
        onChange={event => onChange(event.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        autoComplete="off"
      />
      {shouldShow && (
        <ul className="autocomplete-list" role="listbox">
          {matched.map((suggestion, idx) => {
            const isNamespaced = suggestion.includes('\\');
            const parts = isNamespaced ? suggestion.split('\\') : [];
            const primary = isNamespaced ? parts[parts.length - 1] : suggestion;
            const secondary = isNamespaced ? parts.slice(0, -1).join('\\') : null;

            return (
              <li key={suggestion}>
                <button
                  type="button"
                  className={`autocomplete-option${idx === activeIndex ? ' is-active' : ''}${
                    secondary ? ' autocomplete-option-stacked' : ''
                  }`}
                  onMouseDown={event => {
                    event.preventDefault();
                    pick(suggestion);
                  }}
                  onMouseEnter={() => setActiveIndex(idx)}
                  title={suggestion}
                >
                  <span className="autocomplete-option-primary">{primary}</span>
                  {secondary && <span className="autocomplete-option-secondary">{secondary}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
