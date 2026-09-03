import { Construct } from "constructs";
import {
  aws_s3 as s3,
  aws_guardduty as guardduty,
  aws_iam as iam,
  RemovalPolicy,
  Aws,
  Duration,
} from "aws-cdk-lib";

interface CreateUploadsComponentsProps {
  scope: Construct;
  loggingBucket: s3.IBucket;
  isDev: boolean;
  datasetBucketName: string;
}

/**
 * Creates a bucket for managing universal data set uploads.
 * Files should be uploaded as /{dataset}/{state}/{fileId}, notably flipping the report order of params
 */
export function createDataSetComponents(props: CreateUploadsComponentsProps) {
  const { scope, loggingBucket, isDev, datasetBucketName } = props;

  const datasetBucket = new s3.Bucket(scope, "DataSetBucket", {
    bucketName: datasetBucketName,
    autoDeleteObjects: isDev,
    encryption: s3.BucketEncryption.S3_MANAGED,
    versioned: true,
    removalPolicy: isDev ? RemovalPolicy.DESTROY : RemovalPolicy.RETAIN,
    publicReadAccess: false,
    blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_PREFERRED,
    cors: [
      {
        allowedOrigins: ["*"],
        allowedMethods: [
          s3.HttpMethods.GET,
          s3.HttpMethods.PUT,
          s3.HttpMethods.POST,
          s3.HttpMethods.DELETE,
          s3.HttpMethods.HEAD,
        ],
        allowedHeaders: ["*"],
        exposedHeaders: ["ETag"],
        maxAge: 3000, // 50 minutes
      },
    ],
    enforceSSL: true,
    serverAccessLogsBucket: loggingBucket,
    serverAccessLogsPrefix: `AWSLogs/${Aws.ACCOUNT_ID}/s3/`,
  });

  const s3MalwareProtectionRole = new iam.Role(
    scope,
    "S3MalwareProtectionRole",
    {
      assumedBy: new iam.ServicePrincipal(
        "malware-protection-plan.guardduty.amazonaws.com"
      ),
      inlinePolicies: {
        S3MalwareProtectionPolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              sid: "AllowEventBridgeManagement",
              effect: iam.Effect.ALLOW,
              actions: ["events:*"],
              resources: [
                `arn:aws:events:us-east-1:${Aws.ACCOUNT_ID}:rule/DO-NOT-DELETE-AmazonGuardDutyMalwareProtectionS3*`,
              ],
              conditions: {
                StringLike: {
                  "events:ManagedBy":
                    "malware-protection-plan.guardduty.amazonaws.com",
                },
              },
            }),
            new iam.PolicyStatement({
              sid: "AllowS3Operations",
              effect: iam.Effect.ALLOW,
              actions: [
                "s3:GetObject*",
                "s3:PutObject*",
                "s3:ListBucket",
                "s3:*Notification",
                "s3:*Tagging",
              ],
              resources: [
                datasetBucket.bucketArn,
                `${datasetBucket.bucketArn}/*`,
              ],
            }),
          ],
        }),
      },
    }
  );

  datasetBucket.addToResourcePolicy(
    new iam.PolicyStatement({
      actions: ["s3:GetObject"],
      effect: iam.Effect.DENY,
      resources: [`${datasetBucket.bucketArn}/*`],
      principals: [new iam.ArnPrincipal("*")],
      conditions: {
        StringNotEquals: {
          "s3:ExistingObjectTag/GuardDutyMalwareScanStatus": "NO_THREATS_FOUND",
        },
        ArnNotLike: {
          "aws:ResourceArn": `${datasetBucket.bucketArn}/zips/*`,
        },
      },
    })
  );

  datasetBucket.addToResourcePolicy(
    new iam.PolicyStatement({
      actions: ["s3:PutObject"],
      effect: iam.Effect.DENY,
      principals: [new iam.ArnPrincipal("*")],
      notResources: [
        `${datasetBucket.bucketArn}/*.bmp`,
        `${datasetBucket.bucketArn}/*.txt`,
        `${datasetBucket.bucketArn}/*.csv`,
        `${datasetBucket.bucketArn}/*.jar`,
        `${datasetBucket.bucketArn}/*.odt`,
        `${datasetBucket.bucketArn}/*.ods`,
        `${datasetBucket.bucketArn}/*.odp`,
        `${datasetBucket.bucketArn}/*.msg`,
        `${datasetBucket.bucketArn}/*.potx`,
        `${datasetBucket.bucketArn}/*.pptx`,
        `${datasetBucket.bucketArn}/*.ppt`,
        `${datasetBucket.bucketArn}/*.rtf`,
        `${datasetBucket.bucketArn}/*.tif`,
        `${datasetBucket.bucketArn}/*.gif`,
        `${datasetBucket.bucketArn}/*.jpeg`,
        `${datasetBucket.bucketArn}/*.png`,
        `${datasetBucket.bucketArn}/*.docm`,
        `${datasetBucket.bucketArn}/*.docx`,
        `${datasetBucket.bucketArn}/*.doc`,
        `${datasetBucket.bucketArn}/*.pdf`,
        `${datasetBucket.bucketArn}/*.jpg`,
        `${datasetBucket.bucketArn}/*.xlsx`,
        `${datasetBucket.bucketArn}/*.zip`,
        `${datasetBucket.bucketArn}/*.xltx`,
        `${datasetBucket.bucketArn}/*.xls`,
        `${datasetBucket.bucketArn}/*.xml`,
      ],
    })
  );

  datasetBucket.addLifecycleRule({
    tagFilters: { auto_delete_category: "generated_zip" },
    expiration: Duration.days(1),
  });

  new guardduty.CfnMalwareProtectionPlan(scope, "MalwareProtectionPlan", {
    actions: {
      tagging: {
        status: "ENABLED",
      },
    },
    protectedResource: {
      s3Bucket: {
        bucketName: datasetBucketName,
      },
    },
    role: s3MalwareProtectionRole.roleArn,
  });

  return datasetBucket;
}
