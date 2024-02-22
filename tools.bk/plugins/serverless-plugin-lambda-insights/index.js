'use strict';

const get = require('lodash/get');
const forEach = require('lodash/forEach');

class ServerlessPlugin {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;
    this.provider = serverless ? serverless.getProvider('aws') : null;
    this.service = serverless.service;

    if (!this.provider) {
      throw new Error('This plugin must be used with AWS');
    }

    this.hooks = {
      'after:aws:package:finalize:mergeCustomProviderResources': this.addLambdaInsights.bind(this),
    };
  }

  addLambdaInsights() {
    const template = this.serverless.service.provider.compiledCloudFormationTemplate;
    forEach(template.Resources, (resource, key) => {
      const properties = resource.Properties;
      // Not add lambda insights for EsLogs lambda
      if (resource.Type === 'AWS::Lambda::Function' && !key.startsWith('EsLogsProcesser')) {
        this.attachLayer(properties);
      } else if (resource.Type === 'AWS::IAM::Role') {
        this.attachManagedPolicy(properties);
      }
    });
  }

  /**
   * Attach CloudWatch Lambda Insights Policy to Role
   * @param {*} role
   */
  attachManagedPolicy(role) {
    role.ManagedPolicyArns = (role.ManagedPolicyArns || []).concat(
      'arn:aws:iam::aws:policy/CloudWatchLambdaInsightsExecutionRolePolicy'
    );
  }

  /**
   * Attach Lambda Layer
   * https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Lambda-Insights-extension-versions.html
   * @param {*} lambda
   */
  attachLayer(lambda) {
    lambda.Layers = (lambda.Layers || []).concat(
      `arn:aws:lambda:${this.serverless.service.provider.region}:580247275435:layer:LambdaInsightsExtension:12`
    );
  }
}

module.exports = ServerlessPlugin;
