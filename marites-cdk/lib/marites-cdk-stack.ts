import { RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  Group as IAMGroup,
  ManagedPolicy,
  User as IAMUser,
  Role as IAMRole,
  ServicePrincipal,
} from "aws-cdk-lib/aws-iam";
import { Bucket, Bucket as S3Bucket, LifecycleRule } from "aws-cdk-lib/aws-s3";
import {
  Function as LambdaFunction,
  Runtime as LambdaRuntime,
  Code as LambdaCode,
} from "aws-cdk-lib/aws-lambda";
import config from "./stack-config";
import * as path from "path";

export class MaritesCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const inputBucket = this.createS3Bucket(config.inputBucketName);
    const outputBucket = this.createS3Bucket(config.outputBucketName);

    const devGroup = this.createDeveloperUserGroup(config.minUserPolicies);

    inputBucket.grantReadWrite(devGroup);
    outputBucket.grantReadWrite(devGroup);

    for (const user of config.initialUsers) {
      this.createUser(user, [devGroup]);
    }

    const dataAccessRole = this.createComprehendServiceRole([
      inputBucket,
      outputBucket,
    ]);

    dataAccessRole.grantPassRole(devGroup);

    const lambdaRole = this.createLambdaServiceRole(inputBucket, outputBucket);

    const functionsDir = path.join(__dirname, "functions");

    // Create internal lambda functions
    const inputTransform = new LambdaFunction(this, "input-transform", {
      handler: "index.handler",
      runtime: LambdaRuntime.PYTHON_3_9,
      code: LambdaCode.fromAsset(path.join(functionsDir, "input-transform"), {
        bundling: {
          image: LambdaRuntime.PYTHON_3_9.bundlingImage,
          command: [
            "bash",
            "-c",
            "pip install -r requirements.txt -t /asset-output && cp -au . /asset-output",
          ],
        },
      }),
      role: lambdaRole,
    });
  }

  private createLambdaServiceRole(inputBucket: Bucket, outputBucket: Bucket) {
    const lambdaRole = new IAMRole(this, "marites-lambda-role", {
      roleName: "Role-Lambda-Marites",
      assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: config.minUserPolicies.map((policy) =>
        ManagedPolicy.fromAwsManagedPolicyName(policy)
      ),
    });

    inputBucket.grantReadWrite(lambdaRole);
    outputBucket.grantReadWrite(lambdaRole);
    return lambdaRole;
  }

  private createComprehendServiceRole(buckets: Bucket[]) {
    const dataAccessRole = new IAMRole(this, "comprehend-data-access-role", {
      roleName: "Role-Comprehend-DataAccess",
      assumedBy: new ServicePrincipal("comprehend.amazonaws.com"),
    });
    for (const bucket of buckets) {
      bucket.grantReadWrite(dataAccessRole);
    }
    return dataAccessRole;
  }

  private createDeveloperUserGroup(policies: string[]) {
    const group = new IAMGroup(this, "ug-marites-dev", {
      groupName: "Marites-Developers",
    });
    for (const policy of policies) {
      group.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName(policy));
    }
    return group;
  }

  private createUser(userName: string, groups?: IAMGroup[]) {
    return new IAMUser(this, userName, {
      userName,
      groups,
    });
  }

  private createS3Bucket(bucketName: string) {
    const lifecycleRule: LifecycleRule = {
      id: "comprehend-bucket-lifecycle",
      expiration: config.expiryDuration,
      enabled: true,
    };

    return new S3Bucket(this, bucketName, {
      bucketName,
      autoDeleteObjects: true,
      removalPolicy: RemovalPolicy.DESTROY,
      lifecycleRules: [lifecycleRule],
    });
  }
}
