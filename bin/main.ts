#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { TokyoStack  } from '../lib/tokyo-stack';
import { VirginiaStack } from '../lib/virginia-stack';

const app = new cdk.App();
new TokyoStack(app, 'TokyoStack', {
  env: { account: '211125646845', region: 'ap-northeast-1' },
});

new VirginiaStack(app, 'VirginiaStack', {
    env: { account: '211125646845', region: 'us-east-1' },
});