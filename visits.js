/* ==================================================================
   Visit counting. One row per page view: the page, where the visitor
   came from, and the time. No IP address, no cookie, no name.

   It starts from the day it was installed — there is no record of
   anything before that, and the counter says so rather than guessing.
   ================================================================== */
(() => {
  const SB = 'https://qbzpyhsbrjagyqsruzcb.supabase.co';
  const SK = 'sb_publishable_fD1zz60o4p8oEDmWDKJeNg_wd-IAhbs';
  const H  = { apikey: SK, Authorization: 'Bearer ' + SK, 'Content-Type': 'application/json' };

  const page = location.pathname.split('/').pop() || 'index.html';

  // one visit per page per 30 minutes, so a refresh does not inflate it
  const stamp = 'visited_' + page;
  let recent = false;
  try {
    const last = Number(sessionStorage.getItem(stamp) || 0);
    recent = Date.now() - last < 30 * 60 * 1000;
    if (!recent) sessionStorage.setItem(stamp, String(Date.now()));
  } catch (e) { /* private browsing — just log it */ }

  if (!recent) {
    fetch(SB + '/rest/v1/visits', {
      method: 'POST',
      headers: Object.assign({ Prefer: 'return=minimal' }, H),
      body: JSON.stringify({
        page,
        // where they came from, without any query string that might carry data
        referrer: document.referrer ? document.referrer.split('?')[0].slice(0, 200) : null
      })
    }).catch(() => { /* never let a counter break the page */ });
  }

  // show the total wherever the page asks for it
  const out = document.getElementById('visit-count');
  if (!out) return;
  fetch(SB + '/rest/v1/visits?select=id', {
    headers: Object.assign({ Prefer: 'count=exact', Range: '0-0' }, H)
  }).then(r => {
    const range = r.headers.get('content-range');
    const total = range ? range.split('/')[1] : null;
    if (total && total !== '*') out.textContent = Number(total).toLocaleString();
  }).catch(() => {});
})();
