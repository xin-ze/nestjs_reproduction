import argparse
import json
import subprocess
import os

from nx_affected_utils import read_weight_map, weighted_distribute

deprecated_list = ['chatbot-dialogflow', 'chatbot-service']

if __name__ == '__main__':
    baseRef = os.environ.get('BASE_REF', 'master')
    parser = argparse.ArgumentParser()
    parser.add_argument('--all', help='set output to all apps/libs', action='store_true')
    args = parser.parse_args()

    if args.all:
        # Generate chunks of all apps/libs
        affected_result = subprocess.run(
            ['npx', 'nx', 'print-affected', '--all'], stdout=subprocess.PIPE)
    else:
        # Generate chunks of affected apps/libs
        affected_result = subprocess.run(
            ['npx', 'nx', 'print-affected', '--base='+baseRef, '--head=HEAD'], stdout=subprocess.PIPE)

    affected = list(filter(lambda item: not item.startswith('npm:'),
                    json.loads(affected_result.stdout.decode())['projects']))
    affected = list(filter(lambda x: x not in deprecated_list, affected))
    print(affected)
    weight_map = read_weight_map()
    print(weight_map)

    affected_chunks = weighted_distribute(10, affected, weight_map)
    with open(os.environ['GITHUB_OUTPUT'], 'a') as fh:
        print("affected=" + json.dumps([','.join(chunked) for chunked in affected_chunks]), file=fh)
    print('worker apps distribution:', [len(chunk)
          for chunk in affected_chunks])
