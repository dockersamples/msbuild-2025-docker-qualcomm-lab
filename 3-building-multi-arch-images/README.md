# Hands-on Three: Building multi-architecture container images

## Learning objectives

In this hands-on, you will complete the following objectives:

- Use a Dockerfile to create a container image for the event-driven GenAI app
- Learn how to perform multi-architecture image builds

Let's get started!

## Step 1: Writing a Dockerfile

In case you've never written a Dockerfile, think of it as the set of instructions on how a container image should be created. It outlines the base image (the image we will extend), the files to copy in, and various commands to run. It then specifies the default command a container should run when using the image.

1. In the `2-writing-genai-app` directory, create a file named `Dockerfile` (no extension) with the following contents:

    ```dockerfile
    FROM node:lts-alpine
    WORKDIR /usr/local/app

    # Install the app's dependencies
    COPY package* ./
    RUN npm install && npm cache clean --force

    # Copy in the app files
    COPY src ./src

    # Set the default command for this image
    CMD ["node", "src/index.js"]
    ```

2. Now that we have a Dockerfile, let's build the image using the `docker build` command:

    ```bash
    docker build -t sample-app .
    ```

    This may take a moment for the build to run, but you'll eventually see output similar to the following:

    ```console
    ...
     => => naming to docker.io/library/sample-app:latest
     => => unpacking to docker.io/library/sample-app:latest

    View build details: docker-desktop://dashboard/build/desktop-linux/desktop-linux/x3hiuzo705yl7joedmcbqj5j6

    What's next:
        View a summary of image vulnerabilities and recommendations → docker scout quickview 
    ```

3. Start a new container using your newly built image using the following command:

    ```bash
    docker run -d --name genai-app -e OPENAI_BASE_URL=http://model-runner.docker.internal/engines/v1 -e KAFKA_BROKER_URL=kafka:9093 --network msbuild-lab sample-app
    ```

    This command is using the following flags:

    - `-e OPENAI_BASE_URL=http://model-runner.docker.internal/engines/v1` - this is configuring the app to connect to Docker Model Runner using the DNS name available to container networks
    - `-e KAFKA_BROKER_URL=kafka:9093` - configure the app to connect to Kafka using the DNS name configured on the Kafka container
    - `--network msbuild-lab` - connect this container to the network being used by the Compose stack we launched earlier
    
4. Now, create a new product using the Kafbat UI. Here is another sample product message:

    ```json
    {
      "action": "product_created",
      "id": "product-62872aaf",
      "name": "EchoFlow Hub",
      "description": "A sleek, modular smart home hub designed for seamless integration with your Microsoft ecosystem. EchoFlow learns your routines, anticipates your needs, and dynamically adjusts your smart devices – lighting, entertainment, climate – all controlled through intuitive voice commands and a minimalist, customizable touchscreen interface. Featuring exclusive Microsoft Mesh support for immersive collaborative experiences within your home."
    }
    ```

5. To view the output (since it's only printed to the console), view the container logs with the following command:

    ```bash
    docker logs -f genai-app
    ```

6. When you're done with the app, stop it by running the following command:

    ```bash
    docker stop genai-app
    ```

    Since we had the `--rm` flag on the container, the container will automatically be removed.