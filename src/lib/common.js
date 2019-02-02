var tim = require('tinytim').tim;
exports.hash = hash;
exports.jsonToObj = jsonToObj;
exports.isNothing = isNothing;
exports.isNumeric = isNumeric;
exports.formatString = formatString;
exports.formatStringByInt = formatStringByInt;
exports.formatArray = formatArray;
exports.formatTimestampS = formatTimestampS;
exports.formatTimestampMS = formatTimestampMS;
exports.isTimestampS = isTimestampS;
exports.isTimestampMS = isTimestampMS;
exports.transfer = transfer;
exports.ID = ID;

exports.getValue = function (instance, prop, defaultValue) {
  if (!instance) return null;
  else if (typeof(instance) != 'object') return null;
  else if (!instance.hasOwnProperty(prop)) return defaultValue;
  else {
    return instance[prop];
  }
};

String.prototype.replaceAll = function(search, replacement) {
  var target = this;
  // 預防 \ 造成 crash
  search = search.split('\\').join('\\\\');
  return target.replace(new RegExp(search, 'g'), replacement);
};

/**
 * 隨機產生 id 的方法
 * @param {String} prefix 前綴詞
 */
function ID(prefix) {
  return prefix + Math.random().toString(36).substr(2, 9);
}

function hash(str) {
  var hash = 5381,
    i = str.length;

  while (i) {
    hash = (hash * 33) ^ str.charCodeAt(--i);
  }

  /* JavaScript does bitwise operations (like XOR, above) on 32-bit signed
     * integers. Since we want the results to be always positive, convert the
     * signed int to an unsigned by doing an unsigned bitshift. */
  return hash >>> 0;
}

// 轉換多國語言
// 中文：這個 {{ID}} 編號，需要填寫
// 英文：This {{ID}} must filled.
// obj 為需要轉換的物件，obj = {ID:"123"}
function transfer(language, code, lang, obj) {
  if (!code) {
    return '';
  }
  if (!lang) {
    lang = 'zh-CN';
  }
  var msg = '';
  if (language && language[code] && language[code][lang]) {
    msg = language[code][lang];
  } else {
    msg = '無法轉換錯誤代碼' + code;
  }

  // 中文：這個 {{ID}} 編號，需要填寫
  // obj = {ID:"123"}
  if (obj) {
    try {
      msg = tim(msg, obj);
    } catch (err) {
      // do nothing
    }
  }
  return msg;
}

// 將 json string 轉換成物件
// str1 帶入 json string
// bln : true，若轉換失敗，或是轉換後不是 object 會回傳 str1
// bln : false，當轉換失敗，或是轉換後不是 object 就傳回 null
function jsonToObj(str1, bln) {
  if (!str1) { return null; }
  if (str1.length==0) { return null; }

  //先過濾 \u0000，有些時後最後一碼會多這個
  var re = /\0/g;
  var s1 = str1.toString().replace(re, '');
  var s2 = null;
  try {
    s2 = JSON.parse(s1);
  } catch (err) {
    //轉換失敗
    s2 = (bln) ? str1 : null;
  }
  if (!bln) {
    //若 JSON 轉換出來不是物件，就設為null
    if (typeof(s2) != 'object') {
      s2 = null;
    }
  }
  return s2;
}

// 若為空值傳回 true，不為空值傳回 false
// 強制要用三個等於
function isNothing(str) {
  if (typeof str === 'undefined') return true;
  if (str === null) return true;
  return str === '';
}

// 若為數字格式傳回 true，不是數字格式傳回 false
function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

// str : 要轉換的字串
// df : (option) 如果有，當為空值的時候，用 df 取代，否則都是用 '' 取代
function formatString(str, df) {
  if (isNothing(str)) {
    if (df===null) return null;
    return (df) ? df : '';
  } else {
    return str.toString();
  }
}

// 轉換整數到字串
// str : 要轉換的字串
// df : (option) 如果有，當不為數值的時候，用 df 取代，否則都是用 '' 取代
function formatStringByInt(str, df) {
  if (!isNumeric(str)) {
    if (df===null) return null;
    return (df) ? df : '';
  } else {
    return parseInt(str, 10).toString();
  }
}

// str : 要轉換的陣列
// df : (option) 如果有，當為空值的時候，用 df 取代，否則都是用 '' 取代
// 如果傳進來是不是陣列，則回傳 null
function formatArray(ary, df) {
  if (!Array.isArray(ary)) return null;

  var ary1 = [];
  ary.forEach(function(item) {
    ary1.push(formatString(item, df));
  });
  return ary1;
}

/**
 * 轉換 Date to timestamp (秒)
 * @param date1 {date} EX: new Date()
 * @param [df] {any} : (option) 如果有，當不為數值的時候，用 df 取代，否則都是用 '' 取代
 * @return {string}
 */
function formatTimestampS(date1, df) {
  if (isTimestampS(date1)) {
    return Math.floor(new Date(parseFloat(date1, 10) * 1000).getTime() / 1000).toString();
  } else if (isTimestampMS(date1)) {
    return Math.floor(new Date(parseInt(date1, 10)).getTime() / 1000).toString();
  } else if (isDate(date1)) {
    return Math.floor(new Date(date1).getTime() / 1000).toString();
  } else {
    if (df===null) return null;
    return (df) ? df : '';
  }
}

/**
 * 轉換 Date to timestamp (豪秒)
 * @param date1 {date} EX: new Date()
 * @param [df] {any} : (option) 如果有，當不為數值的時候，用 df 取代，否則都是用 '' 取代
 * @return {string}
 */
function formatTimestampMS(date1, df) {
  if (isTimestampS(date1)) {
    return new Date(parseFloat(date1, 10) * 1000).getTime().toString();
  } else if (isTimestampMS(date1)) {
    return new Date(parseInt(date1, 10)).getTime().toString();
  } else if (isDate(date1)) {
    return new Date(date1).getTime().toString();
  } else {
    if (df===null) return null;
    return (df) ? df : '';
  }
}

// 檢查 timestamp (秒)
// Math.floor(new Date().getTime() / 1000)
// 正確回傳 true
// 錯誤回傳 false
// 判斷為 true 時，最好還是做  parseInt(str, 10).toString() 把一些雜質濾掉
function isTimestampS(str) {
  return (isNumeric(str)
    && isDate(parseInt(str, 10))
    && parseInt(str, 10).toString().length >= 10
    && parseInt(str, 10).toString().length < 13
  );
}

// 檢查 timestamp (豪秒)
// new Date().getTime()
// 正確回傳 true
// 錯誤回傳 false
// 判斷為 true 時，最好還是做  parseInt(str, 10).toString() 把一些雜質濾掉
function isTimestampMS(str) {
  return (isNumeric(str)
    && isDate(parseInt(str, 10))
    && parseInt(str, 10).toString().length >= 13
    && parseInt(str, 10).toString().length < 20
  );
}

function isDate(d1) {
  if (!d1) { return false; }
  var d2;
  if (isNumeric(d1)) {
    // timestamp 要數字才能轉換
    d2 = new Date(parseInt(d1, 10));
  } else {
    d2 = new Date(d1);
  }
  return !(d2.toString() == 'NaN' || d2.toString() == 'Invalid Date');
}
