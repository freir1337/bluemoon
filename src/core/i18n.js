/**
 * BlueMoon - Internationalization
 */

export class Internationalization {
    constructor() {
        this.currentLanguage = 'ru';
        this.translations = {};
    }

    async init() {
        const savedLanguage = localStorage.getItem('bluemoon_language') || 'ru';
        this.currentLanguage = savedLanguage;
        await this.loadTranslations(this.currentLanguage);
        this.applyTranslations(document.body);
    }

    async loadTranslations(lang) {
        try {
            // Use relative path from the extension root
            const url = `./locales/${lang}.json`;
            const response = await fetch(url);
            if (response.ok) {
                this.translations = await response.json();
            } else {
                console.warn(`[BlueMoon] Translation file not found: ${lang}`);
                if (lang !== 'en') {
                    await this.loadTranslations('en');
                }
            }
        } catch (error) {
            console.error('[BlueMoon] Failed to load translations:', error);
        }
    }

    applyTranslations(element = document.body) {
        element.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = this.getTranslation(key);
            if (translation) {
                el.textContent = translation;
            }
        });

        element.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            const translation = this.getTranslation(key);
            if (translation) {
                el.setAttribute('title', translation);
            }
        });
    }

    getTranslation(key) {
        return this.translations[key] || key;
    }

    setLanguage(lang) {
        this.currentLanguage = lang;
        localStorage.setItem('bluemoon_language', lang);
        this.loadTranslations(lang);
        this.applyTranslations(document.body);
    }
}

export const i18n = new Internationalization();