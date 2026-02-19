/**
 * BlueMoon - Prompt Editor
 */

import { loadTraitGroups, saveTraitGroups } from '../core/persistence.js';

export async function initPromptEditor() {
    console.log('[BlueMoon] Initializing prompt editor...');
    createPromptEditorModal();
    console.log('[BlueMoon] Prompt editor initialized');
}

function createPromptEditorModal() {
    if (document.getElementById('bluemoon-prompt-editor-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'bluemoon-prompt-editor-modal';
    modal.className = 'bluemoon-modal';
    modal.innerHTML = `
        <div class="bluemoon-modal-content">
            <div class="bluemoon-modal-header">
                <h2 id="bluemoon-editor-title">Редактирование промпта</h2>
                <button class="bluemoon-modal-close"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="bluemoon-modal-body">
                <div id="bluemoon-editor-content"></div>
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

    modal.querySelector('.bluemoon-modal-close').addEventListener('click', () => {
        modal.classList.remove('bluemoon-modal-open');
    });
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('bluemoon-modal-open');
    });
}

export function openPromptEditor(trait, groupId) {
    const modal = document.getElementById('bluemoon-prompt-editor-modal');
    if (!modal) return;

    document.getElementById('bluemoon-editor-title').textContent = `Редактирование: ${trait.label}`;

    const content = document.getElementById('bluemoon-editor-content');
    if (trait.type === 'author-based') {
        content.innerHTML = generateAuthorEditorContent(trait);
    } else if (trait.type === 'banlist') {
        content.innerHTML = generateBanlistEditorContent(trait);
        // Wire up strength slider
        const strengthSlider = content.querySelector('#editor-strength');
        const strengthVal = content.querySelector('#editor-strength-value');
        if (strengthSlider && strengthVal) {
            strengthSlider.addEventListener('input', (e) => {
                strengthVal.textContent = e.target.value + '%';
            });
        }
    } else {
        content.innerHTML = generateIntensityEditorContent(trait);
    }

    document.getElementById('bluemoon-save-prompt').onclick = () => savePromptEdits(trait, groupId);
    document.getElementById('bluemoon-reset-prompt').onclick = () => resetPromptToDefault(trait);

    modal.classList.add('bluemoon-modal-open');
}

function generateAuthorEditorContent(trait) {
    const s = trait.settings || {};
    return `
        <div class="bluemoon-form-group">
            <label for="editor-author">Имя автора/стиля:</label>
            <input type="text" id="editor-author" value="${s.author || ''}" placeholder="Введите имя автора" class="bluemoon-input" />
        </div>
        <div class="bluemoon-form-group">
            <label for="editor-style">Жанр/стиль:</label>
            <input type="text" id="editor-style" value="${s.style || ''}" placeholder="thriller, fantasy..." class="bluemoon-input" />
        </div>
        <div class="bluemoon-form-group">
            <label for="editor-prompt">Системный промпт:</label>
            <textarea id="editor-prompt" class="bluemoon-textarea" placeholder="{{author}}, {{style}}, {{percentage}}">${trait.promptTemplate || ''}</textarea>
            <small class="bluemoon-help-text">Используйте {{author}}, {{style}}, {{percentage}} для подстановки</small>
        </div>
    `;
}

function generateIntensityEditorContent(trait) {
    return `
        <div class="bluemoon-form-group">
            <label for="editor-prompt">Системный промпт:</label>
            <textarea id="editor-prompt" class="bluemoon-textarea" placeholder="{{percentage}} — значение ползунка (0-100)">${trait.promptTemplate || ''}</textarea>
            <small class="bluemoon-help-text">Используйте {{percentage}} для подстановки значения ползунка (0-100)</small>
        </div>
    `;
}

function generateBanlistEditorContent(trait) {
    const s = trait.settings || {};
    const banlistStr = Array.isArray(s.banlist) ? s.banlist.join(', ') : '';
    return `
        <div class="bluemoon-form-group">
            <label for="editor-banlist">Запрещённые слова (через запятую):</label>
            <textarea id="editor-banlist" class="bluemoon-textarea" placeholder="слово1, слово2, слово3">${banlistStr}</textarea>
        </div>
        <div class="bluemoon-form-group">
            <label>Сила запрета: <span id="editor-strength-value">${s.strength || 80}%</span></label>
            <input type="range" id="editor-strength" min="0" max="100" value="${s.strength || 80}" class="bluemoon-slider" />
        </div>
        <div class="bluemoon-form-group">
            <label for="editor-prompt">Системный промпт:</label>
            <textarea id="editor-prompt" class="bluemoon-textarea" placeholder="{{banlist}}, {{strength}}">${trait.promptTemplate || ''}</textarea>
        </div>
    `;
}

function savePromptEdits(trait, groupId) {
    const author = document.getElementById('editor-author')?.value;
    const style = document.getElementById('editor-style')?.value;
    const banlistEl = document.getElementById('editor-banlist');
    const strengthEl = document.getElementById('editor-strength');
    const promptEl = document.getElementById('editor-prompt');

    if (!trait.settings) trait.settings = {};
    if (author !== undefined) trait.settings.author = author;
    if (style !== undefined) trait.settings.style = style;
    if (banlistEl) trait.settings.banlist = banlistEl.value.split(',').map(w => w.trim()).filter(Boolean);
    if (strengthEl) trait.settings.strength = parseInt(strengthEl.value);
    if (promptEl) trait.promptTemplate = promptEl.value;

    const traitGroups = loadTraitGroups();
    const group = traitGroups.find(g => g.id === groupId);
    if (group) {
        const t = group.traits.find(t => t.id === trait.id);
        if (t) {
            Object.assign(t, trait);
            saveTraitGroups(traitGroups);
        }
    }

    document.getElementById('bluemoon-prompt-editor-modal').classList.remove('bluemoon-modal-open');
    console.log('[BlueMoon] Prompt saved for:', trait.id);
}

function resetPromptToDefault(trait) {
    if (!confirm('Сбросить промпт к исходному значению?')) return;
    trait.promptTemplate = trait.defaultPromptTemplate;

    const traitGroups = loadTraitGroups();
    for (const group of traitGroups) {
        const t = group.traits.find(t => t.id === trait.id);
        if (t) {
            t.promptTemplate = trait.defaultPromptTemplate;
            saveTraitGroups(traitGroups);
            break;
        }
    }

    document.getElementById('bluemoon-prompt-editor-modal').classList.remove('bluemoon-modal-open');
}
