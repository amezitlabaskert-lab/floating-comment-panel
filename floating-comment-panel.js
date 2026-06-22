/* =========================================================
   LEBEGŐ KOMMENT DRAWER — mezitlabaskert.hu
   GitHub: amezitlabaskert-lab/floating-comment-panel

   - Tab fizikailag a panel bal széle, együtt csúsznak
   - Skin-színeket követ (var(--szezon-szin), var(--szezon-hover))
   - EchoThread widget egyszer töltődik be, bootstrap()-pal frissül

   Használat (scripts.txt):
     createFloatingCommentPanel()  → init()-ben egyszer
     updateFloatingCommentPanel()  → renderCachedPost()-ban és initReadingTimeForDirectView()-ban
     hideFloatingCommentPanel()    → closePostModal()-ban
   ========================================================= */

function createFloatingCommentPanel() {
    if (document.getElementById('floating-comment-drawer')) return;

    var FCP_VERSION = '1.4';

    // ── Drawer (tab + panel együtt) ──
    var drawer = document.createElement('div');
    drawer.id = 'floating-comment-drawer';

    // ── Tab (a drawer bal széle) ──
    var btn = document.createElement('button');
    btn.id = 'floating-comment-btn';
    btn.setAttribute('aria-label', 'Kommentek megnyitása');
    btn.innerHTML = '<span id="floating-comment-icon" class="is-bird">🐦</span>';
    drawer.appendChild(btn);

    // ── Panel ──
    var panel = document.createElement('div');
    panel.id = 'floating-comment-panel';
    panel.innerHTML = 
        '<div id="floating-comment-header">' +
            '<span>🐦</span>' +
            '<span>Csicsergő<span id="my-custom-comment-count"></span></span>' +
            '<button id="floating-comment-close" aria-label="Panel bezárása">✕</button>' +
        '</div>' +
        '<div id="floating-comment-body">' +
            '<div id="echothread" ' +
                 'data-shortname="mezitlabaskert" ' +
                 'data-api-key="-_Bx_aoOvDh-6sANgDStoZC-f9I6GCwlTFiSVuIJuZQ">' +
            '</div>' +
        '</div>' +
        '<div id="floating-comment-footer">v' + FCP_VERSION + '</div>';
        
    drawer.appendChild(panel);
    document.body.appendChild(drawer);

    // ── Tab kattintás: nyit/csuk ──
    btn.addEventListener('click', function() {
        _toggleFloatingPanel();
    });

    // ── Bezárógomb ──
    panel.querySelector('#floating-comment-close').addEventListener('click', function() {
        _closeFloatingPanel();
    });
}

// ── Belső: nyit/csuk toggle ──
function _toggleFloatingPanel() {
    var drawer = document.getElementById('floating-comment-drawer');
    if (!drawer) return;
    var isOpen = drawer.classList.contains('is-open');
    if (isOpen) {
        _closeFloatingPanel();
    } else {
        drawer.classList.add('is-open');
    }
}

// ── Belső: bezár ──
function _closeFloatingPanel() {
    var drawer = document.getElementById('floating-comment-drawer');
    if (!drawer) return;
    drawer.classList.remove('is-open');
}

// ── Lebegő panel frissítése modál megnyitásakor vagy sima nézetben ──
function updateFloatingCommentPanel(postPageUrl, postIdentifier, titleText, url) {
    var echoDiv = document.querySelector('#floating-comment-body #echothread');
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
    if (window.EchoThread && window.EchoThread.bootstrap) {
        window.EchoThread.bootstrap();
    } else {
        var s = document.createElement('script');
        s.src = 'https://cdn.echothread.io/widget.js';
        s.async = true;
        document.body.appendChild(s);
    }

    // Kommentszám frissítése a tab ikonján és a saját fejlécben
    setTimeout(function() {
        var commentElements = document.querySelectorAll(
            '#floating-comment-body .et-comment, ' +
            '#floating-comment-body .et-bell-item, ' +
            '#floating-comment-body [data-comment-id]'
        );
        var num = commentElements.length;
        var icon = document.getElementById('floating-comment-icon');
        
        if (icon) {
            if (num > 0) {
                icon.textContent = num;
                icon.classList.add('has-count');
                icon.classList.remove('is-bird');
            } else {
                icon.textContent = '🐦';
                icon.classList.remove('has-count');
                icon.classList.add('is-bird');
            }
        }

        // Saját fejléc frissítése a Csicsergő felirat mellett
        var headerCount = document.getElementById('my-custom-comment-count');
        if (headerCount) {
            headerCount.textContent = num > 0 ? ' (' + num + ')' : '';
        }
    }, 2500);

    // Drawer megjelenítése (csak a tab látszik ki alapból)
    var drawer = document.getElementById('floating-comment-drawer');
    if (drawer) drawer.classList.add('is-visible');
}

// ── Lebegő panel elrejtése modál záráskor ──
function hideFloatingCommentPanel() {
    var drawer = document.getElementById('floating-comment-drawer');
    if (drawer) {
        drawer.classList.remove('is-open', 'is-visible');
    }

    // Ikon és osztályok visszaállítása alaphelyzetbe
    var icon = document.getElementById('floating-comment-icon');
    if (icon) {
        icon.textContent = '🐦';
        icon.classList.remove('has-count');
        icon.classList.add('is-bird');
    }
}
