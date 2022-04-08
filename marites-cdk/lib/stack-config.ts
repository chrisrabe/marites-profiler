import { Duration } from "aws-cdk-lib";

const config = {
  // S3 configuration
  inputBucketName: "marites-comprehend-input",
  outputBucketName: "marites-comprehend-output",
  expiryDuration: Duration.hours(5),
  // IAM configuration
  initialUsers: ["marites-user"],
  minUserPolicies: ["ComprehendFullAccess"],
};

export default config;
