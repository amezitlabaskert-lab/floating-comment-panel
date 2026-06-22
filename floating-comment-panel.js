/* =========================================================
   LEBEGŐ KOMMENT DRAWER — mezitlabaskert.hu
   GitHub: amezitlabaskert-lab/floating-comment-panel

   - Tab fizikailag a panel bal széle, együtt csúsznak
   - Skin-színeket követ (var(--szezon-szin), var(--szezon-hover))
   - EchoThread widget egyszer töltődik be, bootstrap()-pal frissül
   ========================================================= */

function createFloatingCommentPanel() {
    if (document.getElementById('floating-comment-drawer')) return;

    var FCP_VERSION = '3.0';

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

    // ── DINAMIKUS FIGYELŐ (MutationObserver + Debounce) ──
    var targetNode = panel.querySelector('#floating-comment-body');
    if (targetNode) {
        var updateTimer;
        new MutationObserver(function() {
            clearTimeout(updateTimer);
            updateTimer = setTimeout(updateCommentCount, 100);
        }).observe(targetNode, { childList: true, subtree: true });
    }
}

// ── Kommentszám kiszámítása (Logika) ──
function updateCommentCount() {
    var container = document.getElementById('floating-comment-body');
    if (!container) return;

    // 1. Már lerenderelt kommentek (fő + megnyitott reply) a containeren belül
    var visibleComments = container.querySelectorAll('.et-comment').length;

    // 2. Elrejtett reply-k kiszámítása
    var hiddenReplies = 0;
    var replyButtons = container.querySelectorAll('.et-view-replies-btn');

    replyButtons.forEach(function(btn) {
        var text = btn.textContent || '';
        var match = text.match(/\d+/);
        if (!match) return;

        var replyCount = parseInt(match[0], 10);
        var toggleId = btn.dataset.toggleReplies;

        // Ha nincs toggleId (megváltozott a markup), a te biztonsági féked lép életbe:
        // NEM adjuk hozzá vakon, mert a megnyitás után duplikálna. Inkább átugorjuk.
        if (!toggleId) return;

        var repliesList = document.getElementById('et-replies-' + toggleId);

        // getComputedStyle ellenőrzés a CSS display:none kiszűrésére
        if (!repliesList || getComputedStyle(repliesList).display === 'none') {
            hiddenReplies += replyCount;
        }
    });

    var total = visibleComments + hiddenReplies;

    // Átadjuk az eredményt a tiszta UI függvénynek
    updateCommentCounterUI(total);
}

// ── UI frissítése (Különválasztva a ChatGPT javaslatára) ──
function updateCommentCounterUI(total) {
    var icon = document.getElementById('floating-comment-icon');
    var header = document.getElementById('my-custom-comment-count');

    if (icon) {
        if (total > 0) {
            icon.textContent = total;
            icon.classList.add('has-count');
            icon.classList.remove('is-bird');
        } else {
            icon.textContent = '🐦';
            icon.classList.remove('has-count');
            icon.classList.add('is-bird');
        }
    }

    if (header) {
        header.textContent = total > 0 ? ' (' + total + ')' : '';
    }
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

// ── Lebegő panel frissítése ──
function updateFloatingCommentPanel(postPageUrl, postIdentifier, titleText, url) {
    var echoDiv = document.querySelector('#floating-comment-body #echothread');
    if (!echoDiv) return;

    echoDiv.setAttribute('data-page-url', postPageUrl || url);
    echoDiv.setAttribute('data-page-title', titleText || document.title);
    if (postIdentifier) {
        echoDiv.setAttribute('data-identifier', postIdentifier);
    } else {
        echoDiv.removeAttribute('data-identifier');
    }

    if (window.EchoThread && window.EchoThread.bootstrap) {
        window.EchoThread.bootstrap();
    } else {
        var s = document.createElement('script');
        s.src = 'https://cdn.echothread.io/widget.js';
        s.async = true;
        document.body.appendChild(s);
    }

    // Gyors és biztonságos kezdeti trigger
    setTimeout(updateCommentCount, 250);

    var drawer = document.getElementById('floating-comment-drawer');
    if (drawer) drawer.classList.add('is-visible');
}

// ── Lebegő panel elrejtése ──
function hideFloatingCommentPanel() {
    var drawer = document.getElementById('floating-comment-drawer');
    if (drawer) {
        drawer.classList.remove('is-open', 'is-visible');
    }

    // UI visszaállítása alaphelyzetbe
    updateCommentCounterUI(0);
}
