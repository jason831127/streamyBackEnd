const crypto = require('crypto');
const uuid = require('uuid/v4');
const generatePassword = require('password-generator');
const request = require('request-promise');

//驗證碼加解密
const captchaKey = {
  sharedSecret: 'test',
  captchaAlgorithm: 'bf-ecb',
  encrypt: (text) => {
    let cipher = crypto.createCipher(captchaKey.captchaAlgorithm, captchaKey.sharedSecret);
    let crypted = cipher.update(text, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
  },
  decrypt: (text) => {
    let decipher = crypto.createDecipher(captchaKey.captchaAlgorithm, captchaKey.sharedSecret);
    let dec = decipher.update(text, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
  }
};

//轉換 int、float 或 string 成為貨幣顯示字串
const toCurrency = (n) => {
  if (!n) throw new Error('參數 n 不正確');

  n = n.toString();
  var regex = /^(-?\d+)(\.\d+)?$/;
  if (!regex.test(n)) throw new Error('參數 n 應為整數或小數');

  //如果是浮點
  let arr = n.split('.');
  arr[0] = arr[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');

  let str = arr[1] ? `${arr[0]}.${arr[1]}` : arr[0];
  return str;
};

//數字補 0
const padLeft = (str, len) => {
  if (!str) throw new Error('參數 str 不正確');
  if (isNaN(len) || len === 0) throw new Error('參數 len 不正確');
  str = str.toString();
  if (str.length >= len)
    return str;
  else
    return padLeft('0' + str, len);
};

const getUUID = function () {
  return uuid().replace(/-/g, '');
};

/**
 * 產生 player.uid 傳入 {日期} 跟 playerUid.sn 來組合成 player 的 uid
 * @param {String} today Date YYYYMMDD
 * @param {Number} reply player uid serial number
 */
const getUid = function (today, reply) {
  var NO = reply.toString().padStart(7, '0');
  var Y1 = today.substring(2, 3);
  var Y2 = today.substring(3, 4);
  var M1 = today.substring(4, 5);
  var M2 = today.substring(5, 6);
  var D1 = today.substring(6, 7);
  var D2 = today.substring(7, 8);
  var N1 = NO.substring(0, 1);
  var N2 = NO.substring(1, 2);
  var N3 = NO.substring(2, 3);
  var N4 = NO.substring(3, 4);
  var N5 = NO.substring(4, 5);
  var N6 = NO.substring(5, 6);
  var N7 = NO.substring(6, 7);

  var uid = Y1.concat(D2, Y2, N4, N3, N1, N7, D1, M2, N5, M1, N2, N6);
  if (uid.length != 13) throw new Error('uid 格式錯誤');
  return uid;
};

/**
 * 產生密碼
 * @param {Number} length 密碼長度
 * @param {Bool} onlyNumber 只要數字
 */
const genPassword = (length, onlyNumber) => {
  if (!length) throw new Error('length 格式錯誤');

  if (onlyNumber) return generatePassword(length, false, /\d/);
  else return generatePassword(length, false);
};

function Utils() {
  /*
  @params option.activeNotification {Boolean} 是否開啟 server 錯誤通知到 Slack
   */
  this.toCurrency = toCurrency;
  this.padLeft = padLeft;
  this.captchaKey = captchaKey;
  this.getUUID = getUUID;
  this.getUid = getUid;
  this.genPassword = genPassword;
  this.request = request;
  this.convertLang = convertLang;
  this.convertLangByRow = convertLangByRow;

}


// lang = tw
// languagePack = {"tw":{"title":"中午免費轉!快來黃金島搶寶藏-tw"},"en":{"title":"Good afternoon! come on man!"}}
//
/**
* 產生 player.uid 傳入 {日期} 跟 playerUid.sn 來組合成 player 的 uid
* @param {String} lang 'tw'
* @param {Object} languagePack  {"tw":{"title":"中午免費轉!快來黃金島搶寶藏-tw"},"en":{"title":"Good afternoon! come on man!"}}
 * @param {String} defaultString "中午免費轉!快來黃金島搶寶藏-tw"

 */
const convertLang = function(lang, languagePack, defaultString, defaultLang) {
  if (!languagePack) return defaultString;
  if (languagePack[lang])
    return languagePack[lang];
  else if (languagePack[defaultLang])
    return languagePack[defaultLang];
  return defaultString;
};

/**
 * 針對 row 物件的欄位做語系的轉換，row 必須帶有語言包物件 languatePack
 * @param {String} lang 語系 'tw' or 'en' ..etc
 * @param {Object} row 帶有語言包的資料物件 { languagePack: { }}
 * @param {Array<String>} DEFAULTLANG 預設允許的語系 ex. ["tw", "en"]
 * @param {Array<String>} CONVERTFIELD 要轉換語系的欄位 ex. ["title", "body"]
 */
const convertLangByRow = (lang, row, DEFAULTLANG, CONVERTFIELD) => {
  if (!lang || DEFAULTLANG.indexOf(lang) == -1) return;
  if (!row.languagePack) return;

  CONVERTFIELD.forEach(L => {
    if (row.languagePack[lang] && row.languagePack[lang][L]) {
      row[L] = row.languagePack[lang][L];
    }
  });
};




module.exports = new Utils();
