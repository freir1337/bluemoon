/**
 * BlueMoon - Relationships UI
 * Manages character relationship display and editing
 */

import { relationshipTypes } from '../core/config.js';
import { getContext } from '../../../extensions.js';

export async function initRelationshipUI() {
    console.log('[BlueMoon] Initializing relationship UI...');
    
    // Create relationship editor modal
    createRelationshipEditorModal();
    
    // Load and display relationships
    displayRelationships();
    
    console.log('[BlueMoon] Relationship UI initialized');
}

/**
 * Create relationship editor modal
 */
function createRelationshipEditorModal() {
    const modal = document.createElement('div');
    modal.id = 'bluemoon-relationship-editor-modal';
    modal.className = 'bluemoon-modal bluemoon-relationship-modal';
    modal.innerHTML = `
        <div class="bluemoon-modal-content">
            <div class="bluemoon-modal-header">
                <h2>Управление отношениями</h2>
                <button class="bluemoon-modal-close">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
            <div class="bluemoon-modal-body">
                <div id="bluemoon-relationships-editor">
                    <!-- Will be populated dynamically -->
                </div>
            </div>
            <div class="bluemoon-modal-footer">
                <button id="bluemoon-add-relationship" class="bluemoon-btn bluemoon-btn-primary">
                    <i class="fa-solid fa-plus"></i> Добавить отношение
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Setup close button
    modal.querySelector('.bluemoon-modal-close').addEventListener('click', () => {
        modal.classList.remove('bluemoon-modal-open');
    });

    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('bluemoon-modal-open');
        }
    });
}

/**
 * Display character relationships
 */
function displayRelationships() {
    const container = document.getElementById('bluemoon-relationships-preview');
    if (!container) return;

    // Get current character's relationships from localStorage
    const charId = getContext().characterId;
    if (!charId) {
        container.innerHTML = '<p class="bluemoon-empty-state">Выберите персонажа</p>';
        return;
    }

    const relationships = JSON.parse(
        localStorage.getItem(`bluemoon_relationships_${charId}`) || '{}'
    );

    if (Object.keys(relationships).length === 0) {
        container.innerHTML = '<p class="bluemoon-empty-state">Отношения не установлены</p>';
        return;
    }

    // Render relationships
    container.innerHTML = '';
    Object.entries(relationships).forEach(([otherCharId, relData]) => {
        const relDiv = createRelationshipPreview(otherCharId, relData);
        container.appendChild(relDiv);
    });
}

/**
 * Create a relationship preview element
 */
function createRelationshipPreview(otherCharId, relData) {
    const div = document.createElement('div');
    div.className = 'bluemoon-relationship-preview';
    div.dataset.otherCharId = otherCharId;

    const relType = relationshipTypes.find(t => t.id === relData.type);
    const emoji = relType?.emoji || '❓';
    const label = relType?.label || 'Неизвестно';
    const percentage = relData.percentage || 50;

    div.innerHTML = `
        <div class="bluemoon-rel-header">
            <span class="bluemoon-rel-emoji">${emoji}</span>
            <span class="bluemoon-rel-type">${label}</span>
            <span class="bluemoon-rel-percentage">${percentage}%</span>
        </div>
        <div class="bluemoon-rel-bar">
            <div class="bluemoon-rel-bar-fill" style="width: ${percentage}%"></div>
        </div>
    `;

    div.addEventListener('click', () => {
        openRelationshipEditor(otherCharId, relData);
    });

    return div;
}

/**
 * Open relationship editor for specific relationship
 */
export function openRelationshipEditor(otherCharId, relData) {
    const modal = document.getElementById('bluemoon-relationship-editor-modal');
    if (!modal) return;

    const editorContent = document.getElementById('bluemoon-relationships-editor');
    editorContent.innerHTML = '';

    // Get character name
    const otherCharName = getCharacterName(otherCharId);

    const form = document.createElement('div');
    form.className = 'bluemoon-relationship-form';
    form.innerHTML = `
        <h3>Отношения с ${otherCharName}</h3>
        
        <div class="bluemoon-form-group">
            <label for="rel-type-select">Тип отношения:</label>
            <select id="rel-type-select" class="bluemoon-select">
                ${relationshipTypes.map(t => `
                    <option value="${t.id}" ${t.id === relData.type ? 'selected' : ''}>
                        ${t.emoji} ${t.label}
                    </option>
                `).join('')}
            </select>
        </div>

        <div class="bluemoon-form-group">
            <label for="rel-percentage">Уровень отношений (%):</label>
            <input 
                type="range" 
                id="rel-percentage" 
                min="0" 
                max="100" 
                value="${relData.percentage || 50}"
                class="bluemoon-slider"
            >
            <span id="rel-percentage-value">${relData.percentage || 50}%</span>
        </div>

        <div class="bluemoon-form-group">
            <label for="rel-notes">Заметки:</label>
            <textarea 
                id="rel-notes" 
                class="bluemoon-textarea"
                placeholder="История, предыстория, события..."
            >${relData.notes || ''}</textarea>
        </div>

        <div class="bluemoon-form-group">
            <label for="rel-prompt">Система подсказок для ИИ:</label>
            <textarea 
                id="rel-prompt" 
                class="bluemoon-textarea"
                placeholder="Дополнительные инструкции для ИИ о взаимодействии..."
            >${relData.customPrompt || ''}</textarea>
        </div>

        <div class="bluemoon-form-actions">
            <button id="rel-save-btn" class="bluemoon-btn bluemoon-btn-primary">Сохранить</button>
            <button id="rel-delete-btn" class="bluemoon-btn bluemoon-btn-danger">Удалить отношение</button>
            <button id="rel-close-btn" class="bluemoon-btn bluemoon-btn-secondary">Отмена</button>
        </div>
    `;

    editorContent.appendChild(form);

    // Setup percentage slider
    const percentageSlider = form.querySelector('#rel-percentage');
    const percentageValue = form.querySelector('#rel-percentage-value');
    percentageSlider.addEventListener('input', (e) => {
        percentageValue.textContent = e.target.value + '%';
    });

    // Save button
    form.querySelector('#rel-save-btn').addEventListener('click', () => {
        saveRelationship(otherCharId, {
            type: form.querySelector('#rel-type-select').value,
            percentage: parseInt(percentageSlider.value),
            notes: form.querySelector('#rel-notes').value,
            customPrompt: form.querySelector('#rel-prompt').value,
        });
    });

    // Delete button
    form.querySelector('#rel-delete-btn').addEventListener('click', () => {
        if (confirm('Удалить это отношение?')) {
            deleteRelationship(otherCharId);
        }
    });

    // Close button
    form.querySelector('#rel-close-btn').addEventListener('click', () => {
        modal.classList.remove('bluemoon-modal-open');
    });

    modal.classList.add('bluemoon-modal-open');
}

/**
 * Save relationship to localStorage
 */
function saveRelationship(otherCharId, relData) {
    const charId = getContext().characterId;
    if (!charId) return;

    const relationships = JSON.parse(
        localStorage.getItem(`bluemoon_relationships_${charId}`) || '{}'
    );

    relationships[otherCharId] = relData;
    localStorage.setItem(`bluemoon_relationships_${charId}`, JSON.stringify(relationships));

    console.log('[BlueMoon] Relationship saved:', otherCharId, relData);
    
    // Close modal and refresh display
    document.getElementById('bluemoon-relationship-editor-modal').classList.remove('bluemoon-modal-open');
    displayRelationships();
}

/**
 * Delete relationship
 */
function deleteRelationship(otherCharId) {
    const charId = getContext().characterId;
    if (!charId) return;

    const relationships = JSON.parse(
        localStorage.getItem(`bluemoon_relationships_${charId}`) || '{}'
    );

    delete relationships[otherCharId];
    localStorage.setItem(`bluemoon_relationships_${charId}`, JSON.stringify(relationships));

    console.log('[BlueMoon] Relationship deleted:', otherCharId);
    displayRelationships();
}

/**
 * Get character name by ID
 */
function getCharacterName(charId) {
    const context = getContext();
    const characters = context.characters || [];
    const character = characters.find(c => c.id == charId); // may be string or number
    return character?.name || `Персонаж ${charId}`;
}

export { displayRelationships, createRelationshipPreview, saveRelationship };