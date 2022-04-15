import { RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  Group as IAMGroup,
  ManagedPolicy,
  Role as IAMRole,
  ServicePrincipal,
  User as IAMUser,
} from "aws-cdk-lib/aws-iam";
import {
  Bucket as S3Bucket,
  EventType,
  LifecycleRule,
} from "aws-cdk-lib/aws-s3";
import {
  Code as LambdaCode,
  Function as LambdaFunction,
  IEventSource,
  Runtime as LambdaRuntime,
} from "aws-cdk-lib/aws-lambda";
import { S3EventSource } from "aws-cdk-lib/aws-lambda-event-sources";
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
    this.createTransformFunctions(
      functionsDir,
      lambdaRole,
      inputBucket,
      outputBucket
    );
  }

  private createTransformFunctions(
    functionsDir: string,
    lambdaRole: IAMRole,
    inputBucket: S3Bucket,
    outputBucket: S3Bucket
  ) {
    const transformEnv = {
      TG_HOST: config.tgHost ?? "",
      TG_PASSWORD: config.tgPassword ?? "",
      TG_SECRET: config.tgSecret ?? "",
    };

    this.createLambdaFunction(
      "input-transform",
      path.join(functionsDir, "input-transform"),
      lambdaRole,
      [
        new S3EventSource(inputBucket, {
          events: [EventType.OBJECT_CREATED_PUT],
          filters: [{ prefix: "tigergraph/", suffix: ".tar.gz" }],
        }),
      ],
      transformEnv
    );

    this.createLambdaFunction(
      "output-transform",
      path.join(functionsDir, "output-transform"),
      lambdaRole,
      [
        new S3EventSource(outputBucket, {
          events: [EventType.OBJECT_CREATED_PUT],
          filters: [{ suffix: ".tar.gz" }],
        }),
      ],
      transformEnv
    );
  }

  private createLambdaFunction(
    id: string,
    codePath: string,
    role: IAMRole,
    events?: IEventSource[],
    environment?: Record<string, string>,
    handler = "index.handler"
  ) {
    return new LambdaFunction(this, id, {
      handler: handler,
      runtime: LambdaRuntime.PYTHON_3_9,
      code: LambdaCode.fromAsset(codePath, {
        bundling: {
          image: LambdaRuntime.PYTHON_3_9.bundlingImage,
          command: [
            "bash",
            "-c",
            "pip install -r requirements.txt -t /asset-output && cp -au . /asset-output",
          ],
        },
      }),
      timeout: config.lambdaTimeout,
      retryAttempts: config.retryAttempts,
      role,
      events,
      environment,
    });
  }

  private createLambdaServiceRole(
    inputBucket: S3Bucket,
    outputBucket: S3Bucket
  ) {
    const policies = config.minUserPolicies.map((policy) =>
      ManagedPolicy.fromAwsManagedPolicyName(policy)
    );

    policies.push(
      ManagedPolicy.fromAwsManagedPolicyName(
        "service-role/AWSLambdaBasicExecutionRole"
      )
    );

    const lambdaRole = new IAMRole(this, "marites-lambda-role", {
      roleName: "Role-Lambda-Marites",
      assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: policies,
    });

    inputBucket.grantReadWrite(lambdaRole);
    outputBucket.grantReadWrite(lambdaRole);
    return lambdaRole;
  }

  private createComprehendServiceRole(buckets: S3Bucket[]) {
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
