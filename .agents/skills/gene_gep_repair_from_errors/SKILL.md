---
name: gene_gep_repair_from_errors
description: repair strategy: error, exception, failed, unstable
---

# gene_gep_repair_from_errors (repair)

When triggered, follow these strategy steps precisely:

1. Extract structured signals from logs and user instructions
2. Select an existing Gene by signals match (no improvisation)
3. Estimate blast radius (files, lines) before editing
4. Apply smallest reversible patch
5. Validate using declared validation steps; rollback on failure
6. Solidify knowledge: append EvolutionEvent, update Gene/Capsule store

## Preconditions
- signals contains error-related indicators

## Constraints
- max_files: 20
- forbidden_paths: ['.git', 'node_modules']
