/**
 * BlueMoon - Data Persistence
 */

import { extensionState } from './state.js';
import { defaultTraitGroups, defaultSettings } from './config.js';

const STORAGE_KEY_SETTINGS = 'bluemoon_settings';
const STORAGE_KEY_TRAITS = 'bluemoon_traits_default';

export async function loadSettings() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY_SETTINGS);
        if (stored) {
            const settings = JSON.parse(stored);
            Object.assign(extensionState, settings);
        } else {
            Object.assign(extensionState, defaultSettings);
            await saveSettings();
        }
    } catch (error) {
        console.error('[BlueMoon] Failed to load settings:', error);
        Object.assign(extensionState, defaultSettings);
    }
}

export async function saveSettings() {
    try {
        const toSave = {
            enabled: extensionState.enabled,
            panelPosition: extensionState.panelPosition,
            autoUpdateRelationships: extensionState.autoUpdateRelationships,
            relationshipUpdateStrength: extensionState.relationshipUpdateStrength,
            showPromptInChat: extensionState.showPromptInChat,
        };
        localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(toSave));
    } catch (error) {
        console.error('[BlueMoon] Failed to save settings:', error);
    }
}

export function loadTraitGroups() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY_TRAITS);
        if (stored) return JSON.parse(stored);
        return JSON.parse(JSON.stringify(defaultTraitGroups)); // deep clone
    } catch (error) {
        console.error('[BlueMoon] Failed to load trait groups:', error);
        return JSON.parse(JSON.stringify(defaultTraitGroups));
    }
}

export function saveTraitGroups(traitGroups) {
    try {
        localStorage.setItem(STORAGE_KEY_TRAITS, JSON.stringify(traitGroups));
    } catch (error) {
        console.error('[BlueMoon] Failed to save trait groups:', error);
    }
}

export function resetTraitGroupsToDefaults() {
    localStorage.removeItem(STORAGE_KEY_TRAITS);
    return JSON.parse(JSON.stringify(defaultTraitGroups));
}
