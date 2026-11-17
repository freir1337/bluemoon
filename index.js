/**
 * BlueMoon v2.1.2 — Multi-Node Relationship Tracker, Interactive Graph, Custom Sliders & Themes
 * Added: 5 Crush / Attraction modes (Secret One-Sided, Open One-Sided, Unrequited, Secret Mutual, Open Mutual)
 * Author: Тристис
 */

const MODULE_NAME = 'bluemoon_v2';
const EXTENSION_FOLDER_PATH = 'scripts/extensions/third-party/bluemoon';
const PROMPT_KEY = 'bluemoon_v2_context_injection';
const CUSTOM_CSS_ID = 'bm2_user_custom_css_tag';

const NODE_TYPES = {
    bot: { label: 'Бот', color: '#a855f7' },
    persona: { label: 'Персона', color: '#38bdf8' },
    npc: { label: 'NPC', color: '#f59e0b' },
};

const CRUSH_MUTUALITY = {
    secret_one_sided: {
        label: '🤫 Тайно влюблён(а) (скрывает, второй не знает)',
        shortGraph: 'Тайно влюблён(а)',
        bothArrows: false,
        dashed: true,
        promptDesc: (from, to) =>
            `SECRET ONE-SIDED CRUSH: "${from}" is secretly in love / attracted to "${to}", hides these feelings, and has NOT confessed. "${to}" is completely unaware of "${from}"'s feelings.`,
    },
    open_one_sided: {
        label: '💘 Открытая симпатия (в одну сторону)',
        shortGraph: 'Симпатия ➔',
        bothArrows: false,
        dashed: false,
        promptDesc: (from, to) =>
            `ONE-SIDED ATTRACTION: "${from}" openly shows romantic interest/attraction toward "${to}", while "${to}" has not reciprocated yet.`,
    },
    unrequited: {
        label: '💔 Безответно (невзаимно / отказ)',
        shortGraph: 'Безответно ➔',
        bothArrows: false,
        dashed: true,
        promptDesc: (from, to) =>
            `UNREQUITED LOVE: "${from}" has romantic feelings for "${to}", but "${to}" does NOT share or return those romantic feelings.`,
    },
    secret_mutual: {
        label: '🫣 Тайно обоюдно (оба влюблены, но оба скрывают)',
        shortGraph: 'Тайно взаимно ↔',
        bothArrows: true,
        dashed: true,
        promptDesc: (from, to) =>
            `SECRET MUTUAL CRUSH (SLOW-BURN): Both "${from}" and "${to}" secretly have romantic feelings for each other, but both hide it and neither has confessed yet.`,
    },
    open_mutual: {
        label: '💞 Обоюдная симпатия / Взаимный флирт',
        shortGraph: 'Взаимная симпатия ↔',
        bothArrows: true,
        dashed: false,
        promptDesc: (from, to) =>
            `OPEN MUTUAL ATTRACTION: Both "${from}" and "${to}" openly share romantic attraction and flirtation, though they are not officially a couple yet.`,
    },
};

const RELATIONSHIP_ROLES = {
    strangers: {
        label: 'Незнакомцы / Знакомые',
        icon: '👋',
        color: '#94a3b8',
        dashed: false,
        directed: false,
        dates: [{ key: 'metDate', label: 'Когда познакомились' }],
    },
    friends: {
        label: 'Друзья',
        icon: '🤝',
        color: '#2dd4bf',
        dashed: false,
        directed: false,
        dates: [
            { key: 'startDate', label: 'Начало дружбы' },
            { key: 'endDate', label: 'Конец дружбы (если в ссоре)' },
        ],
    },
    best_friends: {
        label: 'Лучшие друзья',
        icon: '🌟',
        color: '#38bdf8',
        dashed: false,
        directed: false,
        dates: [{ key: 'startDate', label: 'С какого момента дружат' }],
    },
    crush: {
        label: 'Влюблённость / Симпатия',
        icon: '💘',
        color: '#ff6b9d',
        dashed: false,
        directed: true,
        hasMutuality: true,
        dates: [
            { key: 'crushStart', label: 'Когда зародилась симпатия' },
            { key: 'confessionDate', label: 'Признание / Важный момент' },
        ],
    },
    enemies: {
        label: 'Враги / Соперники',
        icon: '⚔️',
        color: '#ef4444',
        dashed: false,
        directed: false,
        dates: [
            { key: 'startDate', label: 'Начало вражды' },
            { key: 'endDate', label: 'Перемирие / Конец вражды' },
        ],
    },
    dating: {
        label: 'Пара (Встречаются)',
        icon: '💑',
        color: '#ec4899',
        dashed: false,
        directed: false,
        dates: [
            { key: 'datingStart', label: 'Начали встречаться' },
            { key: 'firstKiss', label: 'Первый поцелуй / свидание' },
        ],
    },
    engaged: {
        label: 'Помолвлены',
        icon: '💍',
        color: '#f472b6',
        dashed: false,
        directed: false,
        dates: [
            { key: 'datingStart', label: 'Начали встречаться' },
            { key: 'engagedDate', label: 'Дата помолвки' },
        ],
    },
    married: {
        label: 'Брак (Супруги)',
        icon: '💒',
        color: '#fbbf24',
        dashed: false,
        directed: false,
        dates: [
            { key: 'datingStart', label: 'Начали встречаться' },
            { key: 'weddingDate', label: 'Дата свадьбы / росписи' },
        ],
    },
    exes: {
        label: 'Бывшие / Брак расторгнут',
        icon: '💔',
        color: '#f97316',
        dashed: true,
        directed: false,
        dates: [
            { key: 'datingStart', label: 'Когда были вместе' },
            { key: 'breakupDate', label: 'Когда расстались / развелись' },
        ],
    },
    parent_child: {
        label: 'Кровные родители → Ребёнок',
        icon: '🩸',
        color: '#f43f5e',
        dashed: false,
        directed: true,
        dates: [{ key: 'childBirthDate', label: 'Дата рождения ребёнка' }],
    },
    adopted_child: {
        label: 'Усыновление / Опека → Ребёнок',
        icon: '🌿',
        color: '#22c55e',
        dashed: false,
        directed: true,
        dates: [{ key: 'adoptedDate', label: 'Дата усыновления / опеки' }],
    },
    godparent: {
        label: 'Крёстные / Наставники',
        icon: '✨',
        color: '#a78bfa',
        dashed: false,
        directed: true,
        dates: [{ key: 'metDate', label: 'С какого момента' }],
    },
    siblings: {
        label: 'Брат / Сестра',
        icon: '🧬',
        color: '#60a5fa',
        dashed: false,
        directed: false,
        dates: [{ key: 'birthInfo', label: 'Памятная семейная дата' }],
    },
};

const MEMORY_CATEGORIES = {
    gift: { icon: '🎁', label: 'Подарок' },
    event: { icon: '📌', label: 'Важное событие' },
    habit: { icon: '💬', label: 'Деталь / Привычка' },
    conflict: { icon: '⚡', label: 'Обида / Ссора' },
};

const BUILTIN_SLIDERS = [
    {
        id: 'author',
        icon: '📖',
        title: 'Повествование в стиле автора и жанры',
        hasAuthorFields: true,
    },
    {
        id: 'dialogue',
        icon: '💬',
        title: 'Живость и естественность диалогов',
    },
    {
        id: 'realism',
        icon: '⚖️',
        title: 'Реалистичность действий и последствий',
    },
    {
        id: 'tension',
        icon: '🔥',
        title: 'Напряжение и эмоциональный накал',
    },
    {
        id: 'pacing',
        icon: '⏱️',
        title: 'Темп развития сюжета',
    },
    {
        id: 'sensory',
        icon: '👁️',
        title: 'Детализация физических ощущений',
    },
    {
        id: 'profanity',
        icon: '🗣️',
        title: 'Резкость / Мат в речи (по характеру)',
    },
];

const DEFAULT_SLIDERS = {
    author: 0,
    authorName: '',
    genres: ['психологический реализм'],
    dialogue: 65,
    realism: 75,
    tension: 50,
    pacing: 50,
    sensory: 70,
    profanity: 25,
    customValues: {},
};

const THEMES = {
    moonlight: {
        label: '🌙 Лунная полночь',
        bg: '#161324',
        card: '#211d35',
        accent: '#7c5cff',
        text: '#f3f0ff',
        muted: '#a59ec4',
    },
    crimson: {
        label: '🍷 Багровый бархат',
        bg: '#1f1016',
        card: '#2d1720',
        accent: '#e11d48',
        text: '#ffe4e6',
        muted: '#fda4af',
    },
    emerald: {
        label: '🌲 Сумрачный лес',
        bg: '#0f1f1c',
        card: '#172e29',
        accent: '#10b981',
        text: '#ecfdf5',
        muted: '#6ee7b7',
    },
    ocean: {
        label: '🌊 Глубокий океан',
        bg: '#0f172a',
        card: '#1e293b',
        accent: '#38bdf8',
        text: '#f0f9ff',
        muted: '#93c5fd',
    },
    amber: {
        label: '🔥 Тёплый янтарь',
        bg: '#1c1510',
        card: '#2b2018',
        accent: '#f59e0b',
        text: '#fef3c7',
        muted: '#fcd34d',
    },
    obsidian: {
        label: '🖤 Чистый обсидиан',
        bg: '#09090b',
        card: '#18181b',
        accent: '#a855f7',
        text: '#fafafa',
        muted: '#a1a1aa',
    },
};

const DEFAULT_SETTINGS = {
    masterEnabled: true,
    relEnabled: true,
    relAutoAnalyze: true,
    isolatePerChat: false,
    styleEnabled: true,
    connectionProfileId: '',
    injectionDepth: 1,
    activeTheme: 'moonlight',
    borderRadius: 18,
    customCss: '',
    sliders: { ...DEFAULT_SLIDERS },
    customSliders: [],
    presets: {
        'Живой реализм (Базовый)': {
            author: 0,
            authorName: '',
            genres: ['повседневность', 'психологический реализм'],
            dialogue: 75,
            realism: 85,
            tension: 45,
            pacing: 50,
            sensory: 75,
            profanity: 30,
            customValues: {},
        },
        'Острый драматизм и накал': {
            author: 60,
            authorName: '',
            genres: ['драма', 'триллер', 'ангст'],
            dialogue: 80,
            realism: 90,
            tension: 85,
            pacing: 60,
            sensory: 80,
            profanity: 55,
            customValues: {},
        },
    },
    activePreset: 'Живой реализм (Базовый)',
    characterData: {},
};

let isAnalyzing = false;

const graphView = {
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    draggingNodeId: null,
    panning: false,
    lastX: 0,
    lastY: 0,
    avatarCache: {},
};

function getSettings() {
    const context = SillyTavern.getContext();
    if (!context.extensionSettings[MODULE_NAME]) {
        context.extensionSettings[MODULE_NAME] = structuredClone(DEFAULT_SETTINGS);
    }
    const s = context.extensionSettings[MODULE_NAME];
    for (const [k, v] of Object.entries(DEFAULT_SETTINGS)) {
        if (s[k] === undefined) {
            s[k] = structuredClone(v);
        }
    }
    if (!s.sliders) s.sliders = structuredClone(DEFAULT_SLIDERS);
    for (const [k, v] of Object.entries(DEFAULT_SLIDERS)) {
        if (s.sliders[k] === undefined) s.sliders[k] = structuredClone(v);
    }
    if (!Array.isArray(s.sliders.genres)) {
        s.sliders.genres = s.sliders.authorGenre ? [s.sliders.authorGenre] : ['психологический реализм'];
    }
    if (!s.sliders.customValues) s.sliders.customValues = {};
    if (!Array.isArray(s.customSliders)) s.customSliders = [];
    if (!s.characterData || typeof s.characterData !== 'object') {
        s.characterData = {};
    }
    return s;
}

function saveSettings() {
    SillyTavern.getContext().saveSettingsDebounced();
}

function escapeHtml(str) {
    return String(str ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function getCurrentCharacterKey() {
    const ctx = SillyTavern.getContext();
    let baseKey = null;

    if (ctx.groupId !== undefined && ctx.groupId !== null && ctx.groupId !== '') {
        baseKey = `group_${ctx.groupId}`;
    } else if (ctx.characterId !== undefined && ctx.characterId !== null && ctx.characterId !== '') {
        const ch = ctx.characters?.[ctx.characterId];
        baseKey = ch?.avatar ? `char_${ch.avatar}` : `char_idx_${ctx.characterId}`;
    }

    if (!baseKey) return null;

    const s = getSettings();
    if (s.isolatePerChat && ctx.chatId) {
        return `${baseKey}__chat_${ctx.chatId}`;
    }
    return baseKey;
}

function getCurrentCharacterName() {
    const ctx = SillyTavern.getContext();
    if (ctx.characterId !== undefined && ctx.characterId !== null && ctx.characters?.[ctx.characterId]) {
        return ctx.characters[ctx.characterId].name || 'Персонаж';
    }
    return ctx.name2 || 'Персонаж';
}

function getCurrentBotAvatarUrl() {
    const ctx = SillyTavern.getContext();
    if (ctx.characterId !== undefined && ctx.characterId !== null && ctx.characters?.[ctx.characterId]) {
        const av = ctx.characters[ctx.characterId].avatar;
        if (av) return `characters/${encodeURIComponent(av)}`;
    }
    return '';
}

function getCurrentUserName() {
    const ctx = SillyTavern.getContext();
    return ctx.name1 || 'Персона';
}

function getCurrentCharData() {
    const s = getSettings();
    const key = getCurrentCharacterKey();
    if (!key) return null;

    if (!s.characterData[key]) {
        s.characterData[key] = {
            notes: '',
            nodes: [],
            relationships: [],
        };
    }

    const data = s.characterData[key];
    if (!Array.isArray(data.nodes)) data.nodes = [];
    if (!Array.isArray(data.relationships)) data.relationships = [];

    const botName = getCurrentCharacterName();
    const userName = getCurrentUserName();

    let botNode = data.nodes.find((n) => n.type === 'bot');
    if (!botNode) {
        botNode = {
            id: 'node_bot',
            name: botName,
            type: 'bot',
            avatar: getCurrentBotAvatarUrl(),
            x: 190,
            y: 190,
        };
        data.nodes.unshift(botNode);
    } else {
        botNode.name = botName;
        if (!botNode.avatar) botNode.avatar = getCurrentBotAvatarUrl();
    }

    let personaNode = data.nodes.find((n) => n.type === 'persona');
    if (!personaNode) {
        personaNode = {
            id: 'node_persona',
            name: userName,
            type: 'persona',
            avatar: '',
            x: 410,
            y: 190,
        };
        data.nodes.push(personaNode);
    }

    for (const rel of data.relationships) {
        if (!rel.fromId || !rel.toId) {
            rel.fromId = botNode.id;
            const targetName = (rel.targetName || userName).trim();
            let targetNode = data.nodes.find(
                (n) => n.name.toLowerCase() === targetName.toLowerCase()
            );
            if (!targetNode) {
                targetNode = {
                    id: 'node_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
                    name: targetName,
                    type: targetName.toLowerCase() === userName.toLowerCase() ? 'persona' : 'npc',
                    avatar: '',
                    x: 300 + (Math.random() * 160 - 80),
                    y: 120 + (Math.random() * 160 - 80),
                };
                data.nodes.push(targetNode);
            }
            rel.toId = targetNode.id;
        }
        if (rel.role === 'crush' && !rel.mutualStatus) {
            rel.mutualStatus = 'secret_one_sided';
        }
    }

    return data;
}

function findNodeName(charData, nodeId) {
    return charData?.nodes?.find((n) => n.id === nodeId)?.name || 'Неизвестно';
}

/**
 * Compile hidden English prompt for the AI
 */
function compilePromptText() {
    const s = getSettings();
    if (!s.masterEnabled) return '';

    const blocks = [];
    const charKey = getCurrentCharacterKey();
    const charData = getCurrentCharData();
    const charName = getCurrentCharacterName();

    if (s.relEnabled && charKey && charData) {
        const relLines = [];

        const npcList = (charData.nodes || []).filter((n) => n.type === 'npc');
        if (npcList.length > 0) {
            relLines.push(
                `Known NPCs in this story universe: ${npcList.map((n) => n.name).join(', ')}.`
            );
        }

        if (charData.relationships.length > 0) {
            for (const rel of charData.relationships) {
                const roleCfg = RELATIONSHIP_ROLES[rel.role] || RELATIONSHIP_ROLES.strangers;
                const fromName = findNodeName(charData, rel.fromId);
                const toName = findNodeName(charData, rel.toId);
                const sat = Number.isFinite(Number(rel.satisfaction)) ? Number(rel.satisfaction) : 50;

                let warmthTone = 'Neutral / moderate warmth';
                if (sat >= 85) warmthTone = 'Deep affection, high trust, strong warmth';
                else if (sat >= 65) warmthTone = 'Warm, supportive, positive connection';
                else if (sat <= 20) warmthTone = 'Hostile, cold, estranged, bitter resentment';
                else if (sat <= 40) warmthTone = 'Tense, guarded, strained relationship';

                let roleDescription = `Role = ${roleCfg.label}`;
                let arrow = roleCfg.directed ? '-->' : '<-->';

                if (rel.role === 'crush') {
                    const mutCfg = CRUSH_MUTUALITY[rel.mutualStatus] || CRUSH_MUTUALITY.secret_one_sided;
                    arrow = mutCfg.bothArrows ? '<-->' : '-->';
                    roleDescription = `${roleCfg.label} [${mutCfg.label}] — ${mutCfg.promptDesc(fromName, toName)}`;
                }

                const dateStrings = [];
                if (rel.dates && typeof rel.dates === 'object') {
                    for (const dDef of roleCfg.dates) {
                        const val = rel.dates[dDef.key];
                        if (val && val.trim()) {
                            dateStrings.push(`${dDef.label}: ${val.trim()}`);
                        }
                    }
                }

                const memStrings = [];
                if (Array.isArray(rel.memories)) {
                    for (const m of rel.memories) {
                        const cat = MEMORY_CATEGORIES[m.category] || MEMORY_CATEGORIES.event;
                        memStrings.push(`[${cat.label}] ${m.text}`);
                    }
                }

                let entry = `- Connection "${fromName}" ${arrow} "${toName}": ${roleDescription} | Relationship Warmth/Satisfaction = ${sat}% (${warmthTone}).`;
                if (dateStrings.length) entry += `\n  Important Dates: ${dateStrings.join('; ')}.`;
                if (memStrings.length) entry += `\n  Shared History, Gifts & Details: ${memStrings.join(' | ')}.`;
                relLines.push(entry);
            }
        }

        if (charData.notes && charData.notes.trim()) {
            relLines.push(`Character & Scene Notes for ${charName}: ${charData.notes.trim()}`);
        }

        if (relLines.length > 0) {
            blocks.push(
                `[BLUEMOON: CHARACTER & NPC RELATIONSHIP NETWORK]\n` +
                `Maintain strict continuity with the following established relationships between ${charName}, ${getCurrentUserName()}, and other NPCs:\n` +
                relLines.join('\n')
            );
        }
    }

    if (s.styleEnabled && s.sliders) {
        const sl = s.sliders;
        const styleLines = [];

        const genres = Array.isArray(sl.genres) ? sl.genres.filter(Boolean) : [];
        if (Number(sl.author) > 0 && (sl.authorName?.trim() || genres.length > 0)) {
            const parts = [];
            if (sl.authorName?.trim()) parts.push(`authorial style of ${sl.authorName.trim()}`);
            if (genres.length > 0) parts.push(`genres: ${genres.join(', ')}`);
            styleLines.push(
                `- Emulate the ${parts.join(' | ')} at ${sl.author}% intensity.`
            );
        } else if (genres.length > 0) {
            styleLines.push(`- Active narrative genres: ${genres.join(', ')}.`);
        }

        if (sl.dialogue >= 70) {
            styleLines.push(`- Dialogue (${sl.dialogue}%): Write natural, lively spoken dialogue with subtext and realistic pauses.`);
        } else if (sl.dialogue <= 30) {
            styleLines.push(`- Dialogue (${sl.dialogue}%): Keep spoken lines brief and restrained; focus on internal thoughts and atmosphere.`);
        }

        if (sl.realism >= 70) {
            styleLines.push(`- Realism (${sl.realism}%): Enforce grounded physical and psychological consequences.`);
        }

        if (sl.tension >= 70) {
            styleLines.push(`- Emotional Tension (${sl.tension}%): Heighten dramatic stakes and underlying conflict.`);
        } else if (sl.tension <= 30) {
            styleLines.push(`- Emotional Tension (${sl.tension}%): Keep the atmosphere calm, cozy, and low-stress.`);
        }

        if (sl.pacing >= 70) {
            styleLines.push(`- Pacing (${sl.pacing}%): Advance events dynamically and introduce active plot developments.`);
        } else if (sl.pacing <= 35) {
            styleLines.push(`- Pacing (${sl.pacing}%): Slow-burn pacing; linger in the current moment and small details.`);
        }

        if (sl.sensory >= 70) {
            styleLines.push(`- Sensory Detail (${sl.sensory}%): Include concrete tactile, auditory, and visual textures without purple prose.`);
        }

        if (sl.profanity >= 65) {
            styleLines.push(`- Speech Grit (${sl.profanity}%): Characters may use coarse language or swearing when fitting their personality.`);
        } else if (sl.profanity <= 15) {
            styleLines.push(`- Speech Grit (${sl.profanity}%): Avoid swearing or vulgar expressions in dialogue.`);
        }

        if (Array.isArray(s.customSliders)) {
            for (const cSlider of s.customSliders) {
                const val = Number(sl.customValues?.[cSlider.id] ?? 50);
                if (val > 0 && cSlider.promptHint?.trim()) {
                    styleLines.push(
                        `- ${cSlider.title} (${val}% intensity): ${cSlider.promptHint.trim()}`
                    );
                }
            }
        }

        if (styleLines.length > 0) {
            blocks.push(`[BLUEMOON: NARRATIVE STYLE & PACING DIRECTIVES]\n` + styleLines.join('\n'));
        }
    }

    return blocks.join('\n\n');
}

function updatePromptInjection() {
    try {
        const ctx = SillyTavern.getContext();
        if (typeof ctx.setExtensionPrompt !== 'function') return;

        const s = getSettings();
        const text = compilePromptText();
        const depth = Number.isFinite(Number(s.injectionDepth)) ? Number(s.injectionDepth) : 1;

        ctx.setExtensionPrompt(PROMPT_KEY, text, 1, depth, false, 0);
    } catch (err) {
        console.error(`[${MODULE_NAME}] updatePromptInjection error:`, err);
    }
}

async function runModelPrompt(systemPrompt, userPrompt, maxTokens = 500) {
    const context = SillyTavern.getContext();
    const settings = getSettings();
    const profileId = (settings.connectionProfileId || '').trim();

    if (profileId && context.ConnectionManagerRequestService?.sendRequest) {
        const res = await context.ConnectionManagerRequestService.sendRequest(
            profileId,
            [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ],
            maxTokens,
            {
                stream: false,
                extractData: true,
                includePreset: true,
                includeInstruct: true,
            }
        );
        return typeof res === 'string' ? res : String(res?.content || '');
    }

    if (typeof context.generateRaw === 'function') {
        const res = await context.generateRaw({
            prompt: userPrompt,
            systemPrompt: systemPrompt,
            quietToLoud: false,
        });
        return typeof res === 'string' ? res : String(res?.content || '');
    }

    throw new Error('API генерации недоступно');
}

async function analyzeRelationshipDelta(manualTrigger = false) {
    if (isAnalyzing) return;
    const s = getSettings();
    if (!s.masterEnabled || !s.relEnabled) return;
    if (!manualTrigger && !s.relAutoAnalyze) return;

    const charData = getCurrentCharData();
    if (!charData || !charData.relationships.length) {
        if (manualTrigger) toastr.info('Сначала добавьте хотя бы одну связь', 'BlueMoon');
        return;
    }

    const ctx = SillyTavern.getContext();
    const chat = ctx.chat || [];
    if (chat.length === 0) return;

    const recentMessages = chat
        .slice(-4)
        .map((m) => `${m.is_user ? getCurrentUserName() : getCurrentCharacterName()}: ${m.mes || ''}`)
        .join('\n\n');

    const currentList = charData.relationships.map((r) => ({
        id: r.id,
        from: findNodeName(charData, r.fromId),
        to: findNodeName(charData, r.toId),
        role: RELATIONSHIP_ROLES[r.role]?.label || r.role,
        mutualStatus: r.role === 'crush' ? (r.mutualStatus || 'secret_one_sided') : undefined,
        satisfaction: r.satisfaction,
    }));

    const sysPrompt = `You are an objective relationship tracker for a roleplay story.
Analyze the latest chat excerpt and determine if the relationship warmth/satisfaction (0 to 100) between the listed character pairs should shift.
Rules:
- Single scene delta must be between -8 and +8 (0 if no meaningful change).
- Return ONLY a valid JSON array: [{"id": "...", "delta": 2, "reason": "Краткая причина на русском (до 6 слов)"}]
- Do not include markdown fences.`;

    const usrPrompt = `Tracked Relationships:\n${JSON.stringify(currentList)}\n\nLatest Chat Excerpt:\n${recentMessages}`;

    isAnalyzing = true;
    try {
        const raw = await runModelPrompt(sysPrompt, usrPrompt, 350);
        const cleaned = raw.replace(/```json|```/gi, '').trim();
        const startIdx = cleaned.indexOf('[');
        const endIdx = cleaned.lastIndexOf(']');
        if (startIdx === -1 || endIdx === -1) return;

        const parsed = JSON.parse(cleaned.slice(startIdx, endIdx + 1));
        if (!Array.isArray(parsed)) return;

        let changedCount = 0;
        for (const item of parsed) {
            const rel = charData.relationships.find((r) => r.id === item.id);
            if (!rel) continue;
            const delta = Math.max(-10, Math.min(10, Number(item.delta) || 0));
            if (delta !== 0 || manualTrigger) {
                rel.satisfaction = Math.max(0, Math.min(100, (Number(rel.satisfaction) || 50) + delta));
                if (item.reason) {
                    const sign = delta > 0 ? `+${delta}%` : `${delta}%`;
                    rel.lastDeltaNote = `${sign}: ${item.reason}`;
                }
                changedCount++;
            }
        }

        if (changedCount > 0) {
            saveSettings();
            updatePromptInjection();
            renderRelationshipsTab();
            drawRelationshipGraph();
            if (manualTrigger) toastr.success('Удовлетворённость в отношениях обновлена', 'BlueMoon');
        }
    } catch (err) {
        console.error(`[${MODULE_NAME}] analyzeRelationshipDelta error:`, err);
        if (manualTrigger) toastr.error('Не удалось проанализировать сцену', 'BlueMoon');
    } finally {
        isAnalyzing = false;
    }
}

/**
 * AI Auto-Builder for the Obsidian Relationship Graph
 */
async function autoBuildGraphWithAI() {
    if (isAnalyzing) return;
    const charData = getCurrentCharData();
    if (!charData) {
        toastr.warning('Сначала откройте чат с персонажем', 'BlueMoon');
        return;
    }

    const ctx = SillyTavern.getContext();
    const charObj = ctx.characters?.[ctx.characterId] || {};
    const charDesc = [charObj.description, charObj.personality, charObj.scenario]
        .filter(Boolean)
        .join('\n')
        .slice(0, 2500);

    const recentChat = (ctx.chat || [])
        .slice(-12)
        .map((m) => `${m.name || (m.is_user ? getCurrentUserName() : getCurrentCharacterName())}: ${m.mes || ''}`)
        .join('\n\n')
        .slice(0, 3500);

    const botName = getCurrentCharacterName();
    const userName = getCurrentUserName();

    const sysPrompt = `You are a relationship graph extractor for a roleplay story.
Read the character description and recent chat messages. Identify all characters (Main Bot "${botName}", User Persona "${userName}", and any mentioned NPCs) and their relationships.
Allowed role keys:
- strangers, friends, best_friends, crush, enemies, dating, engaged, married, exes, parent_child, adopted_child, godparent, siblings.
Notes:
- For parent_child, adopted_child, godparent: "from" MUST be the parent/mentor and "to" MUST be the child.
- For "crush": "from" is the one who has feelings, "to" is the target of affection, and include "mutualStatus" as one of: "secret_one_sided", "open_one_sided", "unrequited", "secret_mutual", "open_mutual".
Return ONLY valid JSON without markdown fences:
{
  "nodes": [
    {"name": "${botName}", "type": "bot"},
    {"name": "${userName}", "type": "persona"},
    {"name": "NPC Name", "type": "npc"}
  ],
  "relationships": [
    {"from": "Name 1", "to": "Name 2", "role": "crush", "mutualStatus": "secret_one_sided", "satisfaction": 65, "note": "Краткая суть связи на русском"}
  ]
}`;

    const usrPrompt = `Main Bot: ${botName}\nUser Persona: ${userName}\n\nCharacter Lore:\n${charDesc}\n\nRecent Chat:\n${recentChat}`;

    isAnalyzing = true;
    toastr.info('ИИ анализирует карточку и чат для построения древа...', 'BlueMoon');

    try {
        const raw = await runModelPrompt(sysPrompt, usrPrompt, 800);
        const cleaned = raw.replace(/```json|```/gi, '').trim();
        const sIdx = cleaned.indexOf('{');
        const eIdx = cleaned.lastIndexOf('}');
        if (sIdx === -1 || eIdx === -1) throw new Error('Некорректный JSON от модели');

        const parsed = JSON.parse(cleaned.slice(sIdx, eIdx + 1));
        const newNodes = Array.isArray(parsed.nodes) ? parsed.nodes : [];
        const newRels = Array.isArray(parsed.relationships) ? parsed.relationships : [];

        const cx = 300;
        const cy = 200;
        const radius = 135;

        newNodes.forEach((n, idx) => {
            const name = (n.name || '').trim();
            if (!name) return;
            const exists = charData.nodes.find((existing) => existing.name.toLowerCase() === name.toLowerCase());
            if (!exists) {
                const angle = (2 * Math.PI * idx) / Math.max(1, newNodes.length);
                charData.nodes.push({
                    id: 'node_' + Date.now() + '_' + idx,
                    name,
                    type: n.type === 'bot' || n.type === 'persona' ? n.type : 'npc',
                    avatar: '',
                    x: Math.round(cx + radius * Math.cos(angle)),
                    y: Math.round(cy + radius * Math.sin(angle)),
                });
            }
        });

        for (const r of newRels) {
            const fromNode = charData.nodes.find((n) => n.name.toLowerCase() === String(r.from || '').trim().toLowerCase());
            const toNode = charData.nodes.find((n) => n.name.toLowerCase() === String(r.to || '').trim().toLowerCase());
            if (!fromNode || !toNode || fromNode.id === toNode.id) continue;

            const role = RELATIONSHIP_ROLES[r.role] ? r.role : 'strangers';
            const mutualStatus =
                role === 'crush' && CRUSH_MUTUALITY[r.mutualStatus]
                    ? r.mutualStatus
                    : 'secret_one_sided';

            const existingRel = charData.relationships.find(
                (er) =>
                    (er.fromId === fromNode.id && er.toId === toNode.id) ||
                    (!RELATIONSHIP_ROLES[role]?.directed && er.fromId === toNode.id && er.toId === fromNode.id)
            );

            if (existingRel) {
                existingRel.role = role;
                if (role === 'crush') existingRel.mutualStatus = mutualStatus;
                if (Number.isFinite(Number(r.satisfaction))) {
                    existingRel.satisfaction = Math.max(0, Math.min(100, Number(r.satisfaction)));
                }
                if (r.note) existingRel.lastDeltaNote = r.note;
            } else {
                charData.relationships.push({
                    id: 'rel_' + Date.now() + '_' + Math.floor(Math.random() * 10000),
                    fromId: fromNode.id,
                    toId: toNode.id,
                    role,
                    mutualStatus: role === 'crush' ? mutualStatus : undefined,
                    satisfaction: Math.max(0, Math.min(100, Number(r.satisfaction) || 55)),
                    dates: {},
                    memories: r.note ? [{ category: 'event', text: r.note }] : [],
                    lastDeltaNote: r.note || '',
                });
            }
        }

        saveSettings();
        updatePromptInjection();
        renderRelationshipsTab();
        drawRelationshipGraph();
        toastr.success('Древо связей успешно построено!', 'BlueMoon');
    } catch (err) {
        console.error(`[${MODULE_NAME}] autoBuildGraphWithAI error:`, err);
        toastr.error('Не удалось автоматически построить древо', 'BlueMoon');
    } finally {
        isAnalyzing = false;
    }
}

function applyVisualTheme() {
    const s = getSettings();
    const theme = THEMES[s.activeTheme] || THEMES.moonlight;
    const root = document.documentElement;

    root.style.setProperty('--bm2-bg', theme.bg);
    root.style.setProperty('--bm2-card', theme.card);
    root.style.setProperty('--bm2-accent', theme.accent);
    root.style.setProperty('--bm2-text', theme.text);
    root.style.setProperty('--bm2-muted', theme.muted);
    root.style.setProperty('--bm2-radius', `${Number(s.borderRadius) || 18}px`);

    let styleTag = document.getElementById(CUSTOM_CSS_ID);
    if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = CUSTOM_CSS_ID;
        document.head.appendChild(styleTag);
    }
    styleTag.textContent = s.customCss || '';
}

function populateConnectionProfiles() {
    const select = document.getElementById('bm2_connection_profile');
    if (!select) return;

    const s = getSettings();
    const currentVal = s.connectionProfileId || '';
    select.innerHTML = '<option value="">Текущее подключение (Main API)</option>';

    try {
        const ctx = SillyTavern.getContext();
        let profiles = [];
        if (typeof ctx.ConnectionManagerRequestService?.getSupportedProfiles === 'function') {
            profiles = ctx.ConnectionManagerRequestService.getSupportedProfiles() || [];
        } else if (Array.isArray(ctx.extensionSettings?.connectionManager?.profiles)) {
            profiles = ctx.extensionSettings.connectionManager.profiles;
        }
        for (const p of profiles) {
            if (!p || !p.id) continue;
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = p.name || p.id;
            if (p.id === currentVal) opt.selected = true;
            select.appendChild(opt);
        }
    } catch (err) {
        console.error(`[${MODULE_NAME}] populateConnectionProfiles error:`, err);
    }
}

function readAndCompressImage(file, maxSize = 160) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = maxSize;
                canvas.height = maxSize;
                const ctx = canvas.getContext('2d');
                const minSide = Math.min(img.width, img.height);
                const sx = (img.width - minSide) / 2;
                const sy = (img.height - minSide) / 2;
                ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, maxSize, maxSize);
                resolve(canvas.toDataURL('image/jpeg', 0.82));
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function buildMainOverlay() {
    if (!document.getElementById('bm2_overlay')) {
        const overlay = document.createElement('div');
        overlay.id = 'bm2_overlay';
        overlay.innerHTML = `
            <div class="bm2_sheet" role="dialog" aria-modal="true">
                <div class="bm2_header">
                    <div class="bm2_header_title">
                        <span>🌙</span>
                        <span>BlueMoon</span>
                    </div>
                    <div class="bm2_header_actions">
                        <button type="button" class="bm2_prompt_btn" id="bm2_preview_prompt_btn" title="Посмотреть, что отправляется ИИ">👁️ Промпт ИИ</button>
                        <button type="button" class="bm2_close_btn" id="bm2_close_modal_btn">✕ Закрыть</button>
                    </div>
                </div>

                <div class="bm2_tabs">
                    <button type="button" class="bm2_tab_btn bm2_active" data-tab="rel">💞 Связи</button>
                    <button type="button" class="bm2_tab_btn" data-tab="graph">🕸️ Древо</button>
                    <button type="button" class="bm2_tab_btn" data-tab="style">🎚️ Стиль</button>
                    <button type="button" class="bm2_tab_btn" data-tab="theme">🎨 Темы</button>
                </div>

                <div class="bm2_body">
                    <div class="bm2_tab_pane bm2_active" id="bm2_pane_rel"></div>
                    <div class="bm2_tab_pane" id="bm2_pane_graph"></div>
                    <div class="bm2_tab_pane" id="bm2_pane_style"></div>
                    <div class="bm2_tab_pane" id="bm2_pane_theme"></div>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeBlueMoonModal();
        });
        document.getElementById('bm2_close_modal_btn').addEventListener('click', closeBlueMoonModal);
        document.getElementById('bm2_preview_prompt_btn').addEventListener('click', openPromptPreviewModal);

        overlay.querySelectorAll('.bm2_tab_btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                overlay.querySelectorAll('.bm2_tab_btn').forEach((b) => b.classList.remove('bm2_active'));
                overlay.querySelectorAll('.bm2_tab_pane').forEach((p) => p.classList.remove('bm2_active'));
                btn.classList.add('bm2_active');
                const tab = btn.getAttribute('data-tab');
                document.getElementById(`bm2_pane_${tab}`)?.classList.add('bm2_active');
                if (tab === 'graph') {
                    setTimeout(() => drawRelationshipGraph(), 30);
                }
            });
        });
    }

    const extMenu = document.getElementById('extensionsMenu');
    if (extMenu && !document.getElementById('bm2_wand_item')) {
        const item = document.createElement('div');
        item.id = 'bm2_wand_item';
        item.className = 'list-group-item flex-container flexGap5 interactable';
        item.tabIndex = 0;
        item.innerHTML = `<i class="fa-solid fa-moon"></i><span>BlueMoon: Связи, Древо и Стиль</span>`;
        item.addEventListener('click', () => {
            openBlueMoonModal();
        });
        extMenu.appendChild(item);
    }
}

function openBlueMoonModal() {
    const overlay = document.getElementById('bm2_overlay');
    if (!overlay) return;
    renderRelationshipsTab();
    renderGraphTab();
    renderStyleTab();
    renderThemeTab();
    overlay.classList.add('bm2_open');
}

function closeBlueMoonModal() {
    document.getElementById('bm2_overlay')?.classList.remove('bm2_open');
}

function openPromptPreviewModal() {
    const pane = document.getElementById('bm2_pane_rel');
    const promptText = compilePromptText() || '(Промпт пуст — добавьте связь или включите ползунки)';
    const depth = getSettings().injectionDepth ?? 1;

    const activePane = document.querySelector('.bm2_tab_pane.bm2_active') || pane;
    if (!activePane) return;

    activePane.innerHTML = `
        <div class="bm2_card">
            <div class="bm2_card_title">
                <span>👁️ Что именно отправляется ИИшке</span>
            </div>
            <p class="bm2_subtext">
                Этот скрытый системный блок автоматически вставляется в память нейросети на глубине <b>Depth = ${depth}</b> перед каждым ответом бота.
            </p>
            <textarea class="bm2_textarea" style="min-height: 240px; font-family: monospace; font-size: 0.8rem;" readonly>${escapeHtml(promptText)}</textarea>
            <div class="bm2_btn_row">
                <button type="button" class="bm2_btn bm2_btn_accent" id="bm2_back_from_preview">← Вернуться назад</button>
            </div>
        </div>
    `;

    document.getElementById('bm2_back_from_preview')?.addEventListener('click', () => {
        renderRelationshipsTab();
        renderGraphTab();
        renderStyleTab();
        renderThemeTab();
    });
}

function getMeterColor(val) {
    if (val >= 75) return 'linear-gradient(90deg, #ec4899, #a855f7)';
    if (val >= 45) return 'linear-gradient(90deg, #6366f1, #38bdf8)';
    return 'linear-gradient(90deg, #ef4444, #f97316)';
}

/**
 * TAB 1: Relationships & Participants
 */
function renderRelationshipsTab() {
    const pane = document.getElementById('bm2_pane_rel');
    if (!pane) return;

    const charKey = getCurrentCharacterKey();
    const charName = getCurrentCharacterName();
    const charData = getCurrentCharData();

    if (!charKey || !charData) {
        pane.innerHTML = `
            <div class="bm2_card">
                <div class="bm2_card_title">💞 Отношения и участники</div>
                <p class="bm2_subtext">Откройте чат с персонажем, чтобы вести его индивидуальную сеть связей, NPC, дат и подарков.</p>
            </div>
        `;
        return;
    }

    const nodesHtml = charData.nodes
        .map((n) => {
            const typeCfg = NODE_TYPES[n.type] || NODE_TYPES.npc;
            const avatarInner = n.avatar
                ? `<img src="${escapeHtml(n.avatar)}" alt="${escapeHtml(n.name)}" />`
                : `<span>${escapeHtml(n.name.slice(0, 6))}</span>`;
            return `
                <div class="bm2_node_pill" data-edit-node="${escapeHtml(n.id)}" title="Нажмите, чтобы изменить фото или имя">
                    <div class="bm2_node_avatar" style="border-color: ${typeCfg.color};">
                        ${avatarInner}
                    </div>
                    <div class="bm2_node_label">${escapeHtml(n.name)}</div>
                    <div class="bm2_node_role_tag">${escapeHtml(typeCfg.label)}</div>
                </div>
            `;
        })
        .join('');

    let relCardsHtml = '';
    if (charData.relationships.length === 0) {
        relCardsHtml = `<p class="bm2_subtext">Связей пока нет. Нажмите «+ Добавить связь» или перейдите во вкладку «🕸️ Древо» для авто-построения через ИИ.</p>`;
    } else {
        relCardsHtml = charData.relationships
            .map((rel) => {
                const roleCfg = RELATIONSHIP_ROLES[rel.role] || RELATIONSHIP_ROLES.strangers;
                const sat = Math.max(0, Math.min(100, Number(rel.satisfaction) || 50));
                const fromName = findNodeName(charData, rel.fromId);
                const toName = findNodeName(charData, rel.toId);

                let connector = roleCfg.directed ? '➔' : '↔';
                let badgeText = roleCfg.label;

                if (rel.role === 'crush') {
                    const mutCfg = CRUSH_MUTUALITY[rel.mutualStatus] || CRUSH_MUTUALITY.secret_one_sided;
                    connector = mutCfg.bothArrows ? '↔' : '➔';
                    badgeText = `${roleCfg.label}: ${mutCfg.label}`;
                }

                const datesHtml = roleCfg.dates
                    .map((d) => {
                        const val = rel.dates?.[d.key];
                        if (!val) return '';
                        return `<span class="bm2_date_chip">📅 ${escapeHtml(d.label)}: <b>${escapeHtml(val)}</b></span>`;
                    })
                    .filter(Boolean)
                    .join('');

                const memoriesHtml = (rel.memories || [])
                    .map((m) => {
                        const cat = MEMORY_CATEGORIES[m.category] || MEMORY_CATEGORIES.event;
                        return `<span class="bm2_mem_chip">${cat.icon} ${escapeHtml(m.text)}</span>`;
                    })
                    .join('');

                return `
                <div class="bm2_rel_card" data-rel-id="${escapeHtml(rel.id)}">
                    <div class="bm2_rel_top">
                        <div>
                            <div class="bm2_rel_pair">
                                <span>${roleCfg.icon}</span>
                                <span class="bm2_rel_name">${escapeHtml(fromName)} ${connector} ${escapeHtml(toName)}</span>
                            </div>
                            <span class="bm2_rel_role_badge" style="border: 1px solid ${roleCfg.color};">${escapeHtml(badgeText)}</span>
                        </div>
                        <button type="button" class="bm2_btn bm2_btn_small bm2_edit_rel_btn" data-id="${escapeHtml(rel.id)}">✏️ Изменить</button>
                    </div>

                    <div class="bm2_meter_wrap">
                        <div class="bm2_meter_label">
                            <span>Теплота / Удовлетворённость</span>
                            <b>${sat}%</b>
                        </div>
                        <div class="bm2_meter_bar">
                            <div class="bm2_meter_fill" style="width:${sat}%; background:${getMeterColor(sat)};"></div>
                        </div>
                    </div>

                    ${rel.lastDeltaNote ? `<div class="bm2_delta_note">📈 ${escapeHtml(rel.lastDeltaNote)}</div>` : ''}
                    ${datesHtml ? `<div class="bm2_dates_grid">${datesHtml}</div>` : ''}
                    ${memoriesHtml ? `<div class="bm2_memories_list">${memoriesHtml}</div>` : ''}
                </div>
            `;
            })
            .join('');
    }

    pane.innerHTML = `
        <div class="bm2_card">
            <div class="bm2_card_title">
                <span>👥 Участники (Бот, Персона, NPC)</span>
                <button type="button" class="bm2_btn bm2_btn_small bm2_btn_accent" id="bm2_add_node_btn">+ NPC / Персона</button>
            </div>
            <p class="bm2_subtext">Нажми на любого участника, чтобы загрузить ему фото из галереи или изменить имя. Все данные изолированы внутри чата с <b>${escapeHtml(charName)}</b>.</p>
            <div class="bm2_nodes_strip">${nodesHtml}</div>
        </div>

        <div class="bm2_card">
            <div class="bm2_card_title">
                <span>💞 Связи между участниками</span>
            </div>
            <div class="bm2_btn_row">
                <button type="button" class="bm2_btn bm2_btn_accent" id="bm2_add_rel_btn">➕ Добавить связь</button>
                <button type="button" class="bm2_btn" id="bm2_analyze_now_btn">⚡ Обновить % по сцене</button>
            </div>
        </div>

        <div id="bm2_rel_list_wrap" style="display:flex; flex-direction:column; gap:10px;">
            ${relCardsHtml}
        </div>

        <div class="bm2_card">
            <div class="bm2_card_title">📝 Личные заметки для ${escapeHtml(charName)}</div>
            <textarea id="bm2_char_notes_input" class="bm2_textarea" placeholder="Привычки, секреты, важные детали текущего сюжета...">${escapeHtml(charData.notes || '')}</textarea>
        </div>
    `;

    document.getElementById('bm2_add_node_btn')?.addEventListener('click', () => openNodeEditor(null));
    pane.querySelectorAll('[data-edit-node]').forEach((el) => {
        el.addEventListener('click', () => openNodeEditor(el.getAttribute('data-edit-node')));
    });

    document.getElementById('bm2_add_rel_btn')?.addEventListener('click', () => openRelationshipEditor(null));
    document.getElementById('bm2_analyze_now_btn')?.addEventListener('click', () => analyzeRelationshipDelta(true));

    pane.querySelectorAll('.bm2_edit_rel_btn').forEach((btn) => {
        btn.addEventListener('click', () => openRelationshipEditor(btn.getAttribute('data-id')));
    });

    document.getElementById('bm2_char_notes_input')?.addEventListener('input', (e) => {
        charData.notes = e.target.value;
        saveSettings();
        updatePromptInjection();
    });
}

function openNodeEditor(nodeId) {
    const pane = document.getElementById('bm2_pane_rel');
    const charData = getCurrentCharData();
    if (!pane || !charData) return;

    const existing = nodeId ? charData.nodes.find((n) => n.id === nodeId) : null;
    const node = existing
        ? structuredClone(existing)
        : {
              id: 'node_' + Date.now(),
              name: '',
              type: 'npc',
              avatar: '',
              x: 280 + Math.round(Math.random() * 120 - 60),
              y: 190 + Math.round(Math.random() * 120 - 60),
          };

    pane.innerHTML = `
        <div class="bm2_card">
            <div class="bm2_card_title">
                <span>${existing ? '✏️ Редактировать участника' : '➕ Новый участника (NPC / Персона)'}</span>
            </div>

            <div class="bm2_field_group">
                <label>Имя участника:</label>
                <input type="text" id="bm2_node_name" class="bm2_input" value="${escapeHtml(node.name)}" placeholder="Например: Дэниэль, Маша, Олег..." />
            </div>

            <div class="bm2_field_group">
                <label>Кто это:</label>
                <select id="bm2_node_type" class="bm2_select_input">
                    <option value="npc" ${node.type === 'npc' ? 'selected' : ''}>NPC (Второстепенный персонаж)</option>
                    <option value="persona" ${node.type === 'persona' ? 'selected' : ''}>Персона игрока</option>
                    <option value="bot" ${node.type === 'bot' ? 'selected' : ''}>Бот (Главный персонаж)</option>
                </select>
            </div>

            <div class="bm2_field_group">
                <label>Фотография кружка (в Древе связей):</label>
                <p class="bm2_subtext">Если фото загружено — оно отображается в кружке, а имя подписывается снизу. Если без фото — имя пишется внутри кружка.</p>
                <div class="bm2_row">
                    <input type="file" id="bm2_node_file" accept="image/*" style="display:none;" />
                    <button type="button" class="bm2_btn bm2_btn_accent" id="bm2_upload_photo_btn">📷 Выбрать фото с телефона</button>
                    <button type="button" class="bm2_btn bm2_btn_danger bm2_btn_small" id="bm2_clear_photo_btn">Убрать фото</button>
                </div>
                <input type="text" id="bm2_node_avatar_url" class="bm2_input" value="${escapeHtml(node.avatar || '')}" placeholder="Или вставьте ссылку на картинку..." style="margin-top:6px;" />
            </div>

            <div class="bm2_btn_row" style="margin-top:8px;">
                <button type="button" class="bm2_btn bm2_btn_accent" id="bm2_save_node_btn">💾 Сохранить</button>
                <button type="button" class="bm2_btn" id="bm2_cancel_node_btn">Отмена</button>
                ${existing && existing.type === 'npc' ? `<button type="button" class="bm2_btn bm2_btn_danger" id="bm2_delete_node_btn">🗑 Удалить</button>` : ''}
            </div>
        </div>
    `;

    document.getElementById('bm2_upload_photo_btn')?.addEventListener('click', () => {
        document.getElementById('bm2_node_file')?.click();
    });

    document.getElementById('bm2_node_file')?.addEventListener('change', async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const dataUrl = await readAndCompressImage(file, 160);
            node.avatar = dataUrl;
            document.getElementById('bm2_node_avatar_url').value = dataUrl;
            toastr.success('Фото загружено!', 'BlueMoon');
        } catch (err) {
            toastr.error('Ошибка чтения картинки', 'BlueMoon');
        }
    });

    document.getElementById('bm2_clear_photo_btn')?.addEventListener('click', () => {
        node.avatar = '';
        document.getElementById('bm2_node_avatar_url').value = '';
    });

    document.getElementById('bm2_save_node_btn')?.addEventListener('click', () => {
        const name = document.getElementById('bm2_node_name')?.value?.trim();
        if (!name) {
            toastr.warning('Введите имя участника', 'BlueMoon');
            return;
        }
        node.name = name;
        node.type = document.getElementById('bm2_node_type')?.value || 'npc';
        node.avatar = document.getElementById('bm2_node_avatar_url')?.value?.trim() || '';
        delete graphView.avatarCache[node.id];

        const idx = charData.nodes.findIndex((n) => n.id === node.id);
        if (idx >= 0) charData.nodes[idx] = node;
        else charData.nodes.push(node);

        saveSettings();
        updatePromptInjection();
        renderRelationshipsTab();
        drawRelationshipGraph();
    });

    document.getElementById('bm2_cancel_node_btn')?.addEventListener('click', () => {
        renderRelationshipsTab();
    });

    document.getElementById('bm2_delete_node_btn')?.addEventListener('click', () => {
        charData.nodes = charData.nodes.filter((n) => n.id !== node.id);
        charData.relationships = charData.relationships.filter(
            (r) => r.fromId !== node.id && r.toId !== node.id
        );
        saveSettings();
        updatePromptInjection();
        renderRelationshipsTab();
        drawRelationshipGraph();
    });
}

/**
 * Relationship Editor (with Crush Directionality & 5 Mutuality Modes)
 */
function openRelationshipEditor(relId) {
    const pane = document.getElementById('bm2_pane_rel');
    const charData = getCurrentCharData();
    if (!pane || !charData) return;

    const existing = relId ? charData.relationships.find((r) => r.id === relId) : null;
    const defaultFrom = charData.nodes[0]?.id || '';
    const defaultTo = charData.nodes[1]?.id || charData.nodes[0]?.id || '';

    const rel = existing
        ? structuredClone(existing)
        : {
              id: 'rel_' + Date.now(),
              fromId: defaultFrom,
              toId: defaultTo,
              role: 'crush',
              mutualStatus: 'secret_one_sided',
              satisfaction: 65,
              dates: {},
              memories: [],
              lastDeltaNote: '',
          };

    if (!rel.mutualStatus) rel.mutualStatus = 'secret_one_sided';

    function renderForm() {
        const roleCfg = RELATIONSHIP_ROLES[rel.role] || RELATIONSHIP_ROLES.strangers;

        const isCrush = rel.role === 'crush';
        const isParent = rel.role === 'parent_child' || rel.role === 'adopted_child' || rel.role === 'godparent';

        const fromLabel = isCrush
            ? '💘 Кто влюблён (Испытывает чувства):'
            : isParent
            ? '👤 Кто (Родитель / Наставник):'
            : '👤 Участник 1 (От кого):';

        const toLabel = isCrush
            ? '🎯 В кого влюблён (Объект симпатии):'
            : isParent
            ? '👶 К кому (Ребёнок / Подопечный):'
            : '👤 Участник 2 (К кому):';

        const fromOptions = charData.nodes
            .map(
                (n) =>
                    `<option value="${escapeHtml(n.id)}" ${n.id === rel.fromId ? 'selected' : ''}>${escapeHtml(n.name)} (${NODE_TYPES[n.type]?.label || 'NPC'})</option>`
            )
            .join('');

        const toOptions = charData.nodes
            .map(
                (n) =>
                    `<option value="${escapeHtml(n.id)}" ${n.id === rel.toId ? 'selected' : ''}>${escapeHtml(n.name)} (${NODE_TYPES[n.type]?.label || 'NPC'})</option>`
            )
            .join('');

        const roleOptions = Object.entries(RELATIONSHIP_ROLES)
            .map(
                ([k, v]) =>
                    `<option value="${k}" ${rel.role === k ? 'selected' : ''}>${v.icon} ${escapeHtml(v.label)}</option>`
            )
            .join('');

        const mutualityHtml = isCrush
            ? `
            <div class="bm2_field_group">
                <label>💞 Взаимность и скрытность чувств:</label>
                <select id="bm2_edit_mutual" class="bm2_select_input">
                    ${Object.entries(CRUSH_MUTUALITY)
                        .map(
                            ([k, v]) =>
                                `<option value="${k}" ${rel.mutualStatus === k ? 'selected' : ''}>${escapeHtml(v.label)}</option>`
                        )
                        .join('')}
                </select>
            </div>
        `
            : '';

        const dateInputsHtml = roleCfg.dates
            .map((d) => {
                const val = rel.dates?.[d.key] || '';
                return `
                <div class="bm2_field_group">
                    <label>📅 ${escapeHtml(d.label)}:</label>
                    <input type="text" class="bm2_input bm2_rel_date_inp" data-date-key="${d.key}" value="${escapeHtml(val)}" placeholder="Например: с осени / после вечеринки" />
                </div>
            `;
            })
            .join('');

        const memoriesListHtml = (rel.memories || [])
            .map((m, idx) => {
                const cat = MEMORY_CATEGORIES[m.category] || MEMORY_CATEGORIES.event;
                return `
                <div class="bm2_mem_chip">
                    <span>${cat.icon} ${escapeHtml(m.text)}</span>
                    <button type="button" data-del-mem="${idx}" style="border:0;background:transparent;color:#fca5a5;cursor:pointer;">✕</button>
                </div>
            `;
            })
            .join('');

        pane.innerHTML = `
            <div class="bm2_card">
                <div class="bm2_card_title">
                    <span>${existing ? '✏️ Редактировать связь' : '➕ Новая связь'}</span>
                </div>

                <div class="bm2_field_group">
                    <label>Статус / Роль отношений:</label>
                    <select id="bm2_edit_role" class="bm2_select_input">${roleOptions}</select>
                </div>

                <div class="bm2_grid_2">
                    <div class="bm2_field_group">
                        <label>${fromLabel}</label>
                        <select id="bm2_edit_from" class="bm2_select_input">${fromOptions}</select>
                    </div>
                    <div class="bm2_field_group">
                        <label>${toLabel}</label>
                        <select id="bm2_edit_to" class="bm2_select_input">${toOptions}</select>
                    </div>
                </div>

                ${mutualityHtml}

                <div class="bm2_slider_item">
                    <div class="bm2_slider_head">
                        <span>💖 Теплота / Сила чувств</span>
                        <span class="bm2_slider_val" id="bm2_edit_sat_val">${rel.satisfaction}%</span>
                    </div>
                    <input type="range" id="bm2_edit_sat" class="bm2_range" min="0" max="100" value="${rel.satisfaction}" />
                </div>

                <div class="bm2_grid_2">${dateInputsHtml}</div>

                <hr class="bm2_divider" />

                <div class="bm2_field_group">
                    <label>🎁 Подарки, события, привычки и обиды в этой паре:</label>
                    <div class="bm2_memories_list">${memoriesListHtml || '<span class="bm2_subtext">Записей пока нет</span>'}</div>
                    <div class="bm2_row" style="margin-top:6px;">
                        <select id="bm2_new_mem_cat" class="bm2_select_input" style="max-width:155px;">
                            <option value="gift">🎁 Подарок</option>
                            <option value="event">📌 Событие</option>
                            <option value="habit">💬 Привычка</option>
                            <option value="conflict">⚡ Обида/Ссора</option>
                        </select>
                        <input type="text" id="bm2_new_mem_text" class="bm2_input" placeholder="Например: украдкой смотрит, подарил..." />
                        <button type="button" id="bm2_add_mem_btn" class="bm2_btn bm2_btn_small bm2_btn_accent">+</button>
                    </div>
                </div>

                <div class="bm2_btn_row" style="margin-top:8px;">
                    <button type="button" class="bm2_btn bm2_btn_accent" id="bm2_save_rel_btn">💾 Сохранить</button>
                    <button type="button" class="bm2_btn" id="bm2_cancel_rel_btn">Отмена</button>
                    ${existing ? `<button type="button" class="bm2_btn bm2_btn_danger" id="bm2_delete_rel_btn">🗑 Удалить</button>` : ''}
                </div>
            </div>
        `;

        const syncDraft = () => {
            rel.fromId = document.getElementById('bm2_edit_from')?.value || rel.fromId;
            rel.toId = document.getElementById('bm2_edit_to')?.value || rel.toId;
            if (document.getElementById('bm2_edit_mutual')) {
                rel.mutualStatus = document.getElementById('bm2_edit_mutual').value;
            }
            rel.satisfaction = Number(document.getElementById('bm2_edit_sat')?.value ?? 50);
            pane.querySelectorAll('.bm2_rel_date_inp').forEach((inp) => {
                rel.dates[inp.getAttribute('data-date-key')] = inp.value;
            });
        };

        document.getElementById('bm2_edit_role')?.addEventListener('change', (e) => {
            syncDraft();
            rel.role = e.target.value;
            renderForm();
        });

        document.getElementById('bm2_edit_mutual')?.addEventListener('change', (e) => {
            rel.mutualStatus = e.target.value;
        });

        document.getElementById('bm2_edit_sat')?.addEventListener('input', (e) => {
            rel.satisfaction = Number(e.target.value);
            document.getElementById('bm2_edit_sat_val').textContent = `${rel.satisfaction}%`;
        });

        document.getElementById('bm2_add_mem_btn')?.addEventListener('click', () => {
            syncDraft();
            const cat = document.getElementById('bm2_new_mem_cat')?.value || 'event';
            const txt = document.getElementById('bm2_new_mem_text')?.value?.trim();
            if (!txt) return;
            rel.memories.push({ category: cat, text: txt });
            renderForm();
        });

        pane.querySelectorAll('[data-del-mem]').forEach((btn) => {
            btn.addEventListener('click', () => {
                syncDraft();
                rel.memories.splice(Number(btn.getAttribute('data-del-mem')), 1);
                renderForm();
            });
        });

        document.getElementById('bm2_save_rel_btn')?.addEventListener('click', () => {
            syncDraft();
            if (rel.fromId === rel.toId) {
                toastr.warning('Выберите двух разных участников для связи', 'BlueMoon');
                return;
            }
            const idx = charData.relationships.findIndex((r) => r.id === rel.id);
            if (idx >= 0) charData.relationships[idx] = rel;
            else charData.relationships.push(rel);

            saveSettings();
            updatePromptInjection();
            renderRelationshipsTab();
            drawRelationshipGraph();
            toastr.success('Связь сохранена', 'BlueMoon');
        });

        document.getElementById('bm2_cancel_rel_btn')?.addEventListener('click', () => {
            renderRelationshipsTab();
        });

        document.getElementById('bm2_delete_rel_btn')?.addEventListener('click', () => {
            charData.relationships = charData.relationships.filter((r) => r.id !== rel.id);
            saveSettings();
            updatePromptInjection();
            renderRelationshipsTab();
            drawRelationshipGraph();
        });
    }

    renderForm();
}

/**
 * TAB 2: Interactive Obsidian-Style Relationship Graph
 */
function renderGraphTab() {
    const pane = document.getElementById('bm2_pane_graph');
    if (!pane) return;

    const charData = getCurrentCharData();
    if (!charData) {
        pane.innerHTML = `<div class="bm2_card"><p class="bm2_subtext">Откройте чат с персонажем, чтобы увидеть древо связей.</p></div>`;
        return;
    }

    const legendHtml = Object.values(RELATIONSHIP_ROLES)
        .map(
            (r) => `
            <span class="bm2_legend_item">
                <span class="bm2_legend_line" style="background:${r.color}; ${r.dashed ? 'border-bottom:2px dashed ' + r.color + '; background:transparent;' : ''}"></span>
                <span>${escapeHtml(r.label)}</span>
            </span>
        `
        )
        .join('');

    pane.innerHTML = `
        <div class="bm2_card">
            <div class="bm2_card_title">
                <span>🕸️ Интерактивное Древо связей</span>
                <button type="button" class="bm2_btn bm2_btn_small bm2_btn_accent" id="bm2_ai_build_graph_btn">✨ Построить древо ИИ</button>
            </div>
            <p class="bm2_subtext">
                Перетаскивай кружки пальцем! Если у участника загружено фото — имя пишется под кругом, если без фото — внутри круга.
            </p>

            <div class="bm2_graph_wrap">
                <canvas id="bm2_graph_canvas" width="600" height="410"></canvas>
                <div class="bm2_graph_controls">
                    <button type="button" class="bm2_graph_ctrl_btn" id="bm2_zoom_in" title="Приблизить">＋</button>
                    <button type="button" class="bm2_graph_ctrl_btn" id="bm2_zoom_out" title="Отдалить">－</button>
                    <button type="button" class="bm2_graph_ctrl_btn" id="bm2_zoom_reset" title="Центрировать">⟲</button>
                </div>
            </div>

            <div class="bm2_graph_legend">${legendHtml}</div>

            <div class="bm2_btn_row">
                <button type="button" class="bm2_btn" id="bm2_graph_add_node">+ Участник / Фото</button>
                <button type="button" class="bm2_btn" id="bm2_graph_add_rel">+ Связь</button>
            </div>
        </div>
    `;

    document.getElementById('bm2_ai_build_graph_btn')?.addEventListener('click', autoBuildGraphWithAI);
    document.getElementById('bm2_zoom_in')?.addEventListener('click', () => {
        graphView.scale = Math.min(2.2, graphView.scale + 0.18);
        drawRelationshipGraph();
    });
    document.getElementById('bm2_zoom_out')?.addEventListener('click', () => {
        graphView.scale = Math.max(0.45, graphView.scale - 0.18);
        drawRelationshipGraph();
    });
    document.getElementById('bm2_zoom_reset')?.addEventListener('click', () => {
        graphView.scale = 1;
        graphView.offsetX = 0;
        graphView.offsetY = 0;
        drawRelationshipGraph();
    });

    document.getElementById('bm2_graph_add_node')?.addEventListener('click', () => {
        document.querySelector('.bm2_tab_btn[data-tab="rel"]')?.click();
        openNodeEditor(null);
    });
    document.getElementById('bm2_graph_add_rel')?.addEventListener('click', () => {
        document.querySelector('.bm2_tab_btn[data-tab="rel"]')?.click();
        openRelationshipEditor(null);
    });

    initGraphCanvasInteractions();
    drawRelationshipGraph();
}

function initGraphCanvasInteractions() {
    const canvas = document.getElementById('bm2_graph_canvas');
    if (!canvas) return;

    const getCanvasCoords = (clientX, clientY) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const rawX = (clientX - rect.left) * scaleX;
        const rawY = (clientY - rect.top) * scaleY;
        return {
            x: (rawX - graphView.offsetX) / graphView.scale,
            y: (rawY - graphView.offsetY) / graphView.scale,
            rawX,
            rawY,
        };
    };

    const onStart = (clientX, clientY) => {
        const charData = getCurrentCharData();
        if (!charData) return;
        const pt = getCanvasCoords(clientX, clientY);
        graphView.lastX = pt.rawX;
        graphView.lastY = pt.rawY;

        for (let i = charData.nodes.length - 1; i >= 0; i--) {
            const n = charData.nodes[i];
            const dx = pt.x - (n.x || 250);
            const dy = pt.y - (n.y || 200);
            if (Math.hypot(dx, dy) <= 36) {
                graphView.draggingNodeId = n.id;
                return;
            }
        }
        graphView.panning = true;
    };

    const onMove = (clientX, clientY) => {
        const charData = getCurrentCharData();
        if (!charData) return;
        const pt = getCanvasCoords(clientX, clientY);

        if (graphView.draggingNodeId) {
            const node = charData.nodes.find((n) => n.id === graphView.draggingNodeId);
            if (node) {
                node.x = Math.round(pt.x);
                node.y = Math.round(pt.y);
                drawRelationshipGraph();
            }
        } else if (graphView.panning) {
            graphView.offsetX += pt.rawX - graphView.lastX;
            graphView.offsetY += pt.rawY - graphView.lastY;
            graphView.lastX = pt.rawX;
            graphView.lastY = pt.rawY;
            drawRelationshipGraph();
        }
    };

    const onEnd = () => {
        if (graphView.draggingNodeId) {
            saveSettings();
        }
        graphView.draggingNodeId = null;
        graphView.panning = false;
    };

    canvas.addEventListener('pointerdown', (e) => {
        canvas.setPointerCapture(e.pointerId);
        onStart(e.clientX, e.clientY);
    });
    canvas.addEventListener('pointermove', (e) => {
        if (!graphView.draggingNodeId && !graphView.panning) return;
        onMove(e.clientX, e.clientY);
    });
    canvas.addEventListener('pointerup', onEnd);
    canvas.addEventListener('pointercancel', onEnd);
}

/**
 * Draw Obsidian + Colored Lines + Arrows + Photo/Text Circles on Canvas
 */
function drawArrowHead(ctx, fromX, fromY, toX, toY, color, targetRadius = 33) {
    const angle = Math.atan2(toY - fromY, toX - fromX);
    const ax = toX - Math.cos(angle) * targetRadius;
    const ay = toY - Math.sin(angle) * targetRadius;

    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(ax - 12 * Math.cos(angle - Math.PI / 6), ay - 12 * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(ax - 12 * Math.cos(angle + Math.PI / 6), ay - 12 * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

function drawRelationshipGraph() {
    const canvas = document.getElementById('bm2_graph_canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const charData = getCurrentCharData();
    if (!charData) return;

    const rect = canvas.getBoundingClientRect();
    if (rect.width > 0 && canvas.width !== Math.round(rect.width)) {
        canvas.width = Math.round(rect.width);
        canvas.height = Math.round(rect.height || 410);
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(graphView.offsetX, graphView.offsetY);
    ctx.scale(graphView.scale, graphView.scale);

    // 1. Draw Edges
    charData.relationships.forEach((rel) => {
        const fromNode = charData.nodes.find((n) => n.id === rel.fromId);
        const toNode = charData.nodes.find((n) => n.id === rel.toId);
        if (!fromNode || !toNode) return;

        const roleCfg = RELATIONSHIP_ROLES[rel.role] || RELATIONSHIP_ROLES.strangers;
        const x1 = fromNode.x || 180;
        const y1 = fromNode.y || 180;
        const x2 = toNode.x || 400;
        const y2 = toNode.y || 180;

        const isCrush = rel.role === 'crush';
        const mutCfg = isCrush ? (CRUSH_MUTUALITY[rel.mutualStatus] || CRUSH_MUTUALITY.secret_one_sided) : null;
        const useDashed = isCrush ? Boolean(mutCfg?.dashed) : Boolean(roleCfg.dashed);

        ctx.save();
        ctx.strokeStyle = roleCfg.color;
        ctx.lineWidth = 3;
        ctx.setLineDash(useDashed ? [7, 5] : []);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.restore();

        // Arrows
        if (roleCfg.directed) {
            drawArrowHead(ctx, x1, y1, x2, y2, roleCfg.color, 33);
            if (isCrush && mutCfg?.bothArrows) {
                drawArrowHead(ctx, x2, y2, x1, y1, roleCfg.color, 33);
            }
        }

        // Edge label
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2 - 7;
        const baseLabel = isCrush ? (mutCfg?.shortGraph || roleCfg.label) : roleCfg.label;
        const labelText = `${baseLabel} (${rel.satisfaction ?? 50}%)`;

        ctx.save();
        ctx.font = 'bold 11px sans-serif';
        const textWidth = ctx.measureText(labelText).width;
        ctx.fillStyle = 'rgba(15, 12, 26, 0.85)';
        ctx.fillRect(mx - textWidth / 2 - 5, my - 10, textWidth + 10, 16);
        ctx.fillStyle = roleCfg.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(labelText, mx, my - 2);
        ctx.restore();
    });

    // 2. Draw Nodes
    const NODE_RADIUS = 30;
    for (const node of charData.nodes) {
        const x = node.x || 250;
        const y = node.y || 200;
        const typeCfg = NODE_TYPES[node.type] || NODE_TYPES.npc;
        const hasAvatar = Boolean(node.avatar && node.avatar.trim());

        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, NODE_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = '#1e1936';
        ctx.fill();
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = typeCfg.color;
        ctx.shadowColor = typeCfg.color;
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.restore();

        if (hasAvatar) {
            let img = graphView.avatarCache[node.id];
            if (!img) {
                img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => drawRelationshipGraph();
                img.src = node.avatar;
                graphView.avatarCache[node.id] = img;
            }

            if (img.complete && img.naturalWidth > 0) {
                ctx.save();
                ctx.beginPath();
                ctx.arc(x, y, NODE_RADIUS - 2, 0, Math.PI * 2);
                ctx.clip();
                ctx.drawImage(img, x - NODE_RADIUS, y - NODE_RADIUS, NODE_RADIUS * 2, NODE_RADIUS * 2);
                ctx.restore();
            }

            ctx.save();
            ctx.font = 'bold 12px sans-serif';
            const tw = ctx.measureText(node.name).width;
            ctx.fillStyle = 'rgba(15, 12, 26, 0.88)';
            ctx.fillRect(x - tw / 2 - 6, y + NODE_RADIUS + 4, tw + 12, 18);
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(node.name, x, y + NODE_RADIUS + 13);
            ctx.restore();
        } else {
            ctx.save();
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 11.5px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const displayLabel = node.name.length > 9 ? node.name.slice(0, 8) + '…' : node.name;
            ctx.fillText(displayLabel, x, y);
            ctx.restore();
        }
    }

    ctx.restore();
}

/**
 * TAB 3: Style Presets, Multi-Genre Tags & Custom Sliders
 */
function renderStyleTab() {
    const pane = document.getElementById('bm2_pane_style');
    if (!pane) return;

    const s = getSettings();
    const sl = s.sliders;

    const presetOptions = Object.keys(s.presets || {})
        .map(
            (name) =>
                `<option value="${escapeHtml(name)}" ${s.activePreset === name ? 'selected' : ''}>${escapeHtml(name)}</option>`
        )
        .join('');

    const genreChipsHtml = (sl.genres || [])
        .map(
            (g, idx) => `
            <span class="bm2_genre_chip">
                <span>#${escapeHtml(g)}</span>
                <button type="button" data-del-genre="${idx}" title="Удалить жанр">✕</button>
            </span>
        `
        )
        .join('');

    const builtinSlidersHtml = BUILTIN_SLIDERS.map((meta) => {
        const val = Number(sl[meta.id] ?? 50);
        const extraAuthorHtml = meta.hasAuthorFields
            ? `
            <div class="bm2_field_group" style="margin-top:4px;">
                <input type="text" id="bm2_author_name" class="bm2_input" placeholder="Автор (например: Стивен Кинг, Достоевский)" value="${escapeHtml(sl.authorName || '')}" />
            </div>
            <div class="bm2_field_group" style="margin-top:4px;">
                <label style="font-size:0.78rem; color:var(--bm2-muted);">Активные жанры (можно добавлять сколько угодно):</label>
                <div class="bm2_genre_tags">${genreChipsHtml || '<span class="bm2_subtext">Жанры не выбраны</span>'}</div>
                <div class="bm2_row" style="margin-top:4px;">
                    <input type="text" id="bm2_new_genre_inp" class="bm2_input" placeholder="Добавить жанр (дарк-романс, детектив, ангст...)" />
                    <button type="button" class="bm2_btn bm2_btn_small bm2_btn_accent" id="bm2_add_genre_btn">+ Жанр</button>
                </div>
            </div>
        `
            : '';

        return `
            <div class="bm2_slider_item">
                <div class="bm2_slider_head">
                    <span>${meta.icon} ${escapeHtml(meta.title)}</span>
                    <span class="bm2_slider_val" id="bm2_val_${meta.id}">${val}%</span>
                </div>
                <input type="range" class="bm2_range bm2_style_slider" data-key="${meta.id}" min="0" max="100" step="5" value="${val}" />
                ${extraAuthorHtml}
            </div>
        `;
    }).join('');

    const customSlidersHtml = (s.customSliders || [])
        .map((cs) => {
            const val = Number(sl.customValues?.[cs.id] ?? 50);
            return `
            <div class="bm2_slider_item">
                <div class="bm2_slider_head">
                    <span>${escapeHtml(cs.icon || '✨')} ${escapeHtml(cs.title)}</span>
                    <div class="bm2_row">
                        <span class="bm2_slider_val" id="bm2_cval_${escapeHtml(cs.id)}">${val}%</span>
                        <button type="button" class="bm2_btn bm2_btn_small bm2_btn_danger" data-del-cslider="${escapeHtml(cs.id)}" title="Удалить ползунок">✕</button>
                    </div>
                </div>
                <input type="range" class="bm2_range bm2_custom_slider" data-cid="${escapeHtml(cs.id)}" min="0" max="100" step="5" value="${val}" />
                <span class="bm2_subtext">${escapeHtml(cs.promptHint || '')}</span>
            </div>
        `;
        })
        .join('');

    pane.innerHTML = `
        <div class="bm2_card">
            <div class="bm2_card_title">💾 Пресеты стиля</div>
            <div class="bm2_row">
                <select id="bm2_preset_select" class="bm2_select_input">${presetOptions}</select>
                <button type="button" class="bm2_btn bm2_btn_small bm2_btn_danger" id="bm2_del_preset_btn">🗑</button>
            </div>
            <div class="bm2_row">
                <input type="text" id="bm2_new_preset_name" class="bm2_input" placeholder="Название нового пресета..." />
                <button type="button" class="bm2_btn bm2_btn_small bm2_btn_accent" id="bm2_save_preset_btn">Сохранить</button>
            </div>
        </div>

        <div class="bm2_card">
            <div class="bm2_card_title">🎚️ Настройка ползунков стиля</div>
            ${builtinSlidersHtml}
            ${customSlidersHtml}
        </div>

        <div class="bm2_card">
            <div class="bm2_card_title">➕ Создать свою плашку ползунка</div>
            <p class="bm2_subtext">Добавь любой собственный ползунок (например: «🖤 Ангст и мрачность», «😂 Юмор и сарказм», «🕵️ Детективная интрига»).</p>
            <div class="bm2_grid_2">
                <input type="text" id="bm2_cs_title" class="bm2_input" placeholder="Название (например: 🖤 Мрачность и ангст)" />
                <input type="text" id="bm2_cs_hint" class="bm2_input" placeholder="Инструкция ИИ (напр.: Добавляй больше драмы и внутренних терзаний)" />
            </div>
            <button type="button" class="bm2_btn bm2_btn_accent" id="bm2_add_cslider_btn">+ Добавить плашку ползунка</button>
        </div>
    `;

    pane.querySelectorAll('.bm2_style_slider').forEach((inp) => {
        inp.addEventListener('input', (e) => {
            const key = inp.getAttribute('data-key');
            const val = Number(e.target.value);
            s.sliders[key] = val;
            const lbl = document.getElementById(`bm2_val_${key}`);
            if (lbl) lbl.textContent = `${val}%`;
            saveSettings();
            updatePromptInjection();
        });
    });

    pane.querySelectorAll('.bm2_custom_slider').forEach((inp) => {
        inp.addEventListener('input', (e) => {
            const cid = inp.getAttribute('data-cid');
            const val = Number(e.target.value);
            s.sliders.customValues[cid] = val;
            const lbl = document.getElementById(`bm2_cval_${cid}`);
            if (lbl) lbl.textContent = `${val}%`;
            saveSettings();
            updatePromptInjection();
        });
    });

    pane.querySelectorAll('[data-del-cslider]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const cid = btn.getAttribute('data-del-cslider');
            s.customSliders = s.customSliders.filter((c) => c.id !== cid);
            delete s.sliders.customValues[cid];
            saveSettings();
            updatePromptInjection();
            renderStyleTab();
        });
    });

    document.getElementById('bm2_add_cslider_btn')?.addEventListener('click', () => {
        const title = document.getElementById('bm2_cs_title')?.value?.trim();
        const hint = document.getElementById('bm2_cs_hint')?.value?.trim();
        if (!title) {
            toastr.warning('Введите название для нового ползунка', 'BlueMoon');
            return;
        }
        const id = 'cs_' + Date.now();
        s.customSliders.push({
            id,
            icon: '✨',
            title,
            promptHint: hint || `Maintain ${title} in the narrative.`,
        });
        s.sliders.customValues[id] = 50;
        saveSettings();
        updatePromptInjection();
        renderStyleTab();
        toastr.success(`Ползунок «${title}» добавлен!`, 'BlueMoon');
    });

    document.getElementById('bm2_author_name')?.addEventListener('input', (e) => {
        s.sliders.authorName = e.target.value;
        saveSettings();
        updatePromptInjection();
    });

    document.getElementById('bm2_add_genre_btn')?.addEventListener('click', () => {
        const val = document.getElementById('bm2_new_genre_inp')?.value?.trim();
        if (!val) return;
        if (!s.sliders.genres.includes(val)) {
            s.sliders.genres.push(val);
            saveSettings();
            updatePromptInjection();
            renderStyleTab();
        }
    });

    pane.querySelectorAll('[data-del-genre]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const idx = Number(btn.getAttribute('data-del-genre'));
            s.sliders.genres.splice(idx, 1);
            saveSettings();
            updatePromptInjection();
            renderStyleTab();
        });
    });

    document.getElementById('bm2_preset_select')?.addEventListener('change', (e) => {
        const name = e.target.value;
        if (s.presets[name]) {
            s.activePreset = name;
            s.sliders = structuredClone(s.presets[name]);
            if (!Array.isArray(s.sliders.genres)) s.sliders.genres = [];
            if (!s.sliders.customValues) s.sliders.customValues = {};
            saveSettings();
            updatePromptInjection();
            renderStyleTab();
            toastr.info(`Пресет «${name}» активирован`, 'BlueMoon');
        }
    });

    document.getElementById('bm2_save_preset_btn')?.addEventListener('click', () => {
        const nameInput = document.getElementById('bm2_new_preset_name');
        const name = (nameInput?.value || s.activePreset || '').trim();
        if (!name) return;
        s.presets[name] = structuredClone(s.sliders);
        s.activePreset = name;
        saveSettings();
        renderStyleTab();
        toastr.success(`Пресет «${name}» сохранён`, 'BlueMoon');
    });

    document.getElementById('bm2_del_preset_btn')?.addEventListener('click', () => {
        const keys = Object.keys(s.presets);
        if (keys.length <= 1) {
            toastr.warning('Нельзя удалить последний пресет', 'BlueMoon');
            return;
        }
        delete s.presets[s.activePreset];
        s.activePreset = Object.keys(s.presets)[0];
        s.sliders = structuredClone(s.presets[s.activePreset]);
        saveSettings();
        updatePromptInjection();
        renderStyleTab();
    });
}

/**
 * TAB 4: Themes & Custom CSS
 */
function renderThemeTab() {
    const pane = document.getElementById('bm2_pane_theme');
    if (!pane) return;

    const s = getSettings();
    const themeBtnsHtml = Object.entries(THEMES)
        .map(([key, t]) => {
            const active = s.activeTheme === key ? 'bm2_active_theme' : '';
            return `
            <button type="button" class="bm2_theme_btn ${active}" data-theme="${key}" style="background:${t.card};">
                <span>${escapeHtml(t.label)}</span>
                <span style="width:16px;height:16px;border-radius:50%;background:${t.accent};display:inline-block;"></span>
            </button>
        `;
        })
        .join('');

    pane.innerHTML = `
        <div class="bm2_card">
            <div class="bm2_card_title">🎨 Цветовая тема BlueMoon</div>
            <div class="bm2_theme_grid">${themeBtnsHtml}</div>

            <div class="bm2_slider_item" style="margin-top:6px;">
                <div class="bm2_slider_head">
                    <span>📐 Скругление углов интерфейса</span>
                    <span class="bm2_slider_val" id="bm2_radius_val">${s.borderRadius}px</span>
                </div>
                <input type="range" id="bm2_radius_slider" class="bm2_range" min="8" max="28" step="2" value="${s.borderRadius}" />
            </div>
        </div>

        <div class="bm2_card">
            <div class="bm2_card_title">💻 Свой CSS (Custom CSS)</div>
            <textarea id="bm2_custom_css_input" class="bm2_textarea" placeholder="/* Например: .mes_text { font-size: 16px; } */">${escapeHtml(s.customCss || '')}</textarea>
            <div class="bm2_btn_row">
                <button type="button" class="bm2_btn bm2_btn_accent" id="bm2_apply_css_btn">Применить CSS</button>
                <button type="button" class="bm2_btn bm2_btn_danger" id="bm2_clear_css_btn">Очистить CSS</button>
            </div>
        </div>
    `;

    pane.querySelectorAll('.bm2_theme_btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            s.activeTheme = btn.getAttribute('data-theme');
            saveSettings();
            applyVisualTheme();
            renderThemeTab();
        });
    });

    document.getElementById('bm2_radius_slider')?.addEventListener('input', (e) => {
        s.borderRadius = Number(e.target.value);
        document.getElementById('bm2_radius_val').textContent = `${s.borderRadius}px`;
        saveSettings();
        applyVisualTheme();
    });

    document.getElementById('bm2_apply_css_btn')?.addEventListener('click', () => {
        s.customCss = document.getElementById('bm2_custom_css_input')?.value || '';
        saveSettings();
        applyVisualTheme();
        toastr.success('Пользовательский CSS применён', 'BlueMoon');
    });

    document.getElementById('bm2_clear_css_btn')?.addEventListener('click', () => {
        s.customCss = '';
        saveSettings();
        applyVisualTheme();
        renderThemeTab();
    });
}

async function initSettingsPanel() {
    try {
        const container = document.getElementById('extensions_settings2') || document.getElementById('extensions_settings');
        if (!container) return;

        const res = await fetch(`/${EXTENSION_FOLDER_PATH}/settings.html`);
        if (res.ok) {
            container.insertAdjacentHTML('beforeend', await res.text());
        }

        const s = getSettings();
        const bindCheck = (id, key) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.checked = Boolean(s[key]);
            el.addEventListener('change', () => {
                s[key] = el.checked;
                saveSettings();
                updatePromptInjection();
            });
        };

        bindCheck('bm2_master_enabled', 'masterEnabled');
        bindCheck('bm2_rel_enabled', 'relEnabled');
        bindCheck('bm2_rel_auto_analyze', 'relAutoAnalyze');
        bindCheck('bm2_isolate_per_chat', 'isolatePerChat');
        bindCheck('bm2_style_enabled', 'styleEnabled');

        populateConnectionProfiles();
        document.getElementById('bm2_connection_profile')?.addEventListener('change', (e) => {
            s.connectionProfileId = e.target.value;
            saveSettings();
        });
        document.getElementById('bm2_refresh_profiles')?.addEventListener('click', () => {
            populateConnectionProfiles();
            toastr.info('Список профилей обновлён', 'BlueMoon');
        });

        const depthInp = document.getElementById('bm2_injection_depth');
        if (depthInp) {
            depthInp.value = s.injectionDepth ?? 1;
            depthInp.addEventListener('change', () => {
                s.injectionDepth = Math.max(0, Math.min(20, Number(depthInp.value) || 1));
                saveSettings();
                updatePromptInjection();
            });
        }

        document.getElementById('bm2_open_panel_btn')?.addEventListener('click', openBlueMoonModal);
    } catch (err) {
        console.error(`[${MODULE_NAME}] initSettingsPanel error:`, err);
    }
}

function init() {
    const ctx = SillyTavern.getContext();
    getSettings();
    applyVisualTheme();
    buildMainOverlay();
    initSettingsPanel();
    updatePromptInjection();

    const { eventSource, event_types } = ctx;
    if (eventSource && event_types) {
        eventSource.on(event_types.CHAT_CHANGED, () => {
            graphView.avatarCache = {};
            updatePromptInjection();
            if (document.getElementById('bm2_overlay')?.classList.contains('bm2_open')) {
                renderRelationshipsTab();
                drawRelationshipGraph();
            }
        });

        eventSource.on(event_types.CHARACTER_MESSAGE_RENDERED, () => {
            analyzeRelationshipDelta(false);
        });
    }

    console.log(`[${MODULE_NAME}] v2.1.2 initialized.`);
}

jQuery(() => {
    const ctx = SillyTavern.getContext();
    if (ctx.eventSource && ctx.event_types?.APP_READY) {
        ctx.eventSource.on(ctx.event_types.APP_READY, init);
    } else {
        init();
    }
});
