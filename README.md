# MS Build 2025 Lab Materials

This repository contains the materials for the "Port and build apps natively" lab.

---

**This branch represents the completed work**

To try it out:

1. Open a terminal in the `app` directory
2. Run `docker compose up -d` to launch the dependencies
3. Run `npm install` to install the app dependencies
4. Run `npm run dev` to start the app
5. Open [http://localhost:8080](http://localhost:8080), navigate to the topics, select the **products** topic, and open the **Messages** tab.
6. Click the **Produce Message** and enter a new product message (example JSON below):

    ```json
    {
      "action": "product_created",
      "id": "product-51cb2813",
      "name": "LucidFlow",
      "description": "A bedside device utilizing subtle, dynamically shifting ambient light and binaural audio to gently guide you into deeper, more restorative sleep. Connects to your Microsoft 365 calendar to proactively adjust lighting and soundscapes based on your upcoming schedule, minimizing stress and promoting optimal rest."
    }
    ```

7. Watch the app console output to see the generated email!


---


## Table of contents

The lab is structured as a series of mini-lectures with small hands-on segments. The slides can be found here (link coming soon) and the respective hands-on sections are available below.

1. [Running native and non-native containers and multi-container apps](./1-running-containers.md)
2. [Writing an event-driven GenAI application that uses Docker Model Runner](./2-writing-genai-app.md)
3. [Building multi-platform container images](./3-building-multi-platform-images.md)
