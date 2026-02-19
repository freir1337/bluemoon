/**
 * BlueMoon - Prompt Compiler
 */

import { getContext } from '../../../../../extensions.js';
import { loadTraitGroups } from '../../core/persistence.js';
import { extensionState } from '../../core/state.js';
import { getRelationshipsPrompt } from '../../ui/relationshipUI.js';

export async function compilePrompts() {
    console.log('[BlueMoon] Compiling prompts...');

    const traitGroups = loadTraitGroups();
    const compiledParts = [];

    // Process traits
    for (const group of traitGroups) {
        if (!group.enabled) continue;
        for (const trait of group.traits) {
            const value = parseInt(localStorage.getItem(`bluemoon_trait_${trait.id}`));
            const percentage = isNaN(value) ? (trait.default ?? 0) : value;
            const compiled = compileTraitPrompt(trait, percentage);
            if (compiled && compiled.trim()) {
                compiledParts.push(compiled);
            }
        }
    }

    // Notes
    const notes = localStorage.getItem('bluemoon_notes');
    if (notes && notes.trim()) {
        compiledParts.push(`[ПОЛЬЗОВАТЕЛЬСКИЕ ЗАМЕТКИ]\n${notes.trim()}`);
    }

    // Relationships
    try {
        const ctx = getContext();
        const charId = ctx?.characterId ?? ctx?.groupId;
        if (charId) {
            const relPrompt = getRelationshipsPrompt(charId);
            if (relPrompt) compiledParts.push(relPrompt);
        }
    } catch (e) {
        console.warn('[BlueMoon] Could not get context for relationships:', e);
    }

    const finalPrompt = compiledParts.join('\n\n');

    if (extensionState.showPromptInChat && finalPrompt) {
        console.log('[BlueMoon] Compiled prompt:\n', finalPrompt);
    }

    return finalPrompt;
}

function compileTraitPrompt(trait, percentage) {
    let prompt = trait.promptTemplate || '';
    if (!prompt) return '';

    prompt = prompt.replace(/\{\{percentage\}\}/g, percentage);

    if (trait.settings) {
        if (trait.settings.author) {
            prompt = prompt.replace(/\{\{author\}\}/g, trait.settings.author);
        }
        if (trait.settings.style) {
            prompt = prompt.replace(/\{\{style\}\}/g, trait.settings.style);
        }
        if (Array.isArray(trait.settings.banlist) && trait.settings.banlist.length > 0) {
            prompt = prompt.replace(/\{\{banlist\}\}/g, trait.settings.banlist.join(', '));
        } else {
            // No banlist - skip this prompt
            if (prompt.includes('{{banlist}}')) return '';
        }
        if (trait.settings.strength !== undefined) {
            prompt = prompt.replace(/\{\{strength\}\}/g, trait.settings.strength);
        }
    }

    return prompt;
}

export { compileTraitPrompt };
