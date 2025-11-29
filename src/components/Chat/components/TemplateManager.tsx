import React, { useState } from 'react';
import { Template } from '../hooks/useTemplates';
import './TemplateManager.css';

interface TemplateManagerProps {
  isOpen: boolean;
  templates: Template[];
  onClose: () => void;
  onAdd: (template: Omit<Template, 'id' | 'createdAt' | 'usageCount'>) => void;
  onUpdate: (id: string, updates: Partial<Template>) => void;
  onDelete: (id: string) => void;
  onApply: (template: Template) => void;
  onExport: () => void;
  onImport: (file: File) => void;
  parseVariables: (content: string) => string[];
}

const TemplateManager: React.FC<TemplateManagerProps> = ({
  isOpen,
  templates,
  onClose,
  onAdd,
  onUpdate,
  onDelete,
  onApply,
  onExport,
  onImport,
  parseVariables
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    content: '',
    category: 'General'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  if (!isOpen) return null;

  const categories = ['All', ...new Set(templates.map(t => t.category))];

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.content) {
      alert('Nome e contenuto sono obbligatori');
      return;
    }

    const variables = parseVariables(formData.content);

    if (editingId) {
      onUpdate(editingId, { ...formData, variables });
      setEditingId(null);
    } else {
      onAdd({ ...formData, variables });
    }

    setFormData({ name: '', content: '', category: 'General' });
    setIsCreating(false);
  };

  const handleEdit = (template: Template) => {
    setFormData({
      name: template.name,
      content: template.content,
      category: template.category
    });
    setEditingId(template.id);
    setIsCreating(true);
  };

  const handleImportClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) onImport(file);
    };
    input.click();
  };

  return (
    <div className="template-manager-overlay">
      <div className="template-manager-modal">
        <div className="template-manager-header">
          <h2>📝 Template Manager</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="template-manager-toolbar">
          <input
            type="text"
            placeholder="🔍 Cerca template..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="template-search"
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-filter"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <button onClick={() => setIsCreating(true)} className="btn-primary">
            ➕ Nuovo
          </button>
          <button onClick={onExport} className="btn-secondary">
            📤 Esporta
          </button>
          <button onClick={handleImportClick} className="btn-secondary">
            📥 Importa
          </button>
        </div>

        {isCreating && (
          <div className="template-form">
            <h3>{editingId ? 'Modifica Template' : 'Nuovo Template'}</h3>
            <input
              type="text"
              placeholder="Nome template"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="form-input"
            />
            <input
              type="text"
              placeholder="Categoria"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="form-input"
            />
            <textarea
              placeholder="Contenuto template&#10;&#10;Usa {variabile} per variabili sostituibili"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="form-textarea"
              rows={6}
            />
            <div className="variables-preview">
              <strong>Variabili trovate:</strong> {parseVariables(formData.content).join(', ') || 'Nessuna'}
            </div>
            <div className="form-actions">
              <button onClick={handleSubmit} className="btn-primary">
                {editingId ? 'Aggiorna' : 'Crea'}
              </button>
              <button onClick={() => {
                setIsCreating(false);
                setEditingId(null);
                setFormData({ name: '', content: '', category: 'General' });
              }} className="btn-secondary">
                Annulla
              </button>
            </div>
          </div>
        )}

        <div className="templates-list">
          {filteredTemplates.length === 0 ? (
            <div className="empty-state">
              <p>Nessun template trovato</p>
              <button onClick={() => setIsCreating(true)} className="btn-primary">
                Crea il primo template
              </button>
            </div>
          ) : (
            filteredTemplates.map(template => (
              <div key={template.id} className="template-card">
                <div className="template-card-header">
                  <h4>{template.name}</h4>
                  <span className="template-category">{template.category}</span>
                </div>
                <p className="template-content">{template.content.substring(0, 100)}...</p>
                <div className="template-meta">
                  <span className="template-usage">📊 Usato {template.usageCount} volte</span>
                  {template.variables.length > 0 && (
                    <span className="template-variables">
                      🔤 {template.variables.length} variabili
                    </span>
                  )}
                </div>
                <div className="template-actions">
                  <button onClick={() => onApply(template)} className="btn-apply">
                    Usa
                  </button>
                  <button onClick={() => handleEdit(template)} className="btn-edit">
                    ✏️
                  </button>
                  <button onClick={() => {
                    if (confirm('Eliminare questo template?')) {
                      onDelete(template.id);
                    }
                  }} className="btn-delete">
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateManager;
