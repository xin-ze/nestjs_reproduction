'use strict';

const _ = require('lodash');

class ServerlessPlugin {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;
    this.provider = serverless ? serverless.getProvider('aws') : null;
    this.service = serverless.service;
    this.stage = null;
    this.region = null;
    this.isApiGatewayStageAvailableInTemplate = false;
    this.supportedTypes = [
      'AWS::Lambda::Function',
      'AWS::SQS::Queue',
      'AWS::Kinesis::Stream',
      'AWS::DynamoDB::Table',
      'AWS::S3::Bucket',
      'AWS::ApiGateway::Stage',
      'AWS::CloudFront::Distribution',
      'AWS::EC2::SpotFleet',
    ];

    if (!this.provider) {
      throw new Error('This plugin must be used with AWS');
    }

    this.hooks = {
      'deploy:finalize': this._addAPIGatewayStageTags.bind(this),
      'after:deploy:deploy': this._addTagsToResource.bind(this),
      'after:aws:package:finalize:mergeCustomProviderResources': this._addTagsToResource.bind(this),
    };
  }

  _addTagsToResource() {
    const stackTags = [];
    const self = this;
    const template = this.serverless.service.provider.compiledCloudFormationTemplate;

    this.stage = this.serverless.service.provider.stage;
    if (this.serverless.variables.options.stage) {
      this.stage = this.serverless.variables.options.stage;
    }

    this.region = this.serverless.service.provider.region;
    if (this.serverless.variables.options.region) {
      this.region = this.serverless.variables.options.region;
    }

    if (typeof this.serverless.service.provider.stackTags === 'object') {
      const tags = this.serverless.service.provider.stackTags;
      Object.keys(tags).forEach(function (key) {
        stackTags.push({ Key: key, Value: tags[key] });
      });
    }

    const assignTags = function (tagsParent) {
      const tags = tagsParent['Tags'];
      if (tags) {
        tagsParent['Tags'] = tags.concat(stackTags.filter((obj) => self._getTagNames(tags).indexOf(obj['Key']) === -1));
      } else {
        tagsParent['Tags'] = stackTags;
      }
    };

    Object.keys(template.Resources).forEach(function (key) {
      const resourceType = template.Resources[key]['Type'];
      if (self.supportedTypes.indexOf(resourceType) !== -1 && Array.isArray(stackTags) && stackTags.length > 0) {
        if (resourceType === 'AWS::EC2::SpotFleet') {
          template.Resources[key]['Properties']['SpotFleetRequestConfigData']['LaunchSpecifications'].forEach(
            (launchSpecifications) => {
              launchSpecifications['TagSpecifications'] = (launchSpecifications['TagSpecifications'] || []).concat({
                ResourceType: 'instance',
              });
              assignTags(launchSpecifications['TagSpecifications'][0]);
            }
          );
        } else if (template.Resources[key]['Properties']) {
          assignTags(template.Resources[key]['Properties']);
        } else {
          self.serverless.cli.log('Properties not available for ' + resourceType);
        }
      }

      //Flag to avoid _addAPIGatewayStageTags() call if stage config is available in serverless.yml
      if (resourceType === 'AWS::ApiGateway::Stage') {
        self.isApiGatewayStageAvailableInTemplate = true;
      }
    });
    self.serverless.cli.log('Updated AWS resource tags..');
  }

  _addAPIGatewayStageTags() {
    const self = this;
    const stackName = this.provider.naming.getStackName();
    if (!self.isApiGatewayStageAvailableInTemplate) {
      return this.provider
        .request('CloudFormation', 'describeStackResources', { StackName: stackName })
        .then(function (resp) {
          const promiseStack = [];
          _.each(
            _.filter(resp.StackResources, (resource) => resource.ResourceType === 'AWS::ApiGateway::RestApi'),
            function (resource) {
              const apiStageParams = {
                resourceArn:
                  'arn:aws:apigateway:' +
                  self.region +
                  '::/restapis/' +
                  resource.PhysicalResourceId +
                  '/stages/' +
                  self.stage,
                tags: self.service.provider.stackTags,
              };
              promiseStack.push(self.provider.request('APIGateway', 'tagResource', apiStageParams));
            }
          );
          return Promise.all(promiseStack).then((resp) =>
            self.serverless.cli.log('Updated APIGateway resource tags..')
          );
        });
    } else {
      self.serverless.cli.log('APIGateway stage already available in serverless.yml. Tag update skipped.');
      return null;
    }
  }

  _getTagNames(srcArray) {
    const tagNames = [];
    srcArray.forEach(function (element) {
      tagNames.push(element['Key']);
    });
    return tagNames;
  }
}

module.exports = ServerlessPlugin;
