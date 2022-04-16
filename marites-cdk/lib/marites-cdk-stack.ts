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
import { RestApi, LambdaIntegration } from "aws-cdk-lib/aws-apigateway";
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

    // Create Serverless API
    const api = new RestApi(this, "marites-api", {
      restApiName: "Marites API",
      description:
        "This service serves endpoints for serving personalised content",
    });

    this.addApiEndpoint(
      api,
      "analyse",
      ["POST"],
      "analyse-handler",
      path.join(functionsDir, "analyse"),
      lambdaRole
    );

    this.addApiEndpoint(
      api,
      "user/{id}",
      ["GET"],
      "user-handler",
      path.join(functionsDir, "user"),
      lambdaRole
    );

    this.addApiEndpoint(
      api,
      "news",
      ["GET"],
      "news-handler",
      path.join(functionsDir, "news"),
      lambdaRole
    );
  }

  private addApiEndpoint(
    api: RestApi,
    route: string,
    supportedMethods: string[],
    id: string,
    codePath: string,
    lambdaRole: IAMRole
  ) {
    const lambdaFunction = this.createLambdaFunction(id, codePath, lambdaRole);
    const integration = new LambdaIntegration(lambdaFunction, {
      requestTemplates: {
        "application/json": JSON.stringify({ statusCode: 200 }),
      },
    });
    let endpoint = undefined;
    const parts = route.split("/");
    for (const part of parts) {
      if (!endpoint) {
        endpoint = api.root.addResource(part);
      } else {
        endpoint = endpoint.addResource(part);
      }
    }
    if (!endpoint) {
      return;
    }
    for (const method of supportedMethods) {
      endpoint.addMethod(method, integration);
    }
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
      transformEnv,
      [
        new S3EventSource(inputBucket, {
          events: [EventType.OBJECT_CREATED_PUT],
          filters: [{ prefix: "tigergraph/", suffix: ".tar.gz" }],
        }),
      ]
    );

    this.createLambdaFunction(
      "output-transform",
      path.join(functionsDir, "output-transform"),
      lambdaRole,
      transformEnv,
      [
        new S3EventSource(outputBucket, {
          events: [EventType.OBJECT_CREATED_PUT],
          filters: [{ suffix: ".tar.gz" }],
        }),
      ]
    );
  }

  private createLambdaFunction(
    id: string,
    codePath: string,
    role: IAMRole,
    environment?: Record<string, string>,
    events?: IEventSource[],
    handler = "index.handler"
  ) {
    return new LambdaFunction(this, id, {
      functionName: id,
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
