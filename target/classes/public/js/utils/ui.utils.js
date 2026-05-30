/**
 * @file ui.utils.js
 * @description Reusable UI helpers: loading spinners, toast notifications,
 * button debounce/disable-on-click, and section navigation.
 */

// ─────────────────────────────────────────────
//  LOADING STATE
// ─────────────────────────────────────────────

/**
 * Show a skeleton loader inside a container.
 * @param {HTMLElement} container
 * @param {number} [count=3]
 */
export function showSkeleton(container, count = 3) {
    container.innerHTML = Array.from({ length: count })
        .map(
            () => `
        <div class="animate-pulse bg-surface-container-high rounded-lg p-5 flex flex-col gap-3">
            <div class="h-3 bg-outline-variant/40 rounded w-1/3"></div>
            <div class="h-5 bg-outline-variant/30 rounded w-2/3"></div>
            <div class="h-3 bg-outline-variant/20 rounded w-1/2"></div>
            <div class="h-9 bg-outline-variant/20 rounded mt-2"></div>
        </div>`
        )
        .join("");
}

/**
 * Show an inline spinner (replaces element content while loading).
 * @param {HTMLElement} el
 * @param {string} [message="Memuat..."]
 */
export function showSpinner(el, message = "Memuat...") {
    el.innerHTML = `
        <div class="flex flex-col items-center justify-center gap-3 py-12 text-on-surface-variant">
            <div class="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            <p class="font-mono text-xs uppercase tracking-widest">${message}</p>
        </div>`;
}

/**
 * Set a button into a loading/disabled state.
 * @param {HTMLButtonElement} btn
 * @param {string} [loadingText="Memproses..."]
 * @returns {() => void} Restore function — call this to re-enable
 */
export function setButtonLoading(btn, loadingText = "Memproses...") {
    const original = btn.innerHTML;
    const originalDisabled = btn.disabled;
    btn.disabled = true;
    btn.dataset.originalText = original;
    btn.innerHTML = `
        <span class="inline-flex items-center gap-2">
            <span class="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin inline-block"></span>
            <span>${loadingText}</span>
        </span>`;
    return () => {
        btn.innerHTML = original;
        btn.disabled = originalDisabled;
    };
}

// ─────────────────────────────────────────────
//  TOAST NOTIFICATIONS
// ─────────────────────────────────────────────

let _toastContainer = null;

function getToastContainer() {
    if (!_toastContainer) {
        _toastContainer = document.createElement("div");
        _toastContainer.id = "toast-container";
        _toastContainer.className =
            "fixed top-6 right-4 z-[200] flex flex-col gap-2 max-w-sm w-full pointer-events-none";
        document.body.appendChild(_toastContainer);
    }
    return _toastContainer;
}

/**
 * Show a toast notification.
 * @param {string} message
 * @param {"success"|"error"|"info"|"warning"} [type="info"]
 * @param {number} [duration=3500]
 */
export function showToast(message, type = "info", duration = 3500) {
    const container = getToastContainer();
    const colors = {
        success: "border-tertiary text-tertiary",
        error: "border-error text-error",
        warning: "border-yellow-400 text-yellow-400",
        info: "border-secondary text-secondary",
    };
    const icons = {
        success: "check_circle",
        error: "error",
        warning: "warning",
        info: "info",
    };

    const toast = document.createElement("div");
    toast.className = `pointer-events-auto bg-surface-container border ${colors[type]} 
        rounded-lg px-4 py-3 flex items-start gap-3 shadow-xl 
        transform transition-all duration-300 translate-x-full opacity-0 font-mono text-sm`;
    toast.innerHTML = `
        <span class="material-symbols-outlined text-sm mt-0.5 shrink-0">${icons[type]}</span>
        <span class="text-on-surface leading-relaxed">${message}</span>`;

    container.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            toast.classList.remove("translate-x-full", "opacity-0");
        });
    });

    // Auto dismiss
    setTimeout(() => {
        toast.classList.add("translate-x-full", "opacity-0");
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ─────────────────────────────────────────────
//  SECTION NAVIGATION
// ─────────────────────────────────────────────

/**
 * Show a single section and hide all others.
 * @param {string} sectionId
 */
export function showSection(sectionId) {
    document.querySelectorAll("[data-section]").forEach((el) => {
        el.classList.add("hidden");
    });
    const target = document.getElementById(sectionId);
    if (target) target.classList.remove("hidden");
}

// ─────────────────────────────────────────────
//  MODAL HELPERS
// ─────────────────────────────────────────────

/**
 * Open a modal overlay.
 * @param {string} modalId
 */
export function openModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) {
        el.classList.remove("hidden");
        el.classList.add("flex");
    }
}

/**
 * Close a modal overlay.
 * @param {string} modalId
 */
export function closeModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) {
        el.classList.add("hidden");
        el.classList.remove("flex");
    }
}

// ─────────────────────────────────────────────
//  DEBOUNCE
// ─────────────────────────────────────────────

/**
 * Debounce a function call.
 * @param {Function} fn
 * @param {number} [delay=300]
 * @returns {Function}
 */
export function debounce(fn, delay = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

// ─────────────────────────────────────────────
//  FILTER HELPER
// ─────────────────────────────────────────────

/**
 * Filter cards inside a container by h4 text content.
 * @param {string} containerSelector - CSS selector
 * @param {string} keyword
 */
export function filterCards(containerSelector, keyword) {
    const lc = keyword.toLowerCase();
    document.querySelectorAll(`${containerSelector} [data-card]`).forEach((card) => {
        const name = card.querySelector("[data-card-name]")?.textContent?.toLowerCase() || "";
        card.style.display = name.includes(lc) ? "" : "none";
    });
}

/**
 * Hide an inline spinner by clearing the element content.
 * @param {HTMLElement} el
 */
export function hideSpinner(el) {
    if (el) {
        // Karena showSpinner lo numpukin teks dan spinner di dalam elemen tersebut,
        // kita bersihin innerHTML-nya saat loading selesai.
        el.innerHTML = "";
    }
}
