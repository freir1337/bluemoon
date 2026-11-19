/**
 * BlueMoon v2.5.4: Relationships, Obsidian Graph & Narrative Style Engine
 * - Direct click/touch binding on #bm2_wand_menu_item so other extensions cannot block event bubbling
 * - Instant modal display with inline !important before any data rendering
 * - Defensive sanitization for existing saved profiles & settings
 * - Always-available romantic/crush mutuality & secrecy subtypes across all 25+ relationship statuses
 * - Epistemic Isolation & Anti-Omniscience prompt firewall for secret/unrequited feelings
 */

const MODULE_NAME = 'bluemoon';
const PROMPT_KEY_REL = 'bluemoon_relationships_prompt';
const PROMPT_KEY_STYLE = 'bluemoon_style_prompt';

function safeClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

const DEFAULT_SETTINGS = {
    enabled: true,
    relEnabled: true,
    relAutoAnalyze: true,
    isolatePerChat: false,
    styleEnabled: true,
    connectionProfileId: '',
    injectionDepth: 1,
    activeTheme: 'moonlight',
    relFilterActor: 'ALL',
    relGroupMode: 'category',
    styleConfig: {
        genres: ['dark_romance', 'psychological'],
        customGenre: '',
        genreIntensity: 'strict',
        authorVoice: '',
        sliders: {
            action: 45,
            description: 70,
            dialogue: 65,
            pacing: 45,
        },
        customDirectives: '',
    },
    profiles: {},
};

const THEMES = [
    { id: 'moonlight', name: 'Лунное серебро', desc: 'Глубокий космос и холодный голубой неон', colors: ['#0b1021', '#141c36', '#7aa2f7'] },
    { id: 'crimson_velvet', name: 'Алый бархат', desc: 'Тёмная готика, бордовый шёлк и рубин', colors: ['#18090f', '#29101a', '#f7768e'] },
    { id: 'emerald_forest', name: 'Изумрудный туман', desc: 'Таинственный лес и мятное свечение', colors: ['#081715', '#102824', '#73daca'] },
    { id: 'obsidian_gold', name: 'Обсидиан и золото', desc: 'Чёрный оникс и тёплое королевское золото', colors: ['#12100e', '#1f1b17', '#e0af68'] },
    { id: 'amethyst_haze', name: 'Аметистовая дымка', desc: 'Сумеречный фиолет и лавандовый кристалл', colors: ['#130d21', '#211738', '#bb9af7'] },
    { id: 'cyber_neon', name: 'Киберпанк Неон', desc: 'Ночной мегаполис, маджента и циан', colors: ['#070714', '#12122b', '#ff007c'] },
    { id: 'sakura_night', name: 'Ночная сакура', desc: 'Тёмный индиго и нежные лепестки вишни', colors: ['#160f1c', '#261a30', '#ff9db8'] },
    { id: 'ocean_abyss', name: 'Океанская бездна', desc: 'Марианская впадина и биолюминесценция', colors: ['#04121c', '#092233', '#2ac3de'] },
    { id: 'vampire_blood', name: 'Кровь и пепел', desc: 'Угольно-чёрный замок и алая кровь', colors: ['#0d0608', '#1c0b0e', '#e63946'] },
    { id: 'sunset_dusk', name: 'Закатные сумерки', desc: 'Пурпурный горизонт и персиковый закат', colors: ['#1a0e1a', '#2e1829', '#ff9e64'] },
    { id: 'arctic_frost', name: 'Арктический лёд', desc: 'Северное сияние и ледяной кристалл', colors: ['#0a1622', '#13273b', '#89ddff'] },
    { id: 'witch_covens', name: 'Ведьмин шабаш', desc: 'Тёмный мох, зелье и колдовской изумруд', colors: ['#0d140d', '#182618', '#9ece6a'] },
    { id: 'royal_indigo', name: 'Королевский индиго', desc: 'Сапфировый бархат и звёздная пыль', colors: ['#0c0e24', '#171b40', '#82aaff'] },
    { id: 'coffee_noir', name: 'Кофейный нуар', desc: 'Тёплый эспрессо, карамель и старая бумага', colors: ['#17120f', '#261e19', '#d4a373'] },
    { id: 'toxic_matrix', name: 'Токсичная матрица', desc: 'Хакерский терминал и кислотный лайм', colors: ['#060f08', '#0d2111', '#41ff54'] },
    { id: 'celestial_rose', name: 'Небесная роза', desc: 'Звёздная пыль и розовое шампанское', colors: ['#17111a', '#281d2d', '#f5a9cb'] },
];

const ROLE_CATEGORIES = {
    romance: '💘 Любовь и романтика',
    friendship: '🤝 Дружба и доверие',
    family: '🩸 Семья и родство',
    hierarchy: '👑 Работа, учёба и иерархия',
    conflict: '⚔️ Конфликт и драма',
    neutral: '🌫️ Знакомство и прочее',
    custom: '✨ Свои статусы',
};

const BUILTIN_RELATIONSHIP_ROLES = [
    { id: 'strangers', category: 'neutral', label: 'Незнакомцы', en: 'Strangers', promptHint: 'They barely know each other. Maintain natural social distance, curiosity, or caution.' },
    { id: 'acquaintances', category: 'neutral', label: 'Знакомые', en: 'Acquaintances', promptHint: 'They are casual acquaintances. Polite or neutral interaction without deep personal familiarity.' },
    { id: 'neighbors', category: 'neutral', label: 'Соседи / Сожители', en: 'Neighbors / Roommates', promptHint: 'They live nearby or share living space. Everyday domestic intersection, shared habits, and boundary negotiation.' },
    { id: 'travel_companions', category: 'neutral', label: 'Спутники', en: 'Companions / Fellow Travelers', promptHint: 'They are bound by a shared journey or circumstance.' },

    { id: 'friends', category: 'friendship', label: 'Друзья', en: 'Friends', promptHint: 'They are good friends. Warmth, shared jokes, mutual trust, and relaxed body language.' },
    { id: 'best_friends', category: 'friendship', label: 'Лучшие друзья', en: 'Best Friends / Childhood Friends', promptHint: 'Deepest platonic bond, shared history, intuitive understanding, and fierce loyalty.' },
    { id: 'confidants', category: 'friendship', label: 'Хранители тайн', en: 'Trusted Confidants', promptHint: 'They share secrets with each other that nobody else knows. High emotional intimacy and discretion.' },
    { id: 'allies', category: 'friendship', label: 'Союзники / Напарники', en: 'Allies / Partners in Action', promptHint: 'They are practical allies or partners working toward a shared goal. Mutual reliance and tactical trust.' },
    { id: 'protector_ward', category: 'friendship', label: 'Защитник и подопечный', en: 'Protector & Ward / Bodyguard', promptHint: 'One feels a strong duty or instinct to protect and watch over the other.' },

    { id: 'crush', category: 'romance', label: 'Симпатия / Влюблённость', en: 'Romantic Crush / Infatuation', promptHint: 'There is noticeable romantic attraction, nervous energy, stolen glances, and emotional sensitivity.' },
    { id: 'flirt_fwb', category: 'romance', label: 'Флирт / Интим без обязательств', en: 'Flirtation / Friends with Benefits', promptHint: 'Playful teasing, physical chemistry, and intimate tension without strict formal commitment.' },
    { id: 'lovers', category: 'romance', label: 'Любовники / Пара', en: 'Romantic Partners / Lovers', promptHint: 'Established romantic and physical intimacy, deep affection, and shared history as a couple.' },
    { id: 'secret_lovers', category: 'romance', label: 'Тайные любовники', en: 'Forbidden / Secret Lovers', promptHint: 'They are in a secret romantic/passionate relationship hidden from others. Stolen moments, public restraint vs private passion.' },
    { id: 'betrothed', category: 'romance', label: 'Помолвлены', en: 'Betrothed / Engaged', promptHint: 'They are promised to each other in marriage (by choice or arrangement).' },
    { id: 'spouses', category: 'romance', label: 'Супруги (Брак)', en: 'Married Spouses', promptHint: 'They are legally or spiritually married. Deep domestic history, shared life, and complex marital dynamics.' },
    { id: 'exes', category: 'romance', label: 'Бывшие', en: 'Ex-Lovers / Ex-Partners', promptHint: 'They used to be together. Residual tension, old wounds, lingering habits, and unspoken history.' },
    { id: 'obsession', category: 'romance', label: 'Одержимость / Созависимость', en: 'Dark Obsession / Codependency', promptHint: 'Intense, consuming, possessive emotional fixation where boundaries blur.' },

    { id: 'siblings', category: 'family', label: 'Брат / Сестра', en: 'Siblings', promptHint: 'Sibling bond: shared upbringing, familiar bickering, deep-seated family history.' },
    { id: 'parent_child', category: 'family', label: 'Родитель и ребёнок', en: 'Parent & Child / Guardian', promptHint: 'Generational family bond, authority, care, expectations, or rebellion.' },
    { id: 'relatives', category: 'family', label: 'Родственники / Клан', en: 'Extended Family / Blood Kin', promptHint: 'Tied by blood, family reputation, or shared lineage.' },

    { id: 'colleagues', category: 'hierarchy', label: 'Коллеги / Сослуживцы', en: 'Colleagues / Peers', promptHint: 'They work or study together in the same environment. Professional familiarity.' },
    { id: 'mentor_student', category: 'hierarchy', label: 'Наставник и ученик', en: 'Mentor & Student', promptHint: 'Knowledge transfer, guidance, respect, or testing of limits between teacher and pupil.' },
    { id: 'boss_subordinate', category: 'hierarchy', label: 'Начальник и подчинённый', en: 'Superior & Subordinate / Master & Servant', promptHint: 'Clear power asymmetry, hierarchy, command, and compliance or subtle defiance.' },

    { id: 'rivals', category: 'conflict', label: 'Соперники', en: 'Rivals', promptHint: 'Competitive tension, pride, sharp banter, and constant comparison.' },
    { id: 'enemies', category: 'conflict', label: 'Враги', en: 'Enemies / Antagonists', promptHint: 'Hostility, distrust, guarded posture, and genuine conflict of interest.' },
    { id: 'complicated', category: 'conflict', label: 'Всё сложно', en: 'It Is Complicated / Mixed Signals', promptHint: 'Conflicting emotions, push-and-pull dynamic, unresolved tension.' },
];

const CRUSH_MUTUALITY = [
    {
        id: 'none',
        labelTemplate: 'Нет романтического подтекста',
        enTemplate: 'No romantic subtext (strictly matches their primary status)',
        secrecyRule: null,
    },
    {
        id: 'mutual_open',
        labelTemplate: 'Открытая взаимная симпатия / флирт ({A} ↔ {B})',
        enTemplate: 'Open mutual attraction & noticeable flirting between {A} and {B}',
        secrecyRule: 'Both {A} and {B} are openly aware of their mutual attraction and show it through subtle or direct flirting.',
    },
    {
        id: 'mutual_secret',
        labelTemplate: 'Тайная взаимная влюблённость (оба скрывают друг от друга)',
        enTemplate: 'Mutual secret pining ({A} and {B} are both in love with each other, but BOTH hide it and think it is unreciprocated)',
        secrecyRule: 'STRICT EPISTEMIC SECRECY: {A} is secretly in love with {B}, and {B} is secretly in love with {A}. However, NEITHER knows that the other reciprocates! Both hide their feelings out of fear, pride, or circumstance. Do NOT let them magically read each other\'s minds. Outside NPCs also do NOT know.',
    },
    {
        id: 'secret_relationship',
        labelTemplate: 'Тайная связь ({A} и {B} вместе, но скрывают от всех остальных)',
        enTemplate: 'Secret romantic/intimate relationship between {A} and {B} (known to each other, strictly hidden from everyone else)',
        secrecyRule: 'STRICT THIRD-PARTY SECRECY: {A} and {B} know about their bond and are privately intimate, but they actively hide their relationship from ALL other characters and NPCs. In public or around others, they act according to their cover status. No other character or NPC may know or casually guess their secret unless caught red-handed in the active scene.',
    },
    {
        id: 'one_way_a_to_b',
        labelTemplate: 'Тайная / безответная: только {A} влюблён(а) в {B}',
        enTemplate: 'One-sided / unrequited secret feelings: ONLY {A} has romantic feelings for {B}, while {B} does NOT reciprocate and is completely unaware',
        secrecyRule: 'STRICT ANTI-OMNISCIENCE & SECRECY: ONLY {A} harbors romantic feelings/attraction toward {B}. {A} conceals these feelings. {B} is COMPLETELY UNAWARE of {A}\'s secret feelings and views {A} strictly through their primary status. {B} must NEVER act as if they know {A} is in love with them, and NO other NPC knows {A}\'s secret.',
    },
    {
        id: 'one_way_b_to_a',
        labelTemplate: 'Тайная / безответная: только {B} влюблён(а) в {A}',
        enTemplate: 'One-sided / unrequited secret feelings: ONLY {B} has romantic feelings for {A}, while {A} does NOT reciprocate and is completely unaware',
        secrecyRule: 'STRICT ANTI-OMNISCIENCE & SECRECY: ONLY {B} harbors romantic feelings/attraction toward {A}. {B} conceals these feelings. {A} is COMPLETELY UNAWARE of {B}\'s secret feelings and views {B} strictly through their primary status. {A} must NEVER act as if they know {B} is in love with them, and NO other NPC knows {B}\'s secret.',
    },
    {
        id: 'unspoken_tension',
        labelTemplate: 'Скрытое притяжение / отрицание ({A} ⚡ {B})',
        enTemplate: 'Unspoken sexual/romantic tension & denial between {A} and {B}',
        secrecyRule: 'Both {A} and {B} feel an unspoken pull or physical chemistry, but both suppress, deny, or rationalize it away. Neither admits it aloud, and outside characters do not know about their internal struggle.',
    },
    {
        id: 'residual_chemistry',
        labelTemplate: 'Остывшие чувства / сложная химия прошлого ({A} ~ {B})',
        enTemplate: 'Residual feelings / complicated past romantic history between {A} and {B}',
        secrecyRule: 'There are lingering echoes of past feelings or unresolved emotional tension between {A} and {B}, kept private from outsiders.',
    },
];

function getMutualityInfo(mutualityId, nameA = 'Персонаж А', nameB = 'Персонаж Б') {
    const found = CRUSH_MUTUALITY.find((m) => m.id === mutualityId) || CRUSH_MUTUALITY[0];
    const replaceNames = (str) => (str ? str.replace(/\{A\}/g, nameA).replace(/\{B\}/g, nameB) : '');
    return {
        id: found.id,
        label: replaceNames(found.labelTemplate),
        en: replaceNames(found.enTemplate),
        secrecyRule: replaceNames(found.secrecyRule),
    };
}

const GENRE_PRESETS = [
    { id: 'dark_romance', label: 'Тёмная романтика', en: 'Dark Romance (intense emotional stakes, morally grey attraction, slow-burn tension)' },
    { id: 'psychological', label: 'Психологизм', en: 'Psychological Realism (deep internal conflicts, subtle micro-expressions, realistic motives)' },
    { id: 'slice_of_life', label: 'Повседневность', en: 'Grounded Slice of Life (tactile everyday details, natural casual dialogue, atmospheric realism)' },
    { id: 'slow_burn', label: 'Слоубёрн', en: 'Strict Slow Burn (earned emotional progression, lingering tension, no rushed intimacy)' },
    { id: 'noir_thriller', label: 'Нуар / Триллер', en: 'Noir & Suspense Thriller (gritty atmosphere, cynicism, high stakes, sharp subtext)' },
    { id: 'gothic', label: 'Готика / Мистика', en: 'Gothic Mystery (brooding ambiance, sensory shadows, uncanny undertones)' },
    { id: 'drama_angst', label: 'Драма / Ангст', en: 'Heavy Emotional Drama & Angst (raw vulnerability, aching consequences, sharp emotional friction)' },
    { id: 'dark_fantasy', label: 'Тёмное фэнтези', en: 'Gritty Dark Fantasy (immersive worldbuilding, dangerous magic, grounded consequences)' },
    { id: 'cyberpunk', label: 'Киберпанк / Sci-Fi', en: 'Cyberpunk / Hard Sci-Fi (high-tech low-life, neon grit, corporate coldness)' },
    { id: 'historical', label: 'Историческая проза', en: 'Historical Fiction (period-accurate etiquette, authentic vocabulary, rich setting)' },
    { id: 'comedy_wit', label: 'Ирония / Сарказм', en: 'Sharp Wit & Dry Irony (clever banter, situational humor, lively character timing)' },
    { id: 'action_adventure', label: 'Экшен / Приключения', en: 'Kinetic Action & Adventure (visceral choreography, dynamic movement, clear spatial awareness)' },
];

let selectedParticipantId = null;
let selectedRelId = null;
let isAnalyzing = false;
let isInitialized = false;
let graphState = {
    nodes: [],
    edges: [],
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    draggingNode: null,
    isPanning: false,
    lastTouchX: 0,
    lastTouchY: 0,
    animFrame: null,
    resizeObserver: null,
};

function getContext() {
    return window.SillyTavern?.getContext?.() || {};
}

function getSettings() {
    const ctx = getContext();
    if (!ctx.extensionSettings) return DEFAULT_SETTINGS;
    if (!ctx.extensionSettings[MODULE_NAME] || typeof ctx.extensionSettings[MODULE_NAME] !== 'object') {
        ctx.extensionSettings[MODULE_NAME] = safeClone(DEFAULT_SETTINGS);
    }
    const s = ctx.extensionSettings[MODULE_NAME];
    for (const [k, v] of Object.entries(DEFAULT_SETTINGS)) {
        if (s[k] === undefined || s[k] === null) s[k] = safeClone(v);
    }
    if (!s.styleConfig || typeof s.styleConfig !== 'object') {
        s.styleConfig = safeClone(DEFAULT_SETTINGS.styleConfig);
    }
    for (const [k, v] of Object.entries(DEFAULT_SETTINGS.styleConfig)) {
        if (s.styleConfig[k] === undefined || s.styleConfig[k] === null) s.styleConfig[k] = safeClone(v);
    }
    if (!Array.isArray(s.styleConfig.genres)) {
        s.styleConfig.genres = safeClone(DEFAULT_SETTINGS.styleConfig.genres);
    }
    if (!s.styleConfig.sliders || typeof s.styleConfig.sliders !== 'object') {
        s.styleConfig.sliders = safeClone(DEFAULT_SETTINGS.styleConfig.sliders);
    }
    if (!s.profiles || typeof s.profiles !== 'object') {
        s.profiles = {};
    }
    return s;
}

function saveSettings() {
    const ctx = getContext();
    if (typeof ctx.saveSettingsDebounced === 'function') {
        ctx.saveSettingsDebounced();
    }
}

function getBaseCharacterKey() {
    const ctx = getContext();
    const charId = ctx.characterId !== undefined && ctx.characterId !== null ? String(ctx.characterId) : 'nochar';
    const groupId = ctx.groupId ? String(ctx.groupId) : '';
    return groupId ? `group_${groupId}` : `char_${charId}`;
}

function getActiveProfileKey() {
    const s = getSettings();
    const baseKey = getBaseCharacterKey();
    if (s.isolatePerChat) {
        const ctx = getContext();
        const chatId = ctx.chatId ? String(ctx.chatId) : 'default_chat';
        return `${baseKey}__${chatId}`;
    }
    return baseKey;
}

function findBestDonorProfileForBaseKey(baseKey) {
    const s = getSettings();
    if (!s.profiles) return null;

    if (s.profiles[baseKey] && Array.isArray(s.profiles[baseKey].participants) && s.profiles[baseKey].participants.length > 0) {
        return s.profiles[baseKey];
    }

    let bestProfile = null;
    let bestScore = -1;
    const prefix = `${baseKey}__`;

    for (const [key, prof] of Object.entries(s.profiles)) {
        if (key === baseKey || key.startsWith(prefix)) {
            const pCount = Array.isArray(prof?.participants) ? prof.participants.length : 0;
            const rCount = Array.isArray(prof?.relationships) ? prof.relationships.length : 0;
            const score = pCount * 10 + rCount * 25;
            if (score > bestScore && (pCount > 0 || rCount > 0)) {
                bestScore = score;
                bestProfile = prof;
            }
        }
    }
    return bestProfile;
}

function getAllRoles(profile) {
    const custom = Array.isArray(profile?.customRoles) ? profile.customRoles : [];
    return [...BUILTIN_RELATIONSHIP_ROLES, ...custom];
}

function getRoleInfo(roleId, profile) {
    const all = getAllRoles(profile);
    return all.find((r) => r.id === roleId) || BUILTIN_RELATIONSHIP_ROLES[1];
}

function getProfileData() {
    const s = getSettings();
    const key = getActiveProfileKey();
    const baseKey = getBaseCharacterKey();

    if (!s.profiles[key] || typeof s.profiles[key] !== 'object') {
        const donor = findBestDonorProfileForBaseKey(baseKey);
        if (donor) {
            s.profiles[key] = safeClone(donor);
        } else {
            s.profiles[key] = {
                currentStoryDate: 'День 1',
                participants: [],
                relationships: [],
                customRoles: [],
            };
        }
    }

    const profile = s.profiles[key];
    if (!Array.isArray(profile.participants)) profile.participants = [];
    if (!Array.isArray(profile.relationships)) profile.relationships = [];
    if (!Array.isArray(profile.customRoles)) profile.customRoles = [];
    if (!profile.currentStoryDate) profile.currentStoryDate = 'День 1';

    ensureCoreParticipants(profile);
    return profile;
}

function ensureCoreParticipants(profile) {
    if (!profile || !Array.isArray(profile.participants)) return;
    const ctx = getContext();
    const userName = ctx.name1 || 'Игрок';
    const charName = ctx.name2 || 'Персонаж';

    let userNode = profile.participants.find((p) => p && p.role === 'user');
    if (!userNode) {
        userNode = {
            id: 'p_user',
            name: userName,
            role: 'user',
            avatar: getUserAvatarUrl(),
            x: 115,
            y: 170,
        };
        profile.participants.push(userNode);
    } else {
        userNode.name = userName;
        if (!userNode.avatar || (!userNode.avatar.startsWith('data:') && !userNode.customAvatar)) {
            userNode.avatar = getUserAvatarUrl();
        }
    }

    if (charName && charName !== 'SillyTavern System') {
        let charNode = profile.participants.find((p) => p && p.role === 'char');
        if (!charNode) {
            charNode = {
                id: 'p_char',
                name: charName,
                role: 'char',
                avatar: getCharAvatarUrl(),
                x: 245,
                y: 170,
            };
            profile.participants.push(charNode);
        } else {
            charNode.name = charName;
            if (!charNode.avatar || (!charNode.avatar.startsWith('data:') && !charNode.customAvatar)) {
                charNode.avatar = getCharAvatarUrl();
            }
        }
    }

    if (profile.participants.length >= 2 && profile.relationships.length === 0) {
        const p1 = profile.participants[0];
        const p2 = profile.participants[1];
        if (p1 && p2) {
            getOrCreateRelationship(profile, p1.id, p2.id);
        }
    }
}

function getCharAvatarUrl() {
    const ctx = getContext();
    if (ctx.characterId !== undefined && ctx.characters && ctx.characters[ctx.characterId]) {
        const av = ctx.characters[ctx.characterId].avatar;
        if (av && av !== 'none') {
            return `/characters/${encodeURIComponent(av)}`;
        }
    }
    return '';
}

function getUserAvatarUrl() {
    const userImg = document.querySelector('#user_avatar_block .avatar.selected img');
    if (userImg && userImg.getAttribute('src')) {
        return userImg.getAttribute('src');
    }
    return '';
}

function makePairId(idA, idB) {
    return [idA, idB].sort().join('__');
}

function getOrCreateRelationship(profile, idA, idB) {
    if (idA === idB) return null;
    const pairId = makePairId(idA, idB);
    let rel = profile.relationships.find((r) => r && r.id === pairId);
    if (!rel) {
        const [sourceId, targetId] = [idA, idB].sort();
        rel = {
            id: pairId,
            sourceId,
            targetId,
            roleId: 'acquaintances',
            mutuality: 'none',
            affinity: 0,
            summary: '',
            events: [],
        };
        profile.relationships.push(rel);
    }
    if (!rel.mutuality) rel.mutuality = 'none';
    if (!Array.isArray(rel.events)) rel.events = [];
    return rel;
}

function clampAffinity(val) {
    const n = Number(val);
    if (Number.isNaN(n)) return 0;
    return Math.max(-100, Math.min(100, Math.round(n)));
}

function formatAffinity(val) {
    const c = clampAffinity(val);
    return c > 0 ? `+${c}%` : `${c}%`;
}

function getAffinityTierLabel(val) {
    const c = clampAffinity(val);
    if (c <= -75) return 'Ненависть / Вражда';
    if (c <= -40) return 'Неприязнь / Холод';
    if (c <= -15) return 'Недоверие / Напряжение';
    if (c < 15) return 'Нейтралитет';
    if (c < 45) return 'Симпатия / Доверие';
    if (c < 75) return 'Крепкая близость';
    return 'Глубокая привязанность';
}

function buildRelationshipsPrompt() {
    const s = getSettings();
    if (!s.enabled || !s.relEnabled) return '';
    const profile = getProfileData();
    if (!profile.relationships || profile.relationships.length === 0) return '';

    const pMap = new Map(profile.participants.filter(Boolean).map((p) => [p.id, p]));
    const allParticipants = profile.participants.filter(Boolean);
    const lines = [];
    const epistemicSecrets = [];

    lines.push(`[MANDATORY CHARACTER & NPC RELATIONSHIP NETWORK — STRICT CANON & EPISTEMIC ISOLATION]`);
    lines.push(`Current Story Date / Timeline Marker: ${profile.currentStoryDate || 'Day 1'}`);
    lines.push(`CRITICAL INSTRUCTION: Every character and NPC in this story MUST strictly act, speak, and react according to their exact relationship status, romantic mutuality, and affinity score below (-100% = bitter hatred, 0% = pure neutrality, +100% = absolute devotion). Do NOT make hostile characters suddenly sweet, do NOT make strangers act like old lovers, and NEVER violate the secrecy rules below:`);

    for (const rel of profile.relationships) {
        if (!rel) continue;
        const pA = pMap.get(rel.sourceId);
        const pB = pMap.get(rel.targetId);
        if (!pA || !pB) continue;

        const roleObj = getRoleInfo(rel.roleId, profile);
        const aff = clampAffinity(rel.affinity);
        const mutInfo = getMutualityInfo(rel.mutuality || 'none', pA.name, pB.name);

        let entry = `• ${pA.name} ↔ ${pB.name}: Primary Status = "${roleObj.en}" (${roleObj.label}) | Affinity = ${formatAffinity(aff)}`;
        if (mutInfo.id !== 'none') {
            entry += ` | Romantic/Crush Dynamic = ${mutInfo.en}`;
        }
        entry += `. Behavioral Directive: ${roleObj.promptHint}`;

        if (rel.summary && rel.summary.trim()) {
            entry += ` Current dynamic & context: ${rel.summary.trim()}`;
        }

        if (Array.isArray(rel.events) && rel.events.length > 0) {
            const recent = rel.events.slice(-4).map((e) => `[${e.date || '?'}] ${e.text}`).join('; ');
            entry += ` Key shared memories: ${recent}.`;
        }
        lines.push(entry);

        if (mutInfo.secrecyRule) {
            const otherNames = allParticipants
                .filter((p) => p.id !== pA.id && p.id !== pB.id)
                .map((p) => p.name);
            const thirdPartyList = otherNames.length > 0 ? otherNames.join(', ') : 'all other NPCs/bystanders';

            let secretBlock = `• SECRET FEELINGS FIREWALL (${pA.name} & ${pB.name}): ${mutInfo.secrecyRule}`;
            if (mutInfo.id === 'one_way_a_to_b') {
                secretBlock += ` Specifically: ${pB.name} has ZERO knowledge that ${pA.name} has romantic feelings for them. Furthermore, third-party characters (${thirdPartyList}) have ZERO knowledge of ${pA.name}'s secret feelings and must NEVER tease, hint, or act omniscient about it.`;
            } else if (mutInfo.id === 'one_way_b_to_a') {
                secretBlock += ` Specifically: ${pA.name} has ZERO knowledge that ${pB.name} has romantic feelings for them. Furthermore, third-party characters (${thirdPartyList}) have ZERO knowledge of ${pB.name}'s secret feelings and must NEVER tease, hint, or act omniscient about it.`;
            } else if (mutInfo.id === 'mutual_secret') {
                secretBlock += ` Specifically: ${pA.name} does NOT know ${pB.name} loves them back, and ${pB.name} does NOT know ${pA.name} loves them back. Third-party characters (${thirdPartyList}) also do NOT know.`;
            } else if (mutInfo.id === 'secret_relationship') {
                secretBlock += ` Specifically: ${pA.name} and ${pB.name} know, but third-party characters (${thirdPartyList}) have ZERO knowledge of their secret relationship and must treat them solely as "${roleObj.en}".`;
            }
            epistemicSecrets.push(secretBlock);
        }
    }

    if (epistemicSecrets.length > 0) {
        lines.push('');
        lines.push(`[EPISTEMIC & SECRET KNOWLEDGE ISOLATION — ANTI-OMNISCIENCE LAW]`);
        lines.push(`You are strictly forbidden from leaking private feelings or secret relationships to characters who do not know about them in-universe:`);
        for (const sec of epistemicSecrets) {
            lines.push(sec);
        }
    }

    return lines.join('\n');
}

function buildStylePrompt() {
    const s = getSettings();
    if (!s.enabled || !s.styleEnabled) return '';
    const sc = s.styleConfig;
    const lines = [];

    const intensityHeader =
        sc.genreIntensity === 'strict'
            ? '[MANDATORY NARRATIVE GENRE, AUTHOR VOICE & PACING DIRECTIVES — MAXIMUM ENFORCEMENT]'
            : sc.genreIntensity === 'soft'
                ? '[NARRATIVE GENRE & STYLE GUIDANCE]'
                : '[ACTIVE NARRATIVE GENRE, AUTHOR VOICE & PACING DIRECTIVES]';

    lines.push(intensityHeader);

    const activeGenres = [];
    if (Array.isArray(sc.genres)) {
        for (const gId of sc.genres) {
            const found = GENRE_PRESETS.find((g) => g.id === gId);
            if (found) activeGenres.push(found.en);
        }
    }
    if (sc.customGenre && sc.customGenre.trim()) {
        activeGenres.push(sc.customGenre.trim());
    }
    if (activeGenres.length > 0) {
        lines.push(`• Active Narrative Genres (MUST define atmosphere, conflict, and tone): ${activeGenres.join(' + ')}.`);
    }

    if (sc.authorVoice && sc.authorVoice.trim()) {
        lines.push(`• Target Authorial Voice & Prose Style: Emulate the literary craftsmanship, sentence rhythm, psychological depth, and descriptive texture of ${sc.authorVoice.trim()}.`);
    }

    const sl = sc.sliders || DEFAULT_SETTINGS.styleConfig.sliders;
    lines.push(`• Scene Composition & Pacing Balance (Strict Adherence Required):`);
    lines.push(`  - Physical Action & Dynamic Movement: ${sl.action}% (${sl.action >= 70 ? 'High kinetic momentum, tangible physical actions in every paragraph' : sl.action <= 30 ? 'Minimal physical action, calm stillness and internal focus' : 'Balanced physical action and natural movement'}).`);
    lines.push(`  - Sensory & Atmospheric Description: ${sl.description}% (${sl.description >= 70 ? 'Rich sensory immersion, concrete textures, lighting, sounds, and environment' : sl.description <= 30 ? 'Lean, sparse descriptions focusing strictly on immediate events' : 'Moderate vivid sensory grounding'}).`);
    lines.push(`  - Spoken Dialogue & Subtext: ${sl.dialogue}% (${sl.dialogue >= 70 ? 'Dialogue-driven scene with sharp conversational back-and-forth and distinct voices' : sl.dialogue <= 30 ? 'Sparse spoken words, heavy reliance on silent action and atmosphere' : 'Natural balance between spoken dialogue and narrative prose'}).`);
    lines.push(`  - Plot Pacing Speed: ${sl.pacing}% (${sl.pacing <= 35 ? 'Deliberate SLOW-BURN pacing: savor the current moment, do NOT skip time or rush emotional milestones' : sl.pacing >= 70 ? 'Fast, plot-forward momentum: advance events decisively without lingering' : 'Measured, organic story progression'}).`);

    if (sc.customDirectives && sc.customDirectives.trim()) {
        lines.push(`• Additional Style Directives: ${sc.customDirectives.trim()}`);
    }

    return lines.join('\n');
}

function updatePromptInjections() {
    const ctx = getContext();
    if (typeof ctx.setExtensionPrompt !== 'function') return;

    const s = getSettings();
    const depth = Number.isFinite(Number(s.injectionDepth)) ? Number(s.injectionDepth) : 1;
    const relPrompt = buildRelationshipsPrompt();
    const stylePrompt = buildStylePrompt();

    ctx.setExtensionPrompt(PROMPT_KEY_REL, relPrompt, 1, depth, false, 0);
    ctx.setExtensionPrompt(PROMPT_KEY_STYLE, stylePrompt, 1, depth, false, 0);
}

window.bluemoonGenerateInterceptor = async function (chat, contextSize, abort, type) {
    try {
        updatePromptInjections();
        const s = getSettings();
        if (!s.enabled || !Array.isArray(chat) || chat.length === 0) return;

        const blocks = [];
        const relPrompt = buildRelationshipsPrompt();
        const stylePrompt = buildStylePrompt();
        if (relPrompt) blocks.push(relPrompt);
        if (stylePrompt) blocks.push(stylePrompt);
        if (blocks.length === 0) return;

        const combined = `\n\n${blocks.join('\n\n')}\n`;
        const marker = '[MANDATORY CHARACTER & NPC RELATIONSHIP NETWORK';
        const styleMarker = 'NARRATIVE GENRE';

        const alreadyInjected = chat.some(
            (m) => typeof m?.mes === 'string' && (m.mes.includes(marker) || m.mes.includes(styleMarker))
        );
        if (alreadyInjected) return;

        const targetIndex = Math.max(0, chat.length - 1);
        if (chat[targetIndex] && typeof chat[targetIndex].mes === 'string') {
            chat[targetIndex].mes += combined;
        }
    } catch (err) {
        console.error(`[${MODULE_NAME}] Interceptor error:`, err);
    }
};

async function runLLMGenerate(systemPrompt, userPrompt) {
    const ctx = getContext();
    const s = getSettings();
    const profileId = (s.connectionProfileId || '').trim();

    if (profileId && ctx.ConnectionManagerRequestService && typeof ctx.ConnectionManagerRequestService.sendRequest === 'function') {
        try {
            const messages = [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ];
            const res = await ctx.ConnectionManagerRequestService.sendRequest(profileId, messages, 950);
            if (typeof res === 'string') return res;
            if (res?.content) return res.content;
            if (res?.choices?.[0]?.message?.content) return res.choices[0].message.content;
        } catch (err) {
            console.warn(`[${MODULE_NAME}] ConnectionManager profile fallback to generateRaw:`, err);
        }
    }

    if (typeof ctx.generateRaw === 'function') {
        const res = await ctx.generateRaw({
            systemPrompt,
            prompt: userPrompt,
            quietToLoud: false,
        });
        return typeof res === 'string' ? res : String(res || '');
    }

    if (typeof ctx.generateQuietPrompt === 'function') {
        return await ctx.generateQuietPrompt(`${systemPrompt}\n\n${userPrompt}`, false, false);
    }

    throw new Error('No SillyTavern generation method available');
}

async function analyzeAllRelationshipsWithLLM(manualTrigger = false) {
    if (isAnalyzing) return;
    const s = getSettings();
    if (!s.enabled || !s.relEnabled) return;
    if (!manualTrigger && !s.relAutoAnalyze) return;

    const ctx = getContext();
    const chat = ctx.chat || [];
    if (chat.length < 1) {
        if (manualTrigger) toastr.info('Чат пока пуст для анализа.', 'BlueMoon');
        return;
    }

    const profile = getProfileData();
    ensureCoreParticipants(profile);

    if (profile.participants.length < 2) return;

    isAnalyzing = true;
    $('#bm2_btn_analyze_now').prop('disabled', true).text('⏳ Анализ...');

    try {
        const recentMessages = chat
            .slice(-6)
            .map((m) => `${m.name || (m.is_user ? 'User' : 'Char')}: ${(m.mes || '').slice(0, 750)}`)
            .join('\n---\n');

        const pMap = new Map(profile.participants.map((p) => [p.id, p]));

        for (let i = 0; i < profile.participants.length; i++) {
            for (let j = i + 1; j < profile.participants.length; j++) {
                getOrCreateRelationship(profile, profile.participants[i].id, profile.participants[j].id);
            }
        }

        const existingPairsText = profile.relationships
            .map((rel) => {
                const pA = pMap.get(rel.sourceId);
                const pB = pMap.get(rel.targetId);
                if (!pA || !pB) return null;
                return `- pairId: "${rel.id}" (${pA.name} ↔ ${pB.name}), current roleId: "${rel.roleId}", mutuality: "${rel.mutuality || 'none'}", current affinity: ${rel.affinity}, summary: "${rel.summary || ''}"`;
            })
            .filter(Boolean)
            .join('\n');

        const allowedRoles = getAllRoles(profile).map((r) => r.id).join(', ');
        const allowedMutuality = CRUSH_MUTUALITY.map((m) => m.id).join(', ');

        const sysPrompt = `You are an objective relationship & social network analyzer for an interactive story.
Analyze the latest chat excerpt and check ALL character & NPC pairs listed below.
Update ONLY the pairs that interacted, were mentioned together, or experienced an emotional shift in this scene.
Remember: secret or unrequited feelings must stay secret unless explicitly confessed or exposed in the scene!
Return ONLY valid JSON (no markdown fences) matching this exact structure:
{
  "storyDate": "string (updated story day/date in Russian if time passed, or keep current '${profile.currentStoryDate}')",
  "updates": [
    {
      "pairId": "exact pairId from the list",
      "delta": number (-15 to +15 integer change in affinity),
      "roleId": "one of [${allowedRoles}]",
      "mutuality": "one of [${allowedMutuality}]",
      "summary": "1 concise sentence in Russian describing their current dynamic",
      "significantEvent": "short 1-sentence milestone in Russian ONLY if a major memorable event happened between them in the last message, otherwise empty string"
    }
  ]
}`;

        const userPrompt = `Current Story Date: ${profile.currentStoryDate}
All Monitored Character & NPC Pairs:
${existingPairsText}

Recent Scene Excerpt:
${recentMessages}

Output JSON only:`;

        const raw = await runLLMGenerate(sysPrompt, userPrompt);
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('JSON not found in model response');

        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.storyDate && typeof parsed.storyDate === 'string' && parsed.storyDate.trim()) {
            profile.currentStoryDate = parsed.storyDate.trim();
        }

        let updatedCount = 0;
        if (Array.isArray(parsed.updates)) {
            for (const upd of parsed.updates) {
                const rel = profile.relationships.find((r) => r.id === upd.pairId);
                if (!rel) continue;

                const delta = Number(upd.delta) || 0;
                const oldAff = rel.affinity;
                if (delta !== 0) {
                    rel.affinity = clampAffinity(rel.affinity + Math.max(-20, Math.min(20, delta)));
                }
                if (upd.roleId && getAllRoles(profile).some((r) => r.id === upd.roleId)) {
                    rel.roleId = upd.roleId;
                }
                if (upd.mutuality && CRUSH_MUTUALITY.some((m) => m.id === upd.mutuality)) {
                    rel.mutuality = upd.mutuality;
                }
                if (upd.summary && typeof upd.summary === 'string') {
                    rel.summary = upd.summary.trim();
                }
                if (upd.significantEvent && typeof upd.significantEvent === 'string' && upd.significantEvent.trim().length > 4) {
                    const evText = upd.significantEvent.trim();
                    const isDup = rel.events.some((e) => e.text === evText);
                    if (!isDup) {
                        rel.events.push({
                            date: profile.currentStoryDate || 'Событие',
                            text: evText,
                        });
                    }
                }
                if (delta !== 0 || upd.significantEvent) updatedCount++;

                const pA = pMap.get(rel.sourceId);
                const pB = pMap.get(rel.targetId);
                if (pA && pB && rel.affinity !== oldAff) {
                    const sign = rel.affinity - oldAff > 0 ? `+${rel.affinity - oldAff}%` : `${rel.affinity - oldAff}%`;
                    toastr.info(`${pA.name} ↔ ${pB.name}: ${sign} (теперь ${formatAffinity(rel.affinity)})`, 'BlueMoon: Связи');
                }
            }
        }

        saveSettings();
        updatePromptInjections();
        if ($('#bm2_overlay').is(':visible')) {
            renderRelationshipsTab();
            renderGraphNodes();
        }
        if (manualTrigger && updatedCount === 0) {
            toastr.success('Анализ завершён: без резких сдвигов в последней сцене.', 'BlueMoon');
        }
    } catch (err) {
        console.error(`[${MODULE_NAME}] Relationship analysis failed:`, err);
        if (manualTrigger) {
            toastr.error(`Ошибка анализа: ${err.message}`, 'BlueMoon');
        }
    } finally {
        isAnalyzing = false;
        $('#bm2_btn_analyze_now').prop('disabled', false).text('🔍 Анализ всех связей');
    }
}

function exportRelationshipsJson() {
    try {
        const profile = getProfileData();
        const ctx = getContext();
        const charName = (ctx.name2 || 'character').replace(/[^a-zA-Zа-яА-Я0-9_-]/g, '_');
        const payload = {
            bluemoon_export_version: '2.5.4',
            exportedAt: new Date().toISOString(),
            characterName: ctx.name2 || '',
            userName: ctx.name1 || '',
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
        toastr.success('Файл со всеми связями и NPC скачан.', 'BlueMoon: Экспорт');
    } catch (err) {
        console.error(`[${MODULE_NAME}] Export error:`, err);
        toastr.error('Не удалось экспортировать связи.', 'BlueMoon');
    }
}

function importRelationshipsJsonFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const parsed = JSON.parse(String(e.target.result || '{}'));
            const incomingProfile = parsed.profile || parsed;

            if (!Array.isArray(incomingProfile.participants) || !Array.isArray(incomingProfile.relationships)) {
                toastr.error('В выбранном JSON нет списков participants и relationships.', 'BlueMoon: Импорт');
                return;
            }

            const replaceAll = window.confirm(
                'Заменить текущие связи и NPC полностью на данные из файла?\n\n[ОК] — Полностью заменить из файла\n[Отмена] — Объединить (добавить недостающих NPC, статусы и связи к текущим)'
            );

            const s = getSettings();
            const key = getActiveProfileKey();
            const currentProfile = getProfileData();

            if (replaceAll) {
                s.profiles[key] = {
                    currentStoryDate: incomingProfile.currentStoryDate || currentProfile.currentStoryDate || 'День 1',
                    participants: safeClone(incomingProfile.participants),
                    relationships: safeClone(incomingProfile.relationships),
                    customRoles: safeClone(incomingProfile.customRoles || []),
                };
                ensureCoreParticipants(s.profiles[key]);
            } else {
                if (incomingProfile.currentStoryDate) {
                    currentProfile.currentStoryDate = incomingProfile.currentStoryDate;
                }
                if (Array.isArray(incomingProfile.customRoles)) {
                    for (const cr of incomingProfile.customRoles) {
                        if (!currentProfile.customRoles.some((r) => r.id === cr.id)) {
                            currentProfile.customRoles.push(safeClone(cr));
                        }
                    }
                }
                for (const incP of incomingProfile.participants) {
                    const exists = currentProfile.participants.find(
                        (p) => p.id === incP.id || (p.name.toLowerCase() === (incP.name || '').toLowerCase() && p.role === incP.role)
                    );
                    if (!exists) {
                        currentProfile.participants.push(safeClone(incP));
                    } else if (incP.customAvatar && incP.avatar) {
                        exists.avatar = incP.avatar;
                        exists.customAvatar = true;
                    }
                }
                for (const incR of incomingProfile.relationships) {
                    const existingRel = currentProfile.relationships.find((r) => r.id === incR.id);
                    if (!existingRel) {
                        currentProfile.relationships.push(safeClone(incR));
                    } else {
                        existingRel.affinity = clampAffinity(incR.affinity);
                        existingRel.roleId = incR.roleId || existingRel.roleId;
                        existingRel.mutuality = incR.mutuality || existingRel.mutuality || 'none';
                        existingRel.summary = incR.summary || existingRel.summary;
                        if (Array.isArray(incR.events)) {
                            for (const ev of incR.events) {
                                if (!existingRel.events.some((x) => x.text === ev.text)) {
                                    existingRel.events.push(ev);
                                }
                            }
                        }
                    }
                }
            }

            selectedRelId = null;
            saveSettings();
            updatePromptInjections();
            renderRelationshipsTab();
            renderGraphNodes();
            toastr.success('Отношения и NPC успешно импортированы!', 'BlueMoon: Импорт');
        } catch (err) {
            console.error(`[${MODULE_NAME}] Import error:`, err);
            toastr.error(`Ошибка чтения JSON: ${err.message}`, 'BlueMoon: Импорт');
        }
    };
    reader.readAsText(file);
}

function compressImageFileToDataUrl(file, maxSize = 160, quality = 0.82) {
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
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function createModalHtml() {
    return `
<div id="bm2_overlay" data-bm-theme="moonlight">
    <div id="bm2_modal">
        <div class="bm2_topbar">
            <div class="bm2_brand">
                <span>🌙</span>
                <span>BlueMoon</span>
            </div>
            <div class="bm2_top_actions">
                <button id="bm2_btn_preview_prompt" class="bm2_icon_btn" title="Посмотреть активный промпт">👁️ Промпт</button>
                <button id="bm2_btn_close" class="bm2_close_btn" title="Закрыть">✕</button>
            </div>
        </div>

        <div class="bm2_tabs">
            <button class="bm2_tab active" data-tab="rel">💞 Связи</button>
            <button class="bm2_tab" data-tab="graph">🕸️ Древо</button>
            <button class="bm2_tab" data-tab="style">🎚️ Стиль</button>
            <button class="bm2_tab" data-tab="themes">🎨 Темы</button>
        </div>

        <div class="bm2_body">
            <!-- TAB 1: RELATIONSHIPS -->
            <div id="bm2_pane_rel" class="bm2_pane active">
                <div class="bm2_date_bar">
                    <div class="bm2_date_left">
                        <span>📅</span>
                        <input id="bm2_story_date_input" class="bm2_date_input" type="text" placeholder="День 1 / Дата..." />
                        <button id="bm2_btn_next_day" class="bm2_mini_btn" title="Прибавить 1 день">+1 дн.</button>
                    </div>
                    <div class="bm2_toolbar_btns">
                        <button id="bm2_btn_analyze_now" class="bm2_mini_btn">🔍 Анализ всех связей</button>
                        <button id="bm2_btn_export_json" class="bm2_mini_btn" title="Скачать файл со всеми связями и NPC">📥 Экспорт</button>
                        <button id="bm2_btn_import_json" class="bm2_mini_btn" title="Загрузить связи и NPC из JSON файла">📤 Импорт</button>
                    </div>
                </div>

                <!-- PARTICIPANTS & NPCs -->
                <div class="bm2_card">
                    <div class="bm2_card_title">
                        <span>👥 Персонажи и NPC (нажми 📷 для фото из галереи)</span>
                    </div>
                    <div id="bm2_participants_strip" class="bm2_participants_strip"></div>
                    <div class="bm2_add_npc_row">
                        <input id="bm2_new_npc_name" class="bm2_input" type="text" placeholder="Имя нового NPC (друг, соперник, брат...)" />
                        <button id="bm2_btn_add_npc" class="bm2_btn">+ Добавить</button>
                    </div>
                    <input id="bm2_hidden_file_input" type="file" accept="image/*" style="display:none;" />
                    <input id="bm2_hidden_import_input" type="file" accept=".json,application/json" style="display:none;" />
                </div>

                <!-- STRUCTURED RELATIONSHIP NAVIGATOR & PAIR SELECTOR -->
                <div class="bm2_card">
                    <div class="bm2_card_title">
                        <span>🗂️ Навигатор связей персонажа</span>
                        <button id="bm2_btn_toggle_new_link" class="bm2_mini_btn">+ Добавить связь вручную</button>
                    </div>

                    <!-- Manual link creation drawer -->
                    <div id="bm2_new_link_drawer" class="bm2_new_link_drawer" style="display:none;">
                        <div class="bm2_new_link_grid">
                            <div>
                                <span class="bm2_sub_label">Участник 1</span>
                                <select id="bm2_new_link_a" class="bm2_select"></select>
                            </div>
                            <div>
                                <span class="bm2_sub_label">Участник 2</span>
                                <select id="bm2_new_link_b" class="bm2_select"></select>
                            </div>
                        </div>
                        <div class="bm2_new_link_grid" style="margin-top:6px;">
                            <div>
                                <span class="bm2_sub_label">Статус связи</span>
                                <select id="bm2_new_link_role" class="bm2_select"></select>
                            </div>
                            <div>
                                <span class="bm2_sub_label">Начальная шкала (%)</span>
                                <input id="bm2_new_link_aff" class="bm2_input" type="number" min="-100" max="100" value="0" />
                            </div>
                        </div>
                        <div style="margin-top:6px;">
                            <span class="bm2_sub_label">💘 Влюблённость / Тайна чувств (опционально)</span>
                            <select id="bm2_new_link_mutuality" class="bm2_select"></select>
                        </div>
                        <div style="display:flex; gap:6px; margin-top:8px;">
                            <button id="bm2_btn_create_link_confirm" class="bm2_btn" style="flex:1;">✅ Создать / Открыть связь</button>
                        </div>
                    </div>

                    <!-- Character Filter Pills & Grouping Toggle -->
                    <div class="bm2_filter_bar">
                        <div id="bm2_actor_filter_pills" class="bm2_actor_pills"></div>
                        <div class="bm2_group_mode_bar">
                            <button id="bm2_group_by_cat" class="bm2_mode_btn active" data-mode="category">📂 По разделам</button>
                            <button id="bm2_group_by_char" class="bm2_mode_btn" data-mode="character">👤 По персонажам</button>
                        </div>
                    </div>

                    <!-- Dropdown with optgroups -->
                    <div style="margin-bottom:8px;">
                        <select id="bm2_pair_select" class="bm2_select"></select>
                    </div>

                    <!-- Collapsible structured directory of links -->
                    <div id="bm2_rel_directory" class="bm2_directory_box"></div>

                    <!-- Active Selected Relationship Editor -->
                    <div id="bm2_rel_editor_box">
                        <div class="bm2_active_pair_banner" id="bm2_active_pair_banner"></div>

                        <div class="bm2_role_row">
                            <div style="flex:1;">
                                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                                    <span class="bm2_sub_label" style="margin:0;">Статус отношений</span>
                                    <button id="bm2_btn_add_custom_role" class="bm2_mini_btn" style="padding:2px 8px; font-size:0.72rem;">➕ Свой статус вручную</button>
                                </div>
                                <select id="bm2_role_select" class="bm2_select"></select>
                            </div>
                        </div>

                        <!-- ROMANTIC / CRUSH MUTUALITY & SECRECY SUBTYPE (ALWAYS AVAILABLE) -->
                        <div id="bm2_mutuality_box" style="margin-bottom:10px;">
                            <span class="bm2_sub_label">💘 Романтический подтекст / Взаимность и тайна чувств</span>
                            <select id="bm2_mutuality_select" class="bm2_select"></select>
                            <div id="bm2_mutuality_hint" style="font-size:0.73rem; color:var(--bm-muted); margin-top:4px; line-height:1.3;"></div>
                        </div>

                        <!-- BIPOLAR AFFINITY BAR (-100% .. 0% .. +100%) -->
                        <div class="bm2_meter_wrap">
                            <div class="bm2_meter_header">
                                <span id="bm2_affinity_tier" class="bm2_meter_tier">Нейтралитет</span>
                                <span id="bm2_affinity_val" class="bm2_meter_val">0%</span>
                            </div>
                            <div class="bm2_meter_bipolar_bar">
                                <div class="bm2_meter_center_tick"></div>
                                <div id="bm2_meter_neg_fill" class="bm2_meter_neg_fill" style="width:0%;"></div>
                                <div id="bm2_meter_pos_fill" class="bm2_meter_pos_fill" style="width:0%;"></div>
                            </div>
                            <div class="bm2_meter_controls">
                                <button id="bm2_aff_minus" class="bm2_step_btn">-5</button>
                                <input id="bm2_affinity_slider" class="bm2_range" type="range" min="-100" max="100" step="1" value="0" />
                                <button id="bm2_aff_plus" class="bm2_step_btn">+5</button>
                            </div>
                        </div>

                        <div style="margin-bottom:10px;">
                            <span class="bm2_sub_label">Краткое описание динамики (учитывается ИИ в каждом ответе)</span>
                            <input id="bm2_rel_summary" class="bm2_input" type="text" placeholder="Например: Скрывает ревность за холодными шутками..." />
                        </div>

                        <div>
                            <span class="bm2_sub_label">📌 Ключевые события и общие воспоминания пары</span>
                            <div id="bm2_events_list" class="bm2_events_list"></div>
                            <div class="bm2_add_npc_row" style="margin-top:6px;">
                                <input id="bm2_new_event_text" class="bm2_input" type="text" placeholder="Добавить важное событие вручную..." />
                                <button id="bm2_btn_add_event" class="bm2_btn">+</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- TAB 2: OBSIDIAN GRAPH -->
            <div id="bm2_pane_graph" class="bm2_pane">
                <div class="bm2_card">
                    <div class="bm2_card_title">
                        <span>🕸️ Интерактивное древо связей</span>
                        <span style="font-size:0.75rem; color:var(--bm-muted);">Тап по узлу или линии</span>
                    </div>
                    <div class="bm2_graph_box">
                        <canvas id="bm2_graph_canvas"></canvas>
                        <div class="bm2_graph_overlay_tools">
                            <button id="bm2_graph_arrange" class="bm2_mini_btn" title="Аккуратно расставить все узлы по кругу">🫧 Распределить</button>
                            <button id="bm2_graph_reset" class="bm2_mini_btn">⟲ Центрировать</button>
                        </div>
                        <div class="bm2_graph_hint">Перетаскивай круги пальцем • Тапни связь для редактирования</div>
                    </div>
                </div>
            </div>

            <!-- TAB 3: NARRATIVE STYLE & GENRE -->
            <div id="bm2_pane_style" class="bm2_pane">
                <div class="bm2_card">
                    <div class="bm2_card_title">
                        <span>🎭 Жанры истории (можно выбрать несколько)</span>
                        <select id="bm2_genre_intensity" class="bm2_select" style="width:auto; min-height:30px; padding:3px 8px; font-size:0.76rem;">
                            <option value="soft">Мягкий акцент</option>
                            <option value="balanced">Стандартный</option>
                            <option value="strict">Строгий канон</option>
                        </select>
                    </div>
                    <div id="bm2_genre_chips" class="bm2_chip_grid"></div>
                    <div style="margin-top:8px;">
                        <span class="bm2_sub_label">Свой жанр или сеттинг (через запятую)</span>
                        <input id="bm2_custom_genre" class="bm2_input" type="text" placeholder="Например: Пост-советский киберпанк, детектив..." />
                    </div>
                </div>

                <div class="bm2_card">
                    <div class="bm2_card_title">
                        <span>✒️ Авторский слог и подача</span>
                    </div>
                    <input id="bm2_author_voice" class="bm2_input" type="text" placeholder="Например: Донна Тартт, Гиллиан Флинн, мрачный кинематографичный реализм..." />
                </div>

                <div class="bm2_card">
                    <div class="bm2_card_title">
                        <span>🎚️ Баланс сцены и темп повествования</span>
                    </div>
                    <div class="bm2_slider_block">
                        <div class="bm2_slider_head">
                            <span>⚡ Экшен и физическое действие</span>
                            <span id="bm2_lbl_action" class="bm2_slider_badge">45%</span>
                        </div>
                        <input id="bm2_sl_action" class="bm2_range" type="range" min="0" max="100" step="5" />
                    </div>
                    <div class="bm2_slider_block">
                        <div class="bm2_slider_head">
                            <span>🌿 Описания, атмосфера и детали</span>
                            <span id="bm2_lbl_description" class="bm2_slider_badge">70%</span>
                        </div>
                        <input id="bm2_sl_description" class="bm2_range" type="range" min="0" max="100" step="5" />
                    </div>
                    <div class="bm2_slider_block">
                        <div class="bm2_slider_head">
                            <span>💬 Диалоги и живая речь</span>
                            <span id="bm2_lbl_dialogue" class="bm2_slider_badge">65%</span>
                        </div>
                        <input id="bm2_sl_dialogue" class="bm2_range" type="range" min="0" max="100" step="5" />
                    </div>
                    <div class="bm2_slider_block">
                        <div class="bm2_slider_head">
                            <span>⏳ Скорость сюжета (0% Слоубёрн — 100% Быстро)</span>
                            <span id="bm2_lbl_pacing" class="bm2_slider_badge">45%</span>
                        </div>
                        <input id="bm2_sl_pacing" class="bm2_range" type="range" min="0" max="100" step="5" />
                    </div>
                </div>

                <div class="bm2_card">
                    <div class="bm2_card_title">
                        <span>📜 Дополнительные правила стиля для ИИ</span>
                    </div>
                    <textarea id="bm2_custom_directives" class="bm2_textarea" placeholder="Любые постоянные пожелания к стилю текста..."></textarea>
                </div>
            </div>

            <!-- TAB 4: THEMES -->
            <div id="bm2_pane_themes" class="bm2_pane">
                <div class="bm2_card">
                    <div class="bm2_card_title">
                        <span>🎨 Коллекция тем оформления BlueMoon (16 тем)</span>
                    </div>
                    <div id="bm2_theme_gallery" class="bm2_theme_gallery"></div>
                </div>
            </div>
        </div>
    </div>
</div>`;
}

function buildRoleOptionsHtml(profile, selectedRoleId) {
    const allRoles = getAllRoles(profile);
    let html = '';
    for (const [catKey, catTitle] of Object.entries(ROLE_CATEGORIES)) {
        const groupRoles = allRoles.filter((r) => (r.category || 'custom') === catKey);
        if (groupRoles.length === 0) continue;
        html += `<optgroup label="${escapeHtml(catTitle)}">`;
        for (const r of groupRoles) {
            const sel = r.id === selectedRoleId ? 'selected' : '';
            html += `<option value="${escapeHtml(r.id)}" ${sel}>${escapeHtml(r.label)}</option>`;
        }
        html += `</optgroup>`;
    }
    return html;
}

function buildMutualityOptionsHtml(nameA, nameB, selectedMutualityId) {
    return CRUSH_MUTUALITY.map((m) => {
        const info = getMutualityInfo(m.id, nameA, nameB);
        const sel = m.id === selectedMutualityId ? 'selected' : '';
        return `<option value="${escapeHtml(m.id)}" ${sel}>${escapeHtml(info.label)}</option>`;
    }).join('');
}

function promptAddCustomRole() {
    const ruName = window.prompt('Введи название своего статуса отношений (например: Тайный куратор, Кровный должник, Сообщники):');
    if (!ruName || !ruName.trim()) return null;

    const hint = window.prompt(
        'Как персонажи должны вести себя друг с другом в этом статусе? (кратко, можно на русском или английском):',
        `Особый статус отношений: ${ruName.trim()}. Отыгрывать соответствующую дистанцию, тон и контекст.`
    );

    const profile = getProfileData();
    const id = `custom_${Date.now()}`;
    const newRole = {
        id,
        category: 'custom',
        label: ruName.trim(),
        en: ruName.trim(),
        promptHint: (hint && hint.trim()) ? hint.trim() : `Custom relationship role: ${ruName.trim()}.`,
    };
    profile.customRoles.push(newRole);
    saveSettings();
    toastr.success(`Статус «${newRole.label}» добавлен!`, 'BlueMoon');
    return newRole.id;
}

function renderRelationshipsTab() {
    const s = getSettings();
    const profile = getProfileData();
    $('#bm2_story_date_input').val(profile.currentStoryDate || 'День 1');

    const $strip = $('#bm2_participants_strip').empty();
    for (const p of profile.participants) {
        if (!p) continue;
        const badgeText = p.role === 'user' ? 'Игрок' : p.role === 'char' ? 'Персонаж' : 'NPC';
        const initial = (p.name || '?').charAt(0).toUpperCase();
        const avatarInner = p.avatar
            ? `<img src="${escapeHtml(p.avatar)}" alt="" onerror="this.style.display='none';this.parentNode.textContent='${initial}';" />`
            : initial;

        const delBtn = p.role === 'npc' ? `<span class="bm2_p_del" data-del-id="${p.id}" title="Удалить NPC">✕</span>` : '';

        const $chip = $(`
            <div class="bm2_p_chip ${selectedParticipantId === p.id ? 'active' : ''}" data-pid="${p.id}">
                <div class="bm2_p_avatar">${avatarInner}</div>
                <div class="bm2_p_info">
                    <span class="bm2_p_name">${escapeHtml(p.name)}</span>
                    <span class="bm2_p_role">${badgeText}</span>
                </div>
                <div class="bm2_p_actions">
                    <button class="bm2_p_act_btn" data-upload-id="${p.id}" title="Загрузить фото с телефона">📷</button>
                    <button class="bm2_p_act_btn" data-url-id="${p.id}" title="Вставить ссылку на картинку">🔗</button>
                    ${delBtn}
                </div>
            </div>
        `);
        $strip.append($chip);
    }

    const pOpts = profile.participants
        .filter(Boolean)
        .map((p) => `<option value="${escapeHtml(p.id)}">${escapeHtml(p.name)}</option>`)
        .join('');
    $('#bm2_new_link_a').html(pOpts);
    $('#bm2_new_link_b').html(pOpts);
    if (profile.participants.length >= 2) {
        $('#bm2_new_link_b').val(profile.participants[1].id);
    }
    $('#bm2_new_link_role').html(buildRoleOptionsHtml(profile, 'acquaintances'));

    const updateNewLinkMutualityLabels = () => {
        const pMapLocal = new Map(profile.participants.filter(Boolean).map((p) => [p.id, p]));
        const pA = pMapLocal.get($('#bm2_new_link_a').val()) || profile.participants[0];
        const pB = pMapLocal.get($('#bm2_new_link_b').val()) || profile.participants[1] || profile.participants[0];
        const curMut = $('#bm2_new_link_mutuality').val() || 'none';
        $('#bm2_new_link_mutuality').html(buildMutualityOptionsHtml(pA?.name || 'А', pB?.name || 'Б', curMut));
    };
    updateNewLinkMutualityLabels();

    if (profile.participants.length >= 2 && profile.relationships.length === 0) {
        getOrCreateRelationship(profile, profile.participants[0].id, profile.participants[1].id);
    }

    const validPIds = new Set(profile.participants.filter(Boolean).map((p) => p.id));
    if (s.relFilterActor !== 'ALL' && !validPIds.has(s.relFilterActor)) {
        s.relFilterActor = 'ALL';
    }

    const $pills = $('#bm2_actor_filter_pills').empty();
    const totalCount = profile.relationships.length;
    $pills.append(`
        <button class="bm2_actor_pill ${s.relFilterActor === 'ALL' ? 'active' : ''}" data-actor="ALL">
            Все связи <span class="bm2_pill_cnt">${totalCount}</span>
        </button>
    `);

    for (const p of profile.participants) {
        if (!p) continue;
        const cnt = profile.relationships.filter((r) => r && (r.sourceId === p.id || r.targetId === p.id)).length;
        $pills.append(`
            <button class="bm2_actor_pill ${s.relFilterActor === p.id ? 'active' : ''}" data-actor="${escapeHtml(p.id)}">
                ${escapeHtml(p.name)} <span class="bm2_pill_cnt">${cnt}</span>
            </button>
        `);
    }

    $('.bm2_mode_btn').removeClass('active');
    $(`.bm2_mode_btn[data-mode="${s.relGroupMode || 'category'}"]`).addClass('active');

    const pMap = new Map(profile.participants.filter(Boolean).map((p) => [p.id, p]));
    const filteredRels = profile.relationships.filter((rel) => {
        if (!rel) return false;
        const pA = pMap.get(rel.sourceId);
        const pB = pMap.get(rel.targetId);
        if (!pA || !pB) return false;
        if (s.relFilterActor !== 'ALL' && rel.sourceId !== s.relFilterActor && rel.targetId !== s.relFilterActor) {
            return false;
        }
        return true;
    });

    if ((!selectedRelId || !filteredRels.some((r) => r.id === selectedRelId)) && filteredRels.length > 0) {
        selectedRelId = filteredRels[0].id;
    }

    const $pairSelect = $('#bm2_pair_select').empty();
    const $directory = $('#bm2_rel_directory').empty();

    if (filteredRels.length === 0) {
        $pairSelect.append(`<option value="">Нет связей для выбранного фильтра</option>`);
        $directory.html(`<div style="font-size:0.78rem; color:var(--bm-muted); padding:8px;">Связей пока нет. Нажми «+ Добавить связь вручную» выше.</div>`);
        $('#bm2_rel_editor_box').hide();
        return;
    }

    $('#bm2_rel_editor_box').show();

    if ((s.relGroupMode || 'category') === 'category') {
        for (const [catKey, catTitle] of Object.entries(ROLE_CATEGORIES)) {
            const catRels = filteredRels.filter((r) => {
                const rInfo = getRoleInfo(r.roleId, profile);
                return (rInfo.category || 'custom') === catKey;
            });
            if (catRels.length === 0) continue;

            const $optGroup = $(`<optgroup label="${escapeHtml(catTitle)} (${catRels.length})"></optgroup>`);
            const $dirSection = $(`
                <div class="bm2_dir_section">
                    <div class="bm2_dir_header">${escapeHtml(catTitle)} <span>${catRels.length}</span></div>
                    <div class="bm2_dir_items"></div>
                </div>
            `);
            const $itemsBox = $dirSection.find('.bm2_dir_items');

            for (const rel of catRels) {
                const pA = pMap.get(rel.sourceId);
                const pB = pMap.get(rel.targetId);
                const rInfo = getRoleInfo(rel.roleId, profile);
                const mutInfo = getMutualityInfo(rel.mutuality || 'none', pA.name, pB.name);
                const affStr = formatAffinity(rel.affinity);
                const isSel = rel.id === selectedRelId;
                const mutIcon = mutInfo.id !== 'none' ? ' 💘' : '';

                const labelText = `${pA.name} ↔ ${pB.name} [${rInfo.label}${mutIcon} • ${affStr}]`;
                $optGroup.append(`<option value="${escapeHtml(rel.id)}" ${isSel ? 'selected' : ''}>${escapeHtml(labelText)}</option>`);

                const affClass = rel.affinity > 10 ? 'pos' : rel.affinity < -10 ? 'neg' : 'neu';
                $itemsBox.append(`
                    <div class="bm2_dir_item ${isSel ? 'active' : ''}" data-rel-id="${escapeHtml(rel.id)}">
                        <div class="bm2_dir_pair">${escapeHtml(pA.name)} ↔ ${escapeHtml(pB.name)}</div>
                        <div class="bm2_dir_meta">
                            <span class="bm2_dir_role">${escapeHtml(rInfo.label)}${mutIcon}</span>
                            <span class="bm2_dir_aff ${affClass}">${affStr}</span>
                        </div>
                    </div>
                `);
            }

            $pairSelect.append($optGroup);
            $directory.append($dirSection);
        }
    } else {
        for (const person of profile.participants) {
            if (!person) continue;
            if (s.relFilterActor !== 'ALL' && person.id !== s.relFilterActor) continue;
            const charRels = filteredRels.filter((r) => r.sourceId === person.id || r.targetId === person.id);
            if (charRels.length === 0) continue;

            const $optGroup = $(`<optgroup label="👤 ${escapeHtml(person.name)} (${charRels.length})"></optgroup>`);
            const $dirSection = $(`
                <div class="bm2_dir_section">
                    <div class="bm2_dir_header">👤 Связи: ${escapeHtml(person.name)} <span>${charRels.length}</span></div>
                    <div class="bm2_dir_items"></div>
                </div>
            `);
            const $itemsBox = $dirSection.find('.bm2_dir_items');

            for (const rel of charRels) {
                const pA = pMap.get(rel.sourceId);
                const pB = pMap.get(rel.targetId);
                const other = pA.id === person.id ? pB : pA;
                const rInfo = getRoleInfo(rel.roleId, profile);
                const mutInfo = getMutualityInfo(rel.mutuality || 'none', pA.name, pB.name);
                const affStr = formatAffinity(rel.affinity);
                const isSel = rel.id === selectedRelId;
                const mutIcon = mutInfo.id !== 'none' ? ' 💘' : '';

                const labelText = `${person.name} → ${other.name} [${rInfo.label}${mutIcon} • ${affStr}]`;
                $optGroup.append(`<option value="${escapeHtml(rel.id)}" ${isSel ? 'selected' : ''}>${escapeHtml(labelText)}</option>`);

                const affClass = rel.affinity > 10 ? 'pos' : rel.affinity < -10 ? 'neg' : 'neu';
                $itemsBox.append(`
                    <div class="bm2_dir_item ${isSel ? 'active' : ''}" data-rel-id="${escapeHtml(rel.id)}">
                        <div class="bm2_dir_pair">→ ${escapeHtml(other.name)}</div>
                        <div class="bm2_dir_meta">
                            <span class="bm2_dir_role">${escapeHtml(rInfo.label)}${mutIcon}</span>
                            <span class="bm2_dir_aff ${affClass}">${affStr}</span>
                        </div>
                    </div>
                `);
            }

            $pairSelect.append($optGroup);
            $directory.append($dirSection);
        }
    }

    $pairSelect.val(selectedRelId);
    renderSelectedRelationshipDetails();
}

function renderSelectedRelationshipDetails() {
    const profile = getProfileData();
    const rel = profile.relationships.find((r) => r && r.id === selectedRelId);
    if (!rel) return;

    const pMap = new Map(profile.participants.filter(Boolean).map((p) => [p.id, p]));
    const pA = pMap.get(rel.sourceId);
    const pB = pMap.get(rel.targetId);
    const roleInfo = getRoleInfo(rel.roleId, profile);
    const nameA = pA?.name || 'Персонаж А';
    const nameB = pB?.name || 'Персонаж Б';
    const mutInfo = getMutualityInfo(rel.mutuality || 'none', nameA, nameB);

    if (pA && pB) {
        const mutBadge = mutInfo.id !== 'none'
            ? `<div style="font-size:0.75rem; color:var(--bm-accent); margin-top:3px;">💘 ${escapeHtml(mutInfo.label)}</div>`
            : '';
        $('#bm2_active_pair_banner').html(`
            <div class="bm2_banner_names">${escapeHtml(pA.name)} <span>↔</span> ${escapeHtml(pB.name)}</div>
            <div class="bm2_banner_role">${escapeHtml(roleInfo.label)} • ${formatAffinity(rel.affinity)}${mutBadge}</div>
        `);
    }

    $('#bm2_role_select').html(buildRoleOptionsHtml(profile, rel.roleId));

    $('#bm2_mutuality_box').show();
    $('#bm2_mutuality_select').html(buildMutualityOptionsHtml(nameA, nameB, rel.mutuality || 'none'));

    const secrecyExplanation = {
        none: 'ИИ отыгрывает только основной статус связи без скрытой романтики.',
        mutual_open: `Оба (${nameA} и ${nameB}) открыто проявляют взаимную симпатию и флирт.`,
        mutual_secret: `🔒 Защита тайны: ${nameA} и ${nameB} тайно влюблены друг в друга, но ОБА скрывают это и не знают, что чувства взаимны. ИИ запрещено «читать мысли».`,
        secret_relationship: `🔒 Защита тайны: ${nameA} и ${nameB} знают о своих чувствах/связи, но скрывают её от ВСЕХ остальных персонажей и NPC.`,
        one_way_a_to_b: `🔒 Защита от всеведения ИИ: Только ${nameA} тайно влюблён(а) в ${nameB}. ${nameB} и все остальные NPC НЕ ЗНАЮТ об этом и не могут догадываться!`,
        one_way_b_to_a: `🔒 Защита от всеведения ИИ: Только ${nameB} тайно влюблён(а) в ${nameA}. ${nameA} и все остальные NPC НЕ ЗНАЮТ об этом и не могут догадываться!`,
        unspoken_tension: `Скрытая химия и притяжение между ${nameA} и ${nameB}, которое оба отрицают и не показывают окружающим.`,
        residual_chemistry: `Неостывшие чувства или сложная романтическая история прошлого между ${nameA} и ${nameB}.`,
    };
    $('#bm2_mutuality_hint').text(secrecyExplanation[rel.mutuality || 'none'] || '');

    updateBipolarMeterUI(rel.affinity);
    $('#bm2_rel_summary').val(rel.summary || '');

    const $evList = $('#bm2_events_list').empty();
    if (!Array.isArray(rel.events) || rel.events.length === 0) {
        $evList.append(`<div style="font-size:0.78rem; color:var(--bm-muted); padding:4px;">Пока нет записанных событий. Они появятся автоматически по ходу сюжета или добавь их ниже.</div>`);
    } else {
        rel.events.forEach((ev, idx) => {
            $evList.append(`
                <div class="bm2_event_item">
                    <span class="bm2_event_date">${escapeHtml(ev.date || 'Дата')}</span>
                    <span class="bm2_event_text">${escapeHtml(ev.text)}</span>
                    <span class="bm2_event_del" data-ev-idx="${idx}" title="Удалить">✕</span>
                </div>
            `);
        });
    }
}

function updateBipolarMeterUI(val) {
    const aff = clampAffinity(val);
    $('#bm2_affinity_slider').val(aff);
    $('#bm2_affinity_val')
        .text(formatAffinity(aff))
        .css('color', aff > 10 ? 'var(--bm-pos)' : aff < -10 ? 'var(--bm-neg)' : 'var(--bm-text)');
    $('#bm2_affinity_tier').text(getAffinityTierLabel(aff));

    if (aff < 0) {
        $('#bm2_meter_neg_fill').css('width', `${Math.abs(aff) / 2}%`);
        $('#bm2_meter_pos_fill').css('width', '0%');
    } else {
        $('#bm2_meter_neg_fill').css('width', '0%');
        $('#bm2_meter_pos_fill').css('width', `${aff / 2}%`);
    }
}

function syncCanvasResolution() {
    const canvas = document.getElementById('bm2_graph_canvas');
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    if (rect.width < 20 || rect.height < 20) return null;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const targetW = Math.round(rect.width * dpr);
    const targetH = Math.round(rect.height * dpr);

    if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
    }
    return { canvas, width: rect.width, height: rect.height, dpr };
}

function autoArrangeNodesInCircle(width, height) {
    const profile = getProfileData();
    const count = profile.participants.length;
    if (count === 0) return;

    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.max(65, Math.min(width, height) * 0.33);

    profile.participants.forEach((p, idx) => {
        if (!p) return;
        const angle = (idx / count) * Math.PI * 2 - Math.PI / 2;
        p.x = Math.round(cx + Math.cos(angle) * radius);
        p.y = Math.round(cy + Math.sin(angle) * radius);
    });
    graphState.offsetX = 0;
    graphState.offsetY = 0;
    saveSettings();
}

function renderGraphNodes() {
    const profile = getProfileData();
    const metrics = syncCanvasResolution();
    const w = metrics ? metrics.width : 340;
    const h = metrics ? metrics.height : 360;
    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.max(65, Math.min(w, h) * 0.33);

    graphState.nodes = profile.participants.filter(Boolean).map((p, idx) => {
        const angle = (idx / Math.max(1, profile.participants.length)) * Math.PI * 2 - Math.PI / 2;
        if (typeof p.x !== 'number' || typeof p.y !== 'number' || Number.isNaN(p.x) || Number.isNaN(p.y)) {
            p.x = Math.round(cx + Math.cos(angle) * radius);
            p.y = Math.round(cy + Math.sin(angle) * radius);
        }
        let imgObj = null;
        if (p.avatar) {
            imgObj = new Image();
            imgObj.src = p.avatar;
        }
        return {
            id: p.id,
            name: p.name,
            role: p.role,
            x: p.x,
            y: p.y,
            r: p.role === 'npc' ? 22 : 26,
            img: imgObj,
            ref: p,
        };
    });

    graphState.edges = profile.relationships.filter(Boolean).map((r) => ({
        id: r.id,
        sourceId: r.sourceId,
        targetId: r.targetId,
        affinity: clampAffinity(r.affinity),
        roleLabel: getRoleInfo(r.roleId, profile).label,
        hasRomance: (r.mutuality && r.mutuality !== 'none'),
    }));

    drawObsidianGraph();
}

function drawObsidianGraph() {
    const metrics = syncCanvasResolution();
    if (!metrics) return;
    const { canvas, width: w, height: h, dpr } = metrics;
    const ctx = canvas.getContext('2d');

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const styles = getComputedStyle(document.getElementById('bm2_overlay') || document.documentElement);
    const accent = styles.getPropertyValue('--bm-accent').trim() || '#7aa2f7';
    const posColor = styles.getPropertyValue('--bm-pos').trim() || '#4ade80';
    const negColor = styles.getPropertyValue('--bm-neg').trim() || '#fb7185';
    const textColor = styles.getPropertyValue('--bm-text').trim() || '#eef2ff';

    ctx.translate(graphState.offsetX, graphState.offsetY);

    const nodeMap = new Map(graphState.nodes.map((n) => [n.id, n]));

    for (const edge of graphState.edges) {
        const nA = nodeMap.get(edge.sourceId);
        const nB = nodeMap.get(edge.targetId);
        if (!nA || !nB) continue;

        const isSelected = edge.id === selectedRelId;
        ctx.beginPath();
        ctx.moveTo(nA.x, nA.y);
        ctx.lineTo(nB.x, nB.y);

        if (edge.affinity > 12) {
            ctx.strokeStyle = posColor;
        } else if (edge.affinity < -12) {
            ctx.strokeStyle = negColor;
        } else {
            ctx.strokeStyle = 'rgba(160, 175, 220, 0.42)';
        }

        ctx.lineWidth = isSelected ? 3.2 : 1.7 + Math.abs(edge.affinity) / 55;
        ctx.stroke();

        const mx = (nA.x + nB.x) / 2;
        const my = (nA.y + nB.y) / 2;
        const shortRole = edge.roleLabel.length > 12 ? `${edge.roleLabel.slice(0, 11)}…` : edge.roleLabel;
        const heart = edge.hasRomance ? '💘 ' : '';
        const label = `${heart}${shortRole} (${formatAffinity(edge.affinity)})`;

        ctx.font = '600 10px sans-serif';
        const tw = ctx.measureText(label).width + 10;
        ctx.fillStyle = isSelected ? 'rgba(20, 28, 52, 0.96)' : 'rgba(10, 14, 26, 0.84)';
        ctx.beginPath();
        ctx.roundRect(mx - tw / 2, my - 9, tw, 18, 6);
        ctx.fill();

        if (isSelected) {
            ctx.strokeStyle = accent;
            ctx.lineWidth = 1.2;
            ctx.stroke();
        }

        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, mx, my);
    }

    for (const node of graphState.nodes) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r + 3, 0, Math.PI * 2);
        ctx.fillStyle = node.role === 'user' ? accent : node.role === 'char' ? posColor : 'rgba(180,190,230,0.45)';
        ctx.shadowColor = accent;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
        ctx.clip();

        if (node.img && node.img.complete && node.img.naturalWidth > 0) {
            ctx.drawImage(node.img, node.x - node.r, node.y - node.r, node.r * 2, node.r * 2);
        } else {
            ctx.fillStyle = '#182039';
            ctx.fillRect(node.x - node.r, node.y - node.r, node.r * 2, node.r * 2);
            ctx.fillStyle = textColor;
            ctx.font = 'bold 14px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText((node.name || '?').charAt(0).toUpperCase(), node.x, node.y);
        }
        ctx.restore();

        ctx.font = '600 11px sans-serif';
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.fillText(node.name, node.x, node.y + node.r + 14);
    }

    ctx.restore();
}

function bindGraphCanvasEvents() {
    const canvas = document.getElementById('bm2_graph_canvas');
    if (!canvas) return;

    if (typeof ResizeObserver !== 'undefined' && !graphState.resizeObserver) {
        graphState.resizeObserver = new ResizeObserver(() => {
            if ($('#bm2_pane_graph').hasClass('active')) {
                drawObsidianGraph();
            }
        });
        graphState.resizeObserver.observe(canvas);
    }

    const getCoords = (e) => {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: clientX - rect.left - graphState.offsetX,
            y: clientY - rect.top - graphState.offsetY,
            rawX: clientX,
            rawY: clientY,
        };
    };

    const onStart = (e) => {
        const pt = getCoords(e);
        graphState.lastTouchX = pt.rawX;
        graphState.lastTouchY = pt.rawY;

        for (let i = graphState.nodes.length - 1; i >= 0; i--) {
            const n = graphState.nodes[i];
            const dist = Math.hypot(pt.x - n.x, pt.y - n.y);
            if (dist <= n.r + 8) {
                graphState.draggingNode = n;
                e.preventDefault();
                return;
            }
        }

        const nodeMap = new Map(graphState.nodes.map((n) => [n.id, n]));
        for (const edge of graphState.edges) {
            const nA = nodeMap.get(edge.sourceId);
            const nB = nodeMap.get(edge.targetId);
            if (!nA || !nB) continue;
            const mx = (nA.x + nB.x) / 2;
            const my = (nA.y + nB.y) / 2;
            if (Math.hypot(pt.x - mx, pt.y - my) < 34) {
                selectedRelId = edge.id;
                drawObsidianGraph();
                renderRelationshipsTab();
                $('.bm2_tab[data-tab="rel"]').trigger('click');
                e.preventDefault();
                return;
            }
        }

        graphState.isPanning = true;
    };

    const onMove = (e) => {
        if (!graphState.draggingNode && !graphState.isPanning) return;
        const pt = getCoords(e);
        if (graphState.draggingNode) {
            graphState.draggingNode.x = pt.x;
            graphState.draggingNode.y = pt.y;
            graphState.draggingNode.ref.x = Math.round(pt.x);
            graphState.draggingNode.ref.y = Math.round(pt.y);
            drawObsidianGraph();
            e.preventDefault();
        } else if (graphState.isPanning) {
            graphState.offsetX += pt.rawX - graphState.lastTouchX;
            graphState.offsetY += pt.rawY - graphState.lastTouchY;
            graphState.lastTouchX = pt.rawX;
            graphState.lastTouchY = pt.rawY;
            drawObsidianGraph();
            e.preventDefault();
        }
    };

    const onEnd = () => {
        if (graphState.draggingNode) {
            saveSettings();
        }
        graphState.draggingNode = null;
        graphState.isPanning = false;
    };

    canvas.addEventListener('mousedown', onStart);
    canvas.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onEnd);

    canvas.addEventListener('touchstart', onStart, { passive: false });
    canvas.addEventListener('touchmove', onMove, { passive: false });
    canvas.addEventListener('touchend', onEnd);
}

function renderStyleTab() {
    const s = getSettings();
    const sc = s.styleConfig;

    $('#bm2_genre_intensity').val(sc.genreIntensity || 'strict');
    $('#bm2_custom_genre').val(sc.customGenre || '');
    $('#bm2_author_voice').val(sc.authorVoice || '');
    $('#bm2_custom_directives').val(sc.customDirectives || '');

    const $grid = $('#bm2_genre_chips').empty();
    for (const g of GENRE_PRESETS) {
        const active = Array.isArray(sc.genres) && sc.genres.includes(g.id);
        $grid.append(`
            <div class="bm2_chip ${active ? 'active' : ''}" data-genre-id="${g.id}">
                ${escapeHtml(g.label)}
            </div>
        `);
    }

    const sl = sc.sliders || DEFAULT_SETTINGS.styleConfig.sliders;
    for (const key of ['action', 'description', 'dialogue', 'pacing']) {
        const val = sl[key] ?? 50;
        $(`#bm2_sl_${key}`).val(val);
        $(`#bm2_lbl_${key}`).text(`${val}%`);
    }
}

function renderThemesTab() {
    const s = getSettings();
    const $gal = $('#bm2_theme_gallery').empty();

    for (const t of THEMES) {
        const active = s.activeTheme === t.id;
        const dots = t.colors.map((c) => `<span class="bm2_swatch_dot" style="background:${c};"></span>`).join('');
        $gal.append(`
            <div class="bm2_theme_card ${active ? 'active' : ''}" data-theme-id="${t.id}">
                <div class="bm2_theme_swatches">${dots}</div>
                <div class="bm2_theme_name">${escapeHtml(t.name)}</div>
                <div class="bm2_theme_desc">${escapeHtml(t.desc)}</div>
            </div>
        `);
    }
}

function applyTheme(themeId) {
    const s = getSettings();
    s.activeTheme = themeId;
    $('#bm2_overlay').attr('data-bm-theme', themeId);
    saveSettings();
}

function ensureModalInDom() {
    if (!document.getElementById('bm2_overlay')) {
        $('body').append(createModalHtml());
        bindModalEvents();
        bindGraphCanvasEvents();
    }
}

function openBlueMoonModal(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();

    try {
        ensureModalInDom();
        const overlayEl = document.getElementById('bm2_overlay');
        if (overlayEl) {
            overlayEl.style.setProperty('display', 'flex', 'important');
            overlayEl.style.setProperty('z-index', '2147483600', 'important');
        }
        $('#extensionsMenu').hide();
    } catch (domErr) {
        console.error(`[${MODULE_NAME}] Critical DOM open error:`, domErr);
    }

    try {
        const s = getSettings();
        applyTheme(s.activeTheme || 'moonlight');
    } catch (err) {
        console.error(`[${MODULE_NAME}] applyTheme error:`, err);
    }

    try {
        renderRelationshipsTab();
    } catch (err) {
        console.error(`[${MODULE_NAME}] renderRelationshipsTab error:`, err);
        toastr.error(`Ошибка отрисовки вкладки связей: ${err.message}`, 'BlueMoon');
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

    try {
        renderGraphNodes();
    } catch (err) {
        console.error(`[${MODULE_NAME}] renderGraphNodes error:`, err);
    }
}

function closeBlueMoonModal() {
    const overlayEl = document.getElementById('bm2_overlay');
    if (overlayEl) {
        overlayEl.style.setProperty('display', 'none', 'important');
    }
}

function populateConnectionProfiles() {
    const s = getSettings();
    const ctx = getContext();
    const $sel = $('#bm2_connection_profile');
    if (!$sel.length) return;

    $sel.empty().append(`<option value="">Текущее активное подключение SillyTavern</option>`);
    const profiles = ctx.extensionSettings?.connectionManager?.profiles || [];
    if (Array.isArray(profiles)) {
        for (const p of profiles) {
            if (p && p.id && p.name) {
                $sel.append(`<option value="${escapeHtml(p.id)}">${escapeHtml(p.name)}</option>`);
            }
        }
    }
    $sel.val(s.connectionProfileId || '');
}

function injectWandMenuButton() {
    const menu = document.getElementById('extensionsMenu');
    if (!menu) return;

    let item = document.getElementById('bm2_wand_menu_item');
    if (!item) {
        item = document.createElement('div');
        item.id = 'bm2_wand_menu_item';
        item.className = 'list-group-item flex-container flexGap5 interactable';
        item.tabIndex = 0;
        item.title = 'Открыть BlueMoon: Отношения, Древо и Стиль';
        item.innerHTML = `
            <div class="fa-solid fa-moon extensionsMenuExtensionButton"></div>
            <span>BlueMoon: Отношения и Стиль</span>
        `;
        item.addEventListener('click', (ev) => {
            openBlueMoonModal(ev);
        });
        menu.appendChild(item);
    }
}

function bindModalEvents() {
    let uploadTargetId = null;

    $(document).on('click', '#bm2_btn_close', () => {
        closeBlueMoonModal();
    });

    $(document).on('click', '#bm2_overlay', (e) => {
        if (e.target.id === 'bm2_overlay') {
            closeBlueMoonModal();
        }
    });

    $(document).on('click', '.bm2_tab', function () {
        const tab = $(this).data('tab');
        $('.bm2_tab').removeClass('active');
        $(this).addClass('active');
        $('.bm2_pane').removeClass('active');
        $(`#bm2_pane_${tab}`).addClass('active');
        if (tab === 'graph') {
            requestAnimationFrame(() => {
                renderGraphNodes();
            });
        }
    });

    $(document).on('change', '#bm2_story_date_input', function () {
        const profile = getProfileData();
        profile.currentStoryDate = $(this).val().trim() || 'День 1';
        saveSettings();
        updatePromptInjections();
    });

    $(document).on('click', '#bm2_btn_next_day', () => {
        const profile = getProfileData();
        const cur = profile.currentStoryDate || 'День 1';
        const m = cur.match(/(.*?)(\d+)(.*)/);
        if (m) {
            profile.currentStoryDate = `${m[1]}${Number(m[2]) + 1}${m[3]}`;
        } else {
            profile.currentStoryDate = `${cur} (+1 день)`;
        }
        $('#bm2_story_date_input').val(profile.currentStoryDate);
        saveSettings();
        updatePromptInjections();
    });

    $(document).on('click', '#bm2_btn_analyze_now', () => {
        analyzeAllRelationshipsWithLLM(true);
    });

    $(document).on('click', '#bm2_btn_export_json', () => {
        exportRelationshipsJson();
    });

    $(document).on('click', '#bm2_btn_import_json', () => {
        $('#bm2_hidden_import_input').val('').trigger('click');
    });

    $(document).on('change', '#bm2_hidden_import_input', function (e) {
        const file = e.target.files?.[0];
        if (file) {
            importRelationshipsJsonFile(file);
        }
    });

    $(document).on('click', '#bm2_btn_add_npc', () => {
        const name = $('#bm2_new_npc_name').val().trim();
        if (!name) return;
        const profile = getProfileData();
        const newId = `npc_${Date.now()}`;
        const newNpc = {
            id: newId,
            name,
            role: 'npc',
            avatar: '',
            x: 170 + Math.round((Math.random() - 0.5) * 110),
            y: 170 + Math.round((Math.random() - 0.5) * 110),
        };
        profile.participants.push(newNpc);

        for (const p of profile.participants) {
            if (p && p.id !== newId) {
                getOrCreateRelationship(profile, newId, p.id);
            }
        }
        $('#bm2_new_npc_name').val('');
        saveSettings();
        updatePromptInjections();
        renderRelationshipsTab();
        renderGraphNodes();
        toastr.success(`NPC «${name}» добавлен в сеть связей`, 'BlueMoon');
    });

    $(document).on('click', '.bm2_p_del', function (e) {
        e.stopPropagation();
        const delId = $(this).data('del-id');
        const profile = getProfileData();
        profile.participants = profile.participants.filter((p) => p && p.id !== delId);
        profile.relationships = profile.relationships.filter((r) => r && r.sourceId !== delId && r.targetId !== delId);
        saveSettings();
        updatePromptInjections();
        renderRelationshipsTab();
        renderGraphNodes();
    });

    $(document).on('click', '[data-upload-id]', function (e) {
        e.stopPropagation();
        uploadTargetId = $(this).data('upload-id');
        $('#bm2_hidden_file_input').val('').trigger('click');
    });

    $(document).on('change', '#bm2_hidden_file_input', async function (e) {
        const file = e.target.files?.[0];
        if (!file || !uploadTargetId) return;
        try {
            const dataUrl = await compressImageFileToDataUrl(file, 160, 0.82);
            const profile = getProfileData();
            const p = profile.participants.find((x) => x && x.id === uploadTargetId);
            if (p) {
                p.avatar = dataUrl;
                p.customAvatar = true;
                saveSettings();
                renderRelationshipsTab();
                renderGraphNodes();
                toastr.success(`Фото для ${p.name} обновлено`, 'BlueMoon');
            }
        } catch (err) {
            console.error(`[${MODULE_NAME}] Image upload failed:`, err);
            toastr.error('Не удалось обработать изображение', 'BlueMoon');
        }
    });

    $(document).on('click', '[data-url-id]', function (e) {
        e.stopPropagation();
        const targetId = $(this).data('url-id');
        const profile = getProfileData();
        const p = profile.participants.find((x) => x && x.id === targetId);
        if (!p) return;
        const url = window.prompt(`Вставь прямую ссылку (URL) на аватарку для ${p.name}:`, p.avatar?.startsWith('http') ? p.avatar : '');
        if (url !== null) {
            p.avatar = url.trim();
            p.customAvatar = Boolean(url.trim());
            saveSettings();
            renderRelationshipsTab();
            renderGraphNodes();
        }
    });

    $(document).on('click', '.bm2_actor_pill', function () {
        const s = getSettings();
        s.relFilterActor = String($(this).data('actor') || 'ALL');
        saveSettings();
        renderRelationshipsTab();
    });

    $(document).on('click', '.bm2_mode_btn', function () {
        const s = getSettings();
        s.relGroupMode = String($(this).data('mode') || 'category');
        saveSettings();
        renderRelationshipsTab();
    });

    $(document).on('click', '.bm2_dir_item', function () {
        selectedRelId = String($(this).data('rel-id'));
        $('#bm2_pair_select').val(selectedRelId);
        $('.bm2_dir_item').removeClass('active');
        $(this).addClass('active');
        renderSelectedRelationshipDetails();
    });

    $(document).on('click', '#bm2_btn_toggle_new_link', () => {
        $('#bm2_new_link_drawer').slideToggle(150);
    });

    $(document).on('change', '#bm2_new_link_a, #bm2_new_link_b', () => {
        const profile = getProfileData();
        const pMap = new Map(profile.participants.filter(Boolean).map((p) => [p.id, p]));
        const pA = pMap.get($('#bm2_new_link_a').val());
        const pB = pMap.get($('#bm2_new_link_b').val());
        const curMut = $('#bm2_new_link_mutuality').val() || 'none';
        $('#bm2_new_link_mutuality').html(buildMutualityOptionsHtml(pA?.name || 'А', pB?.name || 'Б', curMut));
    });

    $(document).on('click', '#bm2_btn_create_link_confirm', () => {
        const idA = String($('#bm2_new_link_a').val() || '');
        const idB = String($('#bm2_new_link_b').val() || '');
        if (!idA || !idB || idA === idB) {
            toastr.warning('Выбери двух разных участников для создания связи.', 'BlueMoon');
            return;
        }
        const profile = getProfileData();
        const rel = getOrCreateRelationship(profile, idA, idB);
        if (rel) {
            rel.roleId = String($('#bm2_new_link_role').val() || 'acquaintances');
            rel.mutuality = String($('#bm2_new_link_mutuality').val() || 'none');
            rel.affinity = clampAffinity($('#bm2_new_link_aff').val());
            selectedRelId = rel.id;
            const s = getSettings();
            s.relFilterActor = 'ALL';
            saveSettings();
            updatePromptInjections();
            $('#bm2_new_link_drawer').slideUp(150);
            renderRelationshipsTab();
            renderGraphNodes();
            toastr.success('Связь открыта и сохранена!', 'BlueMoon');
        }
    });

    $(document).on('click', '#bm2_btn_add_custom_role', () => {
        const newRoleId = promptAddCustomRole();
        if (!newRoleId) return;
        const profile = getProfileData();
        const rel = profile.relationships.find((r) => r && r.id === selectedRelId);
        if (rel) {
            rel.roleId = newRoleId;
            saveSettings();
            updatePromptInjections();
        }
        renderRelationshipsTab();
        renderGraphNodes();
    });

    $(document).on('change', '#bm2_pair_select', function () {
        selectedRelId = $(this).val();
        $('.bm2_dir_item').removeClass('active');
        $(`.bm2_dir_item[data-rel-id="${selectedRelId}"]`).addClass('active');
        renderSelectedRelationshipDetails();
    });

    $(document).on('change', '#bm2_role_select', function () {
        const profile = getProfileData();
        const rel = profile.relationships.find((r) => r && r.id === selectedRelId);
        if (!rel) return;
        rel.roleId = $(this).val();
        saveSettings();
        updatePromptInjections();
        renderRelationshipsTab();
        renderGraphNodes();
    });

    $(document).on('change', '#bm2_mutuality_select', function () {
        const profile = getProfileData();
        const rel = profile.relationships.find((r) => r && r.id === selectedRelId);
        if (!rel) return;
        rel.mutuality = $(this).val();
        saveSettings();
        updatePromptInjections();
        renderRelationshipsTab();
        renderGraphNodes();
    });

    $(document).on('input change', '#bm2_affinity_slider', function () {
        const profile = getProfileData();
        const rel = profile.relationships.find((r) => r && r.id === selectedRelId);
        if (!rel) return;
        rel.affinity = clampAffinity($(this).val());
        updateBipolarMeterUI(rel.affinity);
        saveSettings();
        updatePromptInjections();
    });

    $(document).on('change', '#bm2_affinity_slider', () => {
        renderRelationshipsTab();
    });

    $(document).on('click', '#bm2_aff_minus', () => {
        const profile = getProfileData();
        const rel = profile.relationships.find((r) => r && r.id === selectedRelId);
        if (!rel) return;
        rel.affinity = clampAffinity(rel.affinity - 5);
        updateBipolarMeterUI(rel.affinity);
        saveSettings();
        updatePromptInjections();
        renderRelationshipsTab();
    });

    $(document).on('click', '#bm2_aff_plus', () => {
        const profile = getProfileData();
        const rel = profile.relationships.find((r) => r && r.id === selectedRelId);
        if (!rel) return;
        rel.affinity = clampAffinity(rel.affinity + 5);
        updateBipolarMeterUI(rel.affinity);
        saveSettings();
        updatePromptInjections();
        renderRelationshipsTab();
    });

    $(document).on('change', '#bm2_rel_summary', function () {
        const profile = getProfileData();
        const rel = profile.relationships.find((r) => r && r.id === selectedRelId);
        if (!rel) return;
        rel.summary = $(this).val().trim();
        saveSettings();
        updatePromptInjections();
    });

    $(document).on('click', '#bm2_btn_add_event', () => {
        const text = $('#bm2_new_event_text').val().trim();
        if (!text) return;
        const profile = getProfileData();
        const rel = profile.relationships.find((r) => r && r.id === selectedRelId);
        if (!rel) return;
        rel.events.push({
            date: profile.currentStoryDate || 'Событие',
            text,
        });
        $('#bm2_new_event_text').val('');
        saveSettings();
        updatePromptInjections();
        renderSelectedRelationshipDetails();
    });

    $(document).on('click', '.bm2_event_del', function () {
        const idx = Number($(this).data('ev-idx'));
        const profile = getProfileData();
        const rel = profile.relationships.find((r) => r && r.id === selectedRelId);
        if (!rel || !Array.isArray(rel.events)) return;
        rel.events.splice(idx, 1);
        saveSettings();
        updatePromptInjections();
        renderSelectedRelationshipDetails();
    });

    $(document).on('click', '#bm2_graph_reset', () => {
        graphState.offsetX = 0;
        graphState.offsetY = 0;
        drawObsidianGraph();
    });

    $(document).on('click', '#bm2_graph_arrange', () => {
        const metrics = syncCanvasResolution();
        const w = metrics ? metrics.width : 340;
        const h = metrics ? metrics.height : 360;
        autoArrangeNodesInCircle(w, h);
        renderGraphNodes();
        toastr.success('Узлы аккуратно распределены по кругу', 'BlueMoon');
    });

    $(document).on('click', '.bm2_chip[data-genre-id]', function () {
        const gId = $(this).data('genre-id');
        const s = getSettings();
        const arr = s.styleConfig.genres || [];
        const idx = arr.indexOf(gId);
        if (idx >= 0) {
            arr.splice(idx, 1);
        } else {
            arr.push(gId);
        }
        s.styleConfig.genres = arr;
        saveSettings();
        updatePromptInjections();
        renderStyleTab();
    });

    $(document).on('change', '#bm2_genre_intensity', function () {
        const s = getSettings();
        s.styleConfig.genreIntensity = $(this).val();
        saveSettings();
        updatePromptInjections();
    });

    $(document).on('change', '#bm2_custom_genre', function () {
        const s = getSettings();
        s.styleConfig.customGenre = $(this).val().trim();
        saveSettings();
        updatePromptInjections();
    });

    $(document).on('change', '#bm2_author_voice', function () {
        const s = getSettings();
        s.styleConfig.authorVoice = $(this).val().trim();
        saveSettings();
        updatePromptInjections();
    });

    $(document).on('input change', '#bm2_sl_action, #bm2_sl_description, #bm2_sl_dialogue, #bm2_sl_pacing', function () {
        const id = this.id.replace('bm2_sl_', '');
        const val = Number($(this).val());
        const s = getSettings();
        s.styleConfig.sliders[id] = val;
        $(`#bm2_lbl_${id}`).text(`${val}%`);
        saveSettings();
        updatePromptInjections();
    });

    $(document).on('change', '#bm2_custom_directives', function () {
        const s = getSettings();
        s.styleConfig.customDirectives = $(this).val().trim();
        saveSettings();
        updatePromptInjections();
    });

    $(document).on('click', '.bm2_theme_card', function () {
        const themeId = $(this).data('theme-id');
        applyTheme(themeId);
        renderThemesTab();
        drawObsidianGraph();
    });

    $(document).on('click', '#bm2_btn_preview_prompt', () => {
        const rel = buildRelationshipsPrompt();
        const st = buildStylePrompt();
        const combined = [rel, st].filter(Boolean).join('\n\n====================\n\n') || 'Промпт пуст (модули выключены).';
        const ctx = getContext();
        const escaped = `<pre style="text-align:left; white-space:pre-wrap; font-size:0.78rem; max-height:65vh; overflow:auto; padding:10px; background:rgba(0,0,0,0.35); border-radius:8px;">${escapeHtml(combined)}</pre>`;
        if (ctx.callGenericPopup && ctx.POPUP_TYPE) {
            ctx.callGenericPopup(escaped, ctx.POPUP_TYPE.TEXT, '', { wide: true, large: true });
        } else {
            window.alert(combined);
        }
    });
}

function escapeHtml(str) {
    return String(str ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function buildFallbackSettingsHtml() {
    return `
    <div id="bluemoon_settings_block" class="extension_settings">
        <div class="inline-drawer">
            <div class="inline-drawer-toggle inline-drawer-header">
                <b>🌙 BlueMoon: Relationships &amp; Style Engine</b>
                <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
            </div>
            <div class="inline-drawer-content">
                <div class="flex-container flexFlowColumn" style="gap: 8px; padding: 6px 0;">
                    <label class="checkbox_label">
                        <input id="bm2_master_enabled" type="checkbox" />
                        <span>Включить расширение BlueMoon</span>
                    </label>
                    <label class="checkbox_label">
                        <input id="bm2_rel_enabled" type="checkbox" />
                        <span>Инъекция отношений и событий в промпт</span>
                    </label>
                    <label class="checkbox_label">
                        <input id="bm2_rel_auto_analyze" type="checkbox" />
                        <span>Авто-анализ всех связей (Персонажи + NPC) после ответа ИИ</span>
                    </label>
                    <label class="checkbox_label">
                        <input id="bm2_isolate_per_chat" type="checkbox" />
                        <span>Изолировать связи для каждой ветки чата отдельно</span>
                    </label>
                    <label class="checkbox_label">
                        <input id="bm2_style_enabled" type="checkbox" />
                        <span>Инъекция жанра, стиля автора и ползунков темпа</span>
                    </label>
                    <div style="margin-top: 4px;">
                        <label for="bm2_connection_profile"><small>Профиль подключения для фонового анализа связей:</small></label>
                        <select id="bm2_connection_profile" class="text_pole" style="width: 100%;"></select>
                    </div>
                    <div style="margin-top: 4px;">
                        <label for="bm2_injection_depth"><small>Глубина инъекции в чат (Depth, рекомендуется 1):</small></label>
                        <input id="bm2_injection_depth" type="number" class="text_pole" min="0" max="20" step="1" style="width: 90px;" />
                    </div>
                    <div style="margin-top: 6px;">
                        <div id="bm2_open_modal_from_settings" class="menu_button interactable" style="text-align: center; padding: 8px;">
                            🌙 Открыть панель BlueMoon
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
}

async function initSettingsPanel() {
    const s = getSettings();
    try {
        if (!document.getElementById('bluemoon_settings_block')) {
            let html = '';
            try {
                const settingsUrl = new URL('./settings.html', import.meta.url).href;
                html = await $.get(settingsUrl);
            } catch {
                html = buildFallbackSettingsHtml();
            }
            $('#extensions_settings2').append(html);
        }

        $('#bm2_master_enabled').prop('checked', Boolean(s.enabled)).off('change').on('change', function () {
            s.enabled = $(this).is(':checked');
            saveSettings();
            updatePromptInjections();
        });

        $('#bm2_rel_enabled').prop('checked', Boolean(s.relEnabled)).off('change').on('change', function () {
            s.relEnabled = $(this).is(':checked');
            saveSettings();
            updatePromptInjections();
        });

        $('#bm2_rel_auto_analyze').prop('checked', Boolean(s.relAutoAnalyze)).off('change').on('change', function () {
            s.relAutoAnalyze = $(this).is(':checked');
            saveSettings();
        });

        $('#bm2_isolate_per_chat').prop('checked', Boolean(s.isolatePerChat)).off('change').on('change', function () {
            s.isolatePerChat = $(this).is(':checked');
            saveSettings();
            updatePromptInjections();
        });

        $('#bm2_style_enabled').prop('checked', Boolean(s.styleEnabled)).off('change').on('change', function () {
            s.styleEnabled = $(this).is(':checked');
            saveSettings();
            updatePromptInjections();
        });

        $('#bm2_injection_depth').val(s.injectionDepth ?? 1).off('change').on('change', function () {
            s.injectionDepth = Math.max(0, Math.min(20, Number($(this).val()) || 1));
            saveSettings();
            updatePromptInjections();
        });

        populateConnectionProfiles();
        $('#bm2_connection_profile').off('change').on('change', function () {
            s.connectionProfileId = $(this).val() || '';
            saveSettings();
        });

        $(document).off('click.bm2settings', '#bm2_open_modal_from_settings').on('click.bm2settings', '#bm2_open_modal_from_settings', (ev) => {
            openBlueMoonModal(ev);
        });
    } catch (err) {
        console.warn(`[${MODULE_NAME}] Could not load settings.html:`, err);
    }
}

async function init() {
    if (isInitialized) return;
    isInitialized = true;

    try {
        ensureModalInDom();
        injectWandMenuButton();
        setInterval(injectWandMenuButton, 2500);

        await initSettingsPanel();
        updatePromptInjections();

        const ctx = getContext();
        const { eventSource, event_types } = ctx;
        if (eventSource && event_types) {
            eventSource.on(event_types.CHAT_CHANGED, () => {
                selectedRelId = null;
                injectWandMenuButton();
                updatePromptInjections();
                if ($('#bm2_overlay').is(':visible')) {
                    renderRelationshipsTab();
                    renderGraphNodes();
                }
            });

            eventSource.on(event_types.MESSAGE_RECEIVED, () => {
                setTimeout(() => {
                    analyzeAllRelationshipsWithLLM(false);
                }, 700);
            });
        }
        console.log(`[${MODULE_NAME}] v2.5.4 loaded successfully.`);
    } catch (err) {
        console.error(`[${MODULE_NAME}] Initialization error:`, err);
    }
}

jQuery(() => {
    init();
    const ctx = getContext();
    if (ctx.eventSource && ctx.event_types?.APP_READY) {
        ctx.eventSource.on(ctx.event_types.APP_READY, () => init());
    }
});
