let currentPage = 1;
let totalPages = 1;
let currentSearch = '';

document.addEventListener('DOMContentLoaded', function() {
    loadStats();
    loadEntries();

    document.getElementById('searchBtn').addEventListener('click', handleSearch);
    document.getElementById('resetBtn').addEventListener('click', handleReset);
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });

    document.getElementById('prevBtn').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadEntries();
        }
    });

    document.getElementById('nextBtn').addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            loadEntries();
        }
    });

    const modal = document.getElementById('modal');
    const closeBtn = document.querySelector('.close');

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
});

async function loadStats() {
    try {
        const response = await fetch('/api/stats');
        const stats = await response.json();

        document.getElementById('totalEntries').textContent = stats.total_entries.toLocaleString();
        document.getElementById('uniqueFormulas').textContent = stats.unique_formulas.toLocaleString();
        document.getElementById('uniqueElements').textContent = stats.unique_elements;
        document.getElementById('avgAtoms').textContent = stats.avg_atoms.toFixed(1);
        document.getElementById('avgGap').textContent = stats.avg_gap.toFixed(3);
        document.getElementById('metallicCount').textContent = stats.metallic_count.toLocaleString();
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

async function loadEntries() {
    const tableBody = document.getElementById('dataTable');
    tableBody.innerHTML = '<tr><td colspan="8" class="loading">Loading data...</td></tr>';

    try {
        const url = `/api/entries?page=${currentPage}&per_page=50&search=${encodeURIComponent(currentSearch)}`;
        const response = await fetch(url);
        const data = await response.json();

        totalPages = data.total_pages;
        updatePagination(data);

        if (data.entries.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="8" class="loading">No entries found</td></tr>';
            return;
        }

        tableBody.innerHTML = '';
        data.entries.forEach(entry => {
            const row = document.createElement('tr');

            const gapValue = parseFloat(entry.gap);
            const materialType = gapValue < 0.01 ? 'Metallic' : 'Semiconductor';
            const typeBadge = gapValue < 0.01 ? 'badge-metallic' : 'badge-semiconductor';

            row.innerHTML = `
                <td>${entry.id}</td>
                <td><strong>${entry.formula}</strong></td>
                <td><a href="https://materialsproject.org/materials/${entry.mpid}" target="_blank">${entry.mpid}</a></td>
                <td>${entry.n_atoms}</td>
                <td>${gapValue.toFixed(3)}</td>
                <td><span class="badge ${typeBadge}">${materialType}</span></td>
                <td><span class="badge badge-success">${entry.status}</span></td>
                <td><button class="btn-view" onclick="viewEntry(${entry.id})">View Details</button></td>
            `;

            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading entries:', error);
        tableBody.innerHTML = '<tr><td colspan="8" class="loading">Error loading data</td></tr>';
    }
}

function updatePagination(data) {
    document.getElementById('pageInfo').textContent =
        `Page ${data.page} of ${data.total_pages} (${data.total} entries)`;

    document.getElementById('prevBtn').disabled = currentPage <= 1;
    document.getElementById('nextBtn').disabled = currentPage >= totalPages;
}

function handleSearch() {
    currentSearch = document.getElementById('searchInput').value;
    currentPage = 1;
    loadEntries();
}

function handleReset() {
    currentSearch = '';
    currentPage = 1;
    document.getElementById('searchInput').value = '';
    loadEntries();
}

async function viewEntry(entryId) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    modalBody.innerHTML = '<div class="loading">Loading details...</div>';
    modal.style.display = 'block';

    try {
        const response = await fetch(`/api/entry/${entryId}`);
        const entry = await response.json();

        if (entry.error) {
            modalBody.innerHTML = `<div class="loading">Error: ${entry.error}</div>`;
            return;
        }

        modalTitle.textContent = `${entry.formula} - Entry #${entry.id}`;

        let html = '<div class="detail-section">';
        html += '<h3>📋 Basic Information</h3>';
        html += '<div class="detail-grid">';
        html += `<div class="detail-item"><div class="detail-label">Formula</div><div class="detail-value">${entry.formula}</div></div>`;
        html += `<div class="detail-item"><div class="detail-label">MP-ID</div><div class="detail-value"><a href="https://materialsproject.org/materials/${entry.mpid}" target="_blank">${entry.mpid}</a></div></div>`;
        html += `<div class="detail-item"><div class="detail-label">Number of Atoms</div><div class="detail-value">${entry.n_atoms}</div></div>`;
        html += `<div class="detail-item"><div class="detail-label">Band Gap (eV)</div><div class="detail-value">${entry.gap.toFixed(3)}</div></div>`;
        html += `<div class="detail-item"><div class="detail-label">Calculation Type</div><div class="detail-value">${entry.jtype}</div></div>`;
        html += `<div class="detail-item"><div class="detail-label">Status</div><div class="detail-value">${entry.status}</div></div>`;
        html += '</div></div>';

        if (entry.structure) {
            html += '<div class="detail-section">';
            html += '<h3>⚛️ Structure Information</h3>';
            html += '<div class="detail-grid">';
            html += `<div class="detail-item"><div class="detail-label">Elements</div><div class="detail-value">${entry.structure.symbols.join(', ')}</div></div>`;
            html += `<div class="detail-item"><div class="detail-label">Periodic Boundary</div><div class="detail-value">${entry.structure.pbc.map(p => p ? 'T' : 'F').join(', ')}</div></div>`;
            html += '</div>';
            html += '<details style="margin-top: 15px;"><summary style="cursor: pointer; color: #667eea; font-weight: 600;">Show Cell Parameters</summary>';
            html += '<pre>' + JSON.stringify(entry.structure.cell, null, 2) + '</pre></details>';
            html += '</div>';
        }

        if (entry.hirshfeld_data) {
            html += '<div class="detail-section">';
            html += '<h3>⚡ Hirshfeld Charge Analysis</h3>';

            for (const [key, value] of Object.entries(entry.hirshfeld_data)) {
                const displayName = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                html += `<details style="margin-top: 10px;"><summary style="cursor: pointer; color: #667eea; font-weight: 600;">${displayName}</summary>`;

                if (Array.isArray(value)) {
                    html += '<div style="margin-top: 10px; padding: 10px; background: white; border-radius: 5px;">';
                    html += '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 10px;">';
                    value.forEach((v, i) => {
                        const symbol = entry.structure ? entry.structure.symbols[i] : `Atom ${i+1}`;
                        html += `<div style="padding: 8px; background: #f8f9ff; border-radius: 5px; text-align: center;">`;
                        html += `<div style="font-size: 0.85em; color: #666;">${symbol} #${i+1}</div>`;
                        html += `<div style="font-weight: 600; color: #333;">${parseFloat(v).toFixed(4)}</div>`;
                        html += `</div>`;
                    });
                    html += '</div></div>';
                } else {
                    html += '<pre>' + JSON.stringify(value, null, 2) + '</pre>';
                }

                html += '</details>';
            }
            html += '</div>';
        }

        if (entry.calculation_details) {
            html += '<div class="detail-section">';
            html += '<h3>🔬 Calculation Details</h3>';

            const details = entry.calculation_details;

            if (details._calc_forces) {
                html += '<details style="margin-top: 10px;"><summary style="cursor: pointer; color: #667eea; font-weight: 600;">Forces on Atoms</summary>';
                html += '<pre>' + JSON.stringify(details._calc_forces, null, 2) + '</pre></details>';
            }

            if (details._calc_stress) {
                html += '<details style="margin-top: 10px;"><summary style="cursor: pointer; color: #667eea; font-weight: 600;">Stress Tensor</summary>';
                html += '<pre>' + JSON.stringify(details._calc_stress, null, 2) + '</pre></details>';
            }

            if (details._calc_magmoms) {
                html += '<details style="margin-top: 10px;"><summary style="cursor: pointer; color: #667eea; font-weight: 600;">Magnetic Moments</summary>';
                html += '<pre>' + JSON.stringify(details._calc_magmoms, null, 2) + '</pre></details>';
            }

            html += '</div>';
        }

        modalBody.innerHTML = html;
    } catch (error) {
        console.error('Error loading entry details:', error);
        modalBody.innerHTML = '<div class="loading">Error loading details</div>';
    }
}
