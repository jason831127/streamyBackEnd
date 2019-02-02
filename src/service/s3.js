const AWS = require('aws-sdk');
const moment = require('moment-timezone');

AWS.config.update({
  accessKeyId: '',
  secretAccessKey: ''
});

function s3(server) {
  this.server = server;
}

const imageTypes = [ 'jpeg', 'png', 'JPEG', 'PNG' ];
s3.prototype.uploadGreetings = async function (imageBase64, fileName) {
  if (imageBase64 && imageBase64.startsWith('fakeBase64')) return Promise.resolve(imageBase64);
  return this.upload(imageBase64, fileName, 'greetings');
};

s3.prototype.uploadAvatar = async function (imageBase64, fileName) {
  return this.upload(imageBase64, fileName, 'avatar');
};

s3.prototype.uploadChatImg = async function (imageBase64, fileName) {
  return this.upload(imageBase64, fileName, 'chat');
};

s3.prototype.upload = async function (imageBase64, fileName, bucket) {
  // imageBase64 = data:image/jpeg;base64,/9j/4AAQSkZJRgAB….
  const r = new RegExp(/^data:image\/(\w+);base64,(.+)/);
  let result = imageBase64.match(r);

  if (!result || result.length < 3) throw new Error('wrong base64 format');

  let imageType = result[1];

  if (imageTypes.indexOf(imageType) == -1) throw new Error('wrong image type');

  let buf = new Buffer(result[2], 'base64');
  let o = {
    params: {
      Bucket: 'hps-test-folder/' + bucket,
      Key: fileName + '.' + imageType,  //檔案名稱
      ACL: 'public-read', //檔案權限
      ContentEncoding: 'base64',
      ContentType: 'image/'+ imageType
    }
  };

  var s3Lib = new AWS.S3(o);

  return new Promise(function(resolve, reject) {
    s3Lib.upload({ Body: buf }).send(function (err, data) {
      if (err) {
        console.log(err.message);
        reject('無效的影像編碼');
      } else {
        var url = data.Location;
        resolve(url);
      }
    });
  });
};

s3.prototype.savePlayerAssetsChange = async function() {
  let rds = this.server.rds;
  let yesterday = moment().subtract(1, 'day');
  let o = {
    params: {
      Bucket: 'hps-test-folder/leaderboard',
      Key: 'playerAssetsChange-' + moment(yesterday).format('YYYYMMDD') + '.csv',  //檔案名稱
      ACL: 'public-read', //檔案權限
      ContentType: 'application/json'
    }
  };

  let data = await rds('playerAssetsChange').select('*').where('date', moment(yesterday).format('YYYY-MM-DD')).orderBy('playerId');
  await rds('playerAssetsChange').where('date', moment(yesterday).format('YYYY-MM-DD')).del();

  var s3Lib = new AWS.S3(o);
  return new Promise(function(resolve, reject) {
    s3Lib.upload({ Body: JSON.stringify(data) }).send(function (err, res) {
      if (err) {
        reject('');
      } else {
        var url = res.Location;
        resolve(url);
      }
    });
  });

};

module.exports = s3;