const requireLogin = require("../middlewares/requireLogin");
const { s3 } = require("../services/aws-s3");
const { v1: uuidV1 } = require("uuid");

module.exports = (app) => {
  app.post("/api/upload", requireLogin, async (req, res) => {
    try {
      const key = `${req.user.id}/${uuidV1()}.jpeg`;
      const url = await s3.getSignedUrlPromise("putObject", {
        Bucket: "blog-node-ci",
        ContentType: req.body.type,
        Key: key,
      });
      res.json({ key, url });
    } catch (err) {
      res.send(400, err);
    }
  });
};
