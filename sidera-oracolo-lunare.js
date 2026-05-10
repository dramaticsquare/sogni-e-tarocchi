// ══════════════════════════════════════════════════════════════════════════
//  SIDERA — Guida Lunare Personalizzata
//  Nota: HTML (#lunarDeepDiveBtn e #lunarDeepDiveResult) è già in index.html
//  Questo file gestisce solo la logica JS.
// ══════════════════════════════════════════════════════════════════════════
(function () {
    'use strict';

    // ── Namespace pubblico ───────────────────────────────────────────────
    window.sideraLunar = {

        run: async function (forceNew) {
            const cu       = currentUser;
            const moonSign = getCurrentMoonSign?.();
            const phase    = getMoonPhase?.();
            const moonData = MOON_SIGN_DATA?.[moonSign] || {};
            const viewSign = _lunarViewSign || cu?.sign || '';
            const today    = new Date().toISOString().split('T')[0];
            const intento  = (document.getElementById('lunarIntentoInput')?.value || '').trim();
            const COST     = 2;

            const resultArea = document.getElementById('lunarDeepDiveResult');
            const content    = document.getElementById('lunarDeepDiveContent');
            const metaEl     = document.getElementById('lunarDeepDiveMeta');
            const badge      = document.getElementById('lunarCachedBadge');

            if (!resultArea || !content) return;

            // Mostra il pannello e scrolla
            resultArea.style.display = 'block';
            setTimeout(() => resultArea.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);

            // Cache giornaliera — include hash dell'intento se presente
            const intentoHash = intento
                ? '_' + btoa(encodeURIComponent(intento)).slice(0, 6)
                : '';
            const cacheKey = `sidera_oracolo_lunare_${today}_${viewSign || 'gen'}${intentoHash}`;
            const cached   = !forceNew && localStorage.getItem(cacheKey);

            if (metaEl) {
                metaEl.innerText = [
                    phase?.name || '',
                    'Luna in ' + moonSign,
                    viewSign
                ].filter(Boolean).join(' · ');
            }

            if (cached) {
                content.innerHTML = formatText ? formatText(cached) : cached;
                if (badge) badge.style.display = 'inline-flex';
                showToast?.('✦ Lettura già generata oggi — nessun credito scalato.');
                return;
            }

            if (badge) badge.style.display = 'none';

            // Controlla crediti
            const c = parseInt(localStorage.getItem('astral_credits')) || 0;
            if (c < COST) {
                resultArea.style.display = 'none';
                openPayment?.();
                return;
            }

            content.innerHTML = '<p class="loading-text">La luna sta componendo il tuo messaggio</p>';

            try {
                const res = await fetch(MAKE_URL, {
                    method:  'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        tipo:           'oracolo_lunare',
                        data:            today,
                        fase_lunare:     phase?.name    || '',
                        luna_in:         moonSign       || '',
                        segno_utente:    viewSign,
                        nome:            cu?.name       || '',
                        energia:         moonData.energy || '',
                        intento:         intento,
                        personalizzato:  !!viewSign,
                    })
                });

                const text = await res.text();
                content.innerHTML = formatText ? formatText(text) : text;

                // Salva in cache e pulisci giorni vecchi
                localStorage.setItem(cacheKey, text);
                Object.keys(localStorage)
                    .filter(k => k.startsWith('sidera_oracolo_lunare_') && k !== cacheKey)
                    .forEach(k => localStorage.removeItem(k));

                saveToHistory?.('oracolo_lunare',
                    [phase?.name, 'Luna in ' + moonSign, viewSign]
                        .filter(Boolean).join(' · ')
                        + (intento ? ' | ' + intento.slice(0, 60) : ''),
                    text
                );
                deductCredits?.(COST);

            } catch (e) {
                console.error('[Sidera] Oracolo Lunare:', e);
                content.innerHTML = `
                    <p style="color:var(--text-muted);font-style:italic;
                               text-align:center;padding:12px 0;">
                        La luna non ha risposto. I crediti non sono stati scalati
                        — riprova tra poco.
                    </p>`;
            }
        },

        shareResult: async function () {
            const text  = document.getElementById('lunarDeepDiveContent')?.innerText || '';
            const phase = getMoonPhase?.() || {};
            const moon  = getCurrentMoonSign?.() || '';
            const sign  = _lunarViewSign || currentUser?.sign || '';
            const sym   = ZODIAC_SYMBOLS?.[sign] || '✦';
            const share =
                `✦ Guida Lunare del Giorno · Sidera ✦\n\n` +
                `${phase.sym || '☽'} ${phase.name || ''} · Luna in ${moon}` +
                (sign ? `\n${sym} ${sign}` : '') +
                `\n\n${text.slice(0, 400)}…\n\nhttps://sidera7.vercel.app/`;

            if (navigator.share) {
                try { await navigator.share({ title: 'Sidera — Guida Lunare', text: share }); return; }
                catch (e) { if (e.name === 'AbortError') return; }
            }
            try {
                await navigator.clipboard.writeText(share);
                showToast?.('✨ Testo copiato!');
            } catch { showToast?.('Copia il testo manualmente.'); }
        },

        copyResult: async function () {
            try {
                const text = document.getElementById('lunarDeepDiveContent')?.innerText || '';
                await navigator.clipboard.writeText(text);
                showToast?.('Testo copiato negli appunti.');
            } catch { showToast?.('Copia il testo manualmente.'); }
        }
    };

    // Alias diretto usabile come onclick="runLunarDeepDive()"
    window.runLunarDeepDive = () => window.sideraLunar.run();

})();
