#!/Users/limusen/app/anaconda3/bin/python
# -*- coding: utf-8 -*-

from flask import Flask, render_template, jsonify, request
from ase.db import connect
import json
import numpy as np
from pathlib import Path

app = Flask(__name__)

DB_PATH = Path(__file__).parent / 'data' / 'h.db'
db = connect(str(DB_PATH))

def safe_serialize(obj):
    """Convert numpy types to Python native types for JSON serialization"""
    if isinstance(obj, (np.integer, np.floating)):
        return obj.item()
    elif isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, dict):
        return {k: safe_serialize(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [safe_serialize(i) for i in obj]
    return obj

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/stats')
def get_stats():
    total = len(db)

    formulas = set()
    elements = set()
    gaps = []
    atom_counts = []

    for row in db.select():
        formulas.add(row.formula)
        if hasattr(row, 'symbols'):
            elements.update(row.symbols)
        atom_counts.append(row.natoms)
        if 'gap' in row.key_value_pairs:
            gaps.append(row.gap)

    stats = {
        'total_entries': total,
        'unique_formulas': len(formulas),
        'unique_elements': len(elements),
        'avg_atoms': np.mean(atom_counts) if atom_counts else 0,
        'avg_gap': np.mean(gaps) if gaps else 0,
        'metallic_count': sum(1 for g in gaps if g < 0.01),
        'semiconductor_count': sum(1 for g in gaps if g >= 0.01)
    }

    return jsonify(safe_serialize(stats))

@app.route('/api/entries')
def get_entries():
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 50))
    search = request.args.get('search', '').strip()

    offset = (page - 1) * per_page

    entries = []
    total = 0

    if search:
        matching_ids = []
        for row in db.select():
            if (search.lower() in row.formula.lower() or
                search.lower() in row.get('mpid', '').lower()):
                matching_ids.append(row.id)

        total = len(matching_ids)
        for row_id in matching_ids[offset:offset + per_page]:
            row = db.get(id=row_id)
            entries.append(format_entry(row))
    else:
        total = len(db)
        for row in db.select(limit=per_page, offset=offset):
            entries.append(format_entry(row))

    return jsonify({
        'entries': entries,
        'total': total,
        'page': page,
        'per_page': per_page,
        'total_pages': (total + per_page - 1) // per_page
    })

@app.route('/api/entry/<int:entry_id>')
def get_entry(entry_id):
    try:
        row = db.get(id=entry_id)
        entry = format_entry(row, detailed=True)

        entry['structure'] = {
            'positions': row.positions.tolist(),
            'cell': row.cell.tolist(),
            'pbc': row.pbc.tolist(),
            'symbols': list(row.symbols)
        }

        if hasattr(row, 'data'):
            entry['hirshfeld_data'] = {}
            for key in ['hirshfeld', 'hirshfeld_i', 'hirshfeld_relvol', 'hirshfeld_i_relvol']:
                if key in row.data:
                    entry['hirshfeld_data'][key] = safe_serialize(row.data[key])

        if 'extra' in row.key_value_pairs:
            try:
                extra_data = json.loads(row.extra)
                entry['calculation_details'] = safe_serialize(extra_data)
            except:
                pass

        return jsonify(entry)
    except Exception as e:
        return jsonify({'error': str(e)}), 404

def format_entry(row, detailed=False):
    entry = {
        'id': row.id,
        'formula': row.formula,
        'n_atoms': row.natoms,
        'mpid': row.get('mpid', ''),
        'gap': row.get('gap', 0),
        'status': row.get('status', ''),
        'calc_status': row.get('calc_status', ''),
        'jtype': row.get('jtype', '')
    }

    if detailed:
        entry['key_value_pairs'] = dict(row.key_value_pairs)
        entry['data_keys'] = list(row.data.keys()) if hasattr(row, 'data') else []

    return safe_serialize(entry)

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)
