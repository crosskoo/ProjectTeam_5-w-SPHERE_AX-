const mongoose = require('mongoose');
const UserLogs = mongoose.model('UserLogs');


const getUserIP = (req) => {
  const forwardedIps = req.headers['x-forwarded-for'];
  if (forwardedIps) {
    return forwardedIps.split(',')[0].split(':')[3];
  }
  return req.connection.remoteAddress.split(':')[3];
};

const saveUserLog = async (id) => {
  try {
    const userLog = new UserLogs({ ID: id });
    await userLog.save();
    console.log('Success');
  } catch (err) {
    console.error('Error saving user log:', err);
  }
};

exports.userLogs = (req, res) => {
  const result = req.body.test;
  res.status(200).send(result);
};

exports.userInfo = (req, res) => {
  res.status(200).send('wkit get Method');
};

// Example usage:
saveUserLog('테스터');