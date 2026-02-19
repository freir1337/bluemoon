/**
 * BlueMoon - Core Configuration
 * Defines all default settings and trait groups
 */

export const extensionConfig = {
    name: 'bluemoon',
    version: '1.0.0',
    displayName: 'BlueMoon - Character Traits & Relationships',
    description: 'Manage character traits, writing styles, and relationships with dynamic AI updates',
    author: 'freir1337',
    license: 'MIT',
};

/**
 * Default trait groups structure
 */
export const defaultTraitGroups = [
    {
        id: 'world-settings',
        label: 'Настройки мира и стилей',
        icon: '🌍',
        enabled: true,
        traits: [
            {
                id: 'narrative-style',
                label: 'Повествование в стиле {author}',
                icon: '📖',
                type: 'author-based',
                settings: {
                    author: 'Lee Child',
                    style: 'thriller',
                },
                promptTemplate: 'Write narrative passages in the style of {{author}} ({{style}} writer). Apply this style with {{percentage}}% intensity in descriptions.',
                defaultPromptTemplate: 'Write narrative passages in the style of {{author}} ({{style}} writer). Apply this style with {{percentage}}% intensity in descriptions.',
                min: 0,
                max: 100,
                default: 40,
                description: 'Narrative style intensity',
            },
            {
                id: 'plot-development',
                label: 'Развитие сюжета в стиле {author}',
                icon: '📚',
                type: 'author-based',
                settings: {
                    author: 'Robert Ludlum',
                    style: 'espionage-thriller',
                },
                promptTemplate: 'Develop plot points in the style of {{author}}, maintaining {{style}} atmosphere. Use {{percentage}}% of their characteristic plot techniques.',
                defaultPromptTemplate: 'Develop plot points in the style of {{author}}, maintaining {{style}} atmosphere. Use {{percentage}}% of their characteristic plot techniques.',
                min: 0,
                max: 100,
                default: 60,
            },
            {
                id: 'dialogue-style',
                label: 'Написание диалогов в стиле {author}',
                icon: '💬',
                type: 'author-based',
                settings: {
                    author: 'Elmore Leonard',
                    style: 'minimalist',
                },
                promptTemplate: 'Write dialogue in the style of {{author}} with {{percentage}}% adherence to their {{style}} approach. Keep conversations natural and {{percentage}}% authentic.',
                defaultPromptTemplate: 'Write dialogue in the style of {{author}} with {{percentage}}% adherence to their {{style}} approach. Keep conversations natural and {{percentage}}% authentic.',
                min: 0,
                max: 100,
                default: 25,
            },
            {
                id: 'action-realism',
                label: 'Реалистичность действий и последствий',
                icon: '⚔️',
                type: 'intensity',
                promptTemplate: 'Maintain {{percentage}}% realism in character actions and their consequences. Show realistic physical and emotional impacts.',
                defaultPromptTemplate: 'Maintain {{percentage}}% realism in character actions and their consequences. Show realistic physical and emotional impacts.',
                min: 0,
                max: 100,
                default: 70,
            },
            {
                id: 'tension-suspense',
                label: 'Напряжение и саспенс в сценах',
                icon: '😰',
                type: 'intensity',
                promptTemplate: 'Build {{percentage}}% tension and suspense in scenes. Create pacing and atmosphere that keeps readers engaged.',
                defaultPromptTemplate: 'Build {{percentage}}% tension and suspense in scenes. Create pacing and atmosphere that keeps readers engaged.',
                min: 0,
                max: 100,
                default: 56,
            },
            {
                id: 'gore-level',
                label: 'Натуралистичность жестокости',
                icon: '🔴',
                type: 'intensity',
                promptTemplate: 'Depict violence and gore with {{percentage}}% naturalism. Describe physical impacts with appropriate detail level.',
                defaultPromptTemplate: 'Depict violence and gore with {{percentage}}% naturalism. Describe physical impacts with appropriate detail level.',
                min: 0,
                max: 100,
                default: 30,
            },
            {
                id: 'event-pacing',
                label: 'Темп развития событий',
                icon: '⏱️',
                type: 'intensity',
                promptTemplate: 'Set event pacing to {{percentage}}% speed. {{percentage}}% slower = contemplative, {{percentage}}% faster = action-packed.',
                defaultPromptTemplate: 'Set event pacing to {{percentage}}% speed. {{percentage}}% slower = contemplative, {{percentage}}% faster = action-packed.',
                min: 0,
                max: 100,
                default: 18,
            },
        ],
    },
    {
        id: 'sensations-language',
        label: 'Физические ощущения и язык',
        icon: '🎭',
        enabled: true,
        traits: [
            {
                id: 'detailed-sensations',
                label: 'Подробные описания физических ощущений',
                icon: '👁️',
                type: 'intensity',
                promptTemplate: 'Include detailed descriptions of physical sensations (touch, temperature, texture, pain, pleasure, taste, smell). Use {{percentage}}% sensory depth.',
                defaultPromptTemplate: 'Include detailed descriptions of physical sensations (touch, temperature, texture, pain, pleasure, taste, smell). Use {{percentage}}% sensory depth.',
                min: 0,
                max: 100,
                default: 76,
            },
            {
                id: 'word-banlist',
                label: 'Банлист слов',
                icon: '🚫',
                type: 'banlist',
                settings: {
                    banlist: [],
                    strength: 80, // 0-100, how strictly to enforce
                },
                promptTemplate: 'Avoid using these words: {{banlist}}. Enforce this restriction with {{strength}}% strictness.',
                defaultPromptTemplate: 'Avoid using these words: {{banlist}}. Enforce this restriction with {{strength}}% strictness.',
                min: 0,
                max: 100,
                default: 0,
                description: 'Banlist strength (0% = gentle suggestion, 100% = strict prohibition)',
            },
            {
                id: 'profanity-level',
                label: 'Мат в диалогах',
                icon: '🗣️',
                type: 'intensity',
                promptTemplate: 'Include profanity in dialogue at {{percentage}}% frequency. (0% = none, 100% = frequent)',
                defaultPromptTemplate: 'Include profanity in dialogue at {{percentage}}% frequency. (0% = none, 100% = frequent)',
                min: 0,
                max: 100,
                default: 43,
            },
        ],
    },
];

/**
 * Relationship types with their properties
 */
export const relationshipTypes = [
    {
        id: 'enemies',
        label: 'Враги',
        emoji: '⚔️',
        color: '#e74c3c',
        promptTemplate: 'These characters are mortal enemies. Their interactions should reflect deep hostility, conflict, and potential danger. {{modifier}}',
        modifiers: { negative: -10, positive: -5 },
    },
    {
        id: 'friends',
        label: 'Друзья',
        emoji: '👫',
        color: '#2ecc71',
        promptTemplate: 'These characters are close friends. They support each other, show care, and have comfortable rapport. {{modifier}}',
        modifiers: { negative: -3, positive: 8 },
    },
    {
        id: 'stranger',
        label: 'Незнакомец',
        emoji: '🚶',
        color: '#95a5a6',
        promptTemplate: 'These characters are strangers to each other. Interactions should be formal, cautious, and neutral. {{modifier}}',
        modifiers: { negative: 2, positive: 2 },
    },
    {
        id: 'ally',
        label: 'Союзник',
        emoji: '🤝',
        color: '#3498db',
        promptTemplate: 'These characters are allies with shared goals. They cooperate strategically while maintaining some distance. {{modifier}}',
        modifiers: { negative: -2, positive: 5 },
    },
    {
        id: 'rival',
        label: 'Конкурент',
        emoji: '🏆',
        color: '#f39c12',
        promptTemplate: 'These characters are rivals competing for similar goals. Their interactions are competitive but not necessarily hostile. {{modifier}}',
        modifiers: { negative: 3, positive: 3 },
    },
    {
        id: 'love-interest',
        label: 'Любовь',
        emoji: '💕',
        color: '#e91e63',
        promptTemplate: 'These characters have romantic feelings for each other. Their interactions should reflect attraction, affection, and emotional connection. {{modifier}}',
        modifiers: { negative: -5, positive: 10 },
    },
    {
        id: 'mentor',
        label: 'Наставник',
        emoji: '👨‍🏫',
        color: '#9b59b6',
        promptTemplate: 'One character is a mentor to the other. Interactions should show guidance, knowledge transfer, and growth. {{modifier}}',
        modifiers: { negative: -4, positive: 6 },
    },
    {
        id: 'student',
        label: 'Ученик',
        emoji: '👨‍🎓',
        color: '#16a085',
        promptTemplate: 'One character looks up to the other as a teacher/mentor. Show respect, learning, and admiration. {{modifier}}',
        modifiers: { negative: -2, positive: 5 },
    },
    {
        id: 'family',
        label: 'Родственник',
        emoji: '👨‍👩‍👧',
        color: '#c0392b',
        promptTemplate: 'These characters are family members. Family bonds should influence their interactions with {{percentage}}% impact, even in conflict. {{modifier}}',
        modifiers: { negative: -6, positive: 7 },
    },
    {
        id: 'neutral',
        label: 'Нейтрально',
        emoji: '😐',
        color: '#7f8c8d',
        promptTemplate: 'These characters have no strong feelings toward each other. Interactions are cordial but distant. {{modifier}}',
        modifiers: { negative: 1, positive: 1 },
    },
    {
        id: 'betrayed',
        label: 'Предатель',
        emoji: '💔',
        color: '#34495e',
        promptTemplate: 'One character has betrayed the other. This trauma should deeply affect their relationship and trust. {{modifier}}',
        modifiers: { negative: -15, positive: 2 },
    },
    {
        id: 'secret-admirer',
        label: 'Тайный поклонник',
        emoji: '😳',
        color: '#d35400',
        promptTemplate: 'One character secretly admires/loves the other but hides it. Show hidden feelings and occasional slips. {{modifier}}',
        modifiers: { negative: 0, positive: 3 },
    },
];

/**
 * Default settings
 */
export const defaultSettings = {
    enabled: true,
    panelPosition: 'right', // 'left' or 'right'
    theme: 'default',
    showMobileToggle: true,
    autoUpdateRelationships: true,
    relationshipUpdateStrength: 50, // 0-100, how much relationships change
    showPromptInChat: false, // Show compiled prompt in chat for debugging
    language: 'ru',
};