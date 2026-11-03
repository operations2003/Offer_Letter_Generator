export interface SavedCustomTemplate {
  id: string;
  title: string;
  category: string;
  categoryCode: string;
  categoryName: string;
  description: string;
  badge: string;
  color: string;
  iconName?: string;
  createdAt: string;
  updatedAt: string;
  fileName?: string;
  totalPages?: number;
  totalDetectedTables?: number;
  sections: Array<{ number: number; title: string; content: string }>;
  extractedValues?: Record<string, string>;
  detectedVariables?: string[];
  fullStructuredHtml?: string;
}

const STORAGE_KEY = 'tasknera_saved_offer_templates';
export const TEMPLATES_UPDATED_EVENT = 'tasknera_templates_updated';

export const CustomTemplateService = {
  getSavedTemplates(): SavedCustomTemplate[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Failed to parse saved templates from localStorage', e);
      return [];
    }
  },

  getTemplateById(id: string): SavedCustomTemplate | null {
    const list = this.getSavedTemplates();
    return list.find((t) => t.id === id) || null;
  },

  saveTemplate(template: Omit<SavedCustomTemplate, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): SavedCustomTemplate {
    const list = this.getSavedTemplates();
    const now = new Date().toISOString();
    const existingIndex = template.id ? list.findIndex((t) => t.id === template.id) : -1;

    let savedItem: SavedCustomTemplate;

    if (existingIndex >= 0) {
      savedItem = {
        ...list[existingIndex],
        ...template,
        id: list[existingIndex].id,
        updatedAt: now,
      };
      list[existingIndex] = savedItem;
    } else {
      savedItem = {
        ...template,
        id: template.id || `custom_tpl_${Date.now()}`,
        createdAt: now,
        updatedAt: now,
      };
      list.unshift(savedItem);
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(TEMPLATES_UPDATED_EVENT, { detail: savedItem }));
      }
    } catch (e) {
      console.error('Failed to save template to localStorage', e);
    }

    return savedItem;
  },

  deleteTemplate(id: string): boolean {
    const list = this.getSavedTemplates();
    const filtered = list.filter((t) => t.id !== id);
    if (filtered.length === list.length) return false;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(TEMPLATES_UPDATED_EVENT, { detail: { deletedId: id } }));
      }
      return true;
    } catch (e) {
      console.error('Failed to delete template from localStorage', e);
      return false;
    }
  },
};

