/**
 * BlueMoon - Data Persistence
 * Handle saving/loading data from localStorage
 */

import { extensionState, saveCharacterData, loadCharacterData } from './state.js';
import { defaultSettings, defaultTraitGroups } from './config.js';

const STORAGE_KEY_SETTINGS = 'bluemoon_settings';
const STORAGE_KEY_TRAITS = 'bluemoon_traits_default';

/**
 * Load all settings from localStorage
 */
export async function loadSettings() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY_SETTINGS);
        if (stored) {
            const settings = JSON.parse(stored);
            Object.assign(extensionState, settings);
            console.log('[BlueMoon] Settings loaded from localStorage');
        } else {
            // First time - save defaults
            await saveSettings();
        }
    } catch (error) {
        console.error('[BlueMoon] Failed to load settings:', error);
    }
}

/**
 * Save all settings to localStorage
 */
export async function saveSettings() {
    try {
        localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(extensionState));
        console.log('[BlueMoon] Settings saved to localStorage');
    } catch (error) {
        console.error('[BlueMoon] Failed to save settings:', error);
    }
}

/**
 * Load default traits (or custom ones if edited)
 */
export function loadTraitGroups() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY_TRAITS);
        if (stored) {
            return JSON.parse(stored);
        }
        return defaultTraitGroups;
    } catch (error) {
        console.error('[BlueMoon] Failed to load trait groups:', error);
        return defaultTraitGroups;
    }
}

/**
 * Save trait groups (when user edits prompts)
 */
export function saveTraitGroups(traitGroups) {
    try {
        localStorage.setItem(STORAGE_KEY_TRAITS, JSON.stringify(traitGroups));
        console.log('[BlueMoon] Trait groups saved');
    } catch (error) {
        console.error('[BlueMoon] Failed to save trait groups:', error);
    }
}

/**
 * Reset to default trait groups
 */
export function resetTraitGroupsToDefaults() {
    localStorage.removeItem(STORAGE_KEY_TRAITS);
    console.log('[BlueMoon] Trait groups reset to defaults');
    return defaultTraitGroups;
}