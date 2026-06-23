/* =========================================================
   LEBEGŐ KOMMENT DRAWER — mezitlabaskert.hu
   GitHub: amezitlabaskert-lab/floating-comment-panel

   - Tab fizikailag a panel bal széle, együtt csúsznak
   - Skin-színeket követ (var(--szezon-szin), var(--szezon-hover))
   - EchoThread widget egyszer töltődik be, bootstrap()-pal frissül
   - "kommentek" felirat külső label, elforgva a tab bal szélén
   ========================================================= */

function createFloatingCommentPanel() {
    if (document.getElementById('floating-comment-drawer')) return;

    var FCP_VERSION = '4.0';

    // ── Drawer (tab + panel együtt) ──
    var drawer = document.createElement('div');
    drawer.id = 'floating-comment-drawer';

    // ── Tab (a drawer bal széle) ──
    var btn = document.createElement('button');
    btn.id = 'floating-comment-btn';
    btn.setAttribute('aria-label', 'Csicsergő megnyitása');
    btn.innerHTML =
        '<div id="floating-comment-label">Csicsergő</div>' +
        '<div id="floating-comment-header-icon">' +
            '<span class="bird-icon">🐦</span>' +
            '<span id="comment-count-display"></span>' +
        '</div>';
    drawer.appendChild(btn);

    // ── Panel ──
    var panel = document.createElement('div');
    panel.id = 'floating-comment-panel';
    panel.innerHTML =
        '<div id="floating-comment-header">' +
            '<span style="display:inline-block; transform:scaleX(-1);">🐦</span>' +
            '<span>Csicsergő<span id="my-custom-comment-count"></span></span>' +
            '<button id="floating-comment-close" aria-label="Csicsergő bezárása">✕</button>' +
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
            updateTimer = setTimeout(function() {
                updateCommentCount();
                magyaritEchoThread();
            }, 150);
        }).observe(targetNode, { childList: true, subtree: true });
    }
}

// ── Kommentszám kiszámítása (Logika) ──
function updateCommentCount() {
    var container = document.getElementById('floating-comment-body');
    if (!container) return;

    var visibleComments = container.querySelectorAll('.et-comment').length;
    var hiddenReplies = 0;
    var replyButtons = container.querySelectorAll('.et-view-replies-btn');

    replyButtons.forEach(function(btn) {
        var text = btn.textContent || '';
        var match = text.match(/\d+/);
        if (!match) return;

        var replyCount = parseInt(match[0], 10);
        var toggleId = btn.dataset.toggleReplies;
        if (!toggleId) return;

        var repliesList = document.getElementById('et-replies-' + toggleId);
        if (!repliesList || getComputedStyle(repliesList).display === 'none') {
            hiddenReplies += replyCount;
        }
    });

    var total = visibleComments + hiddenReplies;
    updateCommentCounterUI(total);
}

// ── UI frissítése ──
function updateCommentCounterUI(total) {
    var countDisplay = document.getElementById('comment-count-display');
    var header = document.getElementById('my-custom-comment-count');

    if (countDisplay) {
        countDisplay.textContent = total > 0 ? '(' + total + ')' : '';
    }
    if (header) {
        header.textContent = total > 0 ? ' (' + total + ')' : '';
    }
}

// ── Magyar fordítás (EchoThread) ──
function magyaritEchoThread() {
    var container = document.getElementById('floating-comment-body');
    if (!container) return;

    // Placeholder attribútumok
    var placeholders = {
        'Write a comment…': 'Írj egy hozzászólást…',
        'Your name': 'Neved',
        'Email (optional, never shown)': 'Email (nem kötelező, nem látható)',
    };
    container.querySelectorAll('[placeholder]').forEach(function(el) {
        var p = el.getAttribute('placeholder');
        if (placeholders[p]) el.setAttribute('placeholder', placeholders[p]);
    });

    // Aria-label attribútumok
    var ariaLabels = {
        'Write a comment': 'Írj egy hozzászólást',
        'Your name': 'Neved',
        'Email (optional, never shown publicly)': 'Email (nem kötelező, nem látható)',
        'Post comment': 'Küldés',
        'Attach an image': 'Kép csatolása',
        'Insert emoji': 'Emoji',
        'Sign in with Google': 'Belépés Google-lel',
        'Sign in with X': 'Belépés X-szel',
        'Sign in with Facebook': 'Belépés Facebookkal',
        'Remove attached image': 'Kép eltávolítása',
        'Sign in (optional)': 'Bejelentkezés (nem kötelező)',
        'Emoji picker': 'Emoji választó',
    };
    container.querySelectorAll('[aria-label]').forEach(function(el) {
        var lbl = el.getAttribute('aria-label');
        if (ariaLabels[lbl]) el.setAttribute('aria-label', ariaLabels[lbl]);
    });

    // Szöveges tartalom
    var szovegek = {
        'Best': 'Legjobb',
        'Newest': 'Legújabb',
        'Oldest': 'Legrégebbi',
        'Most liked': 'Legtöbb like',
        'Most replied': 'Legtöbb válasz',
        'Show the highest-rated recent comments first.': 'A legjobban értékelt kommentek elöl.',
        'Show the newest comments first.': 'A legújabb kommentek elöl.',
        'Show the oldest comments first.': 'A legrégebbi kommentek elöl.',
        'Show the most liked comments first (lifetime).': 'A legtöbb like-ot kapott kommentek elöl.',
        'Show the most discussed comments first.': 'A legtöbbet válaszolt kommentek elöl.',
        'Post': 'Küldés',
        'or sign in': 'vagy jelentkezz be',
        'Optional. Sign in to react to comments, get notified of replies, and post under a name that\'s yours.': 'Nem kötelező. Belépve reagálhatsz, értesítést kapsz a válaszokról.',
        'Be the first to comment': 'Legyél az első hozzászóló',
        'Start the conversation — your thoughts will appear here.': 'Kezdd el a beszélgetést — a hozzászólásaid itt jelennek meg.',
        'Reply': 'Válasz',
        'Replies': 'Válaszok',
        'Like': 'Tetszik',
        'Edit': 'Szerkesztés',
        'Delete': 'Törlés',
        'Report': 'Jelölés',
        'Load more': 'Több komment',
        'Show replies': 'Válaszok mutatása',
        'Hide replies': 'Válaszok elrejtése',
        'Cancel': 'Mégse',
        'Save': 'Mentés',
        'Powered by': 'Működteti:',
    };

    function forditSzoveg(node) {
        if (node.nodeType === 3) {
            var trimmed = node.textContent.trim();
            if (szovegek[trimmed]) {
                node.textContent = node.textContent.replace(trimmed, szovegek[trimmed]);
            }
        } else if (node.nodeType === 1 && node.tagName !== 'SCRIPT' && node.tagName !== 'STYLE' && node.tagName !== 'SVG') {
            node.childNodes.forEach(forditSzoveg);
        }
    }

    forditSzoveg(container);
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

    setTimeout(function() {
        updateCommentCount();
        magyaritEchoThread();
    }, 300);

    var drawer = document.getElementById('floating-comment-drawer');
    if (drawer) drawer.classList.add('is-visible');
}

// ── Lebegő panel elrejtése ──
function hideFloatingCommentPanel() {
    var drawer = document.getElementById('floating-comment-drawer');
    if (drawer) {
        drawer.classList.remove('is-open', 'is-visible');
    }
    updateCommentCounterUI(0);
}
