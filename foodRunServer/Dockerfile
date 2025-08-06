# Build stage - install everything including build tools
FROM public.ecr.aws/lambda/python:3.11 as builder

# Install minimal build dependencies
RUN yum update -y && \
    yum groupinstall -y "Development Tools" && \
    yum install -y gcc gcc-c++ make cmake && \
    yum clean all

# Set pip configuration for smaller builds
ENV PIP_NO_CACHE_DIR=1
ENV PIP_DISABLE_PIP_VERSION_CHECK=1

# Upgrade pip and build tools
RUN pip install --upgrade pip wheel setuptools

# Copy requirements and install to a target directory
COPY requirements.txt .

# Force install numpy 1.24.4 first and prevent upgrades
RUN pip install numpy==1.24.4 -t /opt/python --no-deps

# Install PyTorch ecosystem with no-deps to avoid conflicts
RUN pip install torch==2.0.1+cpu torchvision==0.15.2+cpu torchaudio==2.0.2+cpu -t /opt/python \
    --extra-index-url https://download.pytorch.org/whl/cpu --no-deps

# Install other core packages with no-deps
RUN pip install Flask==2.3.3 flask-cors==4.0.0 python-dotenv==1.0.0 aws-wsgi==0.2.7 requests==2.31.0 boto3==1.34.0 word2number==1.1 -t /opt/python --no-deps

# Install their actual dependencies manually
RUN pip install Werkzeug==2.3.7 Jinja2==3.1.2 click==8.1.7 blinker==1.6.3 itsdangerous==2.1.2 \
    MarkupSafe==2.1.3 certifi==2023.7.22 charset-normalizer==3.3.0 idna==3.4 urllib3==2.0.7 \
    jmespath==1.0.1 botocore==1.34.0 python-dateutil==2.8.2 s3transfer==0.10.0 six==1.16.0 -t /opt/python --no-deps

# Install elevenlabs with minimal deps
RUN pip install elevenlabs==0.2.26 -t /opt/python --no-deps
RUN pip install httpx==0.25.0 websockets==11.0.3 pydantic==2.4.2 typing-extensions==4.8.0 -t /opt/python --no-deps

# Install ML packages with locked numpy
RUN pip install --no-deps -t /opt/python \
    transformers==4.35.2 \
    tokenizers==0.15.0 \
    scikit-learn==1.3.2 \
    scipy==1.11.4 \
    sentence-transformers==2.2.2 \
    spacy==3.6.1

# Install remaining ML dependencies
RUN pip install --no-deps -t /opt/python \
    huggingface-hub==0.17.3 \
    packaging==23.2 \
    pyyaml==6.0.1 \
    regex==2023.10.3 \
    tqdm==4.66.1 \
    filelock==3.13.1 \
    joblib==1.3.2 \
    threadpoolctl==3.2.0 \
    pillow==10.0.1

# Remove unnecessary files to reduce size
RUN find /opt/python -type d -name "tests" -exec rm -rf {} + 2>/dev/null || true && \
    find /opt/python -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true && \
    find /opt/python -name "*.pyc" -delete && \
    find /opt/python -name "*.pyo" -delete && \
    find /opt/python -type d -name "*.dist-info" -exec rm -rf {} + 2>/dev/null || true

# Runtime stage - copy only the installed packages
FROM public.ecr.aws/lambda/python:3.11

# Copy installed packages from builder (optimized path)
COPY --from=builder /opt/python /opt/python
ENV PYTHONPATH=/opt/python:${LAMBDA_TASK_ROOT}

# Copy your application code
COPY . ${LAMBDA_TASK_ROOT}

# Environment variables
ENV IS_LAMBDA=true
ENV DATABASE_PATH=/tmp/products.db

CMD ["lambda_function.lambda_handler"]