/**
 * BlueMoon - Prompt Compiler
 * Compiles traits and relationships into AI prompts
 */

import { loadTraitGroups } from '../../core/persistence.js';

/**
 * Compile all active traits into a system prompt
 */
export async function compilePrompts() {
    console.log('[BlueMoon] Compiling prompts...');

    const traitGroups = loadTraitGroups();
    const compiledPrompts = [];

    // Process each trait group
    traitGroups.forEach(group => {
        if (!group.enabled) return;

        group.traits.forEach(trait => {
            const value = localStorage.getItem(`bluemoon_trait_${trait.id}`) || trait.default;
            const compiledPrompt = compileTraitPrompt(trait, parseInt(value));
            
            if (compiledPrompt) {
                compiledPrompts.push(compiledPrompt);
            }
        });
    });

    // Add notes
    const notes = localStorage.getItem('bluemoon_notes');
    if (notes) {
        compiledPrompts.push(`[CUSTOM NOTES]\n${notes}`);
    }

    // Add relationships context
    const relContext = compileRelationshipsContext();
    if (relContext) {
        compiledPrompts.push(relContext);
    }

    const finalPrompt = compiledPrompts.join('\n\n');
    console.log('[BlueMoon] Compiled prompt:', finalPrompt);

    return finalPrompt;
}

/**
 * Compile a single trait prompt with variable substitution
 */
function compileTraitPrompt(trait, percentage) {
    let prompt = trait.promptTemplate || '';

    // Replace variables
    prompt = prompt.replace(/{{percentage}}/g, percentage);

    if (trait.settings) {
        if (trait.settings.author) {
            prompt = prompt.replace(/{{author}}/g, trait.settings.author);
        }
        if (trait.settings.style) {
            prompt = prompt.replace(/{{style}}/g, trait.settings.style);
        }
        if (trait.settings.banlist && Array.isArray(trait.settings.banlist)) {
            const banlistStr = trait.settings.banlist.join(', ');
            prompt = prompt.replace(/{{banlist}}/g, banlistStr);
        }
        if (trait.settings.strength !== undefined) {
            prompt = prompt.replace(/{{strength}}/g, trait.settings.strength);
        }
    }

    return prompt;
}

/**
 * Compile relationships into context
 */
function compileRelationshipsContext() {
    const charId = getContext().characterId;
    if (!charId) return null;

    const relationships = JSON.parse(
        localStorage.getItem(`bluemoon_relationships_${charId}`) || '{}'
    );

    if (Object.keys(relationships).length === 0) {
        return null;
    }

    const relContextLines = [];
    relContextLines.push('[CHARACTER RELATIONSHIPS]');

    Object.entries(relationships).forEach(([otherCharId, relData]) => {
        const relType = relationshipTypes.find(t => t.id === relData.type);
        relContextLines.push(
            `- With "${getCharacterName(otherCharId)}": ${relType?.label} (${relData.percentage}%)`
        );
        
        if (relData.notes) {
            relContextLines.push(`  Notes: ${relData.notes}`);
        }
        if (relData.customPrompt) {
            relContextLines.push(`  Instructions: ${relData.customPrompt}`);
        }
    });

    return relContextLines.join('\n');
}

export { compileTraitPrompt, compileRelationshipsContext };