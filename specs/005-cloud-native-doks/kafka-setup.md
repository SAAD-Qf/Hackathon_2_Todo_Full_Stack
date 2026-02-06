# Kafka Setup Specifications

**Feature:** Phase V - Cloud-Native DOKS Deployment
**Component:** Apache Kafka Event Bus
**Version:** 1.0.0
**Last Updated:** 2026-01-08

---

## Table of Contents

1. [Overview](#overview)
2. [Kafka Cluster Architecture](#kafka-cluster-architecture)
3. [Strimzi Operator Deployment](#strimzi-operator-deployment)
4. [Kafka Cluster Configuration](#kafka-cluster-configuration)
5. [Topic Specifications](#topic-specifications)
6. [Consumer Group Configurations](#consumer-group-configurations)
7. [Security and ACL Configuration](#security-and-acl-configuration)
8. [Monitoring and Metrics](#monitoring-and-metrics)
9. [Testing Procedures](#testing-procedures)
10. [Troubleshooting](#troubleshooting)

---

## 1. Overview

This document specifies the complete Kafka setup for the Todo AI System Phase V deployment. All Kafka infrastructure is deployed using the **Strimzi Operator** on Kubernetes, following Infrastructure as Code principles.

### 1.1 Key Requirements

- **Event Bus:** Apache Kafka 3.6.x
- **Operator:** Strimzi 0.39.x
- **Deployment Target:** DigitalOcean Kubernetes (DOKS)
- **Cluster Size:** 3 brokers for high availability
- **Storage:** Persistent volumes with 100Gi per broker
- **Replication:** Factor of 3 for all topics
- **Partitions:** Configured per topic based on throughput requirements

### 1.2 Architecture Principles

- **Declarative Configuration:** All Kafka resources defined as Kubernetes CRDs
- **High Availability:** 3-broker cluster with replication factor 3
- **Persistent Storage:** All data persisted to PVCs
- **Security:** TLS encryption and SASL authentication
- **Observability:** Prometheus metrics and JMX monitoring

---

## 2. Kafka Cluster Architecture

### 2.1 Cluster Topology

```
┌─────────────────────────────────────────────────────────────┐
│                    DOKS Cluster (todo-ai)                   │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │              Strimzi Operator Namespace               │ │
│  │  ┌─────────────────────────────────────────────────┐  │ │
│  │  │         Strimzi Cluster Operator                │  │ │
│  │  │  - Manages Kafka clusters                       │  │ │
│  │  │  - Manages Kafka topics                         │  │ │
│  │  │  - Manages Kafka users                          │  │ │
│  │  └─────────────────────────────────────────────────┘  │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │              Todo AI Namespace (todo-ai)              │ │
│  │                                                       │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │ │
│  │  │   Broker 0  │  │   Broker 1  │  │   Broker 2  │  │ │
│  │  │  Port: 9092 │  │  Port: 9092 │  │  Port: 9092 │  │ │
│  │  │  PVC: 100Gi │  │  PVC: 100Gi │  │  PVC: 100Gi │  │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │ │
│  │                                                       │ │
│  │  ┌─────────────────────────────────────────────────┐ │ │
│  │  │              ZooKeeper Ensemble                 │ │ │
│  │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐      │ │ │
│  │  │  │  ZK 0    │  │  ZK 1    │  │  ZK 2    │      │ │ │
│  │  │  │ PVC:10Gi │  │ PVC:10Gi │  │ PVC:10Gi │      │ │ │
│  │  │  └──────────┘  └──────────┘  └──────────┘      │ │ │
│  │  └─────────────────────────────────────────────────┘ │ │
│  │                                                       │ │
│  │  Topics:                                              │ │
│  │  - tasks (6 partitions, RF=3)                         │ │
│  │  - reminders (3 partitions, RF=3)                     │ │
│  │  - agent-actions (3 partitions, RF=3)                 │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Resource Allocation

**Kafka Brokers (per broker):**
- CPU Request: 500m
- CPU Limit: 2000m
- Memory Request: 2Gi
- Memory Limit: 4Gi
- Storage: 100Gi persistent volume

**ZooKeeper Nodes (per node):**
- CPU Request: 200m
- CPU Limit: 500m
- Memory Request: 512Mi
- Memory Limit: 1Gi
- Storage: 10Gi persistent volume

---

## 3. Strimzi Operator Deployment

### 3.1 Install Strimzi Operator

**Step 1: Create Strimzi Namespace**

```yaml
# strimzi-namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: strimzi-operator
  labels:
    app: strimzi
```

**Step 2: Install Strimzi Operator via Helm**

```bash
# Add Strimzi Helm repository
helm repo add strimzi https://strimzi.io/charts/
helm repo update

# Install Strimzi operator
helm install strimzi-kafka-operator strimzi/strimzi-kafka-operator \
  --namespace strimzi-operator \
  --create-namespace \
  --set watchNamespaces="{todo-ai}" \
  --version 0.39.0
```

**Step 3: Verify Operator Installation**

```bash
# Check operator pod
kubectl get pods -n strimzi-operator

# Expected output:
# NAME                                        READY   STATUS    RESTARTS   AGE
# strimzi-cluster-operator-xxxxxxxxxx-xxxxx   1/1     Running   0          1m
```

### 3.2 Strimzi Operator Configuration

The operator watches the `todo-ai` namespace for Kafka custom resources:
- `Kafka` - Kafka cluster definition
- `KafkaTopic` - Topic definitions
- `KafkaUser` - User and ACL definitions

---

## 4. Kafka Cluster Configuration

### 4.1 Kafka Cluster CRD

```yaml
# kafka-cluster.yaml
apiVersion: kafka.strimzi.io/v1beta2
kind: Kafka
metadata:
  name: todo-kafka
  namespace: todo-ai
  labels:
    app: todo-ai
    component: kafka
spec:
  kafka:
    version: 3.6.1
    replicas: 3
    listeners:
      - name: plain
        port: 9092
        type: internal
        tls: false
      - name: tls
        port: 9093
        type: internal
        tls: true
        authentication:
          type: scram-sha-512
    config:
      offsets.topic.replication.factor: 3
      transaction.state.log.replication.factor: 3
      transaction.state.log.min.isr: 2
      default.replication.factor: 3
      min.insync.replicas: 2
      inter.broker.protocol.version: "3.6"
      log.retention.hours: 168  # 7 days
      log.segment.bytes: 1073741824  # 1GB
      compression.type: snappy
      auto.create.topics.enable: false
    storage:
      type: persistent-claim
      size: 100Gi
      class: do-block-storage
      deleteClaim: false
    resources:
      requests:
        memory: 2Gi
        cpu: 500m
      limits:
        memory: 4Gi
        cpu: 2000m
    jvmOptions:
      -Xms: 1024m
      -Xmx: 2048m
    metricsConfig:
      type: jmxPrometheusExporter
      valueFrom:
        configMapKeyRef:
          name: kafka-metrics
          key: kafka-metrics-config.yml
  zookeeper:
    replicas: 3
    storage:
      type: persistent-claim
      size: 10Gi
      class: do-block-storage
      deleteClaim: false
    resources:
      requests:
        memory: 512Mi
        cpu: 200m
      limits:
        memory: 1Gi
        cpu: 500m
    metricsConfig:
      type: jmxPrometheusExporter
      valueFrom:
        configMapKeyRef:
          name: kafka-metrics
          key: zookeeper-metrics-config.yml
  entityOperator:
    topicOperator:
      resources:
        requests:
          memory: 256Mi
          cpu: 100m
        limits:
          memory: 512Mi
          cpu: 500m
    userOperator:
      resources:
        requests:
          memory: 256Mi
          cpu: 100m
        limits:
          memory: 512Mi
          cpu: 500m
```

### 4.2 Kafka Metrics ConfigMap

```yaml
# kafka-metrics-configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: kafka-metrics
  namespace: todo-ai
  labels:
    app: todo-ai
    component: kafka
data:
  kafka-metrics-config.yml: |
    lowercaseOutputName: true
    rules:
    - pattern: kafka.server<type=(.+), name=(.+), clientId=(.+), topic=(.+), partition=(.*)><>Value
      name: kafka_server_$1_$2
      type: GAUGE
      labels:
        clientId: "$3"
        topic: "$4"
        partition: "$5"
    - pattern: kafka.server<type=(.+), name=(.+), clientId=(.+), brokerHost=(.+), brokerPort=(.+)><>Value
      name: kafka_server_$1_$2
      type: GAUGE
      labels:
        clientId: "$3"
        broker: "$4:$5"
  zookeeper-metrics-config.yml: |
    lowercaseOutputName: true
    rules:
    - pattern: "org.apache.ZooKeeperService<name0=(.+)><>(\\w+)"
      name: "zookeeper_$2"
      type: GAUGE
```

### 4.3 Deploy Kafka Cluster

```bash
# Apply metrics ConfigMap
kubectl apply -f kafka-metrics-configmap.yaml

# Deploy Kafka cluster
kubectl apply -f kafka-cluster.yaml

# Wait for cluster to be ready (takes 5-10 minutes)
kubectl wait kafka/todo-kafka --for=condition=Ready --timeout=600s -n todo-ai

# Verify cluster status
kubectl get kafka -n todo-ai
kubectl get pods -n todo-ai -l strimzi.io/cluster=todo-kafka
```

---

## 5. Topic Specifications

### 5.1 Tasks Topic

```yaml
# topic-tasks.yaml
apiVersion: kafka.strimzi.io/v1beta2
kind: KafkaTopic
metadata:
  name: tasks
  namespace: todo-ai
  labels:
    strimzi.io/cluster: todo-kafka
    app: todo-ai
    component: kafka-topic
spec:
  partitions: 6
  replicas: 3
  config:
    retention.ms: 604800000  # 7 days
    segment.ms: 3600000  # 1 hour
    compression.type: snappy
    min.insync.replicas: 2
    cleanup.policy: delete
```

**Rationale:**
- **6 partitions:** Supports high throughput for task CRUD operations
- **Partition key:** `tenant_id` for tenant isolation
- **Retention:** 7 days for event replay and debugging

### 5.2 Reminders Topic

```yaml
# topic-reminders.yaml
apiVersion: kafka.strimzi.io/v1beta2
kind: KafkaTopic
metadata:
  name: reminders
  namespace: todo-ai
  labels:
    strimzi.io/cluster: todo-kafka
    app: todo-ai
    component: kafka-topic
spec:
  partitions: 3
  replicas: 3
  config:
    retention.ms: 604800000  # 7 days
    segment.ms: 3600000  # 1 hour
    compression.type: snappy
    min.insync.replicas: 2
    cleanup.policy: delete
```

**Rationale:**
- **3 partitions:** Moderate throughput for reminder events
- **Partition key:** `tenant_id` for tenant isolation
- **Retention:** 7 days for event replay

### 5.3 Agent Actions Topic

```yaml
# topic-agent-actions.yaml
apiVersion: kafka.strimzi.io/v1beta2
kind: KafkaTopic
metadata:
  name: agent-actions
  namespace: todo-ai
  labels:
    strimzi.io/cluster: todo-kafka
    app: todo-ai
    component: kafka-topic
spec:
  partitions: 3
  replicas: 3
  config:
    retention.ms: 604800000  # 7 days
    segment.ms: 3600000  # 1 hour
    compression.type: snappy
    min.insync.replicas: 2
    cleanup.policy: delete
```

**Rationale:**
- **3 partitions:** Moderate throughput for agent action events
- **Partition key:** `correlation_id` for request tracing
- **Retention:** 7 days for audit and debugging

### 5.4 Deploy Topics

```bash
# Create all topics
kubectl apply -f topic-tasks.yaml
kubectl apply -f topic-reminders.yaml
kubectl apply -f topic-agent-actions.yaml

# Verify topics
kubectl get kafkatopics -n todo-ai

# Expected output:
# NAME             CLUSTER      PARTITIONS   REPLICATION FACTOR   READY
# tasks            todo-kafka   6            3                    True
# reminders        todo-kafka   3            3                    True
# agent-actions    todo-kafka   3            3                    True
```

---

## 6. Consumer Group Configurations

### 6.1 Consumer Groups

**Backend API Producer:**
- No consumer group (producer only)
- Publishes to: `tasks`, `agent-actions`

**Reminder Engine Consumer:**
- Consumer Group: `reminder-engine`
- Subscribes to: `tasks`
- Partition Assignment: Round-robin
- Auto-commit: Disabled (manual commit after processing)

**Agent Runtime Consumer:**
- Consumer Group: `agent-runtime`
- Subscribes to: `agent-actions`
- Partition Assignment: Round-robin
- Auto-commit: Disabled (manual commit after processing)

### 6.2 Consumer Configuration

**Dapr Pub/Sub Component** (see `dapr-config.md`) handles consumer group configuration:

```yaml
metadata:
- name: consumerGroup
  value: "{appId}"  # Uses Dapr app ID as consumer group
- name: enableIdempotence
  value: "true"
- name: maxMessageBytes
  value: "1048576"  # 1MB
```

---

## 7. Security and ACL Configuration

### 7.1 Kafka User for Services

```yaml
# kafka-user-backend.yaml
apiVersion: kafka.strimzi.io/v1beta2
kind: KafkaUser
metadata:
  name: backend-api
  namespace: todo-ai
  labels:
    strimzi.io/cluster: todo-kafka
spec:
  authentication:
    type: scram-sha-512
  authorization:
    type: simple
    acls:
      # Producer ACLs for tasks topic
      - resource:
          type: topic
          name: tasks
          patternType: literal
        operations:
          - Write
          - Describe
        host: "*"
      # Producer ACLs for agent-actions topic
      - resource:
          type: topic
          name: agent-actions
          patternType: literal
        operations:
          - Write
          - Describe
        host: "*"
      # Consumer group ACL
      - resource:
          type: group
          name: backend-api
          patternType: literal
        operations:
          - Read
        host: "*"
```

```yaml
# kafka-user-reminder-engine.yaml
apiVersion: kafka.strimzi.io/v1beta2
kind: KafkaUser
metadata:
  name: reminder-engine
  namespace: todo-ai
  labels:
    strimzi.io/cluster: todo-kafka
spec:
  authentication:
    type: scram-sha-512
  authorization:
    type: simple
    acls:
      # Consumer ACLs for tasks topic
      - resource:
          type: topic
          name: tasks
          patternType: literal
        operations:
          - Read
          - Describe
        host: "*"
      # Producer ACLs for reminders topic
      - resource:
          type: topic
          name: reminders
          patternType: literal
        operations:
          - Write
          - Describe
        host: "*"
      # Consumer group ACL
      - resource:
          type: group
          name: reminder-engine
          patternType: literal
        operations:
          - Read
        host: "*"
```

### 7.2 Deploy Kafka Users

```bash
# Create Kafka users
kubectl apply -f kafka-user-backend.yaml
kubectl apply -f kafka-user-reminder-engine.yaml

# Verify users
kubectl get kafkausers -n todo-ai

# Get user credentials (stored in secrets)
kubectl get secret backend-api -n todo-ai -o jsonpath='{.data.password}' | base64 -d
kubectl get secret reminder-engine -n todo-ai -o jsonpath='{.data.password}' | base64 -d
```

### 7.3 Update Dapr Secrets

Update the Dapr secret store with Kafka credentials:

```yaml
# kafka-credentials-secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: kafka-credentials
  namespace: todo-ai
type: Opaque
stringData:
  backend-api-password: "<password-from-kafkauser-secret>"
  reminder-engine-password: "<password-from-kafkauser-secret>"
  sasl-mechanism: "SCRAM-SHA-512"
```

---

## 8. Monitoring and Metrics

### 8.1 Prometheus ServiceMonitor

```yaml
# kafka-servicemonitor.yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: kafka-metrics
  namespace: todo-ai
  labels:
    app: todo-ai
    component: kafka
spec:
  selector:
    matchLabels:
      strimzi.io/cluster: todo-kafka
      strimzi.io/kind: Kafka
  endpoints:
    - port: tcp-prometheus
      interval: 30s
      path: /metrics
```

### 8.2 Key Metrics to Monitor

**Broker Metrics:**
- `kafka_server_brokertopicmetrics_messagesinpersec` - Messages per second
- `kafka_server_brokertopicmetrics_bytesinpersec` - Bytes in per second
- `kafka_server_brokertopicmetrics_bytesoutpersec` - Bytes out per second
- `kafka_server_replicamanager_underreplicatedpartitions` - Under-replicated partitions
- `kafka_server_replicamanager_partitioncount` - Partition count

**Topic Metrics:**
- `kafka_log_log_size` - Topic size in bytes
- `kafka_log_logendoffset` - Log end offset per partition

**Consumer Lag:**
- `kafka_consumergroup_lag` - Consumer group lag per partition

### 8.3 Grafana Dashboard

Import Strimzi Kafka dashboard:
- Dashboard ID: 11962 (Strimzi Kafka)
- Dashboard ID: 12483 (Strimzi Kafka Exporter)

---

## 9. Testing Procedures

### 9.1 Cluster Health Check

```bash
# Check Kafka cluster status
kubectl get kafka todo-kafka -n todo-ai -o jsonpath='{.status.conditions[?(@.type=="Ready")].status}'
# Expected: True

# Check broker pods
kubectl get pods -n todo-ai -l strimzi.io/name=todo-kafka-kafka
# Expected: 3 pods running

# Check ZooKeeper pods
kubectl get pods -n todo-ai -l strimzi.io/name=todo-kafka-zookeeper
# Expected: 3 pods running
```

### 9.2 Topic Verification

```bash
# List topics
kubectl exec -it todo-kafka-kafka-0 -n todo-ai -- bin/kafka-topics.sh \
  --bootstrap-server localhost:9092 \
  --list

# Expected output:
# tasks
# reminders
# agent-actions

# Describe tasks topic
kubectl exec -it todo-kafka-kafka-0 -n todo-ai -- bin/kafka-topics.sh \
  --bootstrap-server localhost:9092 \
  --describe \
  --topic tasks
```

### 9.3 Producer/Consumer Test

**Test Producer:**

```bash
# Create test producer pod
kubectl run kafka-producer-test -n todo-ai --rm -it --restart=Never \
  --image=quay.io/strimzi/kafka:0.39.0-kafka-3.6.1 \
  -- bin/kafka-console-producer.sh \
  --bootstrap-server todo-kafka-kafka-bootstrap:9092 \
  --topic tasks

# Type test messages and press Ctrl+C to exit
```

**Test Consumer:**

```bash
# Create test consumer pod
kubectl run kafka-consumer-test -n todo-ai --rm -it --restart=Never \
  --image=quay.io/strimzi/kafka:0.39.0-kafka-3.6.1 \
  -- bin/kafka-console-consumer.sh \
  --bootstrap-server todo-kafka-kafka-bootstrap:9092 \
  --topic tasks \
  --from-beginning

# Should see test messages from producer
```

### 9.4 Performance Test

```bash
# Producer performance test
kubectl exec -it todo-kafka-kafka-0 -n todo-ai -- bin/kafka-producer-perf-test.sh \
  --topic tasks \
  --num-records 10000 \
  --record-size 1024 \
  --throughput -1 \
  --producer-props bootstrap.servers=localhost:9092

# Consumer performance test
kubectl exec -it todo-kafka-kafka-0 -n todo-ai -- bin/kafka-consumer-perf-test.sh \
  --bootstrap-server localhost:9092 \
  --topic tasks \
  --messages 10000 \
  --threads 1
```

---

## 10. Troubleshooting

### 10.1 Broker Not Starting

**Symptoms:**
- Kafka broker pods in CrashLoopBackOff
- Logs show "Unable to connect to ZooKeeper"

**Diagnosis:**

```bash
# Check broker logs
kubectl logs todo-kafka-kafka-0 -n todo-ai

# Check ZooKeeper status
kubectl get pods -n todo-ai -l strimzi.io/name=todo-kafka-zookeeper
```

**Solutions:**
1. Ensure ZooKeeper pods are running and healthy
2. Check PVC status: `kubectl get pvc -n todo-ai`
3. Verify network connectivity between brokers and ZooKeeper
4. Check resource limits (CPU/memory)

### 10.2 Under-Replicated Partitions

**Symptoms:**
- `kafka_server_replicamanager_underreplicatedpartitions` > 0
- Topics not fully replicated

**Diagnosis:**

```bash
# Check topic status
kubectl exec -it todo-kafka-kafka-0 -n todo-ai -- bin/kafka-topics.sh \
  --bootstrap-server localhost:9092 \
  --describe \
  --under-replicated-partitions
```

**Solutions:**
1. Check broker health and logs
2. Verify sufficient disk space on PVCs
3. Check network connectivity between brokers
4. Restart affected broker pods if necessary

### 10.3 Consumer Lag

**Symptoms:**
- `kafka_consumergroup_lag` increasing
- Events not being processed

**Diagnosis:**

```bash
# Check consumer group lag
kubectl exec -it todo-kafka-kafka-0 -n todo-ai -- bin/kafka-consumer-groups.sh \
  --bootstrap-server localhost:9092 \
  --describe \
  --group reminder-engine
```

**Solutions:**
1. Scale consumer pods (Reminder Engine)
2. Check consumer application logs for errors
3. Verify consumer is committing offsets
4. Check for slow message processing

### 10.4 Topic Creation Fails

**Symptoms:**
- KafkaTopic resource not ready
- Topic not visible in Kafka

**Diagnosis:**

```bash
# Check KafkaTopic status
kubectl get kafkatopic tasks -n todo-ai -o yaml

# Check Topic Operator logs
kubectl logs -n todo-ai -l strimzi.io/name=todo-kafka-entity-operator -c topic-operator
```

**Solutions:**
1. Verify Strimzi operator is running
2. Check topic configuration for errors
3. Ensure cluster has sufficient resources
4. Verify topic name doesn't conflict with existing topics

---

## Acceptance Criteria

- ✅ Strimzi operator deployed and running
- ✅ 3-broker Kafka cluster deployed with persistent storage
- ✅ 3-node ZooKeeper ensemble deployed
- ✅ All 3 topics created with correct partitions and replication
- ✅ Kafka users created with appropriate ACLs
- ✅ Metrics exported to Prometheus
- ✅ Producer/consumer tests pass
- ✅ No under-replicated partitions
- ✅ All components follow Infrastructure as Code principles

---

## Next Steps

1. **Deploy Reminder Engine Service** - See `reminder-engine.md`
2. **Configure Dapr Pub/Sub** - See `dapr-config.md`
3. **Deploy to DOKS** - See `doks-deployment.md`
4. **Set up monitoring dashboards** - Import Grafana dashboards
5. **Run integration tests** - Test end-to-end event flow

---

**Document Version:** 1.0.0
**Last Updated:** 2026-01-08
**Specification Phase:** Phase V - Cloud-Native DOKS Deployment
