/**
 * BlueMoon - Character Traits & Relationship Manager for SillyTavern
 * Main extension entry point
 */

import { getContext, renderExtensionTemplateAsync } from '../../../extensions.js';
import { eventSource, event_types, chat, saveSettingsDebounced } from '../../../../script.js';

// ============ CORE MODULES ============
import { extensionConfig } from './src/core/config.js';
import { extensionState, updateState } from './src/core/state.js';
import { loadSettings, saveSettings } from './src/core/persistence.js';
import { i18n } from './src/core/i18n.js';

// ============ UI MODULES ============
import { initFloatingPanel } from './src/ui/floatingPanel.js';
import { initSliders } from './src/ui/sliders.js';
import { initPromptEditor } from './src/ui/promptEditor.js';
import { initRelationshipUI } from './src/ui/relationshipUI.js';

// ============ GENERATION MODULES ============
import { initPromptInjection } from './src/systems/generation/promptInjector.js';
import { compilePrompts } from './src/systems/generation/promptCompiler.js';

// ============ CONSTANTS ============
const EXTENSION_NAME = 'bluemoon';
const EXTENSION_PATH = 'third-party/bluemoon';

/**
 * Initialize extension UI
 */
async function initUI() {
    console.log('[BlueMoon] Initializing UI...');
    
    // Initialize i18n
    await i18n.init();
    
    if (!extensionState.enabled) {
        console.log('[BlueMoon] Extension disabled - skipping UI initialization');
        return;
    }

    try {
        // Load HTML template
        const templateHtml = await renderExtensionTemplateAsync(EXTENSION_PATH, 'template');
        $('body').append(templateHtml);

        // Initialize i18n for new elements
        i18n.applyTranslations(document.body);

        // Initialize all UI components
        await initFloatingPanel();
        await initSliders();
        await initPromptEditor();
        await initRelationshipUI();

        // Setup event listeners
        setupEventListeners();

        console.log('[BlueMoon] UI initialization complete');
    } catch (error) {
        console.error('[BlueMoon] UI initialization failed:', error);
    }
}

/**
 * Setup event listeners for SillyTavern integration
 */
function setupEventListeners() {
    // Listen for character changes
    eventSource.on(event_types.CHAT_CHANGED, async () => {
        console.log('[BlueMoon] Chat changed - loading character traits');
        await loadCharacterTraits();
    });

    // Listen for messages
    eventSource.on(event_types.MESSAGE_SENT, async () => {
        console.log('[BlueMoon] Message sent - compiling prompts');
        await compilePrompts();
    });

    // Listen for message received (to update relationships)
    eventSource.on(event_types.MESSAGE_RECEIVED, async () => {
        console.log('[BlueMoon] Message received - updating relationships');
        await updateCharacterRelationships();
    });
}

/**
 * Load character-specific traits
 */
async function loadCharacterTraits() {
    try {
        const context = getContext();
        const currentCharId = context.characterId;

        if (!currentCharId) {
            console.log('[BlueMoon] No character selected');
            return;
        }

        // Load from localStorage (character-specific data)
        const charTraits = localStorage.getItem(`bluemoon_traits_${currentCharId}`);
        if (charTraits) {
            updateState('currentCharacterTraits', JSON.parse(charTraits));
        }

        // Render UI with loaded traits
        renderTraitsUI();
    } catch (error) {
        console.error('[BlueMoon] Failed to load character traits:', error);
    }
}

/**
 * Update character relationships based on story progression
 */
async function updateCharacterRelationships() {
    try {
        const context = getContext();
        const currentCharId = context.characterId;

        if (!currentCharId) return;

        // Get current relationships
        const relationships = JSON.parse(
            localStorage.getItem(`bluemoon_relationships_${currentCharId}`) || '{}'
        );

        // Relationships will be updated dynamically by AI
        // (Implementation in relationshipManager.js)
        
        console.log('[BlueMoon] Relationships updated');
    } catch (error) {
        console.error('[BlueMoon] Failed to update relationships:', error);
    }
}

/**
 * Render traits in UI
 */
function renderTraitsUI() {
    // Implementation will be in rendering modules
    console.log('[BlueMoon] Rendering traits UI');
}

/**
 * Main initialization
 */
jQuery(async () => {
    try {
        console.log('[BlueMoon] Starting initialization...');

        // Load settings
        await loadSettings();

        // Initialize i18n first
        await i18n.init();

        // Initialize UI
        await initUI();

        // Setup event listeners
        setupEventListeners();

        // Initialize prompt injection system
        await initPromptInjection();

        console.log('[BlueMoon] Initialization complete ✓');
    } catch (error) {
        console.error('[BlueMoon] Critical initialization error:', error);
    }
});

// Export for external use
window.BlueMoon = {
    state: extensionState,
    config: extensionConfig,
    loadCharacterTraits,
    updateCharacterRelationships,
    saveSettings,
};