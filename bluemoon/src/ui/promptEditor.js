/**
 * BlueMoon - Prompt Editor
 * Modal for editing trait prompts and settings
 */

import { loadTraitGroups, saveTraitGroups } from '../core/persistence.js';

export async function initPromptEditor() {
    console.log('[BlueMoon] Initializing prompt editor...');
    
    // Create modal HTML
    createPromptEditorModal();
    
    console.log('[BlueMoon] Prompt editor initialized');
}

/**
 * Create the prompt editor modal
 */
function createPromptEditorModal() {
    const modal = document.createElement('div');
    modal.id = 'bluemoon-prompt-editor-modal';
    modal.className = 'bluemoon-modal bluemoon-prompt-editor-modal';
    modal.innerHTML = `
        <div class="bluemoon-modal-content">
            <div class="bluemoon-modal-header">
                <h2 id="bluemoon-editor-title">Редактирование промпта</h2>
                <button class="bluemoon-modal-close">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
            <div class="bluemoon-modal-body">
                <div id="bluemoon-editor-content">
                    <!-- Content will be generated dynamically -->
                </div>
            </div>
            <div class="bluemoon-modal-footer">
                <button id="bluemoon-reset-prompt" class="bluemoon-btn bluemoon-btn-secondary">
                    <i class="fa-solid fa-undo"></i> Сбросить по умолчанию
                </button>
                <button id="bluemoon-save-prompt" class="bluemoon-btn bluemoon-btn-primary">
                    <i class="fa-solid fa-save"></i> Сохранить
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
 * Open prompt editor for a specific trait
 */
export function openPromptEditor(trait, groupId) {
    const modal = document.getElementById('bluemoon-prompt-editor-modal');
    if (!modal) {
        console.warn('[BlueMoon] Prompt editor modal not found');
        return;
    }

    // Set title
    document.getElementById('bluemoon-editor-title').textContent = `Редактирование: ${trait.label}`;

    // Generate content based on trait type
    const content = document.getElementById('bluemoon-editor-content');
    content.innerHTML = '';

    if (trait.type === 'author-based') {
        content.innerHTML = generateAuthorEditorContent(trait);
    } else if (trait.type === 'banlist') {
        content.innerHTML = generateBanlistEditorContent(trait);
    } else {
        content.innerHTML = generateIntensityEditorContent(trait);
    }

    // Setup save button
    document.getElementById('bluemoon-save-prompt').onclick = () => {
        savePromptEdits(trait, groupId);
    };

    // Setup reset button
    document.getElementById('bluemoon-reset-prompt').onclick = () => {
        resetPromptToDefault(trait);
    };

    // Open modal
    modal.classList.add('bluemoon-modal-open');
}

/**
 * Generate editor content for author-based traits
 */
function generateAuthorEditorContent(trait) {
    const settings = trait.settings || {};
    return `
        <div class="bluemoon-editor-form">
            <div class="bluemoon-form-group">
                <label for="editor-author">Имя автора/стиля:</label>
                <input 
                    type="text" 
                    id="editor-author" 
                    value="${settings.author || ''}"
                    placeholder="Введите имя автора"
                    class="bluemoon-input"
                >
            </div>
            <div class="bluemoon-form-group">
                <label for="editor-style">Жанр/стиль:</label>
                <input 
                    type="text" 
                    id="editor-style" 
                    value="${settings.style || ''}"
                    placeholder="Введите стиль (thriller, fantasy и т.д.)"
                    class="bluemoon-input"
                >
            </div>
            <div class="bluemoon-form-group">
                <label for="editor-prompt">Системный промпт:</label>
                <textarea 
                    id="editor-prompt" 
                    class="bluemoon-textarea bluemoon-prompt-editor-textarea"
                    placeholder="{{author}} - имя автора, {{style}} - стиль, {{percentage}} - значение слайдера (0-100)"
                >${trait.promptTemplate || ''}</textarea>
                <small class="bluemoon-help-text">
                    Используйте {{author}}, {{style}}, {{percentage}} для подстановки переменных
                </small>
            </div>
        </div>
    `;
}

/**
 * Generate editor content for intensity traits
 */
function generateIntensityEditorContent(trait) {
    return `
        <div class="bluemoon-editor-form">
            <div class="bluemoon-form-group">
                <label for="editor-prompt">Системный промпт:</label>
                <textarea 
                    id="editor-prompt" 
                    class="bluemoon-textarea bluemoon-prompt-editor-textarea"
                    placeholder="{{percentage}} - значение слайдера (0-100%)"
                >${trait.promptTemplate || ''}</textarea>
                <small class="bluemoon-help-text">
                    Используйте {{percentage}} для подстановки значения слайдера (0-100)
                </small>
            </div>
        </div>
    `;
}

/**
 * Generate editor content for banlist traits
 */
function generateBanlistEditorContent(trait) {
    const settings = trait.settings || {};
    const banlistStr = Array.isArray(settings.banlist) ? settings.banlist.join(', ') : '';
    
    return `
        <div class="bluemoon-editor-form">
            <div class="bluemoon-form-group">
                <label for="editor-banlist">Список запрещённых слов (через запятую):</label>
                <textarea 
                    id="editor-banlist" 
                    class="bluemoon-textarea"
                    placeholder="слово1, слово2, слово3"
                >${banlistStr}</textarea>
            </div>
            <div class="bluemoon-form-group">
                <label for="editor-strength">Сила запрета (%):</label>
                <input 
                    type="range" 
                    id="editor-strength" 
                    min="0" 
                    max="100" 
                    value="${settings.strength || 80}"
                    class="bluemoon-slider"
                >
                <span id="editor-strength-value">${settings.strength || 80}%</span>
            </div>
            <div class="bluemoon-form-group">
                <label for="editor-prompt">Системный промпт:</label>
                <textarea 
                    id="editor-prompt" 
                    class="bluemoon-textarea bluemoon-prompt-editor-textarea"
                    placeholder="{{banlist}} - список слов, {{strength}} - сила запрета"
                >${trait.promptTemplate || ''}</textarea>
            </div>
        </div>
    `;
}

/**
 * Save prompt edits
 */
function savePromptEdits(trait, groupId) {
    console.log('[BlueMoon] Saving prompt edits for:', trait.id);

    const author = document.getElementById('editor-author')?.value;
    const style = document.getElementById('editor-style')?.value;
    const banlist = document.getElementById('editor-banlist')?.value;
    const strength = document.getElementById('editor-strength')?.value;
    const prompt = document.getElementById('editor-prompt')?.value;

    // Update trait
    if (author !== undefined) trait.settings.author = author;
    if (style !== undefined) trait.settings.style = style;
    if (banlist !== undefined) {
        trait.settings.banlist = banlist.split(',').map(w => w.trim()).filter(w => w);
    }
    if (strength !== undefined) trait.settings.strength = parseInt(strength);
    if (prompt) trait.promptTemplate = prompt;

    // Save to localStorage
    const traitGroups = loadTraitGroups();
    const group = traitGroups.find(g => g.id === groupId);
    if (group) {
        const traitToUpdate = group.traits.find(t => t.id === trait.id);
        if (traitToUpdate) {
            Object.assign(traitToUpdate, trait);
            saveTraitGroups(traitGroups);
            console.log('[BlueMoon] Prompt saved successfully');
        }
    }

    // Close modal
    document.getElementById('bluemoon-prompt-editor-modal').classList.remove('bluemoon-modal-open');
}

/**
 * Reset prompt to default
 */
function resetPromptToDefault(trait) {
    if (confirm('Вы уверены? Это восстановит исходный промпт.')) {
        trait.promptTemplate = trait.defaultPromptTemplate;
        
        // Update in localStorage
        const traitGroups = loadTraitGroups();
        const group = traitGroups.find(g => 
            g.traits.find(t => t.id === trait.id)
        );
        
        if (group) {
            const traitToUpdate = group.traits.find(t => t.id === trait.id);
            if (traitToUpdate) {
                traitToUpdate.promptTemplate = trait.defaultPromptTemplate;
                saveTraitGroups(traitGroups);
            }
        }

        console.log('[BlueMoon] Prompt reset to default');
        document.getElementById('bluemoon-prompt-editor-modal').classList.remove('bluemoon-modal-open');
    }
}

export { openPromptEditor };