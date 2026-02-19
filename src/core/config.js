/**
 * BlueMoon - Core Configuration
 */

export const extensionConfig = {
    name: 'bluemoon',
    version: '1.0.0',
    displayName: 'BlueMoon - Character Traits & Relationships',
    author: 'freir1337',
};

export const defaultTraitGroups = [
    {
        id: 'world-settings',
        label: 'Настройки мира и стилей',
        icon: '🌍',
        enabled: true,
        traits: [
            {
                id: 'narrative-style',
                label: 'Повествование в стиле писателя',
                icon: '📖',
                type: 'author-based',
                settings: { author: 'Ли Чайлд', style: 'thriller' },
                promptTemplate: 'Пиши нарративные отрывки в стиле {{author}} (жанр: {{style}}). Применяй этот стиль с интенсивностью {{percentage}}% в описаниях.',
                defaultPromptTemplate: 'Пиши нарративные отрывки в стиле {{author}} (жанр: {{style}}). Применяй этот стиль с интенсивностью {{percentage}}% в описаниях.',
                min: 0, max: 100, default: 40,
            },
            {
                id: 'plot-development',
                label: 'Развитие сюжета в стиле писателя',
                icon: '📚',
                type: 'author-based',
                settings: { author: 'Роберт Ладлэм', style: 'espionage-thriller' },
                promptTemplate: 'Развивай сюжетные точки в стиле {{author}}, поддерживая атмосферу {{style}}. Используй {{percentage}}% характерных техник построения сюжета.',
                defaultPromptTemplate: 'Развивай сюжетные точки в стиле {{author}}, поддерживая атмосферу {{style}}. Используй {{percentage}}% характерных техник построения сюжета.',
                min: 0, max: 100, default: 60,
            },
            {
                id: 'dialogue-style',
                label: 'Написание диалогов в стиле писателя',
                icon: '💬',
                type: 'author-based',
                settings: { author: 'Элмор Леонард', style: 'minimalist' },
                promptTemplate: 'Пиши диалоги в стиле {{author}} с {{percentage}}% соответствием их {{style}} подходу. Разговоры должны быть естественными.',
                defaultPromptTemplate: 'Пиши диалоги в стиле {{author}} с {{percentage}}% соответствием их {{style}} подходу. Разговоры должны быть естественными.',
                min: 0, max: 100, default: 25,
            },
            {
                id: 'action-realism',
                label: 'Реалистичность действий и последствий',
                icon: '⚔️',
                type: 'intensity',
                promptTemplate: 'Поддерживай {{percentage}}% реализм в действиях персонажей и их последствиях. Показывай реалистичные физические и эмоциональные воздействия.',
                defaultPromptTemplate: 'Поддерживай {{percentage}}% реализм в действиях персонажей и их последствиях.',
                min: 0, max: 100, default: 70,
            },
            {
                id: 'tension-suspense',
                label: 'Напряжение и саспенс в сценах',
                icon: '😰',
                type: 'intensity',
                promptTemplate: 'Создавай {{percentage}}% напряжение и саспенс в сценах. Темп и атмосфера должны удерживать читателя.',
                defaultPromptTemplate: 'Создавай {{percentage}}% напряжение и саспенс в сценах.',
                min: 0, max: 100, default: 56,
            },
            {
                id: 'gore-level',
                label: 'Натуралистичность жестокости (Gore)',
                icon: '🔴',
                type: 'intensity',
                promptTemplate: 'Изображай насилие и жестокость с {{percentage}}% натурализмом. Описывай физические воздействия с соответствующим уровнем детализации.',
                defaultPromptTemplate: 'Изображай насилие и жестокость с {{percentage}}% натурализмом.',
                min: 0, max: 100, default: 30,
            },
            {
                id: 'event-pacing',
                label: 'Темп развития событий',
                icon: '⏱️',
                type: 'intensity',
                promptTemplate: 'Установи темп событий на {{percentage}}%. При 0% — созерцательно и медленно, при 100% — стремительно и насыщенно действием.',
                defaultPromptTemplate: 'Установи темп событий на {{percentage}}%.',
                min: 0, max: 100, default: 18,
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
                promptTemplate: 'Включай подробные описания физических ощущений (прикосновение, температура, текстура, боль, удовольствие, вкус, запах). Используй {{percentage}}% глубины.',
                defaultPromptTemplate: 'Включай подробные описания физических ощущений с {{percentage}}% глубиной.',
                min: 0, max: 100, default: 76,
            },
            {
                id: 'word-banlist',
                label: 'Запрещённые слова в тексте',
                icon: '🚫',
                type: 'banlist',
                settings: { banlist: ['озон'], strength: 80 },
                promptTemplate: 'Избегай использования следующих слов: {{banlist}}. Соблюдай это ограничение со строгостью {{strength}}%.',
                defaultPromptTemplate: 'Избегай использования следующих слов: {{banlist}}.',
                min: 0, max: 100, default: 0,
                description: '0% = мягкое пожелание, 100% = строгий запрет',
            },
            {
                id: 'profanity-level',
                label: 'Мат в диалогах',
                icon: '🗣️',
                type: 'intensity',
                promptTemplate: 'Включай ненормативную лексику в диалогах с частотой {{percentage}}%. (0% = никогда, 100% = очень часто)',
                defaultPromptTemplate: 'Включай мат в диалогах с частотой {{percentage}}%.',
                min: 0, max: 100, default: 43,
            },
        ],
    },
];

export const relationshipTypes = [
    { id: 'enemies', label: 'Враги', emoji: '⚔️', color: '#e74c3c', modifiers: { negative: -10, positive: -5 } },
    { id: 'friends', label: 'Друзья', emoji: '👫', color: '#2ecc71', modifiers: { negative: -3, positive: 8 } },
    { id: 'stranger', label: 'Незнакомец', emoji: '🚶', color: '#95a5a6', modifiers: { negative: 2, positive: 2 } },
    { id: 'ally', label: 'Союзник', emoji: '🤝', color: '#3498db', modifiers: { negative: -2, positive: 5 } },
    { id: 'rival', label: 'Конкурент', emoji: '🏆', color: '#f39c12', modifiers: { negative: 3, positive: 3 } },
    { id: 'love-interest', label: 'Любовь', emoji: '💕', color: '#e91e63', modifiers: { negative: -5, positive: 10 } },
    { id: 'mentor', label: 'Наставник', emoji: '👨‍🏫', color: '#9b59b6', modifiers: { negative: -4, positive: 6 } },
    { id: 'student', label: 'Ученик', emoji: '👨‍🎓', color: '#16a085', modifiers: { negative: -2, positive: 5 } },
    { id: 'family', label: 'Родственник', emoji: '👨‍👩‍👧', color: '#c0392b', modifiers: { negative: -6, positive: 7 } },
    { id: 'neutral', label: 'Нейтрально', emoji: '😐', color: '#7f8c8d', modifiers: { negative: 1, positive: 1 } },
    { id: 'betrayed', label: 'Предательство', emoji: '💔', color: '#34495e', modifiers: { negative: -15, positive: 2 } },
    { id: 'secret-admirer', label: 'Тайный поклонник', emoji: '😳', color: '#d35400', modifiers: { negative: 0, positive: 3 } },
];

export const defaultSettings = {
    enabled: true,
    panelPosition: 'right',
    autoUpdateRelationships: true,
    relationshipUpdateStrength: 5,
    showPromptInChat: false,
};
