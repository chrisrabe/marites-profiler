import "dotenv/config";
import { Duration } from "aws-cdk-lib";

const config = {
  // S3 configuration
  inputBucketName: "marites-comprehend-input",
  outputBucketName: "marites-comprehend-output",
  expiryDuration: Duration.days(1), // has to be days
  // IAM configuration
  initialUsers: ["marites-user"],
  minUserPolicies: ["ComprehendFullAccess"],
  // Lambda configuration
  lambdaTimeout: Duration.minutes(5),
  retryAttempts: 0,
  // Lambda environment variables
  tgHost: process.env.TG_HOST ?? "",
  tgPassword: process.env.TG_PASSWORD ?? "",
  tgSecret: process.env.TG_SECRET ?? "",
  twitterToken: process.env.BEARER_TOKEN ?? "",
  newsCatcherApiKey: process.env.NEWS_CATCHER_API_KEY ?? "",
  newsApiKey: process.env.NEWS_API_KEY ?? "",
};

export default config;
