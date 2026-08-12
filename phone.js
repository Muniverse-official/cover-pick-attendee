(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const COUNTRIES = [
    ['KR','82'],['JP','81'],['CN','86'],['TW','886'],['HK','852'],['MO','853'],
    ['US','1'],['CA','1'],['MX','52'],['BR','55'],['AR','54'],['CL','56'],['PE','51'],['CO','57'],
    ['TH','66'],['PH','63'],['ID','62'],['MY','60'],['SG','65'],['VN','84'],['IN','91'],
    ['AU','61'],['NZ','64'],['GB','44'],['IE','353'],['FR','33'],['DE','49'],['ES','34'],['IT','39'],
    ['NL','31'],['BE','32'],['CH','41'],['AT','43'],['SE','46'],['NO','47'],['DK','45'],['FI','358'],
    ['PL','48'],['CZ','420'],['HU','36'],['RO','40'],['PT','351'],['GR','30'],['TR','90'],
    ['AE','971'],['SA','966'],['IL','972'],['ZA','27'],['EG','20'],['RU','7'],['KZ','7'],['MN','976']
  ];

  const COPY = {
    ko:{choose:'국적을 선택하세요',otherCountry:'기타 국가/지역',domestic:'한국 휴대전화 (010)',national:'국적 국가번호 사용',other:'다른 국가/지역 번호',nationalityHint:'해외 국적이어도 한국 휴대전화(010)를 사용하는 경우 선택할 수 있습니다.',domesticHint:'국적과 관계없이 한국에서 사용하는 010 휴대전화 번호를 입력하세요.',intlHint:'국가번호는 자동 입력됩니다. 국가번호 뒤 휴대전화 번호만 입력해 주세요.',otherHint:'사용할 국가/지역 번호를 직접 입력해 주세요.',dialLabel:'국가/지역 번호'},
    ja:{choose:'国籍を選択してください',otherCountry:'その他の国・地域',domestic:'韓国の携帯番号 (010)',national:'国籍の国番号を使用',other:'別の国・地域番号',nationalityHint:'外国籍でも韓国の携帯番号（010）を利用している場合は選択できます。',domesticHint:'国籍に関係なく、韓国で利用する010の携帯番号を入力してください。',intlHint:'国番号は自動入力されます。国番号に続く携帯番号のみ入力してください。',otherHint:'利用する国・地域番号を直接入力してください。',dialLabel:'国・地域番号'},
    en:{choose:'Select nationality',otherCountry:'Other country/region',domestic:'Korean mobile number (010)',national:'Use nationality country code',other:'Use another country/region code',nationalityHint:'If you are a foreign national using a Korean 010 mobile number, you can select the Korean mobile option below.',domesticHint:'Enter your Korean 010 mobile number regardless of nationality.',intlHint:'The country calling code is filled automatically. Enter the remaining mobile number only.',otherHint:'Enter the country/region calling code you use.',dialLabel:'Country/region calling code'},
    'zh-TW':{choose:'請選擇國籍',otherCountry:'其他國家／地區',domestic:'韓國手機號碼 (010)',national:'使用國籍國碼',other:'使用其他國家／地區國碼',nationalityHint:'即使是外國籍，如使用韓國010手機號碼，也可在下方選擇韓國手機號碼。',domesticHint:'不論國籍，請輸入在韓國使用的010手機號碼。',intlHint:'國碼會自動帶入，請僅輸入國碼後的手機號碼。',otherHint:'請直接輸入使用中的國家／地區國碼。',dialLabel:'國家／地區國碼'},
    'zh-CN':{choose:'请选择国籍',otherCountry:'其他国家／地区',domestic:'韩国手机号 (010)',national:'使用国籍国家代码',other:'使用其他国家／地区代码',nationalityHint:'即使是外国国籍，如使用韩国010手机号，也可在下方选择韩国手机号。',domesticHint:'无论国籍，请输入在韩国使用的010手机号。',intlHint:'国家代码会自动填入，请仅输入国家代码后的手机号码。',otherHint:'请直接输入使用中的国家／地区代码。',dialLabel:'国家／地区代码'}
  };

  const getLang = () => (COPY[$('lang')?.value] ? $('lang').value : 'en');
  const c = (key) => COPY[getLang()][key];
  const countryMap = Object.fromEntries(COUNTRIES.map(([iso,dial]) => [iso,dial]));

  function countryName(iso) {
    try { return new Intl.DisplayNames([getLang()], {type:'region'}).of(iso) || iso; }
    catch { return iso; }
  }

  function populateCountries(preserve=true) {
    const select = $('nationality');
    if (!select) return;
    const old = preserve ? select.value : '';
    select.textContent = '';
    const first = document.createElement('option'); first.value=''; first.textContent=c('choose'); select.appendChild(first);
    const sorted = COUNTRIES.map(([iso,dial]) => ({iso,dial,name:countryName(iso)})).sort((a,b) => a.name.localeCompare(b.name,getLang()));
    sorted.forEach(({iso,dial,name}) => { const o=document.createElement('option'); o.value=iso; o.dataset.dial=dial; o.textContent=name; select.appendChild(o); });
    const other = document.createElement('option'); other.value='OTHER'; other.textContent=c('otherCountry'); select.appendChild(other);
    if (old && [...select.options].some(o => o.value===old)) select.value=old;
  }

  function populateModes(preserve=true) {
    const select=$('phoneMode'); if(!select) return;
    const old=preserve?select.value:'';
    select.innerHTML=`<option value="domestic">${c('domestic')}</option><option value="national">${c('national')}</option><option value="other">${c('other')}</option>`;
    if(old) select.value=old;
  }

  function selectedDial() {
    const iso=$('nationality').value;
    return countryMap[iso] || '';
  }

  function setDefaultPhoneMode() {
    const iso=$('nationality').value;
    if (!iso || iso==='KR') $('phoneMode').value='domestic';
    else if (iso==='OTHER') $('phoneMode').value='other';
    else $('phoneMode').value='national';
    updatePhoneUI();
  }

  function updatePhoneUI() {
    const mode=$('phoneMode').value;
    const dial=selectedDial();
    $('otherCodeWrap').classList.toggle('hidden', mode!=='other');
    $('otherDialLabel').textContent=c('dialLabel');
    if(mode==='domestic') {
      $('dialPrefix').textContent='010';
      $('phoneLocal').placeholder='1234-5678';
      $('phoneHint').textContent=c('domesticHint');
    } else if(mode==='national') {
      $('dialPrefix').textContent=dial?`+${dial}`:'+';
      $('phoneLocal').placeholder='90-1234-5678';
      $('phoneHint').textContent=c('intlHint');
    } else {
      const code=$('otherDialCode').value.trim() || '+';
      $('dialPrefix').textContent=code.startsWith('+')?code:`+${code}`;
      $('phoneLocal').placeholder='90-1234-5678';
      $('phoneHint').textContent=c('otherHint');
    }
    syncPhone();
  }

  function syncPhone() {
    const mode=$('phoneMode').value;
    let local=$('phoneLocal').value.trim();
    if(!local) { $('phone').value=''; return; }
    if(mode==='domestic') {
      local=local.replace(/^\s*010[-\s]?/,'');
      $('phone').value=`010-${local}`.replace(/--+/g,'-');
      return;
    }
    let prefix=mode==='national'?selectedDial():$('otherDialCode').value.trim().replace(/^\+/, '');
    prefix=prefix.replace(/\D/g,'');
    $('phone').value=prefix?`+${prefix} ${local}`:local;
  }

  function translatePhoneUI() {
    const currentCountry=$('nationality')?.value || '';
    const currentMode=$('phoneMode')?.value || 'domestic';
    populateCountries(true); populateModes(true);
    if(currentCountry) $('nationality').value=currentCountry;
    $('phoneMode').value=currentMode;
    $('nationalityHint').textContent=c('nationalityHint');
    updatePhoneUI();
  }

  $('nationality')?.addEventListener('change', setDefaultPhoneMode);
  $('phoneMode')?.addEventListener('change', updatePhoneUI);
  $('phoneLocal')?.addEventListener('input', syncPhone);
  $('otherDialCode')?.addEventListener('input', updatePhoneUI);
  $('lang')?.addEventListener('change', () => setTimeout(translatePhoneUI,0));

  populateCountries(false); populateModes(false);
  $('nationalityHint').textContent=c('nationalityHint');
  $('phoneMode').value='domestic';
  updatePhoneUI();
})();
