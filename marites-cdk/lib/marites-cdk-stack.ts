import { RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  Group as IAMGroup,
  ManagedPolicy,
  User as IAMUser,
  Role as IAMRole,
  ServicePrincipal,
} from "aws-cdk-lib/aws-iam";
import { Bucket as S3Bucket, LifecycleRule } from "aws-cdk-lib/aws-s3";
import config from "./stack-config";

export class MaritesCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const inputBucket = this.createS3Bucket(config.inputBucketName);
    const outputBucket = this.createS3Bucket(config.outputBucketName);

    const devGroup = this.createDeveloperUserGroup(config.minUserPolicies);

    // Grant read and write access to buckets
    inputBucket.grantReadWrite(devGroup);
    outputBucket.grantReadWrite(devGroup);

    // Create all users in dev group
    for (const user of config.initialUsers) {
      this.createUser(user, [devGroup]);
    }

    // Set up resource policies for AWS Comprehend
    new IAMRole(this, "comprehend-data-access-role", {
      roleName: "Role-Comprehend-DataAccess",
      assumedBy: new ServicePrincipal("comprehend.amazonaws.com"),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName(
          "ComprehendDataAccessRolePolicy"
        ),
      ],
    });

    // Set up resource policies for AWS lambda
    const lambdaRole = new IAMRole(this, "marites-lambda-role", {
      roleName: "Role-Lambda-Marites",
      assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
      managedPolicies: config.minUserPolicies.map((policy) =>
        ManagedPolicy.fromAwsManagedPolicyName(policy)
      ),
    });

    inputBucket.grantWrite(lambdaRole); // push CSVs into input bucket
    outputBucket.grantRead(lambdaRole); // read output CSVs from output bucket
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
