/* =========================================================
   LEBEGŐ KOMMENT PANEL — mezitlabaskert.hu
   GitHub: amezitlabaskert-lab/floating-comment-panel

   - Csak modál nyitva látható (jobb alul)
   - Gombra kattintva nyílik/csukódik a panel
   - Badge mutatja a kommentszámot
   - EchoThread widget egyszer töltődik be, bootstrap()-pal frissül
   - Skin-színeket követ (var(--szezon-szin), var(--szezon-hover))
   - Gomb stílusa a #backToTop mintájára (gyűrű, árnyék, bounce)

   Használat (scripts.txt):
     createFloatingCommentPanel()  → init()-ben egyszer
     updateFloatingCommentPanel()  → renderCachedPost()-ban és initReadingTimeForDirectView()-ban
     hideFloatingCommentPanel()    → closePostModal()-ban
   ========================================================= */

function createFloatingCommentPanel() {
    if (document.getElementById('floating-comment-panel')) return;

    const FCP_VERSION = '1.1';

    // ── Gomb ──
    const btn = document.createElement('button');
    btn.id = 'floating-comment-btn';
    btn.setAttribute('aria-label', 'Kommentek megnyitása');
    btn.innerHTML = `<span id="floating-comment-icon">🐦</span>`;
    document.body.appendChild(btn);

    // ── Panel ──
    const panel = document.createElement('div');
    panel.id = 'floating-comment-panel';
    panel.innerHTML = `
        <div id="floating-comment-header">
            <span>🐦</span>
            <span>Csicsergő</span>
        </div>
        <div id="floating-comment-body">
            <div id="echothread"
                 data-shortname="mezitlabaskert"
                 data-api-key="-_Bx_aoOvDh-6sANgDStoZC-f9I6GCwlTFiSVuIJuZQ">
            </div>
        </div>
        <div id="floating-comment-footer">v${FCP_VERSION}</div>
    `;
    document.body.appendChild(panel);

    // ── Gomb kattintás: panel nyit/csuk ──
    btn.addEventListener('click', () => {
        const isOpen = panel.classList.contains('is-open');
        if (isOpen) {
            panel.classList.remove('is-open');
            btn.classList.remove('is-open');
            setTimeout(() => panel.classList.remove('is-visible'), 250);
        } else {
            panel.classList.add('is-visible');
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    panel.classList.add('is-open');
                    btn.classList.add('is-open');
                });
            });
        }
    });
}

// ── Lebegő panel frissítése modál megnyitásakor vagy sima nézetben ──
// Meghívandó a renderCachedPost()-ból és initReadingTimeForDirectView()-ból.
function updateFloatingCommentPanel(postPageUrl, postIdentifier, titleText, url) {
    const echoDiv = document.querySelector('#floating-comment-body #echothread');
    if (!echoDiv) return;

    // Attribútumok frissítése az aktuális poszthoz
    echoDiv.setAttribute('data-page-url', postPageUrl || url);
    echoDiv.setAttribute('data-page-title', titleText || document.title);
    if (postIdentifier) {
        echoDiv.setAttribute('data-identifier', postIdentifier);
    } else {
        echoDiv.removeAttribute('data-identifier');
    }

    // Widget újrainicializálás vagy első betöltés
    if (window.EchoThread?.bootstrap) {
        window.EchoThread.bootstrap();
    } else {
        const s = document.createElement('script');
        s.src = 'https://cdn.echothread.io/widget.js';
        s.async = true;
        document.body.appendChild(s);
    }

    // Kommentszám frissítése a gomb közepén
    // Ha van komment: szám jelenik meg, ha nincs: madár emoji
    setTimeout(() => {
        const countEl = document.querySelector('#floating-comment-body .et-comment-count, #floating-comment-body .et-comments-count, #floating-comment-body .et-header h2');
        const icon = document.getElementById('floating-comment-icon');
        if (icon && countEl) {
            const text = countEl.textContent?.trim();
            const num = parseInt(text);
            if (!isNaN(num) && num > 0) {
                icon.textContent = num;
                icon.style.fontSize = '20px';
                icon.style.fontWeight = '800';
                icon.style.fontFamily = "'Plus Jakarta Sans', sans-serif";
            } else {
                icon.textContent = '🐦';
                icon.style.fontSize = '';
                icon.style.fontWeight = '';
                icon.style.fontFamily = '';
            }
        }
    }, 2000);

    // Gomb megjelenítése
    const btn = document.getElementById('floating-comment-btn');
    if (btn) btn.classList.add('is-visible');
}

// ── Lebegő panel elrejtése modál záráskor ──
// Meghívandó a closePostModal()-ból.
function hideFloatingCommentPanel() {
    const btn = document.getElementById('floating-comment-btn');
    const panel = document.getElementById('floating-comment-panel');
    const badge = document.getElementById('floating-comment-badge');

    if (btn) btn.classList.remove('is-visible', 'is-open');
    if (panel) {
        panel.classList.remove('is-open');
        setTimeout(() => panel.classList.remove('is-visible'), 250);
    }
    const icon = document.getElementById('floating-comment-icon');
    if (icon) {
        icon.textContent = '🐦';
        icon.style.fontSize = '';
        icon.style.fontWeight = '';
        icon.style.fontFamily = '';
    }
}
