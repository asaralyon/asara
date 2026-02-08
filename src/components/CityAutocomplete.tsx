'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

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

  // Recherche des villes via l'API
  useEffect(() => {
    const searchCities = async () => {
      if (value.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(value)}&fields=nom,code,codeDepartement,codesPostaux&boost=population&limit=10`
        );
        const data: City[] = await response.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Erreur recherche ville:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(searchCities, 300);
    return () => clearTimeout(debounce);
  }, [value]);

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

  // Navigation clavier
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          selectCity(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const selectCity = (city: City) => {
    const cityName = `${city.nom} (${city.codeDepartement})`;
    onChange(cityName);
    setShowSuggestions(false);
    setSelectedIndex(-1);
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
          onFocus={() => value.length >= 2 && setShowSuggestions(true)}
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
                  <p className="font-medium text-neutral-900 truncate">
                    {city.nom}
                  </p>
                  <p className="text-sm text-neutral-500">
                    {city.codeDepartement} · {city.codesPostaux[0] || ''}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Message si aucun résultat */}
      {showSuggestions && value.length >= 2 && suggestions.length === 0 && !isLoading && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg p-4">
          <p className="text-neutral-500 text-sm text-center">
            {isRTL ? 'لم يتم العثور على مدن' : 'Aucune ville trouvée'}
          </p>
        </div>
      )}
    </div>
  );
}