/**
 * BlueMoon - Floating Panel Manager
 * Handles the floating panel UI for both desktop and mobile
 */

import { extensionState, updateState } from '../core/state.js';
import { i18n } from '../core/i18n.js';

export async function initFloatingPanel() {
    console.log('[BlueMoon] Initializing floating panel...');

    // Detect viewport size
    const isDesktop = window.innerWidth > 1000;

    if (isDesktop) {
        initDesktopPanel();
    } else {
        initMobilePanel();
    }

    // Listen for resize to switch between mobile and desktop
    window.addEventListener('resize', () => {
        const newIsDesktop = window.innerWidth > 1000;
        if (newIsDesktop !== isDesktop) {
            location.reload(); // Simple approach - reload on viewport change
        }
    });

    console.log('[BlueMoon] Floating panel initialized');
}

/**
 * Initialize desktop panel (sidebar)
 */
function initDesktopPanel() {
    const panel = document.getElementById('bluemoon-panel');
    if (!panel) return;

    const position = extensionState.panelPosition || 'right';
    panel.classList.add(`bluemoon-position-${position}`);
    panel.style.display = 'block';

    // Setup toggle button
    const toggleBtn = document.getElementById('bluemoon-toggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            togglePanel();
        });
    }
}

/**
 * Initialize mobile panel (FAB + modal)
 */
function initMobilePanel() {
    // Hide sidebar panel
    const panel = document.getElementById('bluemoon-panel');
    if (panel) {
        panel.style.display = 'none';
    }

    // Show FAB button
    const fab = document.getElementById('bluemoon-fab');
    if (fab) {
        fab.style.display = 'flex';
        fab.addEventListener('click', () => {
            openMobileModal();
        });
    }

    // Close button in modal
    const closeBtn = document.getElementById('bluemoon-modal-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            closeMobileModal();
        });
    }
}

/**
 * Toggle panel visibility (desktop)
 */
function togglePanel() {
    const panel = document.getElementById('bluemoon-panel');
    if (panel) {
        const isCollapsed = panel.classList.toggle('bluemoon-collapsed');
        updateState('panelCollapsed', isCollapsed);
        localStorage.setItem('bluemoon_panel_collapsed', isCollapsed);
    }
}

/**
 * Open mobile modal
 */
function openMobileModal() {
    const modal = document.getElementById('bluemoon-modal');
    if (modal) {
        modal.classList.add('bluemoon-modal-open');
        document.body.style.overflow = 'hidden';
    }
}

/**
 * Close mobile modal
 */
function closeMobileModal() {
    const modal = document.getElementById('bluemoon-modal');
    if (modal) {
        modal.classList.remove('bluemoon-modal-open');
        document.body.style.overflow = 'auto';
    }
}

export { togglePanel, openMobileModal, closeMobileModal };