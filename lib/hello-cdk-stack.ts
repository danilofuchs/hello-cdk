import sqs = require("@aws-cdk/aws-sqs");
import cdk = require("@aws-cdk/core");
import lambda = require("@aws-cdk/aws-lambda");
import codeBuild = require("@aws-cdk/aws-codebuild");
import { SqsEventSource } from "@aws-cdk/aws-lambda-event-sources";

export class HelloCdkStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const queue = new sqs.Queue(this, "HelloCdkQueue", {
      visibilityTimeout: cdk.Duration.seconds(300)
    });

    const logQueue = new lambda.Function(this, "LogQueue", {
      runtime: lambda.Runtime.NODEJS_10_X,
      code: lambda.Code.asset("./log"),
      handler: "index.handler"
    });

    const logQueuePy = new lambda.Function(this, "LogQueuePy", {
      runtime: lambda.Runtime.PYTHON_3_7,
      code: lambda.Code.asset("./log"),
      handler: "log.handler"
    });

    logQueue.addEventSource(new SqsEventSource(queue));
    logQueuePy.addEventSource(new SqsEventSource(queue));

    const gitHubSource = codeBuild.Source.gitHub({
      owner: "danilofuchs",
      repo: "hello-cdk",
      webhook: true,
      webhookFilters: [
        codeBuild.FilterGroup.inEventOf(codeBuild.EventAction.PUSH).andBranchIs(
          "master"
        )
      ],
      reportBuildStatus: true
    });

    new codeBuild.Project(this, "Codebuild", {
      source: gitHubSource,
      buildSpec: codeBuild.BuildSpec.fromObject({
        version: "0.2",
        phases: {
          install: {
            commands: ["npm ci", "npm i -g aws-cdk"]
          },
          build: {
            commands: ['echo "Hello, CodeBuild!"', "npm run build"]
          },
          post_build: {
            commands: ["cdk deploy"]
          }
        }
      }),
      environment: {
        buildImage: codeBuild.LinuxBuildImage.UBUNTU_14_04_NODEJS_10_14_1
      }
    });
  }
}
