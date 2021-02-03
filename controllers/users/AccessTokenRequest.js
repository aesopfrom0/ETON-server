const { isAuthorized } = require('../tokenFunctions');
const { users } = require('../../models');

module.exports = (req, res) => {
  const accessTokenData = isAuthorized(req);
  if (!accessTokenData) {
    // return res.status(401).send("no token in req.headers['authorization']");
    return res.json({ data: null, message: 'invalid access token' });
  }
  const { email } = accessTokenData;
  users.findOne({ where: { email } })
    .then((data) => {
      if (!data) {
        // return res.status(401).send({ data: null, message: 'not authorized' });
        return res.json({
          data: null,
          message: 'access token has been tempered',
        });
      }
      delete data.dataValues.password;
      return res.json({ data: { userInfo: data.dataValues }, message: 'ok' });
    })
    .catch((err) => {
      console.log(err);
    })
};
