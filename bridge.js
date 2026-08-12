(() => {
  'use strict';

  const API_PREFIX = 'https://tcxugltvmatbgsmcepso.supabase.co/functions/v1/cover-pick';
  const nativeFetch = window.fetch.bind(window);

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element) || target.id !== 'verifyBtn') return;
    const email = document.getElementById('email')?.value?.trim() || '';
    const nickname = document.getElementById('nickname')?.value?.trim() || '';
    if (email && nickname) {
      sessionStorage.setItem('cover_pick_account_email', email);
      sessionStorage.setItem('cover_pick_nickname', nickname);
    }
  }, true);

  window.fetch = async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input instanceof Request ? input.url : String(input);
    if (url.startsWith(API_PREFIX) && url.includes('action=submit') && typeof init.body === 'string') {
      try {
        const body = JSON.parse(init.body);
        body.account_email = sessionStorage.getItem('cover_pick_account_email') || '';
        body.muniverse_nickname = sessionStorage.getItem('cover_pick_nickname') || '';
        init = { ...init, body: JSON.stringify(body) };
      } catch (_) {}
    }
    return nativeFetch(input, init);
  };
})();
