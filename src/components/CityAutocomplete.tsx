'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, MapPin } from 'lucide-react';

interface City {
  nom: string;
  code: string;
  codeDepartement: string;
  codesPostaux: string[];
}

interface CityAutocompleteProps {
  value: string;
  onChange: (city: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  label?: string;
  isRTL?: boolean;
}

export default function CityAutocomplete({
  value,
  onChange,
  placeholder = 'Ex: Paris, Lyon, Marseille...',
  required = false,
  className = '',
  label = 'Ville',
  isRTL = false,
}: CityAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Recherche des villes via TON endpoint (proxy server-side)
  useEffect(() => {
    let isActive = true;

    const searchCities = async () => {
      const q = value.trim();
      if (q.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/cities?q=${encodeURIComponent(q)}`);
        if (!response.ok) {
          const text = await response.text();
          throw new Error(`/api/cities ${response.status}: ${text.slice(0, 120)}`);
        }

        const data: City[] = await response.json();
        if (!isActive) return;

        setSuggestions(Array.isArray(data) ? data : []);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Erreur recherche ville:', error);
        if (!isActive) return;
        setSuggestions([]);
        setShowSuggestions(true);
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    const debounce = setTimeout(searchCities, 300);

    return () => {
      isActive = false;
      clearTimeout(debounce);
    };
  }, [value]);

  // Reset l’index sélectionné quand les suggestions changent (évite index hors borne)
  useEffect(() => {
    setSelectedIndex(-1);
  }, [suggestions]);

  // Fermer les suggestions si clic en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectCity = (city: City) => {
    // Si tu préfères stocker seulement city.nom, remplace la ligne ci-dessous par: const cityName = city.nom;
    const cityName = `${city.nom} (${city.codeDepartement})`;
    onChange(cityName);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  // Navigation clavier
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
        break;

      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
        break;

      case 'Enter': {
        e.preventDefault();
        const city = suggestions[selectedIndex];
        if (!city) return; // <-- FIX TS + robustesse runtime
        selectCity(city);
        break;
      }

      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <div className="relative">
      {label && (
        <label className="label">
          {label} {required && '*'}
        </label>
      )}

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => value.trim().length >= 2 && setShowSuggestions(true)}
          placeholder={placeholder}
          required={required}
          className={`input ${isRTL ? 'pr-10' : 'pl-10'} ${className}`}
          autoComplete="off"
          dir={isRTL ? 'rtl' : 'ltr'}
        />

        <div className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3' : 'left-3'}`}>
          {isLoading ? (
            <Loader2 className="w-5 h-5 text-neutral-400 animate-spin" />
          ) : (
            <MapPin className="w-5 h-5 text-neutral-400" />
          )}
        </div>
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg max-h-64 overflow-y-auto"
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          {suggestions.map((city, index) => (
            <button
              key={city.code}
              type="button"
              onClick={() => selectCity(city)}
              className={`w-full px-4 py-3 text-left hover:bg-primary-50 transition-colors ${
                index === selectedIndex ? 'bg-primary-100' : ''
              } ${index !== suggestions.length - 1 ? 'border-b border-neutral-100' : ''}`}
            >
              <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <MapPin className="w-4 h-4 text-primary-500 flex-shrink-0" />
                <div className={`flex-1 min-w-0 ${isRTL ? 'text-right' : ''}`}>
                  <p className="font-medium text-neutral-900 truncate">{city.nom}</p>
                  <p className="text-sm text-neutral-500">
                    {city.codeDepartement} · {city.codesPostaux?.[0] || ''}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Message si aucun résultat */}
      {showSuggestions && value.trim().length >= 2 && suggestions.length === 0 && !isLoading && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg p-4">
          <p className="text-neutral-500 text-sm text-center">
            {isRTL ? 'لم يتم العثور على مدن' : 'Aucune ville trouvée'}
          </p>
        </div>
      )}
    </div>
  );
}
