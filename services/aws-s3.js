const AWS = require("aws-sdk");

// credentials are taken from env by sdk
AWS.config.update({ region: "eu-central-1" });

const s3 = new AWS.S3();

module.exports = {
  s3,
};
