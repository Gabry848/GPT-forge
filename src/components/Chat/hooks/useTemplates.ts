import { useState, useEffect } from 'react';

export interface Template {
  id: string;
  name: string;
  content: string;
  category: string;
  variables: string[];
  createdAt: Date;
  usageCount: number;
}

export const useTemplates = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

  // Carica template da localStorage
  useEffect(() => {
    const loadTemplates = () => {
      try {
        const stored = localStorage.getItem('gpt_forge_templates');
        if (stored) {
          const parsed = JSON.parse(stored);
          setTemplates(parsed.map((t: any) => ({
            ...t,
            createdAt: new Date(t.createdAt)
          })));
        }
      } catch (error) {
        console.error('Error loading templates:', error);
      }
    };

    loadTemplates();
  }, []);

  // Salva template su localStorage
  const saveToStorage = (updatedTemplates: Template[]) => {
    try {
      localStorage.setItem('gpt_forge_templates', JSON.stringify(updatedTemplates));
    } catch (error) {
      console.error('Error saving templates:', error);
    }
  };

  const addTemplate = (template: Omit<Template, 'id' | 'createdAt' | 'usageCount'>) => {
    const newTemplate: Template = {
      ...template,
      id: Date.now().toString(),
      createdAt: new Date(),
      usageCount: 0
    };

    const updated = [...templates, newTemplate];
    setTemplates(updated);
    saveToStorage(updated);
    return newTemplate;
  };

  const updateTemplate = (id: string, updates: Partial<Template>) => {
    const updated = templates.map(t =>
      t.id === id ? { ...t, ...updates } : t
    );
    setTemplates(updated);
    saveToStorage(updated);
  };

  const deleteTemplate = (id: string) => {
    const updated = templates.filter(t => t.id !== id);
    setTemplates(updated);
    saveToStorage(updated);
  };

  const incrementUsage = (id: string) => {
    const updated = templates.map(t =>
      t.id === id ? { ...t, usageCount: t.usageCount + 1 } : t
    );
    setTemplates(updated);
    saveToStorage(updated);
  };

  const applyTemplate = (template: Template, variables: Record<string, string>): string => {
    let result = template.content;

    // Sostituisci variabili
    template.variables.forEach(varName => {
      const value = variables[varName] || '';
      result = result.replace(new RegExp(`{${varName}}`, 'g'), value);
    });

    incrementUsage(template.id);
    return result;
  };

  const parseVariables = (content: string): string[] => {
    const regex = /{(\w+)}/g;
    const matches = content.match(regex);
    if (!matches) return [];

    return [...new Set(matches.map(m => m.slice(1, -1)))];
  };

  const exportTemplates = () => {
    const dataStr = JSON.stringify(templates, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gpt-forge-templates-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importTemplates = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        const merged = [...templates, ...imported.map((t: any) => ({
          ...t,
          id: Date.now().toString() + Math.random(),
          createdAt: new Date(t.createdAt)
        }))];
        setTemplates(merged);
        saveToStorage(merged);
      } catch (error) {
        console.error('Error importing templates:', error);
        alert('Errore nell\'importazione dei template');
      }
    };
    reader.readAsText(file);
  };

  return {
    templates,
    showTemplateModal,
    setShowTemplateModal,
    editingTemplate,
    setEditingTemplate,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    applyTemplate,
    parseVariables,
    exportTemplates,
    importTemplates
  };
};
