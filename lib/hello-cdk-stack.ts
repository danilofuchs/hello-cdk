import sqs = require("@aws-cdk/aws-sqs");
import cdk = require("@aws-cdk/core");
import lambda = require("@aws-cdk/aws-lambda");
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
  }
}
