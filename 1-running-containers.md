# Hands-on One: Running containers

## Learning objectives

In this hands-on, you will complete the following objectives:

- Run a simple container using a multi-platform image
- Demonstrate cross-platform emulation by using a non-native container image
- Use Docker Compose to launch several containers

Let's get started!


## Step 1: Run a native container

1. Start the `docker/welcome-to-docker` container:

    ```bash
    docker run -d -p 80:80 --name welcome docker/welcome-to-docker
    ```

    This command is using the following flags:

    - `-d` - run the container in "detached" mode. This runs the container in the background
    - `-p 80:80` - connect port 80 of the host to port 80 of the container. This is what allows the container to be opened in the browser
    - `--name welcome` - give this container a specific name. Normally, this flag is skipped and an auto-generated name is used. But, it helps with lab environments to have predictable names.

2. Open your browser and navigate to [http://localhost](http://localhost). You should see the "Congratulations!!!" page. This is being served by the container!

3. Validate that the container is running:

    ```bash
    docker ps
    ```

    Ensure the `docker/welcome-to-docker` container is listed and running.

4. Check the platform for the container by running the following command:

    ```bash
    docker inspect welcome
    ```

    Near the end of the output, you should see a field named `ImageManifestDescriptor`. This field should indicate a platform like the following:

    ```json
    {
      ...
      "ImageManifestDescriptor": {
        ...
        "platform": {
          "architecture": "arm64",
          "os": "linux"
        }
      }
    }
    ```

5. Stop and remove the welcome container by using the `docker rm` command with the `-f` flag:

    ```bash
    docker rm -f welcome
    ```

---

## Step 2: Running a non-native container image

1. Start the `nginx` container, specifying the `linux/amd64` platform:

    ```bash
    docker run --platform linux/amd64 --name non-native -d -p 8080:80 nginx
    ```

    This command looks very similar to the previous run command, except for the `--platform` flag. This is telling the engine to run the `linux/amd64` and _not_ the native `linux/arm64` variant.

2. Open your browser and navigate to [http://localhost:8080](http://localhost:8080). You should see the default NGINX welcome page.

3. Check the platform for the container by running the following command:

    ```bash
    docker inspect non-native
    ```

    Near the end of the output, you should see a field named `ImageManifestDescriptor`. This field should indicate a platform similar to the following:

    ```json
    {
      ...
      "ImageManifestDescriptor": {
          ...
          "platform": {
            "architecture": "amd64",
            "os": "linux"
          }
        }
    }
    ```

4. Stop and remove the welcome container by using the `docker rm` command with the `-f` flag:

    ```bash
    docker rm -f non-native
    ```

> [!TIP]
> What this is demonstrating is that, with emulation support provided by Docker Desktop, you can run both `linux/arm64` (native) and `linux/amd64` containers. Note that native architectures will perform better than emulated architectures. Therefore, when possible, use the native architecture (which is the default choice).

---

## Step 3: Start a multi-container application

In this directory is a `compose.yaml` file. This file will start two containers:

1. **apache/kafka** - a [Kafka](https://kafka.apache.org/documentation/) instance, which is an open-source distributed event streaming platform
2. **kafbat/kafbat-ui** - [Kafbat](https://github.com/kafbat/kafka-ui), an open-source UI for managing Kafka clusters

We are going to use these services in our next lab. But, for this portion, we're simply going to demonstrate that Compose-based applications work as expected.

1. Open a terminal in VS Code by going to **Terminal** -> **New terminal** and navigate to the `app` directory.

    ```bash
    cd app
    ```

2. Start the Compose stack by running the following command:

    ```bash
    docker compose up
    ```

    You should see various log output start to be streamed to the console.

3. You should be able to now open [http://localhost:8080](http://localhost:8080) and see the Kafbat UI.

4. Click on the **Topics** navigation item in the left-hand nav. You should see a single topic named _products_.

5. Click on the **products** topic name to open the topic.

6. In the top-right corner, click the **Produce Message** button.

7. In the _Value_ field, enter the following JSON for the message:

    ```json
    {
      "action": "product_created",
      "id": "sample-product",
      "name": "Sample product",
      "description": "A sample product to validate message sending"
    }
    ```

8. Click the **Produce Message** to send the message.

9. Click on the **Messages** tab to view the messages in the Kafka topic. You should see the message you just added!

    Expand the message to validate it looks the same as the message you just submitted.


## Recap

In this hands-on, you accomplished the following:

- Ran a native container using the `docker/welcome-to-docker` image and explored its platform.
- Demonstrated cross-platform emulation by running a non-native `linux/amd64` container using the `nginx` image.
- Used Docker Compose to start a multi-container application, including a Kafka instance and a Kafka UI, and interacted with the Kafka topic by producing and viewing messages.
