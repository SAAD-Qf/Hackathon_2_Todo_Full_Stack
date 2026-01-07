# Helm Chart Specifications

**Feature**: Kubernetes Deployment - Helm Chart
**Created**: 2026-01-08
**Status**: Implementation Ready
**Constitution**: Phase IV (v4.0.0)

## Overview

This document specifies the complete Helm chart structure for deploying the Todo AI System to Kubernetes. The chart includes all 6 components with proper resource management, health checks, and service discovery.

**Critical Constraint**: All Helm chart files MUST be generated from these specifications. No manual editing is permitted.

---

## Chart Structure

```
helm/todo-ai/
├── Chart.yaml                 # Chart metadata
├── values.yaml                # Default values
├── values-dev.yaml            # Development overrides
├── values-prod.yaml           # Production overrides
├── templates/
│   ├── _helpers.tpl           # Template helpers
│   ├── namespace.yaml         # Namespace
│   ├── configmaps/
│   │   ├── backend-config.yaml
│   │   ├── frontend-config.yaml
│   │   ├── chatui-config.yaml
│   │   ├── agent-config.yaml
│   │   └── mcp-config.yaml
│   ├── secrets/
│   │   ├── database-secret.yaml
│   │   └── agent-secret.yaml
│   ├── deployments/
│   │   ├── backend.yaml
│   │   ├── frontend.yaml
│   │   ├── chatui.yaml
│   │   ├── agent.yaml
│   │   └── mcp-server.yaml
│   ├── statefulsets/
│   │   └── database.yaml
│   ├── services/
│   │   ├── backend.yaml
│   │   ├── frontend.yaml
│   │   ├── chatui.yaml
│   │   ├── agent.yaml
│   │   ├── mcp-server.yaml
│   │   └── database.yaml
│   ├── ingress.yaml
│   └── pvc.yaml
├── .helmignore
└── README.md
```

---

## Chart.yaml

```yaml
# Helm Chart Metadata
# Phase IV - Kubernetes Deployment
# Generated from spec: specs/004-k8s-deployment/helm-chart-specs.md

apiVersion: v2
name: todo-ai
description: A Helm chart for Todo AI System with conversational interface
type: application
version: 1.0.0
appVersion: "1.0.0"

keywords:
  - todo
  - ai
  - chatbot
  - kubernetes

maintainers:
  - name: Todo AI Team
    email: team@todo-ai.example.com

sources:
  - https://github.com/example/todo-ai

dependencies: []

annotations:
  category: Application
  licenses: MIT
```

---

## values.yaml

```yaml
# Default Values for Todo AI Helm Chart
# Phase IV - Kubernetes Deployment
# Generated from spec: specs/004-k8s-deployment/helm-chart-specs.md

# Global settings
global:
  namespace: todo-ai
  imagePullPolicy: IfNotPresent
  imageRegistry: ""  # Set to your registry URL

# Backend API
backend:
  enabled: true
  replicaCount: 2
  image:
    repository: todo-backend
    tag: v1.0.0
    pullPolicy: IfNotPresent
  service:
    type: ClusterIP
    port: 8000
    targetPort: 8000
  resources:
    requests:
      cpu: 100m
      memory: 128Mi
    limits:
      cpu: 500m
      memory: 512Mi
  healthCheck:
    enabled: true
    path: /health
    initialDelaySeconds: 15
    periodSeconds: 10
    timeoutSeconds: 5
    failureThreshold: 3
  env:
    corsOrigins: "http://localhost:3000,http://localhost:3001"
    logLevel: "info"
  autoscaling:
    enabled: false
    minReplicas: 2
    maxReplicas: 5
    targetCPUUtilizationPercentage: 80

# Frontend Web UI
frontend:
  enabled: true
  replicaCount: 2
  image:
    repository: todo-frontend
    tag: v1.0.0
    pullPolicy: IfNotPresent
  service:
    type: ClusterIP
    port: 3000
    targetPort: 3000
  resources:
    requests:
      cpu: 50m
      memory: 64Mi
    limits:
      cpu: 200m
      memory: 256Mi
  healthCheck:
    enabled: true
    path: /api/health
    initialDelaySeconds: 10
    periodSeconds: 10
    timeoutSeconds: 5
    failureThreshold: 3
  autoscaling:
    enabled: false
    minReplicas: 2
    maxReplicas: 5
    targetCPUUtilizationPercentage: 80

# Chat UI
chatui:
  enabled: true
  replicaCount: 2
  image:
    repository: todo-chatui
    tag: v1.0.0
    pullPolicy: IfNotPresent
  service:
    type: ClusterIP
    port: 3001
    targetPort: 3000
  resources:
    requests:
      cpu: 50m
      memory: 64Mi
    limits:
      cpu: 200m
      memory: 256Mi
  healthCheck:
    enabled: true
    path: /api/health
    initialDelaySeconds: 10
    periodSeconds: 10
    timeoutSeconds: 5
    failureThreshold: 3
  autoscaling:
    enabled: false
    minReplicas: 2
    maxReplicas: 5
    targetCPUUtilizationPercentage: 80

# Agent Runtime
agent:
  enabled: true
  replicaCount: 1
  image:
    repository: todo-agent
    tag: v1.0.0
    pullPolicy: IfNotPresent
  service:
    type: ClusterIP
    port: 3002
    targetPort: 3000
  resources:
    requests:
      cpu: 100m
      memory: 256Mi
    limits:
      cpu: 500m
      memory: 1Gi
  healthCheck:
    enabled: true
    path: /health
    initialDelaySeconds: 15
    periodSeconds: 10
    timeoutSeconds: 5
    failureThreshold: 3
  env:
    model: "gpt-4-turbo-preview"
    temperature: "0.7"
  autoscaling:
    enabled: false

# MCP Server
mcpServer:
  enabled: true
  replicaCount: 1
  image:
    repository: todo-mcp-server
    tag: v1.0.0
    pullPolicy: IfNotPresent
  service:
    type: ClusterIP
    port: 3003
    targetPort: 3000
  resources:
    requests:
      cpu: 50m
      memory: 128Mi
    limits:
      cpu: 200m
      memory: 512Mi
  healthCheck:
    enabled: true
    path: /health
    initialDelaySeconds: 10
    periodSeconds: 10
    timeoutSeconds: 5
    failureThreshold: 3
  env:
    logLevel: "info"
  autoscaling:
    enabled: false

# Database (PostgreSQL)
database:
  enabled: true
  image:
    repository: postgres
    tag: 16-alpine
    pullPolicy: IfNotPresent
  service:
    type: ClusterIP
    port: 5432
    targetPort: 5432
  resources:
    requests:
      cpu: 250m
      memory: 512Mi
    limits:
      cpu: 1000m
      memory: 2Gi
  persistence:
    enabled: true
    storageClass: "standard"
    accessMode: ReadWriteOnce
    size: 10Gi
  env:
    database: "todo_db"
  healthCheck:
    enabled: true
    initialDelaySeconds: 10
    periodSeconds: 10
    timeoutSeconds: 5
    failureThreshold: 3

# Ingress
ingress:
  enabled: true
  className: nginx
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /$2
    nginx.ingress.kubernetes.io/ssl-redirect: "false"
  host: todo-ai.local
  tls:
    enabled: false
    secretName: todo-ai-tls

# Secrets (values should be base64 encoded)
secrets:
  database:
    username: "dG9kb191c2Vy"  # todo_user
    password: ""  # Set via --set or values override
  agent:
    openaiApiKey: ""  # Set via --set or values override

# Rolling Update Strategy
updateStrategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 1
    maxUnavailable: 0

# Pod Disruption Budget
podDisruptionBudget:
  enabled: false
  minAvailable: 1

# Network Policies
networkPolicy:
  enabled: false

# Service Account
serviceAccount:
  create: true
  name: todo-ai-sa
  annotations: {}
```

---

## values-dev.yaml

```yaml
# Development Environment Overrides
# Phase IV - Kubernetes Deployment

global:
  imagePullPolicy: Never  # Use local images in Minikube

backend:
  replicaCount: 1
  resources:
    requests:
      cpu: 50m
      memory: 64Mi
    limits:
      cpu: 200m
      memory: 256Mi

frontend:
  replicaCount: 1

chatui:
  replicaCount: 1

database:
  persistence:
    size: 5Gi

ingress:
  host: todo-ai.local
```

---

## values-prod.yaml

```yaml
# Production Environment Overrides
# Phase IV - Kubernetes Deployment

global:
  imagePullPolicy: Always
  imageRegistry: "registry.example.com/todo-ai/"

backend:
  replicaCount: 3
  autoscaling:
    enabled: true
    minReplicas: 3
    maxReplicas: 10

frontend:
  replicaCount: 3
  autoscaling:
    enabled: true
    minReplicas: 3
    maxReplicas: 10

chatui:
  replicaCount: 3
  autoscaling:
    enabled: true
    minReplicas: 3
    maxReplicas: 10

agent:
  replicaCount: 2

mcpServer:
  replicaCount: 2

database:
  persistence:
    size: 50Gi
    storageClass: "fast-ssd"

ingress:
  host: todo-ai.example.com
  tls:
    enabled: true

podDisruptionBudget:
  enabled: true
  minAvailable: 2

networkPolicy:
  enabled: true
```

---

## templates/_helpers.tpl

```yaml
{{/*
Expand the name of the chart.
*/}}
{{- define "todo-ai.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "todo-ai.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "todo-ai.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "todo-ai.labels" -}}
helm.sh/chart: {{ include "todo-ai.chart" . }}
{{ include "todo-ai.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "todo-ai.selectorLabels" -}}
app.kubernetes.io/name: {{ include "todo-ai.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "todo-ai.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "todo-ai.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Backend service URL
*/}}
{{- define "todo-ai.backend.url" -}}
{{- printf "http://backend-service.%s.svc.cluster.local:%d" .Values.global.namespace (.Values.backend.service.port | int) }}
{{- end }}

{{/*
Agent service URL
*/}}
{{- define "todo-ai.agent.url" -}}
{{- printf "http://agent-service.%s.svc.cluster.local:%d" .Values.global.namespace (.Values.agent.service.port | int) }}
{{- end }}

{{/*
MCP server URL
*/}}
{{- define "todo-ai.mcp.url" -}}
{{- printf "http://mcp-server-service.%s.svc.cluster.local:%d" .Values.global.namespace (.Values.mcpServer.service.port | int) }}
{{- end }}

{{/*
Database URL
*/}}
{{- define "todo-ai.database.url" -}}
{{- printf "postgresql://$(POSTGRES_USER):$(POSTGRES_PASSWORD)@database-service.%s.svc.cluster.local:%d/%s" .Values.global.namespace (.Values.database.service.port | int) .Values.database.env.database }}
{{- end }}
```

---

## templates/namespace.yaml

```yaml
{{- if .Values.global.namespace }}
apiVersion: v1
kind: Namespace
metadata:
  name: {{ .Values.global.namespace }}
  labels:
    {{- include "todo-ai.labels" . | nindent 4 }}
    name: {{ .Values.global.namespace }}
{{- end }}
```

---

## templates/deployments/backend.yaml

```yaml
{{- if .Values.backend.enabled }}
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: {{ .Values.global.namespace }}
  labels:
    {{- include "todo-ai.labels" . | nindent 4 }}
    app: backend
    component: api
spec:
  replicas: {{ .Values.backend.replicaCount }}
  strategy:
    type: {{ .Values.updateStrategy.type }}
    {{- if eq .Values.updateStrategy.type "RollingUpdate" }}
    rollingUpdate:
      maxSurge: {{ .Values.updateStrategy.rollingUpdate.maxSurge }}
      maxUnavailable: {{ .Values.updateStrategy.rollingUpdate.maxUnavailable }}
    {{- end }}
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
        component: api
    spec:
      serviceAccountName: {{ include "todo-ai.serviceAccountName" . }}
      containers:
      - name: backend
        image: "{{ .Values.global.imageRegistry }}{{ .Values.backend.image.repository }}:{{ .Values.backend.image.tag }}"
        imagePullPolicy: {{ .Values.backend.image.pullPolicy }}
        ports:
        - name: http
          containerPort: {{ .Values.backend.service.targetPort }}
          protocol: TCP
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: database-secret
              key: DATABASE_URL
        - name: CORS_ORIGINS
          valueFrom:
            configMapKeyRef:
              name: backend-config
              key: CORS_ORIGINS
        - name: LOG_LEVEL
          valueFrom:
            configMapKeyRef:
              name: backend-config
              key: LOG_LEVEL
        {{- if .Values.backend.healthCheck.enabled }}
        livenessProbe:
          httpGet:
            path: {{ .Values.backend.healthCheck.path }}
            port: http
          initialDelaySeconds: {{ .Values.backend.healthCheck.initialDelaySeconds }}
          periodSeconds: {{ .Values.backend.healthCheck.periodSeconds }}
          timeoutSeconds: {{ .Values.backend.healthCheck.timeoutSeconds }}
          failureThreshold: {{ .Values.backend.healthCheck.failureThreshold }}
        readinessProbe:
          httpGet:
            path: {{ .Values.backend.healthCheck.path }}
            port: http
          initialDelaySeconds: {{ .Values.backend.healthCheck.initialDelaySeconds }}
          periodSeconds: {{ .Values.backend.healthCheck.periodSeconds }}
          timeoutSeconds: {{ .Values.backend.healthCheck.timeoutSeconds }}
          failureThreshold: {{ .Values.backend.healthCheck.failureThreshold }}
        {{- end }}
        resources:
          {{- toYaml .Values.backend.resources | nindent 10 }}
        securityContext:
          runAsNonRoot: true
          runAsUser: 1000
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: false
{{- end }}
```

---

## templates/services/backend.yaml

```yaml
{{- if .Values.backend.enabled }}
apiVersion: v1
kind: Service
metadata:
  name: backend-service
  namespace: {{ .Values.global.namespace }}
  labels:
    {{- include "todo-ai.labels" . | nindent 4 }}
    app: backend
spec:
  type: {{ .Values.backend.service.type }}
  ports:
  - port: {{ .Values.backend.service.port }}
    targetPort: {{ .Values.backend.service.targetPort }}
    protocol: TCP
    name: http
  selector:
    app: backend
{{- end }}
```

---

## templates/configmaps/backend-config.yaml

```yaml
{{- if .Values.backend.enabled }}
apiVersion: v1
kind: ConfigMap
metadata:
  name: backend-config
  namespace: {{ .Values.global.namespace }}
  labels:
    {{- include "todo-ai.labels" . | nindent 4 }}
data:
  CORS_ORIGINS: {{ .Values.backend.env.corsOrigins | quote }}
  LOG_LEVEL: {{ .Values.backend.env.logLevel | quote }}
  DATABASE_HOST: "database-service.{{ .Values.global.namespace }}.svc.cluster.local"
  DATABASE_PORT: {{ .Values.database.service.port | quote }}
  DATABASE_NAME: {{ .Values.database.env.database | quote }}
{{- end }}
```

---

## templates/secrets/database-secret.yaml

```yaml
{{- if .Values.database.enabled }}
apiVersion: v1
kind: Secret
metadata:
  name: database-secret
  namespace: {{ .Values.global.namespace }}
  labels:
    {{- include "todo-ai.labels" . | nindent 4 }}
type: Opaque
data:
  POSTGRES_USER: {{ .Values.secrets.database.username }}
  POSTGRES_PASSWORD: {{ .Values.secrets.database.password }}
  DATABASE_URL: {{ printf "postgresql://%s:%s@database-service.%s.svc.cluster.local:%d/%s" (b64dec .Values.secrets.database.username) (b64dec .Values.secrets.database.password) .Values.global.namespace (.Values.database.service.port | int) .Values.database.env.database | b64enc }}
{{- end }}
```

---

## templates/statefulsets/database.yaml

```yaml
{{- if .Values.database.enabled }}
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: database
  namespace: {{ .Values.global.namespace }}
  labels:
    {{- include "todo-ai.labels" . | nindent 4 }}
    app: database
spec:
  serviceName: database-service
  replicas: 1
  selector:
    matchLabels:
      app: database
  template:
    metadata:
      labels:
        app: database
    spec:
      containers:
      - name: postgres
        image: "{{ .Values.database.image.repository }}:{{ .Values.database.image.tag }}"
        imagePullPolicy: {{ .Values.database.image.pullPolicy }}
        ports:
        - name: postgres
          containerPort: {{ .Values.database.service.targetPort }}
          protocol: TCP
        env:
        - name: POSTGRES_DB
          value: {{ .Values.database.env.database }}
        - name: POSTGRES_USER
          valueFrom:
            secretKeyRef:
              name: database-secret
              key: POSTGRES_USER
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: database-secret
              key: POSTGRES_PASSWORD
        - name: PGDATA
          value: /var/lib/postgresql/data/pgdata
        {{- if .Values.database.healthCheck.enabled }}
        livenessProbe:
          exec:
            command:
            - pg_isready
            - -U
            - $(POSTGRES_USER)
            - -d
            - $(POSTGRES_DB)
          initialDelaySeconds: {{ .Values.database.healthCheck.initialDelaySeconds }}
          periodSeconds: {{ .Values.database.healthCheck.periodSeconds }}
          timeoutSeconds: {{ .Values.database.healthCheck.timeoutSeconds }}
          failureThreshold: {{ .Values.database.healthCheck.failureThreshold }}
        readinessProbe:
          exec:
            command:
            - pg_isready
            - -U
            - $(POSTGRES_USER)
            - -d
            - $(POSTGRES_DB)
          initialDelaySeconds: {{ .Values.database.healthCheck.initialDelaySeconds }}
          periodSeconds: {{ .Values.database.healthCheck.periodSeconds }}
          timeoutSeconds: {{ .Values.database.healthCheck.timeoutSeconds }}
          failureThreshold: {{ .Values.database.healthCheck.failureThreshold }}
        {{- end }}
        resources:
          {{- toYaml .Values.database.resources | nindent 10 }}
        volumeMounts:
        - name: database-storage
          mountPath: /var/lib/postgresql/data
  {{- if .Values.database.persistence.enabled }}
  volumeClaimTemplates:
  - metadata:
      name: database-storage
    spec:
      accessModes:
      - {{ .Values.database.persistence.accessMode }}
      storageClassName: {{ .Values.database.persistence.storageClass }}
      resources:
        requests:
          storage: {{ .Values.database.persistence.size }}
  {{- end }}
{{- end }}
```

---

## templates/ingress.yaml

```yaml
{{- if .Values.ingress.enabled }}
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: todo-ai-ingress
  namespace: {{ .Values.global.namespace }}
  labels:
    {{- include "todo-ai.labels" . | nindent 4 }}
  annotations:
    {{- toYaml .Values.ingress.annotations | nindent 4 }}
spec:
  ingressClassName: {{ .Values.ingress.className }}
  {{- if .Values.ingress.tls.enabled }}
  tls:
  - hosts:
    - {{ .Values.ingress.host }}
    secretName: {{ .Values.ingress.tls.secretName }}
  {{- end }}
  rules:
  - host: {{ .Values.ingress.host }}
    http:
      paths:
      - path: /api(/|$)(.*)
        pathType: Prefix
        backend:
          service:
            name: backend-service
            port:
              number: {{ .Values.backend.service.port }}
      - path: /chat(/|$)(.*)
        pathType: Prefix
        backend:
          service:
            name: chatui-service
            port:
              number: {{ .Values.chatui.service.port }}
      - path: /(.*)
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: {{ .Values.frontend.service.port }}
{{- end }}
```

---

## Installation Commands

### Install Chart

```bash
# Install with default values
helm install todo-ai ./helm/todo-ai -n todo-ai --create-namespace

# Install with development values
helm install todo-ai ./helm/todo-ai -n todo-ai --create-namespace -f helm/todo-ai/values-dev.yaml

# Install with secrets
helm install todo-ai ./helm/todo-ai -n todo-ai --create-namespace \
  --set secrets.database.password=$(echo -n 'mypassword' | base64) \
  --set secrets.agent.openaiApiKey=$(echo -n 'sk-...' | base64)
```

### Upgrade Chart

```bash
# Upgrade with new values
helm upgrade todo-ai ./helm/todo-ai -n todo-ai

# Upgrade with new image version
helm upgrade todo-ai ./helm/todo-ai -n todo-ai \
  --set backend.image.tag=v1.1.0 \
  --set frontend.image.tag=v1.1.0
```

### Uninstall Chart

```bash
helm uninstall todo-ai -n todo-ai
```

### Validate Chart

```bash
# Lint chart
helm lint ./helm/todo-ai

# Dry run
helm install todo-ai ./helm/todo-ai -n todo-ai --dry-run --debug

# Template rendering
helm template todo-ai ./helm/todo-ai -n todo-ai
```

---

## Success Criteria

- ✅ Chart passes `helm lint`
- ✅ Chart installs successfully
- ✅ All pods reach Running state
- ✅ All services are created
- ✅ Ingress routes traffic correctly
- ✅ ConfigMaps and Secrets are created
- ✅ PersistentVolumeClaim is bound
- ✅ Rolling updates work without downtime
- ✅ Rollback works correctly
- ✅ Values can be overridden per environment

---

**Version**: 1.0.0
**Last Updated**: 2026-01-08
**Status**: Implementation Ready
