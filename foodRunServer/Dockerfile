# Multi-stage build for AWS Lambda Container Image
# Stage 1: Build stage
FROM python:3.9-slim as builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --target /app/dependencies -r requirements.txt

# Stage 2: Runtime stage
FROM public.ecr.aws/lambda/python:3.9

# Copy installed dependencies from builder stage
COPY --from=builder /app/dependencies ${LAMBDA_TASK_ROOT}

# Copy the application code

COPY *.py ${LAMBDA_TASK_ROOT}/
COPY *.db ${LAMBDA_TASK_ROOT}/
COPY .env ${LAMBDA_TASK_ROOT}/

# Create necessary directories
RUN mkdir -p ${LAMBDA_TASK_ROOT}/uploads

# Set environment variables for Lambda
ENV PYTHONPATH=${LAMBDA_TASK_ROOT}
ENV IS_LAMBDA=true
ENV DATABASE_PATH=/tmp/products.db

# Create a script to copy database at runtime
RUN echo '#!/bin/bash\n\
if [ -f "${LAMBDA_TASK_ROOT}/products.db" ]; then\n\
    cp "${LAMBDA_TASK_ROOT}/products.db" "/tmp/products.db"\n\
    echo "Database copied to /tmp/products.db"\n\
else\n\
    echo "No products.db found, will be created at runtime"\n\
fi' > ${LAMBDA_TASK_ROOT}/init_db.sh && chmod +x ${LAMBDA_TASK_ROOT}/init_db.sh

# Set the CMD to your handler
CMD ["lambda_function.lambda_handler"]
