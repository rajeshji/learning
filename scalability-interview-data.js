// Interview-readable narrative content per component, sourced from scalability.txt.
// Keyed by the same slug used elsewhere: slugify(component.name).
// Shape: { overview, patterns[], diagram, example, qa[{q,a}], principal }
const INTERVIEW = {
  "client": {
    overview: "Client isn't part of scalability? It absolutely is — if 100 million clients repeatedly make unnecessary requests, your backend has to process every one of them.",
    patterns: [
      "Client-side caching for config, images, preferences, and relatively static data",
      "Request batching — GET /users?ids=1,2,3,4 instead of 4 separate GET /user/{id} calls; reduces network calls, connection overhead, and server request count",
      "Cursor-based pagination — never return an unbounded result set (GET /users?cursor=abc&limit=50, not GET /users returning 100M records)",
      "Exponential backoff with jitter on retries — retrying immediately 3x in a row when the backend is overloaded is disastrous; back off 1s, 2s, 4s, 8s... with jitter instead"
    ],
    diagram: "Client\n  |\n  v\nLocal Cache\n  | cache miss\n  v\nBackend",
    example: "A mobile app fetches the user's profile on every screen transition. 10M daily active users x 20 screens/day = 200M avoidable calls/day. Add a 5-minute local cache on that endpoint and the same users generate roughly 40M calls — an 80% cut in backend load with zero server-side changes.",
    qa: [
      { q: "How do you prevent clients from causing a retry storm?", a: "I'd use exponential backoff with jitter, server-provided retry hints where appropriate, bounded retry counts, and idempotency for retried operations." }
    ],
    principal: null
  },
  "dns": {
    overview: "At global scale, DNS is your very first traffic-routing decision — get it wrong and every downstream optimization is fighting unnecessary latency.",
    patterns: ["Geo-routing", "Latency-based routing", "Weighted routing", "Health-aware routing", "Anycast", "Multi-region routing"],
    diagram: "         DNS / Global LB\n                |\n     +----------+----------+\n     |                     |\n  US-East                India\n     |                     |\n  Services             Services",
    example: "Users in India are resolved to a US-East endpoint by default. Round-trip latency balloons from ~20ms (regional) to ~250ms purely from geography. Routing India traffic to an AP region — and only failing over to US-East when AP is unhealthy — fixes this without touching a single line of application code.",
    qa: [
      { q: "What if one region goes down?", a: "Global routing should remove unhealthy regions from rotation and fail traffic over to another region, subject to capacity and data-consistency constraints." }
    ],
    principal: "Failover is not useful if the surviving region doesn't have enough capacity."
  },
  "cdn": {
    overview: "A CDN primarily scales read traffic and bandwidth by keeping requests away from your origin entirely.",
    patterns: ["Edge caching", "Cache TTL tuning", "Cache invalidation", "Cache warming", "Origin shielding", "Stale-while-revalidate"],
    diagram: "100 CDN PoPs\n      |\n      v\n   Shield\n      |\n      v\n   Origin",
    example: "Without an origin shield, a viral asset that expires at the same instant across 100 CDN PoPs sends 100 simultaneous requests to origin. With a shield in front of origin, those 100 misses collapse into effectively 1 origin request — the shield deduplicates the stampede regardless of how many edge PoPs missed at once.",
    qa: [
      { q: "What happens if an object becomes extremely popular?", a: "The CDN should absorb most of the traffic. I'd also consider origin shielding and protecting the origin from cache-miss storms." }
    ],
    principal: null
  },
  "lb": {
    overview: "The load balancer distributes traffic across instances — but it also needs its own scaling story and a deliberate choice of routing algorithm.",
    patterns: ["Horizontal application scaling (add more instances behind the LB)", "Round robin / least connections / weighted routing", "Consistent hashing", "Latency-aware routing", "Externalize session state to Redis/DB instead of sticky sessions"],
    diagram: "        LB\n   /    |    \\\n  S1    S2    S3",
    example: "Sticky sessions pin a user to Server 1. When S1 needs to scale down or crashes, that user's session is gone. Move sessions to Redis instead: any of S1/S2/S3 can now serve that user, and scaling S1 in and out becomes a complete non-event for that user's experience.",
    qa: [
      { q: "Why make services stateless?", a: "Stateless services allow any instance to handle any request, which makes horizontal scaling, failover, and load balancing much easier." }
    ],
    principal: null
  },
  "api-gateway": {
    overview: "The API Gateway sits in front of every single request — which means it can become the bottleneck itself if it isn't scaled and protected properly.",
    patterns: [
      "Horizontal, stateless gateway instances behind a load balancer",
      "Rate limiting and load shedding before traffic reaches the backend",
      "Connection pooling for efficient downstream connection management",
      "Hierarchical rate limiting: Global \u2192 Tenant \u2192 User \u2192 API \u2192 Resource",
      "At extreme scale: local token buckets + distributed counters, since a shared Redis eventually becomes a centralized dependency"
    ],
    diagram: "Traffic spike\n     |\n     v\n Rate limit\n     |\n     v\n Load shed\n     |\n     v\n  Backend",
    example: "A flash sale drives 1M requests/sec at an unprotected gateway that passes everything through — the backend, provisioned for 200K/sec, falls over immediately. With rate limiting and load shedding at the gateway layer, the backend only ever sees the 200K/sec it can actually handle; the excess 800K/sec gets shed or queued at the edge instead of crashing the service.",
    qa: [
      { q: "Where should rate limiting happen?", a: "I'd use multiple layers. Edge-level limits protect the infrastructure from broad abuse, while gateway/service-level limits provide tenant, user, API, or resource-specific protection." }
    ],
    principal: "Don't let 1M requests at the gateway become 1M backend requests — the gateway exists to protect downstream services."
  },
  "service": {
    overview: "Application services are the most obvious scaling layer — but scaling compute only helps if compute is actually the bottleneck. And synchronous call chains between services (A \u2192 B \u2192 C \u2192 D) turn a local slowdown into a system-wide outage.",
    patterns: [
      "Horizontal scaling behind a load balancer",
      "Externalize session/file/state to Redis, DB, or object storage instead of local server state",
      "Autoscale on RPS, latency, concurrency, or queue depth — not blindly on CPU",
      "Prefer async communication via a queue over long synchronous call chains",
      "Connection pooling instead of opening a new connection per request",
      "Bounded concurrency between services, per-call timeouts, circuit breakers, and bulkhead isolation for critical vs non-critical work"
    ],
    diagram: "A -> Kafka -> B          (async decoupling)\nA -> CircuitBreaker -> B  (fault isolation)",
    example: "You go from 10 to 110 application servers and p99 latency barely moves. That's the tell: compute was never the bottleneck. Server #111 won't help — the next step is checking the database, cache, connection pool, and any external dependency for saturation instead.",
    qa: [
      { q: "What if you add 100 servers and it's still slow?", a: "Then compute isn't the bottleneck. I'd identify the saturated downstream resource — database, cache, network, connection pool, lock contention, or an external dependency." }
    ],
    principal: null
  },
  "cache": {
    overview: "Caching is one of the biggest scalability tools you have — but it introduces its own failure modes at scale: hot keys, stampedes, and avalanches.",
    patterns: [
      "Cache-aside — read cache, on miss read DB then populate cache (most common)",
      "Read-through — the cache itself loads data on miss",
      "Write-through — write cache + backing store together",
      "Write-behind — write cache first, persist asynchronously (more complex)",
      "Hot key: local cache, replication, key spreading, CDN",
      "Cache stampede: request coalescing, TTL jitter, stale-while-revalidate, locking"
    ],
    diagram: "Request\n   |\n   v\n Cache\n   | hit -> Response\n   | miss\n   v\nDatabase",
    example: "A single hot key like user:123 (a celebrity account) can pull 500K RPS on its own. Adding more cache nodes doesn't help — consistent hashing still sends that one key to the same shard every time. The fix is a local in-process cache for that key, replicating it across nodes, or spreading reads across replicas — not horizontally scaling the cache cluster.",
    qa: [
      { q: "How do you prevent a cache stampede when a hot key expires?", a: "Request coalescing so only one request repopulates the key while others wait, TTL jitter so keys don't expire in lockstep, stale-while-revalidate to serve slightly old data during refresh, or a lock around the repopulation." }
    ],
    principal: "If Redis disappears, every request falls through to the DB at once — a cache avalanche / failure amplification scenario. You need a local fallback, request limiting, and degraded behavior to survive it."
  },
  "db-reads": {
    overview: "Read replication scales read throughput, but it doesn't magically solve consistency — and it does nothing for write capacity. Indexes help too, but aren't free: they cost storage, write throughput, and maintenance overhead, so design them around actual access patterns, not every column.",
    patterns: [
      "Add read replicas behind the primary",
      "Route read-your-write-critical reads to the primary",
      "Session / read-after-write consistency for user-facing reads",
      "Accept and design around eventual staleness where safe",
      "Design indexes around real query patterns — e.g. WHERE user_id = ? ORDER BY created_at DESC suggests a composite index on (user_id, created_at)"
    ],
    diagram: "        Primary\n       /       \\\n      R1        R2    (reads only)",
    example: "A system doing 100K reads/sec and 10K writes/sec against a single primary is read-bottlenecked, not write-bottlenecked. Two read replicas comfortably absorb the 100K reads, leaving the primary free to handle the 10K writes — but now a read immediately following a write can hit a replica that hasn't caught up yet.",
    qa: [
      { q: "What problem does read replication introduce?", a: "Replication lag. A read immediately following a write may hit a replica that hasn't received the update yet." }
    ],
    principal: null
  },
  "db-writes": {
    overview: "When write throughput exceeds a single database's capacity, read replicas won't help — you need to partition the write path itself, and then keep those partitions balanced, since a technically-sharded database can still be practically unscalable if one shard takes 90% of traffic.",
    patterns: [
      "Partition/shard by a key aligned to the access pattern (e.g. user_id \u2192 shard)",
      "Hash-based partitioning to avoid sequential hot spots",
      "Key salting for hot entities, and splitting hot entities into their own partition",
      "Write batching where semantics allow it — fewer round trips, but higher latency and more complex failure handling"
    ],
    diagram: "              Router\n           /    |    \\\n          DB1   DB2   DB3",
    example: "A single database tops out at 20K writes/sec, but the product needs 200K writes/sec. Adding read replicas does nothing here — replicas only serve reads. Sharding writes by user_id across enough shards to clear 200K/sec combined is the only lever that actually works.",
    qa: [
      { q: "You've sharded the database — is it automatically scalable now?", a: "Not necessarily. Technically sharded doesn't mean practically scalable — if one shard absorbs 90% of traffic due to a skewed key, adding more shards doesn't help. I'd fix the partition key, use hash-based partitioning, or salt/split the hot entity." }
    ],
    principal: "I care about not just partition count but partition balance and access-pattern skew."
  },
  "db-storage": {
    overview: "Storage growth is one of the quietest scalability failures — capacity looks fine until table/index bloat and unarchived history eat it away, and disk I/O degrades non-linearly as disks fill.",
    patterns: [
      "Storage tiering — hot / warm / cold data placement",
      "Compression to reduce footprint (at the cost of CPU)",
      "TTL-based archiving to cheaper storage",
      "Partition pruning so queries and maintenance only touch relevant data"
    ],
    diagram: "Hot (SSD, fast) -> Warm (cheaper) -> Cold (archive/object storage)",
    example: "A table growing 50GB/month with no archiving strategy silently fills a 2TB disk in about 3.3 years — but I/O throughput degrades well before the disk is actually full, as fragmentation and compaction overhead increase. Alerts set at '90% full' often fire too late to react calmly.",
    qa: [
      { q: "How do you know storage will become a problem before it does?", a: "I'd track disk utilization trend, IOPS degradation as disks fill, and table/index growth rate — and project time-to-full instead of waiting for an alert at 100%." }
    ],
    principal: null
  },
  "db-connections": {
    overview: "Connection scalability is easy to forget: 1000 app instances each opening 100 DB connections is 100,000 connections — the database can die even when its CPU looks perfectly healthy.",
    patterns: ["Client-side connection pooling", "Connection limits per service", "Bounded concurrency", "A pooling/proxy layer (e.g. PgBouncer) in front of the database", "Careful, connection-aware autoscaling"],
    diagram: "1000 instances x 100 connections each = 100,000 connections -> DB dies, CPU fine",
    example: "An autoscaling event during a traffic spike doubles your fleet from 50 to 100 instances. If each instance opens a pool of 100 connections, you just added 5,000 new connections to the database in seconds — often enough on its own to hit max_connections and start rejecting everyone, old and new instances alike.",
    qa: [
      { q: "Why would the database reject connections when its CPU is only at 20%?", a: "Because max_connections is a hard cap independent of CPU headroom. Every service replica opening its own pool means total connections can exceed that cap long before compute is stressed — a pooling proxy like PgBouncer multiplexes many app connections onto far fewer real DB connections." }
    ],
    principal: null
  },
  "kafka": {
    overview: "Kafka scales primarily through partitions — but partition count sets a hard ceiling on consumer parallelism, and a bad partition key creates a hot partition that no amount of extra consumers can fix.",
    patterns: [
      "Partitions define the maximum useful parallelism for a consumer group",
      "One consumer in a group generally processes one partition at a time",
      "Choose a high-cardinality, evenly-distributed partition key",
      "Key salting for hot entities trades away strict ordering/lookup guarantees"
    ],
    diagram: "Topic\n |\n +-- P0\n +-- P1\n +-- P2\n +-- P3",
    example: "A topic with 4 partitions and 100 consumer instances in the same group does NOT get 100x parallelism — only 4 consumers are ever active at once, the other 96 sit fully idle. Separately: a partition key of celebrity_user_id can send P0 to 90K events/sec while P1-P3 sit at 3-4K each — the same skew problem as a hot DB shard, just inside Kafka.",
    qa: [
      { q: "How do you scale consumers?", a: "Increase consumer instances up to the useful partition parallelism, then increase partitions if the workload and ordering model allow it." }
    ],
    principal: null
  },
  "consumers": {
    overview: "Consumer lag means the consumer side is falling behind the producer side — and the fix is almost never 'just add consumers' without checking what's downstream of them.",
    patterns: ["Monitor consumer lag, oldest-event age, queue depth, and processing latency", "Scale consumer instances up to partition parallelism", "Watch for simply relocating the bottleneck (e.g. straight into the database)"],
    diagram: "Producer 100K/sec -> [lag growing] -> Consumer 50K/sec",
    example: "A producer writing at 100K events/sec against a consumer group processing 50K events/sec means lag grows continuously and compounds — every second adds another 50K events to the backlog. Adding consumers helps only up to the partition count; beyond that you're watching the same lag from more idle machines.",
    qa: [],
    principal: "Kafka -> 100 consumers -> Database -> \ud83d\udd25 — you've simply moved the bottleneck, not removed it."
  },
  "object-storage": {
    overview: "Large blobs — video, images, documents, exports — should never round-trip through your application servers if you can avoid it.",
    patterns: ["Pre-signed URLs so clients upload/download directly to/from object storage", "Application only handles metadata, never the blob itself", "Move large payloads out of the request-serving path entirely"],
    diagram: "Client -> Pre-signed URL -> Object Storage\nApplication -> Metadata only",
    example: "Sequentially named objects (e.g. 2024-01-15-report-0001.csv, -0002.csv, ...) all hash into the same narrow internal partition range. A bulk export job writing 5M objects/hour in that pattern starts getting 503 SlowDown responses long before the bucket is anywhere close to its total capacity — randomizing the key prefix fixes it instantly.",
    qa: [],
    principal: "Move large blobs out of the request-serving path — that's the core scalability principle here."
  },
  "search": {
    overview: "Search clusters scale through sharding and replicas — but adding nodes only helps if the workload can actually be spread across them.",
    patterns: [
      "Sharding to distribute index data",
      "Replicas to scale search reads",
      "Separate coordinating nodes from data nodes at larger scale",
      "Better routing/shard design to avoid hot shards",
      "Async indexing pipeline (Kafka \u2192 indexing workers \u2192 Elasticsearch) instead of synchronous index-on-write, so indexing scales independently of user latency"
    ],
    diagram: "        Search Cluster\n    /       |       \\\n  Shard   Shard    Shard",
    example: "A 10-shard index where one shard holds 40% of the documents (a skewed customer_id routing key) makes every query touching that shard 3-4x slower than average. Adding 10 more nodes to the cluster does nothing for that — the hot shard is still one shard, and it still has to do the same disproportionate amount of work.",
    qa: [
      { q: "Why not just add more Elasticsearch nodes?", a: "Adding nodes only helps if the workload can be distributed across them. If a hot shard or skewed routing limits parallelism, additional nodes may remain underutilized." }
    ],
    principal: null
  },
  "workers": {
    overview: "Worker pools turn asynchronous work into throughput — but that throughput is capped by pool size divided by per-job time, and a backlog doesn't recover on its own once it starts spiraling.",
    patterns: ["Autoscale workers on queue depth, not CPU", "Priority queues / separate pools so critical jobs don't starve behind bulk work", "Split long-running jobs into smaller chunks to reduce latency variance", "Pre-provision capacity ahead of known traffic events instead of relying purely on reactive autoscaling"],
    diagram: "Queue depth growing\n   |\n   v\nAutoscale workers (lags on cold start)\n   |\n   v\nJobs time out -> requeued -> backlog grows further",
    example: "A queue steadily processing 500 jobs/sec suddenly receives a burst of 50,000 jobs. If autoscaling takes 90 seconds to add capacity, the backlog has already grown by roughly 45,000 jobs before help arrives — and if jobs start timing out and requeuing during that window, the backlog can keep growing even while 'recovery' is technically underway.",
    qa: [
      { q: "How do you stop a backlog from spiraling out of control?", a: "Autoscale on queue depth rather than CPU, pre-provision ahead of known spikes, and use priority lanes so critical jobs are never stuck behind bulk work during a backlog." }
    ],
    principal: null
  },
  "external-api": {
    overview: "Calling a third party is a hard capacity ceiling you don't control. If your service can handle 100K RPS but the payment provider allows only 5K RPS, you cannot simply send 100K.",
    patterns: ["Rate limiting matched to their limits", "Queueing in front of the call", "Concurrency limits", "Circuit breakers", "Retries with exponential backoff and jitter", "Idempotency for safe retries", "Caching responses where safe"],
    diagram: "100K clients -> 503 -> 100K retry -> 503 -> 100K retry -> \ud83d\udd25",
    example: "Your service can handle 100K RPS, but your payment provider caps you at 5K RPS. Sending all 100K at once means 95K either get rejected outright or queue indefinitely — the third party's limit is your real ceiling, no matter how much you scale your own side. Worse, if they return 503 and all 100K clients retry immediately, you get a self-inflicted retry storm on top of the original throttling.",
    qa: [],
    principal: "Exponential backoff with jitter is the fix for a retry storm against a struggling external dependency."
  },
  "websocket": {
    overview: "WebSocket connections are long-lived, so scaling them is about connection count and cross-node message delivery — not request throughput.",
    patterns: ["Shard connections across many WS nodes behind an LB", "A pub/sub layer (Kafka/Redis) so any node can deliver to any connected client", "Connection/session routing to reach the right node", "Watch memory, file descriptors, and network bandwidth per node"],
    diagram: "        LB\n     /   |   \\\n   WS1  WS2  WS3\n     \\   |   /\n     Pub/Sub",
    example: "10M concurrent WebSocket connections at roughly 10KB of server-side memory each is already 100GB of RAM just to hold idle connections — before a single message is ever sent. That's why WebSocket capacity planning is fundamentally about connection count and file descriptors, not message throughput.",
    qa: [
      { q: "How does WS1 send a message to a user connected to WS3?", a: "Through a distributed messaging layer — a pub/sub backplane like Redis or Kafka — often combined with connection/session routing." }
    ],
    principal: null
  },
  "notification": {
    overview: "Notifications should never be sent synchronously from the request path — and even async, you're ultimately capped by the slowest provider.",
    patterns: ["Dispatch via a queue, not inline in the API", "Scale notification workers independently of the API", "Per-provider rate limiting in front of external APIs", "Batching and provider sharding for very high fan-out events"],
    diagram: "API -> Queue -> Notification Workers -> Provider rate limiter -> Email/Push/SMS",
    example: "A single 'order shipped' event fanning out to push + email + SMS for 2M users during a flash sale generates 6M individual provider calls almost instantly. Most push/SMS providers throttle well below that rate — the fan-out amplification is the real scaling problem, not the original trigger event.",
    qa: [],
    principal: "Your system's capacity is often limited by its slowest dependency."
  },
  "logs": {
    overview: "Don't synchronously write logs to a central database — that couples your application's performance to your logging pipeline's performance, at exactly the moment (an incident) when you need both to be healthy.",
    patterns: ["Application \u2192 local agent \u2192 Kafka \u2192 log processors \u2192 storage", "Let Kafka buffer during traffic spikes so consumers can scale independently", "Sampling: 100% errors, 10% normal requests, 1% debug", "Decouple log volume growth from application request latency"],
    diagram: "Application -> Local/Agent -> Kafka -> Log processors -> Storage",
    example: "At 100K requests/sec with ~10KB of log output per request, that's 1GB/sec of raw log volume — more than most pipelines can ingest, index, and ship without falling behind. And it's worst exactly during an incident, when error volume (and therefore log volume) spikes and you most need the pipeline to keep up.",
    qa: [],
    principal: null
  },
  "metrics": {
    overview: "Observability has its own scalability problem: tagging every request in full detail generates more data than most pipelines can handle, and high-cardinality metrics can take down the monitoring stack itself.",
    patterns: ["Sampling instead of logging/tagging every event", "Aggregate metrics instead of storing every raw event", "Avoid high-cardinality labels (user_id, request_id, session_id) on hot-path metrics", "Downsampling and tiered retention for long-term storage"],
    diagram: "Good:      http_requests_total{service, endpoint, status}\nDangerous: http_requests_total{user_id, request_id, session_id}",
    example: "Adding a user_id label to a hot-path counter with 50M active users turns one time series into 50M unique time series overnight. Most TSDBs will exhaust memory or blow past their series-count budget long before that finishes ingesting — the monitoring system itself becomes the outage.",
    qa: [],
    principal: "High-cardinality metrics can become a scalability problem in their own right."
  },
  "kubernetes": {
    overview: "Kubernetes gives you the mechanisms for scaling — replicas, autoscaling, scheduling, health checks, rolling deploys — but it doesn't fix a bottleneck that isn't compute. And at 10K+ services, you can't manually maintain every endpoint or config value either.",
    patterns: ["Horizontal Pod Autoscaler (HPA) for compute-bound services", "Cluster autoscaling to ensure enough nodes exist to schedule new pods", "Pre-scaling / warm capacity / queue buffering to cover slow pod startup during spikes", "Service discovery instead of manually maintained endpoints", "Locally cached configuration instead of a config-service call on every request"],
    diagram: "Traffic spike -> HPA -> new pods -> (2 min startup) -> too late without pre-scaling",
    example: "If pods take 2 minutes to cold-start, a sudden traffic spike triggers HPA, which schedules new pods — that finish starting up 2 minutes later. If the spike itself only lasted 90 seconds, the new capacity arrives after the damage (errors, timeouts) is already done. Pre-scaling and warm standby pods close that gap.",
    qa: [
      { q: "If the database is the bottleneck, does adding pods help?", a: "No — adding pods only helps if compute was the actual constraint. If the database is saturated, more application pods just send it more load faster." }
    ],
    principal: null
  },
  "region": {
    overview: "Multi-region scales compute, storage, and traffic — but data is the hard part, and failover capacity has to be planned for, not assumed. If Region A (100K RPS) fails and all that traffic moves to Region B, which was only ever provisioned for 50K RPS, you get a second, self-inflicted outage.",
    patterns: ["Single-writer region (simpler consistency) vs multi-writer regions (more availability, harder conflict resolution)", "N+1 capacity planning so a failed region's traffic has somewhere to go", "Active-active vs active-passive topology", "Degraded mode and traffic shedding as a deliberate, pre-planned fallback"],
    diagram: "Region A (100K RPS) fails -> all traffic -> Region B (50K RPS capacity) -> \ud83d\udd25",
    example: "Region A normally serves 100K RPS and Region B normally serves 50K RPS for its own users. If Region A goes down and all 100K RPS fails over to Region B with no extra headroom, Region B — which was healthy seconds earlier — now gets crushed by 150K RPS against 50K of capacity. The 'backup' plan just caused a second outage.",
    qa: [],
    principal: "Failover capacity is part of capacity planning — decide on N+1 capacity, active-active vs active-passive, degraded mode, and traffic shedding ahead of time, not during the incident."
  }
};

// Page-level content for scalability.html — the system-wide map and the one
// concept to internalize above all others: bottleneck migration.
const INTERVIEW_META = {
  systemMap:
    "                     CLIENTS\n" +
    "                        |\n" +
    "                        v\n" +
    "                DNS / Global Routing\n" +
    "                        |\n" +
    "                        v\n" +
    "                     CDN\n" +
    "                        |\n" +
    "                        v\n" +
    "               Load Balancer / Edge\n" +
    "                        |\n" +
    "                        v\n" +
    "                  API Gateway\n" +
    "                        |\n" +
    "         +--------------+--------------+\n" +
    "         |              |              |\n" +
    "         v              v              v\n" +
    "      Service A      Service B      Service C\n" +
    "         |              |              |\n" +
    "         v              v              v\n" +
    "       Cache          Cache          Cache\n" +
    "         |              |              |\n" +
    "         +--------------+--------------+\n" +
    "                        |\n" +
    "          +-------------+-------------+\n" +
    "          |                           |\n" +
    "          v                           v\n" +
    "      Database                  Message Queue\n" +
    "          |                           |\n" +
    "          v                           v\n" +
    "    Read Replicas                 Workers\n" +
    "          |                           |\n" +
    "          v                           v\n" +
    "     Object Store              Search / DB\n\n" +
    "And around everything: Observability, Deployment, Multi-region, Security, Disaster Recovery, Capacity Management.",
  bottleneckMigration: {
    title: "The most important system-wide concept: bottleneck migration",
    steps: [
      "Step 1: API is the bottleneck \u2192 you scale the API.",
      "Step 2: Now the DB is the bottleneck \u2192 you scale the DB.",
      "Step 3: Now Kafka is the bottleneck \u2192 you scale Kafka.",
      "Step 4: Now the External API is the bottleneck \u2192 you can't scale it, it's someone else's system."
    ],
    conclusion: "Scalability is an iterative process of identifying and removing the current bottleneck — that's far more important than memorizing any one technology."
  }
};
