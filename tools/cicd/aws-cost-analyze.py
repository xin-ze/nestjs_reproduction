from datetime import datetime, timedelta
import os
import boto3
from slack_sdk.webhook import WebhookClient
import argparse

untagged_list = ['Amazon Elastic Container Service for Kubernetes',
                  'AWS WAF', 'Amazon Virtual Private Cloud', 'Amazon GuardDuty',
                  'Amazon Cognito', 'Amazon Textract', 'AWS Config',
                  'Amazon CloudFront', 'AWS Cost Explorer', 'AWS X-Ray', 
                  'AWS Secrets Manager', 'Amazon API Gateway', 
                  'Amazon DevOps Guru', 'CloudWatch Events', 'Savings Plans for AWS Compute usage'
                ]

no_tag_service_filters = {
  "And":[
    { 
      "Tags": {
        "Key": 'Department',
        "MatchOptions": ["ABSENT"]
      }
    },
    {
      "Not": {
        "Dimensions": {
          "Key": "SERVICE",
          "Values": untagged_list,
        }
      }
    }
  ]
}

service_filters = {
  "Not": {
    "Dimensions": {
      "Key": "SERVICE",
      "Values": untagged_list,
    }
  }
}

def get_ce_detail(aws_client, start_date, end_date, dimension, cost_filter):
    response = aws_client.get_cost_and_usage(
        TimePeriod={
            'Start': start_date,
            'End': end_date,
        },
        Granularity='DAILY',
        Metrics=[
          'UnblendedCost'
        ],
        Filter=cost_filter,
        GroupBy=[
            {
                'Type': 'DIMENSION',
                'Key': dimension
            }
        ]
    )
    return response['ResultsByTime']

def convert_to_float(a):
  try:
    return float(a)
  except:
    return 0

# generate cost report
def analyze_cost(no_tag_cost, all_cost):
  all_data = {}
  daily_details = ''

  # collect no tag cost
  for cost in no_tag_cost:
    key = cost["TimePeriod"]["Start"]
    daily_cost = 0
    for group in cost["Groups"]:
      daily_cost += convert_to_float(group["Metrics"]["UnblendedCost"]["Amount"])
    all_data[key] = {'notag': daily_cost}  

  for cost in all_cost:
    key = cost["TimePeriod"]["Start"]
    daily_cost = 0
    for group in cost["Groups"]:
      daily_cost += convert_to_float(group["Metrics"]["UnblendedCost"]["Amount"])
    all_data[key]['all'] = daily_cost
  
  no_tag_cost = 0
  all_cost = 0
  # collect all taggable cost
  for key in all_data:
    no_tag_cost += all_data[key]['notag']
    all_cost += all_data[key]['all']
    percent = all_data[key]['notag']/all_data[key]["all"]
    all_data[key]['percent'] = percent
    msg = f'{key} all taggable cost: {all_data[key]["all"]}, no tag cost: {all_data[key]["notag"]}, no tag percent: {percent} \n'
    daily_details += msg

  percent = no_tag_cost/all_cost
  return f'all taggable cost:{all_cost}, no tag cost: {no_tag_cost}, no tag percent: {percent} \n' + daily_details
    
def send_slack_msg(msg):
  value = os.getenv("SLACK_WEBHOOK") 
  if value:
    webhook = WebhookClient(value)
    webhook.send(
      text="fallback",
      blocks=[
          {
              "type": "section",
              "text": {
                  "type": "mrkdwn",
                  "text": f'{msg}'
              }
          }
      ]
    )
  else:
    print(f'need to set {key} in env')

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--sendMsg', help='send slack message', action='store_true', required=False, default=False)
    args = parser.parse_args()
    sendMsg = args.sendMsg

    session = boto3.Session()
    aws_client = session.client('ce')
    
    # get past week cost details
    current_datetime = datetime.now()
    delta = timedelta(days=7)
    previous_datetime = current_datetime - delta
    previous_date = previous_datetime.date()

    end = datetime.today().strftime('%Y-%m-%d')
    start = previous_date.strftime('%Y-%m-%d')

    # get no tag taggable resources cost
    no_tag_cost = get_ce_detail(aws_client, start, end, 'SERVICE', no_tag_service_filters)
    
    # get all taggable resources cost
    all_cost = get_ce_detail(aws_client, start, end, 'SERVICE', service_filters)

    # generate weekly report
    details = analyze_cost(no_tag_cost, all_cost)

    text = f'{start}-{end}: {details}'
    print(text)
    print(f'send message: {sendMsg}')
    if sendMsg is True:
      send_slack_msg(msg=f'```{text}```')
