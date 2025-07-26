def flatten_dict(d, parent_keys=[]):
    items = []
    for k, v in d.items():
        new_keys = parent_keys + [k]
        if isinstance(v, dict):
            items.extend(flatten_dict(v, new_keys))
        elif isinstance(v, list):
            for i, val in enumerate(v):
                items.append((tuple(new_keys + [f'item_{i+1}']), val))
        else:
            items.append((tuple(new_keys), v))
    return items