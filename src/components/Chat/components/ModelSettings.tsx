import React, { useState, useMemo } from 'react';

interface OpenRouterModel {
  id: string;
  name: string;
  description: string;
  context_length: number;
  pricing: {
    prompt: string;
    completion: string;
  };
}

interface ModelSettingsProps {
  selectedModel: string;
  availableModels: OpenRouterModel[];
  modelsLoading: boolean;
  modelsError: string | null;
  onModelChange: (modelId: string) => void;
  onLoadModels: () => void;
}

const ModelSettings: React.FC<ModelSettingsProps> = ({
  selectedModel,
  availableModels,
  modelsLoading,
  modelsError,
  onModelChange,
  onLoadModels
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'prompt_price' | 'completion_price'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [maxPriceFilter, setMaxPriceFilter] = useState<number | null>(null);

  // Funzione per parsare il prezzo (string -> number)
  const parsePrice = (priceString: string): number => {
    const price = parseFloat(priceString);
    return isNaN(price) ? 0 : price;
  };

  // Filtra e ordina i modelli
  const filteredAndSortedModels = useMemo(() => {
    let filtered = availableModels.filter(model => {
      const nameMatch = model.name.toLowerCase().includes(searchTerm.toLowerCase());
      const idMatch = model.id.toLowerCase().includes(searchTerm.toLowerCase());
      const descriptionMatch = model.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const searchMatch = nameMatch || idMatch || descriptionMatch;
      
      // Filtro per prezzo massimo
      let priceMatch = true;
      if (maxPriceFilter !== null) {
        const promptPrice = parsePrice(model.pricing.prompt);
        const completionPrice = parsePrice(model.pricing.completion);
        const maxModelPrice = Math.max(promptPrice, completionPrice);
        priceMatch = maxModelPrice <= maxPriceFilter;
      }
      
      return searchMatch && priceMatch;
    });

    // Ordinamento
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'prompt_price':
          comparison = parsePrice(a.pricing.prompt) - parsePrice(b.pricing.prompt);
          break;
        case 'completion_price':
          comparison = parsePrice(a.pricing.completion) - parsePrice(b.pricing.completion);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [availableModels, searchTerm, sortBy, sortOrder, maxPriceFilter]);

  const handleSort = (field: 'name' | 'prompt_price' | 'completion_price') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: 'name' | 'prompt_price' | 'completion_price') => {
    if (sortBy !== field) return '↕️';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const formatPrice = (price: string) => {
    const numPrice = parsePrice(price);
    return `$${(numPrice * 1000000).toFixed(2)}/1M tok`;
  };

  return (
    <div className="settings-section">
      <h3 className="settings-section-title">
        <span className="settings-section-icon">🧠</span>
        Modello AI
        {modelsLoading && <span style={{fontSize: '12px', color: '#666'}}> (Caricamento...)</span>}
      </h3>
      
      {/* Controlli filtri e ricerca */}
      <div className="models-controls">
        <div className="models-search-row">
          <div className="models-search-container">
            <input
              type="text"
              placeholder="Cerca modelli per nome, ID o descrizione..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="models-search-input"
            />
            <button 
              className="models-refresh"
              onClick={onLoadModels}
              disabled={modelsLoading}
              title="Aggiorna lista modelli"
            >
              🔄
            </button>
          </div>
        </div>
        
        <div className="models-filters-row">
          <div className="models-filter-container">
            <label className="models-filter-label">Prezzo max ($/1M token):</label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Nessun limite"
              value={maxPriceFilter || ''}
              onChange={(e) => setMaxPriceFilter(e.target.value ? parseFloat(e.target.value) : null)}
              className="models-price-filter"
            />
          </div>
          
          <div className="models-stats">
            {availableModels.length > 0 && (
              <span>
                Mostrando {filteredAndSortedModels.length} di {availableModels.length} modelli
              </span>
            )}
          </div>
        </div>
      </div>

      {modelsLoading ? (
        <div className="models-loading">
          <div className="models-loading-spinner">⏳</div>
          Caricamento modelli disponibili...
        </div>
      ) : modelsError ? (
        <div className="models-error">
          <div className="models-error-icon">❌</div>
          {modelsError}
        </div>
      ) : availableModels.length === 0 ? (
        <div className="models-empty">
          <div className="models-empty-icon">📭</div>
          Nessun modello disponibile. Clicca "🔄" per caricare i modelli.
        </div>
      ) : (
        <div className="models-table-container">
          <table className="models-table">            <thead>
              <tr>
                <th></th>
                <th 
                  className="models-sortable-header"
                  onClick={() => handleSort('name')}
                >
                  Nome {getSortIcon('name')}
                </th>
                <th>Context</th>
                <th 
                  className="models-sortable-header"
                  onClick={() => handleSort('prompt_price')}
                >
                  Prezzo Input {getSortIcon('prompt_price')}
                </th>
                <th 
                  className="models-sortable-header"
                  onClick={() => handleSort('completion_price')}
                >
                  Prezzo Output {getSortIcon('completion_price')}
                </th>
                <th>Descrizione</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedModels.map(model => (
                <tr 
                  key={model.id} 
                  className={`models-table-row ${selectedModel === model.id ? 'selected' : ''}`}
                  onClick={() => onModelChange(model.id)}
                >
                  <td className="models-radio-cell">
                    <input
                      type="radio"
                      name="model-selection"
                      checked={selectedModel === model.id}
                      onChange={() => onModelChange(model.id)}
                      className="models-radio"
                    />
                  </td>                  <td className="models-name-cell">
                    <div className="models-name">{model.name}</div>
                    <div className="models-id">{model.id}</div>
                  </td>
                  <td className="models-context-cell">
                    {model.context_length?.toLocaleString() || 'N/A'}
                  </td>
                  <td className="models-price-cell">
                    {formatPrice(model.pricing.prompt)}
                  </td>
                  <td className="models-price-cell">
                    {formatPrice(model.pricing.completion)}
                  </td>
                  <td className="models-description-cell">
                    <div className="models-description" title={model.description}>
                      {model.description}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredAndSortedModels.length === 0 && searchTerm && (
            <div className="models-no-results">
              <div className="models-no-results-icon">🔍</div>
              Nessun modello trovato per "{searchTerm}"
            </div>
          )}
        </div>
      )}

      {selectedModel && (
        <div className="models-selected-info">
          <span className="models-selected-label">✅ Modello selezionato:</span>
          <span className="models-selected-name">{selectedModel}</span>
        </div>
      )}
    </div>
  );
};

export default ModelSettings;
