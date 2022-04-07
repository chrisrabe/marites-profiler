import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as iam from "aws-cdk-lib/aws-iam";

export class AwsInfraStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create IAM user group
    const group = new iam.Group(this, "MaritesDevs", {
      groupName: "MaritesDevs",
    });
    group.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonS3FullAccess")
    );
    group.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("ComprehendFullAccess")
    );
  }
}
