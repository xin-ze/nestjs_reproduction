import json
import subprocess
import os

from nx_affected_utils import read_weight_map, weighted_distribute

# If you want to exclude certain apps (e.g. quoting) from automatic deployment, add it here
IGNORED_APPS = {}

if __name__ == '__main__':
    baseRef = os.environ.get('BASE_REF', 'master')

    # Generate chunks of affected apps
    affected_result = subprocess.run(
        ['npx', 'nx', 'affected:apps', '--base='+baseRef, '--head=HEAD', '--plain'], stdout=subprocess.PIPE)
    affected = affected_result.stdout.decode().strip().split(' ')
    affected = [app for app in affected if app not in IGNORED_APPS]
    print(affected)

    weight_map = read_weight_map()
    print(weight_map)

    affected_chunks = weighted_distribute(15, affected, weight_map)
    with open(os.environ['GITHUB_OUTPUT'], 'a') as fh:
        print("affected=" + json.dumps([','.join(chunked) for chunked in affected_chunks]), file=fh)
    print('worker apps distribution:', [len(chunk)
          for chunk in affected_chunks])
