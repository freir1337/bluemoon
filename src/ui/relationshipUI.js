/**
 * BlueMoon - Relationships UI
 */

import { getContext } from '../../../../extensions.js';
import { relationshipTypes } from '../core/config.js';

export async function initRelationshipUI() {
    console.log('[BlueMoon] Initializing relationship UI...');
    createRelationshipEditorModal();
    createAddRelationshipModal();
    displayRelationships();

    // Listen for add relationship button event from sliders.js
    document.addEventListener('bluemoon-add-relationship', () => {
        openAddRelationshipModal();
    });

    console.log('[BlueMoon] Relationship UI initialized');
}

function createRelationshipEditorModal() {
    if (document.getElementById('bluemoon-relationship-editor-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'bluemoon-relationship-editor-modal';
    modal.className = 'bluemoon-modal';
    modal.innerHTML = `
        <div class="bluemoon-modal-content">
            <div class="bluemoon-modal-header">
                <h2>Управление отношениями</h2>
                <button class="bluemoon-modal-close"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="bluemoon-modal-body">
                <div id="bluemoon-relationships-editor"></div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('.bluemoon-modal-close').addEventListener('click', () => {
        modal.classList.remove('bluemoon-modal-open');
    });
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('bluemoon-modal-open');
    });
}

function createAddRelationshipModal() {
    if (document.getElementById('bluemoon-add-rel-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'bluemoon-add-rel-modal';
    modal.className = 'bluemoon-modal';
    modal.innerHTML = `
        <div class="bluemoon-modal-content">
            <div class="bluemoon-modal-header">
                <h2>Добавить отношение</h2>
                <button class="bluemoon-modal-close"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="bluemoon-modal-body">
                <div class="bluemoon-form-group">
                    <label for="add-rel-char-name">Имя персонажа (или юзера):</label>
                    <input type="text" id="add-rel-char-name" class="bluemoon-input" placeholder="Например: User, Aria..." />
                </div>
                <div class="bluemoon-form-group">
                    <label for="add-rel-type">Тип отношения:</label>
                    <select id="add-rel-type" class="bluemoon-select">
                        ${relationshipTypes.map(t => `<option value="${t.id}">${t.emoji} ${t.label}</option>`).join('')}
                    </select>
                </div>
                <div class="bluemoon-form-group">
                    <label>Уровень отношений: <span id="add-rel-pct-val">50%</span></label>
                    <input type="range" id="add-rel-percentage" min="0" max="100" value="50" class="bluemoon-slider" />
                </div>
                <div class="bluemoon-form-group">
                    <label for="add-rel-notes">Заметки (история, контекст):</label>
                    <textarea id="add-rel-notes" class="bluemoon-textarea" placeholder="Краткая история отношений..."></textarea>
                </div>
            </div>
            <div class="bluemoon-modal-footer">
                <button id="add-rel-cancel-btn" class="bluemoon-btn bluemoon-btn-secondary">Отмена</button>
                <button id="add-rel-save-btn" class="bluemoon-btn bluemoon-btn-primary">
                    <i class="fa-solid fa-plus"></i> Добавить
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('.bluemoon-modal-close').addEventListener('click', () => modal.classList.remove('bluemoon-modal-open'));
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('bluemoon-modal-open'); });
    modal.querySelector('#add-rel-cancel-btn').addEventListener('click', () => modal.classList.remove('bluemoon-modal-open'));

    const pctSlider = modal.querySelector('#add-rel-percentage');
    const pctVal = modal.querySelector('#add-rel-pct-val');
    pctSlider.addEventListener('input', () => { pctVal.textContent = pctSlider.value + '%'; });

    modal.querySelector('#add-rel-save-btn').addEventListener('click', () => {
        const charName = modal.querySelector('#add-rel-char-name').value.trim();
        if (!charName) { alert('Введите имя персонажа'); return; }

        const relData = {
            name: charName,
            type: modal.querySelector('#add-rel-type').value,
            percentage: parseInt(pctSlider.value),
            notes: modal.querySelector('#add-rel-notes').value,
            customPrompt: '',
        };

        const charId = getCurrentCharId();
        if (!charId) { alert('Выберите персонажа в SillyTavern'); return; }

        const relationships = getRelationships(charId);
        const key = charName.toLowerCase().replace(/\s+/g, '_');
        relationships[key] = relData;
        saveRelationships(charId, relationships);

        modal.classList.remove('bluemoon-modal-open');
        displayRelationships();
    });
}

function openAddRelationshipModal() {
    const modal = document.getElementById('bluemoon-add-rel-modal');
    if (modal) {
        // Reset form
        modal.querySelector('#add-rel-char-name').value = '';
        modal.querySelector('#add-rel-notes').value = '';
        modal.querySelector('#add-rel-percentage').value = 50;
        modal.querySelector('#add-rel-pct-val').textContent = '50%';
        modal.classList.add('bluemoon-modal-open');
    }
}

export function displayRelationships() {
    // Update all relationship preview containers
    const containers = document.querySelectorAll('.bluemoon-relationships-preview');
    if (!containers.length) return;

    const charId = getCurrentCharId();

    containers.forEach(container => {
        if (!charId) {
            container.innerHTML = '<p class="bluemoon-empty-state">Выберите персонажа</p>';
            return;
        }

        const relationships = getRelationships(charId);
        const entries = Object.entries(relationships);

        if (entries.length === 0) {
            container.innerHTML = '<p class="bluemoon-empty-state">Отношения не установлены. Нажмите + чтобы добавить.</p>';
            return;
        }

        container.innerHTML = '';
        entries.forEach(([key, relData]) => {
            container.appendChild(createRelationshipPreview(key, relData, charId));
        });
    });
}

function createRelationshipPreview(key, relData, charId) {
    const relType = relationshipTypes.find(t => t.id === relData.type);
    const emoji = relType?.emoji || '❓';
    const label = relType?.label || 'Неизвестно';
    const pct = relData.percentage ?? 50;
    const name = relData.name || key;

    const div = document.createElement('div');
    div.className = 'bluemoon-relationship-preview';

    // Color the bar based on relationship type
    const barColor = relType?.color || '#6366f1';

    div.innerHTML = `
        <div class="bluemoon-rel-header">
            <span class="bluemoon-rel-emoji">${emoji}</span>
            <span class="bluemoon-rel-name" style="font-weight:600; flex:1;">${name}</span>
            <span class="bluemoon-rel-type" style="font-size:0.8em; opacity:0.7;">${label}</span>
            <span class="bluemoon-rel-percentage" style="margin-left:8px;">${pct}%</span>
        </div>
        <div class="bluemoon-rel-bar">
            <div class="bluemoon-rel-bar-fill" style="width:${pct}%; background:${barColor};"></div>
        </div>
    `;

    div.addEventListener('click', () => openRelationshipEditor(key, relData, charId));
    return div;
}

export function openRelationshipEditor(key, relData, charId) {
    const modal = document.getElementById('bluemoon-relationship-editor-modal');
    if (!modal) return;

    const editorContent = document.getElementById('bluemoon-relationships-editor');
    const name = relData.name || key;

    editorContent.innerHTML = `
        <h3 style="margin-bottom:16px; color: var(--bm-primary, #6366f1);">Отношения с: ${name}</h3>
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
            <label>Уровень отношений: <span id="rel-pct-val">${relData.percentage ?? 50}%</span></label>
            <input type="range" id="rel-percentage" min="0" max="100" value="${relData.percentage ?? 50}" class="bluemoon-slider" />
        </div>
        <div class="bluemoon-form-group">
            <label for="rel-notes">Заметки:</label>
            <textarea id="rel-notes" class="bluemoon-textarea" placeholder="История, предыстория, события...">${relData.notes || ''}</textarea>
        </div>
        <div class="bluemoon-form-group">
            <label for="rel-prompt">Дополнительный промпт для ИИ:</label>
            <textarea id="rel-prompt" class="bluemoon-textarea" placeholder="Дополнительные инструкции для ИИ...">${relData.customPrompt || ''}</textarea>
        </div>
        <div style="display:flex; gap:10px; margin-top:16px;">
            <button id="rel-save-btn" class="bluemoon-btn bluemoon-btn-primary" style="flex:2;">
                <i class="fa-solid fa-save"></i> Сохранить
            </button>
            <button id="rel-delete-btn" class="bluemoon-btn bluemoon-btn-danger" style="flex:1;">
                <i class="fa-solid fa-trash"></i> Удалить
            </button>
        </div>
    `;

    const pctSlider = editorContent.querySelector('#rel-percentage');
    const pctVal = editorContent.querySelector('#rel-pct-val');
    pctSlider.addEventListener('input', () => { pctVal.textContent = pctSlider.value + '%'; });

    editorContent.querySelector('#rel-save-btn').addEventListener('click', () => {
        const relationships = getRelationships(charId);
        relationships[key] = {
            ...relData,
            type: editorContent.querySelector('#rel-type-select').value,
            percentage: parseInt(pctSlider.value),
            notes: editorContent.querySelector('#rel-notes').value,
            customPrompt: editorContent.querySelector('#rel-prompt').value,
        };
        saveRelationships(charId, relationships);
        modal.classList.remove('bluemoon-modal-open');
        displayRelationships();
    });

    editorContent.querySelector('#rel-delete-btn').addEventListener('click', () => {
        if (!confirm(`Удалить отношение с ${name}?`)) return;
        const relationships = getRelationships(charId);
        delete relationships[key];
        saveRelationships(charId, relationships);
        modal.classList.remove('bluemoon-modal-open');
        displayRelationships();
    });

    modal.classList.add('bluemoon-modal-open');
}

// ============ Helpers ============

function getCurrentCharId() {
    try {
        const ctx = getContext();
        return ctx?.characterId ?? ctx?.groupId ?? null;
    } catch (e) {
        return null;
    }
}

function getRelationships(charId) {
    try {
        return JSON.parse(localStorage.getItem(`bluemoon_relationships_${charId}`) || '{}');
    } catch {
        return {};
    }
}

function saveRelationships(charId, relationships) {
    localStorage.setItem(`bluemoon_relationships_${charId}`, JSON.stringify(relationships));
}

export function getRelationshipsPrompt(charId) {
    const relationships = getRelationships(charId);
    const entries = Object.entries(relationships);
    if (!entries.length) return null;

    const lines = ['[ОТНОШЕНИЯ ПЕРСОНАЖЕЙ]'];
    entries.forEach(([key, rel]) => {
        const relType = relationshipTypes.find(t => t.id === rel.type);
        lines.push(`- С "${rel.name || key}": ${relType?.label || rel.type} (${rel.percentage ?? 50}%)`);
        if (rel.notes) lines.push(`  История: ${rel.notes}`);
        if (rel.customPrompt) lines.push(`  Инструкция: ${rel.customPrompt}`);
    });
    return lines.join('\n');
}
