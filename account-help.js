(() => {
  'use strict';

  const COPY = {
    ko: 'Muniverse 가입 이메일과 닉네임은 Muniverse 로그인 후 마이페이지에서 확인할 수 있습니다.',
    en: 'You can check your Muniverse account email and nickname on My Page after logging in to Muniverse.',
    ja: 'Muniverseの登録メールアドレスとニックネームは、Muniverseにログイン後、マイページでご確認いただけます。',
    'zh-TW': '您可以在登入 Muniverse 後，於我的頁面確認 Muniverse 註冊電子郵件與暱稱。',
    'zh-CN': '您可以在登录 Muniverse 后，在我的页面中查看 Muniverse 注册邮箱和昵称。'
  };

  const lang = document.getElementById('lang');
  const help = document.getElementById('step1AccountHelp');

  function apply() {
    if (!help) return;
    const key = lang?.value || 'ko';
    help.textContent = COPY[key] || COPY.ko;
  }

  lang?.addEventListener('change', apply);
  window.addEventListener('attendee-language-change', apply);
  apply();
})();
