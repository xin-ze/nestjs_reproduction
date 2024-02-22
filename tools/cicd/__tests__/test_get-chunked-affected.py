"""
Unit test for nx_affected_utils chunk strategy
```bash
cd toos/cicd
python3 -m unittest __tests__/test_get-chunked-affected.py
```
"""
import nx_affected_utils
import sys
import os
import unittest

sys.path.insert(0, os.path.abspath(
    os.path.join(os.path.dirname(__file__), '..')))


class TestGetChunkedAffected(unittest.TestCase):

    def test_weighted_distribute_when_empty_items(self):
        max_bucket_weight = 12
        items = []
        item_weight_map = {'A1': 5}
        result = nx_affected_utils.weighted_distribute(
            max_bucket_weight, items, item_weight_map)
        self.assertEqual(result, [])

    def test_weighted_distribute_when_one_item(self):
        max_bucket_weight = 12
        items = ['A1']
        item_weight_map = {'A1': 5}
        result = nx_affected_utils.weighted_distribute(
            max_bucket_weight, items, item_weight_map)
        self.assertEqual(result, [['A1']])

    def test_weighted_distribute_when_all_equal(self):
        max_bucket_weight = 12
        items = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7']
        item_weight_map = {'A1': 5}
        result = nx_affected_utils.weighted_distribute(
            max_bucket_weight, items, item_weight_map)
        self.assertEqual(
            result, [['A1', 'A2'], ['A3', 'A4'], ['A5', 'A6'], ['A7']])

    def test_weighted_distribute_when_not_equal(self):
        max_bucket_weight = 12
        items = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7']
        item_weight_map = {'A1': 1, 'A2': 2, 'A3': 3,
                           'A4': 4, 'A5': 5, 'A6': 6, 'A7': 7}
        result = nx_affected_utils.weighted_distribute(
            max_bucket_weight, items, item_weight_map)
        self.assertEqual(result, [['A1', 'A2', 'A3', 'A4'],
                         ['A5', 'A6'], ['A7']])

    def test_weighted_distribute_when_all_weight_large_than_max(self):
        max_bucket_weight = 3
        items = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7']
        item_weight_map = {'A1': 3, 'A2': 4, 'A3': 5,
                           'A4': 4, 'A5': 5, 'A6': 6, 'A7': 7}
        result = nx_affected_utils.weighted_distribute(
            max_bucket_weight, items, item_weight_map)
        self.assertEqual(result, [['A1'], ['A2'], ['A3'], ['A4'],
                         ['A5'], ['A6'], ['A7']])
                
    def test_weighted_distribute_when_all_weight_small_than_max(self):
        max_bucket_weight = 12
        items = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7']
        item_weight_map = {'A1': 1, 'A2': 2, 'A3': 1,
                           'A4': 1, 'A5': 1, 'A6': 2, 'A7': 2}
        result = nx_affected_utils.weighted_distribute(
            max_bucket_weight, items, item_weight_map)
        self.assertEqual(result, [['A1', 'A2', 'A3', 'A4'],
                         ['A5', 'A6', 'A7']])


if __name__ == '__main__':
    unittest.main()
