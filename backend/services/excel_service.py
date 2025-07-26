import pandas as pd
from backend.utils.flatten import flatten_dict

def salva_excel(data, path):
    flat = flatten_dict(data)
    rows = []
    for keys, value in flat:
        while len(keys) < 3:
            keys += ('-',)
        rows.append((*keys, value))
    df = pd.DataFrame(rows, columns=["Categoria", "Sottocategoria", "Dettaglio", "Valore"])
    df.to_excel(path, index=False)