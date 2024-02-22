{{/*
Expand the name of the chart.
*/}}
{{- define "<%= name %>-service.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "<%= name %>-service.fullname" -}}
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
{{- define "<%= name %>-service.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "<%= name %>-service.labels" -}}
helm.sh/chart: {{ include "<%= name %>-service.chart" . }}
{{ include "<%= name %>-service.selectorLabels" . }}
{{ include "<%= name %>-service.datadogTags" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "<%= name %>-service.selectorLabels" -}}
app.kubernetes.io/name: {{ include "<%= name %>-service.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Datadog unified service tagging
*/}}
{{- define "<%= name %>-service.datadogTags" -}}
tags.datadoghq.com/env: {{ .Values.env.plain.release_env }}
tags.datadoghq.com/service: {{ include "<%= name %>-service.name" . }}
tags.datadoghq.com/version: {{ .Values.image.tag }}
{{- end}}

{{/*
Create the name of the service account to use
*/}}
{{- define "<%= name %>-service.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "<%= name %>-service.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

  
{{/*
List environment variables
*/}}
{{- define "helpers.list-env-variables"}}
{{- range $key, $val := .Values.env.secret }}
- name: {{ $key }}
valueFrom:
secretKeyRef:
name: app-env-secret
key: {{ $key }}
{{- end}}
{{- end }}
