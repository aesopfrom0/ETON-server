const {
  checkRefeshToken,
  generateAccessToken,
  resendAccessToken,
} = require('../tokenFunctions');
const { users } = require('../../models');

module.exports = (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    // return res.status(403).send("refresh token does not exist, you've never logged in before");
    return res.json({ data: null, message: 'refresh token not provided' });
  }

  const refreshTokenData = checkRefeshToken(refreshToken);
  if (!refreshTokenData) {
    return res.json({
      data: null,
      message: 'invalid refresh token, pleaes log in again',
    });
  }

  const { email } = refreshTokenData;
  users.findOne({ where: { email } })
    .then((data) => {
      if (!data) {
        return res.json({
          data: null,
          message: 'refresh token has been tempered',
        });
      }
      delete data.dataValues.password;

      const newAccessToken = generateAccessToken(data.dataValues);
      resendAccessToken(res, newAccessToken, data.dataValues);
    })
    .catch((err) => {
      console.log(err);
    });
};
