import json
import subprocess
import os
import argparse

from nx_affected_utils import read_weight_map, weighted_distribute

class SplitArgs(argparse.Action):
    def __call__(self, parser, namespace, values, option_string=None):
        setattr(namespace, self.dest, values.split(','))

"""
set output for input apps list string or set output for all apps when pass "all" as argument
"""
if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--apps', help='set output to apps list or all apps if pass "all"', action=SplitArgs)
    args = parser.parse_args()

    if args.apps[0] == 'all':
        apps_result = subprocess.run(
            ['npx', 'nx', 'affected:apps', '--all', '--plain'], stdout=subprocess.PIPE)
        apps = apps_result.stdout.decode().strip().split(' ')
    else:
        apps = args.apps

    with open(os.environ['GITHUB_OUTPUT'], 'a') as fh:
        print("app=" + json.dumps(list(map(str.strip, apps))), file=fh)
