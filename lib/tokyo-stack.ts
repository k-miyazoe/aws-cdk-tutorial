import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as snsSubscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export class TokyoStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Modify the Lambda function resource
    // const myFunction = new lambda.Function(this, "HelloWorldFunction", {
    //   runtime: lambda.Runtime.NODEJS_20_X, // Provide any supported Node.js runtime
    //   handler: "index.handler",
    //   code: lambda.Code.fromInline(`
    //     exports.handler = async function(event) {
    //       return {
    //         statusCode: 200,
    //         body: JSON.stringify('Hello CDK!'),
    //       };
    //     };
    //   `),
    // });

    // // Define the Lambda function URL resource
    // const myFunctionUrl = myFunction.addFunctionUrl({
    //   authType: lambda.FunctionUrlAuthType.NONE,
    // });

    // // Define a CloudFormation output for your URL
    // new cdk.CfnOutput(this, "myFunctionUrlOutput", {
    //   value: myFunctionUrl.url,
    // })

    // SNSトピックの作成
    // const topic = new sns.Topic(this, 'NotificationTopic', {
    //   displayName: 'Email Notification Topic',
    //   topicName: 'email-notification-topic',
    // });

    // // Parameter Storeから既存のメールアドレスリストを取得
    // // valueFromLookupは同期的にParameter Storeから値を取得します
    // const emailsParam = ssm.StringParameter.valueFromLookup(
    //   this,
    //   '/mailaddress/operator'
    // );

    // カンマ区切りの文字列を配列に変換してサブスクリプション作成
    // const emailList = emailsParam.split(',').map(e => e.trim()).filter(e => e);

    // emailList.forEach((email, index) => {
    //   topic.addSubscription(
    //     new snsSubscriptions.EmailSubscription(email)
    //   );

    //   new cdk.CfnOutput(this, `SubscribedEmail${index + 1}`, {
    //     value: email,
    //     description: `Subscribed email address ${index + 1}`,
    //   });
    // });

    // // SNSトピックARNの出力
    // new cdk.CfnOutput(this, 'TopicArn', {
    //   value: topic.topicArn,
    //   description: 'SNS Topic ARN',
    // });

    // new cdk.CfnOutput(this, 'EmailParameter', {
    //   value: '/mailaddress/operator',
    //   description: 'Parameter Store name for email addresses',
    // });

    //s3バケット バージニア用コピー先
    // デスティネーションバケット(東京)
    const copyBucket = new s3.Bucket(this, 'DestinationBucket', {
      bucketName: `destination-bucket-${this.account}-${this.region}`,
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    copyBucket.addToResourcePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      principals: [new iam.ServicePrincipal('s3.amazonaws.com')],
      actions: [
        's3:ReplicateObject',
        's3:ReplicateDelete',
        's3:ReplicateTags'
      ],
      resources: [`${copyBucket.bucketArn}/*`],
    }));
  }
}


