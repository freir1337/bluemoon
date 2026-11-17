const MODULE_NAME = 'bluemoon_v2';
const PROMPT_KEY = 'bluemoon_master_prompt';

const EXTENSION_PROMPT_TYPES = {
    NONE: -1,
    IN_PROMPT: 0,
    IN_CHAT: 1,
    BEFORE_PROMPT: 2,
};

const EXTENSION_PROMPT_ROLES = {
    SYSTEM: 0,
    USER: 1,
    ASSISTANT: 2,
};

/**
 * Built-in color themes for BlueMoon UI.
 */
const COLOR_THEMES = {
    indigo: {
        label: '🌙 Синяя Луна',
        accent: '#6366f1',
        accent2: '#a855f7',
        sheet: '#171a26',
        card: 'rgba(26, 30, 44, 0.94)',
        elevated: 'rgba(38, 43, 62, 0.96)',
    },
    rose: {
        label: '🌸 Розовый Кварц',
        accent: '#ec4899',
        accent2: '#f43f5e',
        sheet: '#221520',
        card: 'rgba(40, 24, 36, 0.94)',
        elevated: 'rgba(56, 33, 50, 0.96)',
    },
    emerald: {
        label: '🌿 Изумрудный Лес',
        accent: '#10b981',
        accent2: '#0d9488',
        sheet: '#13201c',
        card: 'rgba(20, 36, 31, 0.94)',
        elevated: 'rgba(29, 51, 44, 0.96)',
    },
    crimson: {
        label: '🩸 Кровавый Закат',
        accent: '#ef4444',
        accent2: '#b91c1c',
        sheet: '#211416',
        card: 'rgba(38, 22, 25, 0.94)',
        elevated: 'rgba(54, 30, 34, 0.96)',
    },
    amber: {
        label: '✨ Золото и Янтарь',
        accent: '#f59e0b',
        accent2: '#ea580c',
        sheet: '#211c14',
        card: 'rgba(38, 32, 22, 0.94)',
        elevated: 'rgba(54, 45, 31, 0.96)',
    },
    violet: {
        label: '🔮 Аметистовая Ночь',
        accent: '#8b5cf6',
        accent2: '#6366f1',
        sheet: '#1a1528',
        card: 'rgba(30, 24, 46, 0.94)',
        elevated: 'rgba(44, 35, 66, 0.96)',
    },
};

/**
 * Rich relationship roles with dynamic date labels tailored to each role type.
 */
const RELATIONSHIP_ROLES = [
    {
        id: 'dating',
        label: 'Пара (Встречаются)',
        emoji: '💑',
        color: '#ec4899',
        date1Label: 'Дата начала отношений (начали встречаться)',
        date2Label: 'Важная годовщина / событие пары',
        endDateLabel: 'Дата расставания (если расстались)',
        promptDesc: 'Romantic partners (dating)',
    },
    {
        id: 'engaged',
        label: 'Помолвлены (Жених и Невеста)',
        emoji: '💍',
        color: '#f472b6',
        date1Label: 'Дата начала отношений',
        date2Label: 'Дата помолвки',
        endDateLabel: 'Дата разрыва (если расстались)',
        promptDesc: 'Engaged romantic partners',
    },
    {
        id: 'married',
        label: 'Женаты / В браке (Супруги)',
        emoji: '💒',
        color: '#e11d48',
        date1Label: 'Дата начала отношений',
        date2Label: 'Дата свадьбы / росписи',
        endDateLabel: 'Дата развода / расставания (если разошлись)',
        promptDesc: 'Married spouses',
    },
    {
        id: 'ex_partners',
        label: 'Бывшие (Расстались / В разводе)',
        emoji: '💔',
        color: '#64748b',
        date1Label: 'Когда начали встречаться / поженились',
        date2Label: 'Памятная дата прошлого',
        endDateLabel: 'Дата расставания / развода',
        promptDesc: 'Ex-partners (broken up / divorced)',
    },
    {
        id: 'crush',
        label: 'Влюблённость / Тайная симпатия',
        emoji: '💕',
        color: '#fb7185',
        date1Label: 'Дата знакомства / первой искры',
        date2Label: 'Дата важного сближения',
        endDateLabel: 'Дата охлаждения чувств (если прошло)',
        promptDesc: 'Romantic crush / mutual attraction',
    },
    {
        id: 'complicated',
        label: 'Всё сложно / Тайная связь',
        emoji: '🔥',
        color: '#f97316',
        date1Label: 'Дата начала связи',
        date2Label: 'Дата переломного момента',
        endDateLabel: 'Дата прекращения связи',
        promptDesc: 'Complicated / secret entanglement',
    },
    {
        id: 'parent_child',
        label: 'Родитель и Ребёнок',
        emoji: '👨‍👧',
        color: '#38bdf8',
        date1Label: 'Дата рождения ребёнка',
        date2Label: 'Важная семейная дата (усыновление / событие)',
        endDateLabel: 'Дата сепарации / разлуки (необязательно)',
        promptDesc: 'Parent and Child family bond',
    },
    {
        id: 'siblings',
        label: 'Брат / Сестра',
        emoji: '👫',
        color: '#60a5fa',
        date1Label: 'Дата рождения / с какого времени вместе',
        date2Label: 'Важная общая дата',
        endDateLabel: 'Дата разрыва общения (если в ссоре)',
        promptDesc: 'Siblings (brother/sister)',
    },
    {
        id: 'relatives',
        label: 'Родственники / Семья',
        emoji: '🏡',
        color: '#818cf8',
        date1Label: 'Памятная семейная дата / День рождения',
        date2Label: 'Важное семейное событие',
        endDateLabel: 'Дата прекращения общения (необязательно)',
        promptDesc: 'Family relatives',
    },
    {
        id: 'best_friends',
        label: 'Лучшие друзья',
        emoji: '🌟',
        color: '#10b981',
        date1Label: 'Дата начала дружбы / знакомства',
        date2Label: 'Дата важного совместного события',
        endDateLabel: 'Дата конца дружбы (если поссорились)',
        promptDesc: 'Best friends',
    },
    {
        id: 'friends',
        label: 'Друзья / Приятели',
        emoji: '🤝',
        color: '#34d399',
        date1Label: 'Дата знакомства / начала дружбы',
        date2Label: 'Памятный день',
        endDateLabel: 'Дата прекращения дружбы (если разошлись)',
        promptDesc: 'Friends',
    },
    {
        id: 'allies',
        label: 'Союзники / Напарники',
        emoji: '🛡️',
        color: '#2dd4bf',
        date1Label: 'Дата заключения союза',
        date2Label: 'Важная совместная операция / дело',
        endDateLabel: 'Дата распада союза',
        promptDesc: 'Allies / partners in action',
    },
    {
        id: 'mentor_student',
        label: 'Наставник и Ученик',
        emoji: '🎓',
        color: '#a78bfa',
        date1Label: 'Дата начала обучения',
        date2Label: 'Дата важного испытания / выпуска',
        endDateLabel: 'Дата завершения наставничества',
        promptDesc: 'Mentor and Student',
    },
    {
        id: 'rivals',
        label: 'Соперники / Конкуренты',
        emoji: '⚡',
        color: '#facc15',
        date1Label: 'Дата начала соперничества',
        date2Label: 'Дата главного столкновения',
        endDateLabel: 'Дата перемирия / конца соперничества',
        promptDesc: 'Rivals / competitors',
    },
    {
        id: 'enemies',
        label: 'Враги / Ненависть',
        emoji: '🗡️',
        color: '#ef4444',
        date1Label: 'Дата начала вражды / предательства',
        date2Label: 'Дата крупного конфликта',
        endDateLabel: 'Дата перемирия / окончания вражды',
        promptDesc: 'Sworn enemies',
    },
    {
        id: 'strangers',
        label: 'Знакомые / Нейтрально',
        emoji: '🚶',
        color: '#94a3b8',
        date1Label: 'Дата первой встречи',
        date2Label: 'Примечательная дата',
        endDateLabel: '',
        promptDesc: 'Acquaintances / neutral strangers',
    },
];

const MEMORY_CATEGORIES = [
    { id: 'gift', label: '🎁 Подарок', en: 'Gift' },
    { id: 'milestone', label: '📌 Важное событие', en: 'Important Milestone' },
    { id: 'detail', label: '💬 Деталь / Привычка', en: 'Personal Detail / Habit' },
    { id: 'conflict', label: '⚡ Обида / Ссора', en: 'Conflict / Grievance' },
];

const DEFAULT_STYLE_TRAITS = [
    {
        id: 'narrative_style',
        label: 'Повествование в стиле автора',
        icon: '📖',
        type: 'author',
        author: 'Стивен Кинг',
        genre: 'психологический реализм',
        value: 45,
        enTemplate:
            'Write narrative descriptions inspired by the literary craftsmanship of {{author}} (genre/tone: {{genre}}) at {{value}}% intensity.',
    },
    {
        id: 'dialogue_style',
        label: 'Живость и естественность диалогов',
        icon: '💬',
        type: 'intensity',
        value: 75,
        enTemplate:
            'Maintain {{value}}% natural, subtext-rich, spoken dialogue with realistic pauses, interruptions, and distinct character voice.',
    },
    {
        id: 'action_realism',
        label: 'Реалистичность действий и последствий',
        icon: '⚖️',
        type: 'intensity',
        value: 75,
        enTemplate:
            'Enforce {{value}}% physical, social, and emotional realism in character actions and their consequences.',
    },
    {
        id: 'tension_suspense',
        label: 'Напряжение и эмоциональный накал',
        icon: '🔥',
        type: 'intensity',
        value: 50,
        enTemplate:
            'Maintain {{value}}% dramatic tension, atmosphere, and emotional stakes in the current scene.',
    },
    {
        id: 'event_pacing',
        label: 'Темп развития сюжета',
        icon: '⏱️',
        type: 'intensity',
        value: 50,
        enTemplate:
            'Set story pacing speed to {{value}}% (0% = slow slice-of-life introspection, 50% = balanced progression, 100% = fast-moving plot momentum).',
    },
    {
        id: 'sensory_details',
        label: 'Детализация физических ощущений',
        icon: '👁️',
        type: 'intensity',
        value: 70,
        enTemplate:
            'Include grounded sensory details (temperature, texture, sound, posture, environment) at {{value}}% depth without purple prose.',
    },
    {
        id: 'profanity_level',
        label: 'Резкость / Мат в речи (по характеру)',
        icon: '🗣️',
        type: 'intensity',
        value: 25,
        enTemplate:
            'Allow coarse language or swearing in dialogue at {{value}}% frequency when fitting the character and mood (0% = clean language, 100% = frequent strong language).',
    },
];

const BUILTIN_STYLE_PRESETS = {
    balanced: {
        name: '⚖️ Баланс (По умолчанию)',
        values: {
            narrative_style: 45,
            dialogue_style: 75,
            action_realism: 75,
            tension_suspense: 50,
            event_pacing: 50,
            sensory_details: 70,
            profanity_level: 25,
        },
    },
    slow_slice: {
        name: '☕ Медленный Слайс и Уют',
        values: {
            narrative_style: 40,
            dialogue_style: 85,
            action_realism: 70,
            tension_suspense: 20,
            event_pacing: 22,
            sensory_details: 80,
            profanity_level: 15,
        },
    },
    drama_thriller: {
        name: '⚡ Острый Драматизм и Накал',
        values: {
            narrative_style: 65,
            dialogue_style: 80,
            action_realism: 90,
            tension_suspense: 85,
            event_pacing: 75,
            sensory_details: 75,
            profanity_level: 45,
        },
    },
    deep_sensory: {
        name: '🌹 Глубокая Чувственность',
        values: {
            narrative_style: 55,
            dialogue_style: 80,
            action_realism: 75,
            tension_suspense: 60,
            event_pacing: 35,
            sensory_details: 95,
            profanity_level: 20,
        },
    },
};

const DEFAULT_SETTINGS = {
    enabled: true,
    relModuleEnabled: true,
    autoTrackRel: true,
    styleModuleEnabled: true,
    showFab: true,
    maxDelta: 5,
    apiMode: 'main',
    connectionProfileId: '',
    activeTab: 'relationships', // 'relationships' | 'styles' | 'appearance'
    styleTraits: DEFAULT_STYLE_TRAITS,
    stylePresets: BUILTIN_STYLE_PRESETS,
    activePresetKey: 'balanced',
    notesByChar: {}, // { [charKey]: string } — Individual character notes!
    relationshipsByChar: {}, // { [charKey]: Array<RelationshipRecord> } — Individual character relationships!
    themeId: 'indigo',
    borderRadiusPx: 22,
    customCss: '',
};

let isAnalyzingRelationship = false;

/**
 * Retrieve extension settings merged with defaults.
 * @returns {typeof DEFAULT_SETTINGS}
 */
function getSettings() {
    const context = SillyTavern.getContext();
    if (!context.extensionSettings[MODULE_NAME] || typeof context.extensionSettings[MODULE_NAME] !== 'object') {
        context.extensionSettings[MODULE_NAME] = structuredClone(DEFAULT_SETTINGS);
    }
    const store = context.extensionSettings[MODULE_NAME];
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
        if (store[key] === undefined) {
            store[key] = structuredClone(value);
        }
    }
    if (!Array.isArray(store.styleTraits) || store.styleTraits.length === 0) {
        store.styleTraits = structuredClone(DEFAULT_STYLE_TRAITS);
    }
    if (!store.stylePresets || typeof store.stylePresets !== 'object') {
        store.stylePresets = structuredClone(BUILTIN_STYLE_PRESETS);
    }
    if (!store.relationshipsByChar || typeof store.relationshipsByChar !== 'object') {
        store.relationshipsByChar = {};
    }
    if (!store.notesByChar || typeof store.notesByChar !== 'object') {
        store.notesByChar = {};
    }
    return store;
}

/**
 * Apply the selected color theme, border radius, and user custom CSS to the document.
 */
function applyAppearanceSettings() {
    const settings = getSettings();
    const theme = COLOR_THEMES[settings.themeId] || COLOR_THEMES.indigo;
    const root = document.documentElement;

    root.style.setProperty('--bm-accent', theme.accent);
    root.style.setProperty('--bm-accent-2', theme.accent2);
    root.style.setProperty('--bm-bg-sheet', theme.sheet);
    root.style.setProperty('--bm-bg-card', theme.card);
    root.style.setProperty('--bm-bg-elevated', theme.elevated);

    const radius = Math.max(8, Math.min(32, Number(settings.borderRadiusPx) || 22));
    root.style.setProperty('--bm-radius-xl', `${radius}px`);
    root.style.setProperty('--bm-radius-lg', `${Math.max(6, radius - 6)}px`);

    let styleTag = document.getElementById('bluemoon_custom_css_tag');
    if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = 'bluemoon_custom_css_tag';
        document.head.appendChild(styleTag);
    }
    styleTag.textContent = settings.customCss || '';

    const fab = $('#bm_floating_fab');
    if (fab.length) {
        fab.toggle(Boolean(settings.enabled && settings.showFab));
    }
}

/**
 * Get a unique key for the active character or group chat.
 * Properly handles characterId === 0.
 * @returns {string}
 */
function getActiveCharacterKey() {
    const context = SillyTavern.getContext();
    if (context.groupId !== undefined && context.groupId !== null && context.groupId !== '') {
        return `group_${context.groupId}`;
    }
    if (context.characterId !== undefined && context.characterId !== null && context.characterId !== '') {
        const charObj = context.characters?.[context.characterId];
        if (charObj?.avatar) {
            return `char_${charObj.avatar}`;
        }
        return `char_${context.characterId}`;
    }
    return 'global_default';
}

/**
 * Get display names of the current character and user.
 * @returns {{ charName: string, userName: string }}
 */
function getChatNames() {
    const context = SillyTavern.getContext();
    return {
        charName: context.name2 || 'Персонаж',
        userName: context.name1 || 'Тристис',
    };
}

/**
 * Get per-character relationships array.
 * @returns {Array<any>}
 */
function getCurrentCharRelationships() {
    const settings = getSettings();
    const key = getActiveCharacterKey();
    if (!Array.isArray(settings.relationshipsByChar[key])) {
        settings.relationshipsByChar[key] = [];
    }
    return settings.relationshipsByChar[key];
}

/**
 * Get or set per-character personal notes.
 * @param {string} [newVal]
 * @returns {string}
 */
function currentCharNotes(newVal) {
    const settings = getSettings();
    const key = getActiveCharacterKey();
    if (newVal !== undefined) {
        settings.notesByChar[key] = String(newVal);
    }
    return settings.notesByChar[key] || '';
}

/**
 * Find relationship role metadata by ID.
 * @param {string} roleId
 */
function getRoleMeta(roleId) {
    return RELATIONSHIP_ROLES.find((r) => r.id === roleId) || RELATIONSHIP_ROLES[0];
}

/**
 * Describe satisfaction percentage in English for the LLM prompt.
 * @param {number} pct
 * @returns {string}
 */
function describeSatisfactionLevel(pct) {
    if (pct <= 15) return 'Critical crisis, deep resentment, hostility, or emotional alienation';
    if (pct <= 35) return 'Strained, tense, cold, or dissatisfied with unresolved friction';
    if (pct <= 60) return 'Stable, balanced, everyday dynamic with normal ups and downs';
    if (pct <= 82) return 'Warm, trusting, affectionate, and mutually supportive';
    return 'Deeply harmonious, devoted, emotionally fulfilled, and very close';
}

/**
 * Build the complete English system prompt from active character relationships, dates, gifts, notes, and style sliders.
 * @returns {string}
 */
function buildBlueMoonPrompt() {
    const settings = getSettings();
    if (!settings.enabled) return '';

    const sections = [];
    const { charName } = getChatNames();

    // 1. Per-character Relationship & Timeline Tracker
    if (settings.relModuleEnabled) {
        const rels = getCurrentCharRelationships();
        const charSpecificNotes = currentCharNotes();

        if (rels.length > 0 || charSpecificNotes.trim()) {
            const relLines = [
                `[BLUEMOON CHARACTER & RELATIONSHIP TRACKER FOR ${charName.toUpperCase()}]`,
                'Respect these established relationship statuses, key timeline dates, satisfaction levels, and shared memories in all actions and dialogue:',
            ];

            for (const rel of rels) {
                const role = getRoleMeta(rel.roleId);
                const satisfaction = Number.isFinite(Number(rel.satisfaction)) ? Number(rel.satisfaction) : 50;
                const moodDesc = describeSatisfactionLevel(satisfaction);

                relLines.push(
                    `- Relationship between ${charName} and "${rel.targetName}":`,
                    `  • Role / Status: ${role.promptDesc} (${role.label})${rel.customStatusNote ? ` — ${rel.customStatusNote}` : ''}`,
                    `  • Current Relationship Satisfaction / Warmth: ${satisfaction}% (${moodDesc}). Reflect this exact level of warmth or tension naturally in behavior.`
                );

                if (rel.date1 && rel.date1.trim()) {
                    relLines.push(`  • ${role.date1Label}: ${rel.date1.trim()}`);
                }
                if (rel.date2 && rel.date2.trim()) {
                    relLines.push(`  • ${role.date2Label}: ${rel.date2.trim()}`);
                }
                if (rel.endDate && rel.endDate.trim()) {
                    relLines.push(`  • ${role.endDateLabel || 'End date'}: ${rel.endDate.trim()}`);
                }
                if (rel.generalNotes && rel.generalNotes.trim()) {
                    relLines.push(`  • Relationship History & Context: ${rel.generalNotes.trim()}`);
                }
                if (Array.isArray(rel.memories) && rel.memories.length > 0) {
                    relLines.push('  • Important Shared Memories, Gifts & Details:');
                    for (const mem of rel.memories) {
                        const cat = MEMORY_CATEGORIES.find((c) => c.id === mem.category)?.en || 'Detail';
                        const dateStr = mem.date ? ` (${mem.date})` : '';
                        relLines.push(`    - [${cat}${dateStr}]: ${mem.text}`);
                    }
                }
            }

            if (charSpecificNotes.trim()) {
                relLines.push(`- Personal Character Notes & Instructions for ${charName}: ${charSpecificNotes.trim()}`);
            }

            sections.push(relLines.join('\n'));
        }
    }

    // 2. Global / Preset Style Sliders
    if (settings.styleModuleEnabled) {
        const styleLines = ['[BLUEMOON NARRATIVE & STYLE PARAMETERS]'];
        let hasActiveStyle = false;

        for (const trait of settings.styleTraits) {
            const val = Number(trait.value ?? 50);
            if (val <= 0) continue;
            hasActiveStyle = true;
            let line = trait.enTemplate.replace(/\{\{value\}\}/g, String(val));
            if (trait.type === 'author') {
                line = line
                    .replace(/\{\{author\}\}/g, trait.author || 'classic prose')
                    .replace(/\{\{genre\}\}/g, trait.genre || 'drama');
            }
            styleLines.push(`- ${line}`);
        }

        if (hasActiveStyle) {
            sections.push(styleLines.join('\n'));
        }
    }

    return sections.join('\n\n');
}

/**
 * Sync the compiled prompt with SillyTavern's prompt manager.
 */
function updateInjectedPrompt() {
    try {
        const context = SillyTavern.getContext();
        if (typeof context.setExtensionPrompt !== 'function') return;

        const promptText = buildBlueMoonPrompt();
        context.setExtensionPrompt(
            PROMPT_KEY,
            promptText,
            EXTENSION_PROMPT_TYPES.IN_CHAT,
            1,
            false,
            EXTENSION_PROMPT_ROLES.SYSTEM
        );
    } catch (error) {
        console.error(`[${MODULE_NAME}] Failed to inject prompt:`, error);
    }
}

/**
 * Global generate_interceptor registered in manifest.json.
 */
globalThis.blueMoonInterceptor = async function () {
    updateInjectedPrompt();
};

/**
 * Safe LLM call via SillyTavern's internal ConnectionManagerRequestService or generateRaw.
 * @param {string} systemPrompt
 * @param {string} userPrompt
 * @returns {Promise<string>}
 */
async function executeSafeLlmRequest(systemPrompt, userPrompt) {
    const context = SillyTavern.getContext();
    const settings = getSettings();

    if (
        settings.apiMode === 'profile' &&
        settings.connectionProfileId &&
        context.ConnectionManagerRequestService
    ) {
        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
        ];
        const response = await context.ConnectionManagerRequestService.sendRequest(
            settings.connectionProfileId,
            messages,
            512,
            {
                stream: false,
                extractData: true,
                includePreset: true,
                includeInstruct: true,
            }
        );
        if (typeof response === 'string') return response;
        if (response && typeof response.content === 'string') return response.content;
    }

    return await context.generateRaw({
        prompt: userPrompt,
        systemPrompt: systemPrompt,
        responseLength: 512,
    });
}

/**
 * Automatically evaluate the latest interaction and adjust relationship satisfaction % (and optionally log a new gift/milestone).
 * @param {boolean} [manualTrigger=false]
 */
async function analyzeAndAdjustRelationships(manualTrigger = false) {
    const settings = getSettings();
    if (!settings.enabled || !settings.relModuleEnabled) return;
    if (!manualTrigger && !settings.autoTrackRel) return;
    if (isAnalyzingRelationship) return;

    const rels = getCurrentCharRelationships();
    if (rels.length === 0) {
        if (manualTrigger) {
            toastr.info('Сначала добавьте карточку отношений для этого персонажа', 'BlueMoon');
        }
        return;
    }

    const context = SillyTavern.getContext();
    const chat = context.chat || [];
    if (chat.length === 0) return;

    const recentMessages = chat
        .slice(-4)
        .filter((m) => !m.is_system && m.mes)
        .map((m) => `${m.name}: ${m.mes}`)
        .join('\n\n');

    if (!recentMessages) return;

    isAnalyzingRelationship = true;
    const maxStep = Math.max(1, Math.min(20, Number(settings.maxDelta) || 5));

    try {
        const targetsDesc = rels
            .map(
                (r, idx) =>
                    `${idx}: targetName="${r.targetName}", role="${getRoleMeta(r.roleId).label}", currentSatisfaction=${r.satisfaction}%`
            )
            .join('\n');

        const systemPrompt = [
            'You are an objective relationship satisfaction analyzer for a roleplay story.',
            'Analyze the latest scene and determine how the relationship satisfaction/warmth changed for each listed relationship.',
            `Return ONLY a valid JSON array. Each object must have: {"index": number, "delta": integer between -${maxStep} and +${maxStep}, "reasonRu": "short 4-8 word explanation in Russian", "newMemoryRu": "optional short string in Russian if a concrete gift was given or a major milestone happened, otherwise empty string"}.`,
            'Use positive delta (+1 to +' + maxStep + ') for warmth, affection, help, gifts, reconciliation, or good conversation.',
            'Use negative delta (-1 to -' + maxStep + ') for arguments, insults, coldness, jealousy, or hurt feelings.',
            'Use 0 if the interaction was neutral.',
            'Output strictly raw JSON without markdown fences.',
        ].join('\n');

        const userPrompt = [
            'TRACKED RELATIONSHIPS:',
            targetsDesc,
            '',
            'RECENT SCENE:',
            recentMessages,
            '',
            'JSON ARRAY OUTPUT:',
        ].join('\n');

        const rawResponse = await executeSafeLlmRequest(systemPrompt, userPrompt);
        const jsonMatch = String(rawResponse || '').match(/\[[\s\S]*\]/);
        if (!jsonMatch) return;

        const updates = JSON.parse(jsonMatch[0]);
        if (!Array.isArray(updates)) return;

        let anyUpdated = false;
        for (const item of updates) {
            const rel = rels[Number(item.index)];
            if (!rel) continue;

            const rawDelta = Number(item.delta) || 0;
            const clampedDelta = Math.max(-maxStep, Math.min(maxStep, Math.round(rawDelta)));
            const oldVal = Number(rel.satisfaction ?? 50);
            const newVal = Math.max(0, Math.min(100, oldVal + clampedDelta));

            rel.satisfaction = newVal;
            if (item.reasonRu) {
                const sign = clampedDelta > 0 ? `+${clampedDelta}%` : `${clampedDelta}%`;
                rel.lastReason = `${clampedDelta >= 0 ? '📈' : '📉'} ${sign}: ${String(item.reasonRu).trim()}`;
            }

            if (item.newMemoryRu && String(item.newMemoryRu).trim().length > 3) {
                if (!Array.isArray(rel.memories)) rel.memories = [];
                rel.memories.unshift({
                    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
                    category: 'milestone',
                    date: '',
                    text: String(item.newMemoryRu).trim(),
                });
            }

            if (clampedDelta !== 0 || item.newMemoryRu) {
                anyUpdated = true;
            }
        }

        if (anyUpdated || manualTrigger) {
            context.saveSettingsDebounced();
            updateInjectedPrompt();
            renderHubTabContent();
            if (manualTrigger) {
                toastr.success('Уровень отношений обновлён по событиям чата', 'BlueMoon');
            }
        }
    } catch (error) {
        console.error(`[${MODULE_NAME}] Relationship analysis failed:`, error);
        if (manualTrigger) {
            toastr.error('Не удалось пересчитать отношения через API', 'BlueMoon');
        }
    } finally {
        isAnalyzingRelationship = false;
    }
}

/**
 * Open a sub-modal to create or edit a Relationship Card (role, dynamic dates, satisfaction, gifts/memories).
 * @param {number|null} editIndex
 */
function openRelationshipEditorModal(editIndex = null) {
    const context = SillyTavern.getContext();
    const rels = getCurrentCharRelationships();
    const { userName } = getChatNames();

    const existing =
        editIndex !== null && rels[editIndex]
            ? structuredClone(rels[editIndex])
            : {
                  targetName: userName,
                  roleId: 'dating',
                  customStatusNote: '',
                  satisfaction: 65,
                  date1: '',
                  date2: '',
                  endDate: '',
                  generalNotes: '',
                  memories: [],
                  lastReason: '',
              };

    if (!Array.isArray(existing.memories)) {
        existing.memories = [];
    }

    $('.bm_editor_backdrop').remove();

    const roleOptionsHtml = RELATIONSHIP_ROLES.map(
        (r) => `<option value="${r.id}" ${r.id === existing.roleId ? 'selected' : ''}>${r.emoji} ${r.label}</option>`
    ).join('');

    const categoryOptionsHtml = MEMORY_CATEGORIES.map(
        (c) => `<option value="${c.id}">${c.label}</option>`
    ).join('');

    const currentRoleMeta = getRoleMeta(existing.roleId);

    const editorOverlay = $(`
        <div class="bm_modal_backdrop bm_editor_backdrop" style="z-index: 100001;">
            <div class="bm_modal_sheet">
                <div class="bm_modal_header">
                    <h3 class="bm_modal_header_title">
                        ${editIndex !== null ? '✏️ Настройка отношений' : '💞 Новая связь'}
                    </h3>
                    <button type="button" class="bm_close_pill" id="bm_edit_close_btn">
                        <i class="fa-solid fa-xmark"></i> Закрыть
                    </button>
                </div>
                <div class="bm_modal_body">
                    <div class="bm_card">
                        <div class="bm_field_block" style="margin-top:0;">
                            <label class="bm_field_label">Имя партнёра / человека (по умолчанию ваш юзер)</label>
                            <input type="text" id="bm_rel_target_name" class="bm_input" />
                        </div>

                        <div class="bm_field_block">
                            <label class="bm_field_label">Роль / Статус отношений</label>
                            <select id="bm_rel_role_select" class="bm_select">
                                ${roleOptionsHtml}
                            </select>
                        </div>

                        <div class="bm_field_block">
                            <label class="bm_field_label">Уточнение роли (кто кому кем приходится)</label>
                            <input type="text" id="bm_rel_custom_status" class="bm_input" placeholder="Например: Живут вместе / Отец и дочь / Тайный роман" />
                        </div>

                        <div class="bm_field_block">
                            <label class="bm_field_label">
                                Удовлетворённость / теплота отношений: <span id="bm_rel_sat_label">${existing.satisfaction}%</span>
                            </label>
                            <input type="range" id="bm_rel_sat_range" class="bm_range" min="0" max="100" value="${existing.satisfaction}" />
                        </div>
                    </div>

                    <div class="bm_card">
                        <div class="bm_section_title">📅 Важные даты (любой удобный формат)</div>

                        <div class="bm_field_block" style="margin-top:0;">
                            <label class="bm_field_label" id="bm_lbl_date1">${currentRoleMeta.date1Label}</label>
                            <input type="text" id="bm_rel_date1" class="bm_input" placeholder="Например: 14.02.2026 или Прошлой осенью" />
                        </div>

                        <div class="bm_field_block">
                            <label class="bm_field_label" id="bm_lbl_date2">${currentRoleMeta.date2Label}</label>
                            <input type="text" id="bm_rel_date2" class="bm_input" placeholder="Например: Свадьба 10.08.2027 (необязательно)" />
                        </div>

                        <div class="bm_field_block" id="bm_end_date_wrap" style="${currentRoleMeta.endDateLabel ? '' : 'display:none;'}">
                            <label class="bm_field_label" id="bm_lbl_end_date">${currentRoleMeta.endDateLabel || 'Дата окончания / расставания'}</label>
                            <input type="text" id="bm_rel_end_date" class="bm_input" placeholder="Заполняется только если расстались / помирились" />
                        </div>
                    </div>

                    <div class="bm_card">
                        <div class="bm_section_title">🎁 Подарки, важные события и мелочи</div>
                        <p class="bm_subtext" style="margin-bottom:8px;">
                            Вписывайте сюда подаренные вещи, памятные моменты, обещания или обиды — бот будет помнить о них.
                        </p>

                        <div class="bm_field_block" style="margin-top:0;">
                            <div class="bm_row_inline">
                                <select id="bm_mem_cat" class="bm_select" style="max-width: 44% !important;">
                                    ${categoryOptionsHtml}
                                </select>
                                <input type="text" id="bm_mem_date" class="bm_input" placeholder="Дата (необяз.)" />
                            </div>
                            <div class="bm_row_inline" style="margin-top:6px;">
                                <input type="text" id="bm_mem_text" class="bm_input" placeholder="Например: Подарил серебряный кулон с гравировкой" />
                                <button type="button" id="bm_add_mem_btn" class="bm_icon_btn" title="Добавить запись">
                                    <i class="fa-solid fa-plus"></i>
                                </button>
                            </div>
                        </div>

                        <div id="bm_editor_memories_list" class="bm_memories_list" style="margin-top:10px;"></div>
                    </div>

                    <div class="bm_card">
                        <div class="bm_section_title">📝 Общая предыстория этих отношений</div>
                        <textarea id="bm_rel_general_notes" class="bm_textarea" placeholder="Как познакомились, динамика пары, внутренние шутки..."></textarea>
                    </div>
                </div>

                <div class="bm_modal_footer">
                    ${
                        editIndex !== null
                            ? `<button type="button" class="bm_btn bm_btn_danger" id="bm_rel_delete_btn" style="max-width:120px;">
                                   <i class="fa-solid fa-trash"></i> Удалить
                               </button>`
                            : ''
                    }
                    <button type="button" class="bm_btn bm_btn_primary" id="bm_rel_save_btn">
                        <i class="fa-solid fa-check"></i> Сохранить карточку
                    </button>
                </div>
            </div>
        </div>
    `);

    editorOverlay.find('#bm_rel_target_name').val(existing.targetName);
    editorOverlay.find('#bm_rel_custom_status').val(existing.customStatusNote || '');
    editorOverlay.find('#bm_rel_date1').val(existing.date1 || '');
    editorOverlay.find('#bm_rel_date2').val(existing.date2 || '');
    editorOverlay.find('#bm_rel_end_date').val(existing.endDate || '');
    editorOverlay.find('#bm_rel_general_notes').val(existing.generalNotes || '');

    const renderMemoriesInEditor = () => {
        const listEl = editorOverlay.find('#bm_editor_memories_list');
        listEl.empty();
        if (existing.memories.length === 0) {
            listEl.append('<div class="bm_subtext">Пока нет записей о подарках или событиях.</div>');
            return;
        }
        existing.memories.forEach((m, idx) => {
            const catLabel = MEMORY_CATEGORIES.find((c) => c.id === m.category)?.label || '📌';
            const dateBadge = m.date ? ` <span style="opacity:0.7;">(${m.date})</span>` : '';
            const row = $(`
                <div class="bm_memory_item">
                    <span><b>${catLabel}</b>${dateBadge}: ${$('<div>').text(m.text).html()}</span>
                    <button type="button" class="bm_memory_del" data-idx="${idx}" title="Удалить">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            `);
            listEl.append(row);
        });
    };

    renderMemoriesInEditor();

    editorOverlay.find('#bm_rel_role_select').on('change', function () {
        const meta = getRoleMeta(String($(this).val()));
        editorOverlay.find('#bm_lbl_date1').text(meta.date1Label);
        editorOverlay.find('#bm_lbl_date2').text(meta.date2Label);
        if (meta.endDateLabel) {
            editorOverlay.find('#bm_lbl_end_date').text(meta.endDateLabel);
            editorOverlay.find('#bm_end_date_wrap').show();
        } else {
            editorOverlay.find('#bm_end_date_wrap').hide();
        }
    });

    editorOverlay.find('#bm_rel_sat_range').on('input', function () {
        editorOverlay.find('#bm_rel_sat_label').text(`${$(this).val()}%`);
    });

    editorOverlay.find('#bm_add_mem_btn').on('click', () => {
        const text = String(editorOverlay.find('#bm_mem_text').val() || '').trim();
        if (!text) {
            toastr.warning('Введите текст подарка или события', 'BlueMoon');
            return;
        }
        existing.memories.unshift({
            id: Date.now().toString(36),
            category: String(editorOverlay.find('#bm_mem_cat').val() || 'gift'),
            date: String(editorOverlay.find('#bm_mem_date').val() || '').trim(),
            text,
        });
        editorOverlay.find('#bm_mem_text').val('');
        editorOverlay.find('#bm_mem_date').val('');
        renderMemoriesInEditor();
    });

    editorOverlay.on('click', '.bm_memory_del', function () {
        const idx = Number($(this).attr('data-idx'));
        if (!Number.isNaN(idx)) {
            existing.memories.splice(idx, 1);
            renderMemoriesInEditor();
        }
    });

    const closeEditor = () => editorOverlay.remove();
    editorOverlay.find('#bm_edit_close_btn').on('click', closeEditor);

    editorOverlay.find('#bm_rel_delete_btn').on('click', () => {
        if (editIndex !== null) {
            rels.splice(editIndex, 1);
            context.saveSettingsDebounced();
            updateInjectedPrompt();
            closeEditor();
            renderHubTabContent();
            toastr.info('Карточка отношений удалена', 'BlueMoon');
        }
    });

    editorOverlay.find('#bm_rel_save_btn').on('click', () => {
        const targetName = String(editorOverlay.find('#bm_rel_target_name').val() || '').trim() || userName;
        const updatedCard = {
            ...existing,
            targetName,
            roleId: String(editorOverlay.find('#bm_rel_role_select').val() || 'dating'),
            customStatusNote: String(editorOverlay.find('#bm_rel_custom_status').val() || '').trim(),
            satisfaction: Number(editorOverlay.find('#bm_rel_sat_range').val() ?? 65),
            date1: String(editorOverlay.find('#bm_rel_date1').val() || '').trim(),
            date2: String(editorOverlay.find('#bm_rel_date2').val() || '').trim(),
            endDate: String(editorOverlay.find('#bm_rel_end_date').val() || '').trim(),
            generalNotes: String(editorOverlay.find('#bm_rel_general_notes').val() || '').trim(),
        };

        if (editIndex !== null && rels[editIndex]) {
            rels[editIndex] = updatedCard;
        } else {
            rels.push(updatedCard);
        }

        context.saveSettingsDebounced();
        updateInjectedPrompt();
        closeEditor();
        renderHubTabContent();
        toastr.success('Отношения сохранены', 'BlueMoon');
    });

    $('body').append(editorOverlay);
}

/**
 * Render the active tab inside the main BlueMoon Hub Modal.
 */
function renderHubTabContent() {
    const bodyEl = $('#bm_hub_body');
    if (!bodyEl.length) return;

    const context = SillyTavern.getContext();
    const settings = getSettings();
    const { charName } = getChatNames();

    $('.bm_tab_btn').removeClass('bm_tab_active');
    $(`.bm_tab_btn[data-tab="${settings.activeTab}"]`).addClass('bm_tab_active');

    bodyEl.empty();

    // TAB 1: RELATIONSHIPS & CHARACTER MEMORY (Per-Character)
    if (settings.activeTab === 'relationships') {
        const rels = getCurrentCharRelationships();

        const topControls = $(`
            <div class="bm_card">
                <div class="bm_section_title">
                    <span>💞 Связи персонажа: ${$('<div>').text(charName).html()}</span>
                </div>
                <p class="bm_subtext" style="margin-bottom:10px;">
                    Все карточки отношений, даты, подарки и заметки ниже привязаны индивидуально к <b>${$('<div>').text(charName).html()}</b>.
                </p>
                <div class="bm_row_inline">
                    <button type="button" class="bm_btn bm_btn_primary" id="bm_add_rel_card_btn">
                        <i class="fa-solid fa-plus"></i> Добавить связь
                    </button>
                    <button type="button" class="bm_btn bm_btn_secondary" id="bm_recalc_rel_btn" title="Пересчитать % отношений по последним сообщениям">
                        <i class="fa-solid fa-bolt"></i> Обновить % по сцене
                    </button>
                </div>
            </div>
        `);
        bodyEl.append(topControls);

        if (rels.length === 0) {
            bodyEl.append(`
                <div class="bm_card" style="text-align:center; padding:22px;">
                    <div style="font-size:1.8rem; margin-bottom:6px;">🌙</div>
                    <div class="bm_heading" style="margin-bottom:4px;">Связи ещё не заданы</div>
                    <p class="bm_subtext">Нажмите «+ Добавить связь», чтобы указать роль (пара, женаты, родитель/ребёнок, друзья, враги), памятные даты и подарки.</p>
                </div>
            `);
        } else {
            rels.forEach((rel, idx) => {
                const role = getRoleMeta(rel.roleId);
                const pct = Number(rel.satisfaction ?? 50);

                const chips = [];
                if (rel.date1) chips.push(`<span class="bm_date_chip">📅 ${$('<div>').text(rel.date1).html()}</span>`);
                if (rel.date2) chips.push(`<span class="bm_date_chip">✨ ${$('<div>').text(rel.date2).html()}</span>`);
                if (rel.endDate) chips.push(`<span class="bm_date_chip">💔 ${$('<div>').text(rel.endDate).html()}</span>`);

                const memPreview = Array.isArray(rel.memories)
                    ? rel.memories
                          .slice(0, 4)
                          .map((m) => {
                              const icon = MEMORY_CATEGORIES.find((c) => c.id === m.category)?.label.split(' ')[0] || '📌';
                              return `<div class="bm_memory_item"><span>${icon} ${$('<div>').text(m.text).html()}</span></div>`;
                          })
                          .join('')
                    : '';

                const card = $(`
                    <div class="bm_rel_card">
                        <div class="bm_rel_top">
                            <div class="bm_rel_person">
                                <span class="bm_rel_emoji">${role.emoji}</span>
                                <div class="bm_rel_name_wrap">
                                    <span class="bm_rel_name">${$('<div>').text(rel.targetName).html()}</span>
                                    <span class="bm_rel_role_badge">
                                        ${role.label}${rel.customStatusNote ? ` • ${$('<div>').text(rel.customStatusNote).html()}` : ''}
                                    </span>
                                </div>
                            </div>
                            <button type="button" class="bm_close_pill bm_edit_rel_btn" data-idx="${idx}">
                                <i class="fa-solid fa-pen"></i> Изменить
                            </button>
                        </div>

                        <div class="bm_rel_meter_wrap">
                            <div class="bm_rel_meter_labels">
                                <span>Удовлетворённость / Теплота</span>
                                <b style="color:#fff;">${pct}%</b>
                            </div>
                            <div class="bm_rel_bar_bg">
                                <div class="bm_rel_bar_fill" style="width:${pct}%; background:${role.color};"></div>
                            </div>
                        </div>

                        ${rel.lastReason ? `<div class="bm_last_reason">${$('<div>').text(rel.lastReason).html()}</div>` : ''}
                        ${chips.length > 0 ? `<div class="bm_dates_chips">${chips.join('')}</div>` : ''}
                        ${memPreview ? `<div class="bm_memories_list">${memPreview}</div>` : ''}
                    </div>
                `);
                bodyEl.append(card);
            });
        }

        // Per-character personal notes card
        const notesCard = $(`
            <div class="bm_card">
                <div class="bm_section_title">📝 Личные заметки и факты для ${$('<div>').text(charName).html()}</div>
                <p class="bm_subtext" style="margin-bottom:8px;">
                    Хранятся индивидуально для этого персонажа (привычки, секреты, текущий контекст сцены).
                </p>
                <textarea id="bm_char_personal_notes" class="bm_textarea" placeholder="Например: Боится грозы; работает в ночную смену; обещал свозить Тристис за город..."></textarea>
            </div>
        `);
        notesCard.find('#bm_char_personal_notes').val(currentCharNotes());
        notesCard.find('#bm_char_personal_notes').on('input', function () {
            currentCharNotes($(this).val());
            context.saveSettingsDebounced();
            updateInjectedPrompt();
        });
        bodyEl.append(notesCard);

        bodyEl.find('#bm_add_rel_card_btn').on('click', () => openRelationshipEditorModal(null));
        bodyEl.find('#bm_recalc_rel_btn').on('click', () => analyzeAndAdjustRelationships(true));
        bodyEl.find('.bm_edit_rel_btn').on('click', function () {
            openRelationshipEditorModal(Number($(this).attr('data-idx')));
        });
        return;
    }

    // TAB 2: STYLE SLIDERS & PRESETS (Global + Saveable Presets)
    if (settings.activeTab === 'styles') {
        const presetOptions = Object.entries(settings.stylePresets)
            .map(
                ([key, p]) =>
                    `<option value="${key}" ${key === settings.activePresetKey ? 'selected' : ''}>${$('<div>').text(p.name).html()}</option>`
            )
            .join('');

        const presetCard = $(`
            <div class="bm_card">
                <div class="bm_section_title">💾 Пресеты стиля и темпа (Общие)</div>
                <div class="bm_field_block" style="margin-top:0;">
                    <label class="bm_field_label">Активный пресет ползунков</label>
                    <select id="bm_preset_select" class="bm_select">
                        ${presetOptions}
                    </select>
                </div>
                <div class="bm_row_inline" style="margin-top:8px;">
                    <input type="text" id="bm_new_preset_name" class="bm_input" placeholder="Название нового пресета..." />
                    <button type="button" id="bm_save_preset_btn" class="bm_btn bm_btn_primary" style="max-width:145px;">
                        <i class="fa-solid fa-floppy-disk"></i> Сохранить
                    </button>
                </div>
            </div>
        `);
        bodyEl.append(presetCard);

        const slidersCard = $('<div class="bm_card"><div class="bm_section_title">🎚️ Настройка ползунков стиля</div></div>');

        settings.styleTraits.forEach((trait, idx) => {
            const block = $(`
                <div class="bm_field_block" style="padding:10px; background:var(--bm-bg-elevated); border-radius:var(--bm-radius-lg); margin-top:8px;">
                    <div class="bm_label_with_btn">
                        <span style="font-size:0.86rem; font-weight:600; color:var(--bm-text-main);">
                            ${trait.icon} ${trait.label}
                        </span>
                        <b id="bm_trait_val_${idx}" style="color:var(--bm-accent); font-size:0.86rem;">${trait.value}%</b>
                    </div>
                    <input type="range" class="bm_range bm_trait_slider" data-idx="${idx}" min="0" max="100" value="${trait.value}" />
                    ${
                        trait.type === 'author'
                            ? `<div class="bm_row_inline" style="margin-top:6px;">
                                   <input type="text" class="bm_input bm_trait_author" data-idx="${idx}" placeholder="Автор (напр. Стивен Кинг)" value="${$('<div>').text(trait.author || '').html()}" />
                                   <input type="text" class="bm_input bm_trait_genre" data-idx="${idx}" placeholder="Жанр/тон" value="${$('<div>').text(trait.genre || '').html()}" />
                               </div>`
                            : ''
                    }
                </div>
            `);
            slidersCard.append(block);
        });

        bodyEl.append(slidersCard);

        bodyEl.find('#bm_preset_select').on('change', function () {
            const key = String($(this).val());
            const preset = settings.stylePresets[key];
            if (!preset) return;
            settings.activePresetKey = key;
            settings.styleTraits.forEach((t) => {
                if (preset.values && preset.values[t.id] !== undefined) {
                    t.value = Number(preset.values[t.id]);
                }
            });
            context.saveSettingsDebounced();
            updateInjectedPrompt();
            renderHubTabContent();
            toastr.info(`Применён пресет: ${preset.name}`, 'BlueMoon');
        });

        bodyEl.find('#bm_save_preset_btn').on('click', () => {
            const name = String(bodyEl.find('#bm_new_preset_name').val() || '').trim();
            if (!name) {
                toastr.warning('Введите название для пресета', 'BlueMoon');
                return;
            }
            const key = 'custom_' + Date.now().toString(36);
            const values = {};
            settings.styleTraits.forEach((t) => {
                values[t.id] = Number(t.value);
            });
            settings.stylePresets[key] = { name: `⭐ ${name}`, values };
            settings.activePresetKey = key;
            context.saveSettingsDebounced();
            renderHubTabContent();
            toastr.success(`Пресет «${name}» сохранён`, 'BlueMoon');
        });

        bodyEl.find('.bm_trait_slider').on('input', function () {
            const idx = Number($(this).attr('data-idx'));
            const val = Number($(this).val());
            if (settings.styleTraits[idx]) {
                settings.styleTraits[idx].value = val;
                bodyEl.find(`#bm_trait_val_${idx}`).text(`${val}%`);
                context.saveSettingsDebounced();
                updateInjectedPrompt();
            }
        });

        bodyEl.find('.bm_trait_author').on('input', function () {
            const idx = Number($(this).attr('data-idx'));
            if (settings.styleTraits[idx]) {
                settings.styleTraits[idx].author = String($(this).val());
                context.saveSettingsDebounced();
                updateInjectedPrompt();
            }
        });

        bodyEl.find('.bm_trait_genre').on('input', function () {
            const idx = Number($(this).attr('data-idx'));
            if (settings.styleTraits[idx]) {
                settings.styleTraits[idx].genre = String($(this).val());
                context.saveSettingsDebounced();
                updateInjectedPrompt();
            }
        });

        return;
    }

    // TAB 3: APPEARANCE, THEMES & CUSTOM CSS
    if (settings.activeTab === 'appearance') {
        const swatchesHtml = Object.entries(COLOR_THEMES)
            .map(
                ([id, t]) => `
                <button type="button" class="bm_theme_swatch ${settings.themeId === id ? 'bm_swatch_active' : ''}" data-theme="${id}">
                    <span class="bm_swatch_dot" style="background: linear-gradient(135deg, ${t.accent}, ${t.accent2});"></span>
                    <span>${t.label}</span>
                </button>
            `
            )
            .join('');

        const themeCard = $(`
            <div class="bm_card">
                <div class="bm_section_title">🎨 Готовые цветовые темы</div>
                <div class="bm_theme_grid">${swatchesHtml}</div>

                <div class="bm_field_block" style="margin-top:14px;">
                    <label class="bm_field_label">
                        Скругление углов интерфейса: <span id="bm_radius_val">${settings.borderRadiusPx}px</span>
                    </label>
                    <input type="range" id="bm_radius_slider" class="bm_range" min="8" max="30" value="${settings.borderRadiusPx}" />
                </div>
            </div>

            <div class="bm_card">
                <div class="bm_section_title">💅 Собственный CSS (Custom CSS)</div>
                <p class="bm_subtext" style="margin-bottom:8px;">
                    Здесь можно переопределить любые переменные (<code>--bm-accent</code>, <code>--bm-bg-card</code>) или классы расширения. Применяется мгновенно.
                </p>
                <textarea id="bm_custom_css_box" class="bm_textarea bm_code_textarea" placeholder="/* Пример: */\n.bm_modal_sheet {\n  border: 2px solid #ec4899;\n}"></textarea>
            </div>
        `);

        themeCard.find('#bm_custom_css_box').val(settings.customCss || '');
        bodyEl.append(themeCard);

        bodyEl.find('.bm_theme_swatch').on('click', function () {
            settings.themeId = String($(this).attr('data-theme') || 'indigo');
            context.saveSettingsDebounced();
            applyAppearanceSettings();
            renderHubTabContent();
        });

        bodyEl.find('#bm_radius_slider').on('input', function () {
            settings.borderRadiusPx = Number($(this).val());
            bodyEl.find('#bm_radius_val').text(`${settings.borderRadiusPx}px`);
            context.saveSettingsDebounced();
            applyAppearanceSettings();
        });

        bodyEl.find('#bm_custom_css_box').on('input', function () {
            settings.customCss = String($(this).val() || '');
            context.saveSettingsDebounced();
            applyAppearanceSettings();
        });
    }
}

/**
 * Open the main BlueMoon Hub Modal.
 */
function openBlueMoonHub() {
    const context = SillyTavern.getContext();
    const settings = getSettings();

    $('.bm_hub_backdrop').remove();

    const hubOverlay = $(`
        <div class="bm_modal_backdrop bm_hub_backdrop">
            <div class="bm_modal_sheet">
                <div class="bm_modal_header">
                    <h3 class="bm_modal_header_title">
                        <span>🌙 BlueMoon</span>
                    </h3>
                    <button type="button" class="bm_close_pill" id="bm_hub_close_btn">
                        <i class="fa-solid fa-xmark"></i> Закрыть
                    </button>
                </div>

                <div class="bm_tabs_bar">
                    <button type="button" class="bm_tab_btn" data-tab="relationships">
                        💞 Отношения
                    </button>
                    <button type="button" class="bm_tab_btn" data-tab="styles">
                        🎚️ Пресеты и Стиль
                    </button>
                    <button type="button" class="bm_tab_btn" data-tab="appearance">
                        🎨 Оформление
                    </button>
                </div>

                <div class="bm_modal_body" id="bm_hub_body"></div>
            </div>
        </div>
    `);

    const closeHub = () => hubOverlay.remove();
    hubOverlay.find('#bm_hub_close_btn').on('click', closeHub);
    hubOverlay.on('click', function (e) {
        if (e.target === this) closeHub();
    });

    hubOverlay.find('.bm_tab_btn').on('click', function () {
        settings.activeTab = String($(this).attr('data-tab') || 'relationships');
        context.saveSettingsDebounced();
        renderHubTabContent();
    });

    $('body').append(hubOverlay);
    renderHubTabContent();
}

/**
 * Inject BlueMoon entry into SillyTavern's Magic Wand menu (#extensionsMenu) on the bottom chat bar,
 * plus the optional floating Moon button.
 */
function injectQuickAccessControls() {
    // 1. Magic Wand Menu item (#extensionsMenu)
    if ($('#extensionsMenu').length && !$('#bm_wand_menu_item').length) {
        const wandItem = $(`
            <div id="bm_wand_menu_item" class="list-group-item flex-container flexGap5 interactable" title="Открыть BlueMoon: Отношения, Даты и Пресеты стиля">
                <div class="fa-solid fa-moon extensionsMenuExtensionButton"></div>
                <span>BlueMoon: Отношения и Стиль</span>
            </div>
        `);
        wandItem.on('click', () => {
            $('#extensionsMenu').hide();
            openBlueMoonHub();
        });
        $('#extensionsMenu').append(wandItem);
    }

    // 2. Floating Moon Button (FAB)
    if (!$('#bm_floating_fab').length) {
        const fab = $(`
            <button type="button" id="bm_floating_fab" class="bm_fab_btn" title="Открыть BlueMoon">
                <i class="fa-solid fa-moon"></i>
            </button>
        `);
        fab.on('click', openBlueMoonHub);
        $('body').append(fab);
    }

    applyAppearanceSettings();
}

/**
 * Populate Connection Manager profiles dropdown.
 * @param {JQuery<HTMLSelectElement>} selectEl
 * @param {string} selectedId
 */
function populateConnectionProfilesDropdown(selectEl, selectedId) {
    if (!selectEl || !selectEl.length) return;
    const context = SillyTavern.getContext();
    selectEl.empty();
    selectEl.append('<option value="">-- Выберите профиль подключения --</option>');

    try {
        const profiles =
            context.ConnectionManagerRequestService?.getSupportedProfiles?.() ||
            context.extensionSettings?.connectionManager?.profiles ||
            [];

        for (const profile of profiles) {
            if (!profile || !profile.id) continue;
            const option = $('<option></option>')
                .val(profile.id)
                .text(`${profile.name || profile.id} (${profile.api || 'API'})`);
            if (profile.id === selectedId) {
                option.prop('selected', true);
            }
            selectEl.append(option);
        }
    } catch (error) {
        console.warn(`[${MODULE_NAME}] Connection Manager profiles unavailable:`, error);
    }
}

/**
 * Bind controls inside the Extensions Settings drawer.
 */
function bindSettingsDrawerUI() {
    const context = SillyTavern.getContext();
    const settings = getSettings();

    const bindCheckbox = (selector, key) => {
        const el = $(selector);
        el.prop('checked', Boolean(settings[key]));
        el.off('change.bm').on('change.bm', function () {
            settings[key] = $(this).is(':checked');
            context.saveSettingsDebounced();
            applyAppearanceSettings();
            updateInjectedPrompt();
        });
    };

    bindCheckbox('#bm_enabled', 'enabled');
    bindCheckbox('#bm_rel_module_enabled', 'relModuleEnabled');
    bindCheckbox('#bm_auto_track_rel', 'autoTrackRel');
    bindCheckbox('#bm_style_module_enabled', 'styleModuleEnabled');
    bindCheckbox('#bm_show_fab', 'showFab');

    const deltaSlider = $('#bm_max_delta');
    const deltaVal = $('#bm_max_delta_val');
    deltaSlider.val(settings.maxDelta || 5);
    deltaVal.text(settings.maxDelta || 5);
    deltaSlider.off('input.bm').on('input.bm', function () {
        settings.maxDelta = Number($(this).val());
        deltaVal.text(settings.maxDelta);
        context.saveSettingsDebounced();
    });

    const apiModeSelect = $('#bm_api_mode');
    const profileBlock = $('#bm_profile_block');
    const profileSelect = $('#bm_connection_profile');

    apiModeSelect.val(settings.apiMode || 'main');
    profileBlock.toggle(settings.apiMode === 'profile');
    populateConnectionProfilesDropdown(profileSelect, settings.connectionProfileId);

    apiModeSelect.off('change.bm').on('change.bm', function () {
        settings.apiMode = String($(this).val());
        profileBlock.toggle(settings.apiMode === 'profile');
        if (settings.apiMode === 'profile') {
            populateConnectionProfilesDropdown(profileSelect, settings.connectionProfileId);
        }
        context.saveSettingsDebounced();
    });

    profileSelect.off('change.bm').on('change.bm', function () {
        settings.connectionProfileId = String($(this).val() || '');
        context.saveSettingsDebounced();
    });

    $('#bm_refresh_profiles')
        .off('click.bm')
        .on('click.bm', () => {
            populateConnectionProfilesDropdown(profileSelect, settings.connectionProfileId);
            toastr.info('Список профилей подключения обновлён', 'BlueMoon');
        });

    $('#bm_open_hub_btn').off('click.bm').on('click.bm', openBlueMoonHub);
}

/**
 * Initialize BlueMoon on APP_READY.
 */
async function init() {
    try {
        const context = SillyTavern.getContext();
        getSettings();

        const settingsHtml = await $.get(`/scripts/extensions/third-party/bluemoon/settings.html`).catch(async () => {
            const scripts = document.querySelectorAll('script[type="module"]');
            for (const s of scripts) {
                if (s.src && s.src.toLowerCase().includes('bluemoon')) {
                    const baseUrl = s.src.substring(0, s.src.lastIndexOf('/'));
                    return await $.get(`${baseUrl}/settings.html`);
                }
            }
            throw new Error('Could not locate BlueMoon settings.html');
        });

        $('#extensions_settings2').append(settingsHtml);
        bindSettingsDrawerUI();
        injectQuickAccessControls();
        updateInjectedPrompt();

        const { eventSource, event_types } = context;

        eventSource.on(event_types.CHAT_CHANGED, () => {
            injectQuickAccessControls();
            updateInjectedPrompt();
            if ($('.bm_hub_backdrop').length) {
                renderHubTabContent();
            }
        });

        eventSource.on(event_types.GENERATION_STARTED, () => {
            updateInjectedPrompt();
        });

        eventSource.on(event_types.CHARACTER_MESSAGE_RENDERED, async () => {
            await analyzeAndAdjustRelationships(false);
        });

        console.info(`[${MODULE_NAME}] BlueMoon v2.0 initialized successfully.`);
    } catch (error) {
        console.error(`[${MODULE_NAME}] Initialization failed:`, error);
        toastr.error('Ошибка загрузки BlueMoon', 'Extension Error');
    }
}

jQuery(() => {
    const context = SillyTavern.getContext();
    if (context?.eventSource && context?.event_types?.APP_READY) {
        context.eventSource.on(context.event_types.APP_READY, init);
    } else {
        setTimeout(init, 1000);
    }
});
