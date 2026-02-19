/**
 * BlueMoon - Sliders UI
 */

import { loadTraitGroups } from '../core/persistence.js';
import { openPromptEditor } from './promptEditor.js';

let traitGroups = [];

export async function initSliders() {
    console.log('[BlueMoon] Initializing sliders...');
    traitGroups = loadTraitGroups();
    renderSliders();
    console.log('[BlueMoon] Sliders initialized');
}

export function renderSliders() {
    traitGroups = loadTraitGroups();

    // Render into desktop and mobile containers
    const containers = [
        document.getElementById('bluemoon-traits-container'),
        document.getElementById('bluemoon-traits-container-mobile'),
    ];

    containers.forEach(container => {
        if (!container) return;
        container.innerHTML = '';

        traitGroups.forEach(group => {
            if (!group.enabled) return;

            const groupDiv = document.createElement('div');
            groupDiv.className = 'bluemoon-trait-group';
            groupDiv.innerHTML = `
                <div class="bluemoon-group-header">
                    <span class="bluemoon-group-icon">${group.icon}</span>
                    <h3 class="bluemoon-group-label">${group.label}</h3>
                </div>
                <div class="bluemoon-traits-list"></div>
            `;

            const traitsList = groupDiv.querySelector('.bluemoon-traits-list');
            group.traits.forEach(trait => {
                traitsList.appendChild(createTraitSlider(trait, group.id));
            });

            container.appendChild(groupDiv);
        });

        addNotesSection(container);
        addRelationshipsSection(container);
    });
}

function createTraitSlider(trait, groupId) {
    const div = document.createElement('div');
    div.className = 'bluemoon-trait-item';
    div.dataset.traitId = trait.id;

    const currentValue = parseInt(localStorage.getItem(`bluemoon_trait_${trait.id}`)) || trait.default || 0;

    // Build label - for author-based, show author name
    let displayLabel = trait.label;
    if (trait.type === 'author-based' && trait.settings?.author) {
        displayLabel = trait.label.replace('писателя', `писателя ${trait.settings.author}`);
        if (!displayLabel.includes(trait.settings.author)) {
            displayLabel = `${trait.label}: ${trait.settings.author}`;
        }
    }

    div.innerHTML = `
        <div class="bluemoon-trait-header">
            <span class="bluemoon-trait-icon">${trait.icon || '⚙️'}</span>
            <label class="bluemoon-trait-label">${displayLabel}</label>
            <button class="bluemoon-trait-edit" title="Редактировать промпт">
                <i class="fa-solid fa-pencil"></i>
            </button>
        </div>
        <div class="bluemoon-trait-slider-container">
            <input
                type="range"
                min="${trait.min ?? 0}"
                max="${trait.max ?? 100}"
                value="${currentValue}"
                class="bluemoon-slider"
                data-trait-id="${trait.id}"
            />
            <span class="bluemoon-slider-value">${currentValue}%</span>
        </div>
        ${trait.description ? `<small class="bluemoon-trait-description">${trait.description}</small>` : ''}
    `;

    const slider = div.querySelector('.bluemoon-slider');
    const valueDisplay = div.querySelector('.bluemoon-slider-value');

    slider.addEventListener('input', (e) => {
        const newValue = e.target.value;
        valueDisplay.textContent = `${newValue}%`;
        localStorage.setItem(`bluemoon_trait_${trait.id}`, newValue);
    });

    div.querySelector('.bluemoon-trait-edit').addEventListener('click', () => {
        openPromptEditor(trait, groupId);
    });

    return div;
}

function addNotesSection(container) {
    const notesDiv = document.createElement('div');
    notesDiv.className = 'bluemoon-notes-section';
    notesDiv.innerHTML = `
        <div class="bluemoon-section-header">
            <h3>📝 Заметки и инструкции</h3>
            <button class="bluemoon-add-btn" title="Добавить заметку">
                <i class="fa-solid fa-plus"></i>
            </button>
        </div>
        <textarea
            class="bluemoon-notes-textarea"
            placeholder="Добавьте дополнительные инструкции для ИИ... Например: небо всегда зелёное, слоп всегда отборный!"
        >${localStorage.getItem('bluemoon_notes') || ''}</textarea>
    `;
    container.appendChild(notesDiv);

    const ta = notesDiv.querySelector('.bluemoon-notes-textarea');
    ta.addEventListener('input', () => {
        localStorage.setItem('bluemoon_notes', ta.value);
    });
}

function addRelationshipsSection(container) {
    const relDiv = document.createElement('div');
    relDiv.className = 'bluemoon-relationships-section';
    relDiv.innerHTML = `
        <div class="bluemoon-section-header">
            <h3>💭 Отношения персонажей</h3>
            <button class="bluemoon-add-rel-btn" title="Добавить отношение">
                <i class="fa-solid fa-plus"></i>
            </button>
        </div>
        <div class="bluemoon-relationships-preview">
            <p class="bluemoon-empty-state">Выберите персонажа для просмотра отношений</p>
        </div>
    `;
    container.appendChild(relDiv);

    // Add relationship button — will be wired by relationshipUI
    const addBtn = relDiv.querySelector('.bluemoon-add-rel-btn');
    addBtn.addEventListener('click', () => {
        // Trigger add relationship modal
        const addEvent = new CustomEvent('bluemoon-add-relationship');
        document.dispatchEvent(addEvent);
    });
}

export { createTraitSlider };
