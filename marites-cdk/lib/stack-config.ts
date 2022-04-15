import { Duration } from "aws-cdk-lib";

const config = {
  // S3 configuration
  inputBucketName: "marites-comprehend-input",
  outputBucketName: "marites-comprehend-output",
  expiryDuration: Duration.days(1), // has to be days
  // IAM configuration
  initialUsers: ["marites-user"],
  minUserPolicies: ["ComprehendFullAccess"],
  // Lambda environment variables
  tgHost: process.env.TG_HOST,
  tgPassword: process.env.TG_PASSWORD
};

export default config;
