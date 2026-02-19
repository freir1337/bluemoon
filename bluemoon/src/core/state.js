/**
 * BlueMoon - Extension State Management
 * Centralized state for all extension data
 */

export let extensionState = {
    enabled: true,
    currentCharacterId: null,
    currentCharacterTraits: {},
    currentCharacterRelationships: {},
    allCharacterData: {}, // Indexed by character ID
    panelCollapsed: false,
    lastUpdated: null,
};

/**
 * Update extension state
 * @param {string} key - State key
 * @param {*} value - New value
 */
export function updateState(key, value) {
    extensionState[key] = value;
    console.log(`[BlueMoon] State updated: ${key}`, value);
}

/**
 * Get current character data
 */
export function getCurrentCharacterData() {
    if (!extensionState.currentCharacterId) {
        return null;
    }
    return extensionState.allCharacterData[extensionState.currentCharacterId];
}

/**
 * Save character data
 */
export function saveCharacterData(charId, data) {
    extensionState.allCharacterData[charId] = data;
    localStorage.setItem(`bluemoon_char_${charId}`, JSON.stringify(data));
}

/**
 * Load character data
 */
export function loadCharacterData(charId) {
    const stored = localStorage.getItem(`bluemoon_char_${charId}`);
    if (stored) {
        const data = JSON.parse(stored);
        extensionState.allCharacterData[charId] = data;
        return data;
    }
    return null;
}