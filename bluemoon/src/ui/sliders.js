/**
 * BlueMoon - Sliders UI
 * Handles slider interactions and value updates
 */

import { loadTraitGroups, saveTraitGroups } from '../core/persistence.js';
import { i18n } from '../core/i18n.js';

let traitGroups = [];

export async function initSliders() {
    console.log('[BlueMoon] Initializing sliders...');

    // Load trait groups
    traitGroups = loadTraitGroups();

    // Render sliders in the UI
    renderSliders();

    console.log('[BlueMoon] Sliders initialized');
}

/**
 * Render all sliders in the DOM
 */
function renderSliders() {
    const container = document.getElementById('bluemoon-traits-container');
    if (!container) {
        console.warn('[BlueMoon] Traits container not found');
        return;
    }

    container.innerHTML = '';

    traitGroups.forEach(group => {
        if (!group.enabled) return;

        // Create group section
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

        // Add traits to group
        group.traits.forEach(trait => {
            const traitDiv = createTraitSlider(trait, group.id);
            traitsList.appendChild(traitDiv);
        });

        container.appendChild(groupDiv);
    });

    // Add notes section
    addNotesSection(container);

    // Add relationships section
    addRelationshipsSection(container);
}

/**
 * Create a single trait slider element
 */
function createTraitSlider(trait, groupId) {
    const div = document.createElement('div');
    div.className = 'bluemoon-trait-item';
    div.dataset.traitId = trait.id;

    // Get current value (from state or default)
    const currentValue = localStorage.getItem(`bluemoon_trait_${trait.id}`) || trait.default;

    div.innerHTML = `
        <div class="bluemoon-trait-header">
            <span class="bluemoon-trait-icon">${trait.icon}</span>
            <label class="bluemoon-trait-label">${trait.label}</label>
            <button class="bluemoon-trait-edit" title="Edit prompt">
                <i class="fa-solid fa-pencil"></i>
            </button>
        </div>
        <div class="bluemoon-trait-slider-container">
            <input 
                type="range" 
                min="${trait.min}" 
                max="${trait.max}" 
                value="${currentValue}"
                class="bluemoon-slider"
                data-trait-id="${trait.id}"
            >
            <span class="bluemoon-slider-value">${currentValue}%</span>
        </div>
        <small class="bluemoon-trait-description">${trait.description || ''}</small>
    `;

    // Setup slider input
    const slider = div.querySelector('.bluemoon-slider');
    const valueDisplay = div.querySelector('.bluemoon-slider-value');

    slider.addEventListener('input', (e) => {
        const newValue = e.target.value;
        valueDisplay.textContent = `${newValue}%`;
        localStorage.setItem(`bluemoon_trait_${trait.id}`, newValue);
        console.log(`[BlueMoon] Slider ${trait.id} changed to ${newValue}%`);
    });

    // Setup edit button
    const editBtn = div.querySelector('.bluemoon-trait-edit');
    editBtn.addEventListener('click', () => {
        openPromptEditor(trait, groupId);
    });

    return div;
}

/**
 * Add notes section
 */
function addNotesSection(container) {
    const notesDiv = document.createElement('div');
    notesDiv.className = 'bluemoon-notes-section';
    notesDiv.innerHTML = `
        <div class="bluemoon-section-header">
            <h3>📝 Заметки и инструкции</h3>
            <button id="bluemoon-add-note" class="bluemoon-add-btn">
                <i class="fa-solid fa-plus"></i>
            </button>
        </div>
        <textarea 
            id="bluemoon-notes" 
            class="bluemoon-notes-textarea"
            placeholder="Добавьте дополнительные инструкции для нейросети..."
        >${localStorage.getItem('bluemoon_notes') || ''}</textarea>
    `;

    container.appendChild(notesDiv);

    // Save notes
    const notesTA = notesDiv.querySelector('.bluemoon-notes-textarea');
    notesTA.addEventListener('change', () => {
        localStorage.setItem('bluemoon_notes', notesTA.value);
        console.log('[BlueMoon] Notes saved');
    });
}

/**
 * Add relationships section
 */
function addRelationshipsSection(container) {
    const relDiv = document.createElement('div');
    relDiv.className = 'bluemoon-relationships-section';
    relDiv.innerHTML = `
        <div class="bluemoon-section-header">
            <h3>💭 Отношения персонажей</h3>
            <button id="bluemoon-expand-relationships" class="bluemoon-expand-btn">
                <i class="fa-solid fa-chevron-down"></i>
            </button>
        </div>
        <div id="bluemoon-relationships-preview" class="bluemoon-relationships-preview">
            <!-- Will be populated by relationshipUI.js -->
        </div>
    `;

    container.appendChild(relDiv);
}

/**
 * Open prompt editor modal
 */
function openPromptEditor(trait, groupId) {
    console.log('[BlueMoon] Opening prompt editor for:', trait.id);
    // Implementation will be in promptEditor.js
}

export { renderSliders, createTraitSlider };