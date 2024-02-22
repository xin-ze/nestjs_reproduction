import subprocess
import json
from datetime import datetime
from datetime import timedelta

lastWeekDateAndTime = datetime.now() - timedelta(days=7)
lastWeek = lastWeekDateAndTime.strftime("%Y-%m-%dT%H:%M:%S")


def cleanup_dev_jerry2_stack():
  print(f'will delete dev jerry2 cfn stack CreationTime before {lastWeek}')
  output = subprocess.Popen(f'aws cloudformation describe-stacks', shell=True, stdout=subprocess.PIPE).stdout.read()
  data = json.loads(output)
  stacks = data['Stacks']
  jstack = []
  for stack in stacks:
    if stack['StackName'].startswith('dev-Jerry2-') and stack['StackName'].endswith('-dev') and 'ParentId' not in stack:
      if stack['CreationTime'] < lastWeek:
        print(f'will delete cfn stack {stack["StackName"]} CreationTime: {stack["CreationTime"]}')
        jstack.append(stack['StackName'])
  for s in jstack:
    print(f'begin to delete cloudformation stack {s}')
    output = subprocess.Popen(f'aws cloudformation delete-stack --stack-name {s}', shell=True, stdout=subprocess.PIPE).stdout.read()
    print(f'delete cloudformation stack {s} output:')
    print(output)

def cleanup_dev_jerry2_namespace():
  print(f'will delete dev jerry2 namespace in stagingCluster EKS before {lastWeek}')
  subprocess.Popen(f'aws eks --region us-west-2  update-kubeconfig --name stagingCluster', shell=True, stdout=subprocess.PIPE).stdout.read()
  out = subprocess.Popen(f'kubectl get namespace | grep jerry2-dev-', shell=True, stdout=subprocess.PIPE).stdout.read().decode("utf-8")
  if len(out) == 0:
    return
  namespace_lines=out.split('\n')
  for nl in namespace_lines:
    line=[i for i in nl.split(' ') if i and i != '' and i != ' ']
    print(line)
    if len(line) != 3:
      continue
    if line[2].endswith("d") and int(line[2][:-1]) >= 7:
      delete_k8s_namespace(namespace=line[0])

def delete_k8s_namespace(namespace):
  out = subprocess.Popen(f'bash clean_namespace.sh {namespace}', shell=True, stdout=subprocess.PIPE).stdout.read()
  print(out)


if __name__ == '__main__':
  # customize jerry2 env may has pg, redis, mq which is not created by cfn. so we need to delete dev-jerry2 namespace to ensure delete these resources
  cleanup_dev_jerry2_namespace()
  cleanup_dev_jerry2_stack()

