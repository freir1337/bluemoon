/**
 * BlueMoon - Extension State
 */

export let extensionState = {
    enabled: true,
    currentCharacterId: null,
    panelCollapsed: false,
    panelPosition: 'right',
    autoUpdateRelationships: true,
    relationshipUpdateStrength: 5,
    showPromptInChat: false,
};

export function updateState(key, value) {
    extensionState[key] = value;
}
