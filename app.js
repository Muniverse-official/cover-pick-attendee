(() => {
  'use strict';

  const API = 'https://tcxugltvmatbgsmcepso.supabase.co/functions/v1/cover-pick';
  const $ = (id) => document.getElementById(id);

  const T = {
    ko: {
      test:'테스트 모드', hero:'방청 당첨자 정보 등록', s1:'당첨자 확인',
      s1d:'현재 테스트 모드입니다. 아무 이메일과 닉네임으로 확인할 수 있습니다.',
      email:'Muniverse 가입 이메일', nick:'Muniverse 닉네임',
      consent:'[필수] 아래 개인정보 수집·이용 안내를 확인했으며 이에 동의합니다.',
      privacyTitle:'개인정보 수집 범위 및 이용 안내', verify:'확인 후 다음', verified:'확인되었습니다.',
      missingIdentity:'이메일과 닉네임을 모두 입력해 주세요.', consentNeeded:'개인정보 수집·이용 동의가 필요합니다.',
      network:'서버 연결에 실패했습니다. 다시 시도해 주세요.',
      s2:'방청자 정보 입력', s2d:'녹화 당일 본인 확인과 방청 안내에 사용할 정보를 입력합니다.',
      name:'이름', nationality:'국적', birth:'생년월일', phone:'연락처', contact:'방청 안내용 이메일',
      hint:'해외 번호는 문자 수신이 어려울 수 있어 이메일도 함께 수집합니다.',
      notice:'만 15세 이상만 참여할 수 있습니다. 녹화 당일 유효한 신분증 지참이 필수이며, 방청권 양도·판매·명의 변경은 불가합니다.',
      submit:'제출 테스트', missing:'모든 항목을 입력해 주세요.', under15:'만 15세 이상만 방청할 수 있습니다.',
      done:'테스트 등록이 완료되었습니다.', doneDesc:'현재 테스트 모드이므로 입력 정보는 저장되지 않았습니다.'
    },
    ja: {
      test:'テストモード', hero:'観覧当選者 情報登録', s1:'当選者確認',
      s1d:'現在テストモードです。任意のメールアドレスとニックネームで確認できます。',
      email:'Muniverse登録メールアドレス', nick:'Muniverseニックネーム',
      consent:'【必須】以下の個人情報の取得・利用に関する案内を確認し、同意します。',
      privacyTitle:'取得する個人情報の範囲・利用案内', verify:'確認して次へ', verified:'確認しました。',
      missingIdentity:'メールアドレスとニックネームを入力してください。', consentNeeded:'個人情報の取得・利用への同意が必要です。',
      network:'サーバーに接続できません。もう一度お試しください。',
      s2:'観覧者情報入力', s2d:'収録当日の本人確認と観覧案内に使用する情報を入力してください。',
      name:'氏名', nationality:'国籍', birth:'生年月日', phone:'電話番号', contact:'観覧案内用メール',
      hint:'海外SMSを受信できない場合に備え、メールアドレスも取得します。',
      notice:'満15歳以上の方のみ参加できます。収録当日は有効な身分証明書が必要です。観覧権の譲渡・販売・名義変更はできません。',
      submit:'テスト送信', missing:'すべての項目を入力してください。', under15:'満15歳以上の方のみ観覧できます。',
      done:'テスト登録完了', doneDesc:'テストモードのため入力情報は保存されていません。'
    },
    en: {
      test:'TEST MODE', hero:'Audience winner registration', s1:'Verify winner',
      s1d:'Test mode is active. Any email and nickname can be verified.',
      email:'Muniverse account email', nick:'Muniverse nickname',
      consent:'[Required] I have reviewed and agree to the privacy collection and use notice below.',
      privacyTitle:'Personal data scope & privacy notice', verify:'Verify & Continue', verified:'Verified.',
      missingIdentity:'Enter both email and nickname.', consentNeeded:'Privacy consent is required.',
      network:'Could not connect to the server. Please try again.',
      s2:'Attendee information', s2d:'Enter information used for identity verification and audience notices.',
      name:'Full name', nationality:'Nationality', birth:'Date of birth', phone:'Phone number', contact:'Email for event notices',
      hint:'Email is also collected as a fallback where international SMS may not be delivered.',
      notice:'Participants must be at least 15 years old. Bring a valid photo ID on the recording day. Transfer, resale, and name changes are not allowed.',
      submit:'Test submit', missing:'Complete all fields.', under15:'Only participants aged 15 or older may attend.',
      done:'Test registration complete', doneDesc:'No information was stored because test mode is active.'
    },
    'zh-TW': {
      test:'測試模式', hero:'現場觀眾中獎者資訊登記', s1:'中獎者驗證',
      s1d:'目前為測試模式，可使用任意信箱與暱稱驗證。',
      email:'Muniverse 註冊信箱', nick:'Muniverse 暱稱',
      consent:'【必填】我已閱讀並同意下列個人資料蒐集、處理及利用說明。',
      privacyTitle:'個人資料蒐集範圍與利用說明', verify:'驗證並繼續', verified:'驗證成功。',
      missingIdentity:'請輸入信箱與暱稱。', consentNeeded:'必須同意個人資料蒐集及利用。',
      network:'無法連線伺服器，請重試。',
      s2:'填寫觀眾資訊', s2d:'請填寫用於錄影當日身分確認及觀眾通知的資料。',
      name:'姓名', nationality:'國籍', birth:'出生日期', phone:'聯絡電話', contact:'觀眾通知用電子郵件',
      hint:'海外簡訊可能無法正常收取，因此亦蒐集電子郵件。',
      notice:'僅限年滿15歲者參加。錄影當天須攜帶有效身分證件。觀眾資格不得轉讓、出售或變更姓名。',
      submit:'測試提交', missing:'請填寫所有欄位。', under15:'僅限年滿15歲者參加。',
      done:'測試登記完成', doneDesc:'測試模式下資訊未被儲存。'
    },
    'zh-CN': {
      test:'测试模式', hero:'现场观众中奖者信息登记', s1:'中奖者验证',
      s1d:'当前为测试模式，可使用任意邮箱和昵称验证。',
      email:'Muniverse 注册邮箱', nick:'Muniverse 昵称',
      consent:'【必选】我已阅读并同意下列个人信息收集、处理及使用说明。',
      privacyTitle:'个人信息收集范围及使用说明', verify:'验证并继续', verified:'验证成功。',
      missingIdentity:'请输入邮箱和昵称。', consentNeeded:'必须同意个人信息收集及使用。',
      network:'无法连接服务器，请重试。',
      s2:'填写观众信息', s2d:'请填写用于录制当天身份核验及观众通知的信息。',
      name:'姓名', nationality:'国籍', birth:'出生日期', phone:'联系电话', contact:'接收观众通知的邮箱',
      hint:'海外短信可能无法正常接收，因此同时收集电子邮箱。',
      notice:'仅限年满15周岁者参加。录制当天须携带有效身份证件。观众资格不得转让、出售或更改姓名。',
      submit:'测试提交', missing:'请填写所有项目。', under15:'仅限年满15周岁者参加。',
      done:'测试登记完成', doneDesc:'测试模式下信息未被保存。'
    }
  };

  const PRIVACY = {
    ko: `
      <div class="privacy-mode">현재 테스트 모드에서는 입력 정보가 DB에 저장되거나 이메일로 발송되지 않습니다.</div>
      <div class="privacy-law">대한민국 개인정보 보호법 제15조·제16조 기준 안내</div>
      <dl class="privacy-grid">
        <div><dt>수집·이용 목적</dt><dd>당첨자 계정 확인, 방청자 등록, 연령·본인 확인, 방청 안내 및 최종 방청 명단 운영</dd></div>
        <div><dt>수집 범위</dt><dd><b>1단계</b> Muniverse 가입 이메일, 닉네임<br><b>2단계</b> 이름, 국적, 생년월일, 휴대전화번호, 방청 안내용 이메일</dd></div>
        <div><dt>업무상 접근 범위</dt><dd>Muniverse 운영 담당자 및 현장 입장 확인을 담당하는 it’s Live 제작·업무 담당자 중 필요한 인원</dd></div>
        <div><dt>처리 위치</dt><dd>대한민국(운영 DB 서울 리전). 실제 메일 발송 서비스가 활성화될 경우 해당 처리업체·국가를 별도 고지합니다.</dd></div>
        <div><dt>보유 기간</dt><dd>행사 종료일(2026-09-14)로부터 최대 30일 이내 파기 예정. 법령상 별도 보존 의무가 있는 경우 해당 기간 적용</dd></div>
        <div><dt>동의 거부</dt><dd>동의를 거부할 수 있으나, 필수 정보 수집에 동의하지 않으면 방청자 등록을 진행할 수 없습니다.</dd></div>
        <div><dt>문의·권리 행사</dt><dd>열람·정정·삭제 등 요청: support@muniverse.io</dd></div>
      </dl>
      <p class="privacy-footnote">표시 언어는 편의를 위한 것이며 실제 적용 법령은 거주지·처리 상황에 따라 달라질 수 있습니다.</p>`,
    ja: `
      <div class="privacy-mode">現在のテストモードでは、入力情報はDBに保存されず、メール送信も行われません。</div>
      <div class="privacy-law">日本：個人情報保護法（APPI）に基づく利用目的の明示・必要最小限の取扱いを前提とした案内</div>
      <dl class="privacy-grid">
        <div><dt>利用目的</dt><dd>当選アカウントの確認、観覧者登録、年齢・本人確認、観覧案内、最終観覧者リストの運用</dd></div>
        <div><dt>取得範囲</dt><dd><b>Step 1</b> Muniverse登録メールアドレス、ニックネーム<br><b>Step 2</b> 氏名、国籍、生年月日、電話番号、観覧案内用メール</dd></div>
        <div><dt>利用・閲覧者</dt><dd>Muniverse運営担当者、および入場確認を担当するit’s Live制作・業務担当者のうち必要な者</dd></div>
        <div><dt>処理地域</dt><dd>大韓民国（運用DB：ソウルリージョン）。本番でメール配信事業者を利用する場合は、事業者・処理国を別途明示します。</dd></div>
        <div><dt>保存期間</dt><dd>イベント終了日（2026-09-14）から最大30日以内に削除予定。法令上の保存義務がある場合を除きます。</dd></div>
        <div><dt>提供しない場合</dt><dd>提供は拒否できますが、必須情報を提供しない場合は観覧者登録を完了できません。</dd></div>
        <div><dt>問い合わせ・請求</dt><dd>開示・訂正・削除等：support@muniverse.io</dd></div>
      </dl>
      <p class="privacy-footnote">表示言語は便宜上のものです。適用法令は居住地・処理状況等により異なる場合があります。</p>`,
    en: `
      <div class="privacy-mode">In TEST MODE, entered data is not stored in the database or sent by email.</div>
      <div class="privacy-law">International notice — structured to cover GDPR Article 13 transparency items where applicable</div>
      <dl class="privacy-grid">
        <div><dt>Controller / contact</dt><dd>Muniverse · support@muniverse.io</dd></div>
        <div><dt>Purpose</dt><dd>Winner-account verification, attendee registration, age/identity verification, event communications, and final attendee-list operations</dd></div>
        <div><dt>Data collected</dt><dd><b>Step 1</b> Muniverse account email and nickname<br><b>Step 2</b> full name, nationality, date of birth, mobile number, contact email</dd></div>
        <div><dt>Access / recipients</dt><dd>Authorized Muniverse operations staff and the minimum it’s Live production/operations personnel required for on-site identity and entry checks</dd></div>
        <div><dt>Processing location</dt><dd>Republic of Korea (operational database: Seoul region). Any production email provider and its processing country will be disclosed before activation.</dd></div>
        <div><dt>Retention</dt><dd>Planned deletion within 30 days after the event date (2026-09-14), unless a longer period is legally required</dd></div>
        <div><dt>Your choice & rights</dt><dd>You may refuse or withdraw consent; however, required-data refusal prevents attendee registration. Where applicable, you may request access, correction or deletion via support@muniverse.io.</dd></div>
      </dl>
      <p class="privacy-footnote">Display language does not determine governing law. Applicable privacy law depends on your location/residence and the actual processing context.</p>`,
    'zh-TW': `
      <div class="privacy-mode">目前為測試模式，輸入資料不會儲存至DB，也不會寄送電子郵件。</div>
      <div class="privacy-law">臺灣個人資料保護法第8條告知事項格式</div>
      <dl class="privacy-grid">
        <div><dt>蒐集機關／聯絡方式</dt><dd>Muniverse · support@muniverse.io</dd></div>
        <div><dt>蒐集目的</dt><dd>中獎帳號確認、觀眾登記、年齡與本人核驗、觀眾通知及最終名單管理</dd></div>
        <div><dt>個人資料類別／範圍</dt><dd><b>第1步</b> Muniverse註冊信箱、暱稱<br><b>第2步</b> 姓名、國籍、出生日期、手機號碼、觀眾通知用電子郵件</dd></div>
        <div><dt>利用期間、地區、對象及方式</dt><dd>活動運作期間；處理地區為韓國（首爾區域）。僅由Muniverse授權人員及現場入場核驗所必要的it’s Live製作／業務人員，以活動營運所需方式使用。</dd></div>
        <div><dt>保存期間</dt><dd>預計於活動結束日（2026-09-14）後最長30日內刪除；法律另有保存義務者除外。</dd></div>
        <div><dt>您的權利</dt><dd>得依個資法請求查詢、閱覽、複製、補充／更正、停止蒐集處理利用及刪除。聯絡：support@muniverse.io</dd></div>
        <div><dt>不提供之影響</dt><dd>您可選擇不提供，但未提供必要資料將無法完成觀眾登記。</dd></div>
      </dl>
      <p class="privacy-footnote">顯示語言僅供閱讀便利；實際適用法律仍依居住地及實際處理情況判斷。</p>`,
    'zh-CN': `
      <div class="privacy-mode">当前为测试模式，输入信息不会保存至数据库，也不会发送电子邮件。</div>
      <div class="privacy-law">中国大陆用户：参照《个人信息保护法》第6条、第17条的信息告知要求</div>
      <dl class="privacy-grid">
        <div><dt>个人信息处理者／联系方式</dt><dd>Muniverse · support@muniverse.io</dd></div>
        <div><dt>处理目的</dt><dd>中奖账号核验、观众登记、年龄与本人身份核验、观众通知及最终名单管理</dd></div>
        <div><dt>处理信息种类／范围</dt><dd><b>第1步</b> Muniverse注册邮箱、昵称<br><b>第2步</b> 姓名、国籍、出生日期、手机号码、观众通知邮箱</dd></div>
        <div><dt>处理方式与保存期限</dt><dd>仅用于上述活动运营目的；计划在活动结束日（2026-09-14）后最长30日内删除，法律另有保存义务的除外。</dd></div>
        <div><dt>处理地点／境外处理</dt><dd>运营数据库位于韩国（首尔区域）。如适用中国大陆《个人信息保护法》的跨境提供规则，正式运营前将另行完成所需的境外提供告知、单独同意及其他法定程序。</dd></div>
        <div><dt>接触人员范围</dt><dd>Muniverse授权运营人员，以及现场身份与入场核验所必需的it’s Live制作／业务人员。</dd></div>
        <div><dt>您的权利与拒绝后果</dt><dd>可依法行使知情、决定、限制／拒绝、查阅、复制、更正、删除等权利。拒绝提供必要信息将无法完成观众登记。联系：support@muniverse.io</dd></div>
      </dl>
      <p class="privacy-footnote">显示语言不等于适用法律；实际适用规则取决于您的所在地／居住地及实际处理情形。</p>`
  };

  let lang = localStorage.getItem('cover_pick_lang') || 'ko';
  if (!T[lang]) lang = 'ko';

  function tr(key) { return T[lang][key] || T.en[key] || key; }
  function setText(id, key) { $(id).textContent = tr(key); }

  function render() {
    document.documentElement.lang = lang;
    $('lang').value = lang;
    setText('testBadge','test'); setText('heroTitle','hero');
    setText('step1Title','s1'); setText('step1Desc','s1d');
    setText('emailLabel','email'); setText('nicknameLabel','nick'); setText('consentLabel','consent');
    setText('privacyTitle','privacyTitle'); $('privacyText').innerHTML = PRIVACY[lang] || PRIVACY.en; setText('verifyBtn','verify');
    setText('step2Title','s2'); setText('step2Desc','s2d'); setText('nameLabel','name');
    setText('nationalityLabel','nationality'); setText('birthLabel','birth'); setText('phoneLabel','phone');
    setText('contactLabel','contact'); setText('contactHint','hint'); setText('noticeText','notice'); setText('submitBtn','submit');
    setText('doneTitle','done'); setText('doneDesc','doneDesc');
  }

  async function call(action, payload) {
    const response = await fetch(`${API}?action=${encodeURIComponent(action)}`, {
      method: 'POST',
      headers: {'content-type':'application/json','x-cover-pick-request':'1'},
      body: JSON.stringify(payload),
      cache: 'no-store', credentials: 'omit', referrerPolicy: 'no-referrer'
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok) throw new Error(data.code || 'API_ERROR');
    return data;
  }

  function setMessage(id, text, isError=false) {
    const el = $(id);
    el.textContent = text || '';
    el.classList.toggle('error', isError);
  }

  function ageOnRecordingDay(dateString) {
    if (!dateString) return -1;
    const birth = new Date(`${dateString}T00:00:00Z`);
    if (Number.isNaN(birth.getTime())) return -1;
    const event = new Date('2026-09-14T00:00:00Z');
    let age = event.getUTCFullYear() - birth.getUTCFullYear();
    const month = event.getUTCMonth() - birth.getUTCMonth();
    if (month < 0 || (month === 0 && event.getUTCDate() < birth.getUTCDate())) age--;
    return age;
  }

  $('lang').addEventListener('change', (e) => {
    lang = e.target.value;
    localStorage.setItem('cover_pick_lang', lang);
    render();
  });

  $('verifyBtn').addEventListener('click', async () => {
    const email = $('email').value.trim();
    const nickname = $('nickname').value.trim();
    if (!email || !nickname) return setMessage('verifyMessage', tr('missingIdentity'), true);
    if (!$('consent').checked) return setMessage('verifyMessage', tr('consentNeeded'), true);

    const btn = $('verifyBtn');
    btn.classList.add('busy'); btn.disabled = true; setMessage('verifyMessage','');
    try {
      await call('verify', {email, nickname});
      setMessage('verifyMessage', tr('verified'));
      $('contactEmail').value = email;
      $('step1').classList.add('hidden');
      $('step2').classList.remove('hidden');
      window.scrollTo({top:0, behavior:'smooth'});
    } catch (_) {
      setMessage('verifyMessage', tr('network'), true);
    } finally {
      btn.classList.remove('busy'); btn.disabled = false;
    }
  });

  $('submitBtn').addEventListener('click', async () => {
    const payload = {
      name: $('name').value.trim(), nationality: $('nationality').value.trim(),
      birth_date: $('birthDate').value, phone: $('phone').value.trim(), contact_email: $('contactEmail').value.trim()
    };
    if (Object.values(payload).some(v => !v)) return setMessage('submitMessage', tr('missing'), true);
    if (ageOnRecordingDay(payload.birth_date) < 15) return setMessage('submitMessage', tr('under15'), true);

    const btn = $('submitBtn');
    btn.classList.add('busy'); btn.disabled = true; setMessage('submitMessage','');
    try {
      await call('submit', payload);
      $('step2').classList.add('hidden'); $('done').classList.remove('hidden');
      window.scrollTo({top:0, behavior:'smooth'});
    } catch (_) {
      setMessage('submitMessage', tr('network'), true);
    } finally {
      btn.classList.remove('busy'); btn.disabled = false;
    }
  });

  render();
})();
