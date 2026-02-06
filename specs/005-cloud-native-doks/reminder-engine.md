# Reminder Engine Service Specification

**Feature:** Phase V - Cloud-Native DOKS Deployment
**Component:** Reminder Engine Service
**Version:** 1.0.0
**Last Updated:** 2026-01-08

---

## Table of Contents

1. [Overview](#overview)
2. [Service Architecture](#service-architecture)
3. [Event Subscription](#event-subscription)
4. [Reminder Scheduling](#reminder-scheduling)
5. [Database Schema](#database-schema)
6. [Dockerfile Specification](#dockerfile-specification)
7. [Kubernetes Deployment](#kubernetes-deployment)
8. [Dapr Configuration](#dapr-configuration)
9. [API Endpoints](#api-endpoints)
10. [Testing Procedures](#testing-procedures)
11. [Troubleshooting](#troubleshooting)

---

## 1. Overview

The **Reminder Engine Service** is a new microservice that consumes task events from Kafka and schedules reminder notifications for tasks with due dates. It operates asynchronously and independently from the main Backend API.

### 1.1 Key Responsibilities

- **Event Consumption:** Subscribe to `tasks` topic and process task events
- **Reminder Scheduling:** Schedule reminders for tasks with due dates
- **Reminder Triggering:** Emit `task.reminder.triggered` events when reminders fire
- **State Management:** Track scheduled reminders in PostgreSQL database

### 1.2 Technology Stack

- **Language:** Python 3.11
- **Framework:** FastAPI (for health checks and admin endpoints)
- **Scheduler:** APScheduler 3.x
- **Event Bus:** Kafka via Dapr pub/sub
- **Database:** PostgreSQL 16 (shared with Backend API)
- **Container:** Docker with multi-stage build

### 1.3 Architecture Principles

- **Event-Driven:** Reacts to task events, no direct API calls
- **Asynchronous:** Non-blocking event processing
- **Idempotent:** Handles duplicate events gracefully
- **Resilient:** Automatic retries via Dapr resiliency policies

---

## 2. Service Architecture

### 2.1 Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Reminder Engine Service                  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │              FastAPI Application                      │ │
│  │  - Health check endpoint (/health)                    │ │
│  │  - Readiness check endpoint (/ready)                  │ │
│  │  - Admin endpoints (/admin/reminders)                 │ │
│  └───────────────────────────────────────────────────────┘ │
│                          │                                  │
│  ┌───────────────────────────────────────────────────────┐ │
│  │              Event Subscriber                         │ │
│  │  - Subscribes to 'tasks' topic via Dapr              │ │
│  │  - Processes task.created, task.updated, task.deleted│ │
│  │  - Extracts due_date and schedules reminders         │ │
│  └───────────────────────────────────────────────────────┘ │
│                          │                                  │
│  ┌───────────────────────────────────────────────────────┐ │
│  │              Reminder Scheduler (APScheduler)         │ │
│  │  - In-memory job store                                │ │
│  │  - Persistent job store (PostgreSQL)                  │ │
│  │  - Triggers reminders at scheduled times              │ │
│  └───────────────────────────────────────────────────────┘ │
│                          │                                  │
│  ┌───────────────────────────────────────────────────────┐ │
│  │              Event Publisher                          │ │
│  │  - Publishes 'task.reminder.triggered' events        │ │
│  │  - Uses Dapr pub/sub                                  │ │
│  └───────────────────────────────────────────────────────┘ │
│                          │                                  │
│  ┌───────────────────────────────────────────────────────┐ │
│  │              Database Client (SQLModel)               │ │
│  │  - Stores reminder state                              │ │
│  │  - Tracks triggered reminders                         │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │   Dapr Sidecar        │
              │  - Pub/Sub (Kafka)    │
              │  - Service Invocation │
              │  - Observability      │
              └───────────────────────┘
```

### 2.2 Data Flow

**Task Created/Updated Flow:**
1. Backend API publishes `task.created` or `task.updated` event to Kafka
2. Dapr sidecar delivers event to Reminder Engine `/dapr/subscribe` endpoint
3. Reminder Engine extracts `due_date` from event
4. If `due_date` exists and is in the future:
   - Calculate reminder time (e.g., 1 hour before due date)
   - Schedule reminder job in APScheduler
   - Store reminder state in database
5. When reminder time arrives:
   - APScheduler triggers reminder job
   - Reminder Engine publishes `task.reminder.triggered` event to Kafka
   - Mark reminder as triggered in database

**Task Deleted Flow:**
1. Backend API publishes `task.deleted` event to Kafka
2. Dapr sidecar delivers event to Reminder Engine
3. Reminder Engine cancels scheduled reminder job
4. Delete reminder state from database

---

## 3. Event Subscription

### 3.1 Dapr Subscription Configuration

```yaml
# subscription-tasks.yaml
apiVersion: dapr.io/v1alpha1
kind: Subscription
metadata:
  name: reminder-engine-tasks-subscription
  namespace: todo-ai
spec:
  topic: tasks
  route: /events/tasks
  pubsubname: pubsub
  metadata:
    consumerGroup: reminder-engine
  scopes:
    - reminder-engine
```

### 3.2 Event Handler Implementation

```python
# app/events/task_events.py
from fastapi import APIRouter, Request, HTTPException
from app.models.events import TaskCreatedEvent, TaskUpdatedEvent, TaskDeletedEvent
from app.services.reminder_scheduler import ReminderScheduler
from app.core.logging import logger
import json

router = APIRouter()
scheduler = ReminderScheduler()

@router.post("/events/tasks")
async def handle_task_event(request: Request):
    """
    Handle task events from Kafka via Dapr pub/sub.

    Dapr sends events in CloudEvents format:
    {
      "id": "event-id",
      "source": "backend-api",
      "type": "task.created",
      "datacontenttype": "application/json",
      "data": { ... event payload ... }
    }
    """
    try:
        # Parse CloudEvents envelope
        cloud_event = await request.json()
        event_type = cloud_event.get("type")
        event_data = cloud_event.get("data", {})

        logger.info(f"Received event: {event_type}", extra={
            "event_id": cloud_event.get("id"),
            "event_type": event_type,
            "correlation_id": event_data.get("correlation_id")
        })

        # Route to appropriate handler
        if event_type == "task.created":
            await handle_task_created(TaskCreatedEvent(**event_data))
        elif event_type == "task.updated":
            await handle_task_updated(TaskUpdatedEvent(**event_data))
        elif event_type == "task.deleted":
            await handle_task_deleted(TaskDeletedEvent(**event_data))
        else:
            logger.warning(f"Unknown event type: {event_type}")

        # Return 200 to acknowledge event
        return {"status": "success"}

    except Exception as e:
        logger.error(f"Error processing event: {str(e)}", exc_info=True)
        # Return 500 to trigger Dapr retry
        raise HTTPException(status_code=500, detail=str(e))

async def handle_task_created(event: TaskCreatedEvent):
    """Handle task.created event."""
    task_data = event.data

    # Only schedule reminder if task has due_date
    if task_data.get("due_date"):
        await scheduler.schedule_reminder(
            task_id=task_data["task_id"],
            due_date=task_data["due_date"],
            title=task_data["title"],
            tenant_id=event.tenant_id
        )
        logger.info(f"Scheduled reminder for task {task_data['task_id']}")

async def handle_task_updated(event: TaskUpdatedEvent):
    """Handle task.updated event."""
    task_data = event.data

    # Cancel existing reminder
    await scheduler.cancel_reminder(task_data["task_id"])

    # Reschedule if task still has due_date
    if task_data.get("due_date"):
        await scheduler.schedule_reminder(
            task_id=task_data["task_id"],
            due_date=task_data["due_date"],
            title=task_data["title"],
            tenant_id=event.tenant_id
        )
        logger.info(f"Rescheduled reminder for task {task_data['task_id']}")

async def handle_task_deleted(event: TaskDeletedEvent):
    """Handle task.deleted event."""
    task_data = event.data

    # Cancel reminder
    await scheduler.cancel_reminder(task_data["task_id"])
    logger.info(f"Cancelled reminder for task {task_data['task_id']}")
```

---

## 4. Reminder Scheduling

### 4.1 APScheduler Configuration

```python
# app/services/reminder_scheduler.py
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.jobstores.sqlalchemy import SQLAlchemyJobStore
from apscheduler.executors.asyncio import AsyncIOExecutor
from datetime import datetime, timedelta
from app.core.config import settings
from app.services.event_publisher import EventPublisher
from app.core.logging import logger

class ReminderScheduler:
    def __init__(self):
        # Configure job stores
        jobstores = {
            'default': SQLAlchemyJobStore(url=settings.DATABASE_URL)
        }

        # Configure executors
        executors = {
            'default': AsyncIOExecutor()
        }

        # Configure scheduler
        self.scheduler = AsyncIOScheduler(
            jobstores=jobstores,
            executors=executors,
            job_defaults={
                'coalesce': True,  # Combine missed runs
                'max_instances': 1,  # One instance per job
                'misfire_grace_time': 300  # 5 minutes grace period
            }
        )

        self.event_publisher = EventPublisher()

    def start(self):
        """Start the scheduler."""
        self.scheduler.start()
        logger.info("Reminder scheduler started")

    def shutdown(self):
        """Shutdown the scheduler."""
        self.scheduler.shutdown()
        logger.info("Reminder scheduler stopped")

    async def schedule_reminder(
        self,
        task_id: int,
        due_date: str,
        title: str,
        tenant_id: str
    ):
        """
        Schedule a reminder for a task.

        Reminder is scheduled 1 hour before due date.
        """
        # Parse due date
        due_datetime = datetime.fromisoformat(due_date.replace('Z', '+00:00'))

        # Calculate reminder time (1 hour before due date)
        reminder_time = due_datetime - timedelta(hours=1)

        # Don't schedule if reminder time is in the past
        if reminder_time < datetime.now(reminder_time.tzinfo):
            logger.info(f"Skipping reminder for task {task_id} (due date in the past)")
            return

        # Schedule job
        job_id = f"reminder-task-{task_id}"
        self.scheduler.add_job(
            func=self._trigger_reminder,
            trigger='date',
            run_date=reminder_time,
            args=[task_id, title, tenant_id],
            id=job_id,
            replace_existing=True,  # Replace if already exists
            name=f"Reminder for task {task_id}"
        )

        logger.info(f"Scheduled reminder for task {task_id} at {reminder_time}")

    async def cancel_reminder(self, task_id: int):
        """Cancel a scheduled reminder."""
        job_id = f"reminder-task-{task_id}"
        try:
            self.scheduler.remove_job(job_id)
            logger.info(f"Cancelled reminder for task {task_id}")
        except Exception as e:
            # Job might not exist, which is fine
            logger.debug(f"No reminder to cancel for task {task_id}: {str(e)}")

    async def _trigger_reminder(self, task_id: int, title: str, tenant_id: str):
        """
        Trigger a reminder by publishing event.

        This method is called by APScheduler when reminder time arrives.
        """
        try:
            # Publish reminder event
            await self.event_publisher.publish_reminder_triggered(
                task_id=task_id,
                title=title,
                tenant_id=tenant_id
            )

            logger.info(f"Triggered reminder for task {task_id}")
        except Exception as e:
            logger.error(f"Error triggering reminder for task {task_id}: {str(e)}", exc_info=True)
```

### 4.2 Event Publisher

```python
# app/services/event_publisher.py
import httpx
from datetime import datetime
from app.core.config import settings
from app.core.logging import logger
import uuid

class EventPublisher:
    def __init__(self):
        self.dapr_url = f"http://localhost:{settings.DAPR_HTTP_PORT}/v1.0/publish/pubsub"

    async def publish_reminder_triggered(
        self,
        task_id: int,
        title: str,
        tenant_id: str
    ):
        """Publish task.reminder.triggered event."""
        event = {
            "event_id": str(uuid.uuid4()),
            "event_type": "task.reminder.triggered",
            "event_version": "v1.0.0",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "correlation_id": str(uuid.uuid4()),
            "tenant_id": tenant_id,
            "data": {
                "task_id": task_id,
                "title": title,
                "reminder_time": datetime.utcnow().isoformat() + "Z"
            }
        }

        # Publish via Dapr
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.dapr_url}/reminders",
                json=event,
                timeout=5.0
            )
            response.raise_for_status()

        logger.info(f"Published reminder event for task {task_id}")
```

---

## 5. Database Schema

### 5.1 Reminder State Table

```sql
-- migrations/versions/005_create_reminders_table.sql
CREATE TABLE IF NOT EXISTS reminders (
    id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL UNIQUE,
    tenant_id VARCHAR(100) NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    reminder_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    triggered_at TIMESTAMP WITH TIME ZONE,

    CONSTRAINT fk_task FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    CONSTRAINT chk_status CHECK (status IN ('scheduled', 'triggered', 'cancelled'))
);

CREATE INDEX idx_reminders_task_id ON reminders(task_id);
CREATE INDEX idx_reminders_tenant_id ON reminders(tenant_id);
CREATE INDEX idx_reminders_status ON reminders(status);
CREATE INDEX idx_reminders_reminder_time ON reminders(reminder_time);
```

### 5.2 SQLModel Definition

```python
# app/models/reminder.py
from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional

class Reminder(SQLModel, table=True):
    __tablename__ = "reminders"

    id: Optional[int] = Field(default=None, primary_key=True)
    task_id: int = Field(unique=True, index=True)
    tenant_id: str = Field(max_length=100, index=True)
    due_date: datetime
    reminder_time: datetime
    status: str = Field(default="scheduled", max_length=20)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    triggered_at: Optional[datetime] = None
```

---

## 6. Dockerfile Specification

### 6.1 Multi-Stage Dockerfile

```dockerfile
# Dockerfile
# Stage 1: Builder
FROM python:3.11-alpine AS builder

WORKDIR /build

# Install build dependencies
RUN apk add --no-cache \
    gcc \
    musl-dev \
    postgresql-dev \
    libffi-dev

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --user -r requirements.txt

# Stage 2: Runtime
FROM python:3.11-alpine

# Install runtime dependencies
RUN apk add --no-cache \
    libpq \
    && adduser -D -u 1000 appuser

WORKDIR /app

# Copy Python dependencies from builder
COPY --from=builder /root/.local /home/appuser/.local

# Copy application code
COPY app/ ./app/

# Set ownership
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Add local bin to PATH
ENV PATH=/home/appuser/.local/bin:$PATH

# Expose port
EXPOSE 8001

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD python -c "import httpx; httpx.get('http://localhost:8001/health')"

# Start application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
```

### 6.2 Requirements

```txt
# requirements.txt
fastapi==0.109.0
uvicorn[standard]==0.27.0
sqlmodel==0.0.14
psycopg2-binary==2.9.9
apscheduler==3.10.4
httpx==0.26.0
pydantic==2.5.3
pydantic-settings==2.1.0
python-json-logger==2.0.7
```

---

## 7. Kubernetes Deployment

### 7.1 Deployment Manifest

```yaml
# reminder-engine-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: reminder-engine
  namespace: todo-ai
  labels:
    app: todo-ai
    component: reminder-engine
spec:
  replicas: 1  # Single instance (APScheduler not distributed)
  selector:
    matchLabels:
      app: todo-ai
      component: reminder-engine
  template:
    metadata:
      labels:
        app: todo-ai
        component: reminder-engine
      annotations:
        dapr.io/enabled: "true"
        dapr.io/app-id: "reminder-engine"
        dapr.io/app-port: "8001"
        dapr.io/log-level: "info"
        dapr.io/config: "dapr-config"
    spec:
      containers:
      - name: reminder-engine
        image: registry.digitalocean.com/todo-ai/reminder-engine:v1.0.0
        ports:
        - containerPort: 8001
          name: http
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: database-secret
              key: connection-string
        - name: DAPR_HTTP_PORT
          value: "3500"
        - name: LOG_LEVEL
          value: "INFO"
        resources:
          requests:
            cpu: 100m
            memory: 256Mi
          limits:
            cpu: 500m
            memory: 1Gi
        livenessProbe:
          httpGet:
            path: /health
            port: 8001
          initialDelaySeconds: 10
          periodSeconds: 30
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /ready
            port: 8001
          initialDelaySeconds: 5
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
```

### 7.2 Service Manifest

```yaml
# reminder-engine-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: reminder-engine
  namespace: todo-ai
  labels:
    app: todo-ai
    component: reminder-engine
spec:
  type: ClusterIP
  selector:
    app: todo-ai
    component: reminder-engine
  ports:
  - name: http
    port: 8001
    targetPort: 8001
    protocol: TCP
```

---

## 8. Dapr Configuration

### 8.1 Subscription

See Section 3.1 for Dapr subscription configuration.

### 8.2 Resiliency Policy

```yaml
# reminder-engine-resiliency.yaml
apiVersion: dapr.io/v1alpha1
kind: Resiliency
metadata:
  name: reminder-engine-resiliency
  namespace: todo-ai
spec:
  policies:
    retries:
      eventRetry:
        policy: exponential
        maxRetries: 5
        initialInterval: 1s
        maxInterval: 60s
    timeouts:
      eventTimeout: 30s
  targets:
    apps:
      reminder-engine:
        retry: eventRetry
        timeout: eventTimeout
```

---

## 9. API Endpoints

### 9.1 Health Check

```python
@app.get("/health")
async def health_check():
    """Health check endpoint for liveness probe."""
    return {"status": "healthy"}
```

### 9.2 Readiness Check

```python
@app.get("/ready")
async def readiness_check():
    """Readiness check endpoint."""
    # Check database connection
    try:
        async with engine.begin() as conn:
            await conn.execute(text("SELECT 1"))
        return {"status": "ready"}
    except Exception as e:
        raise HTTPException(status_code=503, detail="Database not ready")
```

### 9.3 Admin Endpoints

```python
@app.get("/admin/reminders")
async def list_reminders(
    status: Optional[str] = None,
    tenant_id: Optional[str] = None
):
    """List scheduled reminders (admin only)."""
    # Query reminders from database
    # Return list of reminders
    pass

@app.get("/admin/reminders/{task_id}")
async def get_reminder(task_id: int):
    """Get reminder details (admin only)."""
    # Query reminder by task_id
    # Return reminder details
    pass
```

---

## 10. Testing Procedures

### 10.1 Unit Tests

```python
# tests/test_reminder_scheduler.py
import pytest
from datetime import datetime, timedelta
from app.services.reminder_scheduler import ReminderScheduler

@pytest.mark.asyncio
async def test_schedule_reminder():
    scheduler = ReminderScheduler()
    scheduler.start()

    # Schedule reminder
    due_date = (datetime.utcnow() + timedelta(hours=2)).isoformat() + "Z"
    await scheduler.schedule_reminder(
        task_id=1,
        due_date=due_date,
        title="Test task",
        tenant_id="tenant-123"
    )

    # Verify job scheduled
    job = scheduler.scheduler.get_job("reminder-task-1")
    assert job is not None

    scheduler.shutdown()

@pytest.mark.asyncio
async def test_cancel_reminder():
    scheduler = ReminderScheduler()
    scheduler.start()

    # Schedule and cancel reminder
    due_date = (datetime.utcnow() + timedelta(hours=2)).isoformat() + "Z"
    await scheduler.schedule_reminder(
        task_id=1,
        due_date=due_date,
        title="Test task",
        tenant_id="tenant-123"
    )
    await scheduler.cancel_reminder(task_id=1)

    # Verify job cancelled
    job = scheduler.scheduler.get_job("reminder-task-1")
    assert job is None

    scheduler.shutdown()
```

### 10.2 Integration Tests

```bash
# Deploy to DOKS
kubectl apply -f reminder-engine-deployment.yaml
kubectl apply -f reminder-engine-service.yaml
kubectl apply -f subscription-tasks.yaml

# Create test task with due date
curl -X POST http://todo-api.example.com/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test reminder",
    "due_date": "2026-01-09T10:00:00Z"
  }'

# Check reminder scheduled
kubectl logs -n todo-ai -l component=reminder-engine --tail=50

# Wait for reminder time
# Verify reminder event published to Kafka
kubectl exec -it todo-kafka-kafka-0 -n todo-ai -- bin/kafka-console-consumer.sh \
  --bootstrap-server localhost:9092 \
  --topic reminders \
  --from-beginning
```

---

## 11. Troubleshooting

### 11.1 Reminders Not Scheduling

**Symptoms:**
- Events received but no reminders scheduled
- No jobs in APScheduler

**Diagnosis:**

```bash
# Check logs
kubectl logs -n todo-ai -l component=reminder-engine --tail=100

# Check database connection
kubectl exec -it reminder-engine-xxx -n todo-ai -- python -c "from app.core.database import engine; engine.connect()"
```

**Solutions:**
1. Verify database connection string
2. Check due_date format in events
3. Ensure due_date is in the future
4. Check APScheduler job store

### 11.2 Events Not Received

**Symptoms:**
- No events logged
- Dapr subscription not working

**Diagnosis:**

```bash
# Check Dapr subscription
kubectl get subscription -n todo-ai

# Check Dapr sidecar logs
kubectl logs -n todo-ai reminder-engine-xxx -c daprd
```

**Solutions:**
1. Verify subscription configuration
2. Check Kafka topic exists
3. Verify Dapr pub/sub component
4. Check consumer group

### 11.3 Reminder Events Not Published

**Symptoms:**
- Reminders trigger but no events in Kafka
- Dapr publish errors

**Diagnosis:**

```bash
# Check logs for publish errors
kubectl logs -n todo-ai -l component=reminder-engine | grep "publish"

# Check Dapr sidecar
kubectl logs -n todo-ai reminder-engine-xxx -c daprd | grep "publish"
```

**Solutions:**
1. Verify Dapr pub/sub component
2. Check Kafka connectivity
3. Verify topic permissions
4. Check event payload format

---

## Acceptance Criteria

- ✅ Reminder Engine service deployed to DOKS
- ✅ Subscribes to `tasks` topic via Dapr
- ✅ Schedules reminders for tasks with due dates
- ✅ Publishes `task.reminder.triggered` events
- ✅ Stores reminder state in PostgreSQL
- ✅ Health and readiness checks pass
- ✅ Handles duplicate events idempotently
- ✅ Automatic retries via Dapr resiliency
- ✅ All tests pass

---

## Next Steps

1. **Build Docker image** - Build and push to DigitalOcean Container Registry
2. **Deploy to DOKS** - Apply Kubernetes manifests
3. **Configure Dapr subscription** - Apply subscription manifest
4. **Run integration tests** - Test end-to-end reminder flow
5. **Monitor metrics** - Set up Prometheus/Grafana dashboards

---

**Document Version:** 1.0.0
**Last Updated:** 2026-01-08
**Specification Phase:** Phase V - Cloud-Native DOKS Deployment
