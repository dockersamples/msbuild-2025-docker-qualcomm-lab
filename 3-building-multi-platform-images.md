# Hands-on Three: Building multi-platform container images

## Learning objectives

In this hands-on, you will complete the following objectives:

- Use a Dockerfile to create a container image for the event-driven GenAI app
- Learn how to perform multi-platform image builds

Let's get started!

## Step 1: Building the app

In case you've never written a Dockerfile, think of it as the set of instructions on how a container image should be created. It outlines the base image (the image we will extend), the files to copy in, and various commands to run. It then specifies the default command a container should run when using the image.

1. In the repo's `app` directory, create a file named `Dockerfile` (no extension) with the following contents:

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
    docker build -t genai-app .
    ```

    This may take a moment for the build to run, but you'll eventually see output similar to the following:

    ```console
    ...
     => => naming to docker.io/library/genai-app:latest
     => => unpacking to docker.io/library/genai-app:latest

    View build details: docker-desktop://dashboard/build/desktop-linux/desktop-linux/x3hiuzo705yl7joedmcbqj5j6

    What's next:
        View a summary of image vulnerabilities and recommendations → docker scout quickview 
    ```

3. Start a new container using your newly built image using the following command:

    ```bash
    docker run -d --name genai-app -e OPENAI_BASE_URL=http://model-runner.docker.internal/engines/v1 -e KAFKA_BROKER_URL=kafka:9093 --network msbuild-lab genai-app
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

## Step 2: Multi-platform builds

The image that we've built is currently only built for the native platform. For the machines used in this lab, that would be `linux/arm64`. 

Recognizing many production environments and other colleagues may be on `linux/amd64` platform, how can we build images that work natively on each platform? That's where multi-platform builds come in!

1. Validate the platform of the image we built by using the following command:

    ```bash
    docker image ls --filter reference=sample-app --tree
    ```

    You should see output similar to the following:

    ```console
    IMAGE                ID             DISK USAGE   CONTENT SIZE   EXTRA
    sample-app:latest    47098fe2a060        245MB         57.4MB
    └─ linux/arm64       79fe963eee0a        245MB         57.4MB
    ```

2. Build the image for multiple platforms by using the following command:

    ```bash
    docker build -t genai-app --platform=linux/amd64,linux/arm64 .
    ```

    This will build the `linux/arm64` build natively and use emulation for all non-native platforms.

3. Now, try to inspect the image for the `linux/amd64` variant. You should now see the image exists:

    ```bash
    docker image ls --filter reference=sample-app --tree
    ```

    You should now see output similar to the following:

    ```console
    IMAGE                ID             DISK USAGE   CONTENT SIZE   EXTRA
    sample-app:latest    cce0552e8806        303MB          115MB
    ├─ linux/amd64       bc295296349f       57.8MB         57.8MB
    └─ linux/arm64       79fe963eee0a        245MB         57.4MB
    ```

> [!TIP]
> If you want to push the image to Docker Hub, update the image tag to include your Docker Hub username and add the `--push` flag. An example might be `docker build -t devreldemo/genai-app --platform=linux/arm64,linux/amd64 --push .`.

## Appendix A: Advanced multi-stage builds

While it goes beyond the scope of this workshop, it's worth sharing an advanced capability when doing multi-platform builds.

For some apps, a build step is required, but that build step may still be platform agnostic. Examples might include building a React app or compiling .NET or Java applications. In these cases, it doesn't make sense to do the compilation in an emulated environment as it's both not needed and will run slowly.

When using multi-stage builds, you can add instructions to indicate which stages run on which platforms. You do so by using the `$BUILDPLATFORM` and `$TARGETPLATFORM` variables.

For example, the following Dockerfile will compile the app using _only_ the build platform (the native) and then use the requested platform for the final stage.

```dockerfile
FROM --platform=$BUILDPLATFORM node:lts-alpine AS build
WORKDIR /usr/local/app
COPY package* ./
RUN npm install
COPY . .
RUN npm run build

FROM --platform=$TARGETPLATFORM nginx:alpine
COPY --from=build /usr/local/app/dist /usr/share/nginx/html
```

## Recap

In this hands-on, you accomplished the following:

- Wrote a Dockerfile to containerize the event-driven GenAI application
- Learned how to build the image for multiple platforms
- Learned how to list images locally and see the available platforms
