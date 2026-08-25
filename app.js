(() => {
  'use strict';

  const API = 'https://tcxugltvmatbgsmcepso.supabase.co/functions/v1/cover-pick';
  const RECORDING_DATE = '2026-09-14';
  const COPY = {"ko":{"status":"공식 등록","hero":"방청 당첨자 정보 등록","s1":"당첨자 확인","s1d":"당첨된 Muniverse 계정의 가입 이메일과 닉네임을 입력해 주세요.","email":"Muniverse 가입 이메일","nick":"Muniverse 닉네임","privacyTitle":"개인정보 수집·이용 안내","privacy":"<dl class=\"privacy-grid\"><div><dt>수집·이용 목적</dt><dd>방청 당첨자 확인, 본인 확인 및 방청 안내</dd></div><div><dt>수집 항목</dt><dd>Muniverse 가입 이메일·닉네임, 이름, 국적, 생년월일, 연락처, 방청 안내용 이메일</dd></div><div><dt>보유·이용 기간</dt><dd>방청자 확인 및 안내 완료 후 지체 없이 파기합니다.</dd></div><div><dt>동의 거부 및 불이익</dt><dd>동의를 거부할 수 있으나, 동의하지 않을 경우 당첨자 확인 및 방청 등록이 제한됩니다.</dd></div></dl>","consent":"[필수] 개인정보 수집·이용 안내를 읽고 동의합니다.","verify":"당첨자 확인","s2":"방청자 정보 입력","s2d":"녹화 당일 본인 확인과 방청 안내에 사용할 정보를 입력합니다.","name":"이름","nationality":"국적","birth":"생년월일","phone":"연락처","contact":"방청 안내용 이메일","contactHint":"해외 번호는 문자 수신이 어려울 수 있어 이메일도 함께 수집합니다.","notice":"<strong>만 15세 이상</strong>만 참여할 수 있습니다. 녹화 당일 사진이 부착된 유효한 신분증 지참이 필수이며, 방청권 양도·판매·명의 변경은 불가합니다.","submit":"방청자 정보 등록","done":"등록 완료","doneDesc":"방청자 정보가 정상적으로 등록되었습니다. 최종 안내는 별도로 발송됩니다.","already":"이미 입력된 정보입니다.","missingIdentity":"이메일과 닉네임을 모두 입력해 주세요.","consentNeeded":"개인정보 수집·이용 안내를 읽고 필수 동의해 주세요.","mismatch":"당첨자 정보와 일치하지 않습니다.","rate":"요청이 많습니다. 잠시 후 다시 시도해 주세요.","session":"확인 시간이 만료되었습니다. 처음부터 다시 진행해 주세요.","missing":"모든 필수 항목을 입력해 주세요.","invalidEmail":"올바른 이메일 주소를 입력해 주세요.","invalidPhone":"연락처 형식을 확인해 주세요.","under15":"녹화일 기준 만 15세 이상만 참여할 수 있습니다.","network":"서버 연결에 실패했습니다. 다시 시도해 주세요.","preview":"디자인 확인용 미리보기에서는 정보가 제출되지 않습니다."},"en":{"status":"OFFICIAL REGISTRATION","hero":"Audience winner registration","s1":"Verify winner","s1d":"Enter the email and nickname of the winning Muniverse account.","email":"Muniverse account email","nick":"Muniverse nickname","privacyTitle":"Personal data collection & use notice","privacy":"<dl class=\"privacy-grid\"><div><dt>Purpose of collection and use</dt><dd>Winner verification, identity verification, and attendance guidance</dd></div><div><dt>Information collected</dt><dd>Muniverse account email and nickname, full name, nationality, date of birth, phone number, and email for attendance notices</dd></div><div><dt>Retention period</dt><dd>Personal information is deleted without delay after attendee verification and attendance guidance are completed.</dd></div><div><dt>Right to refuse and consequences</dt><dd>You may refuse consent, but winner verification and attendee registration will be restricted if you do not consent.</dd></div></dl>","consent":"[Required] I have read and agree to the personal data collection and use notice.","verify":"Verify winner","s2":"Attendee information","s2d":"Enter the information used for identity verification and attendance notices.","name":"Full name","nationality":"Nationality","birth":"Date of birth","phone":"Phone number","contact":"Email for attendance notices","contactHint":"Email is collected because international SMS delivery may be unavailable.","notice":"Only participants aged <strong>15 or older</strong> may attend. Bring a valid photo ID on the recording day. Transfer, resale, or name changes are not allowed.","submit":"Complete registration","done":"Registration complete","doneDesc":"Your attendee information has been registered. Final instructions will be sent separately.","already":"Your information has already been submitted.","missingIdentity":"Enter both email and nickname.","consentNeeded":"Read and accept the required personal data notice.","mismatch":"The information does not match a winner record.","rate":"Too many requests. Please try again shortly.","session":"Your verification session expired. Please start again.","missing":"Complete all required fields.","invalidEmail":"Enter a valid email address.","invalidPhone":"Check the phone number format.","under15":"You must be at least 15 on the recording date.","network":"Could not connect to the server. Please try again.","preview":"Information is not submitted in design preview mode."},"ja":{"status":"公式登録","hero":"観覧当選者情報登録","s1":"当選者確認","s1d":"当選したMuniverseアカウントのメールアドレスとニックネームを入力してください。","email":"Muniverse登録メールアドレス","nick":"Muniverseニックネーム","privacyTitle":"個人情報の取得・利用案内","privacy":"<dl class=\"privacy-grid\"><div><dt>取得・利用目的</dt><dd>観覧当選者の確認、本人確認および観覧案内</dd></div><div><dt>取得項目</dt><dd>Muniverse登録メールアドレス・ニックネーム、氏名、国籍、生年月日、電話番号、観覧案内用メールアドレス</dd></div><div><dt>保有・利用期間</dt><dd>観覧者確認および案内の完了後、遅滞なく削除します。</dd></div><div><dt>同意を拒否する権利と不利益</dt><dd>同意を拒否できますが、同意しない場合は当選確認および観覧登録が制限されます。</dd></div></dl>","consent":"【必須】個人情報の取得・利用案内を読み、同意します。","verify":"当選者確認","s2":"観覧者情報入力","s2d":"収録当日の本人確認と観覧案内に使用する情報を入力してください。","name":"氏名","nationality":"国籍","birth":"生年月日","phone":"電話番号","contact":"観覧案内用メール","contactHint":"海外の電話番号ではSMSを受信できない場合があるため、メールも取得します。","notice":"収録日時点で<strong>満15歳以上</strong>の方のみ参加できます。当日は顔写真付きの有効な身分証明書が必要です。観覧権の譲渡・販売・名義変更はできません。","submit":"観覧者情報を登録","done":"登録完了","doneDesc":"観覧者情報が登録されました。最終案内は別途送信されます。","already":"すでに情報が登録されています。","missingIdentity":"メールアドレスとニックネームを入力してください。","consentNeeded":"個人情報の案内を読み、必須同意を行ってください。","mismatch":"当選者情報と一致しません。","rate":"リクエストが多すぎます。しばらくしてから再度お試しください。","session":"確認時間が終了しました。最初からやり直してください。","missing":"すべての必須項目を入力してください。","invalidEmail":"有効なメールアドレスを入力してください。","invalidPhone":"電話番号の形式を確認してください。","under15":"収録日時点で満15歳以上の方のみ参加できます。","network":"サーバーに接続できません。もう一度お試しください。","preview":"デザイン確認用プレビューでは情報は送信されません。"},"zh-TW":{"status":"正式登記","hero":"觀眾中獎者資訊登記","s1":"中獎者確認","s1d":"請輸入中獎 Muniverse 帳號的電子郵件與暱稱。","email":"Muniverse 註冊信箱","nick":"Muniverse 暱稱","privacyTitle":"個人資料蒐集與利用說明","privacy":"<dl class=\"privacy-grid\"><div><dt>蒐集與利用目的</dt><dd>確認觀眾中獎資格、本人確認及觀眾活動通知</dd></div><div><dt>蒐集項目</dt><dd>Muniverse 註冊信箱與暱稱、姓名、國籍、出生日期、聯絡電話、觀眾通知用電子郵件</dd></div><div><dt>保存與利用期間</dt><dd>觀眾身分確認及通知完成後，將立即刪除。</dd></div><div><dt>拒絕同意及其影響</dt><dd>您可拒絕同意，但若不同意，將限制中獎確認及觀眾登記。</dd></div></dl>","consent":"【必填】我已閱讀並同意個人資料蒐集與利用說明。","verify":"確認中獎者","s2":"填寫觀眾資料","s2d":"請填寫錄影當日本人確認與觀眾通知所需資料。","name":"姓名","nationality":"國籍","birth":"出生日期","phone":"聯絡電話","contact":"觀眾通知用電子郵件","contactHint":"海外號碼可能無法正常接收簡訊，因此同時蒐集電子郵件。","notice":"僅限錄影日已滿<strong>15歲</strong>者參加。當日須攜帶有效附照片身分證件，不得轉讓、販售或變更觀眾資格姓名。","submit":"完成觀眾資料登記","done":"登記完成","doneDesc":"觀眾資料已完成登記，最終通知將另行發送。","already":"資料已完成登記。","missingIdentity":"請輸入電子郵件與暱稱。","consentNeeded":"請閱讀並同意必要的個人資料說明。","mismatch":"資料與中獎者資訊不符。","rate":"請求過多，請稍後再試。","session":"驗證時間已過，請重新開始。","missing":"請填寫所有必要欄位。","invalidEmail":"請輸入有效的電子郵件地址。","invalidPhone":"請確認電話號碼格式。","under15":"錄影日須年滿15歲。","network":"無法連線伺服器，請重試。","preview":"設計預覽模式不會提交資料。"},"zh-CN":{"status":"正式登记","hero":"观众中奖者信息登记","s1":"中奖者确认","s1d":"请输入中奖 Muniverse 账号的邮箱与昵称。","email":"Muniverse 注册邮箱","nick":"Muniverse 昵称","privacyTitle":"个人信息收集与使用说明","privacy":"<dl class=\"privacy-grid\"><div><dt>收集与使用目的</dt><dd>确认观众中奖资格、本人核验及观众活动通知</dd></div><div><dt>收集项目</dt><dd>Muniverse 注册邮箱与昵称、姓名、国籍、出生日期、联系电话、观众通知用电子邮箱</dd></div><div><dt>保存与使用期限</dt><dd>观众身份确认及通知完成后，将及时删除。</dd></div><div><dt>拒绝同意及其影响</dt><dd>您可以拒绝同意，但若不同意，中奖确认及观众登记将受到限制。</dd></div></dl>","consent":"【必选】我已阅读并同意个人信息收集与使用说明。","verify":"确认中奖者","s2":"填写观众信息","s2d":"请填写录制当天身份核验及观众通知所需信息。","name":"姓名","nationality":"国籍","birth":"出生日期","phone":"联系电话","contact":"接收观众通知的邮箱","contactHint":"海外号码可能无法正常接收短信，因此同时收集电子邮箱。","notice":"仅限录制日年满<strong>15周岁</strong>者参加。当天须携带附照片的有效身份证件，不得转让、出售或更改观众资格姓名。","submit":"完成观众信息登记","done":"登记完成","doneDesc":"观众信息已完成登记，最终通知将另行发送。","already":"信息已完成登记。","missingIdentity":"请输入邮箱和昵称。","consentNeeded":"请阅读并同意必要的个人信息说明。","mismatch":"信息与中奖者记录不符。","rate":"请求过多，请稍后重试。","session":"验证时间已过，请重新开始。","missing":"请填写所有必填项目。","invalidEmail":"请输入有效的电子邮箱地址。","invalidPhone":"请确认电话号码格式。","under15":"录制日须年满15周岁。","network":"无法连接服务器，请重试。","preview":"设计预览模式不会提交信息。"}};
  const $ = (id) => document.getElementById(id);
  const state = { token: '', accountEmail: '', nickname: '', eventDate: RECORDING_DATE };
  const previewStep = new URLSearchParams(location.search).get('preview');

  const lang = () => COPY[$('lang')?.value] ? $('lang').value : 'en';
  const t = (key) => COPY[lang()][key];
  const setText = (id, value, html = false) => { const el = $(id); if (!el) return; html ? (el.innerHTML = value) : (el.textContent = value); };

  function applyLanguage() {
    document.documentElement.lang = lang();
    setText('statusBadge', t('status'));
    setText('heroTitle', t('hero'));
    setText('step1Title', t('s1'));
    setText('step1Desc', t('s1d'));
    setText('emailLabel', t('email'));
    setText('nicknameLabel', t('nick'));
    setText('privacyTitle', t('privacyTitle'));
    setText('privacyText', t('privacy'), true);
    setText('consentLabel', t('consent'));
    setText('verifyBtn', t('verify'));
    setText('step2Title', t('s2'));
    setText('step2Desc', t('s2d'));
    setText('nameLabel', t('name'));
    setText('nationalityLabel', t('nationality'));
    setText('birthLabel', t('birth'));
    setText('phoneLabel', t('phone'));
    setText('contactLabel', t('contact'));
    setText('contactHint', t('contactHint'));
    setText('noticeText', t('notice'), true);
    setText('submitBtn', t('submit'));
    setText('doneTitle', t('done'));
    setText('doneDesc', t('doneDesc'));
    setText('alreadyMessage', t('already'));
    window.dispatchEvent(new CustomEvent('attendee-language-change'));
  }

  function verifyReady() {
    const ready = Boolean($('consent')?.checked && $('email')?.value.trim() && $('nickname')?.value.trim());
    if ($('verifyBtn')) $('verifyBtn').disabled = !ready || state.busy === true;
  }

  function busy(button, on) {
    state.busy = on;
    button?.classList.toggle('busy', on);
    if (button) button.disabled = on;
  }

  async function call(action, payload) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(`${API}?action=${encodeURIComponent(action)}`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-cover-pick-request': '1',
          'x-request-id': crypto.randomUUID()
        },
        body: JSON.stringify(payload),
        cache: 'no-store',
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
        signal: controller.signal
      });
      let data = {};
      try { data = await response.json(); } catch {}
      return { response, data };
    } finally {
      clearTimeout(timeout);
    }
  }

  function errorText(code) {
    if (code === 'IDENTITY_MISMATCH' || code === 'WINNER_MISMATCH') return t('mismatch');
    if (code === 'RATE_LIMITED' || code === 'TOO_MANY_ATTEMPTS') return t('rate');
    if (code === 'CONSENT_REQUIRED') return t('consentNeeded');
    if (code === 'SESSION_EXPIRED' || code === 'SESSION_INVALID' || code === 'INVALID_SESSION') return t('session');
    if (code === 'UNDER_15') return t('under15');
    return t('network');
  }

  function showStep2() {
    document.body.classList.remove('already-state');
    $('step1')?.classList.add('hidden');
    $('step2')?.classList.remove('hidden');
    $('done')?.classList.add('hidden');
    $('already')?.classList.add('hidden');
    $('step2')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function showDone(already = false) {
    $('step1')?.classList.add('hidden');
    $('step2')?.classList.add('hidden');
    $('done')?.classList.toggle('hidden', already);
    $('already')?.classList.toggle('hidden', !already);
    document.body.classList.toggle('already-state', already);
    if (already) {
      setText('alreadyMessage', t('already'));
      $('already')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      setText('doneTitle', t('done'));
      setText('doneDesc', t('doneDesc'));
      $('done')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function validEmail(value) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); }

  function ageOnDate(birth, eventDate) {
    if (!birth || !eventDate || !/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) return NaN;
    const b = birth.split('-').map(Number);
    const e = eventDate.split('-').map(Number);
    if ([...b, ...e].some((n) => !Number.isFinite(n))) return NaN;
    let age = e[0] - b[0];
    if (e[1] < b[1] || (e[1] === b[1] && e[2] < b[2])) age--;
    return age;
  }

  async function verify() {
    const message = $('verifyMessage');
    if (message) message.textContent = '';
    const email = $('email')?.value.trim() || '';
    const nickname = $('nickname')?.value.trim() || '';
    if (!email || !nickname) { if (message) message.textContent = t('missingIdentity'); return; }
    if (!validEmail(email)) { if (message) message.textContent = t('invalidEmail'); return; }
    if (!$('consent')?.checked) { if (message) message.textContent = t('consentNeeded'); return; }

    busy($('verifyBtn'), true);
    try {
      const { response, data } = await call('verify', {
        email,
        nickname,
        privacy_consent: true,
        website: $('website')?.value || ''
      });
      if (data.code === 'ALREADY_SUBMITTED') { showDone(true); return; }
      if (!response.ok || !data.ok) { if (message) message.textContent = errorText(data.code); return; }
      state.token = data.verificationToken || data.token || '';
      state.accountEmail = email;
      state.nickname = nickname;
      state.eventDate = data.eventDate || RECORDING_DATE;
      if (!state.token) { if (message) message.textContent = t('network'); return; }
      if ($('contactEmail')) $('contactEmail').value = email;
      showStep2();
    } catch {
      if (message) message.textContent = t('network');
    } finally {
      busy($('verifyBtn'), false);
      verifyReady();
    }
  }

  async function submit() {
    const message = $('submitMessage');
    if (message) message.textContent = '';
    if (previewStep === 'step2') { if (message) message.textContent = t('preview'); return; }

    const contactValues = window.AttendeeFields?.values?.() || { nationality: $('nationality')?.value || '', phone: $('phone')?.value || '' };
    const fields = {
      name: $('name')?.value.trim() || '',
      nationality: contactValues.nationality || '',
      birth_date: $('birthDate')?.value || '',
      phone: contactValues.phone || '',
      contact_email: $('contactEmail')?.value.trim() || ''
    };

    if (!fields.name || !fields.nationality || !fields.birth_date || !fields.phone || !fields.contact_email) { if (message) message.textContent = t('missing'); return; }
    if (!validEmail(fields.contact_email)) { if (message) message.textContent = t('invalidEmail'); return; }
    if (!window.AttendeeFields?.valid?.()) { if (message) message.textContent = t('invalidPhone'); return; }
    const age = ageOnDate(fields.birth_date, state.eventDate || RECORDING_DATE);
    if (!Number.isFinite(age) || age < 15) { if (message) message.textContent = t('under15'); return; }

    busy($('submitBtn'), true);
    try {
      const { response, data } = await call('submit', {
        verification_token: state.token,
        token: state.token,
        privacy_consent: true,
        account_email: state.accountEmail,
        muniverse_nickname: state.nickname,
        website: $('website')?.value || '',
        ...fields
      });
      if (data.code === 'ALREADY_SUBMITTED') { showDone(true); return; }
      if (!response.ok || !data.ok) { if (message) message.textContent = errorText(data.code); return; }
      showDone(false);
    } catch {
      if (message) message.textContent = t('network');
    } finally {
      busy($('submitBtn'), false);
    }
  }

  function showPreview() {
    if (previewStep !== 'step2') return;
    state.accountEmail = 'preview@muniverse.io';
    state.nickname = 'DESIGN PREVIEW';
    state.eventDate = RECORDING_DATE;
    if ($('contactEmail')) $('contactEmail').value = state.accountEmail;
    showStep2();
    const note = document.createElement('p');
    note.className = 'preview-notice';
    note.textContent = t('preview');
    $('step2')?.insertBefore(note, $('step2')?.children[1] || null);
  }

  $('lang')?.addEventListener('change', applyLanguage);
  $('consent')?.addEventListener('change', verifyReady);
  $('email')?.addEventListener('input', verifyReady);
  $('nickname')?.addEventListener('input', verifyReady);
  $('verifyBtn')?.addEventListener('click', verify);
  $('submitBtn')?.addEventListener('click', submit);
  window.addEventListener('attendee-fields-change', () => { if ($('submitMessage')) $('submitMessage').textContent = ''; });

  applyLanguage();
  verifyReady();
  showPreview();
})();
