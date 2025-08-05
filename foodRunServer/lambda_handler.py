import json
import base64
from awsgi import response
from app import app

def lambda_handler(event, context):
    """
    AWS Lambda handler function for Flask app
    """
    return response(app, event, context)
