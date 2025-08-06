import json
import base64
import awsgi
from app import app
print("Starting AWS Lambda handler for Flask app")
def lambda_handler(event, context):
    """
    AWS Lambda handler function for Flask app
    """
    print("Received event:", json.dumps(event))
    response = awsgi.response(app, event, context)
    print("Generated response:", json.dumps(response))
    return response


if __name__ == "__main__":
    app.run(debug=True)
