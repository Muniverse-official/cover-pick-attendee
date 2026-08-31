(() => {
  'use strict';

  const LEGACY_ORIGIN = 'https://tcxugltvmatbgsmcepso.supabase.co';
  const ACTIVE_ORIGIN = 'https://kkaoerbblpuszptiibvo.supabase.co';
  const LEGACY_PATH = '/functions/v1/cover-pick';
  const VERIFY_ENDPOINT = `${ACTIVE_ORIGIN}/functions/v1/cover-pick-verify`;
  const REGISTER_ENDPOINT = `${ACTIVE_ORIGIN}/functions/v1/cover-pick-register`;
  const nativeFetch = window.fetch.bind(window);

  function route(rawUrl) {
    let url;
    try {
      url = new URL(rawUrl, window.location.href);
    } catch {
      return rawUrl;
    }

    const isLegacyCombined = url.origin === LEGACY_ORIGIN && url.pathname === LEGACY_PATH;
    const isActiveCombined = url.origin === ACTIVE_ORIGIN && url.pathname === LEGACY_PATH;
    if (!isLegacyCombined && !isActiveCombined) return rawUrl;

    const action = url.searchParams.get('action');
    if (action === 'verify') return VERIFY_ENDPOINT;
    if (action === 'submit') return REGISTER_ENDPOINT;

    if (isLegacyCombined) {
      url.protocol = 'https:';
      url.host = new URL(ACTIVE_ORIGIN).host;
      return url.toString();
    }
    return rawUrl;
  }

  window.fetch = (input, init) => {
    if (typeof input === 'string' || input instanceof URL) {
      return nativeFetch(route(String(input)), init);
    }

    if (input instanceof Request) {
      const routedUrl = route(input.url);
      if (routedUrl !== input.url) return nativeFetch(new Request(routedUrl, input), init);
    }

    return nativeFetch(input, init);
  };

  Object.defineProperty(window, '__FANS_PICK_BACKEND_SPLIT__', {
    value: Object.freeze({ verify: VERIFY_ENDPOINT, register: REGISTER_ENDPOINT }),
    configurable: false,
    enumerable: false,
    writable: false
  });
})();
