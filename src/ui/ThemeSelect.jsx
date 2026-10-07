import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';

export function ThemeSelect({ value, onChange }) {
  const options = [{ value: 'light', label: 'Light theme', icon: Sun }, { value: 'dark', label: 'Dark theme', icon: Moon }, { value: 'system', label: 'System theme', icon: Monitor }];
  const handleKeyDown = event => {
    const index = options.findIndex(option => option.value === value);
    let next;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % options.length;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index + options.length - 1) % options.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = options.length - 1;
    if (next !== undefined) { event.preventDefault(); onChange(options[next].value); event.currentTarget.parentElement.querySelector(`[data-theme-option="${options[next].value}"]`)?.focus(); }
  };
  return <div className="theme-control" role="radiogroup" aria-label="Appearance">{options.map(option => { const Icon = option.icon; return <button key={option.value} type="button" role="radio" aria-checked={value === option.value} aria-label={option.label} title={option.label} data-theme-option={option.value} tabIndex={value === option.value ? 0 : -1} className={`theme-choice${value === option.value ? ' is-selected' : ''}`} onClick={() => onChange(option.value)} onKeyDown={handleKeyDown}><Icon aria-hidden="true" focusable="false" /></button>; })}</div>;
}
