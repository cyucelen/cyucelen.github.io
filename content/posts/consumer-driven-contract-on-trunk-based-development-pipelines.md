---
title: "Consumer Driven Contract testing on trunk based development pipelines using Pact"
date: 2021-08-22T15:14:57+03:00
tags: ["testing", "cdc", "trunk based"]
draft: false
---

Consumer driven contracts are more than a need for systems consisting of several different components which are connected to each other over a network (sounds familiar right? a.k.a. microservices).

Usually, these services owned by different teams which are split by domains. By the number of services and the number of integration points among them grows, it becomes harder to keep track of API changes and requires cross domain communication for each change. For every API change request, different teams should handshake on new contract, and additionally should consider to not break other consumer contracts. Can you imagine how much time it requires and how error prone is this process just after several services?

Consumer Driven Contract(CDC) testing steps in to automate this time consuming process and allow us to deliver faster.

In this post, we’ll explain how to setup a continuous delivery pipeline with CDC tests using [Pact](https://pact.io/) to deliver our services in confidence.

# How Pact works?

Pact consists of a central server which is called as **broker** to store and keep track of **contract** files between **consumers** and **providers.**

A **consumer**, as its name, is a service which consumes a **provider** which is another service which provides the expected functionality. In order to verify the compatibility of integration between consumers and providers, pact expects us to create **contract** files.

Each consumer should create a contract file -_which is basically a json file_\- specifying, given a request sent to specified provider, expected response fields, types, headers etc.

Pact provides [tools](https://github.com/pact-foundation) for several languages to generate this contract files over unit tests of your client functions. We call this step as **consumer test.**

After creating contract files, we are versioning them and publishing it to pact broker to test it against provider later on. When contract is published to broker, we are ready to test if our provider is really compatible with this contract or not. We call this step as **provider test**. In this step, all contracts belongs to the provider is fetched from broker and validated against provider service **in isolation**.

> # _What do you mean by “in isolation”?_
>
> We are mocking all dependencies of provider service in this step, because we only want to validate the contract not the functionality. And this is one of the very points where Pact shines. To validate the compatibility between services, we don’t need to spin up all services together, we don’t need to depend on test data, basically avoiding time consuming and brittle end-to-end tests.

Provider test publishes the verification result back to broker to save it. By this way, we have all the compatibility matr between consumers and providers for each version of them. We can utilize this information to decide whether deploy the specific version consumer or not.

# How to automate this process correctly?

First of all, let’s define our goals:

- When consumer publishes a contract for a breaking change, **we should break** the consumer pipeline to prevent deployment. _Otherwise it will crash on runtime, since provider is not compatible with recently published contract._
- When consumer publishes a contract with no change or if provider still satisfies the contract, **we should not break** the consumer pipeline.
- When provider fails to satisfy any consumer contract, **we should break** the provider pipeline to prevent deployment.
- When provider satisfies all contracts, **we should not break** the provider pipeline.
- When consumer publishes a contract which is not compatible with the current version of provider, **consumer pipeline** **should break** before deployment but **provider pipeline should not break** for further commits. _Otherwise some other teams new contract which represents a consumer’s new version not yet deployed to anywhere will block provider pipeline for any further commits and this will prevent our team to develop any other feature or bug fix before satisfying other teams contract._

We defined our test cases! Now, let’s try to design a pipeline which suits our needs to automate this process correctly.

# Design of the pipelines

There are ways of implementing this flow with feature branch approach, but in this section we will try to define a way to achieve same flow for [trunk based development.](https://trunkbaseddevelopment.com/)

To keep it simple, following example will represent 1 consumer, 1 provider service and single environment to deploy but it works on any number of consumers and providers and environments.

![](/img/cdc-pipelines.png)

To elaborate the legend of the above diagram, let’s define what usual and trigger only pipeline means.

**Usual pipeline** is linked list of jobs will run on every commit.

**Trigger only pipeline** is linked list of jobs will run only when pipeline is triggered from a webhook. We will configure Pact broker to trigger provider pipeline whenever a new version of contract published from its consumers. Trigger only pipeline consists of a single step, which will try to verify a specific version of a consumer contract.

Let’s try to simulate the behavior of the design!

**_On a commit to consumer repository:_**

- Running the consumer tests stage will generate the new contract files, pipeline will publish the generated contract files to broker on next stage.
- When a new contract received from broker, it will trigger provider pipeline with sending contract version, provider tests will run to verify this specific version of contract and send the results back to broker -_in the meantime consumer pipeline continues to run_\-.
- When consumer arrives to “_can i deploy to prod”_ stage, it sends a request to broker to receive the result of provider verification. If contract is verified by provider, pipeline continues to next stage, otherwise it will break to prevent deploy.
- After we ran deployment stage we are tagging this version of contract as “prod”.

**_On a commit to provider repository:_**

- On provider test stage, provider will fetch all contract files belongs to it and tagged with “prod” tag. This means that provider will try to validate itself against whats already on production environment. By this way we will prevent blocking provider pipeline for contracts which is not on live yet. If provider verifies the contracts successfully, it means that we are ready to ship!

Validating this behavior with the test cases above is left as an exercise to the reader. If you find any edge case or a case which doesn’t satisfies the defined goals, please comment below to discuss.

> If it hurts, do it more frequently, and bring the pain forward.  
> — Jez Humble
