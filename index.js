/**
 * BlueMoon - Character Traits & Relationship Manager for SillyTavern
 * Main extension entry point
 */

import { getContext, renderExtensionTemplateAsync } from '../../../extensions.js';
import {
    eventSource,
    event_types,
    saveSettingsDebounced,
    extension_prompt_types,
    setExtensionPrompt,
} from '../../../../script.js';

import { extensionConfig, defaultSettings } from './src/core/config.js';
import { extensionState } from './src/core/state.js';
import { loadSettings, saveSettings } from './src/core/persistence.js';
import { initFloatingPanel } from './src/ui/floatingPanel.js';
import { initSliders, renderSliders } from './src/ui/sliders.js';
import { initPromptEditor } from './src/ui/promptEditor.js';
import { initRelationshipUI, displayRelationships } from './src/ui/relationshipUI.js';
import { compilePrompts } from './src/systems/generation/promptCompiler.js';

export const extensionName = 'third-party/bluemoon';

const EXTENSION_NAME = 'bluemoon';
const EXTENSION_PATH = `third-party/${EXTENSION_NAME}`;

/**
 * Bind settings UI events (elements already rendered via settings.html)
 */
function bindSettingsEvents() {
    const enabledToggle = document.getElementById('bluemoon-enabled-toggle');
    if (enabledToggle) {
        enabledToggle.checked = extensionState.enabled !== false;
        enabledToggle.addEventListener('change', (e) => {
            extensionState.enabled = e.target.checked;
            saveSettings();
            if (extensionState.enabled) showPanel(); else hidePanel();
        });
    }

    const positionSelect = document.getElementById('bluemoon-panel-position');
    if (positionSelect) {
        positionSelect.value = extensionState.panelPosition || 'right';
        positionSelect.addEventListener('change', (e) => {
            extensionState.panelPosition = e.target.value;
            applyPanelPosition();
            saveSettings();
        });
    }

    const relStrengthSlider = document.getElementById('bluemoon-rel-update-strength');
    const relStrengthVal = document.getElementById('bluemoon-rel-update-strength-val');
    if (relStrengthSlider) {
        relStrengthSlider.value = extensionState.relationshipUpdateStrength ?? 5;
        if (relStrengthVal) relStrengthVal.textContent = relStrengthSlider.value;
        relStrengthSlider.addEventListener('input', (e) => {
            if (relStrengthVal) relStrengthVal.textContent = e.target.value;
            extensionState.relationshipUpdateStrength = parseInt(e.target.value);
            saveSettings();
        });
    }

    const autoRelToggle = document.getElementById('bluemoon-auto-rel');
    if (autoRelToggle) {
        autoRelToggle.checked = extensionState.autoUpdateRelationships !== false;
        autoRelToggle.addEventListener('change', (e) => {
            extensionState.autoUpdateRelationships = e.target.checked;
            saveSettings();
        });
    }

    const showPromptToggle = document.getElementById('bluemoon-show-prompt');;
    if (showPromptToggle) {
        showPromptToggle.checked = extensionState.showPromptInChat === true;
        showPromptToggle.addEventListener('change', (e) => {
            extensionState.showPromptInChat = e.target.checked;
            saveSettings();
        });
    }

    const openPanelBtn = document.getElementById('bluemoon-open-panel-btn');
    if (openPanelBtn) {
        openPanelBtn.addEventListener('click', () => showPanel());
    }

    const resetBtn = document.getElementById('bluemoon-reset-all-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (confirm('Сбросить ВСЕ настройки BlueMoon? Ползунки, заметки и отношения будут удалены.')) {
                Object.keys(localStorage).filter(k => k.startsWith('bluemoon')).forEach(k => localStorage.removeItem(k));
                location.reload();
            }
        });
    }
}

function showPanel() {
    const isDesktop = window.innerWidth > 1000;
    if (isDesktop) {
        const panel = document.getElementById('bluemoon-panel');
        if (panel) {
            panel.style.display = 'flex';
            panel.classList.remove('bluemoon-collapsed');
        }
    } else {
        const modal = document.getElementById('bluemoon-modal');
        if (modal) modal.classList.add('bluemoon-modal-open');
    }
}

function hidePanel() {
    const panel = document.getElementById('bluemoon-panel');
    if (panel) panel.style.display = 'none';
}

function applyPanelPosition() {
    const panel = document.getElementById('bluemoon-panel');
    if (!panel) return;
    panel.classList.remove('bluemoon-position-left', 'bluemoon-position-right');
    panel.classList.add(`bluemoon-position-${extensionState.panelPosition || 'right'}`);
}

function setupEventListeners() {
    eventSource.on(event_types.CHAT_CHANGED, () => {
        displayRelationships();
        renderSliders();
    });

    eventSource.on(event_types.MESSAGE_SENT, async () => {
        if (!extensionState.enabled) return;
        try {
            const compiledPrompt = await compilePrompts();
            if (compiledPrompt) {
                setExtensionPrompt(
                    'bluemoon-traits',
                    compiledPrompt,
                    extension_prompt_types.IN_CHAT,
                    1,
                    false
                );
            }
        } catch (e) {
            console.error('[BlueMoon] Prompt injection error:', e);
        }
    });
}

jQuery(async () => {
    try {
        console.log('[BlueMoon] Starting initialization...');

        await loadSettings();

        // Load settings.html into ST Extensions menu — это главное для появления в меню
        const settingsHtml = await renderExtensionTemplateAsync(EXTENSION_PATH, 'settings');
        $('#extensions_settings').append(settingsHtml);
        bindSettingsEvents();

        if (!extensionState.enabled) {
            console.log('[BlueMoon] Extension disabled, skipping UI init');
            return;
        }

        // Load floating panel HTML (template.html)
        let templateHtml = '';
        try {
            templateHtml = await renderExtensionTemplateAsync(EXTENSION_PATH, 'template');
        } catch (e) {
            console.warn('[BlueMoon] renderExtensionTemplateAsync failed for template, trying fetch...');
            try {
                const resp = await fetch(`/scripts/extensions/${EXTENSION_PATH}/template.html`);
                if (resp.ok) templateHtml = await resp.text();
            } catch (e2) {
                console.error('[BlueMoon] Failed to load template:', e2);
            }
        }

        if (templateHtml) {
            $('body').append(templateHtml);
        }

        applyPanelPosition();

        await initFloatingPanel();
        await initSliders();
        await initPromptEditor();
        await initRelationshipUI();

        setupEventListeners();

        console.log('[BlueMoon] Initialization complete ✓');
    } catch (error) {
        console.error('[BlueMoon] Critical initialization error:', error);
    }
});

window.BlueMoon = {
    state: extensionState,
    config: extensionConfig,
    compilePrompts,
    saveSettings,
};
