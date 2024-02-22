# <%= pascalCase(name) %> Service

Helm chart for running <%= pascalCase(name) %> service on EKS cluster.

Used `ExternalSecret` to inject SSM value to environment values.
Used `DatadogMetric` to control HPA with customized metrics. [link](https://www.datadoghq.com/blog/autoscale-kubernetes-datadog/)
Use `values-stage.yaml` and `values-prod.yaml` to separate different environment configurations.

We managed pod IAM permission using a service account created by AWS CDK. Please don't create any service account using the helm chart unless you intended.
