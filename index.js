import {
    extension_settings,
    getContext,
} from '../../../extensions.js';

import {
    saveSettingsDebounced,
    eventSource,
    event_types,
    setExtensionPrompt,
    extension_prompt_types,
} from '../../../../script.js';

const MODULE_NAME = 'bluemoon_v2';
const PROMPT_KEY_STYLE = 'bluemoon_v2_style_prompt';
const PROMPT_KEY_REL = 'bluemoon_v2_rel_prompt';

// Fallback clone helper in case structuredClone fails on any object
function safeClone(obj) {
    if (obj === undefined || obj === null) return obj;
    try {
        return JSON.parse(JSON.stringify(obj));
    } catch (_) {
        return obj;
    }
}

// Categories for structured grouping of roles
const ROLE_CATEGORIES = {
    romance: { id: 'romance', label: '💘 Романтика и симпатия' },
    family: { id: 'family', label: '🧬 Семья и родство' },
    friendship: { id: 'friendship', label: '🤝 Дружба и доверие' },
    social: { id: 'social', label: '🏢 Учёба, работа и быт' },
    conflict: { id: 'conflict', label: '⚔️ Конфликт и драма' },
    other: { id: 'other', label: '🎭 Прочее и свои статусы' },
};

// 25 Built-in Relationship Statuses
const BUILTIN_RELATIONSHIP_ROLES = [
    // Romance
    { id: 'crush', category: 'romance', label: '💘 Симпатия / Влюблённость', shortLabel: '💘 Симпатия', color: '#ff6b9d', hasMutuality: true, defaultMutuality: 'mutual_open', prompt: 'Romantic attraction / crush' },
    { id: 'dating', category: 'romance', label: '👩‍❤️‍👨 Встречаются (Пара)', shortLabel: '👩‍❤️‍👨 Пара', color: '#ff477e', hasMutuality: true, defaultMutuality: 'mutual_open', prompt: 'Officially dating as a romantic couple' },
    { id: 'secret_lovers', category: 'romance', label: '❤️‍🔥 Тайные любовники', shortLabel: '❤️‍🔥 Тайные', color: '#e056fd', hasMutuality: true, defaultMutuality: 'secret_relationship', prompt: 'Secret lovers hiding their romance from everyone else' },
    { id: 'fwb', category: 'romance', label: '💋 Секс по дружбе (FWB)', shortLabel: '💋 FWB', color: '#f78fb3', hasMutuality: true, defaultMutuality: 'secret_relationship', prompt: 'Friends with benefits (physical intimacy without official romantic commitment)' },
    { id: 'married', category: 'romance', label: '💍 В браке (Супруги)', shortLabel: '💍 Брак', color: '#ffd166', hasMutuality: true, defaultMutuality: 'mutual_open', prompt: 'Married spouses' },
    { id: 'exes', category: 'romance', label: '💔 Бывшие партнёры', shortLabel: '💔 Бывшие', color: '#9d8189', hasMutuality: true, defaultMutuality: 'residual_chemistry', prompt: 'Ex-partners with shared past history' },

    // Friendship
    { id: 'acquaintances', category: 'friendship', label: '👋 Знакомые', shortLabel: '👋 Знакомые', color: '#8d99ae', hasMutuality: false, defaultMutuality: 'none', prompt: 'Casual acquaintances' },
    { id: 'friends', category: 'friendship', label: '🤝 Друзья', shortLabel: '🤝 Друзья', color: '#4ea8de', hasMutuality: false, defaultMutuality: 'none', prompt: 'Friends' },
    { id: 'best_friends', category: 'friendship', label: '🌟 Лучшие друзья', shortLabel: '🌟 Лучшие др.', color: '#38b000', hasMutuality: false, defaultMutuality: 'none', prompt: 'Best friends with deep trust and loyalty' },
    { id: 'childhood_friends', category: 'friendship', label: '🧸 Друзья детства', shortLabel: '🧸 Др. детства', color: '#72efdd', hasMutuality: false, defaultMutuality: 'none', prompt: 'Childhood friends who grew up together' },
    { id: 'protector_ward', category: 'friendship', label: '🛡️ Защитник и подопечный', shortLabel: '🛡️ Защитник', color: '#48cae4', hasMutuality: false, defaultMutuality: 'none', prompt: 'Protector / bodyguard and the person they protect' },

    // Family
    { id: 'siblings', category: 'family', label: '🧬 Брат / Сестра', shortLabel: '🧬 Брат/Сестра', color: '#a78bfa', hasMutuality: false, defaultMutuality: 'none', prompt: 'Siblings (brother/sister)' },
    { id: 'stepsiblings', category: 'family', label: '🔗 Сводные брат / сестра', shortLabel: '🔗 Сводные', color: '#c084fc', hasMutuality: false, defaultMutuality: 'none', prompt: 'Step-siblings living or raised in a blended family' },
    { id: 'parent_child', category: 'family', label: '🏡 Родитель ↔ Ребёнок', shortLabel: '🏡 Родитель', color: '#c77dff', hasMutuality: false, defaultMutuality: 'none', prompt: 'Parent and child family dynamic' },
    { id: 'relatives', category: 'family', label: '🌳 Родственники', shortLabel: '🌳 Родня', color: '#b5838d', hasMutuality: false, defaultMutuality: 'none', prompt: 'Extended family members / relatives' },

    // Social / Work / Study
    { id: 'strangers', category: 'social', label: '👤 Незнакомцы', shortLabel: '👤 Незнакомцы', color: '#7a889b', hasMutuality: false, defaultMutuality: 'none', prompt: 'Strangers who barely know each other' },
    { id: 'roommates', category: 'social', label: '🏠 Соседи по комнате / дому', shortLabel: '🏠 Соседи', color: '#64dfdf', hasMutuality: false, defaultMutuality: 'none', prompt: 'Roommates or close neighbors sharing living space' },
    { id: 'classmates', category: 'social', label: '🎒 Одноклассники / Однокурсники', shortLabel: '🎒 Учёба', color: '#56cfe1', hasMutuality: false, defaultMutuality: 'none', prompt: 'Classmates or university peers studying together' },
    { id: 'colleagues', category: 'social', label: '💼 Коллеги / Напарники', shortLabel: '💼 Коллеги', color: '#74c69d', hasMutuality: false, defaultMutuality: 'none', prompt: 'Work colleagues or teammates' },
    { id: 'boss_subordinate', category: 'social', label: '👔 Босс → Подчинённый', shortLabel: '👔 Босс/Подч.', color: '#f3a683', hasMutuality: false, defaultMutuality: 'none', prompt: 'Authority dynamic: first character is Boss/Leader, second is Subordinate' },
    { id: 'mentor_student', category: 'social', label: '🎓 Учитель → Ученик', shortLabel: '🎓 Наставник', color: '#f8a5c2', hasMutuality: false, defaultMutuality: 'none', prompt: 'Mentor / teacher (first character) and student / apprentice (second character)' },
    { id: 'idol_fan', category: 'social', label: '✨ Кумир → Фанат', shortLabel: '✨ Кумир/Фанат', color: '#ffe66d', hasMutuality: false, defaultMutuality: 'none', prompt: 'Idol / celebrity (first character) and devoted admirer / fan (second character)' },

    // Conflict
    { id: 'rivals', category: 'conflict', label: '⚡ Соперники', shortLabel: '⚡ Соперники', color: '#f77f00', hasMutuality: false, defaultMutuality: 'none', prompt: 'Competitive rivals' },
    { id: 'ex_friends', category: 'conflict', label: '🥀 Бывшие друзья', shortLabel: '🥀 Бывш. друзья', color: '#e5989b', hasMutuality: false, defaultMutuality: 'none', prompt: 'Former close friends who had a falling out' },
    { id: 'enemies', category: 'conflict', label: '🗡️ Враги', shortLabel: '🗡️ Враги', color: '#e63946', hasMutuality: false, defaultMutuality: 'none', prompt: 'Hostile enemies' },
];

// 8 Detailed Crush / Attraction Subtypes with Strict Epistemic Secrecy Rules
const CRUSH_MUTUALITY = [
    {
        id: 'none',
        label: '➖ Нет романтического подтекста (обычная связь)',
        shortTag: '',
        prompt: 'No hidden romantic subtext beyond their primary relationship status.',
        secrecyRule: '',
    },
    {
        id: 'mutual_open',
        label: '💞 Открытая взаимная симпатия (флирт)',
        shortTag: '💞 Взаимно (флирт)',
        prompt: 'Open mutual romantic attraction and noticeable flirting from both sides.',
        secrecyRule: 'Both {A} and {B} are openly affectionate/flirtatious with each other.',
    },
    {
        id: 'mutual_secret',
        label: '🤫 Тайная взаимная влюблённость (оба скрывают)',
        shortTag: '🤫 Тайная взаимная',
        prompt: 'Mutual secret crush: BOTH {A} and {B} are secretly in love with each other, but neither has confessed.',
        secrecyRule: 'STRICT SECRECY LOCK: {A} does NOT know that {B} loves them back, and {B} does NOT know that {A} loves them back! Both think their crush is one-sided and try to hide their nervous attraction. NO other characters or NPCs know about their feelings.',
    },
    {
        id: 'secret_relationship',
        label: '🔒 Тайная связь (скрывают от окружающих)',
        shortTag: '🔒 Тайная от всех',
        prompt: 'Secret romance/intimacy: {A} and {B} know about their mutual feelings/relationship in private, but strictly hide it from the public.',
        secrecyRule: 'STRICT THIRD-PARTY SECRECY LOCK: ONLY {A} and {B} know about their romantic/intimate bond. In front of ANY other character or NPC, {A} and {B} act strictly according to their public cover status. All other characters and NPCs have ZERO knowledge of this secret romance and must NEVER guess or mention it.',
    },
    {
        id: 'one_way_a_to_b',
        label: '💔 Безответная / тайная (только {A} → {B})',
        shortTag: '💔 {A} → {B}',
        prompt: 'Hidden / unrequited one-sided crush: ONLY {A} is secretly in love with {B}.',
        secrecyRule: 'STRICT EPISTEMIC LOCK: ONLY {A} knows about {A}\'s romantic feelings for {B}! {B} is completely UNAWARE of {A}\'s crush and treats {A} strictly according to their primary status without romantic reciprocation. ALL other characters and NPCs have ZERO knowledge of {A}\'s secret crush and must NEVER hint at it or read {A}\'s mind.',
    },
    {
        id: 'one_way_b_to_a',
        label: '💔 Безответная / тайная (только {B} → {A})',
        shortTag: '💔 {B} → {A}',
        prompt: 'Hidden / unrequited one-sided crush: ONLY {B} is secretly in love with {A}.',
        secrecyRule: 'STRICT EPISTEMIC LOCK: ONLY {B} knows about {B}\'s romantic feelings for {A}! {A} is completely UNAWARE of {B}\'s crush and treats {B} strictly according to their primary status without romantic reciprocation. ALL other characters and NPCs have ZERO knowledge of {B}\'s secret crush and must NEVER hint at it or read {B}\'s mind.',
    },
    {
        id: 'unspoken_tension',
        label: '⚡ Скрытое притяжение / отрицание чувств (цундере)',
        shortTag: '⚡ Отрицание / искра',
        prompt: 'Unspoken romantic tension and chemistry masked by denial, pride, sarcasm, or tsundere banter.',
        secrecyRule: 'STRICT SECRECY LOCK: Neither {A} nor {B} admits any romantic attraction out loud (even to themselves). Other characters and NPCs only see their surface banter/rivalry and do NOT know about any underlying romantic spark.',
    },
    {
        id: 'residual_chemistry',
        label: '🥀 Остывшие чувства / сложная химия (ревность, бывшие)',
        shortTag: '🥀 Сложная химия',
        prompt: 'Complicated residual feelings, hidden jealousy, or unresolved tension kept private.',
        secrecyRule: 'Any lingering jealousy or unspoken vulnerability between {A} and {B} is guarded internally and not known to outside NPCs.',
    },
];

// Genre Presets
const GENRE_PRESETS = {
    custom: { label: '✨ Свой микс (Вручную)', prompt: 'Follow the active sub-genres and sliders selected below.' },
    slowburn_romance: { label: '🕯️ Слоубёрн Романтика', prompt: 'Slow-burn emotional romance. Focus on micro-expressions, lingering glances, subtle tension, gradual trust building. Never rush physical intimacy.' },
    dark_fantasy: { label: '🗡️ Тёмное фэнтези', prompt: 'Gritty dark fantasy atmosphere. Visceral sensory details, moral ambiguity, dangerous world, grounded consequences, atmospheric dread.' },
    cyberpunk_noir: { label: '🌃 Киберпанк-Нуар', prompt: 'Rain-soaked neon noir. Cynical internal monologue, high-tech low-life contrast, sharp street dialogue, shadows and chrome.' },
    psychological_thriller: { label: '🎭 Психологический триллер', prompt: 'Tense psychological drama. Unreliable perceptions, hidden motives, subtext-heavy dialogue, claustrophobic tension.' },
    cozy_slice_of_life: { label: '☕ Уютная повседневность', prompt: 'Warm slice-of-life comfort. Gentle pacing, sensory warmth, everyday domestic chemistry, natural banter, emotional safety.' },
    gothic_horror: { label: '🦇 Готический хоррор', prompt: 'Classical gothic dread. Oppressive architecture, eerie silence, poetic melancholy, creeping supernatural unease.' },
    enemies_to_lovers: { label: '⚔️ От врагов к возлюбленным', prompt: 'Sharp rivalry and verbal sparring masking deep magnetic pull. Pride, stubbornness, reluctant respect, electric proximity.' },
};

const MULTI_GENRE_TAGS = [
    { id: 'slowburn', label: '🕯️ Слоубёрн', prompt: 'Slow-burn progression: build tension gradually without rushing milestones.' },
    { id: 'angst', label: '🌧️ Ангст и драма', prompt: 'Emotional angst, raw vulnerability, heart-wrenching internal conflict.' },
    { id: 'fluff', label: '🧸 Флафф и нежность', prompt: 'Warm tenderness, tactile comfort, soft affectionate moments.' },
    { id: 'dark_romance', label: '🖤 Дарк Романс', prompt: 'Obsessive intensity, morally grey dynamics, dangerous attraction.' },
    { id: 'mystery', label: '🔍 Детектив / Тайна', prompt: 'Suspenseful mystery, clues, guarded secrets, investigative atmosphere.' },
    { id: 'comedy', label: '😏 Ирония и юмор', prompt: 'Witty banter, situational irony, lively natural humor.' },
    { id: 'action', label: '💥 Экшен и динамика', prompt: 'Crisp kinetic action, high stakes, physical momentum.' },
    { id: 'slice_of_life', label: '🍵 Повседневность', prompt: 'Grounded daily life details, realistic routines, natural conversations.' },
    { id: 'hurt_comfort', label: '🩹 Хёрт / Комфорт', prompt: 'Emotional or physical hurt followed by attentive care and healing.' },
    { id: 'psychological', label: '🧠 Психологизм', prompt: 'Deep psychological introspection, complex motives, unspoken subtext.' },
];

// 16 Designer Themes
const BUILTIN_THEMES = {
    bluemoon_midnight: {
        name: '🌙 BlueMoon Полночь',
        desc: 'Глубокий индиго и неоновый лунный свет',
        bg: '#0c1120', panel: '#141c32', text: '#e6edf8', accent: '#68a2ff', border: '#273861', glow: 'rgba(104, 162, 255, 0.25)',
    },
    obsidian_violet: {
        name: '🔮 Обсидиан',
        desc: 'Космический аметист и фиолетовое сияние',
        bg: '#0f0c1b', panel: '#18132c', text: '#ede8f8', accent: '#a87ffb', border: '#322659', glow: 'rgba(168, 127, 251, 0.26)',
    },
    sakura_neon: {
        name: '🌸 Неоновая Сакура',
        desc: 'Тёмный шёлк и лепестки ночной вишни',
        bg: '#170d16', panel: '#251423', text: '#fcebf6', accent: '#ff65a3', border: '#4d2647', glow: 'rgba(255, 101, 163, 0.28)',
    },
    crimson_velvet: {
        name: '🍷 Алый Бархат',
        desc: 'Готический бордовый и золотая искра',
        bg: '#170a0e', panel: '#261118', text: '#f9e6ec', accent: '#ff4d6d', border: '#4d202e', glow: 'rgba(255, 77, 109, 0.26)',
    },
    emerald_forest: {
        name: '🌲 Изумрудный Лес',
        desc: 'Туманная хвоя и светлячки',
        bg: '#0a1613', panel: '#11241f', text: '#e3f5ef', accent: '#38d399', border: '#20483d', glow: 'rgba(56, 211, 153, 0.24)',
    },
    cyber_gold: {
        name: '⚡ Кибер-Золото',
        desc: 'Матовый карбон и горячий янтарь',
        bg: '#14120c', panel: '#211d13', text: '#f7f1e1', accent: '#f5b73b', border: '#473d23', glow: 'rgba(245, 183, 59, 0.25)',
    },
    arctic_aurora: {
        name: '❄️ Полярное Сияние',
        desc: 'Ледяной океан и бирюзовый неон',
        bg: '#09151b', panel: '#10242e', text: '#e5f9ff', accent: '#33e1ed', border: '#1f4959', glow: 'rgba(51, 225, 237, 0.25)',
    },
    sunset_synthwave: {
        name: '🌆 Синтвейв Закат',
        desc: 'Пурпурные сумерки и коралловое солнце',
        bg: '#180d1e', panel: '#281533', text: '#ffeef8', accent: '#ff7b54', border: '#522961', glow: 'rgba(255, 123, 84, 0.28)',
    },
    royal_gold: {
        name: '👑 Королевский Оникс',
        desc: 'Чёрный мрамор и жидкое золото',
        bg: '#0e0d0a', panel: '#1a1813', text: '#fcf7e8', accent: '#eab308', border: '#423922', glow: 'rgba(234, 179, 8, 0.24)',
    },
    blood_moon: {
        name: '🩸 Кровавая Луна',
        desc: 'Ночной пепел и багровое затмение',
        bg: '#130707', panel: '#220c0c', text: '#f8e0e0', accent: '#ef233c', border: '#4a1818', glow: 'rgba(239, 35, 60, 0.30)',
    },
    lavender_dream: {
        name: '🪻 Лавандовый Сон',
        desc: 'Нежные пастельные сумерки и сирень',
        bg: '#151324', panel: '#211e38', text: '#f2efff', accent: '#c4b5fd', border: '#3e3866', glow: 'rgba(196, 181, 253, 0.25)',
    },
    warm_espresso: {
        name: '☕ Тёплый Эспрессо',
        desc: 'Уютная кофейня, карамель и корица',
        bg: '#16110e', panel: '#241c17', text: '#f5ebe4', accent: '#dda15e', border: '#47362b', glow: 'rgba(221, 161, 94, 0.24)',
    },
    ocean_abyss: {
        name: '🌊 Бездна Океана',
        desc: 'Марианская впадина и биолюминесценция',
        bg: '#07111e', panel: '#0d1e33', text: '#e0f2fe', accent: '#38bdf8', border: '#1e3a5f', glow: 'rgba(56, 189, 248, 0.26)',
    },
    toxic_matrix: {
        name: '🧪 Неоновый Взлом',
        desc: 'Терминальный чёрный и кислотный лайм',
        bg: '#091209', panel: '#112111', text: '#e4fce4', accent: '#80ed99', border: '#1f4722', glow: 'rgba(128, 237, 153, 0.25)',
    },
    rose_quartz: {
        name: '💎 Розовый Кварц',
        desc: 'Пудровый румянец и жемчужный блеск',
        bg: '#1b1216', panel: '#2b1d24', text: '#fdf2f7', accent: '#f497b6', border: '#543846', glow: 'rgba(244, 151, 182, 0.25)',
    },
    starlight_silver: {
        name: '✨ Звёздная Пыль',
        desc: 'Монохромный графит и серебряный свет',
        bg: '#101216', panel: '#191d24', text: '#f3f4f6', accent: '#94a3b8', border: '#333b48', glow: 'rgba(148, 163, 184, 0.22)',
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
    activeTheme: 'bluemoon_midnight',
    customTheme: {
        bg: '#0c1120',
        panel: '#141c32',
        text: '#e6edf8',
        accent: '#68a2ff',
        border: '#273861',
        glow: 'rgba(104, 162, 255, 0.25)',
    },
    styleConfig: {
        genrePreset: 'custom',
        activeTags: ['slowburn'],
        customGenreNotes: '',
        authorVoice: '',
        intensity: 4,
        sliders: {
            pacing: 35,
            romanceSpeed: 25,
            dialogueRatio: 55,
            sensoryDetail: 70,
            emotionalDepth: 75,
        },
    },
    customRoles: [],
    uiFilterNodeId: 'ALL',
    uiGroupMode: 'category',
    characterProfiles: {},
};

let activeModalTab = 'tab_rel';
let selectedRelId = null;
let graphDragNodeId = null;
let graphCanvasResizeObserver = null;
let isAnalyzingRel = false;
let isInitialized = false;
let modalEventsBound = false;

function getSettings() {
    if (!extension_settings[MODULE_NAME]) {
        extension_settings[MODULE_NAME] = safeClone(DEFAULT_SETTINGS);
    }
    const s = extension_settings[MODULE_NAME];
    for (const [k, v] of Object.entries(DEFAULT_SETTINGS)) {
        if (s[k] === undefined) {
            s[k] = safeClone(v);
        }
    }
    if (!s.styleConfig || typeof s.styleConfig !== 'object') {
        s.styleConfig = safeClone(DEFAULT_SETTINGS.styleConfig);
    }
    if (!s.styleConfig.sliders) {
        s.styleConfig.sliders = safeClone(DEFAULT_SETTINGS.styleConfig.sliders);
    }
    if (!Array.isArray(s.styleConfig.activeTags)) {
        s.styleConfig.activeTags = ['slowburn'];
    }
    if (!Array.isArray(s.customRoles)) {
        s.customRoles = [];
    }
    if (s.styleConfig.intensity === undefined) {
        s.styleConfig.intensity = 4;
    }
    if (!s.uiFilterNodeId) {
        s.uiFilterNodeId = 'ALL';
    }
    if (!s.uiGroupMode) {
        s.uiGroupMode = 'category';
    }
    if (!s.characterProfiles || typeof s.characterProfiles !== 'object') {
        s.characterProfiles = {};
    }
    return s;
}

function getAllRoles() {
    const s = getSettings();
    const custom = (s.customRoles || []).map(r => ({
        id: r.id,
        category: r.category || 'other',
        label: r.label,
        shortLabel: r.shortLabel || r.label.slice(0, 14),
        color: r.color || '#68a2ff',
        hasMutuality: true,
        defaultMutuality: 'none',
        prompt: r.prompt || r.label,
        isCustom: true,
    }));
    return [...BUILTIN_RELATIONSHIP_ROLES, ...custom];
}

function getRoleInfo(roleId) {
    const all = getAllRoles();
    return all.find(r => r.id === roleId) || all[6];
}

function getMutualityInfo(mutualityId, nameA = 'Персонаж А', nameB = 'Персонаж Б') {
    const raw = CRUSH_MUTUALITY.find(m => m.id === mutualityId) || CRUSH_MUTUALITY[0];
    const safeA = String(nameA || 'Персонаж А');
    const safeB = String(nameB || 'Персонаж Б');
    return {
        id: raw.id,
        label: raw.label.replace(/\{A\}/g, safeA).replace(/\{B\}/g, safeB),
        shortTag: (raw.shortTag || '').replace(/\{A\}/g, safeA).replace(/\{B\}/g, safeB),
        prompt: raw.prompt.replace(/\{A\}/g, safeA).replace(/\{B\}/g, safeB),
        secrecyRule: (raw.secrecyRule || '').replace(/\{A\}/g, safeA).replace(/\{B\}/g, safeB),
    };
}

function getBaseCharacterKey() {
    const ctx = getContext();
    const charId = ctx.characterId;
    const charObj = (charId !== undefined && ctx.characters?.[charId]) ? ctx.characters[charId] : null;
    const charKey = charObj?.avatar || charObj?.name || ctx.groupId || 'global_default';
    return `char_${charKey}`;
}

function getActiveProfileKey() {
    const ctx = getContext();
    const s = getSettings();
    const baseKey = getBaseCharacterKey();
    if (s.isolatePerChat) {
        const chatId = ctx.chatId || 'default_chat';
        return `${baseKey}__chat_${chatId}`;
    }
    return baseKey;
}

function getActiveCharacterName() {
    const ctx = getContext();
    const charId = ctx.characterId;
    if (charId !== undefined && ctx.characters?.[charId]) {
        return ctx.characters[charId].name || 'Персонаж';
    }
    return 'Персонаж';
}

function getActiveUserName() {
    const ctx = getContext();
    return ctx.name1 || 'Игрок';
}

function getDefaultCharAvatarUrl() {
    const ctx = getContext();
    const charId = ctx.characterId;
    if (charId !== undefined && ctx.characters?.[charId]?.avatar) {
        return `/characters/${encodeURIComponent(ctx.characters[charId].avatar)}`;
    }
    return '';
}

function findBestDonorProfileForBaseKey(s, baseKey) {
    let bestDonor = null;
    let bestScore = -1;

    for (const [k, prof] of Object.entries(s.characterProfiles)) {
        if (k === baseKey || k.startsWith(`${baseKey}__chat_`)) {
            if (!prof || !Array.isArray(prof.nodes)) continue;
            const npcCount = prof.nodes.filter(n => n.type === 'npc').length;
            const relCount = Array.isArray(prof.relationships) ? prof.relationships.length : 0;
            const memCount = (prof.relationships || []).reduce((acc, r) => acc + (r.memories?.length || 0), 0);
            const nonZeroAff = (prof.relationships || []).filter(r => Number(r.affection || 0) !== 0).length;
            const score = npcCount * 100 + relCount * 25 + memCount * 10 + nonZeroAff * 15;
            if (score > bestScore && score > 0) {
                bestScore = score;
                bestDonor = prof;
            }
        }
    }
    return bestDonor;
}

function getActiveProfile() {
    const s = getSettings();
    const baseKey = getBaseCharacterKey();
    const key = getActiveProfileKey();

    if (!s.characterProfiles[key]) {
        const donor = findBestDonorProfileForBaseKey(s, baseKey);
        if (donor) {
            s.characterProfiles[key] = safeClone(donor);
        } else {
            s.characterProfiles[key] = {
                storyDate: 'День 1',
                nodes: [],
                relationships: [],
            };
        }
    }

    const profile = s.characterProfiles[key];
    const currentNpcCount = (profile.nodes || []).filter(n => n.type === 'npc').length;
    const currentRelCount = (profile.relationships || []).length;
    if (currentNpcCount === 0 && currentRelCount <= 1) {
        const donor = findBestDonorProfileForBaseKey(s, baseKey);
        if (donor && donor !== profile) {
            const donorNpcCount = (donor.nodes || []).filter(n => n.type === 'npc').length;
            const donorRelCount = (donor.relationships || []).length;
            if (donorNpcCount > currentNpcCount || donorRelCount > currentRelCount) {
                s.characterProfiles[key] = safeClone(donor);
            }
        }
    }

    const activeProfile = s.characterProfiles[key];
    ensureCoreNodesAndPair(activeProfile);
    return activeProfile;
}

function ensureCoreNodesAndPair(profile) {
    if (!Array.isArray(profile.nodes)) profile.nodes = [];
    if (!Array.isArray(profile.relationships)) profile.relationships = [];
    if (!profile.storyDate) profile.storyDate = 'День 1';

    const charName = getActiveCharacterName();
    const userName = getActiveUserName();

    let charNode = profile.nodes.find(n => n.id === 'node_char');
    if (!charNode) {
        charNode = {
            id: 'node_char',
            name: charName,
            type: 'char',
            avatar: getDefaultCharAvatarUrl(),
            x: 195,
            y: 205,
        };
        profile.nodes.unshift(charNode);
    } else {
        charNode.name = charName;
        if (!charNode.avatar) charNode.avatar = getDefaultCharAvatarUrl();
    }

    let userNode = profile.nodes.find(n => n.id === 'node_user');
    if (!userNode) {
        userNode = {
            id: 'node_user',
            name: userName,
            type: 'user',
            avatar: '',
            x: 425,
            y: 205,
        };
        profile.nodes.push(userNode);
    } else {
        userNode.name = userName;
    }

    let coreRel = profile.relationships.find(
        r => (r.from === 'node_char' && r.to === 'node_user') || (r.from === 'node_user' && r.to === 'node_char'),
    );
    if (!coreRel) {
        coreRel = {
            id: 'rel_char_user',
            from: 'node_char',
            to: 'node_user',
            role: 'acquaintances',
            mutuality: 'none',
            affection: 0,
            lastStoryDate: profile.storyDate,
            lastReason: 'Начало истории',
            notes: '',
            memories: [],
        };
        profile.relationships.unshift(coreRel);
    } else if (!coreRel.mutuality) {
        const roleInfo = getRoleInfo(coreRel.role);
        coreRel.mutuality = roleInfo.defaultMutuality || 'none';
    }
}

function getAffectionTierLabel(score) {
    const val = Number(score) || 0;
    if (val <= -75) return 'Смертельная вражда (-75..-100%)';
    if (val <= -40) return 'Ненависть / Враждебность (-40..-74%)';
    if (val <= -15) return 'Неприязнь / Холод (-15..-39%)';
    if (val < 15) return 'Нейтралитет / Дистанция (-14..+14%)';
    if (val < 45) return 'Симпатия / Доверие (+15..+44%)';
    if (val < 75) return 'Глубокая привязанность (+45..+74%)';
    return 'Преданность / Любовь (+75..+100%)';
}

function buildRelationshipsPrompt() {
    const s = getSettings();
    if (!s.masterEnabled || !s.relEnabled) return '';

    const profile = getActiveProfile();
    if (!profile.relationships.length) return '';

    const nodeMap = Object.fromEntries(profile.nodes.map(n => [n.id, n.name]));
    const allNames = profile.nodes.map(n => n.name);

    const lines = [
        '[MANDATORY CHARACTER & NPC RELATIONSHIP NETWORK — STRICT CANON & EPISTEMIC ISOLATION]',
        `Current Story Date / Timeline: ${profile.storyDate || 'Day 1'}`,
        'ABSOLUTE DIRECTIVE: You MUST strictly portray the exact relationship statuses, affection scores (-100% to +100%), hierarchies, and romantic subtext listed below for every character and NPC. Never invent unestablished romance, never contradict who is dating whom, and never break interpersonal boundaries:',
    ];

    const secrecyRulesToEnforce = [];

    for (const rel of profile.relationships) {
        const nameA = nodeMap[rel.from] || rel.from;
        const nameB = nodeMap[rel.to] || rel.to;
        const roleObj = getRoleInfo(rel.role);
        const mutId = rel.mutuality || roleObj.defaultMutuality || 'none';
        const mutObj = getMutualityInfo(mutId, nameA, nameB);
        const score = Math.max(-100, Math.min(100, Number(rel.affection) || 0));
        const sign = score > 0 ? `+${score}%` : `${score}%`;

        let line = `- ${nameA} ↔ ${nameB}: Official/Public Status="${roleObj.label}" (${roleObj.prompt}) | Affection=${sign} (${getAffectionTierLabel(score)})`;
        if (mutId && mutId !== 'none') {
            line += ` | Romantic Subtext: "${mutObj.label}" (${mutObj.prompt})`;
        }
        if (rel.lastStoryDate) {
            line += ` | Updated: ${rel.lastStoryDate}`;
        }
        if (rel.notes && rel.notes.trim()) {
            line += ` | Dynamic/Notes: ${rel.notes.trim()}`;
        }
        lines.push(line);

        const thirdParties = allNames.filter(n => n !== nameA && n !== nameB);
        const thirdPartyList = thirdParties.length > 0
            ? `(${thirdParties.join(', ')} and any other NPCs)`
            : '(all other characters and NPCs)';

        if (mutId === 'one_way_a_to_b') {
            secrecyRulesToEnforce.push(
                `* SECRET UNREQUITED CRUSH (${nameA} → ${nameB}): ONLY ${nameA} knows about ${nameA}'s romantic feelings for ${nameB}. ${nameB} is completely UNAWARE of ${nameA}'s crush and treats ${nameA} strictly as "${roleObj.label}". Furthermore, ${thirdPartyList} have ZERO knowledge of ${nameA}'s secret feelings and must NEVER hint, tease, guess, or act omniscient about it.`,
            );
        } else if (mutId === 'one_way_b_to_a') {
            secrecyRulesToEnforce.push(
                `* SECRET UNREQUITED CRUSH (${nameB} → ${nameA}): ONLY ${nameB} knows about ${nameB}'s romantic feelings for ${nameA}. ${nameA} is completely UNAWARE of ${nameB}'s crush and treats ${nameB} strictly as "${roleObj.label}". Furthermore, ${thirdPartyList} have ZERO knowledge of ${nameB}'s secret feelings and must NEVER hint, tease, guess, or act omniscient about it.`,
            );
        } else if (mutId === 'mutual_secret') {
            secrecyRulesToEnforce.push(
                `* MUTUAL SECRET CRUSH (${nameA} ↔ ${nameB}): Both ${nameA} and ${nameB} are secretly in love with each other, but NEITHER knows that the other reciprocates! ${nameA} hides their feelings from ${nameB}, and ${nameB} hides their feelings from ${nameA}. Furthermore, ${thirdPartyList} have ZERO knowledge of their secret feelings and must NEVER act aware of it.`,
            );
        } else if (mutId === 'secret_relationship' || rel.role === 'secret_lovers') {
            secrecyRulesToEnforce.push(
                `* HIDDEN AFFAIR / SECRET RELATIONSHIP (${nameA} ↔ ${nameB}): ONLY ${nameA} and ${nameB} know about their secret romantic/intimate relationship. In front of ${thirdPartyList}, they strictly hide their romance and act like ordinary acquaintances/colleagues/friends. ${thirdPartyList} have ZERO knowledge of their secret bond and must NEVER suspect or mention it unless explicitly caught on-screen.`,
            );
        } else if (mutId === 'unspoken_tension') {
            secrecyRulesToEnforce.push(
                `* UNSPOKEN TENSION / DENIAL (${nameA} ↔ ${nameB}): Neither ${nameA} nor ${nameB} admits any romantic attraction out loud. ${thirdPartyList} only perceive their surface interaction ("${roleObj.label}") and do NOT know about any hidden spark.`,
            );
        }

        if (Array.isArray(rel.memories) && rel.memories.length > 0) {
            const recentMems = rel.memories.slice(-4);
            for (const m of recentMems) {
                lines.push(`   * Shared Memory [${m.date || profile.storyDate}]: ${m.text}`);
            }
        }
    }

    if (secrecyRulesToEnforce.length > 0) {
        lines.push(
            '',
            '[EPISTEMIC & SECRET KNOWLEDGE ISOLATION — ANTI-OMNISCIENCE LAW]',
            'CRITICAL: Characters do NOT share a hive mind and do NOT have access to this system prompt. You MUST enforce strict information isolation regarding secret or unrequited feelings:',
            ...secrecyRulesToEnforce,
        );
    }

    lines.push(
        '',
        'BEHAVIORAL ENFORCEMENT: Every dialogue line, internal thought, physical distance, form of address, and reaction of every character/NPC MUST strictly match their exact relationship status, affection percentage, and knowledge boundaries above.',
    );
    return lines.join('\n');
}

function buildStylePrompt() {
    const s = getSettings();
    if (!s.masterEnabled || !s.styleEnabled) return '';

    const cfg = s.styleConfig;
    const sl = cfg.sliders;
    const preset = GENRE_PRESETS[cfg.genrePreset] || GENRE_PRESETS.custom;
    const intensity = Number(cfg.intensity) || 4;

    const enforcementMap = {
        1: 'Subtle background flavor.',
        2: 'Noticeable stylistic guidance.',
        3: 'Strong narrative directive.',
        4: 'STRICT MANDATORY RULE: Prioritize these genre, author voice, and pacing constraints in every paragraph.',
        5: 'ABSOLUTE UNBREAKABLE LAW: Every single sentence, dialogue line, and scene transition MUST strictly obey the selected genres, author voice, and slider ratios below without exception.',
    };

    const lines = [
        `[MANDATORY NARRATIVE GENRE, AUTHOR VOICE & PACING DIRECTIVES — INTENSITY ${intensity}/5]`,
        `Enforcement Level: ${enforcementMap[intensity]}`,
    ];

    if (cfg.genrePreset && cfg.genrePreset !== 'custom') {
        lines.push(`Primary Genre Mode (${preset.label}): ${preset.prompt}`);
    }

    if (Array.isArray(cfg.activeTags) && cfg.activeTags.length > 0) {
        const tagPrompts = cfg.activeTags
            .map(tid => MULTI_GENRE_TAGS.find(t => t.id === tid))
            .filter(Boolean)
            .map(t => `${t.label}: ${t.prompt}`);
        if (tagPrompts.length > 0) {
            lines.push(`Active Genre Elements:\n- ${tagPrompts.join('\n- ')}`);
        }
    }

    if (cfg.customGenreNotes && cfg.customGenreNotes.trim()) {
        lines.push(`Custom Genre & Setting Directives: ${cfg.customGenreNotes.trim()}`);
    }

    if (cfg.authorVoice && cfg.authorVoice.trim()) {
        lines.push(
            `MANDATORY AUTHOR / PROSE STYLE: Write strictly in the literary voice, sentence rhythm, vocabulary, and atmosphere of: ${cfg.authorVoice.trim()}. Emulate their signature narrative technique naturally.`,
        );
    }

    const pacingDesc = sl.pacing <= 35
        ? 'SLOW & DELIBERATE: Lingering scenes, detailed micro-moments. Do not skip time or rush plot beats.'
        : (sl.pacing >= 70 ? 'FAST & DYNAMIC: brisk plot momentum, immediate consequences, high energy.' : 'BALANCED PACING: natural scene progression.');

    const romanceDesc = sl.romanceSpeed <= 35
        ? 'EXTREME SLOW-BURN: Guarded emotions, subtle tension, earned intimacy over a long time. Never rush confessions or physical leaps.'
        : (sl.romanceSpeed >= 70 ? 'PASSIONATE & DIRECT: bold romantic chemistry, rapid emotional and physical escalation.' : 'MODERATE ROMANCE DEVELOPMENT: organic romantic progression.');

    const dialogueDesc = sl.dialogueRatio >= 65
        ? 'DIALOGUE-DRIVEN SCENE: Focus heavily on spoken conversation, subtext, and back-and-forth exchanges.'
        : (sl.dialogueRatio <= 35 ? 'NARRATIVE & descriptive focus: rich action, atmosphere, and internal perception over long speeches.' : 'BALANCED mix of dialogue and narrative action.');

    const sensoryDesc = sl.sensoryDetail >= 65
        ? 'HIGH SENSORY IMMERSION: Include concrete textures, lighting, sounds, scents, temperature, and body language.'
        : (sl.sensoryDetail <= 35 ? 'CONCISE & SPARSE descriptions: focus purely on actions and essential plot.' : 'MODERATE sensory detail.');

    const emotionDesc = sl.emotionalDepth >= 65
        ? 'DEEP PSYCHOLOGICAL & EMOTIONAL RESONANCE: Explore unspoken feelings, internal contradictions, and emotional weight.'
        : 'ACTION-ORIENTED surface portrayal without heavy introspection.';

    lines.push(
        'Mandatory Pacing & Prose Sliders:',
        `- Scene Pacing (${sl.pacing}/100): ${pacingDesc}`,
        `- Romance & Intimacy Speed (${sl.romanceSpeed}/100): ${romanceDesc}`,
        `- Dialogue vs Narration (${sl.dialogueRatio}/100): ${dialogueDesc}`,
        `- Sensory & Atmospheric Detail (${sl.sensoryDetail}/100): ${sensoryDesc}`,
        `- Psychological & Emotional Depth (${sl.emotionalDepth}/100): ${emotionDesc}`,
    );

    return lines.join('\n');
}

function updateExtensionPrompts() {
    try {
        const s = getSettings();
        const depth = Number(s.injectionDepth) >= 0 ? Number(s.injectionDepth) : 1;

        const relPrompt = buildRelationshipsPrompt();
        const stylePrompt = buildStylePrompt();

        setExtensionPrompt(
            PROMPT_KEY_REL,
            relPrompt,
            extension_prompt_types.IN_CHAT,
            depth,
            false,
            0,
        );

        setExtensionPrompt(
            PROMPT_KEY_STYLE,
            stylePrompt,
            extension_prompt_types.IN_CHAT,
            depth,
            false,
            0,
        );
    } catch (err) {
        console.error(`[${MODULE_NAME}] updateExtensionPrompts error:`, err);
    }
}

window.bluemoonGenerateInterceptor = async function (chat, contextSize, abort, type) {
    try {
        const s = getSettings();
        if (!s.masterEnabled) return;
        updateExtensionPrompts();
    } catch (err) {
        console.error(`[${MODULE_NAME}] Interceptor error:`, err);
    }
};

function populateConnectionProfiles() {
    const ctx = getContext();
    const select = $('#bm2_connection_profile');
    if (!select.length) return;

    const currentVal = getSettings().connectionProfileId || '';
    select.empty();
    select.append('<option value="">🔄 Текущее активное подключение SillyTavern</option>');

    const profiles = ctx.extensionSettings?.connectionManager?.profiles || [];
    for (const p of profiles) {
        if (p && p.id && p.name) {
            const selected = p.id === currentVal ? 'selected' : '';
            select.append(`<option value="${escapeHtml(p.id)}" ${selected}>🔌 ${escapeHtml(p.name)}</option>`);
        }
    }
}

async function runModelRequest(systemPrompt, userPrompt) {
    const ctx = getContext();
    const s = getSettings();

    if (s.connectionProfileId && ctx.ConnectionManagerRequestService?.sendRequest) {
        try {
            const response = await ctx.ConnectionManagerRequestService.sendRequest(
                s.connectionProfileId,
                [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt },
                ],
                650,
                { extractData: true, includePreset: false, includeInstruct: false },
            );
            if (typeof response === 'string') return response;
            if (response?.content) return response.content;
        } catch (err) {
            console.warn(`[${MODULE_NAME}] ConnectionManager profile failed, falling back to generateRaw:`, err);
        }
    }

    if (typeof ctx.generateRaw === 'function') {
        const res = await ctx.generateRaw({
            systemPrompt,
            prompt: userPrompt,
            quietToLoud: false,
        });
        return typeof res === 'string' ? res : '';
    }

    throw new Error('No generation method available in SillyTavern context');
}

async function analyzeAllRelationshipsDelta(manualTrigger = false) {
    const s = getSettings();
    if (!s.masterEnabled || !s.relEnabled) return;
    if (!manualTrigger && !s.relAutoAnalyze) return;
    if (isAnalyzingRel) return;

    const ctx = getContext();
    const chat = ctx.chat || [];
    if (chat.length < 1) {
        if (manualTrigger) toastr.info('В чате пока нет сообщений для анализа.', 'BlueMoon');
        return;
    }

    const profile = getActiveProfile();
    if (!profile.relationships.length) return;

    const nodeMap = Object.fromEntries(profile.nodes.map(n => [n.id, n.name]));
    const recentMsgs = chat.slice(-4).map(m => `${m.name}: ${m.mes}`).join('\n---\n');

    const pairsSummary = profile.relationships.map(r => ({
        relId: r.id,
        pair: `${nodeMap[r.from] || r.from} <-> ${nodeMap[r.to] || r.to}`,
        currentRole: r.role,
        currentMutuality: r.mutuality || 'none',
        currentAffection: Number(r.affection) || 0,
    }));

    const validRoleIds = getAllRoles().map(r => r.id).join(', ');
    const validMutIds = CRUSH_MUTUALITY.map(m => m.id).join(', ');

    const sysPrompt = `You are an objective relationship & social network analyzer for an interactive story.
Analyze the latest scene and determine which character pairs (including NPCs!) interacted, were mentioned, or experienced a shift in relationship affection, status, romantic subtext/crush mutuality, or story timeline.
Current Story Date: "${profile.storyDate}"
Existing Relationship Pairs:
${JSON.stringify(pairsSummary, null, 2)}

Valid role IDs if a relationship status fundamentally changed: [${validRoleIds}]
Valid mutuality IDs for romantic subtext / secret or unrequited crush: [${validMutIds}]

Respond strictly with valid JSON only (no markdown fences):
{
  "storyDate": "<updated story date/day in Russian if time passed, or keep '${profile.storyDate}'>",
  "updates": [
    {
      "relId": "<exact relId from the list>",
      "delta": <integer from -15 to +15 representing affection change in this scene>,
      "reason": "<short explanation in Russian (max 10 words)>",
      "newMemory": "<if an important milestone happened between this pair, 1 short sentence in Russian, otherwise empty string>",
      "newRole": "<optional: new role ID ONLY if their status officially changed in this scene, otherwise empty string>",
      "newMutuality": "<optional: new mutuality ID if secret/unrequited/mutual crush changed, otherwise empty string>"
    }
  ]
}`;

    isAnalyzingRel = true;
    if (manualTrigger) {
        toastr.info('ИИ сканирует связи всех персонажей и NPC...', 'BlueMoon');
    }

    try {
        const raw = await runModelRequest(sysPrompt, `Latest scene messages:\n${recentMsgs}`);
        const match = raw.match(/\{[\s\S]*\}/);
        if (!match) {
            if (manualTrigger) toastr.warning('ИИ не вернул JSON анализа.', 'BlueMoon');
            return;
        }

        const parsed = JSON.parse(match[0]);
        if (parsed.storyDate && typeof parsed.storyDate === 'string' && parsed.storyDate.trim()) {
            profile.storyDate = parsed.storyDate.trim().slice(0, 40);
        }

        const updates = Array.isArray(parsed.updates) ? parsed.updates : [];
        let changedCount = 0;
        const summaryToasts = [];

        for (const u of updates) {
            const rel = profile.relationships.find(r => r.id === u.relId);
            if (!rel) continue;

            let delta = Number(u.delta) || 0;
            delta = Math.max(-15, Math.min(15, Math.round(delta)));

            const nameA = nodeMap[rel.from] || rel.from;
            const nameB = nodeMap[rel.to] || rel.to;
            let pairTouched = false;

            if (delta !== 0) {
                rel.affection = Math.max(-100, Math.min(100, (Number(rel.affection) || 0) + delta));
                pairTouched = true;
            }
            if (u.reason && typeof u.reason === 'string' && u.reason.trim()) {
                rel.lastReason = u.reason.trim();
                pairTouched = true;
            }
            if (u.newRole && getAllRoles().some(r => r.id === u.newRole) && u.newRole !== rel.role) {
                rel.role = u.newRole;
                pairTouched = true;
            }
            if (u.newMutuality && CRUSH_MUTUALITY.some(m => m.id === u.newMutuality)) {
                rel.mutuality = u.newMutuality;
                pairTouched = true;
            }
            if (u.newMemory && typeof u.newMemory === 'string' && u.newMemory.trim().length > 4) {
                if (!Array.isArray(rel.memories)) rel.memories = [];
                rel.memories.push({
                    date: profile.storyDate,
                    text: u.newMemory.trim().slice(0, 160),
                });
                pairTouched = true;
            }

            if (pairTouched) {
                rel.lastStoryDate = profile.storyDate;
                changedCount++;
                const sign = delta > 0 ? `+${delta}%` : `${delta}%`;
                summaryToasts.push(`${nameA} ↔ ${nameB}: ${sign} (${rel.lastReason || 'обновлено'})`);
            }
        }

        saveSettingsDebounced();
        updateExtensionPrompts();

        if ($('#bm2_overlay').hasClass('bm2_visible')) {
            renderRelationshipsTab();
            renderGraphCanvas();
        }

        if (changedCount > 0) {
            toastr.success(summaryToasts.slice(0, 3).join(' | '), `BlueMoon (${profile.storyDate})`);
        } else if (manualTrigger) {
            toastr.info('Значимых изменений в отношениях за последнюю сцену не обнаружено.', 'BlueMoon');
        }
    } catch (err) {
        console.error(`[${MODULE_NAME}] Auto relationship analysis error:`, err);
        if (manualTrigger) {
            toastr.error('Ошибка ИИ-анализа связей. Проверьте консоль.', 'BlueMoon');
        }
    } finally {
        isAnalyzingRel = false;
    }
}

function applyThemeToModal() {
    const s = getSettings();
    const t = s.activeTheme === 'custom'
        ? s.customTheme
        : (BUILTIN_THEMES[s.activeTheme] || BUILTIN_THEMES.bluemoon_midnight);

    const root = document.getElementById('bm2_overlay');
    if (!root) return;

    root.style.setProperty('--bm2-bg', t.bg);
    root.style.setProperty('--bm2-panel', t.panel);
    root.style.setProperty('--bm2-text', t.text);
    root.style.setProperty('--bm2-accent', t.accent);
    root.style.setProperty('--bm2-border', t.border);
    root.style.setProperty('--bm2-glow', t.glow || 'rgba(104, 162, 255, 0.24)');
}

function compressImageFileToDataUrl(file, maxSize = 160) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let w = img.width;
                let h = img.height;
                if (w > h) {
                    if (w > maxSize) {
                        h = Math.round((h * maxSize) / w);
                        w = maxSize;
                    }
                } else {
                    if (h > maxSize) {
                        w = Math.round((w * maxSize) / h);
                        h = maxSize;
                    }
                }
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, w, h);
                resolve(canvas.toDataURL('image/jpeg', 0.84));
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function exportRelationshipsToJson() {
    try {
        const s = getSettings();
        const profile = getActiveProfile();
        const charName = getActiveCharacterName().replace(/[^a-zA-Zа-яА-Я0-9_-]/g, '_');
        const payload = {
            bluemoon_version: '2.5.3',
            exportedAt: new Date().toISOString(),
            characterName: getActiveCharacterName(),
            customRoles: s.customRoles || [],
            profile: safeClone(profile),
        };

        const jsonStr = JSON.stringify(payload, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bluemoon_relations_${charName}_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toastr.success('Сеть отношений, NPC и свои статусы экспортированы в JSON!', 'BlueMoon');
    } catch (err) {
        console.error(`[${MODULE_NAME}] Export error:`, err);
        toastr.error('Не удалось экспортировать JSON.', 'BlueMoon');
    }
}

function importRelationshipsFromJson(file) {
    const reader = new FileReader();
    reader.onload = (ev) => {
        try {
            const data = JSON.parse(ev.target.result);
            const incoming = data.profile || data;
            if (!incoming || !Array.isArray(incoming.nodes) || !Array.isArray(incoming.relationships)) {
                toastr.error('Неверный формат файла: не найдены поля nodes и relationships.', 'BlueMoon');
                return;
            }

            const s = getSettings();
            if (Array.isArray(data.customRoles)) {
                for (const cr of data.customRoles) {
                    if (cr && cr.id && !s.customRoles.some(x => x.id === cr.id)) {
                        s.customRoles.push(cr);
                    }
                }
            }

            const key = getActiveProfileKey();
            const current = getActiveProfile();

            const replaceAll = confirm(
                'Нажмите «ОК», чтобы ПОЛНОСТЬЮ заменить текущие отношения и NPC данными из файла.\nНажмите «Отмена», чтобы ОБЪЕДИНИТЬ (добавить недостающих NPC и связи к текущим).',
            );

            if (replaceAll) {
                s.characterProfiles[key] = {
                    storyDate: incoming.storyDate || current.storyDate || 'День 1',
                    nodes: safeClone(incoming.nodes),
                    relationships: safeClone(incoming.relationships),
                };
            } else {
                if (incoming.storyDate) current.storyDate = incoming.storyDate;
                for (const n of incoming.nodes) {
                    if (!current.nodes.some(existing => existing.id === n.id || existing.name === n.name)) {
                        current.nodes.push(safeClone(n));
                    }
                }
                for (const r of incoming.relationships) {
                    const exists = current.relationships.some(
                        ex => (ex.from === r.from && ex.to === r.to) || (ex.from === r.to && ex.to === r.from),
                    );
                    if (!exists) {
                        current.relationships.push(safeClone(r));
                    }
                }
            }

            const updatedProfile = getActiveProfile();
            selectedRelId = updatedProfile.relationships[0]?.id || null;
            saveSettingsDebounced();
            updateExtensionPrompts();
            renderRelationshipsTab();
            renderGraphCanvas();
            toastr.success('Отношения и NPC успешно импортированы!', 'BlueMoon');
        } catch (err) {
            console.error(`[${MODULE_NAME}] Import JSON error:`, err);
            toastr.error('Ошибка чтения JSON файла.', 'BlueMoon');
        }
    };
    reader.readAsText(file);
}

function buildFallbackSettingsHtml() {
    return `
    <div class="bluemoon-v2-settings">
        <div class="inline-drawer">
            <div class="inline-drawer-toggle inline-drawer-header">
                <b>🌙 BlueMoon: Relationships, Graph & Style Engine</b>
                <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
            </div>
            <div class="inline-drawer-content">
                <div class="bm2_settings_block">
                    <label class="checkbox_label" for="bm2_master_enabled">
                        <input id="bm2_master_enabled" type="checkbox" />
                        <span>Включить расширение BlueMoon</span>
                    </label>
                    <label class="checkbox_label" for="bm2_rel_enabled">
                        <input id="bm2_rel_enabled" type="checkbox" />
                        <span>Инъекция сети отношений и воспоминаний в промпт</span>
                    </label>
                    <label class="checkbox_label" for="bm2_rel_auto_analyze">
                        <input id="bm2_rel_auto_analyze" type="checkbox" />
                        <span>Авто-анализ всех связей (Персонажи + NPC) после ответа ИИ</span>
                    </label>
                    <label class="checkbox_label" for="bm2_isolate_per_chat">
                        <input id="bm2_isolate_per_chat" type="checkbox" />
                        <span>Изолировать связи для каждого чата (если выкл — общие для всех веток персонажа)</span>
                    </label>
                    <label class="checkbox_label" for="bm2_style_enabled">
                        <input id="bm2_style_enabled" type="checkbox" />
                        <span>Строгая инъекция жанра, авторского слога и ползунков стиля</span>
                    </label>
                    <hr />
                    <div class="bm2_settings_row">
                        <label for="bm2_connection_profile">Профиль подключения для ИИ-анализа связей:</label>
                        <select id="bm2_connection_profile" class="text_pole">
                            <option value="">🔄 Текущее активное подключение SillyTavern</option>
                        </select>
                    </div>
                    <div class="bm2_settings_row">
                        <label for="bm2_injection_depth">Глубина инъекции в чат (Depth):</label>
                        <input id="bm2_injection_depth" type="number" class="text_pole" min="0" max="20" value="1" />
                    </div>
                    <hr />
                    <div class="bm2_settings_row">
                        <button id="bm2_open_modal_from_settings" class="menu_button interactable" type="button">
                            🌙 Открыть студию BlueMoon
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
}

function buildModalHtml() {
    return `
    <div id="bm2_overlay" class="bm2_overlay">
        <div class="bm2_modal">
            <div class="bm2_header">
                <div class="bm2_title_wrap">
                    <span class="bm2_moon_logo">🌙</span>
                    <div>
                        <h3 class="bm2_title">BlueMoon Studio</h3>
                        <span id="bm2_subtitle_char" class="bm2_subtitle">Отношения, Граф и Стиль</span>
                    </div>
                </div>
                <div class="bm2_header_actions">
                    <button id="bm2_preview_prompt_btn" class="bm2_icon_btn" title="Посмотреть активный системный промпт">👁️ Промпт</button>
                    <button id="bm2_close_btn" class="bm2_close_btn" title="Закрыть">✕</button>
                </div>
            </div>

            <div class="bm2_tabs">
                <button class="bm2_tab bm2_tab_active" data-tab="tab_rel">💞 Связи</button>
                <button class="bm2_tab" data-tab="tab_graph">🕸️ Древо</button>
                <button class="bm2_tab" data-tab="tab_style">🎚️ Стиль</button>
                <button class="bm2_tab" data-tab="tab_themes">🎨 Темы</button>
            </div>

            <div class="bm2_body">
                <!-- TAB 1: RELATIONSHIPS -->
                <div id="tab_rel" class="bm2_tab_pane bm2_pane_active">
                    <div class="bm2_top_strip">
                        <div class="bm2_date_box">
                            <span>📅 Дата сюжета:</span>
                            <input id="bm2_story_date_input" type="text" class="bm2_input bm2_date_input" placeholder="День 1 / 14 октября" />
                        </div>
                        <div class="bm2_top_actions">
                            <button id="bm2_ai_analyze_now" class="bm2_btn bm2_btn_accent">✨ ИИ-скан всех связей</button>
                            <button id="bm2_export_json_btn" class="bm2_btn" title="Скачать все связи и NPC в JSON">📥 Экспорт</button>
                            <button id="bm2_import_json_btn" class="bm2_btn" title="Загрузить связи и NPC из JSON">📤 Импорт</button>
                            <input id="bm2_import_file_input" type="file" accept=".json,application/json" style="display:none;" />
                        </div>
                    </div>

                    <!-- STRUCTURED DIRECTORY & PAIR SELECTOR -->
                    <div class="bm2_card">
                        <div class="bm2_dir_header_row">
                            <span class="bm2_label" style="margin:0;">🗂️ Навигатор связей</span>
                            <div class="bm2_dir_header_btns">
                                <button id="bm2_toggle_group_mode" class="bm2_mini_btn" title="Переключить группировку списка">📂 По разделам</button>
                                <button id="bm2_open_new_link_drawer" class="bm2_mini_btn bm2_mini_btn_accent">+ Добавить связь вручную</button>
                            </div>
                        </div>

                        <!-- Filter pills by character -->
                        <div id="bm2_char_filter_bar" class="bm2_filter_bar"></div>

                        <!-- Manual new link drawer (collapsible) -->
                        <div id="bm2_new_link_drawer" class="bm2_new_link_drawer" style="display:none;">
                            <div class="bm2_label">🔗 Создать новую связь между участниками</div>
                            <div class="bm2_grid_2">
                                <div>
                                    <label class="bm2_sublabel">Первый персонаж (Кто):</label>
                                    <select id="bm2_new_link_from" class="bm2_select"></select>
                                </div>
                                <div>
                                    <label class="bm2_sublabel">Второй персонаж (С кем):</label>
                                    <select id="bm2_new_link_to" class="bm2_select"></select>
                                </div>
                            </div>
                            <div class="bm2_grid_2" style="margin-top:6px;">
                                <div>
                                    <label class="bm2_sublabel">Начальный статус связи:</label>
                                    <select id="bm2_new_link_role" class="bm2_select"></select>
                                </div>
                                <div>
                                    <label class="bm2_sublabel">Подтип влюблённости / взаимность:</label>
                                    <select id="bm2_new_link_mutuality" class="bm2_select"></select>
                                </div>
                            </div>
                            <div class="bm2_row" style="margin-top:8px;">
                                <button id="bm2_confirm_new_link_btn" class="bm2_btn bm2_btn_accent" style="flex:1;">✅ Создать / Открыть связь</button>
                                <button id="bm2_cancel_new_link_btn" class="bm2_btn bm2_btn_small">Отмена</button>
                            </div>
                        </div>

                        <!-- Visual structured directory of connections -->
                        <div id="bm2_visual_directory" class="bm2_directory_box"></div>

                        <!-- Grouped dropdown + delete button -->
                        <div class="bm2_row" style="margin-top:8px;">
                            <select id="bm2_rel_selector" class="bm2_select"></select>
                            <button id="bm2_delete_rel_btn" class="bm2_btn bm2_btn_danger bm2_btn_small" title="Удалить выбранную связь">🗑️</button>
                        </div>

                        <!-- Pair Avatars & Photo upload -->
                        <div id="bm2_pair_avatars_row" class="bm2_pair_avatars_row"></div>
                        <input id="bm2_hidden_file_input" type="file" accept="image/*" style="display:none;" />

                        <!-- Status & Mutuality Editor -->
                        <div class="bm2_grid_2">
                            <div>
                                <div class="bm2_row_between">
                                    <label class="bm2_label">Основной статус связи</label>
                                    <button id="bm2_create_custom_role_btn" class="bm2_link_btn" title="Создать свой собственный статус">➕ Свой статус вручную</button>
                                </div>
                                <select id="bm2_rel_role" class="bm2_select"></select>
                            </div>
                            <div id="bm2_mutuality_box">
                                <label class="bm2_label">💘 Подтип влюблённости / симпатии</label>
                                <select id="bm2_rel_mutuality" class="bm2_select"></select>
                            </div>
                        </div>

                        <!-- Bipolar -100% to +100% Scale -->
                        <div class="bm2_meter_wrap">
                            <div class="bm2_meter_header">
                                <span id="bm2_meter_tier_text" class="bm2_meter_tier">Нейтралитет</span>
                                <span id="bm2_meter_value_badge" class="bm2_meter_badge">0%</span>
                            </div>
                            <div class="bm2_meter_bipolar_bar">
                                <div class="bm2_meter_center_tick"></div>
                                <div id="bm2_meter_fill_neg" class="bm2_meter_fill_neg"></div>
                                <div id="bm2_meter_fill_pos" class="bm2_meter_fill_pos"></div>
                            </div>
                            <div class="bm2_meter_scale_labels">
                                <span>-100% Вражда</span>
                                <span>0% Нейтрально</span>
                                <span>+100% Любовь</span>
                            </div>
                            <input id="bm2_rel_affection_slider" type="range" min="-100" max="100" step="1" class="bm2_range" />
                            <div id="bm2_rel_last_reason" class="bm2_last_reason"></div>
                        </div>

                        <label class="bm2_label">Нюансы динамики пары (инструкция для ИИ)</label>
                        <textarea id="bm2_rel_notes" class="bm2_textarea" rows="2" placeholder="Например: скрывают отношения от коллег; внешне спорят, но заботятся друг о друге..."></textarea>
                    </div>

                    <!-- Memories / Timeline Milestones -->
                    <div class="bm2_card">
                        <div class="bm2_card_header_row">
                            <span class="bm2_label">📜 Ключевые события и воспоминания пары</span>
                        </div>
                        <div id="bm2_memories_list" class="bm2_memories_list"></div>
                        <div class="bm2_row" style="margin-top:6px;">
                            <input id="bm2_new_memory_date" type="text" class="bm2_input" style="max-width:110px;" placeholder="Дата/День" />
                            <input id="bm2_new_memory_text" type="text" class="bm2_input" placeholder="Что произошло между ними..." />
                            <button id="bm2_add_memory_btn" class="bm2_btn bm2_btn_accent bm2_btn_small">+ Записать</button>
                        </div>
                    </div>

                    <!-- Add NPC or Custom Pair -->
                    <div class="bm2_card">
                        <span class="bm2_label">➕ Добавить нового участника (NPC) в мир</span>
                        <div class="bm2_row" style="margin-top:6px;">
                            <input id="bm2_new_npc_name" type="text" class="bm2_input" placeholder="Имя NPC (например, Виктор)" />
                            <select id="bm2_new_npc_target" class="bm2_select"></select>
                            <button id="bm2_add_npc_btn" class="bm2_btn bm2_btn_accent bm2_btn_small">+ Добавить NPC</button>
                        </div>
                    </div>
                </div>

                <!-- TAB 2: OBSIDIAN GRAPH -->
                <div id="tab_graph" class="bm2_tab_pane">
                    <div class="bm2_graph_toolbar">
                        <span class="bm2_graph_hint">💡 Перетаскивайте круги пальцем. Нажмите на узел или линию, чтобы открыть связь.</span>
                        <div class="bm2_graph_toolbar_btns">
                            <button id="bm2_graph_arrange_btn" class="bm2_btn bm2_btn_small">🫧 Распределить</button>
                            <button id="bm2_graph_add_link_btn" class="bm2_btn bm2_btn_small">+ Связать узлы</button>
                        </div>
                    </div>
                    <div id="bm2_graph_wrap" class="bm2_graph_canvas_wrap">
                        <canvas id="bm2_graph_canvas"></canvas>
                    </div>
                    <div id="bm2_graph_legend" class="bm2_graph_legend"></div>
                </div>

                <!-- TAB 3: STYLE, GENRE & SLIDERS -->
                <div id="tab_style" class="bm2_tab_pane">
                    <div class="bm2_card">
                        <div class="bm2_grid_2">
                            <div>
                                <label class="bm2_label">🎭 Основной жанровый пресет</label>
                                <select id="bm2_genre_preset" class="bm2_select"></select>
                            </div>
                            <div>
                                <label class="bm2_label">🔥 Сила соблюдения стиля: <span id="bm2_intensity_val">4 / 5 (Строго)</span></label>
                                <input id="bm2_style_intensity" type="range" min="1" max="5" step="1" class="bm2_range" />
                            </div>
                        </div>

                        <label class="bm2_label" style="margin-top:8px;">🧩 Комбинатор поджанров и акцентов (можно выбрать несколько)</label>
                        <div id="bm2_genre_tags_wrap" class="bm2_tags_wrap"></div>

                        <div class="bm2_grid_2" style="margin-top:8px;">
                            <div>
                                <label class="bm2_label">✍️ Авторский слог / Писатель</label>
                                <input id="bm2_author_voice" type="text" class="bm2_input" placeholder="Рэй Брэдбери, Донна Тартт, Нил Гейман..." />
                            </div>
                            <div>
                                <label class="bm2_label">📝 Свои жанровые пожелания</label>
                                <input id="bm2_custom_genre_notes" type="text" class="bm2_input" placeholder="Больше мрачной готики и живых диалогов..." />
                            </div>
                        </div>
                    </div>

                    <div class="bm2_card">
                        <span class="bm2_label">🎚️ Ползунки темпа и атмосферы повествования</span>

                        <div class="bm2_slider_row">
                            <div class="bm2_slider_head">
                                <span>⏳ Темп сюжета (Слоубёрн ↔ Динамика)</span>
                                <span id="bm2_val_pacing" class="bm2_slider_val">35%</span>
                            </div>
                            <input id="bm2_sl_pacing" type="range" min="0" max="100" class="bm2_range" />
                        </div>

                        <div class="bm2_slider_row">
                            <div class="bm2_slider_head">
                                <span>💘 Скорость сближения и романтики</span>
                                <span id="bm2_val_romanceSpeed" class="bm2_slider_val">25%</span>
                            </div>
                            <input id="bm2_sl_romanceSpeed" type="range" min="0" max="100" class="bm2_range" />
                        </div>

                        <div class="bm2_slider_row">
                            <div class="bm2_slider_head">
                                <span>💬 Баланс: Описания ↔ Диалоги</span>
                                <span id="bm2_val_dialogueRatio" class="bm2_slider_val">55%</span>
                            </div>
                            <input id="bm2_sl_dialogueRatio" type="range" min="0" max="100" class="bm2_range" />
                        </div>

                        <div class="bm2_slider_row">
                            <div class="bm2_slider_head">
                                <span>🌿 Детализация чувств, запахов и окружения</span>
                                <span id="bm2_val_sensoryDetail" class="bm2_slider_val">70%</span>
                            </div>
                            <input id="bm2_sl_sensoryDetail" type="range" min="0" max="100" class="bm2_range" />
                        </div>

                        <div class="bm2_slider_row">
                            <div class="bm2_slider_head">
                                <span>🧠 Психологизм и глубина эмоций</span>
                                <span id="bm2_val_emotionalDepth" class="bm2_slider_val">75%</span>
                            </div>
                            <input id="bm2_sl_emotionalDepth" type="range" min="0" max="100" class="bm2_range" />
                        </div>
                    </div>
                </div>

                <!-- TAB 4: THEMES -->
                <div id="tab_themes" class="bm2_tab_pane">
                    <div class="bm2_card">
                        <span class="bm2_label">🎨 Коллекция дизайнерских тем BlueMoon (16 оформлений)</span>
                        <div id="bm2_theme_gallery" class="bm2_theme_gallery"></div>
                    </div>
                    <div class="bm2_card">
                        <span class="bm2_label">🛠️ Своя палитра (Кастомная тема)</span>
                        <div class="bm2_color_grid">
                            <label>Фон окна <input type="color" id="bm2_col_bg" /></label>
                            <label>Карточки <input type="color" id="bm2_col_panel" /></label>
                            <label>Текст <input type="color" id="bm2_col_text" /></label>
                            <label>Акцент <input type="color" id="bm2_col_accent" /></label>
                            <label>Границы <input type="color" id="bm2_col_border" /></label>
                        </div>
                        <button id="bm2_apply_custom_theme" class="bm2_btn bm2_btn_accent" style="margin-top:10px;">Применить свою палитру</button>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
}

function buildGroupedRoleOptionsHtml(selectedRoleId) {
    const allRoles = getAllRoles();
    let html = '';

    for (const cat of Object.values(ROLE_CATEGORIES)) {
        const rolesInCat = allRoles.filter(r => (r.category || 'other') === cat.id);
        if (!rolesInCat.length) continue;
        html += `<optgroup label="${escapeHtml(cat.label)}">`;
        for (const r of rolesInCat) {
            const sel = r.id === selectedRoleId ? 'selected' : '';
            html += `<option value="${escapeHtml(r.id)}" ${sel}>${escapeHtml(r.label)}</option>`;
        }
        html += `</optgroup>`;
    }
    return html;
}

function buildMutualityOptionsHtml(selectedMutualityId, nameA = 'Персонаж А', nameB = 'Персонаж Б') {
    const activeId = selectedMutualityId || 'none';
    return CRUSH_MUTUALITY.map(m => {
        const formatted = getMutualityInfo(m.id, nameA, nameB);
        const sel = formatted.id === activeId ? 'selected' : '';
        return `<option value="${escapeHtml(formatted.id)}" ${sel}>${escapeHtml(formatted.label)}</option>`;
    }).join('');
}

function getFilteredRelationships(profile, filterNodeId) {
    if (!filterNodeId || filterNodeId === 'ALL') {
        return profile.relationships;
    }
    return profile.relationships.filter(r => r.from === filterNodeId || r.to === filterNodeId);
}

function buildGroupedRelationshipSelectHtml(profile, filteredRels, activeRelId, groupMode) {
    const nodeMap = Object.fromEntries(profile.nodes.map(n => [n.id, n.name]));
    let html = '';

    if (groupMode === 'character') {
        for (const node of profile.nodes) {
            const relsForNode = filteredRels.filter(r => r.from === node.id || r.to === node.id);
            if (!relsForNode.length) continue;
            html += `<optgroup label="👤 Связи: ${escapeHtml(node.name)} (${relsForNode.length})">`;
            for (const rel of relsForNode) {
                const nameA = nodeMap[rel.from] || rel.from;
                const nameB = nodeMap[rel.to] || rel.to;
                const roleObj = getRoleInfo(rel.role);
                const mutObj = getMutualityInfo(rel.mutuality || 'none', nameA, nameB);
                const mutSuffix = mutObj.shortTag ? ` [${mutObj.shortTag}]` : '';
                const score = Number(rel.affection) || 0;
                const sign = score > 0 ? `+${score}%` : `${score}%`;
                const sel = rel.id === activeRelId ? 'selected' : '';
                html += `<option value="${escapeHtml(rel.id)}" ${sel}>${escapeHtml(nameA)} ↔ ${escapeHtml(nameB)} — ${escapeHtml(roleObj.label)}${escapeHtml(mutSuffix)} (${sign})</option>`;
            }
            html += `</optgroup>`;
        }
    } else {
        for (const cat of Object.values(ROLE_CATEGORIES)) {
            const relsInCat = filteredRels.filter(r => {
                const roleObj = getRoleInfo(r.role);
                return (roleObj.category || 'other') === cat.id;
            });
            if (!relsInCat.length) continue;
            html += `<optgroup label="${escapeHtml(cat.label)} (${relsInCat.length})">`;
            for (const rel of relsInCat) {
                const nameA = nodeMap[rel.from] || rel.from;
                const nameB = nodeMap[rel.to] || rel.to;
                const roleObj = getRoleInfo(rel.role);
                const mutObj = getMutualityInfo(rel.mutuality || 'none', nameA, nameB);
                const mutSuffix = mutObj.shortTag ? ` [${mutObj.shortTag}]` : '';
                const score = Number(rel.affection) || 0;
                const sign = score > 0 ? `+${score}%` : `${score}%`;
                const sel = rel.id === activeRelId ? 'selected' : '';
                html += `<option value="${escapeHtml(rel.id)}" ${sel}>${escapeHtml(nameA)} ↔ ${escapeHtml(nameB)} — ${escapeHtml(roleObj.label)}${escapeHtml(mutSuffix)} (${sign})</option>`;
            }
            html += `</optgroup>`;
        }
    }

    return html;
}

function buildVisualDirectoryHtml(profile, filteredRels, activeRelId, groupMode) {
    const nodeMap = Object.fromEntries(profile.nodes.map(n => [n.id, n.name]));
    if (!filteredRels.length) {
        return '<div class="bm2_empty_note">Нет связей для выбранного фильтра. Нажмите «+ Добавить связь вручную».</div>';
    }

    let html = '';

    const renderRelPill = (rel) => {
        const nameA = nodeMap[rel.from] || rel.from;
        const nameB = nodeMap[rel.to] || rel.to;
        const roleObj = getRoleInfo(rel.role);
        const mutObj = getMutualityInfo(rel.mutuality || 'none', nameA, nameB);
        const score = Number(rel.affection) || 0;
        const sign = score > 0 ? `+${score}%` : `${score}%`;
        const isActive = rel.id === activeRelId ? 'bm2_dir_item_active' : '';
        const scoreColor = score > 10 ? '#38d399' : (score < -10 ? '#ff4d6d' : '#94a3b8');
        const mutBadgeHtml = mutObj.shortTag
            ? `<span class="bm2_dir_item_role" style="color:#ff85a1;border-color:rgba(255,107,157,0.45);">${escapeHtml(mutObj.shortTag)}</span>`
            : '';

        return `
        <div class="bm2_dir_item ${isActive}" data-rel-id="${escapeHtml(rel.id)}">
            <div class="bm2_dir_item_main">
                <span class="bm2_dir_item_pair">${escapeHtml(nameA)} ↔ ${escapeHtml(nameB)}</span>
                <span class="bm2_dir_item_role" style="color:${roleObj.color};border-color:${roleObj.color}55;">${escapeHtml(roleObj.shortLabel || roleObj.label)}</span>
                ${mutBadgeHtml}
            </div>
            <span class="bm2_dir_item_score" style="color:${scoreColor};">${sign}</span>
        </div>`;
    };

    if (groupMode === 'character') {
        for (const node of profile.nodes) {
            const relsForNode = filteredRels.filter(r => r.from === node.id || r.to === node.id);
            if (!relsForNode.length) continue;
            const icon = node.type === 'char' ? '🎭' : (node.type === 'user' ? '👤' : '🧩');
            html += `
            <div class="bm2_dir_section">
                <div class="bm2_dir_sec_title">${icon} ${escapeHtml(node.name)} <span class="bm2_dir_count">${relsForNode.length}</span></div>
                <div class="bm2_dir_items_grid">
                    ${relsForNode.map(renderRelPill).join('')}
                </div>
            </div>`;
        }
    } else {
        for (const cat of Object.values(ROLE_CATEGORIES)) {
            const relsInCat = filteredRels.filter(r => {
                const roleObj = getRoleInfo(r.role);
                return (roleObj.category || 'other') === cat.id;
            });
            if (!relsInCat.length) continue;
            html += `
            <div class="bm2_dir_section">
                <div class="bm2_dir_sec_title">${escapeHtml(cat.label)} <span class="bm2_dir_count">${relsInCat.length}</span></div>
                <div class="bm2_dir_items_grid">
                    ${relsInCat.map(renderRelPill).join('')}
                </div>
            </div>`;
        }
    }

    return html;
}

function refreshNewLinkDrawerMutualityOptions() {
    const profile = getActiveProfile();
    const nodeMap = Object.fromEntries(profile.nodes.map(n => [n.id, n.name]));
    const fromId = String($('#bm2_new_link_from').val() || '');
    const toId = String($('#bm2_new_link_to').val() || '');
    const nameA = nodeMap[fromId] || 'Персонаж А';
    const nameB = nodeMap[toId] || 'Персонаж Б';
    const currentMut = String($('#bm2_new_link_mutuality').val() || 'none');
    $('#bm2_new_link_mutuality').html(buildMutualityOptionsHtml(currentMut, nameA, nameB));
}

function renderRelationshipsTab() {
    const s = getSettings();
    const profile = getActiveProfile();
    const nodeMap = Object.fromEntries(profile.nodes.map(n => [n.id, n]));

    $('#bm2_subtitle_char').text(`${getActiveCharacterName()} & ${getActiveUserName()} • ${profile.storyDate}`);
    $('#bm2_story_date_input').val(profile.storyDate || 'День 1');

    if (s.uiFilterNodeId !== 'ALL' && !nodeMap[s.uiFilterNodeId]) {
        s.uiFilterNodeId = 'ALL';
    }

    $('#bm2_toggle_group_mode').text(
        s.uiGroupMode === 'character' ? '👤 По персонажам' : '📂 По разделам',
    );

    const filterBar = $('#bm2_char_filter_bar');
    filterBar.empty();
    const allCount = profile.relationships.length;
    filterBar.append(`
        <button class="bm2_filter_chip ${s.uiFilterNodeId === 'ALL' ? 'bm2_filter_chip_active' : ''}" data-node-id="ALL">
            Все связи (${allCount})
        </button>
    `);
    for (const n of profile.nodes) {
        const count = profile.relationships.filter(r => r.from === n.id || r.to === n.id).length;
        const activeCls = s.uiFilterNodeId === n.id ? 'bm2_filter_chip_active' : '';
        filterBar.append(`
            <button class="bm2_filter_chip ${activeCls}" data-node-id="${escapeHtml(n.id)}">
                ${escapeHtml(n.name)} (${count})
            </button>
        `);
    }

    const filteredRels = getFilteredRelationships(profile, s.uiFilterNodeId);

    if (!selectedRelId || !filteredRels.some(r => r.id === selectedRelId)) {
        selectedRelId = filteredRels[0]?.id || profile.relationships[0]?.id || null;
    }

    $('#bm2_visual_directory').html(
        buildVisualDirectoryHtml(profile, filteredRels, selectedRelId, s.uiGroupMode),
    );

    const sel = $('#bm2_rel_selector');
    sel.html(buildGroupedRelationshipSelectHtml(profile, filteredRels, selectedRelId, s.uiGroupMode));

    const activeRel = profile.relationships.find(r => r.id === selectedRelId);
    const activeRoleId = activeRel ? activeRel.role : 'acquaintances';
    $('#bm2_rel_role').html(buildGroupedRoleOptionsHtml(activeRoleId));
    $('#bm2_new_link_role').html(buildGroupedRoleOptionsHtml('acquaintances'));

    const targetSel = $('#bm2_new_npc_target');
    const fromSel = $('#bm2_new_link_from');
    const toSel = $('#bm2_new_link_to');
    targetSel.empty();
    fromSel.empty();
    toSel.empty();

    for (const n of profile.nodes) {
        const optHtml = `<option value="${escapeHtml(n.id)}">${escapeHtml(n.name)}</option>`;
        targetSel.append(`<option value="${escapeHtml(n.id)}">Связать с: ${escapeHtml(n.name)}</option>`);
        fromSel.append(optHtml);
        toSel.append(optHtml);
    }
    if (profile.nodes.length >= 2) {
        toSel.val(profile.nodes[1].id);
    }
    refreshNewLinkDrawerMutualityOptions();

    if (!activeRel) return;

    const nodeA = nodeMap[activeRel.from] || { id: activeRel.from, name: activeRel.from, avatar: '' };
    const nodeB = nodeMap[activeRel.to] || { id: activeRel.to, name: activeRel.to, avatar: '' };
    const roleObj = getRoleInfo(activeRel.role);

    $('#bm2_mutuality_box').show();
    const currentMutId = activeRel.mutuality || roleObj.defaultMutuality || 'none';
    const mutSelect = $('#bm2_rel_mutuality');
    mutSelect.html(buildMutualityOptionsHtml(currentMutId, nodeA.name, nodeB.name));

    const mutObj = getMutualityInfo(currentMutId, nodeA.name, nodeB.name);
    const mutCenterBadge = mutObj.shortTag
        ? `<div style="font-size:11px;color:#ff85a1;margin-top:2px;font-weight:600;">${escapeHtml(mutObj.shortTag)}</div>`
        : '';

    const renderAvatarCard = (node) => {
        const initials = (node.name || '?').slice(0, 2).toUpperCase();
        const imgHtml = node.avatar
            ? `<img src="${escapeHtml(node.avatar)}" class="bm2_avatar_img" alt="${escapeHtml(node.name)}" />`
            : `<div class="bm2_avatar_fallback">${escapeHtml(initials)}</div>`;
        return `
        <div class="bm2_avatar_card" data-node-id="${escapeHtml(node.id)}">
            <div class="bm2_avatar_circle_wrap">
                ${imgHtml}
                <button class="bm2_avatar_upload_btn" data-node-id="${escapeHtml(node.id)}" title="Загрузить фото с телефона">📷</button>
                <button class="bm2_avatar_url_btn" data-node-id="${escapeHtml(node.id)}" title="Вставить ссылку URL на картинку">🔗</button>
            </div>
            <span class="bm2_avatar_name">${escapeHtml(node.name)}</span>
        </div>`;
    };

    $('#bm2_pair_avatars_row').html(`
        ${renderAvatarCard(nodeA)}
        <div class="bm2_pair_center_badge">
            <span class="bm2_pair_role_pill" style="border-color:${roleObj.color};color:${roleObj.color};">${escapeHtml(roleObj.label)}</span>
            ${mutCenterBadge}
        </div>
        ${renderAvatarCard(nodeB)}
    `);

    updateBipolarMeterUI(activeRel.affection);

    const reasonText = activeRel.lastReason
        ? `Последнее изменение (${activeRel.lastStoryDate || profile.storyDate}): ${activeRel.lastReason}`
        : '';
    $('#bm2_rel_last_reason').text(reasonText);
    $('#bm2_rel_notes').val(activeRel.notes || '');
    $('#bm2_new_memory_date').val(profile.storyDate || 'День 1');

    const memWrap = $('#bm2_memories_list');
    memWrap.empty();
    if (!Array.isArray(activeRel.memories) || activeRel.memories.length === 0) {
        memWrap.append('<div class="bm2_empty_note">Пока нет записанных событий. ИИ будет добавлять их автоматически или запишите важное событие вручную.</div>');
    } else {
        activeRel.memories.forEach((m, idx) => {
            memWrap.append(`
                <div class="bm2_memory_item">
                    <span class="bm2_memory_date">${escapeHtml(m.date || profile.storyDate)}</span>
                    <span class="bm2_memory_text">${escapeHtml(m.text)}</span>
                    <button class="bm2_memory_del" data-idx="${idx}" title="Удалить">✕</button>
                </div>
            `);
        });
    }
}

function updateBipolarMeterUI(scoreVal) {
    const score = Math.max(-100, Math.min(100, Number(scoreVal) || 0));
    const sign = score > 0 ? `+${score}%` : `${score}%`;

    $('#bm2_rel_affection_slider').val(score);
    $('#bm2_meter_value_badge').text(sign);
    $('#bm2_meter_tier_text').text(getAffectionTierLabel(score));

    const negFill = $('#bm2_meter_fill_neg');
    const posFill = $('#bm2_meter_fill_pos');

    if (score < 0) {
        const pct = Math.min(50, Math.abs(score) / 2);
        negFill.css({ width: `${pct}%` });
        posFill.css({ width: '0%' });
        $('#bm2_meter_value_badge').css('color', '#ff4d6d');
    } else if (score > 0) {
        const pct = Math.min(50, score / 2);
        posFill.css({ width: `${pct}%` });
        negFill.css({ width: '0%' });
        $('#bm2_meter_value_badge').css('color', '#38d399');
    } else {
        negFill.css({ width: '0%' });
        posFill.css({ width: '0%' });
        $('#bm2_meter_value_badge').css('color', '#a5b4fc');
    }
}

const avatarImageCache = {};

function getCachedNodeImage(url, onLoaded) {
    if (!url) return null;
    if (avatarImageCache[url]) {
        return avatarImageCache[url].complete ? avatarImageCache[url] : null;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
        if (typeof onLoaded === 'function') onLoaded();
    };
    img.src = url;
    avatarImageCache[url] = img;
    return null;
}

function syncCanvasResolution() {
    const canvas = document.getElementById('bm2_graph_canvas');
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const cssWidth = Math.max(280, Math.floor(rect.width || 340));
    const cssHeight = Math.max(320, Math.floor(rect.height || 400));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const targetW = Math.floor(cssWidth * dpr);
    const targetH = Math.floor(cssHeight * dpr);

    if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
    }

    return { canvas, cssWidth, cssHeight, dpr };
}

function autoArrangeNodesInCircle() {
    const profile = getActiveProfile();
    const info = syncCanvasResolution();
    const W = info ? info.cssWidth : 340;
    const H = info ? info.cssHeight : 400;

    const cx = W / 2;
    const cy = H / 2;
    const radius = Math.max(85, Math.min(W, H) * 0.35);
    const count = profile.nodes.length;

    profile.nodes.forEach((node, idx) => {
        if (count === 1) {
            node.x = cx;
            node.y = cy;
        } else if (count === 2) {
            node.x = idx === 0 ? cx - radius * 0.85 : cx + radius * 0.85;
            node.y = cy;
        } else {
            const angle = -Math.PI / 2 + (idx * 2 * Math.PI) / count;
            node.x = Math.round(cx + radius * Math.cos(angle));
            node.y = Math.round(cy + radius * Math.sin(angle));
        }
    });

    saveSettingsDebounced();
    renderGraphCanvas();
}

function renderGraphCanvas() {
    const info = syncCanvasResolution();
    if (!info) return;

    const { canvas, cssWidth: W, cssHeight: H, dpr } = info;
    const ctx = canvas.getContext('2d');
    const profile = getActiveProfile();

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    const nodeRadius = W < 420 ? 22 : 26;
    const pad = nodeRadius + 16;

    profile.nodes.forEach((n, idx) => {
        if (typeof n.x !== 'number' || typeof n.y !== 'number' || isNaN(n.x) || isNaN(n.y)) {
            const angle = (idx / Math.max(1, profile.nodes.length)) * Math.PI * 2;
            n.x = W / 2 + Math.cos(angle) * (Math.min(W, H) * 0.32);
            n.y = H / 2 + Math.sin(angle) * (Math.min(W, H) * 0.32);
        }
        n.x = Math.max(pad, Math.min(W - pad, n.x));
        n.y = Math.max(pad, Math.min(H - pad - 10, n.y));
    });

    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    const step = 36;
    for (let x = step; x < W; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
    }
    for (let y = step; y < H; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
    }

    const nodeMap = Object.fromEntries(profile.nodes.map(n => [n.id, n]));

    profile.relationships.forEach((rel, relIdx) => {
        const a = nodeMap[rel.from];
        const b = nodeMap[rel.to];
        if (!a || !b) return;

        const roleObj = getRoleInfo(rel.role);
        const isSelected = rel.id === selectedRelId;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = roleObj.color || '#68a2ff';
        ctx.lineWidth = isSelected ? 3.2 : 2;
        if (isSelected) {
            ctx.shadowColor = roleObj.color || '#68a2ff';
            ctx.shadowBlur = 10;
        }
        ctx.stroke();
        ctx.restore();

        const t = relIdx % 3 === 0 ? 0.5 : (relIdx % 3 === 1 ? 0.41 : 0.59);
        const mx = a.x + (b.x - a.x) * t;
        const my = a.y + (b.y - a.y) * t;

        const score = Number(rel.affection) || 0;
        const sign = score > 0 ? `+${score}%` : `${score}%`;
        const shortRole = roleObj.shortLabel || roleObj.label.slice(0, 11);
        const mutId = rel.mutuality || 'none';
        const mutHeart = mutId !== 'none' ? '💘' : '';
        const label = `${shortRole}${mutHeart} ${sign}`;

        ctx.font = '600 10px sans-serif';
        const textW = ctx.measureText(label).width + 10;
        const boxH = 17;

        ctx.fillStyle = isSelected ? 'rgba(20, 29, 53, 0.96)' : 'rgba(11, 15, 28, 0.88)';
        ctx.strokeStyle = roleObj.color || '#68a2ff';
        ctx.lineWidth = isSelected ? 1.5 : 1;
        ctx.beginPath();
        ctx.roundRect(mx - textW / 2, my - boxH / 2, textW, boxH, 5);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#f1f5f9';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, mx, my);
    });

    for (const node of profile.nodes) {
        const r = nodeRadius;
        ctx.save();

        const ringColor = node.type === 'char' ? '#ff6b9d' : (node.type === 'user' ? '#68a2ff' : '#38d399');
        ctx.shadowColor = ringColor;
        ctx.shadowBlur = 12;

        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx.fillStyle = '#17203a';
        ctx.fill();
        ctx.lineWidth = 2.6;
        ctx.strokeStyle = ringColor;
        ctx.stroke();
        ctx.restore();

        const img = getCachedNodeImage(node.avatar, () => renderGraphCanvas());
        if (img) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(node.x, node.y, r - 2, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(img, node.x - r, node.y - r, r * 2, r * 2);
            ctx.restore();
        } else {
            ctx.fillStyle = '#e6edf8';
            ctx.font = 'bold 12px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText((node.name || '?').slice(0, 2).toUpperCase(), node.x, node.y);
        }

        const displayName = (node.name || '').length > 14 ? `${node.name.slice(0, 12)}…` : node.name;
        ctx.font = '600 11px sans-serif';
        const nameW = ctx.measureText(displayName).width + 8;
        const nameY = node.y + r + 11;

        ctx.fillStyle = 'rgba(10, 14, 26, 0.82)';
        ctx.beginPath();
        ctx.roundRect(node.x - nameW / 2, nameY - 7, nameW, 15, 4);
        ctx.fill();

        ctx.fillStyle = '#e6edf8';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(displayName, node.x, nameY);
    }

    ctx.restore();

    const usedRoleIds = [...new Set(profile.relationships.map(r => r.role))];
    const legendHtml = usedRoleIds.map(rid => {
        const r = getRoleInfo(rid);
        return `<span class="bm2_legend_item"><i style="background:${r.color}"></i>${escapeHtml(r.label)}</span>`;
    }).join('');
    $('#bm2_graph_legend').html(legendHtml);
}

function renderStyleTab() {
    const s = getSettings();
    const cfg = s.styleConfig;

    const presetSel = $('#bm2_genre_preset');
    presetSel.empty();
    for (const [k, v] of Object.entries(GENRE_PRESETS)) {
        const selected = k === cfg.genrePreset ? 'selected' : '';
        presetSel.append(`<option value="${escapeHtml(k)}" ${selected}>${escapeHtml(v.label)}</option>`);
    }

    const intensityLabels = {
        1: '1 / 5 (Мягкий намёк)',
        2: '2 / 5 (Умеренно)',
        3: '3 / 5 (Заметно)',
        4: '4 / 5 (Строго)',
        5: '5 / 5 (Абсолютный закон)',
    };
    const intVal = Number(cfg.intensity) || 4;
    $('#bm2_style_intensity').val(intVal);
    $('#bm2_intensity_val').text(intensityLabels[intVal]);

    const tagsWrap = $('#bm2_genre_tags_wrap');
    tagsWrap.empty();
    for (const tag of MULTI_GENRE_TAGS) {
        const active = cfg.activeTags.includes(tag.id) ? 'bm2_tag_active' : '';
        tagsWrap.append(`<button type="button" class="bm2_tag_chip ${active}" data-tag="${escapeHtml(tag.id)}">${escapeHtml(tag.label)}</button>`);
    }

    $('#bm2_author_voice').val(cfg.authorVoice || '');
    $('#bm2_custom_genre_notes').val(cfg.customGenreNotes || '');

    for (const [key, val] of Object.entries(cfg.sliders)) {
        $(`#bm2_sl_${key}`).val(val);
        $(`#bm2_val_${key}`).text(`${val}%`);
    }
}

function renderThemesTab() {
    const s = getSettings();
    const gal = $('#bm2_theme_gallery');
    gal.empty();

    for (const [id, t] of Object.entries(BUILTIN_THEMES)) {
        const active = s.activeTheme === id ? 'bm2_theme_card_active' : '';
        gal.append(`
            <div class="bm2_theme_card ${active}" data-theme="${escapeHtml(id)}" style="background:${t.panel};border-color:${t.border};color:${t.text};box-shadow: 0 4px 14px ${t.glow || 'rgba(0,0,0,0.2)'};">
                <div class="bm2_theme_swatches">
                    <span style="background:${t.bg}"></span>
                    <span style="background:${t.accent};box-shadow: 0 0 8px ${t.accent};"></span>
                    <span style="background:${t.text}"></span>
                </div>
                <div class="bm2_theme_card_title">${escapeHtml(t.name)}</div>
                <div class="bm2_theme_card_desc">${escapeHtml(t.desc || '')}</div>
            </div>
        `);
    }

    const ct = s.customTheme;
    $('#bm2_col_bg').val(ct.bg);
    $('#bm2_col_panel').val(ct.panel);
    $('#bm2_col_text').val(ct.text);
    $('#bm2_col_accent').val(ct.accent);
    $('#bm2_col_border').val(ct.border);
}

function ensureModalInDom() {
    if (!$('#bm2_overlay').length) {
        $('body').append(buildModalHtml());
    }
    if (!modalEventsBound) {
        bindModalEvents();
        modalEventsBound = true;
    }
}

function openBlueMoonModal() {
    try {
        ensureModalInDom();
        applyThemeToModal();
        try {
            renderRelationshipsTab();
        } catch (err) {
            console.error(`[${MODULE_NAME}] renderRelationshipsTab error:`, err);
        }
        try {
            renderStyleTab();
        } catch (err) {
            console.error(`[${MODULE_NAME}] renderStyleTab error:`, err);
        }
        try {
            renderThemesTab();
        } catch (err) {
            console.error(`[${MODULE_NAME}] renderThemesTab error:`, err);
        }
        $('#bm2_overlay').addClass('bm2_visible');
        if (activeModalTab === 'tab_graph') {
            setTimeout(() => renderGraphCanvas(), 30);
        }
    } catch (err) {
        console.error(`[${MODULE_NAME}] openBlueMoonModal fatal error:`, err);
        toastr.error('Ошибка открытия окна BlueMoon. Проверьте консоль браузера.', 'BlueMoon');
    }
}

function closeBlueMoonModal() {
    $('#bm2_overlay').removeClass('bm2_visible');
}

function bindModalEvents() {
    let uploadTargetNodeId = null;

    // Global delegated handler for Wand Menu Item & Settings Open Button
    $(document).on('click', '#bm2_wand_menu_item', function (e) {
        e.preventDefault();
        e.stopPropagation();
        $('#extensionsMenu').hide();
        openBlueMoonModal();
    });

    $(document).on('click', '#bm2_open_modal_from_settings', function (e) {
        e.preventDefault();
        openBlueMoonModal();
    });

    $(document).on('click', '#bm2_close_btn', closeBlueMoonModal);
    $(document).on('click', '#bm2_overlay', function (e) {
        if (e.target.id === 'bm2_overlay') closeBlueMoonModal();
    });

    $(document).on('click', '#bm2_preview_prompt_btn', function () {
        updateExtensionPrompts();
        const relP = buildRelationshipsPrompt() || '(Модуль отношений выключен)';
        const styleP = buildStylePrompt() || '(Модуль стиля выключен)';
        const full = `${relP}\n\n${styleP}`;
        alert(`АКТИВНЫЙ СИСТЕМНЫЙ ПРОМПТ BLUEMOON (инъекция в чат):\n\n${full}`);
    });

    $(document).on('click', '.bm2_tab', function () {
        const tab = $(this).data('tab');
        activeModalTab = tab;
        $('.bm2_tab').removeClass('bm2_tab_active');
        $(this).addClass('bm2_tab_active');
        $('.bm2_tab_pane').removeClass('bm2_pane_active');
        $(`#${tab}`).addClass('bm2_pane_active');
        if (tab === 'tab_graph') {
            setTimeout(() => renderGraphCanvas(), 25);
        }
    });

    $(document).on('change', '#bm2_story_date_input', function () {
        const profile = getActiveProfile();
        profile.storyDate = String($(this).val() || 'День 1').trim();
        saveSettingsDebounced();
        updateExtensionPrompts();
        renderRelationshipsTab();
    });

    $(document).on('click', '#bm2_ai_analyze_now', function () {
        analyzeAllRelationshipsDelta(true);
    });

    $(document).on('click', '#bm2_export_json_btn', function () {
        exportRelationshipsToJson();
    });

    $(document).on('click', '#bm2_import_json_btn', function () {
        $('#bm2_import_file_input').val('').trigger('click');
    });

    $(document).on('change', '#bm2_import_file_input', function (e) {
        const file = e.target.files?.[0];
        if (!file) return;
        importRelationshipsFromJson(file);
    });

    $(document).on('click', '#bm2_toggle_group_mode', function () {
        const s = getSettings();
        s.uiGroupMode = s.uiGroupMode === 'character' ? 'category' : 'character';
        saveSettingsDebounced();
        renderRelationshipsTab();
    });

    $(document).on('click', '.bm2_filter_chip', function () {
        const s = getSettings();
        s.uiFilterNodeId = String($(this).data('node-id') || 'ALL');
        saveSettingsDebounced();
        renderRelationshipsTab();
    });

    $(document).on('click', '.bm2_dir_item', function () {
        selectedRelId = String($(this).data('rel-id'));
        renderRelationshipsTab();
    });

    $(document).on('click', '#bm2_open_new_link_drawer', function () {
        $('#bm2_new_link_drawer').slideToggle(160);
    });

    $(document).on('click', '#bm2_cancel_new_link_btn', function () {
        $('#bm2_new_link_drawer').slideUp(160);
    });

    $(document).on('change', '#bm2_new_link_from, #bm2_new_link_to', function () {
        refreshNewLinkDrawerMutualityOptions();
    });

    $(document).on('click', '#bm2_confirm_new_link_btn', function () {
        const profile = getActiveProfile();
        const fromId = String($('#bm2_new_link_from').val() || '');
        const toId = String($('#bm2_new_link_to').val() || '');
        const roleId = String($('#bm2_new_link_role').val() || 'acquaintances');
        const mutId = String($('#bm2_new_link_mutuality').val() || 'none');

        if (!fromId || !toId) return;
        if (fromId === toId) {
            toastr.warning('Выберите двух разных персонажей для создания связи.', 'BlueMoon');
            return;
        }

        const existing = profile.relationships.find(
            r => (r.from === fromId && r.to === toId) || (r.from === toId && r.to === fromId),
        );

        const s = getSettings();
        s.uiFilterNodeId = 'ALL';

        if (existing) {
            existing.role = roleId;
            existing.mutuality = mutId;
            selectedRelId = existing.id;
            toastr.info('Связь между этими персонажами уже существовала — статус и подтип обновлены.', 'BlueMoon');
        } else {
            const newRelId = `rel_${Date.now()}`;
            profile.relationships.push({
                id: newRelId,
                from: fromId,
                to: toId,
                role: roleId,
                mutuality: mutId,
                affection: 0,
                lastStoryDate: profile.storyDate,
                lastReason: 'Связь добавлена вручную',
                notes: '',
                memories: [],
            });
            selectedRelId = newRelId;
            toastr.success('Новая связь успешно создана!', 'BlueMoon');
        }

        $('#bm2_new_link_drawer').slideUp(160);
        saveSettingsDebounced();
        updateExtensionPrompts();
        renderRelationshipsTab();
        renderGraphCanvas();
    });

    $(document).on('click', '#bm2_create_custom_role_btn', function () {
        const labelInput = prompt(
            'Введите название своего статуса связи (можно со смайликом в начале):\nНапример: 🩸 Кровные враги / 👑 Господин и слуга / 🕵️ Тайные сообщники',
            '🎭 Тайные сообщники',
        );
        if (!labelInput || !labelInput.trim()) return;

        const cleanLabel = labelInput.trim().slice(0, 42);
        const promptInput = prompt(
            'Краткое описание этой роли для нейросети (на русском или английском):',
            cleanLabel,
        );

        const catChoice = prompt(
            'В какой раздел поместить статус?\n1 — 💘 Романтика\n2 — 🧬 Семья\n3 — 🤝 Дружба\n4 — 🏢 Учёба, работа и быт\n5 — ⚔️ Конфликт\n6 — 🎭 Прочее и свои статусы',
            '6',
        );
        const catMap = { '1': 'romance', '2': 'family', '3': 'friendship', '4': 'social', '5': 'conflict', '6': 'other' };
        const category = catMap[String(catChoice || '6').trim()] || 'other';

        const colorMap = {
            romance: '#ff6b9d',
            family: '#c084fc',
            friendship: '#4ea8de',
            social: '#64dfdf',
            conflict: '#ff4d6d',
            other: '#eab308',
        };

        const customRole = {
            id: `custom_${Date.now()}`,
            category,
            label: cleanLabel,
            shortLabel: cleanLabel.slice(0, 14),
            color: colorMap[category] || '#68a2ff',
            hasMutuality: true,
            defaultMutuality: 'none',
            prompt: (promptInput && promptInput.trim()) ? promptInput.trim() : cleanLabel,
            isCustom: true,
        };

        const s = getSettings();
        s.customRoles.push(customRole);

        const profile = getActiveProfile();
        const rel = profile.relationships.find(r => r.id === selectedRelId);
        if (rel) {
            rel.role = customRole.id;
        }

        saveSettingsDebounced();
        updateExtensionPrompts();
        renderRelationshipsTab();
        renderGraphCanvas();
        toastr.success(`Статус «${cleanLabel}» создан и применён!`, 'BlueMoon');
    });

    $(document).on('change', '#bm2_rel_selector', function () {
        selectedRelId = String($(this).val());
        renderRelationshipsTab();
    });

    $(document).on('click', '#bm2_delete_rel_btn', function () {
        const profile = getActiveProfile();
        if (profile.relationships.length <= 1) {
            toastr.warning('Нельзя удалить единственную базовую связь.', 'BlueMoon');
            return;
        }
        profile.relationships = profile.relationships.filter(r => r.id !== selectedRelId);
        selectedRelId = profile.relationships[0]?.id || null;
        saveSettingsDebounced();
        updateExtensionPrompts();
        renderRelationshipsTab();
    });

    $(document).on('change', '#bm2_rel_role', function () {
        const profile = getActiveProfile();
        const rel = profile.relationships.find(r => r.id === selectedRelId);
        if (!rel) return;
        const newRoleId = String($(this).val());
        rel.role = newRoleId;

        const roleObj = getRoleInfo(newRoleId);
        if ((!rel.mutuality || rel.mutuality === 'none') && roleObj.defaultMutuality && roleObj.defaultMutuality !== 'none') {
            rel.mutuality = roleObj.defaultMutuality;
        }

        saveSettingsDebounced();
        updateExtensionPrompts();
        renderRelationshipsTab();
    });

    $(document).on('change', '#bm2_rel_mutuality', function () {
        const profile = getActiveProfile();
        const rel = profile.relationships.find(r => r.id === selectedRelId);
        if (!rel) return;
        rel.mutuality = String($(this).val() || 'none');
        saveSettingsDebounced();
        updateExtensionPrompts();
        renderRelationshipsTab();
    });

    $(document).on('input', '#bm2_rel_affection_slider', function () {
        const val = Number($(this).val()) || 0;
        updateBipolarMeterUI(val);
    });

    $(document).on('change', '#bm2_rel_affection_slider', function () {
        const profile = getActiveProfile();
        const rel = profile.relationships.find(r => r.id === selectedRelId);
        if (!rel) return;
        rel.affection = Number($(this).val()) || 0;
        saveSettingsDebounced();
        updateExtensionPrompts();
        renderRelationshipsTab();
    });

    $(document).on('change', '#bm2_rel_notes', function () {
        const profile = getActiveProfile();
        const rel = profile.relationships.find(r => r.id === selectedRelId);
        if (!rel) return;
        rel.notes = String($(this).val() || '');
        saveSettingsDebounced();
        updateExtensionPrompts();
    });

    $(document).on('click', '#bm2_add_memory_btn', function () {
        const profile = getActiveProfile();
        const rel = profile.relationships.find(r => r.id === selectedRelId);
        if (!rel) return;

        const dateStr = String($('#bm2_new_memory_date').val() || profile.storyDate).trim();
        const textStr = String($('#bm2_new_memory_text').val() || '').trim();
        if (!textStr) return;

        if (!Array.isArray(rel.memories)) rel.memories = [];
        rel.memories.push({ date: dateStr, text: textStr });
        $('#bm2_new_memory_text').val('');
        saveSettingsDebounced();
        updateExtensionPrompts();
        renderRelationshipsTab();
    });

    $(document).on('click', '.bm2_memory_del', function () {
        const idx = Number($(this).data('idx'));
        const profile = getActiveProfile();
        const rel = profile.relationships.find(r => r.id === selectedRelId);
        if (!rel || !Array.isArray(rel.memories)) return;
        rel.memories.splice(idx, 1);
        saveSettingsDebounced();
        updateExtensionPrompts();
        renderRelationshipsTab();
    });

    $(document).on('click', '.bm2_avatar_upload_btn', function (e) {
        e.stopPropagation();
        uploadTargetNodeId = String($(this).data('node-id'));
        $('#bm2_hidden_file_input').val('').trigger('click');
    });

    $(document).on('change', '#bm2_hidden_file_input', async function (e) {
        const file = e.target.files?.[0];
        if (!file || !uploadTargetNodeId) return;
        try {
            const dataUrl = await compressImageFileToDataUrl(file, 160);
            const profile = getActiveProfile();
            const node = profile.nodes.find(n => n.id === uploadTargetNodeId);
            if (node) {
                node.avatar = dataUrl;
                delete avatarImageCache[dataUrl];
                saveSettingsDebounced();
                renderRelationshipsTab();
                renderGraphCanvas();
                toastr.success(`Аватар для ${node.name} обновлён!`, 'BlueMoon');
            }
        } catch (err) {
            console.error(`[${MODULE_NAME}] Image upload failed:`, err);
            toastr.error('Не удалось обработать изображение.', 'BlueMoon');
        }
    });

    $(document).on('click', '.bm2_avatar_url_btn', function (e) {
        e.stopPropagation();
        const nodeId = String($(this).data('node-id'));
        const profile = getActiveProfile();
        const node = profile.nodes.find(n => n.id === nodeId);
        if (!node) return;

        const url = prompt(`Вставьте прямую ссылку (URL) на аватар для «${node.name}» (или оставьте пустым для сброса):`, node.avatar || '');
        if (url === null) return;
        node.avatar = url.trim();
        saveSettingsDebounced();
        renderRelationshipsTab();
        renderGraphCanvas();
    });

    $(document).on('click', '#bm2_add_npc_btn', function () {
        const name = String($('#bm2_new_npc_name').val() || '').trim();
        const targetId = String($('#bm2_new_npc_target').val() || 'node_char');
        if (!name) {
            toastr.warning('Введите имя нового персонажа/NPC.', 'BlueMoon');
            return;
        }

        const profile = getActiveProfile();
        let npcNode = profile.nodes.find(n => n.name.toLowerCase() === name.toLowerCase());
        if (!npcNode) {
            npcNode = {
                id: `node_npc_${Date.now()}`,
                name,
                type: 'npc',
                avatar: '',
                x: 160 + Math.floor(Math.random() * 140),
                y: 120 + Math.floor(Math.random() * 160),
            };
            profile.nodes.push(npcNode);
        }

        const existsRel = profile.relationships.find(
            r => (r.from === npcNode.id && r.to === targetId) || (r.from === targetId && r.to === npcNode.id),
        );
        if (!existsRel && npcNode.id !== targetId) {
            const newRel = {
                id: `rel_${Date.now()}`,
                from: npcNode.id,
                to: targetId,
                role: 'acquaintances',
                mutuality: 'none',
                affection: 0,
                lastStoryDate: profile.storyDate,
                lastReason: 'Добавлен в историю',
                notes: '',
                memories: [],
            };
            profile.relationships.push(newRel);
            selectedRelId = newRel.id;
        }

        $('#bm2_new_npc_name').val('');
        saveSettingsDebounced();
        updateExtensionPrompts();
        renderRelationshipsTab();
        toastr.success(`Участник «${name}» добавлен в сеть связей!`, 'BlueMoon');
    });

    $(document).on('click', '#bm2_graph_arrange_btn', function () {
        autoArrangeNodesInCircle();
        toastr.info('Узлы равномерно распределены по кругу.', 'BlueMoon');
    });

    $(document).on('click', '#bm2_graph_add_link_btn', function () {
        activeModalTab = 'tab_rel';
        $('.bm2_tab').removeClass('bm2_tab_active');
        $('.bm2_tab[data-tab="tab_rel"]').addClass('bm2_tab_active');
        $('.bm2_tab_pane').removeClass('bm2_pane_active');
        $('#tab_rel').addClass('bm2_pane_active');
        renderRelationshipsTab();
        $('#bm2_new_link_drawer').slideDown(160);
    });

    let dragStartX = 0;
    let dragStartY = 0;
    let movedDuringTouch = false;

    function getCanvasCoords(e) {
        const canvas = document.getElementById('bm2_graph_canvas');
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top,
        };
    }

    $(document).on('mousedown touchstart', '#bm2_graph_canvas', function (e) {
        const pos = getCanvasCoords(e.originalEvent || e);
        const profile = getActiveProfile();
        movedDuringTouch = false;
        dragStartX = pos.x;
        dragStartY = pos.y;

        for (const n of profile.nodes) {
            const dist = Math.hypot(pos.x - n.x, pos.y - n.y);
            if (dist <= 30) {
                graphDragNodeId = n.id;
                e.preventDefault();
                return;
            }
        }

        const nodeMap = Object.fromEntries(profile.nodes.map(n => [n.id, n]));
        profile.relationships.forEach((rel, relIdx) => {
            const a = nodeMap[rel.from];
            const b = nodeMap[rel.to];
            if (!a || !b) return;
            const t = relIdx % 3 === 0 ? 0.5 : (relIdx % 3 === 1 ? 0.41 : 0.59);
            const mx = a.x + (b.x - a.x) * t;
            const my = a.y + (b.y - a.y) * t;
            if (Math.hypot(pos.x - mx, pos.y - my) <= 30) {
                selectedRelId = rel.id;
                renderGraphCanvas();
                renderRelationshipsTab();
            }
        });
    });

    $(document).on('mousemove touchmove', '#bm2_graph_canvas', function (e) {
        if (!graphDragNodeId) return;
        const pos = getCanvasCoords(e.originalEvent || e);
        if (Math.hypot(pos.x - dragStartX, pos.y - dragStartY) > 6) {
            movedDuringTouch = true;
        }
        const profile = getActiveProfile();
        const node = profile.nodes.find(n => n.id === graphDragNodeId);
        if (node) {
            const canvas = document.getElementById('bm2_graph_canvas');
            const rect = canvas.getBoundingClientRect();
            node.x = Math.max(28, Math.min(rect.width - 28, pos.x));
            node.y = Math.max(28, Math.min(rect.height - 34, pos.y));
            renderGraphCanvas();
        }
        e.preventDefault();
    });

    $(document).on('mouseup touchend', '#bm2_graph_canvas', function () {
        if (graphDragNodeId) {
            const tappedNodeId = graphDragNodeId;
            graphDragNodeId = null;
            saveSettingsDebounced();

            if (!movedDuringTouch) {
                const s = getSettings();
                s.uiFilterNodeId = tappedNodeId;
                const profile = getActiveProfile();
                const rel = profile.relationships.find(r => r.from === tappedNodeId || r.to === tappedNodeId);
                if (rel) {
                    selectedRelId = rel.id;
                    activeModalTab = 'tab_rel';
                    $('.bm2_tab').removeClass('bm2_tab_active');
                    $('.bm2_tab[data-tab="tab_rel"]').addClass('bm2_tab_active');
                    $('.bm2_tab_pane').removeClass('bm2_pane_active');
                    $('#tab_rel').addClass('bm2_pane_active');
                    renderRelationshipsTab();
                }
            }
        }
    });

    $(document).on('change', '#bm2_genre_preset', function () {
        const s = getSettings();
        s.styleConfig.genrePreset = String($(this).val());
        saveSettingsDebounced();
        updateExtensionPrompts();
    });

    $(document).on('input change', '#bm2_style_intensity', function () {
        const s = getSettings();
        const val = Number($(this).val()) || 4;
        s.styleConfig.intensity = val;
        const intensityLabels = {
            1: '1 / 5 (Мягкий намёк)',
            2: '2 / 5 (Умеренно)',
            3: '3 / 5 (Заметно)',
            4: '4 / 5 (Строго)',
            5: '5 / 5 (Абсолютный закон)',
        };
        $('#bm2_intensity_val').text(intensityLabels[val]);
        saveSettingsDebounced();
        updateExtensionPrompts();
    });

    $(document).on('click', '.bm2_tag_chip', function () {
        const tagId = String($(this).data('tag'));
        const s = getSettings();
        const idx = s.styleConfig.activeTags.indexOf(tagId);
        if (idx >= 0) {
            s.styleConfig.activeTags.splice(idx, 1);
        } else {
            s.styleConfig.activeTags.push(tagId);
        }
        saveSettingsDebounced();
        updateExtensionPrompts();
        renderStyleTab();
    });

    $(document).on('change', '#bm2_author_voice, #bm2_custom_genre_notes', function () {
        const s = getSettings();
        s.styleConfig.authorVoice = String($('#bm2_author_voice').val() || '').trim();
        s.styleConfig.customGenreNotes = String($('#bm2_custom_genre_notes').val() || '').trim();
        saveSettingsDebounced();
        updateExtensionPrompts();
    });

    $(document).on('input change', '[id^="bm2_sl_"]', function () {
        const key = this.id.replace('bm2_sl_', '');
        const val = Number($(this).val()) || 0;
        const s = getSettings();
        s.styleConfig.sliders[key] = val;
        $(`#bm2_val_${key}`).text(`${val}%`);
        saveSettingsDebounced();
        updateExtensionPrompts();
    });

    $(document).on('click', '.bm2_theme_card', function () {
        const themeId = String($(this).data('theme'));
        const s = getSettings();
        s.activeTheme = themeId;
        saveSettingsDebounced();
        applyThemeToModal();
        renderThemesTab();
    });

    $(document).on('click', '#bm2_apply_custom_theme', function () {
        const s = getSettings();
        s.customTheme = {
            bg: $('#bm2_col_bg').val(),
            panel: $('#bm2_col_panel').val(),
            text: $('#bm2_col_text').val(),
            accent: $('#bm2_col_accent').val(),
            border: $('#bm2_col_border').val(),
            glow: 'rgba(104, 162, 255, 0.25)',
        };
        s.activeTheme = 'custom';
        saveSettingsDebounced();
        applyThemeToModal();
        renderThemesTab();
        toastr.success('Своя палитра применена!', 'BlueMoon');
    });

    const wrapEl = document.getElementById('bm2_graph_wrap');
    if (wrapEl && typeof ResizeObserver !== 'undefined' && !graphCanvasResizeObserver) {
        graphCanvasResizeObserver = new ResizeObserver(() => {
            if (activeModalTab === 'tab_graph' && $('#bm2_overlay').hasClass('bm2_visible')) {
                renderGraphCanvas();
            }
        });
        graphCanvasResizeObserver.observe(wrapEl);
    }
}

function bindSettingsPanelEvents() {
    const s = getSettings();

    $('#bm2_master_enabled').prop('checked', s.masterEnabled).off('change').on('change', function () {
        s.masterEnabled = $(this).is(':checked');
        saveSettingsDebounced();
        updateExtensionPrompts();
    });

    $('#bm2_rel_enabled').prop('checked', s.relEnabled).off('change').on('change', function () {
        s.relEnabled = $(this).is(':checked');
        saveSettingsDebounced();
        updateExtensionPrompts();
    });

    $('#bm2_rel_auto_analyze').prop('checked', s.relAutoAnalyze).off('change').on('change', function () {
        s.relAutoAnalyze = $(this).is(':checked');
        saveSettingsDebounced();
    });

    $('#bm2_isolate_per_chat').prop('checked', s.isolatePerChat).off('change').on('change', function () {
        s.isolatePerChat = $(this).is(':checked');
        saveSettingsDebounced();
        updateExtensionPrompts();
    });

    $('#bm2_style_enabled').prop('checked', s.styleEnabled).off('change').on('change', function () {
        s.styleEnabled = $(this).is(':checked');
        saveSettingsDebounced();
        updateExtensionPrompts();
    });

    $('#bm2_injection_depth').val(s.injectionDepth).off('change').on('change', function () {
        s.injectionDepth = Number($(this).val()) || 1;
        saveSettingsDebounced();
        updateExtensionPrompts();
    });

    populateConnectionProfiles();
    $('#bm2_connection_profile').off('change').on('change', function () {
        s.connectionProfileId = String($(this).val() || '');
        saveSettingsDebounced();
    });
}

function injectWandMenuButton() {
    const extMenu = $('#extensionsMenu');
    if (!extMenu.length) return;
    if ($('#bm2_wand_menu_item').length) return;

    const itemHtml = `
        <div id="bm2_wand_menu_item" class="list-group-item flex-container flexGap5 interactable" title="Открыть BlueMoon: Отношения, Граф и Стиль">
            <div class="fa-solid fa-moon extensionsMenuExtensionButton"></div>
            <span>BlueMoon: Отношения и Стиль</span>
        </div>
    `;
    extMenu.append(itemHtml);
}

function escapeHtml(str) {
    return String(str ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

async function init() {
    if (isInitialized) return;
    isInitialized = true;

    try {
        getSettings();

        // 1. Immediately mount modal and bind events (never blocked by network calls)
        ensureModalInDom();
        injectWandMenuButton();

        // Keep checking wand menu in case SillyTavern re-renders #extensionsMenu later
        setInterval(injectWandMenuButton, 2500);

        // 2. Mount settings panel in Extensions tab (with built-in fallback if settings.html fails)
        if (!$('.bluemoon-v2-settings').length) {
            let settingsHtml = '';
            try {
                const moduleUrl = new URL('./settings.html', import.meta.url).href;
                settingsHtml = await $.get(moduleUrl);
            } catch (_) {
                settingsHtml = buildFallbackSettingsHtml();
            }
            if (!settingsHtml || !settingsHtml.trim()) {
                settingsHtml = buildFallbackSettingsHtml();
            }
            const targetContainer = $('#extensions_settings2').length
                ? $('#extensions_settings2')
                : $('#extensions_settings');
            targetContainer.append(settingsHtml);
            bindSettingsPanelEvents();
        }

        updateExtensionPrompts();

        eventSource.on(event_types.CHAT_CHANGED, () => {
            selectedRelId = null;
            injectWandMenuButton();
            updateExtensionPrompts();
            if ($('#bm2_overlay').hasClass('bm2_visible')) {
                renderRelationshipsTab();
                renderGraphCanvas();
            }
        });

        eventSource.on(event_types.MESSAGE_RECEIVED, () => {
            setTimeout(() => {
                analyzeAllRelationshipsDelta(false);
            }, 600);
        });

        console.log(`[${MODULE_NAME}] BlueMoon v2.5.3 initialized successfully.`);
    } catch (err) {
        console.error(`[${MODULE_NAME}] Initialization failed:`, err);
    }
}

// Run immediately on jQuery ready AND hook APP_READY as backup
jQuery(() => {
    init();
});
if (eventSource && event_types?.APP_READY) {
    eventSource.on(event_types.APP_READY, init);
        }
