USE mydb;
CREATE TABLE IF NOT EXISTS `player` (
  `id` VARCHAR(256) NOT NULL COMMENT '玩家編號',
  `topicId` VARCHAR(256) NOT NULL COMMENT 'realtimeDatabase Topic ID',
  `uid` VARCHAR(15) NULL UNIQUE COMMENT 'HUGA+ uid',
  `regType` VARCHAR(10) NOT NULL COMMENT '該帳號註冊時的方式',
  `loginType` VARCHAR(10) NULL COMMENT '該帳號最後登入的方式',
  `account` VARCHAR(256) NOT NULL UNIQUE COMMENT '帳號',
  `password` VARCHAR(256) NULL COMMENT 'MD5加密過後的密碼',
  `state` VARCHAR(20) NOT NULL DEFAULT 'NORMAL' COMMENT '帳號狀態',

  `fbId` VARCHAR(128) NULL COMMENT '信箱',
  `bindFbTime` DATETIME NULL COMMENT '綁定 facebook 帳號的時間',
  `lineId` VARCHAR(128) NULL COMMENT '信箱',
  `bindLineTime` DATETIME NULL COMMENT '綁定 line 帳號的時間',
  `email` VARCHAR(256) NULL COMMENT '信箱',
  `tel` VARCHAR(20) NULL COMMENT '電話',
  `telStatus` VARCHAR(20) NOT NULL DEFAULT 'unverified' COMMENT '電話驗證的狀態',
  `telVerifyingTime` DATETIME NULL COMMENT '送出電話認證簡訊的時間',
  `telVerifiedTime` DATETIME NULL COMMENT '下次可以再修改電話的時間',
  `nextUpdateTelTime` DATETIME NULL COMMENT '下次可以再修改電話的時間',
  `updateTelTimes` INT NOT NULL DEFAULT 0 COMMENT '更改已認證電話的次數',
  `avatar` VARCHAR(256) NOT NULL DEFAULT '' COMMENT '頭像網址',
  `nickname` VARCHAR(50) NOT NULL UNIQUE COMMENT '暱稱',

  `updateNicknameTime` DATETIME NULL COMMENT '最後修改暱稱的時間',
  `intro` TEXT NULL COMMENT '自我介紹',
  `area` VARCHAR(20) NULL COMMENT '地區',
  `lv` INT(11) UNSIGNED NOT NULL DEFAULT 0 COMMENT '等級',
  `lvExp` INT(11) UNSIGNED NOT NULL DEFAULT 0 COMMENT '目前玩家等級的經驗值',
  `gold` INT(11) UNSIGNED NOT NULL DEFAULT 0 COMMENT '金幣',
  `chip` INT(11) UNSIGNED NOT NULL DEFAULT 0 COMMENT '籌碼',
  `diamond` INT(11) UNSIGNED NOT NULL DEFAULT 0 COMMENT '寶石',
  `vip` INT(11) UNSIGNED NOT NULL DEFAULT 0 COMMENT 'vip 等級',
  `vipBuyExp` INT(11) UNSIGNED NOT NULL DEFAULT 0 COMMENT '本周儲值 獲得的 vip 點數',
  `vipEventExp` INT(11) UNSIGNED NOT NULL DEFAULT 0 COMMENT '本周活動 獲得的 vip 點數',
  `vipBetExp` INT(11) UNSIGNED NOT NULL DEFAULT 0 COMMENT '本周押碼 獲得的 vip 點數',
  `vipExpFore8` INT(11) UNSIGNED NOT NULL DEFAULT 0 COMMENT '結算前 8 周後的 VIP 經驗值',
  `credit` INT(11) NOT NULL DEFAULT 0 COMMENT '信用評分',
  `regTime` DATETIME NOT NULL DEFAULT NOW() COMMENT '註冊時間',
  `onlineStatue` VARCHAR(10) NULL DEFAULT 'offline' COMMENT '上線狀態 lobby: 大廳，1001、1002....: 遊戲中，offline:離線',
  `lastLoginTime` DATETIME NULL COMMENT '前一次的登入時間',
  `countryCode` VARCHAR(10) NULL COMMENT '裝置的國家別',
  `lastReadTimeBox` DATETIME NULL COMMENT '信件匣最後的讀取時間',
  `createDate` DATETIME NOT NULL DEFAULT NOW() COMMENT '建立時間',
  `lastUpdate` DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW() COMMENT '修改時間',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE UNIQUE INDEX idx_plyaer_fbId ON player (`fbId`);
CREATE UNIQUE INDEX idx_plyaer_lineId ON player (`lineId`);
CREATE UNIQUE INDEX idx_plyaer_topicId ON player (`topicId`);


