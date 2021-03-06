#!/usr/bin/env node
import cdk = require("@aws-cdk/core");
import { HelloCdkStack } from "../lib/hello-cdk-stack";

const app = new cdk.App();
new HelloCdkStack(app, "HelloCdkStack", {
  env: {
    region: "us-east-1",
    account: "286144860510"
  }
});
