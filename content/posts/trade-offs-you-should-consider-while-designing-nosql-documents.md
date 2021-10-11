---
title: "Trade-offs you should consider while designing NoSQL documents"
date: 2021-10-11T20:14:57+03:00
tags: ["nosql", "database", "schema design", "trade-off"]
draft: false
---

While designing a schema for a document, there is not certain way to achieve best possible performance on all use-cases in NoSQL world, despite it’s more or less possible for SQL table design by using normalization techniques as much as possible. In this post, we are going to walkthrough the points we should consider while designing a document schema for a NoSQL database to get maximum performance via deciding on trade-offs properly.

This document contains specific concepts for Couchbase but most of the concepts can be generalized to be used in other NoSQL databases too.

> Different isn’t always better, but better is always different.

# Ways of Accessing to Data

## Key/Value

While Couchbase is document database, at its heart is a distributed key-value (KV) store. A KV store is an extremely simple, schema-less approach to data management that, as the name implies, stores a unique ID (key) together with a piece of arbitrary information(value); it may be thought of as a hash map or dictionary. The KV store itself can accept any data, whether it be a binary blob or a JSON document, and Couchbase features such as N1QL make use of the KV store’s ability to process JSON documents.

Due to their simplicity, KV operations execute with extremely low latency, often submillisecond. The KV store is accessed using simple CRUD (Create, Read, Update, Delete) APIs, and provide the simplest interface when accessing documents using their IDs.

The KV store contains the authoritative, most up-to-date state for each item. Query, and other services, provide eventually consistent indexes, but querying the KV store directly will always access the latest version of data. Applications use the KV store when speed, consistency, and simplified access patterns are preferred over flexible query options.

All KV operations are atomic, which means that Read and Update are individual operations. In order to avoid conflicts that might arise with multiple concurrent updates to the same document, applications may make use of Compare-And-Swap (CAS), which is a per document checksum that Couchbase modifies each time a document is changed.

#### Pros:

- Very fast access and if your cluster is sized correctly, the object is already in the Couchbase managed cache.
- Data is strongly consistent. i.e. You always read your own writes.
- Scales out linearly with even distribution of data across nodes.

#### Cons:

- The application requires more intelligence to access the objects it needs.
- Requires more advanced data modeling.
- Requires more in-depth understanding of your application’s data access patterns before you write your application.

## Query

The query service is an engine for processing N1QL queries and follows the same scalability paradigm that all the services use which allows, allowing the user to scale query workloads independently of other services as needed.

### Query consistency

Under the hood, Couchbase indexes are updated asynchronously after the data has been changed by the application. In comparison to other database technologies, this allows for much higher write throughput but introduces the possibility of inconsistency between the data and it’s indexes.

Couchbase therefore provides several levels of control over query consistency, allowing the application to choosing between faster queries (ignoring pending mutations) and stronger consistency.

- **not_bounded (default):** Return the query response immediately, knowing that some data may still be flowing through the system. This consistency level is useful for queries that favor low latency over consistency.
- **at_plus:** Block the query until its indexes have been updated to the timestamp of the last update, knowing that some updates may have happened since but don’t need to be consistent. This is for “read-your-own write” semantics by a single application process/thread.
- **request_plus:** Block the query until its indexes are updated to the timestamp of the current query request. This is a strongly consistent query and is used to maintain consistency across applications/processes.

Indexes are updated as fast as possible, regardless of query consistency requirements. Even a query requesting strong consistency may return extremely quickly if its indexes are not processing large volumes of updates.

#### Pros:

- Very flexible to query data from the database to get answers you need.
- The indexes are located only on the nodes servicing the Index nodes and not spread out across the cluster.

#### Cons:

- Queries will never be as performant as accessing data via object ID, for reasons I already went over.
- Eventually consistent by default, but you can query with stale=false to immediately update the index, but take a performance hit. For most workloads though, the index is being updated as fast as possible in the background and consistency should be fine.

## Takeaways

- Always try to design document schemas in a way you can access with key directly.
- KV accesses are strongly consistent.
- Queries are slower than KV access.
- Queries are eventually consistent because data retrieval should be done from multiple nodes.

---

# Designing the schema

The most important consideration of design process is listing down the access patterns for the data. Using the access patterns we have, we can decide on optimal way of storing the data so that we can access it quickly, and in a strongly consistent way if it’s needed.

## Points to consider

Ask “What questions do I want to ask of my data?” and list down all the access patterns.

Sketch out a draft schema with embedding all the fields, then determine:

- Which part of data is going to be accessed as read heavy, write heavy or balanced.
- Which part of data should be accessed separately.
- Which part of data may grow indefinitely.

## Embedding

#### Pros:

- **Speed of access:** embedding everything in one document means we need just one database look-up.
- **Potentially greater fault tolerance at read time:** in a distributed database our referred documents would live on multiple machines, so by embedding we’re introducing fewer opportunities for something to go wrong and we’re simplifying the application side.

#### Cons:

- **Queryability:** by making multiple copies of the same data, it could be harder to query on the data we replicate as we’ll have to filter out all of the embedded copies.
- **Size:** you could end up with large documents consisting of lots of duplicated data.
- **Possible inconsistency:** we are relying on our application code to be robust enough to find and write every instance of the denormalized data in the database and nothing going wrong on the network, database side or elsewhere that would prevent the update completing fully.

#### When to embed:

- Reads greatly outnumber writes.
- You’re comfortable with the slim risk of inconsistent data across the multiple copies.

## Referring

#### Pros:

- Maintaining one canonical copy of the data.
- When we query the data set we can be more sure that the results are the canonical versions of the data rather than embedded copies.
- **Better cache usage:** as we’re accessing the canonical documents frequently, they’ll stay in our cache, rather than having multiple embedding copies that are accessed less frequently and so drop out of the cache.
- **More efficient hardware usage:** embedding data gives us larger documents with multiple copies of the same data; referring helps reduce the disk and RAM our database needs.

#### Cons:

- Multiple look-ups.

#### When to refer:

- The embedded version would be unwieldy.
- You want to ensure your cache is used efficiently.
- Consistency of the data is a priority.

## Decide on Embed or Refer

Following table can be considered when deciding whether to embed or refer to a data:

```
| If                                                  | Then  |
| --------------------------------------------------- | ----- |
| One to One Relationship                             | Embed |
| One to Many Relationship                            | Embed |
| Many to One Relationship                            | Refer |
| Many to Many Relationship                           | Refer |
| Reads are mostly on parent and child together       | Embed |
| Reads are mostly on parent or child (not together)  | Refer |
| Writes are mostly on parent on child together       | Embed |
| Writes are mostly on parent or child (not together) | Refer |
```

---

## Sources

[Couchbase Under The Hood](https://info.couchbase.com/rs/302-GJY-034/images/Couchbase_Under_The_Hood_WP.pdf)

[A JSON Data Modelling Guide](https://blog.couchbase.com/a-json-data-modeling-guide/)

[Data Modelling When Ember or Refer](https://blog.couchbase.com/data-modelling-when-embed-or-refer/)

[Data Modelling Key Design](https://blog.couchbase.com/data-modelling-key-design/)

[Three Things to Know About Document Database Modelling](https://blog.couchbase.com/three-things-know-about-document-database-modelling-part-1/)
