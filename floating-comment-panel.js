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

    var FCP_VERSION = '5.0';

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

    // ── Placeholder attribútumok ──
    var placeholders = {
        'Write a comment…': 'Szólj hozzá…',
        'Write a reply…': 'Válaszolj…',
        'Your name': 'Neved',
        'Email (optional, never shown)': 'Email (nem kötelező, nem látható)',
    };
    container.querySelectorAll('[placeholder]').forEach(function(el) {
        var p = el.getAttribute('placeholder');
        if (placeholders[p]) el.setAttribute('placeholder', placeholders[p]);
    });

    // ── data-placeholder (contenteditable szerkesztő) ──
    container.querySelectorAll('[data-placeholder]').forEach(function(el) {
        var p = el.getAttribute('data-placeholder');
        if (placeholders[p]) el.setAttribute('data-placeholder', placeholders[p]);
    });

    // ── Aria-label attribútumok ──
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
        'Notifications': 'Értesítések',
        'Copy link to this comment': 'Hivatkozás másolása',
        'Bold': 'Félkövér',
        'Italic': 'Dőlt',
        'Strikethrough': 'Áthúzott',
        'Spoiler': 'Spoiler',
    };
    container.querySelectorAll('[aria-label]').forEach(function(el) {
        var lbl = el.getAttribute('aria-label');
        if (ariaLabels[lbl]) el.setAttribute('aria-label', ariaLabels[lbl]);
        if (lbl && lbl.startsWith('View ') && lbl.endsWith("'s profile")) {
            el.setAttribute('aria-label', 'Profil megtekintése');
        }
        if (lbl && lbl.startsWith('Verified site owner')) {
            el.setAttribute('aria-label', 'Főkertész');
        }
    });

    // ── Title attribútumok ──
    // A toolbar gomboknál a title tartalmaz shortcut infót is, pl.:
    // "Bold — Ctrl+B  ·  **text**" → csak az eleje egyezik a kulccsal
    var titles = {
        'Remove image': 'Kép eltávolítása',
        'View profile': 'Profil megtekintése',
        'Copy link': 'Hivatkozás másolása',
        'More options': 'További lehetőségek',
        'Pin to top': 'Rögzítés az elejére',
        'Like': 'Tetszik',
        'Love': 'Imádom',
        'Haha': 'Haha',
        'Angry': 'Dühös',
        'Sad': 'Szomorú',
        'Add emoji': 'Emoji hozzáadása',
        'Add photo': 'Kép hozzáadása',
        'Post comment': 'Küldés',
        'Bold': 'Félkövér',
        'Italic': 'Dőlt',
        'Strikethrough': 'Áthúzott',
        'Spoiler': 'Spoiler',
    };
    container.querySelectorAll('[title]').forEach(function(el) {
        var t = el.getAttribute('title');
        if (!t) return;

        // Pontos egyezés
        if (titles[t]) {
            el.setAttribute('title', titles[t]);
            return;
        }

        // Részleges egyezés: "Bold — Ctrl+B  ·  **text**"
        // A ' —' elválasztó előtti részt fordítjuk, a shortcut szöveg marad
        var dashIdx = t.indexOf(' —');
        if (dashIdx !== -1) {
            var prefix = t.slice(0, dashIdx);
            var suffix = t.slice(dashIdx);
            if (titles[prefix]) {
                el.setAttribute('title', titles[prefix] + suffix);
                return;
            }
        }

        if (t.startsWith('Verified owner')) {
            el.setAttribute('title', 'Főkertész');
        }
    });

    // ── Szöveges tartalom ──
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
        'Report': 'Jelentés',
        'Load more': 'Több mutatása',
        'Show replies': 'Válaszok mutatása',
        'Hide replies': 'Válaszok elrejtése',
        'Cancel': 'Mégse',
        'Save': 'Mentés',
        'Powered by': 'Működteti:',
        'Pin to top': 'Rögzítés az elejére',
        'Sign out': 'Kijelentkezés',
        'Signed in as': 'Bejelentkezve:',
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

    // ── Owner badge magyarítás ──
    container.querySelectorAll('.et-owner-badge').forEach(function(badge) {
        badge.setAttribute('aria-label', 'Főkertész');
        badge.setAttribute('title', 'Főkertész');

        // Szövegcsomópont (Owner) → láb span
        badge.childNodes.forEach(function(node) {
            if (node.nodeType === 3 && node.textContent.trim() === 'Owner') {
                var span = document.createElement('span');
                span.className = 'fcp-foot-badge';
                span.textContent = '🦶🏻';
                span.style.fontSize = '1.3em';
                span.style.textShadow = '0 1px 3px rgba(0,0,0,0.35)';
                node.parentNode.replaceChild(span, node);
            }
        });

        // Sorrend: láb előre, SVG pajzs mögé
        var foot = badge.querySelector('.fcp-foot-badge');
        var svg  = badge.querySelector('svg');
        if (foot && svg && badge.firstChild !== foot) {
            badge.insertBefore(foot, badge.firstChild);
        }
    });

    // ── Időbélyegzők magyarítása ──
    // Formátumok: "5m ago", "2h ago", "3d ago", "1w ago", "2y ago"
    var idoMap = {
        'm': 'perce',
        'h': 'órája',
        'd': 'napja',
        'w': 'hete',
        'y': 'éve'
    };
    var walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null, false);
    var node;
    var toUpdate = [];
    while (node = walker.nextNode()) {
        if (/\d+[mhdwy] ago/.test(node.textContent)) {
            toUpdate.push(node);
        }
    }
    toUpdate.forEach(function(node) {
        node.textContent = node.textContent.replace(/(\d+)([mhdwy]) ago/g, function(match, count, unit) {
            return count + ' ' + (idoMap[unit] || match);
        });
    });

    // ── Signin band középre igazítása ──
    var signinBand = container.querySelector('.et-compose-signin-band');
    if (signinBand) {
        signinBand.style.marginLeft = '0';
    }
    var signinRow = container.querySelector('.et-signin-band-row');
    if (signinRow) {
        signinRow.style.justifyContent = 'center';
        // Sorrend: Google, Facebook, X
        var google   = signinRow.querySelector('[data-et-provider="google"]');
        var facebook = signinRow.querySelector('[data-et-provider="facebook"]');
        var x        = signinRow.querySelector('[data-et-provider="twitter"]');
        [google, facebook, x].forEach(function(btn) {
            if (btn) signinRow.appendChild(btn);
        });
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
