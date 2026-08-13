(() => {
  'use strict';

  const API = 'https://tcxugltvmatbgsmcepso.supabase.co/functions/v1/cover-pick';
  const RECORDING_DATE = '2026-09-14';
  const $ = (id) => document.getElementById(id);

  let verificationToken = '';
  let isVerifying = false;
  let isSubmitting = false;

  const T = {
    ko: {
      status:'공식 등록', hero:'방청 당첨자 정보 등록', s1:'당첨자 확인',
      s1d:'당첨된 Muniverse 계정의 가입 이메일과 닉네임을 입력해 주세요.',
      email:'Muniverse 가입 이메일', nick:'Muniverse 닉네임',
      consent:'개인정보 수집·이용 안내를 읽고 동의합니다. (필수)',
      privacyTitle:'개인정보 수집·이용 동의 안내 (필수)', verify:'동의하고 당첨자 확인', verified:'당첨자 확인이 완료되었습니다.',
      missingIdentity:'이메일과 닉네임을 모두 입력해 주세요.', consentNeeded:'개인정보 수집·이용 안내를 확인하고 필수 동의에 체크해 주세요.',
      identityMismatch:'당첨자 정보와 일치하지 않습니다.', duplicate:'이미 방청자 정보 등록이 완료되었습니다.', sessionExpired:'확인 시간이 만료되었습니다. 처음부터 다시 진행해 주세요.', rateLimited:'요청이 많습니다. 잠시 후 다시 시도해 주세요.',
      network:'서버 연결에 실패했습니다. 다시 시도해 주세요.',
      s2:'방청자 정보 입력', s2d:'녹화 당일 본인 확인과 방청 안내에 사용할 정보를 입력합니다.',
      name:'이름', nationality:'국적', birth:'생년월일', phone:'연락처', contact:'방청 안내용 이메일',
      hint:'해외 번호는 문자 수신이 어려울 수 있어 이메일도 함께 수집합니다.',
      notice:'만 15세 이상만 참여할 수 있습니다. 녹화 당일 사진이 부착된 유효한 신분증 지참이 필수이며, 방청권 양도·판매·명의 변경은 불가합니다.',
      submit:'방청자 정보 등록 완료', missing:'모든 항목을 입력해 주세요.', invalidEmail:'올바른 이메일 주소를 입력해 주세요.', under15:'녹화일 기준 만 15세 이상만 방청할 수 있습니다.',
      done:'방청자 정보 등록이 완료되었습니다.', doneDesc:'등록한 연락처 또는 이메일로 최종 방청 안내가 별도 발송됩니다.'
    },
    ja: {
      status:'公式登録', hero:'観覧当選者 情報登録', s1:'当選者確認',
      s1d:'当選したMuniverseアカウントの登録メールアドレスとニックネームを入力してください。',
      email:'Muniverse登録メールアドレス', nick:'Muniverseニックネーム',
      consent:'個人情報の取得・利用に関する案内を読み、同意します。（必須）',
      privacyTitle:'個人情報の取得・利用に関する同意（必須）', verify:'同意して当選者を確認', verified:'当選者確認が完了しました。',
      missingIdentity:'メールアドレスとニックネームを入力してください。', consentNeeded:'個人情報の案内を確認し、必須同意にチェックしてください。',
      identityMismatch:'当選者情報と一致しません。', duplicate:'観覧者情報はすでに登録済みです。', sessionExpired:'確認時間が終了しました。最初からやり直してください。', rateLimited:'リクエストが多すぎます。しばらくしてからお試しください。',
      network:'サーバーに接続できません。もう一度お試しください。',
      s2:'観覧者情報入力', s2d:'収録当日の本人確認と観覧案内に使用する情報を入力してください。',
      name:'氏名', nationality:'国籍', birth:'生年月日', phone:'電話番号', contact:'観覧案内用メール',
      hint:'海外SMSを受信できない場合に備え、メールアドレスも取得します。',
      notice:'満15歳以上の方のみ参加できます。収録当日は顔写真付きの有効な身分証明書が必要です。観覧権の譲渡・販売・名義変更はできません。',
      submit:'観覧者情報を登録', missing:'すべての項目を入力してください。', invalidEmail:'有効なメールアドレスを入力してください。', under15:'収録日時点で満15歳以上の方のみ観覧できます。',
      done:'観覧者情報の登録が完了しました。', doneDesc:'最終の観覧案内は、登録した連絡先またはメールアドレスへ別途送付します。'
    },
    en: {
      status:'OFFICIAL REGISTRATION', hero:'Audience winner registration', s1:'Verify winner',
      s1d:'Enter the email and nickname of the Muniverse account that won the attendance entry.',
      email:'Muniverse account email', nick:'Muniverse nickname',
      consent:'I have read and agree to the personal data collection and use notice above. (Required)',
      privacyTitle:'Required personal data collection & use consent', verify:'Agree & Verify Winner', verified:'Winner verification complete.',
      missingIdentity:'Enter both email and nickname.', consentNeeded:'Review the privacy notice and check the required consent box.',
      identityMismatch:'The information does not match a winner record.', duplicate:'Attendee information has already been registered.', sessionExpired:'Your verification session has expired. Please start again.', rateLimited:'Too many requests. Please try again shortly.',
      network:'Could not connect to the server. Please try again.',
      s2:'Attendee information', s2d:'Enter information used for identity verification and audience notices.',
      name:'Full name', nationality:'Nationality', birth:'Date of birth', phone:'Phone number', contact:'Email for event notices',
      hint:'Email is also collected as a fallback where international SMS may not be delivered.',
      notice:'Participants must be at least 15 years old. Bring a valid photo ID on the recording day. Transfer, resale, and name changes are not allowed.',
      submit:'Complete Attendee Registration', missing:'Complete all fields.', invalidEmail:'Enter a valid email address.', under15:'You must be at least 15 years old on the recording date.',
      done:'Attendee registration complete.', doneDesc:'Final attendance instructions will be sent separately to the contact information or email you registered.'
    },
    'zh-TW': {
      status:'正式登記', hero:'現場觀眾中獎者資訊登記', s1:'中獎者驗證',
      s1d:'請輸入中獎之Muniverse帳號的註冊信箱與暱稱。',
      email:'Muniverse 註冊信箱', nick:'Muniverse 暱稱',
      consent:'我已閱讀並同意上述個人資料蒐集與利用說明。（必填）',
      privacyTitle:'個人資料蒐集與利用同意說明（必填）', verify:'同意並驗證中獎者', verified:'中獎者驗證完成。',
      missingIdentity:'請輸入信箱與暱稱。', consentNeeded:'請閱讀個人資料說明並勾選必填同意項目。',
      identityMismatch:'與中獎者資料不符。', duplicate:'觀眾資訊已完成登記。', sessionExpired:'驗證時間已逾期，請重新開始。', rateLimited:'請求過多，請稍後再試。',
      network:'無法連線伺服器，請重試。',
      s2:'填寫觀眾資訊', s2d:'請填寫用於錄影當日身分確認及觀眾通知的資料。',
      name:'姓名', nationality:'國籍', birth:'出生日期', phone:'聯絡電話', contact:'觀眾通知用電子郵件',
      hint:'海外簡訊可能無法正常收取，因此亦蒐集電子郵件。',
      notice:'僅限錄影日年滿15歲者參加。錄影當天須攜帶附照片的有效身分證件。觀眾資格不得轉讓、出售或變更姓名。',
      submit:'完成觀眾資訊登記', missing:'請填寫所有欄位。', invalidEmail:'請輸入有效的電子郵件地址。', under15:'錄影日須年滿15歲方可參加。',
      done:'觀眾資訊登記完成。', doneDesc:'最終觀眾通知將另行寄送至您登記的聯絡方式或電子郵件。'
    },
    'zh-CN': {
      status:'正式登记', hero:'现场观众中奖者信息登记', s1:'中奖者验证',
      s1d:'请输入中奖Muniverse账号的注册邮箱和昵称。',
      email:'Muniverse 注册邮箱', nick:'Muniverse 昵称',
      consent:'我已阅读并同意上述个人信息收集与使用说明。（必选）',
      privacyTitle:'个人信息收集与使用同意说明（必选）', verify:'同意并验证中奖者', verified:'中奖者验证完成。',
      missingIdentity:'请输入邮箱和昵称。', consentNeeded:'请阅读个人信息说明并勾选必选同意项。',
      identityMismatch:'与中奖者信息不符。', duplicate:'观众信息已完成登记。', sessionExpired:'验证时间已过期，请重新开始。', rateLimited:'请求过多，请稍后重试。',
      network:'无法连接服务器，请重试。',
      s2:'填写观众信息', s2d:'请填写用于录制当天身份核验及观众通知的信息。',
      name:'姓名', nationality:'国籍', birth:'出生日期', phone:'联系电话', contact:'接收观众通知的邮箱',
      hint:'海外短信可能无法正常接收，因此同时收集电子邮箱。',
      notice:'仅限录制日年满15周岁者参加。录制当天须携带附照片的有效身份证件。观众资格不得转让、出售或更改姓名。',
      submit:'完成观众信息登记', missing:'请填写所有项目。', invalidEmail:'请输入有效的电子邮箱地址。', under15:'录制日须年满15周岁方可参加。',
      done:'观众信息登记完成。', doneDesc:'最终观众通知将另行发送至您登记的联系方式或电子邮箱。'
    }
  };

  const PRIVACY = {
    ko: `
      <div class="privacy-mode">본 페이지에 입력한 개인정보는 COVER PICK 방청자 등록 및 운영을 위해 실제로 저장·처리됩니다.</div>
      <div class="privacy-law">개인정보 보호법 제15조에 따른 수집·이용 동의 안내</div>
      <dl class="privacy-grid">
        <div><dt>처리 주체</dt><dd>Muniverse 운영사(서비스 개인정보처리방침에 따른 개인정보처리자)</dd></div>
        <div><dt>수집·이용 목적</dt><dd>당첨 계정 확인, 방청자 등록, 연령·본인 확인, 방청 안내, 현장 입장 확인, 문의 및 분쟁 대응</dd></div>
        <div><dt>수집 항목</dt><dd>Muniverse 가입 이메일, 닉네임, 이름, 국적, 생년월일, 휴대전화번호, 방청 안내용 이메일</dd></div>
        <div><dt>보유·이용 기간</dt><dd>녹화일(2026-09-14)로부터 30일인 2026-10-14까지 보유 후 지체 없이 파기합니다. 단, 관계 법령에 별도 보존 의무가 있는 경우 해당 기간을 따릅니다.</dd></div>
        <div><dt>업무 처리·접근</dt><dd>방청 운영에 필요한 범위에서 Muniverse 운영 담당자 및 it’s Live/MBC 방청 운영 담당자가 접근할 수 있습니다. 서버 검증·등록에는 Supabase, 운영 명단 저장 및 안내 메일 처리에는 Google Sheets·Apps Script·Mail 서비스가 사용됩니다.</dd></div>
        <div><dt>국외 처리 가능성</dt><dd>Google의 글로벌 서비스 이용 과정에서 개인정보가 국외에서 처리될 수 있으며, 관련 사항은 Muniverse 개인정보처리방침 및 적용 법령에 따릅니다.</dd></div>
        <div><dt>신분증 확인</dt><dd>녹화 당일 현장에서 사진이 부착된 유효한 신분증을 확인하며, 본 페이지에서는 신분증 사본 또는 신분증 번호를 수집하지 않습니다.</dd></div>
        <div><dt>동의 거부</dt><dd>동의를 거부할 권리가 있으나, 필수 개인정보 수집·이용에 동의하지 않으면 방청자 등록 및 입장 확인을 진행할 수 없습니다.</dd></div>
        <div><dt>문의·권리 행사</dt><dd>개인정보 열람·정정·삭제 및 문의: support@muniverse.io</dd></div>
      </dl>
      <p class="privacy-footnote">본 동의는 COVER PICK 방청 등록을 위한 별도 안내이며, 그 밖의 개인정보 처리는 Muniverse 개인정보처리방침이 함께 적용됩니다.</p>`,
    ja: `
      <div class="privacy-mode">本ページに入力した個人情報は、COVER PICKの観覧者登録・運営のため実際に保存・処理されます。</div>
      <div class="privacy-law">観覧者登録に必要な個人情報の取得・利用に関する同意</div>
      <dl class="privacy-grid">
        <div><dt>取扱主体</dt><dd>Muniverse運営者（サービスのプライバシーポリシーに定める個人情報取扱者）</dd></div>
        <div><dt>利用目的</dt><dd>当選アカウント確認、観覧者登録、年齢・本人確認、観覧案内、当日の入場確認、お問い合わせ・紛争対応</dd></div>
        <div><dt>取得項目</dt><dd>Muniverse登録メールアドレス、ニックネーム、氏名、国籍、生年月日、携帯電話番号、観覧案内用メール</dd></div>
        <div><dt>保存期間</dt><dd>収録日（2026-09-14）から30日後の2026-10-14まで保存し、その後速やかに削除します。法令上の保存義務がある場合はその期間に従います。</dd></div>
        <div><dt>業務上の利用</dt><dd>必要な範囲でMuniverse運営担当者およびit’s Live/MBCの観覧運営担当者がアクセスする場合があります。サーバー処理にSupabase、運営リスト保存・メール処理にGoogle Sheets、Apps Script、Mailを使用します。</dd></div>
        <div><dt>国外処理</dt><dd>Googleのグローバルサービス利用に伴い、個人情報が国外で処理される場合があります。詳細はMuniverseのプライバシーポリシーおよび適用法令に従います。</dd></div>
        <div><dt>身分証確認</dt><dd>収録当日に顔写真付きの有効な身分証明書を現地で確認します。本ページでは身分証のコピーや番号は取得しません。</dd></div>
        <div><dt>同意の拒否</dt><dd>同意を拒否できますが、必須情報の取得・利用に同意しない場合、観覧者登録および入場確認を行うことができません。</dd></div>
        <div><dt>お問い合わせ</dt><dd>開示・訂正・削除等：support@muniverse.io</dd></div>
      </dl>
      <p class="privacy-footnote">本同意はCOVER PICK観覧登録のための個別案内であり、その他の取扱いにはMuniverseのプライバシーポリシーも適用されます。</p>`,
    en: `
      <div class="privacy-mode">Personal data entered on this page is actually stored and processed to operate COVER PICK audience registration.</div>
      <div class="privacy-law">Required consent for personal data collection and use for audience registration</div>
      <dl class="privacy-grid">
        <div><dt>Data controller</dt><dd>The Muniverse operator identified in the service Privacy Policy</dd></div>
        <div><dt>Purpose</dt><dd>Winner-account verification, attendee registration, age and identity checks, event communications, on-site entry verification, and handling inquiries or disputes</dd></div>
        <div><dt>Data collected</dt><dd>Muniverse account email, nickname, full name, nationality, date of birth, mobile number, and email for event notices</dd></div>
        <div><dt>Retention</dt><dd>Until 2026-10-14, 30 days after the recording date (2026-09-14), then deleted without undue delay unless a longer period is required by applicable law.</dd></div>
        <div><dt>Operational access</dt><dd>Access is limited to personnel who need it for audience operations, including Muniverse and it’s Live/MBC audience-operation staff. Supabase is used for server-side verification and registration, and Google Sheets, Apps Script and Mail services are used for the operating list and notification email processing.</dd></div>
        <div><dt>International processing</dt><dd>Use of Google’s global services may involve processing outside your country. Applicable transfers and safeguards are handled under the Muniverse Privacy Policy and applicable law.</dd></div>
        <div><dt>ID check</dt><dd>A valid photo ID is checked on site on the recording day. This page does not collect a copy of your ID or government ID number.</dd></div>
        <div><dt>Right to refuse</dt><dd>You may refuse consent, but required attendee registration and entry verification cannot be provided without the required data.</dd></div>
        <div><dt>Privacy requests</dt><dd>Access, correction, deletion and privacy inquiries: support@muniverse.io</dd></div>
      </dl>
      <p class="privacy-footnote">This consent applies specifically to COVER PICK audience registration. The Muniverse Privacy Policy also applies to other processing activities.</p>`,
    'zh-TW': `
      <div class="privacy-mode">本頁輸入的個人資料會實際儲存並處理，以進行COVER PICK觀眾登記與營運。</div>
      <div class="privacy-law">觀眾登記所需個人資料蒐集與利用同意說明</div>
      <dl class="privacy-grid">
        <div><dt>處理主體</dt><dd>Muniverse服務隱私權政策所載之營運主體</dd></div>
        <div><dt>利用目的</dt><dd>中獎帳號確認、觀眾登記、年齡與身分核驗、觀眾通知、現場入場確認及申訴／爭議處理</dd></div>
        <div><dt>蒐集項目</dt><dd>Muniverse註冊信箱、暱稱、姓名、國籍、出生日期、手機號碼、觀眾通知用電子郵件</dd></div>
        <div><dt>保存期間</dt><dd>保存至錄影日（2026-09-14）後30日之2026-10-14，之後立即刪除；如法律另有保存義務，依該期間辦理。</dd></div>
        <div><dt>業務處理</dt><dd>僅限觀眾營運所需人員存取，包括Muniverse及it’s Live/MBC觀眾營運人員。伺服器驗證與登記使用Supabase，營運名單與通知郵件處理使用Google Sheets、Apps Script與Mail服務。</dd></div>
        <div><dt>境外處理</dt><dd>使用Google全球服務時，個人資料可能於境外處理；相關事項依Muniverse隱私權政策及適用法令辦理。</dd></div>
        <div><dt>身分證件</dt><dd>錄影當天於現場查驗附照片的有效身分證件；本頁不蒐集證件影本或證件號碼。</dd></div>
        <div><dt>拒絕同意</dt><dd>您可拒絕同意，但若不同意必填個人資料之蒐集與利用，將無法完成觀眾登記及入場核驗。</dd></div>
        <div><dt>權利與聯絡</dt><dd>查閱、更正、刪除及個資相關詢問：support@muniverse.io</dd></div>
      </dl>
      <p class="privacy-footnote">本同意專用於COVER PICK觀眾登記；其他個人資料處理另適用Muniverse隱私權政策。</p>`,
    'zh-CN': `
      <div class="privacy-mode">本页面输入的个人信息将实际存储和处理，用于COVER PICK观众登记与运营。</div>
      <div class="privacy-law">观众登记所需个人信息收集与使用同意说明</div>
      <dl class="privacy-grid">
        <div><dt>处理主体</dt><dd>Muniverse服务隐私政策所载的运营主体</dd></div>
        <div><dt>使用目的</dt><dd>中奖账号确认、观众登记、年龄与身份核验、观众通知、现场入场确认及咨询／争议处理</dd></div>
        <div><dt>收集项目</dt><dd>Muniverse注册邮箱、昵称、姓名、国籍、出生日期、手机号码、观众通知用电子邮箱</dd></div>
        <div><dt>保存期限</dt><dd>保存至录制日（2026-09-14）后30日的2026-10-14，之后及时删除；如法律另有保存义务，则按相应期限执行。</dd></div>
        <div><dt>业务处理</dt><dd>仅限观众运营所需人员访问，包括Muniverse及it’s Live/MBC观众运营人员。服务器验证与登记使用Supabase，运营名单与通知邮件处理使用Google Sheets、Apps Script和Mail服务。</dd></div>
        <div><dt>境外处理</dt><dd>使用Google全球服务时，个人信息可能在境外处理；相关事项依Muniverse隐私政策及适用法律执行。</dd></div>
        <div><dt>身份证件</dt><dd>录制当天在现场查验附照片的有效身份证件；本页面不收集证件复印件或证件号码。</dd></div>
        <div><dt>拒绝同意</dt><dd>您可以拒绝同意，但若不同意必填个人信息的收集与使用，将无法完成观众登记及入场核验。</dd></div>
        <div><dt>权利与联系</dt><dd>查阅、更正、删除及个人信息相关咨询：support@muniverse.io</dd></div>
      </dl>
      <p class="privacy-footnote">本同意仅用于COVER PICK观众登记；其他个人信息处理另适用Muniverse隐私政策。</p>`
  };

  function text(id, value) {
    const el = $(id);
    if (el) el.textContent = value;
  }

  function copy() {
    return T[$('lang')?.value] || T.en;
  }

  function setLanguage(lang) {
    if (!T[lang]) lang = 'en';
    const c = T[lang];
    document.documentElement.lang = lang;
    text('statusBadge', c.status);
    text('heroTitle', c.hero);
    text('step1Title', c.s1);
    text('step1Desc', c.s1d);
    text('emailLabel', c.email);
    text('nicknameLabel', c.nick);
    text('consentLabel', c.consent);
    text('privacyTitle', c.privacyTitle);
    text('verifyBtn', c.verify);
    text('step2Title', c.s2);
    text('step2Desc', c.s2d);
    text('nameLabel', c.name);
    text('nationalityLabel', c.nationality);
    text('birthLabel', c.birth);
    text('phoneLabel', c.phone);
    text('contactLabel', c.contact);
    text('contactHint', c.hint);
    text('noticeText', c.notice);
    text('submitBtn', c.submit);
    text('doneTitle', c.done);
    text('doneDesc', c.doneDesc);
    const panel = $('privacyText');
    if (panel) panel.innerHTML = PRIVACY[lang] || PRIVACY.en;
  }

  function validEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
  }

  function ageOnRecordingDate(birth) {
    const [by,bm,bd] = String(birth || '').split('-').map(Number);
    const [ry,rm,rd] = RECORDING_DATE.split('-').map(Number);
    if (![by,bm,bd].every(Number.isFinite)) return NaN;
    let age = ry - by;
    if (rm < bm || (rm === bm && rd < bd)) age--;
    return age;
  }

  async function callApi(action, payload) {
    const response = await fetch(`${API}?action=${encodeURIComponent(action)}`, {
      method:'POST',
      headers:{'Content-Type':'application/json','x-cover-pick-request':'1'},
      body:JSON.stringify(payload),
      cache:'no-store',
      credentials:'omit',
      referrerPolicy:'no-referrer'
    });
    let data = {};
    try { data = await response.json(); } catch (_) {}
    return { response, data };
  }

  function apiError(code, c) {
    if (code === 'IDENTITY_MISMATCH' || code === 'NOT_WINNER') return c.identityMismatch;
    if (code === 'ALREADY_SUBMITTED' || code === 'DUPLICATE') return c.duplicate;
    if (code === 'SESSION_EXPIRED' || code === 'INVALID_SESSION') return c.sessionExpired;
    if (code === 'CONSENT_REQUIRED') return c.consentNeeded;
    if (code === 'RATE_LIMITED') return c.rateLimited;
    if (code === 'UNDER_15') return c.under15;
    return c.network;
  }

  function updateConsentState() {
    if (!$('verifyBtn') || !$('consent')) return;
    $('verifyBtn').disabled = !$('consent').checked || isVerifying;
  }

  async function verifyWinner() {
    const c = copy();
    const email = $('email').value.trim();
    const nickname = $('nickname').value.trim();
    const consent = $('consent').checked;
    $('verifyMessage').textContent = '';

    if (!email || !nickname) {
      $('verifyMessage').textContent = c.missingIdentity;
      return;
    }
    if (!validEmail(email)) {
      $('verifyMessage').textContent = c.invalidEmail;
      return;
    }
    if (!consent) {
      $('verifyMessage').textContent = c.consentNeeded;
      updateConsentState();
      return;
    }

    isVerifying = true;
    $('step1').classList.add('busy');
    updateConsentState();
    try {
      const { response, data } = await callApi('verify', {
        email,
        nickname,
        privacy_consent:true
      });
      if (!response.ok || data.ok !== true || !data.verificationToken) {
        $('verifyMessage').textContent = apiError(data.code, c);
        return;
      }
      verificationToken = data.verificationToken;
      if (!$('contactEmail').value) $('contactEmail').value = email;
      $('step1').classList.add('hidden');
      $('step2').classList.remove('hidden');
      window.scrollTo({top:Math.max(0,$('step2').offsetTop-18),behavior:'smooth'});
    } catch (_) {
      $('verifyMessage').textContent = c.network;
    } finally {
      isVerifying = false;
      $('step1').classList.remove('busy');
      updateConsentState();
    }
  }

  async function submitAttendee() {
    const c = copy();
    $('submitMessage').textContent = '';

    if (!$('consent').checked || !verificationToken) {
      $('submitMessage').textContent = c.sessionExpired;
      return;
    }

    const payload = {
      verification_token:verificationToken,
      privacy_consent:true,
      account_email:$('email').value.trim(),
      muniverse_nickname:$('nickname').value.trim(),
      name:$('name').value.trim(),
      nationality:$('nationality').value,
      birth_date:$('birthDate').value,
      phone:$('phone').value.trim(),
      contact_email:$('contactEmail').value.trim()
    };

    if (!payload.name || !payload.nationality || !payload.birth_date || !payload.phone || !payload.contact_email) {
      $('submitMessage').textContent = c.missing;
      return;
    }
    if (!validEmail(payload.contact_email)) {
      $('submitMessage').textContent = c.invalidEmail;
      return;
    }
    if (ageOnRecordingDate(payload.birth_date) < 15) {
      $('submitMessage').textContent = c.under15;
      return;
    }

    isSubmitting = true;
    $('step2').classList.add('busy');
    $('submitBtn').disabled = true;
    try {
      const { response, data } = await callApi('submit', payload);
      if (!response.ok || data.ok !== true) {
        $('submitMessage').textContent = apiError(data.code, c);
        if (data.code === 'SESSION_EXPIRED' || data.code === 'INVALID_SESSION') verificationToken = '';
        return;
      }
      verificationToken = '';
      $('step2').classList.add('hidden');
      $('done').classList.remove('hidden');
      window.scrollTo({top:Math.max(0,$('done').offsetTop-18),behavior:'smooth'});
    } catch (_) {
      $('submitMessage').textContent = c.network;
    } finally {
      isSubmitting = false;
      $('step2').classList.remove('busy');
      $('submitBtn').disabled = false;
    }
  }

  $('lang')?.addEventListener('change', (e) => setLanguage(e.target.value));
  $('consent')?.addEventListener('change', updateConsentState);
  $('verifyBtn')?.addEventListener('click', verifyWinner);
  $('submitBtn')?.addEventListener('click', submitAttendee);

  setLanguage($('lang')?.value || 'ko');
  updateConsentState();
})();
