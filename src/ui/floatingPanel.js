/**
 * BlueMoon - Floating Panel Manager
 */

import { extensionState, updateState } from '../core/state.js';
import { saveSettings } from '../core/persistence.js';

export async function initFloatingPanel() {
    console.log('[BlueMoon] Initializing floating panel...');

    const isDesktop = window.innerWidth > 1000;

    if (isDesktop) {
        initDesktopPanel();
    } else {
        initMobilePanel();
    }

    // Handle resize
    let lastIsDesktop = isDesktop;
    window.addEventListener('resize', () => {
        const nowDesktop = window.innerWidth > 1000;
        if (nowDesktop !== lastIsDesktop) {
            lastIsDesktop = nowDesktop;
            if (nowDesktop) {
                initDesktopPanel();
                const fab = document.getElementById('bluemoon-fab');
                if (fab) fab.style.display = 'none';
            } else {
                initMobilePanel();
                const panel = document.getElementById('bluemoon-panel');
                if (panel) panel.style.display = 'none';
            }
        }
    });

    console.log('[BlueMoon] Floating panel initialized');
}

function initDesktopPanel() {
    const panel = document.getElementById('bluemoon-panel');
    const fab = document.getElementById('bluemoon-fab');

    if (fab) fab.style.display = 'none';
    if (!panel) return;

    panel.style.display = 'flex';

    // Apply collapsed state
    if (extensionState.panelCollapsed) {
        panel.classList.add('bluemoon-collapsed');
    }

    // Toggle button
    const toggleBtn = document.getElementById('bluemoon-toggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', togglePanel);
    }

    // Close button
    const closeBtn = document.getElementById('bluemoon-close-panel');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            panel.style.display = 'none';
        });
    }

    // Save button
    const saveBtn = document.getElementById('bluemoon-save-all');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            saveSettings();
            // Visual feedback
            saveBtn.value = '✓ Сохранено!';
            saveBtn.textContent = '✓ Сохранено!';
            setTimeout(() => {
                saveBtn.textContent = '💾 Сохранить';
            }, 1500);
        });
    }
}

function initMobilePanel() {
    const panel = document.getElementById('bluemoon-panel');
    if (panel) panel.style.display = 'none';

    const fab = document.getElementById('bluemoon-fab');
    if (fab) {
        fab.style.display = 'flex';
        // Remove old listener by cloning
        const newFab = fab.cloneNode(true);
        fab.parentNode.replaceChild(newFab, fab);
        newFab.addEventListener('click', openMobileModal);
    }

    const closeBtn = document.getElementById('bluemoon-modal-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeMobileModal);
    }

    const saveBtn = document.getElementById('bluemoon-save-mobile');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            saveSettings();
            closeMobileModal();
        });
    }

    // Close on overlay click
    const modal = document.getElementById('bluemoon-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeMobileModal();
        });
    }
}

export function togglePanel() {
    const panel = document.getElementById('bluemoon-panel');
    if (panel) {
        const isCollapsed = panel.classList.toggle('bluemoon-collapsed');
        updateState('panelCollapsed', isCollapsed);
        saveSettings();
    }
}

export function openMobileModal() {
    const modal = document.getElementById('bluemoon-modal');
    if (modal) {
        modal.classList.add('bluemoon-modal-open');
        document.body.style.overflow = 'hidden';
    }
}

export function closeMobileModal() {
    const modal = document.getElementById('bluemoon-modal');
    if (modal) {
        modal.classList.remove('bluemoon-modal-open');
        document.body.style.overflow = '';
    }
}
