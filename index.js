/**
 * BlueMoon v2.5.0: Multi-Character & NPC Relationship Graph,
 * Structured Relationship Directory (By Character & By Section),
 * 25 Built-in Roles + Custom Manual Role Creator,
 * True-Aspect Retina Obsidian Canvas, 16 Decorative Themes & JSON Backup
 * Author: Tristis (freir1337)
 */

const MODULE_NAME = 'bluemoon_v2';
const PROMPT_KEY_REL = 'bluemoon_v2_rel_prompt';
const PROMPT_KEY_STYLE = 'bluemoon_v2_style_prompt';

const EXTENSION_FOLDER = (() => {
    try {
        const url = new URL(import.meta.url);
        return url.pathname.substring(0, url.pathname.lastIndexOf('/'));
    } catch {
        return '/scripts/extensions/third-party/bluemoon';
    }
})();

// Logical Sections for organizing relationships & roles
const ROLE_CATEGORIES = {
    romance: '❤️ Любовь, Пара и Симпатия',
    family: '👨‍👩‍👧 Семья и Родство',
    friendship: '🤝 Дружба и Близкие',
    social: '💼 Работа, Учёба и Иерархия',
    conflict: '⚔️ Вражда, Соперники и Бывшие',
    other: '👤 Знакомые и Особые статусы',
};

// 25 Built-in Relationship Roles grouped by Category
const BUILTIN_RELATIONSHIP_ROLES = {
    // --- ROMANCE ---
    crush: {
        label: 'Влюблённость / Симпатия 💘',
        shortLabel: 'Симпатия 💘',
        category: 'romance',
        color: '#ff9e64',
        directed: true,
        hasMutuality: true,
        dateFields: [
            { key: 'first_met', label: 'Дата знакомства' },
            { key: 'realized_feelings', label: 'Осознание чувств' },
            { key: 'confession_date', label: 'Дата признания (если было)' },
        ],
    },
    dating: {
        label: 'Пара (Встречаются) ❤️',
        shortLabel: 'Пара ❤️',
        category: 'romance',
        color: '#ff7eb6',
        directed: false,
        dateFields: [
            { key: 'first_met', label: 'Дата знакомства' },
            { key: 'confession_date', label: 'Начало отношений' },
            { key: 'first_kiss', label: 'Первый поцелуй' },
        ],
    },
    secret_lovers: {
        label: 'Тайные любовники / Тайный роман 🤫',
        shortLabel: 'Тайный роман 🤫',
        category: 'romance',
        color: '#ff5c8a',
        directed: false,
        dashed: true,
        dateFields: [
            { key: 'first_met', label: 'Дата знакомства' },
            { key: 'affair_start', label: 'Начало тайной связи' },
        ],
    },
    fwb: {
        label: 'Секс по дружбе / FWB 🔥',
        shortLabel: 'FWB 🔥',
        category: 'romance',
        color: '#ff85a2',
        directed: false,
        dashed: true,
        dateFields: [{ key: 'agreement_date', label: 'Начало связи' }],
    },
    engaged: {
        label: 'Помолвлены (Жених и Невеста) 💍',
        shortLabel: 'Помолвлены 💍',
        category: 'romance',
        color: '#e0af68',
        directed: false,
        dateFields: [
            { key: 'confession_date', label: 'Начало отношений' },
            { key: 'engagement_date', label: 'Дата помолвки' },
            { key: 'planned_wedding', label: 'Планируемая свадьба' },
        ],
    },
    married: {
        label: 'Брак (Супруги) 👑',
        shortLabel: 'Брак 👑',
        category: 'romance',
        color: '#ffd700',
        directed: false,
        dateFields: [
            { key: 'confession_date', label: 'Начало отношений' },
            { key: 'wedding_date', label: 'Дата свадьбы (Годовщина)' },
        ],
    },

    // --- FAMILY ---
    parent_child: {
        label: 'Кровные родители → Ребёнок',
        shortLabel: 'Родитель → Реб.',
        category: 'family',
        color: '#9ece6a',
        directed: true,
        dateFields: [{ key: 'birth_date', label: 'День рождения ребёнка' }],
    },
    adopted_child: {
        label: 'Усыновление / Опека → Ребёнок',
        shortLabel: 'Опека → Реб.',
        category: 'family',
        color: '#73daca',
        directed: true,
        dateFields: [
            { key: 'birth_date', label: 'День рождения ребёнка' },
            { key: 'adoption_date', label: 'Дата усыновления / опеки' },
        ],
    },
    siblings: {
        label: 'Родные Брат / Сестра',
        shortLabel: 'Брат / Сестра',
        category: 'family',
        color: '#c0caf5',
        directed: false,
        dateFields: [{ key: 'family_event', label: 'Общая семейная дата' }],
    },
    stepsiblings: {
        label: 'Сводные Брат / Сестра',
        shortLabel: 'Сводные бр./сест.',
        category: 'family',
        color: '#a9b1d6',
        directed: false,
        dateFields: [{ key: 'family_merge', label: 'Когда семьи объединились' }],
    },
    relatives: {
        label: 'Родственники (Двоюродные / Дядя / Тётя)',
        shortLabel: 'Родственники',
        category: 'family',
        color: '#8ec4ad',
        directed: false,
        dateFields: [{ key: 'family_event', label: 'Памятная семейная дата' }],
    },
    godparent: {
        label: 'Крёстные / Наставник → Подопечный',
        shortLabel: 'Наставник →',
        category: 'family',
        color: '#bb9af7',
        directed: true,
        dateFields: [{ key: 'christening_date', label: 'Дата крестин / начала наставничества' }],
    },

    // --- FRIENDSHIP ---
    friends: {
        label: 'Друзья',
        shortLabel: 'Друзья',
        category: 'friendship',
        color: '#7aa2f7',
        directed: false,
        dateFields: [
            { key: 'first_met', label: 'Дата знакомства' },
            { key: 'friendship_start', label: 'Начало дружбы' },
        ],
    },
    best_friends: {
        label: 'Лучшие друзья 🌟',
        shortLabel: 'Лучшие друзья',
        category: 'friendship',
        color: '#2ac3de',
        directed: false,
        dateFields: [
            { key: 'first_met', label: 'Дата знакомства' },
            { key: 'vow_date', label: 'Стали лучшими друзьями' },
        ],
    },
    roommates: {
        label: 'Соседи по комнате / квартире 🏠',
        shortLabel: 'Соседи 🏠',
        category: 'friendship',
        color: '#7dcfff',
        directed: false,
        dateFields: [{ key: 'move_in_date', label: 'Дата заселения' }],
    },
    protector: {
        label: 'Защитник / Телохранитель → Подопечный 🛡️',
        shortLabel: 'Защитник →',
        category: 'friendship',
        color: '#41c995',
        directed: true,
        dateFields: [{ key: 'oath_date', label: 'Начало защиты / службы' }],
    },

    // --- SOCIAL / WORK / STUDY ---
    classmates: {
        label: 'Одноклассники / Сокурсники 🎓',
        shortLabel: 'Однокурсники',
        category: 'social',
        color: '#73daca',
        directed: false,
        dateFields: [{ key: 'study_start', label: 'Начало совместной учёбы' }],
    },
    colleagues: {
        label: 'Коллеги / Напарники 💼',
        shortLabel: 'Коллеги 💼',
        category: 'social',
        color: '#89ddff',
        directed: false,
        dateFields: [{ key: 'work_start', label: 'Начало совместной работы' }],
    },
    boss_subordinate: {
        label: 'Босс / Начальник → Подчинённый 👔',
        shortLabel: 'Босс → Подчин.',
        category: 'social',
        color: '#e0af68',
        directed: true,
        dateFields: [{ key: 'hire_date', label: 'Дата найма / назначения' }],
    },
    teacher_student: {
        label: 'Учитель / Тренер → Ученик 📚',
        shortLabel: 'Учитель → Ученик',
        category: 'social',
        color: '#bb9af7',
        directed: true,
        dateFields: [{ key: 'lessons_start', label: 'Начало обучения' }],
    },
    idol_fan: {
        label: 'Кумир → Поклонник / Фанат ⭐',
        shortLabel: 'Кумир → Фанат',
        category: 'social',
        color: '#f5c242',
        directed: true,
        dateFields: [{ key: 'first_met', label: 'Первая встреча / концерт' }],
    },

    // --- CONFLICT & EXES ---
    enemies: {
        label: 'Враги / Соперники ⚔️',
        shortLabel: 'Враги ⚔️',
        category: 'conflict',
        color: '#f7768e',
        directed: false,
        dateFields: [
            { key: 'first_met', label: 'Дата столкновения' },
            { key: 'conflict_start', label: 'Начало вражды' },
        ],
    },
    exes: {
        label: 'Бывшие / Развод 💔',
        shortLabel: 'Бывшие 💔',
        category: 'conflict',
        color: '#a9b1d6',
        directed: false,
        dashed: true,
        dateFields: [
            { key: 'confession_date', label: 'Когда были вместе' },
            { key: 'breakup_date', label: 'Дата расставания / развода' },
        ],
    },
    ex_friends: {
        label: 'Бывшие друзья (В ссоре) 🥀',
        shortLabel: 'Бывшие друзья',
        category: 'conflict',
        color: '#d49ba7',
        directed: false,
        dashed: true,
        dateFields: [{ key: 'fallout_date', label: 'Дата ссоры / разрыва дружбы' }],
    },

    // --- OTHER ---
    strangers: {
        label: 'Незнакомцы / Знакомые',
        shortLabel: 'Знакомые',
        category: 'other',
        color: '#9aa5ce',
        directed: false,
        dateFields: [{ key: 'first_met', label: 'Дата первой встречи' }],
    },
};

// 5 Mutuality / Secrecy sub-modes for Crush / Infatuation
const CRUSH_MUTUALITY = {
    secret_one_sided: {
        label: '🤫 Тайно влюблён(а) (в одну сторону, скрывает)',
        shortLabel: '🤫 Тайно влюб.',
        directed: true,
        dashed: true,
        promptDesc: (from, to) =>
            `${from} is SECRETLY in love with ${to}, hiding these feelings carefully. CRITICAL RULE: ${to} DOES NOT KNOW about ${from}'s romantic feelings and must NOT act aware unless a confession happens in chat.`,
    },
    open_one_sided: {
        label: '💘 Открытая симпатия (в одну сторону)',
        shortLabel: '💘 Влюблён(а)',
        directed: true,
        dashed: false,
        promptDesc: (from, to) =>
            `${from} has an open romantic crush on ${to} and shows signs of attraction (${to} has not reciprocated yet).`,
    },
    unrequited: {
        label: '💔 Безответно (невзаимно / отказ)',
        shortLabel: '💔 Безответно',
        directed: true,
        dashed: true,
        promptDesc: (from, to) =>
            `${from} suffers from unrequited love towards ${to} (${to} knows or rejected it and does not share romantic feelings).`,
    },
    secret_mutual: {
        label: '🫣 Тайно обоюдно (оба влюблены, но оба скрывают)',
        shortLabel: '🫣 Тайно обоюдно',
        directed: false,
        dashed: true,
        promptDesc: (from, to) =>
            `MUTUAL SECRET CRUSH (SLOWBURN): Both ${from} and ${to} are secretly in love with each other, but NEITHER knows the other reciprocates. Both hide their feelings and misinterpret hints.`,
    },
    open_mutual: {
        label: '💞 Обоюдная симпатия (взаимный флирт)',
        shortLabel: '💞 Взаимно',
        directed: false,
        dashed: false,
        promptDesc: (from, to) =>
            `MUTUAL OPEN CRUSH: Both ${from} and ${to} are openly attracted to each other, flirting and moving towards becoming a couple.`,
    },
};

// Built-in Narrative Style Sliders
const BUILTIN_STYLE_SLIDERS = [
    {
        id: 'pacing',
        label: 'Темп сюжета (Pacing)',
        hint: '0% — максимальный слоубёрн и микро-детали момента, 100% — стремительное развитие событий',
        defaultVal: 45,
        promptRule: (v) =>
            v <= 20
                ? 'EXTREME SLOWBURN: Expand every small moment, gesture, and breath; FORBID skipping time or rushing plot.'
                : v < 45
                  ? 'SLOW-BURN PACING: Linger on scenes, sensory details, and micro-interactions; do not rush plot transitions.'
                  : v > 75
                    ? 'FAST DYNAMIC PACING: Move scenes forward briskly with high event density and immediate consequences.'
                    : 'BALANCED PACING: Natural story progression.',
    },
    {
        id: 'initiative',
        label: 'Инициативность персонажей и NPC',
        hint: '0% — ждут шагов игрока, 100% — сами двигают сцену, спорят, предлагают действия и создают события',
        defaultVal: 75,
        promptRule: (v) =>
            v >= 80
                ? 'DOMINANT PROACTIVE AGENCY: Characters and NPCs MUST actively initiate actions, interrupt, challenge, propose plans, and drive scenes forward on their own without waiting for user permission.'
                : v >= 60
                  ? 'HIGH PROACTIVITY: Characters take initiative, ask questions, and act independently.'
                  : v <= 30
                    ? 'REACTIVE CHARACTERS: Characters wait for the user to lead the scene.'
                    : 'MODERATE INITIATIVE: Balanced character agency.',
    },
    {
        id: 'descriptiveness',
        label: 'Описательность и атмосфера',
        hint: '0% — упор на диалоги и действие, 100% — богатые сенсорные описания окружения, запахов, света',
        defaultVal: 65,
        promptRule: (v) =>
            v >= 75
                ? 'RICH ATMOSPHERIC PROSE: Mandatory vivid sensory descriptions of lighting, textures, sounds, smells, and body language in every paragraph.'
                : v <= 30
                  ? 'CONCISE DIALOGUE-FOCUSED: Keep environmental descriptions minimal; focus tightly on dialogue and immediate physical action.'
                  : 'BALANCED DESCRIPTIVENESS: Mix dialogue and sensory details evenly.',
    },
    {
        id: 'emotional_depth',
        label: 'Психологизм и внутренний мир',
        hint: '0% — только внешнее поведение, 100% — глубокая рефлексия, скрытые мотивы и подтекст',
        defaultVal: 70,
        promptRule: (v) =>
            v >= 75
                ? 'DEEP PSYCHOLOGICAL REALISM: Explicitly portray internal conflicts, unspoken subtext, emotional defenses, and complex motives.'
                : v <= 30
                  ? 'EXTERNAL BEHAVIOR ONLY: Show emotions strictly through outward actions and spoken tone without internal monologues.'
                  : 'BALANCED EMOTIONAL DEPTH.',
    },
    {
        id: 'romance_tension',
        label: 'Романтическое напряжение / Химия',
        hint: '0% — строго платонически без романтики, 100% — искры, взгляды, флирт и притяжение',
        defaultVal: 50,
        promptRule: (v) =>
            v <= 10
                ? 'STRICTLY PLATONIC (0% ROMANCE): Completely FORBID romantic subtext, flirting, blushing, or sexual tension.'
                : v >= 75
                  ? 'INTENSE ROMANTIC & PHYSICAL CHEMISTRY: Emphasize lingering gazes, tactile awareness, heartbeat, and unspoken attraction where appropriate to relationship roles.'
                  : v <= 30
                    ? 'LOW ROMANCE: Keep interactions grounded and non-romantic.'
                    : 'NATURAL CHEMISTRY: Allow organic interpersonal warmth based on relationship status.',
    },
    {
        id: 'drama_conflict',
        label: 'Драма, конфликтность и трение',
        hint: '0% — уют, комфорт и согласие (Fluff), 100% — высокое напряжение, несогласие и острые углы',
        defaultVal: 50,
        promptRule: (v) =>
            v >= 75
                ? 'HIGH DRAMA & INTERPERSONAL FRICTION: Characters must NOT easily agree; amplify pride, clashes of values, stubbornness, and emotional stakes.'
                : v <= 25
                  ? 'COMFORT & WARMTH (FLUFF): Maintain a supportive, gentle, low-stress atmosphere; avoid unnecessary arguments.'
                  : 'REALISTIC TENSION: Natural agreements and disagreements.',
    },
];

const GENRE_OPTIONS = [
    'Дарк Романс (Dark Romance)',
    'Слоубёрн (Slowburn)',
    'Психологический триллер',
    'Повседневность (Slice of Life)',
    'Драма / Ангст (Angst)',
    'Уют и Комфорт (Hurt/Comfort & Fluff)',
    'Детектив / Нуар',
    'Тёмное фэнтези (Dark Fantasy)',
    'Городское фэнтези',
    'Киберпанк / Sci-Fi',
    'Историческая драма',
    'Комедия / Ирония',
];

// 16 Rich Decorative Themes
const BUILTIN_THEMES = {
    moonlight: {
        name: '🌙 Лунная полночь',
        desc: 'Глубокий индиго и звёздное серебро',
        bgMain: '#0e1222',
        bgCard: '#171d36',
        bgInput: '#0f1426',
        textMain: '#eef1ff',
        textMuted: '#9aa5ce',
        accent: '#7aa2f7',
        accent2: '#bb9af7',
    },
    crimsonvelvet: {
        name: '🍷 Алый бархат',
        desc: 'Готика, дарк-романс и тёмное вино',
        bgMain: '#18090f',
        bgCard: '#261019',
        bgInput: '#12060b',
        textMain: '#ffeef2',
        textMuted: '#d49ba7',
        accent: '#ff4d7d',
        accent2: '#ff9ebb',
    },
    bloodmoon: {
        name: '🩸 Кровавая луна',
        desc: 'Чёрный обсидиан и багровое затмение',
        bgMain: '#0d0608',
        bgCard: '#1a0c10',
        bgInput: '#090405',
        textMain: '#ffd6dc',
        textMuted: '#b87b84',
        accent: '#e6193c',
        accent2: '#ff6b4a',
    },
    royalvelvet: {
        name: '👑 Королевский пурпур',
        desc: 'Пурпурный бархат и имперское золото',
        bgMain: '#150c24',
        bgCard: '#221438',
        bgInput: '#10081c',
        textMain: '#f8f0ff',
        textMuted: '#bba4d9',
        accent: '#f5c242',
        accent2: '#c77dff',
    },
    sakuradream: {
        name: '🌸 Ночная сакура',
        desc: 'Нежные лепестки в вечерних сумерках',
        bgMain: '#1b111c',
        bgCard: '#291a2b',
        bgInput: '#140c15',
        textMain: '#fff0f7',
        textMuted: '#cfa8c0',
        accent: '#ff85b3',
        accent2: '#ffc2dc',
    },
    emeraldforest: {
        name: '🌲 Изумрудный лес',
        desc: 'Мистическая хвоя и светлячки',
        bgMain: '#0a1813',
        bgCard: '#11271f',
        bgInput: '#07120e',
        textMain: '#eafff5',
        textMuted: '#8ec4ad',
        accent: '#3dd69b',
        accent2: '#9ece6a',
    },
    cyberneon: {
        name: '⚡ Кибер-неон 2077',
        desc: 'Ультрафиолет, циан и неоновая маджента',
        bgMain: '#0a0614',
        bgCard: '#150d2a',
        bgInput: '#07040e',
        textMain: '#f5eaff',
        textMuted: '#a992d4',
        accent: '#00f0ff',
        accent2: '#ff007f',
    },
    goldendeco: {
        name: '🥂 Золотой Ар-Деко',
        desc: 'Нуар, шампанское и бронзовый блеск',
        bgMain: '#12100d',
        bgCard: '#1f1b15',
        bgInput: '#0c0b08',
        textMain: '#fdf7e7',
        textMuted: '#bdae8f',
        accent: '#e6b85c',
        accent2: '#f5d78e',
    },
    abyssalocean: {
        name: '🌊 Бездна океана',
        desc: 'Биолюминесценция на дне морском',
        bgMain: '#06131c',
        bgCard: '#0c2130',
        bgInput: '#040d14',
        textMain: '#e6f9ff',
        textMuted: '#7fb3c8',
        accent: '#00d4ff',
        accent2: '#38f8b2',
    },
    amethystmist: {
        name: '🔮 Аметистовый туман',
        desc: 'Магический фиолет и лавандовое свечение',
        bgMain: '#130f24',
        bgCard: '#1e1838',
        bgInput: '#0d0a1a',
        textMain: '#f3edff',
        textMuted: '#a99bc9',
        accent: '#b57cff',
        accent2: '#7dcfff',
    },
    coffeehouse: {
        name: '☕ Тёплый эспрессо',
        desc: 'Уютная кофейня, карамель и корица',
        bgMain: '#17110e',
        bgCard: '#261c17',
        bgInput: '#110c0a',
        textMain: '#faeee7',
        textMuted: '#bfa190',
        accent: '#e09f67',
        accent2: '#f5c396',
    },
    sunsetmirage: {
        name: '🌅 Закатный мираж',
        desc: 'Сумеречный персик, коралл и пурпур',
        bgMain: '#1a0e17',
        bgCard: '#2b1623',
        bgInput: '#130910',
        textMain: '#fff2eb',
        textMuted: '#d4a3a8',
        accent: '#ff7b54',
        accent2: '#ffb26b',
    },
    nordicfrost: {
        name: '❄️ Северное сияние',
        desc: 'Арктический лёд и полярная аврора',
        bgMain: '#0d151f',
        bgCard: '#162333',
        bgInput: '#090f17',
        textMain: '#ecf6ff',
        textMuted: '#8fb1cc',
        accent: '#70e1ff',
        accent2: '#88f7c4',
    },
    witchapothecary: {
        name: '🧪 Ведьмин гербарий',
        desc: 'Тёмный мох, полынь и янтарные зелья',
        bgMain: '#111610',
        bgCard: '#1b2419',
        bgInput: '#0c100b',
        textMain: '#eef5e9',
        textMuted: '#9eb396',
        accent: '#b5e550',
        accent2: '#e8a855',
    },
    matrixcode: {
        name: '💻 Терминал Матрицы',
        desc: 'Чёрный экран и фосфорный зелёный код',
        bgMain: '#050c07',
        bgCard: '#0b1910',
        bgInput: '#030804',
        textMain: '#d8ffe2',
        textMuted: '#68a878',
        accent: '#00ff66',
        accent2: '#70ffaa',
    },
    celestialivory: {
        name: '🕊️ Небесный фарфор (Светлая)',
        desc: 'Жемчужный день и королевский сапфир',
        bgMain: '#f2f4fa',
        bgCard: '#ffffff',
        bgInput: '#e6eaf5',
        textMain: '#1a2138',
        textMuted: '#5b668a',
        accent: '#4169e1',
        accent2: '#8a4fff',
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
    customTheme: { ...BUILTIN_THEMES.moonlight },
    customRoles: {}, // User-created custom relationship statuses!
    relGroupMode: 'category', // 'category' | 'character'
    characterData: {},
    stylePresets: {
        'Слоубёрн Психология': {
            genres: ['Слоубёрн (Slowburn)', 'Драма / Ангст (Angst)'],
            authorStyle: 'Глубокий психологический реализм, внимание к микромимике, паузам и несказанному подтексту.',
            sliders: {
                pacing: 25,
                initiative: 80,
                descriptiveness: 75,
                emotional_depth: 85,
                romance_tension: 55,
                drama_conflict: 60,
            },
            customSliders: [],
        },
    },
    activeStyle: {
        genres: ['Повседневность (Slice of Life)'],
        authorStyle: '',
        sliders: {
            pacing: 45,
            initiative: 75,
            descriptiveness: 65,
            emotional_depth: 70,
            romance_tension: 50,
            drama_conflict: 50,
        },
        customSliders: [],
    },
};

let isAnalyzing = false;
let activeCharFilterId = 'all'; // 'all' or specific node.id for filtering the relationship list
let isNewLinkDrawerOpen = false;
const avatarImageCache = new Map();

const graphState = {
    zoom: 1,
    panX: 0,
    panY: 0,
    logicalWidth: 360,
    logicalHeight: 430,
    draggingNodeId: null,
    isPanning: false,
    lastPointerX: 0,
    lastPointerY: 0,
};

function hexToRgba(hex, alpha = 0.25) {
    const clean = String(hex || '#7aa2f7').replace('#', '');
    if (clean.length !== 6) return `rgba(122, 162, 247, ${alpha})`;
    const r = parseInt(clean.slice(0, 2), 16) || 122;
    const g = parseInt(clean.slice(2, 4), 16) || 162;
    const b = parseInt(clean.slice(4, 6), 16) || 247;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getSettings() {
    const ctx = SillyTavern.getContext();
    if (!ctx.extensionSettings[MODULE_NAME]) {
        ctx.extensionSettings[MODULE_NAME] = structuredClone(DEFAULT_SETTINGS);
    }
    const s = ctx.extensionSettings[MODULE_NAME];
    for (const [k, v] of Object.entries(DEFAULT_SETTINGS)) {
        if (s[k] === undefined) {
            s[k] = structuredClone(v);
        }
    }
    if (!s.customRoles || typeof s.customRoles !== 'object') {
        s.customRoles = {};
    }
    if (!Array.isArray(s.activeStyle.genres)) {
        s.activeStyle.genres = s.activeStyle.genre ? [s.activeStyle.genre] : ['Повседневность (Slice of Life)'];
    }
    if (!Array.isArray(s.activeStyle.customSliders)) {
        s.activeStyle.customSliders = [];
    }
    return s;
}

/**
 * Get merged dictionary of Built-in Roles + User Custom Roles
 */
function getAllRoles() {
    const s = getSettings();
    const merged = { ...BUILTIN_RELATIONSHIP_ROLES };
    for (const [k, cr] of Object.entries(s.customRoles || {})) {
        merged[k] = {
            label: cr.label || k,
            shortLabel: cr.shortLabel || (cr.label ? cr.label.slice(0, 14) : k),
            category: cr.category || 'other',
            color: cr.color || '#bb9af7',
            directed: Boolean(cr.directed),
            dashed: Boolean(cr.dashed),
            isCustom: true,
            dateFields: [
                { key: 'first_met', label: 'Дата начала / знакомства' },
                { key: 'custom_milestone', label: 'Особая памятная дата' },
            ],
        };
    }
    return merged;
}

function getRoleMeta(roleKey) {
    const all = getAllRoles();
    return all[roleKey] || BUILTIN_RELATIONSHIP_ROLES.strangers;
}

function saveSettings() {
    const ctx = SillyTavern.getContext();
    ctx.saveSettingsDebounced();
    updatePromptInjections();
}

function getBaseCharacterKey() {
    const ctx = SillyTavern.getContext();
    if (ctx.groupId) {
        return `group_${ctx.groupId}`;
    }
    if (ctx.characterId !== undefined && ctx.characters?.[ctx.characterId]) {
        const ch = ctx.characters[ctx.characterId];
        return `char_${ch.avatar || ch.name}`;
    }
    return 'global_fallback';
}

function getActiveScopeKey() {
    const ctx = SillyTavern.getContext();
    const s = getSettings();
    const baseKey = getBaseCharacterKey();

    if (s.isolatePerChat && ctx.chatId) {
        return `${baseKey}__chat_${ctx.chatId}`;
    }
    return baseKey;
}

function getCurrentNamesAndAvatars() {
    const ctx = SillyTavern.getContext();
    let botName = 'Персонаж';
    let botAvatar = '';
    if (ctx.characterId !== undefined && ctx.characters?.[ctx.characterId]) {
        const ch = ctx.characters[ctx.characterId];
        botName = ch.name || 'Персонаж';
        if (ch.avatar) {
            botAvatar = `/characters/${encodeURIComponent(ch.avatar)}`;
        }
    }
    const personaName = ctx.name1 || 'Игрок';
    return { botName, botAvatar, personaName };
}

function findBestDonorProfileForBaseKey(s, baseKey) {
    const prefix = `${baseKey}__chat_`;
    let bestDonor = null;
    let bestScore = -1;

    for (const [k, prof] of Object.entries(s.characterData || {})) {
        if (k === baseKey || k.startsWith(prefix)) {
            if (!prof || !Array.isArray(prof.nodes) || !Array.isArray(prof.relationships)) continue;
            const npcCount = prof.nodes.filter((n) => n.type === 'npc').length;
            const relCount = prof.relationships.length;
            const memCount = prof.relationships.reduce((acc, r) => acc + (r.memories?.length || 0), 0);
            const hasCustomRole = prof.relationships.some((r) => r.role !== 'strangers' || Number(r.satisfaction) !== 0);
            const score = npcCount * 10 + relCount * 3 + memCount * 2 + (hasCustomRole ? 5 : 0);

            if (score > bestScore && score > 3) {
                bestScore = score;
                bestDonor = prof;
            }
        }
    }
    return bestDonor;
}

function getActiveCharProfile() {
    const s = getSettings();
    const baseKey = getBaseCharacterKey();
    const key = getActiveScopeKey();
    const { botName, botAvatar, personaName } = getCurrentNamesAndAvatars();

    if (!s.characterData[key]) {
        const donor = findBestDonorProfileForBaseKey(s, baseKey);
        if (donor) {
            s.characterData[key] = structuredClone(donor);
        } else {
            s.characterData[key] = {
                nodes: [
                    { id: 'node_bot', name: botName, type: 'bot', avatar: botAvatar, x: 115, y: 200 },
                    { id: 'node_persona', name: personaName, type: 'persona', avatar: '', x: 255, y: 200 },
                ],
                relationships: [
                    {
                        id: 'rel_default',
                        fromId: 'node_bot',
                        toId: 'node_persona',
                        role: 'strangers',
                        mutualStatus: 'secret_one_sided',
                        satisfaction: 0,
                        dates: {},
                        memories: [],
                    },
                ],
                activeRelId: 'rel_default',
            };
        }
    } else {
        const cur = s.characterData[key];
        const isStillBlank =
            Array.isArray(cur.nodes) &&
            cur.nodes.length <= 2 &&
            Array.isArray(cur.relationships) &&
            cur.relationships.length === 1 &&
            cur.relationships[0].role === 'strangers' &&
            Number(cur.relationships[0].satisfaction) === 0 &&
            (!cur.relationships[0].memories || cur.relationships[0].memories.length === 0);

        if (isStillBlank) {
            const donor = findBestDonorProfileForBaseKey(s, baseKey);
            if (donor && donor !== cur) {
                s.characterData[key] = structuredClone(donor);
            }
        }
    }

    const prof = s.characterData[key];

    if (!Array.isArray(prof.nodes)) {
        prof.nodes = [
            { id: 'node_bot', name: botName, type: 'bot', avatar: botAvatar, x: 115, y: 200 },
            { id: 'node_persona', name: personaName, type: 'persona', avatar: '', x: 255, y: 200 },
        ];
    }

    const botNode = prof.nodes.find((n) => n.id === 'node_bot');
    if (botNode) {
        botNode.name = botName;
        if (!botNode.avatar && botAvatar) botNode.avatar = botAvatar;
    }
    const personaNode = prof.nodes.find((n) => n.id === 'node_persona');
    if (personaNode) {
        personaNode.name = personaName;
    }

    if (!Array.isArray(prof.relationships) || prof.relationships.length === 0) {
        prof.relationships = [
            {
                id: 'rel_default',
                fromId: 'node_bot',
                toId: 'node_persona',
                role: 'strangers',
                mutualStatus: 'secret_one_sided',
                satisfaction: 0,
                dates: {},
                memories: [],
            },
        ];
        prof.activeRelId = 'rel_default';
    }

    for (const rel of prof.relationships) {
        if (!rel.fromId) rel.fromId = 'node_bot';
        if (!rel.toId) rel.toId = 'node_persona';
        if (!rel.mutualStatus || !CRUSH_MUTUALITY[rel.mutualStatus]) {
            rel.mutualStatus = 'secret_one_sided';
        }
        if (typeof rel.satisfaction !== 'number' || Number.isNaN(rel.satisfaction)) {
            rel.satisfaction = 0;
        }
        rel.satisfaction = Math.max(-100, Math.min(100, Math.round(rel.satisfaction)));
        if (!rel.dates) rel.dates = {};
        if (!Array.isArray(rel.memories)) rel.memories = [];
    }

    if (!prof.activeRelId || !prof.relationships.some((r) => r.id === prof.activeRelId)) {
        prof.activeRelId = prof.relationships[0].id;
    }

    return prof;
}

function getActiveRelationship() {
    const prof = getActiveCharProfile();
    return prof.relationships.find((r) => r.id === prof.activeRelId) || prof.relationships[0];
}

function getNodeById(prof, nodeId) {
    return prof.nodes.find((n) => n.id === nodeId) || { id: nodeId, name: 'Неизвестный', type: 'npc', avatar: '' };
}

function describeAffinityLevel(val) {
    if (val <= -75) return `${val}% (BITTER HATRED / DEEP HOSTILITY — active antagonism, distrust, cold or aggressive behavior)`;
    if (val <= -40) return `${val}% (STRONG DISLIKE / RESENTMENT — unresolved conflict, irritation, sharp friction)`;
    if (val <= -15) return `${val}% (COOLNESS / TENSION — guarded, skeptical, noticeable awkwardness or grievance)`;
    if (val < 15) return `${val}% (NEUTRAL / CAUTIOUS — polite distance, no strong emotional attachment yet)`;
    if (val < 45) return `${val}% (WARM SYMPATHY / GROWING TRUST — friendly openness, interest, comfort)`;
    if (val < 75) return `${val}% (CLOSE BOND / STRONG AFFECTION — deep trust, care, emotional attachment)`;
    return `${val}% (DEVOTED LOVE / UNBREAKABLE BOND — maximum intimacy, loyalty, and deep emotional resonance)`;
}

function getSliderForceLabel(val) {
    if (val <= 10) return 'STRICTLY FORBIDDEN / 0% PRESENCE';
    if (val <= 30) return 'LOW / MINIMAL';
    if (val <= 60) return 'MODERATE / BALANCED';
    if (val <= 80) return 'HIGH PRIORITY / STRONG';
    return 'DOMINANT MANDATORY RULE (MAXIMUM FORCE)';
}

/**
 * Build English prompt block for all relationships & NPCs
 */
function buildRelationshipPromptText() {
    const s = getSettings();
    if (!s.masterEnabled || !s.relEnabled) return '';

    const prof = getActiveCharProfile();
    if (!prof.relationships.length) return '';

    const lines = [
        `[MANDATORY CHARACTER & NPC RELATIONSHIP NETWORK — STRICT CANON]`,
        `CRITICAL INSTRUCTION: You MUST portray every interaction, dialogue tone, body language, and knowledge boundary strictly according to the relationship network below. NEVER contradict these roles, affinity scores (-100% to +100%), secrecy rules, or dates.`,
    ];

    const npcNodes = prof.nodes.filter((n) => n.type === 'npc');
    if (npcNodes.length > 0) {
        lines.push(`Known NPCs in this story universe: ${npcNodes.map((n) => n.name).join(', ')}. Include or reference them naturally when relevant to the scene.`);
    }

    for (const rel of prof.relationships) {
        const fromNode = getNodeById(prof, rel.fromId);
        const toNode = getNodeById(prof, rel.toId);
        const roleMeta = getRoleMeta(rel.role);

        let linkHeader = '';
        if (rel.role === 'crush') {
            const mut = CRUSH_MUTUALITY[rel.mutualStatus] || CRUSH_MUTUALITY.secret_one_sided;
            linkHeader = `• ${fromNode.name} ➔ ${toNode.name} | Role: Romantic Crush [${mut.label}] | Affinity: ${describeAffinityLevel(rel.satisfaction)}`;
            lines.push(linkHeader);
            lines.push(`  - ENFORCED SECRECY & FEELINGS RULE: ${mut.promptDesc(fromNode.name, toNode.name)}`);
        } else {
            const arrow = roleMeta.directed ? '➔' : '↔';
            linkHeader = `• ${fromNode.name} ${arrow} ${toNode.name} | Status: ${roleMeta.label} (${rel.role}) | Affinity: ${describeAffinityLevel(rel.satisfaction)}`;
            lines.push(linkHeader);
        }

        const activeDates = [];
        for (const df of roleMeta.dateFields || []) {
            const val = rel.dates?.[df.key];
            if (val && val.trim()) {
                activeDates.push(`${df.label}: ${val.trim()}`);
            }
        }
        if (activeDates.length > 0) {
            lines.push(`  - Canon Milestone Dates: ${activeDates.join(' | ')}`);
        }

        if (rel.memories && rel.memories.length > 0) {
            const recent = rel.memories.slice(-5);
            lines.push(`  - Shared History & Key Events: ${recent.map((m) => `(${m.date || 'Past'}) ${m.text}`).join('; ')}`);
        }
    }

    lines.push(`[/MANDATORY CHARACTER & NPC RELATIONSHIP NETWORK]`);
    return lines.join('\n');
}

/**
 * Build English prompt block for Genres, Author Style, Built-in Sliders & Custom Sliders
 */
function buildStylePromptText() {
    const s = getSettings();
    if (!s.masterEnabled || !s.styleEnabled) return '';

    const st = s.activeStyle;
    const lines = [
        `[MANDATORY NARRATIVE GENRE, AUTHOR VOICE & PACING DIRECTIVES]`,
        `CRITICAL INSTRUCTION: Every paragraph of your response MUST strictly obey the following genre rules, authorial style, and slider intensities. Do NOT ignore or soften extreme slider values.`,
    ];

    if (Array.isArray(st.genres) && st.genres.length > 0) {
        lines.push(`1. MANDATORY ACTIVE GENRES: ${st.genres.join(' + ')}. Maintain the atmosphere, tropes, emotional stakes, and vocabulary of these genres throughout the response.`);
    }

    if (st.authorStyle && st.authorStyle.trim()) {
        lines.push(`2. MANDATORY AUTHORIAL VOICE & PROSE STYLE: Write strictly in the style of: ${st.authorStyle.trim()}. Replicate this rhythm, sentence structure, and descriptive lens.`);
    }

    lines.push(`3. ENFORCED NARRATIVE SLIDER INTENSITIES:`);
    for (const sl of BUILTIN_STYLE_SLIDERS) {
        const val = Number(st.sliders?.[sl.id] ?? sl.defaultVal);
        const forceTier = getSliderForceLabel(val);
        lines.push(`   • ${sl.label}: ${val}% [${forceTier}] — ${sl.promptRule(val)}`);
    }

    if (Array.isArray(st.customSliders) && st.customSliders.length > 0) {
        for (const csl of st.customSliders) {
            const val = Number(csl.value ?? 50);
            const forceTier = getSliderForceLabel(val);
            lines.push(
                `   • Custom Directive "${csl.name}": ${val}% [${forceTier}] — ${csl.prompt || csl.name}. Apply with ${val}% intensity.`
            );
        }
    }

    lines.push(`[/MANDATORY NARRATIVE GENRE, AUTHOR VOICE & PACING DIRECTIVES]`);
    return lines.join('\n');
}

function updatePromptInjections() {
    const ctx = SillyTavern.getContext();
    if (typeof ctx.setExtensionPrompt !== 'function') return;

    const s = getSettings();
    const depth = Number(s.injectionDepth) >= 0 ? Number(s.injectionDepth) : 1;
    const relText = buildRelationshipPromptText();
    const styleText = buildStylePromptText();

    ctx.setExtensionPrompt(PROMPT_KEY_REL, relText, 1, depth, false, 0);
    ctx.setExtensionPrompt(PROMPT_KEY_STYLE, styleText, 1, depth, false, 0);

    const previewEl = document.getElementById('bm2_live_prompt_box');
    if (previewEl) {
        const combined = [relText, styleText].filter(Boolean).join('\n\n');
        previewEl.textContent = combined || '(Инъекция выключена в настройках)';
    }
}

window.bluemoonGenerateInterceptor = async function () {
    try {
        updatePromptInjections();
    } catch (err) {
        console.error(`[${MODULE_NAME}] Interceptor error:`, err);
    }
};

function applyThemeVariables() {
    const s = getSettings();
    const t =
        s.activeTheme === 'custom'
            ? s.customTheme
            : BUILTIN_THEMES[s.activeTheme] || BUILTIN_THEMES.moonlight;

    const root = document.documentElement;
    root.style.setProperty('--bm2-bg-main', t.bgMain);
    root.style.setProperty('--bm2-bg-card', t.bgCard);
    root.style.setProperty('--bm2-bg-input', t.bgInput);
    root.style.setProperty('--bm2-text-main', t.textMain);
    root.style.setProperty('--bm2-text-muted', t.textMuted);
    root.style.setProperty('--bm2-accent', t.accent);
    root.style.setProperty('--bm2-accent-2', t.accent2);
    root.style.setProperty('--bm2-border', hexToRgba(t.accent, 0.34));
    root.style.setProperty('--bm2-glow', hexToRgba(t.accent, 0.2));
    root.style.setProperty('--bm2-canvas-bg-1', t.bgCard);
    root.style.setProperty('--bm2-canvas-bg-2', t.bgMain);
}

async function runAuxiliaryLLMPrompt(systemPrompt, userPrompt, maxTokens = 950) {
    const ctx = SillyTavern.getContext();
    const s = getSettings();

    if (s.connectionProfileId && ctx.ConnectionManagerRequestService) {
        try {
            const messages = [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
            ];
            const response = await ctx.ConnectionManagerRequestService.sendRequest(
                s.connectionProfileId,
                messages,
                maxTokens,
                { extractData: true, includePreset: false, includeInstruct: false }
            );
            if (typeof response === 'string') return response;
            if (response?.content) return response.content;
        } catch (err) {
            console.warn(`[${MODULE_NAME}] Profile request failed, falling back to generateRaw:`, err);
        }
    }

    if (typeof ctx.generateRaw === 'function') {
        return await ctx.generateRaw({
            systemPrompt,
            prompt: userPrompt,
            quietToLoud: false,
        });
    }

    throw new Error('В SillyTavern не найден доступный метод генерации (generateRaw).');
}

/**
 * Auto-scan ALL relationships (Bot, Persona, and all NPCs) after every AI message
 */
async function analyzeAllRelationshipsDelta() {
    const s = getSettings();
    if (!s.masterEnabled || !s.relEnabled || !s.relAutoAnalyze || isAnalyzing) return;

    const ctx = SillyTavern.getContext();
    const chat = ctx.chat || [];
    if (chat.length < 1) return;

    const lastMsg = chat[chat.length - 1];
    if (!lastMsg || lastMsg.is_user || lastMsg.is_system) return;

    const prof = getActiveCharProfile();
    if (!prof.relationships || prof.relationships.length === 0) return;

    isAnalyzing = true;
    try {
        const recentSlice = chat
            .slice(-4)
            .map((m) => `${m.name}: ${m.mes}`)
            .join('\n---\n');

        const pairsSummary = prof.relationships.map((r) => {
            const fromNode = getNodeById(prof, r.fromId);
            const toNode = getNodeById(prof, r.toId);
            const roleMeta = getRoleMeta(r.role);
            const mutInfo =
                r.role === 'crush' ? ` (${CRUSH_MUTUALITY[r.mutualStatus]?.label || r.mutualStatus})` : '';
            return {
                relId: r.id,
                pair: `${fromNode.name} -> ${toNode.name}`,
                currentRole: r.role,
                roleLabel: `${roleMeta.label}${mutInfo}`,
                currentSatisfaction: r.satisfaction,
            };
        });

        const allRoles = getAllRoles();
        const sysPrompt = `You are an objective relationship & NPC interaction tracker for a roleplay story.
Analyze the latest scene and determine which relationships from the provided list experienced a meaningful emotional shift, interaction, conflict, confession, or milestone.
Return ONLY a valid JSON object (no markdown fences) with this exact structure:
{
  "updates": [
    {
      "relId": "<exact relId from the list>",
      "delta": <integer from -15 to +15, or 0 if no interaction/change>,
      "reason": "<brief explanation in Russian, max 12 words>",
      "newMemory": "<if an important event/confession/fight happened between this pair in the last message, write 1 short sentence in Russian, otherwise empty string>",
      "newRole": "<optional: keep empty string unless their relationship status explicitly changed in this scene, e.g. from crush to dating, or dating to exes>",
      "newMutuality": "<optional: if role is crush and secrecy changed, e.g. secret_one_sided to open_one_sided or open_mutual, otherwise empty string>"
    }
  ]
}
Only include pairs in "updates" that actually interacted or were emotionally affected in the latest message.`;

        const userPrompt = `Tracked Relationships JSON:\n${JSON.stringify(pairsSummary, null, 2)}\n\nRecent Scene:\n${recentSlice}`;

        const raw = await runAuxiliaryLLMPrompt(sysPrompt, userPrompt, 700);
        const match = String(raw).match(/\{[\s\S]*\}/);
        if (!match) return;

        const parsed = JSON.parse(match[0]);
        const updates = Array.isArray(parsed.updates) ? parsed.updates : [];
        if (updates.length === 0) return;

        const toastLines = [];
        let changedAny = false;

        for (const upd of updates) {
            const rel = prof.relationships.find((r) => r.id === upd.relId);
            if (!rel) continue;

            const fromNode = getNodeById(prof, rel.fromId);
            const toNode = getNodeById(prof, rel.toId);
            let delta = Number(upd.delta) || 0;
            delta = Math.max(-15, Math.min(15, Math.round(delta)));

            const newMem = typeof upd.newMemory === 'string' ? upd.newMemory.trim() : '';
            const reason = typeof upd.reason === 'string' ? upd.reason.trim() : '';

            if (delta !== 0) {
                rel.satisfaction = Math.max(-100, Math.min(100, rel.satisfaction + delta));
                changedAny = true;
                const sign = delta > 0 ? `+${delta}%` : `${delta}%`;
                toastLines.push(`${fromNode.name} ↔ ${toNode.name}: ${sign} (${rel.satisfaction}%)${reason ? ` — ${reason}` : ''}`);
            }

            if (upd.newRole && allRoles[upd.newRole] && upd.newRole !== rel.role) {
                rel.role = upd.newRole;
                changedAny = true;
                toastLines.push(`Статус ${fromNode.name} ↔ ${toNode.name}: ${allRoles[rel.role].label}`);
            }

            if (rel.role === 'crush' && upd.newMutuality && CRUSH_MUTUALITY[upd.newMutuality] && upd.newMutuality !== rel.mutualStatus) {
                rel.mutualStatus = upd.newMutuality;
                changedAny = true;
            }

            if (newMem) {
                const exists = rel.memories.some((m) => m.text.toLowerCase() === newMem.toLowerCase());
                if (!exists) {
                    rel.memories.push({
                        id: Date.now() + Math.floor(Math.random() * 1000),
                        date: new Date().toLocaleDateString('ru-RU'),
                        text: newMem,
                    });
                    changedAny = true;
                }
            }
        }

        if (changedAny) {
            saveSettings();
            if (document.getElementById('bm2_overlay')?.classList.contains('bm2_open')) {
                renderRelationshipsPane();
                drawRelationshipGraph();
            }
            if (toastLines.length > 0 && window.toastr) {
                window.toastr.info(toastLines.join('<br>'), '🌙 BlueMoon: Динамика связей', {
                    escapeHtml: false,
                    timeOut: 5000,
                });
            }
        }
    } catch (err) {
        console.error(`[${MODULE_NAME}] Auto multi-relationship analysis error:`, err);
    } finally {
        isAnalyzing = false;
    }
}

/**
 * Export current character's Nodes, Relationships & Custom Roles to JSON
 */
function exportRelationshipsToJson() {
    try {
        const s = getSettings();
        const prof = getActiveCharProfile();
        const { botName } = getCurrentNamesAndAvatars();
        const safeName = botName.replace(/[^a-zA-Zа-яА-Я0-9_-]/g, '_') || 'character';
        const payload = {
            bluemoon_version: '2.5.0',
            exportedAt: new Date().toISOString(),
            characterName: botName,
            customRoles: s.customRoles || {},
            nodes: prof.nodes,
            relationships: prof.relationships,
            activeRelId: prof.activeRelId,
        };

        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `BlueMoon_Relationships_${safeName}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        if (window.toastr) {
            window.toastr.success('Файл связей и NPC успешно сохранён!', '🌙 BlueMoon Экспорт');
        }
    } catch (err) {
        console.error(`[${MODULE_NAME}] Export error:`, err);
        if (window.toastr) window.toastr.error('Ошибка при экспорте JSON', 'BlueMoon');
    }
}

/**
 * Import Nodes, Relationships & Custom Roles from JSON
 */
function importRelationshipsFromJson(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        try {
            const data = JSON.parse(String(ev.target?.result || '{}'));
            if (!Array.isArray(data.nodes) || !Array.isArray(data.relationships)) {
                if (window.toastr) {
                    window.toastr.warning('Выбранный файл не содержит данных связей BlueMoon.', 'BlueMoon Импорт');
                }
                return;
            }

            const s = getSettings();
            if (data.customRoles && typeof data.customRoles === 'object') {
                s.customRoles = { ...s.customRoles, ...data.customRoles };
            }

            const prof = getActiveCharProfile();
            const { botName, botAvatar, personaName } = getCurrentNamesAndAvatars();

            const replaceAll = confirm(
                'Заменить текущие связи и NPC данными из файла?\n\nНажмите «ОК» для полной замены, или «Отмена», чтобы объединить (добавить недостающих NPC и связи к текущим).'
            );

            if (replaceAll) {
                prof.nodes = data.nodes;
                prof.relationships = data.relationships;
                prof.activeRelId = data.activeRelId || prof.relationships[0]?.id || 'rel_default';
            } else {
                for (const incomingNode of data.nodes) {
                    const existing = prof.nodes.find(
                        (n) => n.id === incomingNode.id || n.name.toLowerCase() === String(incomingNode.name).toLowerCase()
                    );
                    if (!existing) {
                        prof.nodes.push(incomingNode);
                    } else if (incomingNode.avatar && !existing.avatar) {
                        existing.avatar = incomingNode.avatar;
                    }
                }
                for (const incomingRel of data.relationships) {
                    const existingRel = prof.relationships.find(
                        (r) =>
                            (r.fromId === incomingRel.fromId && r.toId === incomingRel.toId) ||
                            r.id === incomingRel.id
                    );
                    if (!existingRel) {
                        prof.relationships.push(incomingRel);
                    } else {
                        existingRel.role = incomingRel.role || existingRel.role;
                        existingRel.mutualStatus = incomingRel.mutualStatus || existingRel.mutualStatus;
                        existingRel.satisfaction =
                            typeof incomingRel.satisfaction === 'number'
                                ? incomingRel.satisfaction
                                : existingRel.satisfaction;
                        existingRel.dates = { ...existingRel.dates, ...(incomingRel.dates || {}) };
                        if (Array.isArray(incomingRel.memories)) {
                            for (const m of incomingRel.memories) {
                                if (!existingRel.memories.some((em) => em.text === m.text)) {
                                    existingRel.memories.push(m);
                                }
                            }
                        }
                    }
                }
            }

            let botNode = prof.nodes.find((n) => n.id === 'node_bot' || n.type === 'bot');
            if (!botNode) {
                prof.nodes.unshift({ id: 'node_bot', name: botName, type: 'bot', avatar: botAvatar, x: 120, y: 200 });
            } else {
                botNode.id = 'node_bot';
                botNode.name = botName;
                if (!botNode.avatar && botAvatar) botNode.avatar = botAvatar;
            }

            let personaNode = prof.nodes.find((n) => n.id === 'node_persona' || n.type === 'persona');
            if (!personaNode) {
                prof.nodes.splice(1, 0, { id: 'node_persona', name: personaName, type: 'persona', avatar: '', x: 250, y: 200 });
            } else {
                personaNode.id = 'node_persona';
                personaNode.name = personaName;
            }

            const baseKey = getBaseCharacterKey();
            s.characterData[baseKey] = structuredClone(prof);

            saveSettings();
            renderRelationshipsPane();
            drawRelationshipGraph();

            if (window.toastr) {
                window.toastr.success(
                    `Загружено участников: ${prof.nodes.length}, связей: ${prof.relationships.length}`,
                    '🌙 BlueMoon Импорт'
                );
            }
        } catch (err) {
            console.error(`[${MODULE_NAME}] Import error:`, err);
            if (window.toastr) window.toastr.error('Не удалось прочитать JSON-файл.', 'BlueMoon Импорт');
        }
    };
    reader.readAsText(file);
}

function autoArrangeNodesInCircle() {
    const prof = getActiveCharProfile();
    const count = prof.nodes.length;
    if (count === 0) return;

    const w = graphState.logicalWidth || 350;
    const h = graphState.logicalHeight || 430;
    const cx = Math.round(w / 2);
    const cy = Math.round(h / 2);

    const radius = Math.max(125, Math.min(w, h) * 0.38 + (count > 5 ? (count - 5) * 18 : 0));

    prof.nodes.forEach((node, idx) => {
        const angle = (idx / count) * Math.PI * 2 - Math.PI / 2;
        node.x = Math.round(cx + Math.cos(angle) * radius);
        node.y = Math.round(cy + Math.sin(angle) * radius);
    });

    graphState.zoom = count > 6 ? 0.82 : 1;
    graphState.panX = Math.round((w - w * graphState.zoom) / 2);
    graphState.panY = Math.round((h - h * graphState.zoom) / 2);

    saveSettings();
    drawRelationshipGraph();
}

async function autoBuildGraphWithAI() {
    const ctx = SillyTavern.getContext();
    const prof = getActiveCharProfile();
    const { botName, personaName } = getCurrentNamesAndAvatars();

    let charDescription = '';
    if (ctx.characterId !== undefined && ctx.characters?.[ctx.characterId]) {
        const ch = ctx.characters[ctx.characterId];
        charDescription = [ch.description, ch.personality, ch.scenario].filter(Boolean).join('\n').slice(0, 2500);
    }

    const recentChat = (ctx.chat || [])
        .slice(-18)
        .map((m) => `${m.name}: ${m.mes}`)
        .join('\n')
        .slice(0, 3500);

    if (window.toastr) {
        window.toastr.info('Нейросеть сканирует лор и чат для построения древа связей...', '🌙 BlueMoon');
    }

    const allRoles = getAllRoles();
    const validRoles = Object.keys(allRoles).join(', ');
    const sysPrompt = `You are a story analyst building an Obsidian-style relationship graph.
Identify key NPCs mentioned in the character lore or chat, and determine relationships between "${botName}", "${personaName}", and any NPCs.
Valid role IDs: ${validRoles}.
Valid mutualStatus (when role is "crush"): secret_one_sided, open_one_sided, unrequited, secret_mutual, open_mutual.
Affinity score ("satisfaction") ranges from -100 (hatred/enemies) to +100 (deep love/devotion), where 0 is neutral strangers.
Return ONLY valid JSON (no markdown) in this exact format:
{
  "npcs": ["NPC Name 1", "NPC Name 2"],
  "links": [
    {
      "from": "${botName}",
      "to": "${personaName}",
      "role": "friends",
      "mutualStatus": "secret_one_sided",
      "satisfaction": 35,
      "memory": "Краткий факт об их связи на русском"
    }
  ]
}`;

    const userPrompt = `Main Character: ${botName}\nUser Persona: ${personaName}\n\nCharacter Lore:\n${charDescription}\n\nChat Excerpt:\n${recentChat}`;

    try {
        const raw = await runAuxiliaryLLMPrompt(sysPrompt, userPrompt, 800);
        const match = String(raw).match(/\{[\s\S]*\}/);
        if (!match) throw new Error('JSON не найден в ответе ИИ');

        const data = JSON.parse(match[0]);

        if (Array.isArray(data.npcs)) {
            for (const npcRaw of data.npcs) {
                const name = String(npcRaw || '').trim();
                if (!name) continue;
                const exists = prof.nodes.some((n) => n.name.toLowerCase() === name.toLowerCase());
                if (!exists) {
                    prof.nodes.push({
                        id: 'npc_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
                        name,
                        type: 'npc',
                        avatar: '',
                        x: 180,
                        y: 180,
                    });
                }
            }
        }

        if (Array.isArray(data.links)) {
            for (const lnk of data.links) {
                const fromNode = prof.nodes.find((n) => n.name.toLowerCase() === String(lnk.from || '').trim().toLowerCase());
                const toNode = prof.nodes.find((n) => n.name.toLowerCase() === String(lnk.to || '').trim().toLowerCase());
                if (!fromNode || !toNode || fromNode.id === toNode.id) continue;

                const role = allRoles[lnk.role] ? lnk.role : 'strangers';
                const mutualStatus = CRUSH_MUTUALITY[lnk.mutualStatus] ? lnk.mutualStatus : 'secret_one_sided';
                let rel = prof.relationships.find(
                    (r) =>
                        (r.fromId === fromNode.id && r.toId === toNode.id) ||
                        (r.fromId === toNode.id && r.toId === fromNode.id)
                );

                if (!rel) {
                    rel = {
                        id: 'rel_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
                        fromId: fromNode.id,
                        toId: toNode.id,
                        role,
                        mutualStatus,
                        satisfaction: Math.max(-100, Math.min(100, Number(lnk.satisfaction) || 0)),
                        dates: {},
                        memories: [],
                    };
                    prof.relationships.push(rel);
                } else {
                    rel.fromId = fromNode.id;
                    rel.toId = toNode.id;
                    rel.role = role;
                    rel.mutualStatus = mutualStatus;
                    if (typeof lnk.satisfaction === 'number') {
                        rel.satisfaction = Math.max(-100, Math.min(100, Math.round(lnk.satisfaction)));
                    }
                }

                if (lnk.memory && String(lnk.memory).trim()) {
                    const memText = String(lnk.memory).trim();
                    if (!rel.memories.some((m) => m.text === memText)) {
                        rel.memories.push({
                            id: Date.now() + Math.floor(Math.random() * 1000),
                            date: new Date().toLocaleDateString('ru-RU'),
                            text: memText,
                        });
                    }
                }
            }
        }

        autoArrangeNodesInCircle();
        renderRelationshipsPane();
        if (window.toastr) {
            window.toastr.success('Древо связей успешно построено и распределено!', '🌙 BlueMoon');
        }
    } catch (err) {
        console.error(`[${MODULE_NAME}] Auto graph build failed:`, err);
        if (window.toastr) {
            window.toastr.error('Не удалось автоматически построить древо: ' + err.message, 'BlueMoon');
        }
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
                resolve(canvas.toDataURL('image/jpeg', 0.84));
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/**
 * Helper to build grouped <optgroup> HTML for any Role <select>
 */
function buildGroupedRoleOptionsHtml(selectedRoleKey) {
    const allRoles = getAllRoles();
    const buckets = {};
    for (const catKey of Object.keys(ROLE_CATEGORIES)) {
        buckets[catKey] = [];
    }

    for (const [roleKey, meta] of Object.entries(allRoles)) {
        const cat = buckets[meta.category] ? meta.category : 'other';
        buckets[cat].push({ roleKey, meta });
    }

    let html = '';
    for (const [catKey, catLabel] of Object.entries(ROLE_CATEGORIES)) {
        const list = buckets[catKey];
        if (!list || list.length === 0) continue;
        html += `<optgroup label="${escapeAttr(catLabel)}">`;
        for (const item of list) {
            const sel = item.roleKey === selectedRoleKey ? 'selected' : '';
            const customTag = item.meta.isCustom ? ' ★' : '';
            html += `<option value="${escapeAttr(item.roleKey)}" ${sel}>${escapeHtml(item.meta.label)}${customTag}</option>`;
        }
        html += `</optgroup>`;
    }
    return html;
}

/**
 * Helper to build grouped <optgroup> HTML for the Relationship Selector <select>
 * so even the native Android popup is structured by sections or characters!
 */
function buildGroupedRelationshipSelectHtml(prof, filteredRels, activeRelId, groupMode) {
    if (groupMode === 'character') {
        let html = '';
        for (const node of prof.nodes) {
            const nodeRels = filteredRels.filter((r) => r.fromId === node.id || r.toId === node.id);
            if (nodeRels.length === 0) continue;
            const roleTag = node.type === 'bot' ? 'Бот' : node.type === 'persona' ? 'Персона' : 'NPC';
            html += `<optgroup label="👤 ${escapeAttr(node.name)} (${roleTag}) — ${nodeRels.length}">`;
            for (const r of nodeRels) {
                const fn = getNodeById(prof, r.fromId);
                const tn = getNodeById(prof, r.toId);
                const rm = getRoleMeta(r.role);
                const arrow = rm.directed ? '➔' : '↔';
                const sign = r.satisfaction > 0 ? `+${r.satisfaction}%` : `${r.satisfaction}%`;
                const sel = r.id === activeRelId ? 'selected' : '';
                html += `<option value="${escapeAttr(r.id)}" ${sel}>${escapeHtml(fn.name)} ${arrow} ${escapeHtml(tn.name)} — ${escapeHtml(rm.shortLabel || rm.label)} (${sign})</option>`;
            }
            html += `</optgroup>`;
        }
        return html;
    }

    // Group by Category (Romance, Family, Friendship, Social, Conflict, Other)
    const buckets = {};
    for (const catKey of Object.keys(ROLE_CATEGORIES)) {
        buckets[catKey] = [];
    }
    for (const r of filteredRels) {
        const rm = getRoleMeta(r.role);
        const cat = buckets[rm.category] ? rm.category : 'other';
        buckets[cat].push(r);
    }

    let html = '';
    for (const [catKey, catLabel] of Object.entries(ROLE_CATEGORIES)) {
        const list = buckets[catKey];
        if (!list || list.length === 0) continue;
        html += `<optgroup label="${escapeAttr(catLabel)} (${list.length})">`;
        for (const r of list) {
            const fn = getNodeById(prof, r.fromId);
            const tn = getNodeById(prof, r.toId);
            const rm = getRoleMeta(r.role);
            const arrow = rm.directed ? '➔' : '↔';
            const sign = r.satisfaction > 0 ? `+${r.satisfaction}%` : `${r.satisfaction}%`;
            const sel = r.id === activeRelId ? 'selected' : '';
            html += `<option value="${escapeAttr(r.id)}" ${sel}>${escapeHtml(fn.name)} ${arrow} ${escapeHtml(tn.name)} — ${escapeHtml(rm.label)} (${sign})</option>`;
        }
        html += `</optgroup>`;
    }
    return html;
}

/**
 * Build Visual Structured Directory Cards (Grouped by Category or Character)
 */
function buildVisualDirectoryHtml(prof, filteredRels, activeRelId, groupMode) {
    if (filteredRels.length === 0) {
        return `<div class="bm2_settings_hint">Нет связей для выбранного фильтра персонажа. Нажмите «+ Новая связь», чтобы добавить.</div>`;
    }

    const renderItemRow = (r) => {
        const fn = getNodeById(prof, r.fromId);
        const tn = getNodeById(prof, r.toId);
        const rm = getRoleMeta(r.role);
        const arrow = rm.directed ? '➔' : '↔';
        const sign = r.satisfaction > 0 ? `+${r.satisfaction}%` : `${r.satisfaction}%`;
        const satColor = r.satisfaction > 0 ? '#9ece6a' : r.satisfaction < 0 ? '#f7768e' : 'var(--bm2-text-muted)';
        const isActive = r.id === activeRelId;
        const badgeText =
            r.role === 'crush'
                ? CRUSH_MUTUALITY[r.mutualStatus]?.shortLabel || rm.shortLabel
                : rm.shortLabel || rm.label;

        return `
        <div class="bm2_dir_item ${isActive ? 'bm2_active' : ''}" data-rel-id="${escapeAttr(r.id)}">
            <div class="bm2_dir_pair">
                <span>${escapeHtml(fn.name)} <b style="color:${rm.color}">${arrow}</b> ${escapeHtml(tn.name)}</span>
                <span class="bm2_dir_role_badge" style="border-color:${rm.color};color:${rm.color};">${escapeHtml(badgeText)}</span>
            </div>
            <span class="bm2_dir_sat" style="color:${satColor};">${sign}</span>
        </div>`;
    };

    if (groupMode === 'character') {
        let html = '';
        for (const node of prof.nodes) {
            if (activeCharFilterId !== 'all' && node.id !== activeCharFilterId) continue;
            const nodeRels = filteredRels.filter((r) => r.fromId === node.id || r.toId === node.id);
            if (nodeRels.length === 0) continue;
            const roleTag = node.type === 'bot' ? 'Бот' : node.type === 'persona' ? 'Персона' : 'NPC';
            html += `
            <div class="bm2_dir_section">
                <div class="bm2_dir_sec_header">
                    <span>👤 ${escapeHtml(node.name)} (${roleTag})</span>
                    <span>${nodeRels.length}</span>
                </div>
                <div class="bm2_dir_items">
                    ${nodeRels.map(renderItemRow).join('')}
                </div>
            </div>`;
        }
        return html;
    }

    // Default: Group by Category
    const buckets = {};
    for (const catKey of Object.keys(ROLE_CATEGORIES)) {
        buckets[catKey] = [];
    }
    for (const r of filteredRels) {
        const rm = getRoleMeta(r.role);
        const cat = buckets[rm.category] ? rm.category : 'other';
        buckets[cat].push(r);
    }

    let html = '';
    for (const [catKey, catLabel] of Object.entries(ROLE_CATEGORIES)) {
        const list = buckets[catKey];
        if (!list || list.length === 0) continue;
        html += `
        <div class="bm2_dir_section">
            <div class="bm2_dir_sec_header">
                <span>${escapeHtml(catLabel)}</span>
                <span>${list.length}</span>
            </div>
            <div class="bm2_dir_items">
                ${list.map(renderItemRow).join('')}
            </div>
        </div>`;
    }
    return html;
}

/**
 * Prompt user to create a Custom Manual Relationship Role/Status
 */
function createCustomRoleInteractive(rel) {
    const label = prompt(
        'Введите название нового статуса / связи (например: «Жених по расчёту», «Кровный враг», «Сталкер → Объект», «Психолог → Пациент»):'
    );
    if (!label || !label.trim()) return;

    const cleanLabel = label.trim();
    const isDirected = confirm(
        `Эта связь односторонняя / направленная (со стрелкой «Участник 1 ➔ Участник 2»)?\n\nНажмите «ОК», если со стрелкой (➔), или «Отмена», если связь обоюдная (↔).`
    );

    const s = getSettings();
    const roleId = 'custom_' + Date.now();
    s.customRoles[roleId] = {
        label: cleanLabel,
        shortLabel: cleanLabel.length > 15 ? cleanLabel.slice(0, 14) + '…' : cleanLabel,
        category: 'other',
        color: isDirected ? '#ff9e64' : '#bb9af7',
        directed: isDirected,
        dashed: false,
    };

    if (rel) {
        rel.role = roleId;
    }

    saveSettings();
    renderRelationshipsPane();
    drawRelationshipGraph();
    if (window.toastr) {
        window.toastr.success(`Статус «${cleanLabel}» добавлен в список связей!`, '🌙 BlueMoon');
    }
}

/**
 * Build Modal HTML and Wand Menu Item
 */
function buildModalUI() {
    if (document.getElementById('bm2_overlay')) return;

    const wandMenu = document.getElementById('extensionsMenu');
    if (wandMenu && !document.getElementById('bm2_wand_item')) {
        const item = document.createElement('div');
        item.id = 'bm2_wand_item';
        item.className = 'list-group-item flex-container flexGap5 interactable';
        item.title = 'Открыть BlueMoon: Связи, Древо и Стиль';
        item.innerHTML = `<div class="fa-solid fa-moon extensionsMenuExtensionButton"></div><span>BlueMoon: Связи и Стиль</span>`;
        item.addEventListener('click', () => openModal());
        wandMenu.appendChild(item);
    }

    if (!document.getElementById('bm2_hidden_avatar_input')) {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.id = 'bm2_hidden_avatar_input';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);
    }

    if (!document.getElementById('bm2_hidden_json_input')) {
        const jsonInput = document.createElement('input');
        jsonInput.type = 'file';
        jsonInput.id = 'bm2_hidden_json_input';
        jsonInput.accept = '.json,application/json';
        jsonInput.style.display = 'none';
        jsonInput.addEventListener('change', (ev) => {
            const file = ev.target.files?.[0];
            if (file) importRelationshipsFromJson(file);
            jsonInput.value = '';
        });
        document.body.appendChild(jsonInput);
    }

    const overlay = document.createElement('div');
    overlay.id = 'bm2_overlay';
    overlay.innerHTML = `
        <div id="bm2_modal" role="dialog" aria-modal="true">
            <div class="bm2_header">
                <div class="bm2_title_wrap">
                    <span class="bm2_moon_icon">🌙</span>
                    <h3>BlueMoon</h3>
                    <span id="bm2_active_char_badge" class="bm2_badge_char">Персонаж</span>
                </div>
                <div class="bm2_header_actions">
                    <button type="button" id="bm2_quick_prompt_btn" class="bm2_prompt_top_btn" title="Посмотреть, что именно передаётся ИИ">
                        👁️ Промпт
                    </button>
                    <button type="button" class="bm2_close_btn" id="bm2_close_modal_btn" title="Закрыть окно">
                        ✕ Закрыть
                    </button>
                </div>
            </div>

            <div class="bm2_tabs">
                <button type="button" class="bm2_tab_btn bm2_active" data-tab="rel">💞 Связи</button>
                <button type="button" class="bm2_tab_btn" data-tab="graph">🕸️ Древо</button>
                <button type="button" class="bm2_tab_btn" data-tab="style">🎚️ Стиль</button>
                <button type="button" class="bm2_tab_btn" data-tab="theme">🎨 Темы</button>
            </div>

            <div class="bm2_body">
                <!-- PANE 1: RELATIONSHIPS & NPCs -->
                <div class="bm2_pane bm2_active" id="bm2_pane_rel"></div>

                <!-- PANE 2: OBSIDIAN RELATIONSHIP GRAPH -->
                <div class="bm2_pane" id="bm2_pane_graph">
                    <div class="bm2_card">
                        <div class="bm2_card_header">
                            <h4 class="bm2_card_title">🕸️ Созвездие Связей (Obsidian Graph)</h4>
                            <div style="display:flex;gap:6px;flex-wrap:wrap;">
                                <button type="button" class="bm2_btn" id="bm2_arrange_graph_btn" style="flex:0 0 auto;min-height:32px;padding:4px 9px;" title="Аккуратно раздвинуть все круги по созвездию">
                                    🫧 Распределить
                                </button>
                                <button type="button" class="bm2_btn bm2_btn_primary" id="bm2_ai_build_graph_btn" style="flex:0 0 auto;min-height:32px;padding:4px 10px;">
                                    ✨ Построить ИИ
                                </button>
                            </div>
                        </div>
                        <p class="bm2_settings_hint" style="margin:0;">
                            Перетаскивайте круги пальцем. Нажмите «🫧 Распределить», чтобы красиво раздвинуть персонажей по кругу.
                        </p>
                        <div class="bm2_graph_container" id="bm2_graph_wrap">
                            <canvas id="bm2_graph_canvas"></canvas>
                            <div class="bm2_graph_toolbar">
                                <button type="button" class="bm2_graph_tool_btn" id="bm2_zoom_in_btn" title="Приблизить">＋</button>
                                <button type="button" class="bm2_graph_tool_btn" id="bm2_zoom_out_btn" title="Отдалить">－</button>
                                <button type="button" class="bm2_graph_tool_btn" id="bm2_zoom_reset_btn" title="Центрировать">⟲</button>
                            </div>
                        </div>
                        <div class="bm2_graph_legend">
                            <span class="bm2_legend_item"><i class="bm2_legend_dot" style="background:#ff9e64;color:#ff9e64"></i> Влюблённость 💘</span>
                            <span class="bm2_legend_item"><i class="bm2_legend_dot" style="background:#ff7eb6;color:#ff7eb6"></i> Пара / Любовь</span>
                            <span class="bm2_legend_item"><i class="bm2_legend_dot" style="background:#ffd700;color:#ffd700"></i> Брак</span>
                            <span class="bm2_legend_item"><i class="bm2_legend_dot" style="background:#7aa2f7;color:#7aa2f7"></i> Дружба</span>
                            <span class="bm2_legend_item"><i class="bm2_legend_dot" style="background:#9ece6a;color:#9ece6a"></i> Семья / Дети</span>
                            <span class="bm2_legend_item"><i class="bm2_legend_dot" style="background:#f7768e;color:#f7768e"></i> Вражда (-%)</span>
                        </div>
                    </div>
                </div>

                <!-- PANE 3: NARRATIVE STYLE & CUSTOM SLIDERS -->
                <div class="bm2_pane" id="bm2_pane_style"></div>

                <!-- PANE 4: THEMES & LIVE PROMPT PREVIEW -->
                <div class="bm2_pane" id="bm2_pane_theme"></div>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById('bm2_close_modal_btn').addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
    });

    document.getElementById('bm2_quick_prompt_btn').addEventListener('click', () => {
        switchTab('theme');
        setTimeout(() => {
            document.getElementById('bm2_live_prompt_box')?.scrollIntoView({ behavior: 'smooth' });
        }, 80);
    });

    overlay.querySelectorAll('.bm2_tab_btn').forEach((btn) => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    initGraphCanvasInteractions();
}

function switchTab(tabId) {
    const overlay = document.getElementById('bm2_overlay');
    if (!overlay) return;
    overlay.querySelectorAll('.bm2_tab_btn').forEach((b) => {
        b.classList.toggle('bm2_active', b.dataset.tab === tabId);
    });
    overlay.querySelectorAll('.bm2_pane').forEach((p) => {
        p.classList.toggle('bm2_active', p.id === `bm2_pane_${tabId}`);
    });
    if (tabId === 'graph') {
        setTimeout(() => {
            syncCanvasResolution();
            drawRelationshipGraph();
        }, 30);
    }
    if (tabId === 'theme') {
        updatePromptInjections();
    }
}

function openModal() {
    buildModalUI();
    applyThemeVariables();
    renderAllPanes();
    document.getElementById('bm2_overlay').classList.add('bm2_open');
    setTimeout(() => {
        syncCanvasResolution();
        drawRelationshipGraph();
    }, 50);
}

function closeModal() {
    const el = document.getElementById('bm2_overlay');
    if (el) el.classList.remove('bm2_open');
}

function renderAllPanes() {
    const { botName } = getCurrentNamesAndAvatars();
    const badge = document.getElementById('bm2_active_char_badge');
    if (badge) badge.textContent = botName;

    renderRelationshipsPane();
    renderStylePane();
    renderThemePane();
    updatePromptInjections();
}

/**
 * Render Pane 1: Participants, Structured Relationship Directory, Custom Roles & Bipolar Meter
 */
function renderRelationshipsPane() {
    const pane = document.getElementById('bm2_pane_rel');
    if (!pane) return;

    const s = getSettings();
    const prof = getActiveCharProfile();
    const rel = getActiveRelationship();
    const roleMeta = getRoleMeta(rel.role);

    if (activeCharFilterId !== 'all' && !prof.nodes.some((n) => n.id === activeCharFilterId)) {
        activeCharFilterId = 'all';
    }

    // 1. Participants Strip HTML
    const nodesHtml = prof.nodes
        .map((n) => {
            const roleTag = n.type === 'bot' ? 'Бот' : n.type === 'persona' ? 'Персона' : 'NPC';
            const initials = escapeHtml((n.name || '?').slice(0, 2).toUpperCase());
            const avatarInner = n.avatar
                ? `<img src="${escapeAttr(n.avatar)}" alt="" />`
                : `<span>${initials}</span>`;
            const delBtn =
                n.type === 'npc'
                    ? `<button type="button" class="bm2_icon_sm_btn bm2_del_node_btn" data-id="${escapeAttr(n.id)}" title="Удалить NPC">🗑️</button>`
                    : '';
            return `
            <div class="bm2_node_pill">
                <div class="bm2_node_avatar">${avatarInner}</div>
                <div class="bm2_node_info">
                    <span class="bm2_node_name">${escapeHtml(n.name)}</span>
                    <span class="bm2_node_role_tag">${roleTag}</span>
                </div>
                <div class="bm2_node_actions">
                    <button type="button" class="bm2_icon_sm_btn bm2_upload_avatar_btn" data-id="${escapeAttr(n.id)}" title="Загрузить фото с телефона">📷</button>
                    <button type="button" class="bm2_icon_sm_btn bm2_url_avatar_btn" data-id="${escapeAttr(n.id)}" title="Вставить ссылку URL на фото или очистить">🔗</button>
                    ${delBtn}
                </div>
            </div>`;
        })
        .join('');

    // 2. Character Filter Pills ("Все (18)", "Лёша (4)", "Дэниэль (9)"...)
    const filterChipsHtml = [
        `<button type="button" class="bm2_filter_chip ${activeCharFilterId === 'all' ? 'bm2_active' : ''}" data-char-id="all">
            Все связи (${prof.relationships.length})
        </button>`,
        ...prof.nodes.map((n) => {
            const cnt = prof.relationships.filter((r) => r.fromId === n.id || r.toId === n.id).length;
            const isAct = activeCharFilterId === n.id;
            return `<button type="button" class="bm2_filter_chip ${isAct ? 'bm2_active' : ''}" data-char-id="${escapeAttr(n.id)}">
                ${escapeHtml(n.name)} (${cnt})
            </button>`;
        }),
    ].join('');

    // Filter relationships according to selected character pill
    const filteredRels =
        activeCharFilterId === 'all'
            ? prof.relationships
            : prof.relationships.filter((r) => r.fromId === activeCharFilterId || r.toId === activeCharFilterId);

    const groupMode = s.relGroupMode || 'category';
    const visualDirectoryHtml = buildVisualDirectoryHtml(prof, filteredRels, rel.id, groupMode);
    const groupedRelSelectHtml = buildGroupedRelationshipSelectHtml(prof, filteredRels, rel.id, groupMode);

    const nodeOptionsAll = prof.nodes
        .map((n) => `<option value="${escapeAttr(n.id)}">${escapeHtml(n.name)}</option>`)
        .join('');

    const nodeOptionsFrom = prof.nodes
        .map((n) => `<option value="${escapeAttr(n.id)}" ${n.id === rel.fromId ? 'selected' : ''}>${escapeHtml(n.name)}</option>`)
        .join('');

    const nodeOptionsTo = prof.nodes
        .map((n) => `<option value="${escapeAttr(n.id)}" ${n.id === rel.toId ? 'selected' : ''}>${escapeHtml(n.name)}</option>`)
        .join('');

    const groupedRoleOptionsHtml = buildGroupedRoleOptionsHtml(rel.role);

    const crushMutualityHtml =
        rel.role === 'crush'
            ? `
            <div style="margin-top:4px;padding:10px;border-radius:10px;background:rgba(255, 158, 100, 0.12);border:1px solid rgba(255, 158, 100, 0.4);">
                <label class="bm2_label" style="color:#ff9e64;font-weight:700;">💘 Формат влюблённости и тайны (Кто ➔ В кого):</label>
                <select id="bm2_crush_mutuality_select" class="bm2_select">
                    ${Object.entries(CRUSH_MUTUALITY)
                        .map(
                            ([k, v]) =>
                                `<option value="${k}" ${rel.mutualStatus === k ? 'selected' : ''}>${escapeHtml(v.label)}</option>`
                        )
                        .join('')}
                </select>
                <span class="bm2_slider_hint" style="display:block;margin-top:4px;">
                    При выборе «Тайно влюблён(а)» ИИ получает строгий запрет: второй персонаж НЕ знает о чувствах первого, пока не произойдёт признание.
                </span>
            </div>`
            : '';

    const dateInputsHtml = (roleMeta.dateFields || [])
        .map((df) => {
            const val = rel.dates?.[df.key] || '';
            return `
            <div>
                <label class="bm2_label">${escapeHtml(df.label)}</label>
                <input type="text" class="bm2_input bm2_date_input" data-date-key="${df.key}"
                       placeholder="Напр. 14 февраля / Осень 2024" value="${escapeAttr(val)}" />
            </div>`;
        })
        .join('');

    const memoriesHtml =
        rel.memories.length === 0
            ? `<div class="bm2_settings_hint">Пока нет сохранённых моментов для этой пары. Добавьте вручную или нажмите «Сканировать все связи ИИ».</div>`
            : rel.memories
                  .map(
                      (m) => `
                <div class="bm2_memory_item">
                    <div>
                        <span class="bm2_memory_date">📅 ${escapeHtml(m.date || 'Памятный момент')}</span>
                        <span>${escapeHtml(m.text)}</span>
                    </div>
                    <button type="button" class="bm2_icon_btn bm2_del_mem_btn" data-id="${m.id}" title="Удалить">🗑️</button>
                </div>`
                  )
                  .join('');

    const sat = rel.satisfaction;
    const posWidth = sat > 0 ? `${sat / 2}%` : '0%';
    const negWidth = sat < 0 ? `${Math.abs(sat) / 2}%` : '0%';
    const satDisplay = sat > 0 ? `+${sat}%` : `${sat}%`;
    const satColor = sat > 0 ? '#9ece6a' : sat < 0 ? '#f7768e' : 'var(--bm2-text-muted)';

    const fromNodeObj = getNodeById(prof, rel.fromId);
    const toNodeObj = getNodeById(prof, rel.toId);

    pane.innerHTML = `
        <!-- CARD 1: PARTICIPANTS & NPCs + JSON BACKUP -->
        <div class="bm2_card">
            <div class="bm2_card_header">
                <h4 class="bm2_card_title">👥 Участники и NPC (${prof.nodes.length})</h4>
                <div style="display:flex;gap:5px;flex-wrap:wrap;">
                    <button type="button" class="bm2_btn" id="bm2_export_json_btn" style="flex:0 0 auto;min-height:32px;padding:4px 9px;" title="Скачать все связи и NPC этого персонажа в файл JSON">
                        📥 Экспорт
                    </button>
                    <button type="button" class="bm2_btn" id="bm2_import_json_btn" style="flex:0 0 auto;min-height:32px;padding:4px 9px;" title="Загрузить связи и NPC из файла JSON">
                        📤 Импорт
                    </button>
                    <button type="button" class="bm2_btn bm2_btn_primary" id="bm2_add_npc_btn" style="flex:0 0 auto;min-height:32px;padding:4px 10px;">
                        + NPC
                    </button>
                </div>
            </div>
            <div class="bm2_nodes_strip">${nodesHtml}</div>
            <span class="bm2_slider_hint">Нажмите 📷 для загрузки фото с телефона или 🔗 для URL.</span>
        </div>

        <!-- CARD 2: STRUCTURED RELATIONSHIP DIRECTORY & EDITOR -->
        <div class="bm2_card">
            <div class="bm2_card_header">
                <h4 class="bm2_card_title">🔗 Каталог связей (${prof.relationships.length})</h4>
                <div style="display:flex;gap:6px;">
                    <button type="button" class="bm2_btn bm2_btn_primary" id="bm2_toggle_new_rel_drawer_btn" style="min-height:32px;padding:4px 10px;">
                        + Добавить связь вручную
                    </button>
                    ${
                        prof.relationships.length > 1
                            ? `<button type="button" class="bm2_btn bm2_btn_danger" id="bm2_del_rel_btn" style="min-height:32px;padding:4px 10px;" title="Удалить текущую выбранную связь">🗑️</button>`
                            : ''
                    }
                </div>
            </div>

            <!-- Manual New Link Drawer -->
            <div class="bm2_new_link_drawer ${isNewLinkDrawerOpen ? 'bm2_open' : ''}" id="bm2_new_link_drawer">
                <div style="font-size:0.82rem;font-weight:700;color:var(--bm2-accent);">➕ Создание новой связи вручную:</div>
                <div class="bm2_grid_2">
                    <div>
                        <label class="bm2_label">Кто (Участник 1):</label>
                        <select id="bm2_new_rel_from" class="bm2_select">${nodeOptionsAll}</select>
                    </div>
                    <div>
                        <label class="bm2_label">С кем (Участник 2):</label>
                        <select id="bm2_new_rel_to" class="bm2_select">${nodeOptionsAll}</select>
                    </div>
                </div>
                <div>
                    <label class="bm2_label">Статус / Роль новой связи:</label>
                    <select id="bm2_new_rel_role" class="bm2_select">${buildGroupedRoleOptionsHtml('friends')}</select>
                </div>
                <div class="bm2_btn_row">
                    <button type="button" class="bm2_btn bm2_btn_primary" id="bm2_confirm_create_rel_btn">✓ Создать связь</button>
                    <button type="button" class="bm2_btn" id="bm2_cancel_create_rel_btn">Отмена</button>
                </div>
            </div>

            <!-- Filter by Character Pills -->
            <div>
                <div class="bm2_group_mode_row" style="margin-bottom:5px;">
                    <span class="bm2_label" style="margin:0;">Фильтр по персонажу:</span>
                    <div class="bm2_mode_switch">
                        <button type="button" class="bm2_mode_btn ${groupMode === 'category' ? 'bm2_active' : ''}" data-mode="category">📂 По разделам</button>
                        <button type="button" class="bm2_mode_btn ${groupMode === 'character' ? 'bm2_active' : ''}" data-mode="character">👤 По персонажам</button>
                    </div>
                </div>
                <div class="bm2_filter_bar">${filterChipsHtml}</div>
            </div>

            <!-- Visual Categorized Directory -->
            <div class="bm2_directory_box">
                ${visualDirectoryHtml}
            </div>

            <!-- Fallback Native Grouped Select -->
            <div>
                <label class="bm2_label">Или выберите из выпадающего списка (с разделами):</label>
                <select id="bm2_rel_selector" class="bm2_select">${groupedRelSelectHtml}</select>
            </div>

            <hr style="border:none;border-top:1px solid var(--bm2-border);margin:2px 0;" />

            <!-- Active Pair Editor Header -->
            <div style="font-size:0.86rem;font-weight:700;color:var(--bm2-accent);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px;">
                <span>✏️ Редактирование: ${escapeHtml(fromNodeObj.name)} ${roleMeta.directed ? '➔' : '↔'} ${escapeHtml(toNodeObj.name)}</span>
                ${
                    roleMeta.isCustom
                        ? `<button type="button" class="bm2_btn bm2_btn_danger" id="bm2_del_custom_role_btn" style="flex:0 0 auto;min-height:28px;padding:2px 8px;font-size:0.74rem;">Удалить свой статус «${escapeHtml(roleMeta.label)}»</button>`
                        : ''
                }
            </div>

            <div class="bm2_grid_2">
                <div>
                    <label class="bm2_label">Участник 1 (Кто / Влюблённый / Родитель):</label>
                    <select id="bm2_rel_from_select" class="bm2_select">${nodeOptionsFrom}</select>
                </div>
                <div>
                    <label class="bm2_label">Участник 2 (К кому / Объект чувств / Ребёнок):</label>
                    <select id="bm2_rel_to_select" class="bm2_select">${nodeOptionsTo}</select>
                </div>
            </div>

            <div>
                <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;margin-bottom:3px;">
                    <label class="bm2_label" style="margin:0;">Статус / Роль связи (25 видов + свои):</label>
                    <button type="button" class="bm2_btn" id="bm2_create_custom_role_btn" style="flex:0 0 auto;min-height:28px;padding:2px 9px;font-size:0.75rem;border-color:var(--bm2-accent);color:var(--bm2-accent);">
                        ➕ Свой статус вручную
                    </button>
                </div>
                <select id="bm2_role_select" class="bm2_select">${groupedRoleOptionsHtml}</select>
            </div>

            ${crushMutualityHtml}

            <div class="bm2_meter_wrap">
                <div class="bm2_meter_top">
                    <span>Шкала отношений (-100% Вражда ... +100% Любовь)</span>
                    <span id="bm2_sat_label" style="color:${satColor};font-weight:700;">${satDisplay}</span>
                </div>
                <div class="bm2_meter_bipolar_bar">
                    <div class="bm2_meter_zero_tick" title="0% Нейтрально"></div>
                    <div class="bm2_meter_fill_neg" id="bm2_sat_fill_neg" style="width: ${negWidth};"></div>
                    <div class="bm2_meter_fill_pos" id="bm2_sat_fill_pos" style="width: ${posWidth};"></div>
                </div>
                <div class="bm2_meter_controls">
                    <button type="button" class="bm2_btn" id="bm2_sat_minus" style="flex:0 0 44px;">-5%</button>
                    <input type="range" id="bm2_sat_range" class="bm2_range" min="-100" max="100" step="1" value="${sat}" />
                    <button type="button" class="bm2_btn" id="bm2_sat_zero" style="flex:0 0 40px;" title="Сбросить в 0%">0%</button>
                    <button type="button" class="bm2_btn" id="bm2_sat_plus" style="flex:0 0 44px;">+5%</button>
                </div>
            </div>
        </div>

        <!-- CARD 3: DYNAMIC DATES -->
        <div class="bm2_card">
            <h4 class="bm2_card_title">📅 Значимые даты (${escapeHtml(roleMeta.label)})</h4>
            <div class="bm2_grid_2">
                ${dateInputsHtml}
            </div>
        </div>

        <!-- CARD 4: SHARED MEMORIES -->
        <div class="bm2_card">
            <div class="bm2_card_header">
                <h4 class="bm2_card_title">🧠 Ключевые события этой пары</h4>
                <button type="button" class="bm2_btn bm2_btn_primary" id="bm2_analyze_now_btn" style="flex:0 0 auto;min-height:32px;padding:4px 10px;">
                    ✨ Сканировать все связи ИИ
                </button>
            </div>
            <div class="bm2_memory_list" id="bm2_memory_list">
                ${memoriesHtml}
            </div>
            <div class="bm2_grid_2" style="margin-top:4px;">
                <input type="text" id="bm2_new_mem_date" class="bm2_input" placeholder="Дата (напр. Глава 3 / Вчера)" />
                <input type="text" id="bm2_new_mem_text" class="bm2_input" placeholder="Что важного произошло между ними..." />
            </div>
            <button type="button" class="bm2_btn" id="bm2_add_mem_btn">+ Добавить памятное событие</button>
        </div>
    `;

    // Bind JSON Export/Import
    pane.querySelector('#bm2_export_json_btn')?.addEventListener('click', exportRelationshipsToJson);
    pane.querySelector('#bm2_import_json_btn')?.addEventListener('click', () => {
        document.getElementById('bm2_hidden_json_input')?.click();
    });

    // Bind Add NPC
    pane.querySelector('#bm2_add_npc_btn').addEventListener('click', () => {
        const name = prompt('Введите имя нового персонажа / NPC:');
        if (!name || !name.trim()) return;
        const w = graphState.logicalWidth || 340;
        const h = graphState.logicalHeight || 420;
        const angle = Math.random() * Math.PI * 2;
        const newNode = {
            id: 'npc_' + Date.now(),
            name: name.trim(),
            type: 'npc',
            avatar: '',
            x: Math.round(w / 2 + Math.cos(angle) * 110),
            y: Math.round(h / 2 + Math.sin(angle) * 110),
        };
        prof.nodes.push(newNode);
        saveSettings();
        renderRelationshipsPane();
        drawRelationshipGraph();
    });

    // Bind Upload Avatar (📷) & URL (🔗)
    pane.querySelectorAll('.bm2_upload_avatar_btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            const node = getNodeById(prof, btn.dataset.id);
            const fileInput = document.getElementById('bm2_hidden_avatar_input');
            if (!fileInput) return;
            fileInput.onchange = async (ev) => {
                const file = ev.target.files?.[0];
                if (!file) return;
                try {
                    const dataUrl = await readAndCompressImage(file, 160);
                    node.avatar = dataUrl;
                    avatarImageCache.delete(dataUrl);
                    saveSettings();
                    renderRelationshipsPane();
                    drawRelationshipGraph();
                    if (window.toastr) window.toastr.success(`Фото для «${node.name}» загружено!`, 'BlueMoon');
                } catch (err) {
                    console.error(`[${MODULE_NAME}] Image upload failed:`, err);
                    if (window.toastr) window.toastr.error('Не удалось обработать изображение', 'BlueMoon');
                } finally {
                    fileInput.value = '';
                }
            };
            fileInput.click();
        });
    });

    pane.querySelectorAll('.bm2_url_avatar_btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            const node = getNodeById(prof, btn.dataset.id);
            const url = prompt(
                `Вставьте прямую ссылку (URL) на аватарку для «${node.name}» (или оставьте пустым для удаления фото):`,
                node.avatar?.startsWith('data:') ? '' : node.avatar || ''
            );
            if (url === null) return;
            node.avatar = url.trim();
            saveSettings();
            renderRelationshipsPane();
            drawRelationshipGraph();
        });
    });

    pane.querySelectorAll('.bm2_del_node_btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            const nodeId = btn.dataset.id;
            const node = getNodeById(prof, nodeId);
            if (!confirm(`Удалить NPC «${node.name}» и все связанные с ним линии отношений?`)) return;
            prof.nodes = prof.nodes.filter((n) => n.id !== nodeId);
            prof.relationships = prof.relationships.filter((r) => r.fromId !== nodeId && r.toId !== nodeId);
            if (prof.relationships.length === 0) {
                prof.relationships.push({
                    id: 'rel_' + Date.now(),
                    fromId: 'node_bot',
                    toId: 'node_persona',
                    role: 'strangers',
                    mutualStatus: 'secret_one_sided',
                    satisfaction: 0,
                    dates: {},
                    memories: [],
                });
            }
            prof.activeRelId = prof.relationships[0].id;
            saveSettings();
            renderRelationshipsPane();
            drawRelationshipGraph();
        });
    });

    // Bind Filter by Character Chips
    pane.querySelectorAll('.bm2_filter_chip').forEach((chip) => {
        chip.addEventListener('click', () => {
            activeCharFilterId = chip.dataset.charId || 'all';
            renderRelationshipsPane();
        });
    });

    // Bind Group Mode Switch (By Category / By Character)
    pane.querySelectorAll('.bm2_mode_btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            s.relGroupMode = btn.dataset.mode || 'category';
            saveSettings();
            renderRelationshipsPane();
        });
    });

    // Bind Clicking on any Item in the Visual Structured Directory
    pane.querySelectorAll('.bm2_dir_item').forEach((item) => {
        item.addEventListener('click', () => {
            prof.activeRelId = item.dataset.relId;
            saveSettings();
            renderRelationshipsPane();
        });
    });

    // Bind Native Select fallback
    pane.querySelector('#bm2_rel_selector').addEventListener('change', (e) => {
        prof.activeRelId = e.target.value;
        saveSettings();
        renderRelationshipsPane();
    });

    // Bind Manual New Link Drawer Toggle & Creation
    pane.querySelector('#bm2_toggle_new_rel_drawer_btn').addEventListener('click', () => {
        isNewLinkDrawerOpen = !isNewLinkDrawerOpen;
        const drawer = document.getElementById('bm2_new_link_drawer');
        if (drawer) {
            drawer.classList.toggle('bm2_open', isNewLinkDrawerOpen);
            const toSel = document.getElementById('bm2_new_rel_to');
            if (toSel && prof.nodes.length > 1) {
                toSel.selectedIndex = 1;
            }
        }
    });

    pane.querySelector('#bm2_cancel_create_rel_btn')?.addEventListener('click', () => {
        isNewLinkDrawerOpen = false;
        document.getElementById('bm2_new_link_drawer')?.classList.remove('bm2_open');
    });

    pane.querySelector('#bm2_confirm_create_rel_btn')?.addEventListener('click', () => {
        const fromId = document.getElementById('bm2_new_rel_from').value;
        const toId = document.getElementById('bm2_new_rel_to').value;
        const role = document.getElementById('bm2_new_rel_role').value || 'friends';

        if (fromId === toId) {
            if (window.toastr) window.toastr.warning('Выберите двух разных участников для связи.', 'BlueMoon');
            return;
        }

        const newRel = {
            id: 'rel_' + Date.now(),
            fromId,
            toId,
            role,
            mutualStatus: 'secret_one_sided',
            satisfaction: 0,
            dates: {},
            memories: [],
        };
        prof.relationships.push(newRel);
        prof.activeRelId = newRel.id;
        isNewLinkDrawerOpen = false;
        saveSettings();
        renderRelationshipsPane();
        drawRelationshipGraph();
        if (window.toastr) window.toastr.success('Новая связь добавлена!', '🌙 BlueMoon');
    });

    // Bind Delete Active Relationship
    const delRelBtn = pane.querySelector('#bm2_del_rel_btn');
    if (delRelBtn) {
        delRelBtn.addEventListener('click', () => {
            if (prof.relationships.length <= 1) return;
            if (!confirm(`Удалить связь «${fromNodeObj.name} — ${toNodeObj.name}»?`)) return;
            prof.relationships = prof.relationships.filter((r) => r.id !== rel.id);
            prof.activeRelId = prof.relationships[0].id;
            saveSettings();
            renderRelationshipsPane();
            drawRelationshipGraph();
        });
    }

    // Bind Create Custom Role Manually Button
    pane.querySelector('#bm2_create_custom_role_btn')?.addEventListener('click', () => {
        createCustomRoleInteractive(rel);
    });

    // Bind Delete Custom Role Button
    pane.querySelector('#bm2_del_custom_role_btn')?.addEventListener('click', () => {
        if (!roleMeta.isCustom) return;
        if (!confirm(`Удалить ваш пользовательский статус «${roleMeta.label}»?`)) return;
        delete s.customRoles[rel.role];
        rel.role = 'strangers';
        saveSettings();
        renderRelationshipsPane();
        drawRelationshipGraph();
    });

    pane.querySelector('#bm2_rel_from_select').addEventListener('change', (e) => {
        rel.fromId = e.target.value;
        saveSettings();
        renderRelationshipsPane();
        drawRelationshipGraph();
    });

    pane.querySelector('#bm2_rel_to_select').addEventListener('change', (e) => {
        rel.toId = e.target.value;
        saveSettings();
        renderRelationshipsPane();
        drawRelationshipGraph();
    });

    pane.querySelector('#bm2_role_select').addEventListener('change', (e) => {
        rel.role = e.target.value;
        saveSettings();
        renderRelationshipsPane();
        drawRelationshipGraph();
    });

    const crushMutSelect = pane.querySelector('#bm2_crush_mutuality_select');
    if (crushMutSelect) {
        crushMutSelect.addEventListener('change', (e) => {
            rel.mutualStatus = e.target.value;
            saveSettings();
            renderRelationshipsPane();
            drawRelationshipGraph();
        });
    }

    const updateSat = (val) => {
        rel.satisfaction = Math.max(-100, Math.min(100, Number(val) || 0));
        const lbl = document.getElementById('bm2_sat_label');
        const fillPos = document.getElementById('bm2_sat_fill_pos');
        const fillNeg = document.getElementById('bm2_sat_fill_neg');
        const rng = document.getElementById('bm2_sat_range');

        const sVal = rel.satisfaction;
        if (lbl) {
            lbl.textContent = sVal > 0 ? `+${sVal}%` : `${sVal}%`;
            lbl.style.color = sVal > 0 ? '#9ece6a' : sVal < 0 ? '#f7768e' : 'var(--bm2-text-muted)';
        }
        if (fillPos) fillPos.style.width = sVal > 0 ? `${sVal / 2}%` : '0%';
        if (fillNeg) fillNeg.style.width = sVal < 0 ? `${Math.abs(sVal) / 2}%` : '0%';
        if (rng) rng.value = sVal;

        saveSettings();
        drawRelationshipGraph();
    };

    pane.querySelector('#bm2_sat_range').addEventListener('input', (e) => updateSat(e.target.value));
    pane.querySelector('#bm2_sat_minus').addEventListener('click', () => updateSat(rel.satisfaction - 5));
    pane.querySelector('#bm2_sat_zero').addEventListener('click', () => updateSat(0));
    pane.querySelector('#bm2_sat_plus').addEventListener('click', () => updateSat(rel.satisfaction + 5));

    pane.querySelectorAll('.bm2_date_input').forEach((inp) => {
        inp.addEventListener('change', () => {
            rel.dates[inp.dataset.dateKey] = inp.value.trim();
            saveSettings();
        });
    });

    pane.querySelector('#bm2_add_mem_btn').addEventListener('click', () => {
        const dEl = document.getElementById('bm2_new_mem_date');
        const tEl = document.getElementById('bm2_new_mem_text');
        const text = tEl.value.trim();
        if (!text) return;
        rel.memories.push({
            id: Date.now(),
            date: dEl.value.trim() || new Date().toLocaleDateString('ru-RU'),
            text,
        });
        saveSettings();
        renderRelationshipsPane();
    });

    pane.querySelectorAll('.bm2_del_mem_btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            const id = Number(btn.dataset.id);
            rel.memories = rel.memories.filter((m) => m.id !== id);
            saveSettings();
            renderRelationshipsPane();
        });
    });

    pane.querySelector('#bm2_analyze_now_btn').addEventListener('click', async () => {
        if (window.toastr) window.toastr.info('Анализирую последнюю сцену по всем связям...', '🌙 BlueMoon');
        await analyzeAllRelationshipsDelta();
    });
}

function syncCanvasResolution() {
    const canvas = document.getElementById('bm2_graph_canvas');
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width < 20 || rect.height < 20) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const targetW = Math.round(rect.width * dpr);
    const targetH = Math.round(rect.height * dpr);

    graphState.logicalWidth = rect.width;
    graphState.logicalHeight = rect.height;

    if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
    }
}

function initGraphCanvasInteractions() {
    const canvas = document.getElementById('bm2_graph_canvas');
    if (!canvas) return;

    if (window.ResizeObserver) {
        const ro = new ResizeObserver(() => {
            syncCanvasResolution();
            drawRelationshipGraph();
        });
        ro.observe(canvas);
    }

    const getCanvasPos = (clientX, clientY) => {
        const rect = canvas.getBoundingClientRect();
        const rawX = clientX - rect.left;
        const rawY = clientY - rect.top;
        return {
            x: (rawX - graphState.panX) / graphState.zoom,
            y: (rawY - graphState.panY) / graphState.zoom,
            rawX,
            rawY,
        };
    };

    const findNodeAt = (x, y) => {
        const prof = getActiveCharProfile();
        for (let i = prof.nodes.length - 1; i >= 0; i--) {
            const n = prof.nodes[i];
            const dx = x - (n.x || 180);
            const dy = y - (n.y || 180);
            if (Math.hypot(dx, dy) <= 32) return n;
        }
        return null;
    };

    const onPointerDown = (clientX, clientY) => {
        syncCanvasResolution();
        const pos = getCanvasPos(clientX, clientY);
        const hitNode = findNodeAt(pos.x, pos.y);
        if (hitNode) {
            graphState.draggingNodeId = hitNode.id;
            const prof = getActiveCharProfile();
            const linkedRel = prof.relationships.find((r) => r.fromId === hitNode.id || r.toId === hitNode.id);
            if (linkedRel) {
                prof.activeRelId = linkedRel.id;
                renderRelationshipsPane();
            }
        } else {
            graphState.isPanning = true;
        }
        graphState.lastPointerX = pos.rawX;
        graphState.lastPointerY = pos.rawY;
        drawRelationshipGraph();
    };

    const onPointerMove = (clientX, clientY) => {
        if (!graphState.draggingNodeId && !graphState.isPanning) return;
        const pos = getCanvasPos(clientX, clientY);
        if (graphState.draggingNodeId) {
            const prof = getActiveCharProfile();
            const node = prof.nodes.find((n) => n.id === graphState.draggingNodeId);
            if (node) {
                node.x = Math.round(pos.x);
                node.y = Math.round(pos.y);
                drawRelationshipGraph();
            }
        } else if (graphState.isPanning) {
            graphState.panX += pos.rawX - graphState.lastPointerX;
            graphState.panY += pos.rawY - graphState.lastPointerY;
            graphState.lastPointerX = pos.rawX;
            graphState.lastPointerY = pos.rawY;
            drawRelationshipGraph();
        }
    };

    const onPointerUp = () => {
        if (graphState.draggingNodeId) {
            saveSettings();
        }
        graphState.draggingNodeId = null;
        graphState.isPanning = false;
    };

    canvas.addEventListener('mousedown', (e) => onPointerDown(e.clientX, e.clientY));
    window.addEventListener('mousemove', (e) => onPointerMove(e.clientX, e.clientY));
    window.addEventListener('mouseup', onPointerUp);

    canvas.addEventListener(
        'touchstart',
        (e) => {
            if (e.touches.length === 1) {
                e.preventDefault();
                onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
            }
        },
        { passive: false }
    );
    canvas.addEventListener(
        'touchmove',
        (e) => {
            if (e.touches.length === 1) {
                e.preventDefault();
                onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
            }
        },
        { passive: false }
    );
    canvas.addEventListener('touchend', onPointerUp);

    document.getElementById('bm2_zoom_in_btn')?.addEventListener('click', () => {
        graphState.zoom = Math.min(2.2, graphState.zoom + 0.18);
        drawRelationshipGraph();
    });
    document.getElementById('bm2_zoom_out_btn')?.addEventListener('click', () => {
        graphState.zoom = Math.max(0.4, graphState.zoom - 0.18);
        drawRelationshipGraph();
    });
    document.getElementById('bm2_zoom_reset_btn')?.addEventListener('click', () => {
        graphState.zoom = 1;
        graphState.panX = 0;
        graphState.panY = 0;
        drawRelationshipGraph();
    });
    document.getElementById('bm2_arrange_graph_btn')?.addEventListener('click', autoArrangeNodesInCircle);
    document.getElementById('bm2_ai_build_graph_btn')?.addEventListener('click', autoBuildGraphWithAI);
}

function drawRelationshipGraph() {
    const canvas = document.getElementById('bm2_graph_canvas');
    if (!canvas) return;
    syncCanvasResolution();

    const ctx = canvas.getContext('2d');
    const prof = getActiveCharProfile();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = graphState.logicalWidth || 350;
    const h = graphState.logicalHeight || 430;

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    ctx.translate(graphState.panX, graphState.panY);
    ctx.scale(graphState.zoom, graphState.zoom);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.045)';
    ctx.lineWidth = 1;
    for (let gx = -600; gx < 1400; gx += 44) {
        ctx.beginPath();
        ctx.moveTo(gx, -600);
        ctx.lineTo(gx, 1400);
        ctx.stroke();
    }
    for (let gy = -600; gy < 1400; gy += 44) {
        ctx.beginPath();
        ctx.moveTo(-600, gy);
        ctx.lineTo(1400, gy);
        ctx.stroke();
    }

    prof.relationships.forEach((rel, edgeIdx) => {
        const n1 = prof.nodes.find((n) => n.id === rel.fromId);
        const n2 = prof.nodes.find((n) => n.id === rel.toId);
        if (!n1 || !n2) return;

        const x1 = n1.x || 130;
        const y1 = n1.y || 180;
        const x2 = n2.x || 250;
        const y2 = n2.y || 180;

        const roleMeta = getRoleMeta(rel.role);
        const isSelected = rel.id === prof.activeRelId;

        let isDirected = Boolean(roleMeta.directed);
        let isDashed = Boolean(roleMeta.dashed);
        let shortBadge = roleMeta.shortLabel || roleMeta.label;

        if (rel.role === 'crush') {
            const mut = CRUSH_MUTUALITY[rel.mutualStatus] || CRUSH_MUTUALITY.secret_one_sided;
            isDirected = mut.directed;
            isDashed = mut.dashed;
            shortBadge = mut.shortLabel || '💘 Симпатия';
        }

        ctx.save();
        ctx.beginPath();
        if (isDashed) {
            ctx.setLineDash([6, 5]);
        }
        ctx.strokeStyle = roleMeta.color || '#7aa2f7';
        ctx.lineWidth = isSelected ? 3.2 : 2.0;
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.setLineDash([]);

        if (isDirected) {
            const angle = Math.atan2(y2 - y1, x2 - x1);
            const targetDist = 30;
            const ax = x2 - Math.cos(angle) * targetDist;
            const ay = y2 - Math.sin(angle) * targetDist;
            ctx.fillStyle = roleMeta.color;
            ctx.beginPath();
            ctx.moveTo(ax, ay);
            ctx.lineTo(ax - 10 * Math.cos(angle - Math.PI / 6), ay - 10 * Math.sin(angle - Math.PI / 6));
            ctx.lineTo(ax - 10 * Math.cos(angle + Math.PI / 6), ay - 10 * Math.sin(angle + Math.PI / 6));
            ctx.closePath();
            ctx.fill();
        }

        const t = edgeIdx % 3 === 0 ? 0.5 : edgeIdx % 3 === 1 ? 0.41 : 0.59;
        const mx = x1 + (x2 - x1) * t;
        const my = y1 + (y2 - y1) * t;

        const satSign = rel.satisfaction > 0 ? `+${rel.satisfaction}%` : `${rel.satisfaction}%`;
        const labelText = `${shortBadge} (${satSign})`;
        ctx.font = '600 9.5px Inter, sans-serif';
        const textWidth = ctx.measureText(labelText).width;

        ctx.fillStyle = 'rgba(10, 13, 24, 0.92)';
        ctx.strokeStyle = roleMeta.color;
        ctx.lineWidth = isSelected ? 1.5 : 1;
        ctx.beginPath();
        ctx.roundRect(mx - textWidth / 2 - 5, my - 8.5, textWidth + 10, 17, 5);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#eef1ff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(labelText, mx, my);
        ctx.restore();
    });

    for (const node of prof.nodes) {
        const x = node.x || 180;
        const y = node.y || 180;
        const radius = 26;

        const borderColor =
            node.type === 'bot' ? '#7aa2f7' : node.type === 'persona' ? '#ff7eb6' : '#9ece6a';

        ctx.save();
        ctx.shadowColor = borderColor;
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = '#151a30';
        ctx.fill();
        ctx.lineWidth = 2.8;
        ctx.strokeStyle = borderColor;
        ctx.stroke();
        ctx.restore();

        let hasValidPhoto = false;
        if (node.avatar) {
            let img = avatarImageCache.get(node.avatar);
            if (!img) {
                img = new Image();
                img.crossOrigin = 'anonymous';
                img.src = node.avatar;
                img.onload = () => drawRelationshipGraph();
                avatarImageCache.set(node.avatar, img);
            }
            if (img.complete && img.naturalWidth > 0) {
                hasValidPhoto = true;
                ctx.save();
                ctx.beginPath();
                ctx.arc(x, y, radius - 1.5, 0, Math.PI * 2);
                ctx.clip();
                ctx.drawImage(img, x - radius, y - radius, radius * 2, radius * 2);
                ctx.restore();
            }
        }

        if (hasValidPhoto) {
            const nameLabel = node.name.length > 16 ? node.name.slice(0, 14) + '…' : node.name;
            ctx.font = '600 10.5px Inter, sans-serif';
            const nw = ctx.measureText(nameLabel).width;
            ctx.fillStyle = 'rgba(9, 12, 22, 0.9)';
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(x - nw / 2 - 5, y + radius + 4, nw + 10, 16, 5);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#eef1ff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(nameLabel, x, y + radius + 12);
        } else {
            ctx.fillStyle = '#eef1ff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const cleanName = (node.name || '?').trim();
            if (cleanName.length <= 8) {
                ctx.font = '700 10.5px Inter, sans-serif';
                ctx.fillText(cleanName, x, y);
            } else {
                const words = cleanName.split(/\s+/);
                ctx.font = '700 9.5px Inter, sans-serif';
                if (words.length >= 2) {
                    ctx.fillText(words[0].slice(0, 8), x, y - 5);
                    ctx.fillText(words[1].slice(0, 8), x, y + 6);
                } else {
                    ctx.fillText(cleanName.slice(0, 7) + '…', x, y);
                }
            }
        }
    }

    ctx.restore();
}

/**
 * Render Pane 3: Multi-Genre Tags, Author Style, Built-in & Custom Sliders
 */
function renderStylePane() {
    const pane = document.getElementById('bm2_pane_style');
    if (!pane) return;

    const s = getSettings();
    const st = s.activeStyle;

    const genreSelectOpts = GENRE_OPTIONS.map((g) => `<option value="${escapeAttr(g)}">${escapeHtml(g)}</option>`).join('');

    const activeGenreChipsHtml = (st.genres || [])
        .map(
            (g, idx) => `
            <span class="bm2_genre_chip">
                ${escapeHtml(g)}
                <button type="button" class="bm2_remove_genre_btn" data-idx="${idx}" title="Убрать жанр">✕</button>
            </span>`
        )
        .join('');

    const presetOpts = Object.keys(s.stylePresets)
        .map((name) => `<option value="${escapeAttr(name)}">${escapeHtml(name)}</option>`)
        .join('');

    const builtinSlidersHtml = BUILTIN_STYLE_SLIDERS.map((sl) => {
        const val = Number(st.sliders?.[sl.id] ?? sl.defaultVal);
        return `
        <div class="bm2_slider_row">
            <div class="bm2_slider_head">
                <span>${escapeHtml(sl.label)}</span>
                <span class="bm2_slider_val" id="bm2_sl_val_${sl.id}">${val}%</span>
            </div>
            <input type="range" class="bm2_range bm2_style_slider" data-slider-id="${sl.id}" min="0" max="100" step="5" value="${val}" />
            <span class="bm2_slider_hint">${escapeHtml(sl.hint)}</span>
        </div>`;
    }).join('');

    const customSlidersHtml = (st.customSliders || [])
        .map(
            (csl, idx) => `
        <div class="bm2_slider_row" style="border-color: var(--bm2-accent-2);">
            <div class="bm2_slider_head">
                <span>✨ ${escapeHtml(csl.name)}</span>
                <div style="display:flex;align-items:center;gap:8px;">
                    <span class="bm2_slider_val" id="bm2_csl_val_${idx}">${Number(csl.value ?? 50)}%</span>
                    <button type="button" class="bm2_icon_sm_btn bm2_del_custom_slider_btn" data-idx="${idx}" title="Удалить ползунок">🗑️</button>
                </div>
            </div>
            <input type="range" class="bm2_range bm2_custom_slider_input" data-idx="${idx}" min="0" max="100" step="5" value="${Number(csl.value ?? 50)}" />
            <span class="bm2_slider_hint">Инструкция ИИ: ${escapeHtml(csl.prompt)}</span>
        </div>`
        )
        .join('');

    pane.innerHTML = `
        <div class="bm2_card">
            <h4 class="bm2_card_title">📚 Мульти-жанры и Авторский почерк</h4>

            <div>
                <label class="bm2_label">Активные жанры (можно комбинировать несколько):</label>
                <div class="bm2_genre_tags_wrap">
                    ${activeGenreChipsHtml || '<span class="bm2_slider_hint">Жанры не выбраны</span>'}
                </div>
            </div>

            <div class="bm2_grid_2" style="margin-top:4px;">
                <div style="display:flex;gap:6px;">
                    <select id="bm2_genre_picker" class="bm2_select">${genreSelectOpts}</select>
                    <button type="button" class="bm2_btn bm2_btn_primary" id="bm2_add_picked_genre_btn" style="flex:0 0 auto;">+ Жанр</button>
                </div>
                <div style="display:flex;gap:6px;">
                    <input type="text" id="bm2_custom_genre_inp" class="bm2_input" placeholder="Или введите свой жанр..." />
                    <button type="button" class="bm2_btn" id="bm2_add_custom_genre_btn" style="flex:0 0 auto;">＋</button>
                </div>
            </div>

            <div>
                <label class="bm2_label">Стиль автора / Нарративная инструкция (обязательный фильтр прозы):</label>
                <textarea id="bm2_author_input" class="bm2_textarea"
                    placeholder="Напр.: Пиши в стиле Достоевского / Ремарка: глубокий психологизм, живые диалоги без клише...">${escapeHtml(st.authorStyle || '')}</textarea>
            </div>
        </div>

        <div class="bm2_card">
            <h4 class="bm2_card_title">🎚️ Ползунки управления повествованием (Строгая сила 0–100%)</h4>
            ${builtinSlidersHtml}
            ${customSlidersHtml}
        </div>

        <div class="bm2_card">
            <h4 class="bm2_card_title">➕ Создать свою плашку ползунка</h4>
            <div class="bm2_grid_2">
                <input type="text" id="bm2_new_csl_name" class="bm2_input" placeholder="Название (напр. Юмор и сарказм)" />
                <input type="text" id="bm2_new_csl_prompt" class="bm2_input" placeholder="Правило для ИИ (напр. Количество иронии в диалогах)" />
            </div>
            <button type="button" class="bm2_btn bm2_btn_primary" id="bm2_add_csl_btn">+ Добавить свой ползунок</button>
        </div>

        <div class="bm2_card">
            <h4 class="bm2_card_title">💾 Пресеты стиля</h4>
            <div class="bm2_grid_2">
                <select id="bm2_preset_select" class="bm2_select">
                    <option value="">-- Выберите сохранённый пресет --</option>
                    ${presetOpts}
                </select>
                <input type="text" id="bm2_preset_name_inp" class="bm2_input" placeholder="Имя нового пресета..." />
            </div>
            <div class="bm2_btn_row">
                <button type="button" class="bm2_btn bm2_btn_primary" id="bm2_save_preset_btn">Сохранить пресет</button>
                <button type="button" class="bm2_btn bm2_btn_danger" id="bm2_del_preset_btn">Удалить пресет</button>
            </div>
        </div>
    `;

    pane.querySelector('#bm2_add_picked_genre_btn').addEventListener('click', () => {
        const val = document.getElementById('bm2_genre_picker').value;
        if (val && !st.genres.includes(val)) {
            st.genres.push(val);
            saveSettings();
            renderStylePane();
        }
    });

    pane.querySelector('#bm2_add_custom_genre_btn').addEventListener('click', () => {
        const inp = document.getElementById('bm2_custom_genre_inp');
        const val = inp.value.trim();
        if (val && !st.genres.includes(val)) {
            st.genres.push(val);
            inp.value = '';
            saveSettings();
            renderStylePane();
        }
    });

    pane.querySelectorAll('.bm2_remove_genre_btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            const idx = Number(btn.dataset.idx);
            st.genres.splice(idx, 1);
            saveSettings();
            renderStylePane();
        });
    });

    pane.querySelector('#bm2_author_input').addEventListener('change', (e) => {
        st.authorStyle = e.target.value;
        saveSettings();
    });

    pane.querySelectorAll('.bm2_style_slider').forEach((rng) => {
        rng.addEventListener('input', () => {
            const id = rng.dataset.sliderId;
            const val = Number(rng.value);
            st.sliders[id] = val;
            const lbl = document.getElementById(`bm2_sl_val_${id}`);
            if (lbl) lbl.textContent = `${val}%`;
            saveSettings();
        });
    });

    pane.querySelectorAll('.bm2_custom_slider_input').forEach((rng) => {
        rng.addEventListener('input', () => {
            const idx = Number(rng.dataset.idx);
            const val = Number(rng.value);
            if (st.customSliders[idx]) {
                st.customSliders[idx].value = val;
                const lbl = document.getElementById(`bm2_csl_val_${idx}`);
                if (lbl) lbl.textContent = `${val}%`;
                saveSettings();
            }
        });
    });

    pane.querySelectorAll('.bm2_del_custom_slider_btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            const idx = Number(btn.dataset.idx);
            st.customSliders.splice(idx, 1);
            saveSettings();
            renderStylePane();
        });
    });

    pane.querySelector('#bm2_add_csl_btn').addEventListener('click', () => {
        const nameEl = document.getElementById('bm2_new_csl_name');
        const promptEl = document.getElementById('bm2_new_csl_prompt');
        const name = nameEl.value.trim();
        const promptText = promptEl.value.trim() || name;
        if (!name) return;
        st.customSliders.push({
            id: 'csl_' + Date.now(),
            name,
            prompt: promptText,
            value: 60,
        });
        saveSettings();
        renderStylePane();
    });

    pane.querySelector('#bm2_preset_select').addEventListener('change', (e) => {
        const name = e.target.value;
        if (!name || !s.stylePresets[name]) return;
        s.activeStyle = structuredClone(s.stylePresets[name]);
        if (!Array.isArray(s.activeStyle.genres)) s.activeStyle.genres = [];
        if (!Array.isArray(s.activeStyle.customSliders)) s.activeStyle.customSliders = [];
        saveSettings();
        renderStylePane();
    });

    pane.querySelector('#bm2_save_preset_btn').addEventListener('click', () => {
        const inp = document.getElementById('bm2_preset_name_inp');
        const name = inp.value.trim() || document.getElementById('bm2_preset_select').value;
        if (!name) return;
        s.stylePresets[name] = structuredClone(s.activeStyle);
        saveSettings();
        renderStylePane();
        if (window.toastr) window.toastr.success(`Пресет «${name}» сохранён`, 'BlueMoon');
    });

    pane.querySelector('#bm2_del_preset_btn').addEventListener('click', () => {
        const sel = document.getElementById('bm2_preset_select').value;
        if (!sel || !s.stylePresets[sel]) return;
        delete s.stylePresets[sel];
        saveSettings();
        renderStylePane();
    });
}

/**
 * Render Pane 4: Interactive Gallery of 16 Themes + Customizer & Live Prompt Preview
 */
function renderThemePane() {
    const pane = document.getElementById('bm2_pane_theme');
    if (!pane) return;

    const s = getSettings();
    const ct = s.customTheme || BUILTIN_THEMES.moonlight;

    const galleryCardsHtml = Object.entries(BUILTIN_THEMES)
        .map(([key, t]) => {
            const isActive = s.activeTheme === key;
            return `
            <div class="bm2_theme_card ${isActive ? 'bm2_theme_active' : ''}"
                 data-theme-key="${key}"
                 style="background: linear-gradient(145deg, ${t.bgCard}, ${t.bgMain}); color: ${t.textMain};">
                <div class="bm2_theme_card_top">
                    <span class="bm2_theme_card_title" style="color:${t.accent};">${escapeHtml(t.name)}</span>
                    ${isActive ? '<span>✓</span>' : ''}
                </div>
                <span class="bm2_theme_card_desc" style="color:${t.textMuted};">${escapeHtml(t.desc || '')}</span>
                <div class="bm2_theme_swatches">
                    <i class="bm2_swatch_dot" style="background:${t.bgMain}" title="Фон"></i>
                    <i class="bm2_swatch_dot" style="background:${t.bgCard}" title="Карточки"></i>
                    <i class="bm2_swatch_dot" style="background:${t.accent}" title="Акцент 1"></i>
                    <i class="bm2_swatch_dot" style="background:${t.accent2}" title="Акцент 2"></i>
                </div>
            </div>`;
        })
        .join('');

    const combinedPrompt = [buildRelationshipPromptText(), buildStylePromptText()].filter(Boolean).join('\n\n');

    pane.innerHTML = `
        <div class="bm2_card">
            <h4 class="bm2_card_title">🎨 Галерея тем оформления (16 стилей)</h4>
            <p class="bm2_settings_hint" style="margin:0;">Нажмите на любую карточку, чтобы мгновенно переключить атмосферу окна и древа связей:</p>
            <div class="bm2_theme_gallery">
                ${galleryCardsHtml}
            </div>
        </div>

        <div class="bm2_card">
            <h4 class="bm2_card_title">🖌️ Ручная настройка цветов (Своя тема)</h4>
            <div class="bm2_grid_2">
                <div>
                    <label class="bm2_label">Фон окна</label>
                    <input type="color" id="bm2_col_bg" class="bm2_input" value="${ct.bgMain}" />
                </div>
                <div>
                    <label class="bm2_label">Фон карточек</label>
                    <input type="color" id="bm2_col_card" class="bm2_input" value="${ct.bgCard}" />
                </div>
                <div>
                    <label class="bm2_label">Основной акцент (Свечение)</label>
                    <input type="color" id="bm2_col_acc" class="bm2_input" value="${ct.accent}" />
                </div>
                <div>
                    <label class="bm2_label">Второй акцент (Градиент)</label>
                    <input type="color" id="bm2_col_acc2" class="bm2_input" value="${ct.accent2 || ct.accent}" />
                </div>
            </div>
        </div>

        <div class="bm2_card">
            <h4 class="bm2_card_title">👁️ Живой просмотр системного промпта для ИИ</h4>
            <p class="bm2_settings_hint" style="margin:0;">
                Этот блок автоматически вшивается в контекст нейросети перед каждым ответом (на глубине Depth = ${s.injectionDepth}):
            </p>
            <div class="bm2_prompt_preview" id="bm2_live_prompt_box">${escapeHtml(combinedPrompt || '(Инъекция отключена)')}</div>
        </div>
    `;

    pane.querySelectorAll('.bm2_theme_card').forEach((card) => {
        card.addEventListener('click', () => {
            const key = card.dataset.themeKey;
            if (!BUILTIN_THEMES[key]) return;
            s.activeTheme = key;
            s.customTheme = { ...BUILTIN_THEMES[key] };
            saveSettings();
            applyThemeVariables();
            renderThemePane();
        });
    });

    const bindColor = (id, key) => {
        const el = pane.querySelector(id);
        if (!el) return;
        el.addEventListener('input', (e) => {
            s.activeTheme = 'custom';
            s.customTheme[key] = e.target.value;
            saveSettings();
            applyThemeVariables();
        });
    };
    bindColor('#bm2_col_bg', 'bgMain');
    bindColor('#bm2_col_card', 'bgCard');
    bindColor('#bm2_col_acc', 'accent');
    bindColor('#bm2_col_acc2', 'accent2');
}

async function initExtensionSettingsPanel() {
    const container = document.getElementById('extensions_settings2') || document.getElementById('extensions_settings');
    if (!container) return;

    try {
        const res = await fetch(`${EXTENSION_FOLDER}/settings.html`);
        if (res.ok) {
            const html = await res.text();
            container.insertAdjacentHTML('beforeend', html);
        }
    } catch (err) {
        console.error(`[${MODULE_NAME}] Failed to load settings.html:`, err);
    }

    const s = getSettings();
    const bindCheck = (id, key) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.checked = Boolean(s[key]);
        el.addEventListener('change', () => {
            s[key] = el.checked;
            saveSettings();
        });
    };

    bindCheck('bm2_master_enabled', 'masterEnabled');
    bindCheck('bm2_rel_enabled', 'relEnabled');
    bindCheck('bm2_rel_auto_analyze', 'relAutoAnalyze');
    bindCheck('bm2_isolate_per_chat', 'isolatePerChat');
    bindCheck('bm2_style_enabled', 'styleEnabled');

    const depthEl = document.getElementById('bm2_injection_depth');
    if (depthEl) {
        depthEl.value = s.injectionDepth;
        depthEl.addEventListener('change', () => {
            s.injectionDepth = Math.max(0, Math.min(10, Number(depthEl.value) || 1));
            saveSettings();
        });
    }

    const profSelect = document.getElementById('bm2_connection_profile');
    if (profSelect) {
        populateConnectionProfiles(profSelect, s.connectionProfileId);
        profSelect.addEventListener('change', () => {
            s.connectionProfileId = profSelect.value;
            saveSettings();
        });
    }

    const openBtn = document.getElementById('bm2_open_hub_btn');
    if (openBtn) {
        openBtn.addEventListener('click', openModal);
    }
}

function populateConnectionProfiles(selectEl, selectedId) {
    const ctx = SillyTavern.getContext();
    const profiles = ctx.extensionSettings?.connectionManager?.profiles || [];
    selectEl.innerHTML = `<option value="">Текущий активный API чата</option>`;
    for (const p of profiles) {
        if (!p.id) continue;
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = p.name || p.id;
        if (p.id === selectedId) opt.selected = true;
        selectEl.appendChild(opt);
    }
}

function escapeHtml(str) {
    return String(str ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function escapeAttr(str) {
    return escapeHtml(str).replace(/'/g, '&#39;');
}

function init() {
    getSettings();
    applyThemeVariables();
    buildModalUI();
    initExtensionSettingsPanel();
    updatePromptInjections();

    const ctx = SillyTavern.getContext();
    const { eventSource, event_types } = ctx;

    if (eventSource && event_types) {
        eventSource.on(event_types.CHAT_CHANGED, () => {
            activeCharFilterId = 'all';
            updatePromptInjections();
            if (document.getElementById('bm2_overlay')?.classList.contains('bm2_open')) {
                renderAllPanes();
                drawRelationshipGraph();
            }
        });

        eventSource.on(event_types.MESSAGE_RECEIVED, () => {
            setTimeout(() => analyzeAllRelationshipsDelta(), 700);
        });

        if (event_types.GENERATION_STARTED) {
            eventSource.on(event_types.GENERATION_STARTED, () => {
                updatePromptInjections();
            });
        }
    }

    if (ctx.SlashCommandParser && ctx.SlashCommand) {
        try {
            ctx.SlashCommandParser.addCommandObject(
                ctx.SlashCommand.fromProps({
                    name: 'bluemoon',
                    callback: () => {
                        openModal();
                        return '';
                    },
                    helpString: 'Открыть панель BlueMoon: Связи, Древо и Стиль',
                })
            );
        } catch (err) {
            console.warn(`[${MODULE_NAME}] Slash command registration skipped:`, err);
        }
    }

    console.log(`[${MODULE_NAME}] BlueMoon v2.5.0 loaded.`);
}

jQuery(() => {
    const ctx = SillyTavern.getContext();
    if (ctx?.eventSource && ctx?.event_types?.APP_READY) {
        ctx.eventSource.on(ctx.event_types.APP_READY, init);
    } else {
        setTimeout(init, 1000);
    }
});
