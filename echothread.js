/* =========================================================
   LEBEGŐ KOMMENT PANEL — mezitlabaskert.hu
   GitHub: amezitlabaskert-lab/floating-comment-panel

   - Csak modál nyitva látható (jobb alul)
   - Gombra kattintva nyílik/csukódik a panel
   - Badge mutatja a kommentszámot
   - EchoThread widget egyszer töltődik be, bootstrap()-pal frissül
   - Skin-színeket követ (var(--szezon-szin), var(--szezon-hover))

   Használat (scripts.txt):
     createFloatingCommentPanel()  → init()-ben egyszer
     updateFloatingCommentPanel()  → renderCachedPost()-ban
     hideFloatingCommentPanel()    → closePostModal()-ban
   ========================================================= */

function createFloatingCommentPanel() {
    if (document.getElementById('floating-comment-panel')) return;

    // ── CSS ──
    const style = document.createElement('style');
    style.textContent = `
        #floating-comment-btn {
            position: fixed;
            bottom: 90px;
            right: 30px;
            width: 52px;
            height: 52px;
            border-radius: 50%;
            background: var(--szezon-szin);
            color: #fff;
            border: none;
            cursor: pointer;
            z-index: 100002;
            display: none;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2), 0 0 0 8px rgba(255,255,255,0.5);
            transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275),
                        background 0.2s ease;
            font-size: 22px;
            line-height: 1;
        }
        #floating-comment-btn.is-visible {
            display: flex;
        }
        #floating-comment-btn:hover {
            transform: translateY(-4px) scale(1.08);
            background: var(--szezon-hover);
        }
        #floating-comment-btn.is-open {
            transform: rotate(15deg);
        }
        #floating-comment-badge {
            position: absolute;
            top: -4px;
            right: -4px;
            min-width: 20px;
            height: 20px;
            padding: 0 5px;
            border-radius: 10px;
            background: #fff;
            color: var(--szezon-szin);
            font-size: 11px;
            font-weight: 800;
            font-family: 'Plus Jakarta Sans', sans-serif;
            display: none;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 6px rgba(0,0,0,0.15);
            box-sizing: border-box;
        }
        #floating-comment-badge.has-count {
            display: flex;
        }
        #floating-comment-panel {
            position: fixed;
            bottom: 155px;
            right: 30px;
            width: 380px;
            max-width: calc(100vw - 60px);
            max-height: 60vh;
            background: #fff;
            border-radius: 16px;
            box-shadow: 0 8px 40px rgba(0,0,0,0.18), 0 0 0 8px rgba(255,255,255,0.4);
            z-index: 100001;
            overflow: hidden;
            display: none;
            flex-direction: column;
            transform: translateY(20px);
            opacity: 0;
            transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275),
                        opacity 0.2s ease;
        }
        #floating-comment-panel.is-visible {
            display: flex;
        }
        #floating-comment-panel.is-open {
            transform: translateY(0);
            opacity: 1;
        }
        #floating-comment-header {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 14px 18px;
            background: var(--szezon-szin);
            color: #fff;
            font-family: 'Plus Jakarta Sans', sans-serif;
            font-size: 14px;
            font-weight: 700;
            flex-shrink: 0;
        }
        #floating-comment-header span:first-child {
            font-size: 18px;
        }
        #floating-comment-body {
            overflow-y: auto;
            flex: 1;
            padding: 16px;
            -webkit-overflow-scrolling: touch;
        }
        #floating-comment-body #echothread {
            margin-top: 0 !important;
        }
        @media (max-width: 768px) {
            #floating-comment-panel {
                right: 15px;
                bottom: 140px;
                width: calc(100vw - 30px);
                max-height: 55vh;
            }
            #floating-comment-btn {
                right: 15px;
                bottom: 80px;
            }
        }
    `;
    document.head.appendChild(style);

    // ── Gomb ──
    const btn = document.createElement('button');
    btn.id = 'floating-comment-btn';
    btn.setAttribute('aria-label', 'Kommentek megnyitása');
    btn.innerHTML = `
        💬
        <span id="floating-comment-badge"></span>
    `;
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

// ── Lebegő panel frissítése modál megnyitásakor ──
// Frissíti az #echothread attribútumait az aktuális poszthoz,
// majd bootstrap()-pal újrainicializálja a widgetet.
// Meghívandó a renderCachedPost()-ból, az echothreadDiv beállítása után.
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

    // Kommentszám badge frissítése
    // Rövid késleltetéssel, hogy a widget rendereljen
    setTimeout(() => {
        const countEl = document.querySelector('#floating-comment-body .et-comment-count, #floating-comment-body .et-comments-count');
        const badge = document.getElementById('floating-comment-badge');
        if (badge && countEl) {
            const count = countEl.textContent?.trim();
            if (count && count !== '0') {
                badge.textContent = count;
                badge.classList.add('has-count');
            } else {
                badge.classList.remove('has-count');
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
    if (badge) badge.classList.remove('has-count');
}
