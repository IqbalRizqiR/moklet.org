---
name: gene_gep_innovate_from_opportunity
description: innovate strategy: user_feature_request, user_improvement_suggestion, perf_bottleneck, capability_gap, stable_success_plateau, external_opportunity
---

# gene_gep_innovate_from_opportunity (innovate)

When triggered, follow these strategy steps precisely:

1. Extract opportunity signals and identify the specific user need or system gap
2. Search existing Genes and Capsules for partial matches (avoid reinventing)
3. Design a minimal, testable implementation plan (prefer small increments)
4. Estimate blast radius; innovate changes may touch more files but must stay within constraints
5. Implement the change with clear validation criteria
6. Validate using declared validation steps; rollback on failure
7. Solidify: record EvolutionEvent with intent=innovate, create new Gene if pattern is novel, create Capsule on success

## Preconditions
- at least one opportunity signal is present
- no active log_error signals (stability first)

## Constraints
- max_files: 25
- forbidden_paths: ['.git', 'node_modules', 'assets/gep/events.jsonl']
