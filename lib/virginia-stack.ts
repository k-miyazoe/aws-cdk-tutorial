import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class VirginiaStack extends cdk.Stack {
    public readonly bucket: s3.Bucket;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const sourceBucket = new s3.Bucket(this, 'SourceBucket', {
            bucketName: `source-bucket-${this.account}-${this.region}`,
            versioned: true,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
        });

        // デスティネーションバケット(東京) - 別スタックで作成
        // クロススタック参照用にバケット名を出力
        const destinationBucketName = `destination-bucket-${this.account}-ap-northeast-1`;

        const replicationRole = new iam.Role(this, 'ReplicationRole', {
            assumedBy: new iam.ServicePrincipal('s3.amazonaws.com'),
            description: 'S3 Cross-Region Replication Role',
        });

        // ソースバケットの読み取り権限
        replicationRole.addToPolicy(new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
                's3:GetReplicationConfiguration',
                's3:ListBucket',
            ],
            resources: [sourceBucket.bucketArn],
        }));

        replicationRole.addToPolicy(new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
                's3:GetObjectVersionForReplication',
                's3:GetObjectVersionAcl',
                's3:GetObjectVersionTagging',
            ],
            resources: [`${sourceBucket.bucketArn}/*`],
        }));

        // デスティネーションバケットの書き込み権限
        replicationRole.addToPolicy(new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
                's3:ReplicateObject',
                's3:ReplicateDelete',
                's3:ReplicateTags',
            ],
            resources: [`arn:aws:s3:::${destinationBucketName}/*`],
        }));

        // レプリケーション設定をCfnBucketで追加
        const cfnSourceBucket = sourceBucket.node.defaultChild as s3.CfnBucket;
        cfnSourceBucket.replicationConfiguration = {
            role: replicationRole.roleArn,
            rules: [
                {
                    id: 'ReplicateToTokyo',
                    status: 'Enabled',
                    priority: 1,
                    filter: {
                        prefix: '', // すべてのオブジェクトをレプリケート
                    },
                    destination: {
                        bucket: `arn:aws:s3:::${destinationBucketName}`,
                    },
                    deleteMarkerReplication: {
                        status: 'Disabled',
                    },
                },
            ],
        };

        // サンプルファイルのデプロイ
        new s3deploy.BucketDeployment(this, 'DeploySampleFiles', {
            sources: [s3deploy.Source.data('sample.txt', 'これはサンプルファイルです')],
            destinationBucket: sourceBucket,
        });
    }
}

