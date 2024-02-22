import os
import subprocess
import argparse
import json

zsh_path = f'{os.path.expanduser("~")}/.zshrc'
bash_path = f'{os.path.expanduser("~")}/.bashrc'

def set_aws_token(user, code):
  output = subprocess.Popen(f'export AWS_ACCESS_KEY_ID="" && export AWS_SECRET_ACCESS_KEY="" && export AWS_SESSION_TOKEN="" && aws sts get-session-token --no-verify-ssl --serial-number arn:aws:iam::919341117301:mfa/{user} --token-code {code} --duration-seconds 129600', shell=True, stdout=subprocess.PIPE).stdout.read()
  data = json.loads(output)
  print('You can run ')
  print(f'export AWS_ACCESS_KEY_ID={data["Credentials"]["AccessKeyId"]}')
  print(f'export AWS_SECRET_ACCESS_KEY={data["Credentials"]["SecretAccessKey"]}')
  print(f'export AWS_SESSION_TOKEN={data["Credentials"]["SessionToken"]}')
 
  credentials = bash_path
  if os.path.exists(zsh_path):
    credentials = zsh_path
    print('in your iterm or source ~/.zshrc')
  elif os.path.exists(bash_path):
    print('in your iterm or source ~/.bashrc')
  else:
    with open(bash_path, 'a+') as file:
      print('create ', bash_path)
    print('in your iterm or source ~/.bashrc')

  bash_lines = []
  with open(credentials, 'r', encoding='utf-8') as file:
    lines = file.readlines()
    for line in lines:
      if 'AWS_ACCESS_KEY_ID' not in line and 'AWS_SECRET_ACCESS_KEY' not in line and 'AWS_SESSION_TOKEN' not in line:
        bash_lines.append(line)
  with open(credentials, 'w', encoding='utf-8') as file:
    for line in bash_lines:
      file.write(line)
    file.write(f'export AWS_ACCESS_KEY_ID={data["Credentials"]["AccessKeyId"]}\n')
    file.write(f'export AWS_SECRET_ACCESS_KEY={data["Credentials"]["SecretAccessKey"]}\n')
    file.write(f'export AWS_SESSION_TOKEN={data["Credentials"]["SessionToken"]}\n')
  
if __name__ == '__main__':
  parser = argparse.ArgumentParser("For test the parser")
  parser.add_argument('-u', '--user', required=True, help='aws user')
  parser.add_argument('-c', '--code', required=True, help='auth code from app')
  args = parser.parse_args()
  set_aws_token(user=args.user, code=args.code)
