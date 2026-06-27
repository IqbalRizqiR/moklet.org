---
name: skill_performance_optimization_master
description: Comprehensive performance optimization strategy targeting bottlenecks, caching, and resource efficiency
---

# Performance Optimization Master (optimize)

When triggered by signals like `performance`, `slow`, `bottleneck`, `latency`, `timeout`, or `memory_leak`, follow these strategy steps precisely:

1. **Profile** -- the application to identify bottlenecks using built-in profilers or APM tools
2. **Analyze** -- algorithmic complexity of hot paths (target O(n) or better)
3. **Implement** -- caching strategies (in-memory, Redis, CDN) for frequently accessed data
4. **Optimize** -- database queries with proper indexing and query restructuring
5. **Apply** -- lazy loading and pagination for large datasets
6. **Use** -- connection pooling and keep-alive for external services
