(() => {
  'use strict';

  const OLD_BACKEND = 'https://tcxugltvmatbgsmcepso.supabase.co';
  const ACTIVE_BACKEND = 'https://kkaoerbblpuszptiibvo.supabase.co';
  const nativeFetch = window.fetch.bind(window);

  window.fetch = (input, init) => {
    if (typeof input === 'string' && input.startsWith(OLD_BACKEND)) {
      input = ACTIVE_BACKEND + input.slice(OLD_BACKEND.length);
    }
    return nativeFetch(input, init);
  };
})();
