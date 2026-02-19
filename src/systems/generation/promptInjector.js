/**
 * BlueMoon - Prompt Injector
 * Injects compiled prompts into SillyTavern's context
 */

import { compilePrompts } from './promptCompiler.js';
import { setExtensionPrompt, extension_prompt_types } from '../../../extensions.js';
import { eventSource } from '../../../../script.js';

let injectionActive = false;

/**
 * Initialize prompt injection system
 */
export async function initPromptInjection() {
    console.log('[BlueMoon] Initializing prompt injection...');

    // Hook into message generation
    if (typeof eventSource !== 'undefined') {
        eventSource.on('message_sent', async () => {
            await injectPromptsBeforeGeneration();
        });
    }

    injectionActive = true;
    console.log('[BlueMoon] Prompt injection active');
}

/**
 * Inject prompts before AI generation
 */
async function injectPromptsBeforeGeneration() {
    try {
        const compiledPrompt = await compilePrompts();
        
        if (!compiledPrompt) {
            console.log('[BlueMoon] No prompts to inject');
            return;
        }

        // Inject into SillyTavern's extension system
        if (typeof setExtensionPrompt !== 'undefined') {
            setExtensionPrompt(
                'bluemoon-traits',
                compiledPrompt,
                extension_prompt_types.IN_CHAT, // or AFTER_CONTEXT depending on ST version
                1, // Priority
                false
            );
            console.log('[BlueMoon] Prompts injected successfully');
        }
    } catch (error) {
        console.error('[BlueMoon] Prompt injection failed:', error);
    }
}

export { injectPromptsBeforeGeneration, injectionActive };