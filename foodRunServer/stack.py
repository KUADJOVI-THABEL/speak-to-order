from aws_cdk import App
from stack_lib import AwsCdkFlaskStack  # or whatever stack you defined

app = App()
AwsCdkFlaskStack(app, "AwsCdkFlaskStack")
app.synth()
