from aws_cdk import (
    Stack,
    Duration,
    aws_lambda as _lambda,
    aws_apigateway as apigateway,
)
from constructs import Construct

class AwsCdkFlaskStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs):
        super().__init__(scope, construct_id, **kwargs)

        # Create Docker-based Lambda function
        flask_lambda = _lambda.DockerImageFunction(
            self,
            "FlaskLambda",
            function_name="flask-lambda",
            code=_lambda.DockerImageCode.from_image_asset("."),
            timeout=Duration.seconds(30),
        )

        # Create API Gateway REST API
        api = apigateway.RestApi(self, "FlaskApi",
            rest_api_name="Flask Service",
            description="Flask app in Lambda via Docker",
        )

        # Integrate Lambda with API Gateway root path
        api.root.add_method(
            "ANY",
            apigateway.LambdaIntegration(flask_lambda)
        )
