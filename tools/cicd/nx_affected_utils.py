import json
import os

def weighted_distribute(max_bucket_weight, items, item_weight_map):
    """Compute weighted distribution
    1 weight equals 1 min job time
    Default weight is 5
    """
    def get_weight(item):
        return item_weight_map.get(item, 5)

    weight_sum = sum([get_weight(item) for item in items])

    # handle for all small weighted items to schedule at least 2 workers 
    if weight_sum <= max_bucket_weight * 2:
        max_bucket_weight = weight_sum // 2

    def iter():
        bucket = []
        bucket_weight = 0
        for item in items:
            weight = get_weight(item)
            if bucket_weight + weight > max_bucket_weight:
                if len(bucket) > 0:
                    yield bucket
                bucket_weight = weight
                bucket = [item]
            else:
                bucket_weight += weight
                bucket.append(item)
        # handle last item
        if len(bucket) > 0:
            yield bucket

    return list(iter())


def read_weight_map():
    with open(os.path.join(os.path.dirname(__file__), '../../', '.build.time.json')) as json_file:
        return json.load(json_file)
