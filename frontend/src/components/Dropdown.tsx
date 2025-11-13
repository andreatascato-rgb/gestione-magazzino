import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './Dropdown.css';

export interface DropdownOption {
  value: string;
  label: string;
}

export interface DropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Seleziona...',
  disabled = false,
  className = '',
  id,
  searchable = false,
  searchPlaceholder = 'Cerca...',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, width: 0 });
  const [isInsideModal, setIsInsideModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const selectedOption = options.find(opt => {
    const optValue = String(opt.value);
    const currentValue = String(value || '');
    return optValue === currentValue;
  });

  // Filtra le opzioni in base alla query di ricerca
  const filteredOptions = searchable && searchQuery
    ? options.filter(option =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  // Reset della query di ricerca quando il menu si chiude
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setHighlightedIndex(-1);
    } else if (searchable && searchInputRef.current) {
      // Focus sull'input di ricerca quando il menu si apre
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, searchable]);

  // Verifica se il dropdown è dentro un modal e aggiorna la posizione quando il menu si apre
  useEffect(() => {
    if (dropdownRef.current) {
      const modal = dropdownRef.current.closest('.modal');
      setIsInsideModal(!!modal);
    }
    
    if (isOpen && triggerRef.current) {
      // Calcola la posizione immediatamente
      const updatePosition = () => {
        if (triggerRef.current) {
          const rect = triggerRef.current.getBoundingClientRect();
          setMenuPosition({
            top: rect.bottom + 4,
            left: rect.left,
            width: rect.width || 200,
          });
        }
      };
      
      // Aggiorna immediatamente
      updatePosition();
      // E anche dopo il rendering
      requestAnimationFrame(updatePosition);
      // E dopo un piccolo delay per sicurezza
      setTimeout(updatePosition, 10);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const element = target as Element;
      
      // Non chiudere se il click è sul trigger o sul menu
      if (
        (dropdownRef.current && dropdownRef.current.contains(target)) ||
        (menuRef.current && menuRef.current.contains(target))
      ) {
        return;
      }
      
      // Se è dentro un modal, chiudi solo se clicchi fuori dal modal
      if (isInsideModal) {
        const modal = element.closest('.modal');
        if (!modal) {
          setIsOpen(false);
        }
        return;
      }
      
      // Altrimenti chiudi sempre
      setIsOpen(false);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    // Aggiungi listener dopo un piccolo delay per evitare che il click sul trigger chiuda il menu
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside, true);
      document.addEventListener('keydown', handleEscape);
    }, 10);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside, true);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, isInsideModal]);

  const handleToggle = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (!disabled) {
      const newIsOpen = !isOpen;
      if (newIsOpen) {
        // Calcola la posizione immediatamente
        if (triggerRef.current) {
          const rect = triggerRef.current.getBoundingClientRect();
          setMenuPosition({
            top: rect.bottom + 4,
            left: rect.left,
            width: rect.width,
          });
        }
      }
      setIsOpen(newIsOpen);
    }
  };

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchQuery('');
    setHighlightedIndex(-1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        handleToggle();
      }
      return;
    }

    const activeElement = document.activeElement;
    const isSearchInputFocused = activeElement === searchInputRef.current;

    // Se il dropdown è searchable e l'utente preme un carattere normale
    // mentre il focus NON è sull'input di ricerca, metti il focus sull'input e scrivi il carattere
    if (searchable && 
        e.key.length === 1 && 
        !e.ctrlKey && 
        !e.metaKey && 
        !e.altKey && 
        !isSearchInputFocused) {
      e.preventDefault();
      searchInputRef.current?.focus();
      setSearchQuery(e.key);
      return;
    }

    // Se il focus è sull'input di ricerca, gestisci solo i tasti speciali
    if (isSearchInputFocused) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const nextIndex = e.key === 'ArrowDown' 
          ? (highlightedIndex < filteredOptions.length - 1 ? highlightedIndex + 1 : 0)
          : (highlightedIndex > 0 ? highlightedIndex - 1 : filteredOptions.length - 1);
        setHighlightedIndex(nextIndex);
        optionRefs.current.get(nextIndex)?.scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          handleSelect(filteredOptions[highlightedIndex].value);
        } else if (filteredOptions.length === 1) {
          handleSelect(filteredOptions[0].value);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
        setSearchQuery('');
        setHighlightedIndex(-1);
      }
      // Altri tasti (caratteri) sono gestiti normalmente dall'input
      return;
    }

    // Gestisci i tasti speciali quando il focus non è sull'input
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => {
          const next = prev < filteredOptions.length - 1 ? prev + 1 : 0;
          optionRefs.current.get(next)?.scrollIntoView({ block: 'nearest' });
          return next;
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => {
          const next = prev > 0 ? prev - 1 : filteredOptions.length - 1;
          optionRefs.current.get(next)?.scrollIntoView({ block: 'nearest' });
          return next;
        });
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          handleSelect(filteredOptions[highlightedIndex].value);
        } else if (filteredOptions.length === 1) {
          handleSelect(filteredOptions[0].value);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSearchQuery('');
        setHighlightedIndex(-1);
        break;
      case 'Tab':
        setIsOpen(false);
        setSearchQuery('');
        setHighlightedIndex(-1);
        break;
    }
  };

  return (
    <div
      ref={dropdownRef}
      className={`custom-dropdown ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''} ${className}`}
      id={id}
    >
      <div
        ref={triggerRef}
        className="dropdown-trigger"
        onClick={handleToggle}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={handleKeyDown}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="dropdown-value">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 9L1 4H11L6 9Z" fill="currentColor"/>
          </svg>
        </span>
      </div>
      {isOpen && createPortal(
        <>
          {!isInsideModal && (
            <div 
              className="dropdown-backdrop" 
              onClick={() => setIsOpen(false)} 
            />
          )}
          <div 
            ref={menuRef}
            className="dropdown-menu"
            style={{
              position: 'fixed',
              top: menuPosition.top > 0 ? `${menuPosition.top}px` : undefined,
              left: menuPosition.left > 0 ? `${menuPosition.left}px` : undefined,
              width: menuPosition.width > 0 ? `${menuPosition.width}px` : 'auto',
              minWidth: '200px',
              zIndex: isInsideModal ? 1001 : 1003,
            }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={handleKeyDown}
          >
            {searchable && (
              <div className="dropdown-search">
                <input
                  ref={searchInputRef}
                  type="text"
                  className="dropdown-search-input"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                      e.preventDefault();
                      const nextIndex = e.key === 'ArrowDown' 
                        ? (highlightedIndex < filteredOptions.length - 1 ? highlightedIndex + 1 : 0)
                        : (highlightedIndex > 0 ? highlightedIndex - 1 : filteredOptions.length - 1);
                      setHighlightedIndex(nextIndex);
                      optionRefs.current.get(nextIndex)?.scrollIntoView({ block: 'nearest' });
                    } else if (e.key === 'Enter') {
                      e.preventDefault();
                      if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
                        handleSelect(filteredOptions[highlightedIndex].value);
                      } else if (filteredOptions.length === 1) {
                        handleSelect(filteredOptions[0].value);
                      }
                    } else if (e.key === 'Escape') {
                      e.preventDefault();
                      setIsOpen(false);
                      setSearchQuery('');
                      setHighlightedIndex(-1);
                    }
                    // Altri tasti (caratteri) sono gestiti dal onChange
                  }}
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                />
              </div>
            )}
            <div className="dropdown-options" role="listbox">
              {filteredOptions.length === 0 ? (
                <div className="dropdown-option dropdown-option-empty">
                  Nessun risultato
                </div>
              ) : (
                filteredOptions.map((option, index) => {
                  const isSelected = value === option.value;
                  const isHighlighted = highlightedIndex === index;
                  return (
                    <div
                      key={option.value}
                      ref={(el) => {
                        if (el) {
                          optionRefs.current.set(index, el);
                        } else {
                          optionRefs.current.delete(index);
                        }
                      }}
                      className={`dropdown-option ${isSelected ? 'selected' : ''} ${isHighlighted ? 'highlighted' : ''}`}
                      onClick={() => handleSelect(option.value)}
                      role="option"
                      aria-selected={isSelected}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleSelect(option.value);
                        } else {
                          handleKeyDown(e);
                        }
                      }}
                      tabIndex={-1}
                    >
                      {option.label}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

export default Dropdown;

