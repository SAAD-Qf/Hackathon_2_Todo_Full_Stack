# Event Schema Specifications

**Feature**: Cloud-Native Event-Driven - Event Schemas
**Created**: 2026-01-08
**Status**: Implementation Ready
**Constitution**: Phase V (v5.0.0)

## Overview

This document specifies the JSON Schema definitions for all domain events in the Todo AI System. All events MUST conform to these schemas, and schema validation MUST occur before publishing to Kafka.

**Critical Constraint**: All event schemas MUST be generated from these specifications. No manual schema editing is permitted.

---

## Schema Versioning Strategy

### Semantic Versioning

Event schemas follow semantic versioning (MAJOR.MINOR.PATCH):

- **MAJOR**: Breaking changes (field removal, type changes, required field additions)
- **MINOR**: Backward-compatible additions (new optional fields)
- **PATCH**: Documentation or metadata changes (no schema changes)

### Compatibility Rules

- **Backward Compatibility**: Consumers can read events from older producers
- **Forward Compatibility**: Consumers can ignore unknown fields from newer producers
- **Full Compatibility**: Both backward and forward compatible

### Version Evolution Example

```
v1.0.0 → v1.1.0 (add optional field)        ✅ Backward compatible
v1.0.0 → v2.0.0 (remove field)              ❌ Breaking change
v1.0.0 → v1.0.1 (update description)        ✅ Non-breaking
```

---

## Base Event Schema

All events inherit from this base schema:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://todo-ai.example.com/schemas/base-event.json",
  "title": "Base Event",
  "description": "Base schema for all domain events",
  "type": "object",
  "required": [
    "event_id",
    "event_type",
    "event_version",
    "timestamp",
    "correlation_id",
    "tenant_id",
    "data"
  ],
  "properties": {
    "event_id": {
      "type": "string",
      "format": "uuid",
      "description": "Unique identifier for this event"
    },
    "event_type": {
      "type": "string",
      "description": "Type of event (e.g., task.created)"
    },
    "event_version": {
      "type": "string",
      "pattern": "^v\\d+\\.\\d+\\.\\d+$",
      "description": "Schema version (semantic versioning)"
    },
    "timestamp": {
      "type": "string",
      "format": "date-time",
      "description": "Event timestamp in ISO 8601 format"
    },
    "correlation_id": {
      "type": "string",
      "format": "uuid",
      "description": "Correlation ID for distributed tracing"
    },
    "tenant_id": {
      "type": "string",
      "description": "Tenant identifier for multi-tenancy"
    },
    "data": {
      "type": "object",
      "description": "Event-specific payload"
    }
  },
  "additionalProperties": false
}
```

---

## Event Schema: task.created

### Version: v1.0.0

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://todo-ai.example.com/schemas/task-created-v1.json",
  "title": "Task Created Event",
  "description": "Emitted when a new task is created",
  "allOf": [
    {
      "$ref": "https://todo-ai.example.com/schemas/base-event.json"
    },
    {
      "properties": {
        "event_type": {
          "const": "task.created"
        },
        "event_version": {
          "const": "v1.0.0"
        },
        "data": {
          "type": "object",
          "required": [
            "task_id",
            "title",
            "priority",
            "completed",
            "created_by",
            "created_at"
          ],
          "properties": {
            "task_id": {
              "type": "integer",
              "minimum": 1,
              "description": "Unique task identifier"
            },
            "title": {
              "type": "string",
              "minLength": 1,
              "maxLength": 200,
              "description": "Task title"
            },
            "description": {
              "type": "string",
              "maxLength": 5000,
              "description": "Task description (optional)"
            },
            "priority": {
              "type": "string",
              "enum": ["low", "medium", "high"],
              "description": "Task priority"
            },
            "tags": {
              "type": "array",
              "items": {
                "type": "string",
                "minLength": 1,
                "maxLength": 50
              },
              "maxItems": 10,
              "description": "Task tags"
            },
            "due_date": {
              "type": ["string", "null"],
              "format": "date-time",
              "description": "Task due date (optional)"
            },
            "completed": {
              "type": "boolean",
              "description": "Task completion status"
            },
            "created_by": {
              "type": "string",
              "description": "User ID who created the task"
            },
            "created_at": {
              "type": "string",
              "format": "date-time",
              "description": "Task creation timestamp"
            }
          },
          "additionalProperties": false
        }
      }
    }
  ]
}
```

### Example Event

```json
{
  "event_id": "550e8400-e29b-41d4-a716-446655440000",
  "event_type": "task.created",
  "event_version": "v1.0.0",
  "timestamp": "2026-01-08T10:30:00Z",
  "correlation_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "tenant_id": "tenant-123",
  "data": {
    "task_id": 123,
    "title": "Buy groceries",
    "description": "Milk, eggs, bread, cheese",
    "priority": "high",
    "tags": ["shopping", "urgent"],
    "due_date": "2026-01-10T18:00:00Z",
    "completed": false,
    "created_by": "user-456",
    "created_at": "2026-01-08T10:30:00Z"
  }
}
```

---

## Event Schema: task.updated

### Version: v1.0.0

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://todo-ai.example.com/schemas/task-updated-v1.json",
  "title": "Task Updated Event",
  "description": "Emitted when a task is updated",
  "allOf": [
    {
      "$ref": "https://todo-ai.example.com/schemas/base-event.json"
    },
    {
      "properties": {
        "event_type": {
          "const": "task.updated"
        },
        "event_version": {
          "const": "v1.0.0"
        },
        "data": {
          "type": "object",
          "required": [
            "task_id",
            "changes",
            "updated_by",
            "updated_at"
          ],
          "properties": {
            "task_id": {
              "type": "integer",
              "minimum": 1,
              "description": "Unique task identifier"
            },
            "changes": {
              "type": "object",
              "description": "Map of changed fields with old and new values",
              "patternProperties": {
                "^(title|description|priority|tags|due_date)$": {
                  "type": "object",
                  "required": ["old", "new"],
                  "properties": {
                    "old": {
                      "description": "Old value"
                    },
                    "new": {
                      "description": "New value"
                    }
                  }
                }
              },
              "additionalProperties": false
            },
            "updated_by": {
              "type": "string",
              "description": "User ID who updated the task"
            },
            "updated_at": {
              "type": "string",
              "format": "date-time",
              "description": "Task update timestamp"
            }
          },
          "additionalProperties": false
        }
      }
    }
  ]
}
```

### Example Event

```json
{
  "event_id": "660e8400-e29b-41d4-a716-446655440001",
  "event_type": "task.updated",
  "event_version": "v1.0.0",
  "timestamp": "2026-01-08T11:00:00Z",
  "correlation_id": "8c9e6679-7425-40de-944b-e07fc1f90ae8",
  "tenant_id": "tenant-123",
  "data": {
    "task_id": 123,
    "changes": {
      "title": {
        "old": "Buy groceries",
        "new": "Buy groceries and cook dinner"
      },
      "due_date": {
        "old": "2026-01-10T18:00:00Z",
        "new": "2026-01-11T18:00:00Z"
      }
    },
    "updated_by": "user-456",
    "updated_at": "2026-01-08T11:00:00Z"
  }
}
```

---

## Event Schema: task.completed

### Version: v1.0.0

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://todo-ai.example.com/schemas/task-completed-v1.json",
  "title": "Task Completed Event",
  "description": "Emitted when a task is marked as complete",
  "allOf": [
    {
      "$ref": "https://todo-ai.example.com/schemas/base-event.json"
    },
    {
      "properties": {
        "event_type": {
          "const": "task.completed"
        },
        "event_version": {
          "const": "v1.0.0"
        },
        "data": {
          "type": "object",
          "required": [
            "task_id",
            "completed_by",
            "completed_at"
          ],
          "properties": {
            "task_id": {
              "type": "integer",
              "minimum": 1,
              "description": "Unique task identifier"
            },
            "completed_by": {
              "type": "string",
              "description": "User ID who completed the task"
            },
            "completed_at": {
              "type": "string",
              "format": "date-time",
              "description": "Task completion timestamp"
            }
          },
          "additionalProperties": false
        }
      }
    }
  ]
}
```

### Example Event

```json
{
  "event_id": "770e8400-e29b-41d4-a716-446655440002",
  "event_type": "task.completed",
  "event_version": "v1.0.0",
  "timestamp": "2026-01-08T12:00:00Z",
  "correlation_id": "9c9e6679-7425-40de-944b-e07fc1f90ae9",
  "tenant_id": "tenant-123",
  "data": {
    "task_id": 123,
    "completed_by": "user-456",
    "completed_at": "2026-01-08T12:00:00Z"
  }
}
```

---

## Event Schema: task.deleted

### Version: v1.0.0

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://todo-ai.example.com/schemas/task-deleted-v1.json",
  "title": "Task Deleted Event",
  "description": "Emitted when a task is deleted",
  "allOf": [
    {
      "$ref": "https://todo-ai.example.com/schemas/base-event.json"
    },
    {
      "properties": {
        "event_type": {
          "const": "task.deleted"
        },
        "event_version": {
          "const": "v1.0.0"
        },
        "data": {
          "type": "object",
          "required": [
            "task_id",
            "deleted_by",
            "deleted_at"
          ],
          "properties": {
            "task_id": {
              "type": "integer",
              "minimum": 1,
              "description": "Unique task identifier"
            },
            "deleted_by": {
              "type": "string",
              "description": "User ID who deleted the task"
            },
            "deleted_at": {
              "type": "string",
              "format": "date-time",
              "description": "Task deletion timestamp"
            }
          },
          "additionalProperties": false
        }
      }
    }
  ]
}
```

---

## Event Schema: task.reminder.triggered

### Version: v1.0.0

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://todo-ai.example.com/schemas/task-reminder-triggered-v1.json",
  "title": "Task Reminder Triggered Event",
  "description": "Emitted when a task reminder is triggered",
  "allOf": [
    {
      "$ref": "https://todo-ai.example.com/schemas/base-event.json"
    },
    {
      "properties": {
        "event_type": {
          "const": "task.reminder.triggered"
        },
        "event_version": {
          "const": "v1.0.0"
        },
        "data": {
          "type": "object",
          "required": [
            "task_id",
            "title",
            "due_date",
            "reminder_type",
            "user_id"
          ],
          "properties": {
            "task_id": {
              "type": "integer",
              "minimum": 1,
              "description": "Unique task identifier"
            },
            "title": {
              "type": "string",
              "minLength": 1,
              "maxLength": 200,
              "description": "Task title"
            },
            "due_date": {
              "type": "string",
              "format": "date-time",
              "description": "Task due date"
            },
            "reminder_type": {
              "type": "string",
              "enum": ["due_date", "custom"],
              "description": "Type of reminder"
            },
            "user_id": {
              "type": "string",
              "description": "User ID to notify"
            }
          },
          "additionalProperties": false
        }
      }
    }
  ]
}
```

---

## Event Schema: agent.action.executed

### Version: v1.0.0

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://todo-ai.example.com/schemas/agent-action-executed-v1.json",
  "title": "Agent Action Executed Event",
  "description": "Emitted when an AI agent executes an action",
  "allOf": [
    {
      "$ref": "https://todo-ai.example.com/schemas/base-event.json"
    },
    {
      "properties": {
        "event_type": {
          "const": "agent.action.executed"
        },
        "event_version": {
          "const": "v1.0.0"
        },
        "data": {
          "type": "object",
          "required": [
            "action",
            "user_input",
            "tool_name",
            "tool_input",
            "tool_output",
            "agent_id",
            "user_id"
          ],
          "properties": {
            "action": {
              "type": "string",
              "description": "Action performed (e.g., create_task)"
            },
            "user_input": {
              "type": "string",
              "description": "Original user input"
            },
            "tool_name": {
              "type": "string",
              "description": "MCP tool name"
            },
            "tool_input": {
              "type": "object",
              "description": "Tool input parameters"
            },
            "tool_output": {
              "type": "object",
              "description": "Tool output result"
            },
            "agent_id": {
              "type": "string",
              "description": "Agent identifier"
            },
            "user_id": {
              "type": "string",
              "description": "User ID"
            }
          },
          "additionalProperties": false
        }
      }
    }
  ]
}
```

---

## Schema Registry Configuration

### Confluent Schema Registry

```yaml
# schema-registry-config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: schema-registry-config
  namespace: todo-ai
data:
  SCHEMA_REGISTRY_HOST_NAME: schema-registry
  SCHEMA_REGISTRY_KAFKASTORE_BOOTSTRAP_SERVERS: kafka-broker-1:9092,kafka-broker-2:9092,kafka-broker-3:9092
  SCHEMA_REGISTRY_LISTENERS: http://0.0.0.0:8081
  SCHEMA_REGISTRY_KAFKASTORE_TOPIC: _schemas
  SCHEMA_REGISTRY_SCHEMA_COMPATIBILITY_LEVEL: BACKWARD
```

### Schema Registration Script

```python
# scripts/register-schemas.py
import json
from confluent_kafka.schema_registry import SchemaRegistryClient, Schema

# Schema Registry client
sr_client = SchemaRegistryClient({
    'url': 'http://schema-registry:8081'
})

# Load schemas
schemas = {
    'task.created-value': 'schemas/task-created-v1.json',
    'task.updated-value': 'schemas/task-updated-v1.json',
    'task.completed-value': 'schemas/task-completed-v1.json',
    'task.deleted-value': 'schemas/task-deleted-v1.json',
    'task.reminder.triggered-value': 'schemas/task-reminder-triggered-v1.json',
    'agent.action.executed-value': 'schemas/agent-action-executed-v1.json',
}

# Register schemas
for subject, schema_file in schemas.items():
    with open(schema_file, 'r') as f:
        schema_str = f.read()

    schema = Schema(schema_str, schema_type='JSON')
    schema_id = sr_client.register_schema(subject, schema)

    print(f'Registered {subject} with ID {schema_id}')
```

---

## Event Validation

### Python Validation (Backend API)

```python
# backend/app/events/validator.py
import json
from jsonschema import validate, ValidationError
from typing import Dict, Any

class EventValidator:
    def __init__(self, schema_dir: str = 'schemas'):
        self.schema_dir = schema_dir
        self.schemas = self._load_schemas()

    def _load_schemas(self) -> Dict[str, Any]:
        schemas = {}
        schema_files = [
            'task-created-v1.json',
            'task-updated-v1.json',
            'task-completed-v1.json',
            'task-deleted-v1.json',
        ]
        for schema_file in schema_files:
            with open(f'{self.schema_dir}/{schema_file}', 'r') as f:
                schema = json.load(f)
                event_type = schema['allOf'][1]['properties']['event_type']['const']
                schemas[event_type] = schema
        return schemas

    def validate_event(self, event: Dict[str, Any]) -> bool:
        event_type = event.get('event_type')
        if event_type not in self.schemas:
            raise ValueError(f'Unknown event type: {event_type}')

        schema = self.schemas[event_type]
        try:
            validate(instance=event, schema=schema)
            return True
        except ValidationError as e:
            raise ValueError(f'Event validation failed: {e.message}')

# Usage
validator = EventValidator()
event = {
    "event_id": "550e8400-e29b-41d4-a716-446655440000",
    "event_type": "task.created",
    "event_version": "v1.0.0",
    "timestamp": "2026-01-08T10:30:00Z",
    "correlation_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "tenant_id": "tenant-123",
    "data": {
        "task_id": 123,
        "title": "Buy groceries",
        "priority": "high",
        "completed": false,
        "created_by": "user-456",
        "created_at": "2026-01-08T10:30:00Z"
    }
}

validator.validate_event(event)  # Raises ValueError if invalid
```

---

## Code Generation from Schemas

### TypeScript Type Generation

```bash
# Generate TypeScript types from JSON Schema
npm install -g json-schema-to-typescript

json2ts schemas/task-created-v1.json > types/task-created.ts
json2ts schemas/task-updated-v1.json > types/task-updated.ts
json2ts schemas/task-completed-v1.json > types/task-completed.ts
json2ts schemas/task-deleted-v1.json > types/task-deleted.ts
json2ts schemas/task-reminder-triggered-v1.json > types/task-reminder-triggered.ts
json2ts schemas/agent-action-executed-v1.json > types/agent-action-executed.ts
```

### Python Dataclass Generation

```bash
# Generate Python dataclasses from JSON Schema
pip install datamodel-code-generator

datamodel-codegen \
  --input schemas/task-created-v1.json \
  --output models/task_created.py \
  --input-file-type jsonschema

datamodel-codegen \
  --input schemas/task-updated-v1.json \
  --output models/task_updated.py \
  --input-file-type jsonschema
```

---

## Schema Evolution Example

### v1.0.0 → v1.1.0 (Backward Compatible)

Add optional `priority_changed_at` field to `task.updated`:

```json
{
  "data": {
    "properties": {
      "priority_changed_at": {
        "type": "string",
        "format": "date-time",
        "description": "Timestamp when priority was changed (optional)"
      }
    }
  }
}
```

**Compatibility**: ✅ Backward compatible (optional field)

### v1.0.0 → v2.0.0 (Breaking Change)

Change `task_id` from integer to UUID:

```json
{
  "data": {
    "properties": {
      "task_id": {
        "type": "string",
        "format": "uuid",
        "description": "Unique task identifier (UUID)"
      }
    }
  }
}
```

**Compatibility**: ❌ Breaking change (type change)
**Migration**: Requires consumer updates and data migration

---

## Testing Schemas

### Schema Validation Tests

```python
# tests/test_event_schemas.py
import pytest
from app.events.validator import EventValidator

def test_task_created_valid():
    validator = EventValidator()
    event = {
        "event_id": "550e8400-e29b-41d4-a716-446655440000",
        "event_type": "task.created",
        "event_version": "v1.0.0",
        "timestamp": "2026-01-08T10:30:00Z",
        "correlation_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
        "tenant_id": "tenant-123",
        "data": {
            "task_id": 123,
            "title": "Buy groceries",
            "priority": "high",
            "completed": false,
            "created_by": "user-456",
            "created_at": "2026-01-08T10:30:00Z"
        }
    }
    assert validator.validate_event(event) == True

def test_task_created_missing_required_field():
    validator = EventValidator()
    event = {
        "event_id": "550e8400-e29b-41d4-a716-446655440000",
        "event_type": "task.created",
        "event_version": "v1.0.0",
        "timestamp": "2026-01-08T10:30:00Z",
        "correlation_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
        "tenant_id": "tenant-123",
        "data": {
            "task_id": 123,
            # Missing "title" field
            "priority": "high",
            "completed": false,
            "created_by": "user-456",
            "created_at": "2026-01-08T10:30:00Z"
        }
    }
    with pytest.raises(ValueError):
        validator.validate_event(event)

def test_task_created_invalid_priority():
    validator = EventValidator()
    event = {
        "event_id": "550e8400-e29b-41d4-a716-446655440000",
        "event_type": "task.created",
        "event_version": "v1.0.0",
        "timestamp": "2026-01-08T10:30:00Z",
        "correlation_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
        "tenant_id": "tenant-123",
        "data": {
            "task_id": 123,
            "title": "Buy groceries",
            "priority": "urgent",  # Invalid: must be low/medium/high
            "completed": false,
            "created_by": "user-456",
            "created_at": "2026-01-08T10:30:00Z"
        }
    }
    with pytest.raises(ValueError):
        validator.validate_event(event)
```

---

## Success Criteria

- ✅ All event types have JSON Schema definitions
- ✅ All schemas follow semantic versioning
- ✅ All schemas inherit from base event schema
- ✅ All schemas have validation rules
- ✅ Schema registry configured and running
- ✅ Schema registration script works
- ✅ Event validation works in Python and TypeScript
- ✅ Code generation from schemas works
- ✅ Schema evolution strategy documented
- ✅ Schema tests pass

---

**Version**: 1.0.0
**Last Updated**: 2026-01-08
**Status**: Implementation Ready
