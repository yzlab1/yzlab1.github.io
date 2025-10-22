// ========== FIBROBLASTS PORTAL - GITHUB PAGES VERSION ==========
console.log('🔬 Fibroblasts GitHub Pages portal loading...');

// ========== GLOBAL VARIABLES ==========
let fibroblastData = {
    umap: null,
    geneData: null,
    markerStats: null,
    summary: null
};

let currentMarker = 'CD34';
let currentGrouping = 'harmony_annotation';
let isLoading = false;
let availableGenes = [];
let selectedSuggestionIndex = -1;

const commonGenes = [
    'CD34', 'VIM', 'COL1A1', 'COL3A1', 'FN1', 'ACTA2', 'PDGFRA', 'THY1', 'DCN', 'LUM', 'POSTN',
    'CD3D', 'CD3E', 'CD4', 'CD8A', 'CD8B', 'CD14', 'CD19', 'CD20', 'MS4A1', 'FCGR3A',
    'GNLY', 'NKG7', 'KLRD1', 'NCAM1', 'IL7R', 'CCR7', 'SELL', 'TCF7', 'LEF1'
];

// ========== MODULE NAVIGATION ==========
function showModule(moduleId) {
    console.log(`📄 Switching to module: ${moduleId}`);
    
    try {
        // Hide all modules
        document.querySelectorAll('.module-content').forEach(module => {
            module.classList.remove('active');
        });
        
        // Remove active class from all tabs
        document.querySelectorAll('.module-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Show selected module
        const selectedModule = document.getElementById(moduleId + '-module');
        if (selectedModule) {
            selectedModule.classList.add('active');
            console.log(`✅ Module ${moduleId} activated`);
        }
        
        // Add active class to selected tab
        const selectedTab = document.querySelector(`[data-module="${moduleId}"]`);
        if (selectedTab) {
            selectedTab.classList.add('active');
        }
        
    } catch (error) {
        console.error('❌ Module navigation error:', error);
    }
}

// ========== BUTTON FUNCTIONS ==========
function updateButtonState(state, message) {
    const updateBtn = document.getElementById('update-btn');
    if (!updateBtn) return;
    
    updateBtn.className = '';
    updateBtn.disabled = false;
    
    switch (state) {
        case 'loading':
            updateBtn.classList.add('button-loading');
            updateBtn.disabled = true;
            break;
        case 'success':
            updateBtn.classList.add('button-success');
            break;
        case 'error':
            updateBtn.classList.add('button-error');
            break;
    }
    
    updateBtn.textContent = message || 'Update Visualization';
}

function resetButton() {
    setTimeout(() => {
        updateButtonState('', 'Update Visualization');
    }, 2000);
}

// ========== GENE INPUT FUNCTIONS ==========
function showGeneHint(message, type = 'error') {
    const geneHint = document.getElementById('gene-hint');
    if (!geneHint) return;
    
    geneHint.textContent = message;
    geneHint.classList.add('show');
    
    if (type === 'success') {
        geneHint.style.background = '#e8f5e8';
        geneHint.style.color = '#2e7d32';
        geneHint.style.borderLeft = '3px solid #2e7d32';
    } else {
        geneHint.style.background = '#ffebee';
        geneHint.style.color = '#c62828';
        geneHint.style.borderLeft = '3px solid #c62828';
    }
}

function hideGeneHint() {
    const geneHint = document.getElementById('gene-hint');
    if (geneHint) {
        geneHint.classList.remove('show');
    }
}

function setupGeneInput() {
    const customGeneInput = document.getElementById('custom-gene');
    const geneSuggestions = document.getElementById('gene-suggestions');
    
    if (!customGeneInput || !geneSuggestions) return;
    
    customGeneInput.value = currentMarker;
    customGeneInput.placeholder = "Type gene name from available genes...";
    
    customGeneInput.addEventListener('input', function() {
        const query = this.value.trim().toUpperCase();
        hideGeneHint();
        
        if (query.length < 2) {
            hideSuggestions();
            return;
        }
        
        const allGenes = availableGenes.length > 0 ? 
            [...availableGenes, ...commonGenes] : 
            [...commonGenes];
        const matches = allGenes.filter(gene => 
            gene.toUpperCase().includes(query)
        ).slice(0, 10);
        
        showSuggestions(matches);
    });
    
    customGeneInput.addEventListener('keydown', function(e) {
        const suggestions = geneSuggestions.querySelectorAll('.suggestion-item');
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedSuggestionIndex = Math.min(selectedSuggestionIndex + 1, suggestions.length - 1);
            updateSuggestionSelection(suggestions);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedSuggestionIndex = Math.max(selectedSuggestionIndex - 1, -1);
            updateSuggestionSelection(suggestions);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
                selectGene(suggestions[selectedSuggestionIndex].textContent);
            } else {
                updateVisualization();
            }
        } else if (e.key === 'Escape') {
            hideSuggestions();
        }
    });
    
    customGeneInput.addEventListener('blur', function() {
        setTimeout(() => hideSuggestions(), 200);
    });
    
    console.log('✅ Gene input setup completed');
}

function showSuggestions(matches) {
    const geneSuggestions = document.getElementById('gene-suggestions');
    if (!geneSuggestions || matches.length === 0) {
        hideSuggestions();
        return;
    }
    
    geneSuggestions.innerHTML = '';
    selectedSuggestionIndex = -1;
    
    matches.forEach(gene => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        item.textContent = gene;
        item.addEventListener('click', () => selectGene(gene));
        geneSuggestions.appendChild(item);
    });
    
    geneSuggestions.style.display = 'block';
}

function hideSuggestions() {
    const geneSuggestions = document.getElementById('gene-suggestions');
    if (geneSuggestions) {
        geneSuggestions.style.display = 'none';
    }
    selectedSuggestionIndex = -1;
}

function updateSuggestionSelection(suggestions) {
    suggestions.forEach((item, index) => {
        item.classList.toggle('selected', index === selectedSuggestionIndex);
    });
}

function selectGene(gene) {
    const customGeneInput = document.getElementById('custom-gene');
    
    if (customGeneInput) {
        customGeneInput.value = gene;
    }
    
    hideSuggestions();
    hideGeneHint();
    showGeneHint(`Gene "${gene}" selected - click Update to analyze`, 'success');
    
    setTimeout(hideGeneHint, 3000);
}

function getCurrentMarker() {
    const customGeneInput = document.getElementById('custom-gene');
    
    if (customGeneInput && customGeneInput.value.trim()) {
        const gene = customGeneInput.value.trim();
        
        if (availableGenes.length > 0 && !availableGenes.includes(gene)) {
            showGeneHint(`Gene "${gene}" not in available genes. Try: ${availableGenes.slice(0, 5).join(', ')}...`);
            return null;
        }
        
        return gene;
    }
    
    return currentMarker;
}

// ========== DATA LOADING (STATIC VERSION) ==========
async function loadStaticData() {
    if (isLoading) return;
    isLoading = true;
    
    try {
        console.log('📥 Loading static fibroblast data...');
        updateButtonState('loading', 'Loading data...');
        
        const [umapData, geneExprData, markerData] = await Promise.all([
            loadFile('./data/UMAP_Visualization.json'),
            loadFile('./data/Gene_Expression.json'),
            loadFile('./data/Marker_Expression.json')
        ]);
        
        if (!umapData || !geneExprData || !markerData) {
            throw new Error('Essential data files missing');
        }
        
        fibroblastData.umap = umapData;
        fibroblastData.geneData = geneExprData;
        fibroblastData.markerStats = markerData;
        fibroblastData.summary = markerData.summary;
        
        console.log('✅ All static data loaded successfully');
        
        // Update available genes
        availableGenes = geneExprData.top_variable_genes || [];
        console.log(`📊 Available genes: ${availableGenes.length}`);
        
        // Set default marker if current not available
        if (!availableGenes.includes(currentMarker) && availableGenes.length > 0) {
            currentMarker = availableGenes[0];
            const customGeneInput = document.getElementById('custom-gene');
            if (customGeneInput) {
                customGeneInput.value = currentMarker;
            }
        }
        
        // Create visualizations
        await createAllVisualizations();
        updateButtonState('success', 'Loaded!');
        resetButton();
        
    } catch (error) {
        console.error('❌ Error loading static data:', error);
        updateButtonState('error', 'Load Error');
        showError('Failed to load data files. Please check if data files are available.');
    } finally {
        isLoading = false;
    }
}

async function loadFile(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to load ${url}: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`❌ Error loading ${url}:`, error);
        return null;
    }
}

function showError(message) {
    const containers = ['umap-plot', 'gene-expression-plot', 'marker-plot'];
    containers.forEach(containerId => {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <strong>Error:</strong> ${message}
                </div>
            `;
        }
    });
}

// ========== VISUALIZATION CREATION ==========
async function createAllVisualizations() {
    try {
        console.log(`🎨 Creating visualizations for ${currentMarker}...`);
        
        await Promise.all([
            createUMAPVisualization(),
            createGeneExpressionVisualization(),
            createMarkerVisualization()
        ]);
        
        console.log('✅ All visualizations created successfully');
    } catch (error) {
        console.error('❌ Error creating visualizations:', error);
        showError('Failed to create visualizations.');
    }
}

async function createUMAPVisualization() {
    if (!fibroblastData.umap) return;
    
    const container = document.getElementById('umap-plot');
    if (!container) return;
    
    try {
        const groupingData = {};
        const colorMap = generateColorMap(fibroblastData.umap, currentGrouping);
        
        fibroblastData.umap.forEach(cell => {
            const group = cell[currentGrouping];
            if (!groupingData[group]) {
                groupingData[group] = {
                    x: [],
                    y: [],
                    name: group,
                    mode: 'markers',
                    type: 'scatter',
                    marker: {
                        color: colorMap[group],
                        size: 6,
                        opacity: 0.7
                    },
                    hovertemplate: `
                        <b>%{text}</b><br>
                        UMAP 1: %{x:.2f}<br>
                        UMAP 2: %{y:.2f}<br>
                        ${currentGrouping}: ${group}<br>
                        <extra></extra>
                    `,
                    text: []
                };
            }
            
            groupingData[group].x.push(cell.UMAP_1);
            groupingData[group].y.push(cell.UMAP_2);
            groupingData[group].text.push(cell.cell_id);
        });
        
        const traces = Object.values(groupingData);
        
        const layout = {
            title: {
                text: `UMAP - Groups by ${currentGrouping.replace('_', ' ')}`,
                font: { size: 16, color: '#333' }
            },
            xaxis: { title: 'UMAP 1' },
            yaxis: { title: 'UMAP 2' },
            legend: { 
                orientation: 'v',
                x: 1.02,
                y: 1 
            },
            margin: { t: 60, r: 150, b: 50, l: 50 },
            showlegend: true,
            hovermode: 'closest'
        };
        
        const config = {
            responsive: true,
            displayModeBar: true,
            modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
            displaylogo: false
        };
        
        container.innerHTML = '';
        await Plotly.newPlot(container, traces, layout, config);
        
        setTimeout(() => {
            Plotly.Plots.resize(container);
        }, 100);
        
        console.log('✅ UMAP visualization created');
        
    } catch (error) {
        console.error('❌ Error creating UMAP visualization:', error);
        container.innerHTML = '<div class="error-message">Failed to create UMAP visualization</div>';
    }
}

async function createGeneExpressionVisualization() {
    const container = document.getElementById('gene-expression-plot');
    if (!container) return;
    
    if (!currentMarker || !availableGenes.includes(currentMarker)) {
        container.innerHTML = '<div class="error-message">Please select a valid gene from available genes</div>';
        return;
    }
    if (!fibroblastData.geneData) return;
    
    try {
        const expressionValues = fibroblastData.geneData.expression_data[currentMarker];
        const coordinates = fibroblastData.geneData.coordinates;

        if (!expressionValues || !coordinates) {
            throw new Error(`No expression data found for ${currentMarker}`);
        }

        const trace = {
            x: coordinates.UMAP_1,
            y: coordinates.UMAP_2,
            mode: 'markers',
            type: 'scatter',
            marker: {
                color: expressionValues,
                colorscale: 'Viridis',
                size: 6,
                opacity: 0.8,
                showscale: true,
                colorbar: {
                    title: {
                        text: 'Expression Level',
                        font: { size: 12 }
                    },
                    thickness: 15,
                    len: 0.7,
                    x: 1.02,
                    titleside: 'right',
                    tickfont: { size: 10 }
                }
            },
            text: coordinates.cell_ids,
            hovertemplate: `
                <b>%{text}</b><br>
                UMAP 1: %{x:.2f}<br>
                UMAP 2: %{y:.2f}<br>
                ${currentMarker} Expression: %{marker.color:.3f}<br>
                <extra></extra>
            `
        };
        
        const layout = {
            title: {
                text: `${currentMarker} Expression on UMAP`,
                font: { size: 16, color: '#333' }
            },
            xaxis: { title: 'UMAP 1' },
            yaxis: { title: 'UMAP 2' },
            margin: { t: 60, r: 120, b: 50, l: 50 },
            showlegend: false,
            hovermode: 'closest'
        };
        
        const config = {
            responsive: true,
            displayModeBar: true,
            modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
            displaylogo: false
        };
        
        container.innerHTML = '';
        await Plotly.newPlot(container, [trace], layout, config);
        
        setTimeout(() => {
            Plotly.Plots.resize(container);
        }, 100);
        
        console.log('✅ Gene expression visualization created');
        
    } catch (error) {
        console.error('❌ Error creating gene expression visualization:', error);
        container.innerHTML = '<div class="error-message">Failed to create gene expression visualization</div>';
    }
}

async function createMarkerVisualization() {
    const container = document.getElementById('marker-plot');
    if (!container) return;
    
    if (!currentMarker || !availableGenes.includes(currentMarker)) {
        container.innerHTML = '<div class="error-message">Please select a valid gene from available genes</div>';
        return;
    }
    if (!fibroblastData.markerStats) return;
    
    try {
        const markerData = fibroblastData.markerStats.gene_statistics[currentGrouping]?.[currentMarker];
        
        if (!markerData) {
            container.innerHTML = `<div class="error-message">No statistics found for ${currentMarker} grouped by ${currentGrouping}</div>`;
            return;
        }
        
        const trace = {
            x: markerData.map(item => item.group),
            y: markerData.map(item => item.mean),
            type: 'bar',
            marker: {
                color: markerData.map((item, index) => getGroupColor(index)),
                opacity: 0.8
            },
            text: markerData.map(item => `Count: ${item.count}`),
            textposition: 'auto',
            hovertemplate: `
                <b>%{x}</b><br>
                Mean Expression: %{y:.3f}<br>
                Cell Count: %{text}<br>
                <extra></extra>
            `
        };
        
        const layout = {
            title: {
                text: `${currentMarker} Expression by ${currentGrouping.replace('_', ' ')}`,
                font: { size: 16, color: '#333' }
            },
            xaxis: { 
                title: currentGrouping.replace('_', ' '),
                tickangle: -45
            },
            yaxis: { 
                title: 'Mean Expression Level'
            },
            margin: { t: 60, r: 50, b: 120, l: 70 },
            showlegend: false
        };
        
        const config = {
            responsive: true,
            displayModeBar: true,
            modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
            displaylogo: false
        };
        
        container.innerHTML = '';
        await Plotly.newPlot(container, [trace], layout, config);
        
        setTimeout(() => {
            Plotly.Plots.resize(container);
        }, 100);
        
        console.log('✅ Marker visualization created');
        
    } catch (error) {
        console.error('❌ Error creating marker visualization:', error);
        container.innerHTML = '<div class="error-message">Failed to create marker visualization</div>';
    }
}

// ========== MAIN UPDATE FUNCTION ==========
async function updateVisualization() {
    const groupedBySelect = document.getElementById('grouped-by-select');
    const newMarker = getCurrentMarker();
    const newGrouping = groupedBySelect.value;
    
    console.log(`🎯 Update requested - Marker: ${newMarker}, Grouping: ${newGrouping}`);
    
    if (!newMarker) {
        return;
    }
    
    try {
        updateButtonState('loading', 'Updating...');
        
        currentMarker = newMarker;
        currentGrouping = newGrouping;
        
        await createAllVisualizations();
        updateButtonState('success', 'Updated!');
        resetButton();
        
    } catch (error) {
        console.error('❌ Error in update:', error);
        updateButtonState('error', 'Error - Retry');
        showGeneHint(error.message);
    }
}

// ========== DEG ANALYSIS (STATIC CSV LOADING) ==========
async function loadDEGData() {
    const degSubtype = document.getElementById('deg-subtype');
    const degComparison = document.getElementById('deg-comparison');
    const degTopN = document.getElementById('deg-top-n');
    const degGeneFilter = document.getElementById('deg-gene-filter');
    const loadDegBtn = document.getElementById('load-deg-btn');
    const degContainer = document.getElementById('deg-table-container');
    
    if (!degSubtype || !degComparison || !degContainer) return;
    
    const subtype = degSubtype.value;
    const comparison = degComparison.value;
    const topN = parseInt(degTopN.value) || 5;
    const geneFilter = degGeneFilter.value.trim().toUpperCase();
    
    console.log('🧬 Loading DEG data for:', { subtype, comparison, topN, geneFilter });
    
    if (loadDegBtn) {
        loadDegBtn.textContent = 'Loading...';
        loadDegBtn.disabled = true;
    }
    
    degContainer.innerHTML = `
        <div class="viz-placeholder">
            <div class="loading-spinner"></div>
            <p>🔄 Loading DEG data...</p>
            <small>Processing ${subtype} ${comparison} comparison</small>
        </div>
    `;
    
    try {
        const fileName = `DEGs_${subtype}_${comparison}.csv`;
        const filePath = `./data/csvs/${fileName}`;
        
        console.log('🔍 Loading file:', filePath);
        
        const degData = await loadDEGCSV(filePath);
        
        if (degData && degData.length > 0) {
            let filteredData = degData;
            if (geneFilter) {
                filteredData = degData.filter(gene => 
                    gene.gene.toUpperCase().includes(geneFilter)
                );
                
                if (filteredData.length === 0) {
                    throw new Error(`No genes found matching "${geneFilter}"`);
                }
            }
            
            const topResults = filteredData.slice(0, topN);
            displayDEGTable(topResults, subtype, comparison, geneFilter, topN, degData.length);
            
        } else {
            throw new Error('No significant DEGs found (p_val_adj < 0.05)');
        }
        
    } catch (error) {
        console.error('❌ Error loading DEG data:', error);
        degContainer.innerHTML = `
            <div class="error-message">
                <strong>Error:</strong> Failed to load DEG data
                <br><strong>File:</strong> DEGs_${subtype}_${comparison}.csv
                <br><small>${error.message}</small>
                <br><br>
                <button onclick="loadDEGData()" style="margin-top: 10px;">🔄 Retry</button>
            </div>
        `;
    } finally {
        if (loadDegBtn) {
            loadDegBtn.textContent = 'Load DEGs';
            loadDegBtn.disabled = false;
        }
    }
}

async function loadDEGCSV(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const csvText = await response.text();
        
        return new Promise((resolve, reject) => {
            Papa.parse(csvText, {
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true,
                complete: function(results) {
                    if (results.errors.length > 0) {
                        console.warn('CSV parsing warnings:', results.errors);
                    }
                    
                    const significantDEGs = results.data
                        .filter(row => {
                            const pValAdj = parseFloat(row.p_val_adj);
                            const avgLog2FC = parseFloat(row.avg_log2FC);
                            return !isNaN(pValAdj) && !isNaN(avgLog2FC) && pValAdj < 0.05;
                        })
                        .map(row => ({
                            gene: row.gene || '',
                            geneid: row.geneid || '',
                            avg_log2FC: parseFloat(row.avg_log2FC) || 0,
                            p_val: parseFloat(row.p_val) || 1,
                            p_val_adj: parseFloat(row.p_val_adj) || 1,
                            pct_1: parseFloat(row['pct.1']) || 0,
                            pct_2: parseFloat(row['pct.2']) || 0
                        }))
                        .sort((a, b) => a.p_val_adj - b.p_val_adj);
                    
                    console.log(`📈 Found ${significantDEGs.length} significant DEGs`);
                    resolve(significantDEGs);
                },
                error: function(error) {
                    reject(new Error(`CSV parsing failed: ${error.message}`));
                }
            });
        });
        
    } catch (error) {
        console.error('❌ Error loading CSV file:', error);
        throw error;
    }
}

function displayDEGTable(degData, subtype, comparison, geneFilter, topN, totalDEGs) {
    const degContainer = document.getElementById('deg-table-container');
    if (!degContainer) return;
    
    const comparisonLabels = {
        weight: 'Obesity vs Non-obese',
        OA: 'OA vs Non-OA',
        obeseOA: 'Obese-OA vs Healthy'
    };
    
    const subtypeLabels = {
        'SLSFs_CD34pos': 'SLSFs CD34+',
        'SLSFs_CD34neg': 'SLSFs CD34-',
        'LLSFs': 'LLSFs',
        'SLSFs_IM': 'SLSFs IM'
    };
    
    const upregulated = degData.filter(gene => gene.avg_log2FC > 0).length;
    const downregulated = degData.filter(gene => gene.avg_log2FC < 0).length;
    
    const filterText = geneFilter ? ` | <strong>Filtered by:</strong> "${geneFilter}"` : '';
    const totalText = totalDEGs ? ` | <strong>Total available:</strong> ${totalDEGs}` : '';
    
    const tableHTML = `
        <div class="deg-summary">
            <h4>📊 DEG Analysis Summary</h4>
            <p><strong>Cell Type:</strong> ${subtypeLabels[subtype]} | 
               <strong>Comparison:</strong> ${comparisonLabels[comparison]} | 
               <strong>Showing:</strong> Top ${topN}${filterText}${totalText}<br>
               <strong>Upregulated:</strong> ${upregulated} | 
               <strong>Downregulated:</strong> ${downregulated}</p>
        </div>
        
        <table class="deg-table">
            <thead>
                <tr>
                    <th>Gene</th>
                    <th>Gene ID</th>
                    <th>Log2FC</th>
                    <th>P-value</th>
                    <th>Adj. P-value</th>
                    <th>Pct.1</th>
                    <th>Pct.2</th>
                </tr>
            </thead>
            <tbody>
                ${degData.map(gene => `
                    <tr>
                        <td class="gene-name">${gene.gene}</td>
                        <td class="p-value">${gene.geneid}</td>
                        <td class="${gene.avg_log2FC > 0 ? 'log2fc-positive' : 'log2fc-negative'}">
                            ${gene.avg_log2FC > 0 ? '+' : ''}${gene.avg_log2FC.toFixed(3)}
                        </td>
                        <td class="p-value">${gene.p_val.toExponential(2)}</td>
                        <td class="p-value">${gene.p_val_adj.toExponential(2)}</td>
                        <td>${(gene.pct_1 * 100).toFixed(1)}%</td>
                        <td>${(gene.pct_2 * 100).toFixed(1)}%</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    degContainer.innerHTML = tableHTML;
    console.log('✅ DEG table displayed successfully');
}

// ========== PATHWAY ANALYSIS (STATIC CSV LOADING) ==========
async function loadPathwayData() {
    const pathwaySubtype = document.getElementById('pathway-subtype');
    const pathwayComparison = document.getElementById('pathway-comparison');
    const pathwayTopN = document.getElementById('pathway-top-n');
    const pathwayFilter = document.getElementById('pathway-filter');
    const loadPathwayBtn = document.getElementById('load-pathway-btn');
    const pathwayContainer = document.getElementById('pathway-plot');
    const pathwayTableContainer = document.getElementById('pathway-table-container');
    
    if (!pathwaySubtype || !pathwayComparison || !pathwayContainer) return;
    
    const subtype = pathwaySubtype.value;
    const comparison = pathwayComparison.value;
    const topN = parseInt(pathwayTopN.value) || 5;
    const pathwayFilterText = pathwayFilter ? pathwayFilter.value.trim().toUpperCase() : '';
    
    console.log('🛤️ Loading pathway data for:', { subtype, comparison, topN, pathwayFilterText });
    
    if (loadPathwayBtn) {
        loadPathwayBtn.textContent = 'Loading...';
        loadPathwayBtn.disabled = true;
    }
    
    const loadingHTML = `
        <div class="viz-placeholder">
            <div class="loading-spinner"></div>
            <p>🔄 Loading pathway data...</p>
            <small>Processing ${subtype} ${comparison} pathways</small>
        </div>
    `;
    
    pathwayContainer.innerHTML = loadingHTML;
    if (pathwayTableContainer) {
        pathwayTableContainer.innerHTML = loadingHTML;
    }
    
    try {
        const fileName = `paths_sig_${subtype}-${comparison}.csv`;
        const filePath = `./data/csvs/${fileName}`;
        
        console.log('🔍 Loading pathway file:', filePath);
        
        const pathwayData = await loadPathwayCSV(filePath);
        
        if (pathwayData && pathwayData.length > 0) {
            let filteredData = pathwayData;
            
            if (pathwayFilterText) {
                filteredData = pathwayData.filter(pathway => 
                    pathway.pathway.toUpperCase().includes(pathwayFilterText) ||
                    pathway.type.toUpperCase().includes(pathwayFilterText)
                );
                
                if (filteredData.length === 0) {
                    throw new Error(`No pathways found matching "${pathwayFilterText}"`);
                }
            }
            
            const topResults = filteredData.slice(0, topN);
            
            displayPathwayTable(topResults, subtype, comparison, pathwayFilterText, topN, pathwayData.length);
            await createPathwayVisualization(topResults, subtype, comparison);
            
        } else {
            throw new Error('No significant pathways found (padj < 0.05)');
        }
        
    } catch (error) {
        console.error('❌ Error loading pathway data:', error);
        const errorHTML = `
            <div class="error-message">
                <strong>Error:</strong> Failed to load pathway data
                <br><strong>File:</strong> paths_sig_${subtype}-${comparison}.csv
                <br><small>${error.message}</small>
                <br><br>
                <button onclick="loadPathwayData()" style="margin-top: 10px;">🔄 Retry</button>
            </div>
        `;
        pathwayContainer.innerHTML = errorHTML;
        if (pathwayTableContainer) {
            pathwayTableContainer.innerHTML = errorHTML;
        }
    } finally {
        if (loadPathwayBtn) {
            loadPathwayBtn.textContent = 'Load Pathways';
            loadPathwayBtn.disabled = false;
        }
    }
}

async function loadPathwayCSV(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const csvText = await response.text();
        
        return new Promise((resolve, reject) => {
            Papa.parse(csvText, {
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true,
                complete: function(results) {
                    if (results.errors.length > 0) {
                        console.warn('CSV parsing warnings:', results.errors);
                    }
                    
                    const significantPathways = results.data
                        .filter(row => {
                            const padj = parseFloat(row.padj);
                            const nes = parseFloat(row.NES);
                            return !isNaN(padj) && !isNaN(nes) && padj < 0.05;
                        })
                        .map(row => ({
                            type: row.type || '',
                            pathway: row.pathway || '',
                            pval: parseFloat(row.pval) || 1,
                            padj: parseFloat(row.padj) || 1,
                            ES: parseFloat(row.ES) || 0,
                            NES: parseFloat(row.NES) || 0,
                            nMoreExtreme: parseInt(row.nMoreExtreme) || 0,
                            size: parseInt(row.size) || 0,
                            leadingEdge: row.leadingEdge || ''
                        }))
                        .sort((a, b) => a.padj - b.padj);
                    
                    console.log(`📈 Found ${significantPathways.length} significant pathways`);
                    resolve(significantPathways);
                },
                error: function(error) {
                    reject(new Error(`CSV parsing failed: ${error.message}`));
                }
            });
        });
        
    } catch (error) {
        console.error('❌ Error loading pathway CSV file:', error);
        throw error;
    }
}

function displayPathwayTable(pathwayData, subtype, comparison, pathwayFilterText, topN, totalPathways) {
    const pathwayTableContainer = document.getElementById('pathway-table-container');
    if (!pathwayTableContainer) return;
    
    const comparisonLabels = {
        weight: 'Obesity vs Non-obese',
        OA: 'OA vs Non-OA',
        obeseOA: 'Obese-OA vs Healthy'
    };
    
    const subtypeLabels = {
        'SLSFs_CD34pos': 'SLSFs CD34+',
        'SLSFs_CD34neg': 'SLSFs CD34-',
        'LLSFs': 'LLSFs',
        'SLSFs_IM': 'SLSFs IM'
    };
    
    const upregulated = pathwayData.filter(p => p.NES > 0).length;
    const downregulated = pathwayData.filter(p => p.NES < 0).length;
    
    const filterText = pathwayFilterText ? ` | <strong>Filtered by:</strong> "${pathwayFilterText}"` : '';
    const totalText = totalPathways ? ` | <strong>Total available:</strong> ${totalPathways}` : '';
    
    const tableHTML = `
        <div class="deg-summary">
            <h4>🛤️ Pathway Analysis Summary</h4>
            <p><strong>Cell Type:</strong> ${subtypeLabels[subtype]} | 
               <strong>Comparison:</strong> ${comparisonLabels[comparison]} | 
               <strong>Showing:</strong> Top ${topN}${filterText}${totalText}<br>
               <strong>Upregulated:</strong> ${upregulated} | 
               <strong>Downregulated:</strong> ${downregulated}</p>
        </div>
        
        <table class="deg-table">
            <thead>
                <tr>
                    <th>Pathway</th>
                    <th>Type</th>
                    <th>NES</th>
                    <th>P-value</th>
                    <th>Adj. P-value</th>
                    <th>Size</th>
                </tr>
            </thead>
            <tbody>
                ${pathwayData.map(pathway => `
                    <tr>
                        <td class="pathway-name">${pathway.pathway.replace(/_/g, ' ')}</td>
                        <td class="p-value">${pathway.type}</td>
                        <td class="${pathway.NES > 0 ? 'nes-positive' : 'nes-negative'}">
                            ${pathway.NES > 0 ? '+' : ''}${pathway.NES.toFixed(3)}
                        </td>
                        <td class="p-value">${pathway.pval.toExponential(2)}</td>
                        <td class="p-value">${pathway.padj.toExponential(2)}</td>
                        <td>${pathway.size}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    pathwayTableContainer.innerHTML = tableHTML;
    console.log('✅ Pathway table displayed successfully');
}

async function createPathwayVisualization(pathwayData, subtype, comparison) {
    const container = document.getElementById('pathway-plot');
    if (!container || !pathwayData) return;
    
    try {
        const trace = {
            y: pathwayData.map(p => p.pathway.replace(/_/g, ' ').substring(0, 40) + (p.pathway.length > 40 ? '...' : '')),
            x: pathwayData.map(p => p.NES),
            type: 'bar',
            orientation: 'h',
            marker: {
                color: pathwayData.map(p => p.NES > 0 ? '#e74c3c' : '#3498db'),
                opacity: 0.8,
                line: {
                    color: pathwayData.map(p => p.NES > 0 ? '#c0392b' : '#2980b9'),
                    width: 1
                }
            },
            text: pathwayData.map(p => `padj: ${p.padj.toExponential(2)}`),
            textposition: 'auto',
            hovertemplate: `
                <b>%{y}</b><br>
                NES: %{x:.3f}<br>
                P-value: %{customdata.pval:.2e}<br>
                Adj. P-value: %{customdata.padj:.2e}<br>
                Pathway Size: %{customdata.size}<br>
                <extra></extra>
            `,
            customdata: pathwayData.map(p => ({
                pval: p.pval,
                padj: p.padj,
                size: p.size
            }))
        };
        
        const layout = {
            title: {
                text: `Top Enriched Pathways - ${subtype.replace('_', ' ')} (${comparison})`,
                font: { size: 16, color: '#333' }
            },
            xaxis: { 
                title: 'Normalized Enrichment Score (NES)',
                zeroline: true,
                zerolinecolor: '#666',
                zerolinewidth: 2
            },
            yaxis: { 
                title: 'Pathways',
                automargin: true
            },
            margin: { t: 60, r: 50, b: 80, l: 200 },
            showlegend: false
        };
        
        const config = {
            responsive: true,
            displayModeBar: true,
            modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
            displaylogo: false
        };
        
        container.innerHTML = '';
        await Plotly.newPlot(container, [trace], layout, config);
        
        setTimeout(() => {
            Plotly.Plots.resize(container);
        }, 100);
        
        console.log('✅ Pathway visualization created');
        
    } catch (error) {
        console.error('❌ Error creating pathway visualization:', error);
        container.innerHTML = '<div class="error-message">Failed to create pathway visualization</div>';
    }
}

// ========== INTERACTION ANALYSIS ==========
async function loadInteractionData() {
    const interactionType = document.getElementById('interaction-type').value;
    const interactionTopN = document.getElementById('interaction-top-n');
    const topN = parseInt(interactionTopN ? interactionTopN.value : 20);
    const loadInteractionBtn = document.getElementById('load-interaction-btn');
    const interactionContainer = document.getElementById('interaction-plot');
    const tableContainer = document.getElementById('interaction-table-container');
    
    console.log('🔗 Loading interaction data for:', { interactionType, topN });
    
    if (loadInteractionBtn) {
        loadInteractionBtn.textContent = 'Loading...';
        loadInteractionBtn.disabled = true;
    }
    
    const loadingHTML = `
        <div class="viz-placeholder">
            <div class="loading-spinner"></div>
            <p>🔄 Loading interaction data...</p>
            <small>Processing ${interactionType} signaling interactions</small>
        </div>
    `;
    
    interactionContainer.innerHTML = loadingHTML;
    if (tableContainer) {
        tableContainer.innerHTML = loadingHTML;
    }
    
    try {
        const response = await fetch('./data/Cell_Interaction.json');
        if (!response.ok) throw new Error('Interaction data not found');
        
        const interactionData = await response.json();
        
        const rawData = interactionData[interactionType + '_signaling'];
        if (!rawData || rawData.length === 0) {
            throw new Error(`No ${interactionType} signaling data found`);
        }
        
        // Process and filter data - only keep interactions with valid prob values
        const processedData = rawData
            .filter(item => item.prob !== undefined && item.prob > 0) // Only with valid probability
            .sort((a, b) => b.prob - a.prob) // Sort by probability descending
            .slice(0, topN); // Take top N
        
        if (processedData.length === 0) {
            throw new Error('No valid interactions found with probability values');
        }
        
        // Display table and plot
        displayInteractionTable(processedData, interactionType, topN, rawData.length);
        await createInteractionPlot(processedData, interactionType);
        
        console.log('✅ Interaction analysis completed');
        
    } catch (error) {
        console.error('❌ Error loading interaction data:', error);
        const errorHTML = `
            <div class="error-message">
                <strong>Error:</strong> Failed to load interaction data
                <br><small>${error.message}</small>
                <br><br>
                <button onclick="loadInteractionData()" style="margin-top: 10px;">🔄 Retry</button>
            </div>
        `;
        interactionContainer.innerHTML = errorHTML;
        if (tableContainer) {
            tableContainer.innerHTML = errorHTML;
        }
    } finally {
        if (loadInteractionBtn) {
            loadInteractionBtn.textContent = 'Load Interaction';
            loadInteractionBtn.disabled = false;
        }
    }
}

function displayInteractionTable(interactionData, interactionType, topN, totalInteractions) {
    const tableContainer = document.getElementById('interaction-table-container');
    if (!tableContainer) return;
    
    // Convert pval numbers to labels
    const getPvalLabel = (pval) => {
        if (pval === 3) return 'p < 0.01';
        if (pval === 2) return '0.01 < p < 0.05';
        return 'p > 0.05';
    };
    
    const tableHTML = `
        <div class="deg-summary">
            <h4>🔗 Cell-Cell Interaction Summary</h4>
            <p><strong>Analysis Type:</strong> ${interactionType.charAt(0).toUpperCase() + interactionType.slice(1)} Signaling | 
               <strong>Showing:</strong> Top ${topN} interactions | 
               <strong>Total Available:</strong> ${totalInteractions}</p>
        </div>
        
        <table class="deg-table">
            <thead>
                <tr>
                    <th>Source</th>
                    <th>Target</th>
                    <th>Ligand</th>
                    <th>Receptor</th>
                    <th>Pathway</th>
                    <th>Probability</th>
                    <th>Significance</th>
                    <th>Dataset</th>
                </tr>
            </thead>
            <tbody>
                ${interactionData.map(interaction => `
                    <tr>
                        <td class="gene-name">${interaction.source}</td>
                        <td class="gene-name">${interaction.target}</td>
                        <td>${interaction.ligand || 'N/A'}</td>
                        <td>${interaction.receptor || 'N/A'}</td>
                        <td>${interaction.pathway_name || 'N/A'}</td>
                        <td class="log2fc-positive">${interaction.prob.toFixed(3)}</td>
                        <td class="${interaction.pval === 3 ? 'log2fc-positive' : interaction.pval === 2 ? 'log2fc-negative' : 'p-value'}">${getPvalLabel(interaction.pval)}</td>
                        <td>${interaction.dataset || 'N/A'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    tableContainer.innerHTML = tableHTML;
    console.log('✅ Interaction table displayed');
}

async function createInteractionPlot(interactionData, interactionType) {
    const container = document.getElementById('interaction-plot');
    if (!container || !interactionData) return;
    
    try {
        // Create mapping for cell types
        const cellTypeMapping = {
            'SLSFs_CD34pos': 'S',
            'LLSFs': 'R2', 
            'SLSFs_CD34neg': 'R3'
        };
        
        // Create simplified cell pair names
        const plotData = interactionData.map(item => {
            const sourceShort = cellTypeMapping[item.source] || item.source;
            const targetShort = cellTypeMapping[item.target] || item.target;
            return {
                x: `${sourceShort}→${targetShort}\n(${item.dataset})`,
                y: `${item.ligand}-${item.receptor}`,
                prob: item.prob,
                pval: item.pval,
                ligand: item.ligand,
                receptor: item.receptor,
                pathway: item.pathway_name,
                dataset: item.dataset,
                annotation: item.annotation,
                source: item.source,
                target: item.target,
                sourceShort: sourceShort,
                targetShort: targetShort
            };
        });
        
        const trace = {
            x: plotData.map(d => d.x),
            y: plotData.map(d => d.y),
            mode: 'markers',
            type: 'scatter',
            marker: {
                size: plotData.map(d => {
                    if (d.pval === 3) return 25;
                    if (d.pval === 2) return 20;
                    return 15;
                }),
                color: plotData.map(d => d.prob),
                colorscale: 'Viridis',
                showscale: true,
                colorbar: {
                    title: {
                        text: 'Communication<br>Probability',
                        font: { size: 12 }
                    },
                    titleside: 'right',
                    thickness: 15,
                    len: 0.7
                },
                sizemode: 'diameter',
                sizeref: 0.5,
                opacity: 0.8,
                line: {
                    color: 'white',
                    width: 2
                }
            },
            text: plotData.map(d => 
                `Source: ${d.source} (${d.sourceShort})<br>` +
                `Target: ${d.target} (${d.targetShort})<br>` +
                `Dataset: ${d.dataset}<br>` +
                `Ligand-Receptor: ${d.y}<br>` +
                `Pathway: ${d.pathway}<br>` +
                `Probability: ${d.prob.toFixed(3)}<br>` +
                `Significance: ${d.pval === 3 ? 'p < 0.01' : d.pval === 2 ? '0.01 < p < 0.05' : 'p > 0.05'}<br>` +
                `Type: ${d.annotation}`
            ),
            hovertemplate: '%{text}<extra></extra>',
            name: 'Interactions'
        };
        
        const layout = {
            title: {
                text: `${interactionType.charAt(0).toUpperCase() + interactionType.slice(1)} Cell-Cell Communications`,
                font: { size: 16, color: '#333' }
            },
            xaxis: { 
                title: 'Cell-Cell Pairs by Dataset',
                tickangle: 0,
                automargin: true,
                tickfont: { size: 10 },
                dtick: 1
            },
            yaxis: { 
                title: 'Ligand - Receptor Pairs',
                automargin: true,
                tickfont: { size: 9 },
                dtick: 1,
                tickmode: 'linear'
            },
            width: 1200,
            height: 1200,
            margin: { t: 80, r: 150, b: 200, l: 300 },
            showlegend: false,
            hovermode: 'closest',
            annotations: [
                // Cell type legend
                {
                    text: '<b>Cell Types:</b> S = SLSFs_CD34pos | R2 = LLSFs | R3 = SLSFs_CD34neg',
                    x: 0.5,
                    y: -0.15,
                    xanchor: 'center',
                    yanchor: 'top',
                    xref: 'paper',
                    yref: 'paper',
                    font: { size: 11, color: '#333' },
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                    bordercolor: '#ccc',
                    borderwidth: 1
                },
                // Plot legend
                {
                    text: '<b>Legend:</b> Size = p-value significance | Color = Communication probability',
                    x: 0.5,
                    y: -0.2,
                    xanchor: 'center',
                    yanchor: 'top',
                    xref: 'paper',
                    yref: 'paper',
                    font: { size: 10, color: '#666' },
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                    bordercolor: '#ccc',
                    borderwidth: 1
                }
            ]
        };
        
        const config = {
            responsive: true,
            displayModeBar: true,
            modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
            displaylogo: false
        };
        
        container.innerHTML = '';
        
        // Set container height explicitly
        container.style.height = '1200px';
        container.style.width = '100%';
        
        await Plotly.newPlot(container, [trace], layout, config);
        
        setTimeout(() => {
            Plotly.Plots.resize(container);
        }, 100);
        
        console.log('✅ Interaction bubble plot created with improved spacing');
        
    } catch (error) {
        console.error('❌ Error creating interaction plot:', error);
        container.innerHTML = '<div class="error-message">Failed to create interaction bubble plot</div>';
    }
}

// ========== TRAJECTORY ANALYSIS FUNCTIONS ==========
async function loadTrajectoryData() {
    const trajectoryDataset = document.getElementById('trajectory-dataset');
    const trajectoryView = document.getElementById('trajectory-view');
    const loadTrajectoryBtn = document.getElementById('load-trajectory-btn');
    
    if (!trajectoryDataset || !trajectoryView) return;
    
    const dataset = trajectoryDataset.value;
    const view = trajectoryView.value;
    
    console.log('🔄 Loading trajectory data for:', { dataset, view });
    
    if (loadTrajectoryBtn) {
        loadTrajectoryBtn.textContent = 'Loading...';
        loadTrajectoryBtn.disabled = true;
    }
    
    // Show loading state in all containers
    const containers = ['trajectory-plot', 'trajectory-density-plot', 'trajectory-proportion-plot', 'pseudotime-analysis-plot'];
    containers.forEach(containerId => {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div class="viz-placeholder">
                    <div class="loading-spinner"></div>
                    <p>🔄 Loading ${containerId.replace('-', ' ')}...</p>
                </div>
            `;
        }
    });
    
    try {
        // FIXED: Use correct relative path
        const response = await fetch('./data/Trajectory_Data.json');
        if (!response.ok) {
            throw new Error(`Failed to load trajectory data: ${response.status} ${response.statusText}`);
        }
        
        const allTrajectoryData = await response.json();
        
        // Debug logging
        console.log('Trajectory data loaded:', allTrajectoryData);
        console.log('Available datasets:', Object.keys(allTrajectoryData));
        
        // Check if the selected dataset exists
        if (!allTrajectoryData[dataset]) {
            const availableDatasets = Object.keys(allTrajectoryData);
            throw new Error(`Dataset "${dataset}" not found. Available: ${availableDatasets.join(', ')}`);
        }
        
        const trajectoryData = allTrajectoryData[dataset];
        console.log('Selected dataset data:', trajectoryData);
        
        // Validate data structure
        if (!trajectoryData.coordinates || !trajectoryData.metadata) {
            throw new Error('Invalid trajectory data structure - missing coordinates or metadata');
        }
        
        console.log('✅ Trajectory data loaded, creating visualizations...');
        
        // Create all visualizations
        await Promise.all([
            createTrajectoryPlot(trajectoryData, view, dataset),
            createDensityPlot(trajectoryData, dataset),
            createProportionPlot(trajectoryData, dataset),
            createPseudotimeAnalysisPlot(trajectoryData, dataset)
        ]);
        
        console.log('✅ All trajectory visualizations created');
        
    } catch (error) {
        console.error('❌ Error loading trajectory data:', error);
        showTrajectoryError(`Failed to load trajectory data: ${error.message}`);
    } finally {
        if (loadTrajectoryBtn) {
            loadTrajectoryBtn.textContent = 'Load Trajectory';
            loadTrajectoryBtn.disabled = false;
        }
    }
}

async function createTrajectoryPlot(trajectoryData, view, dataset) {
    const container = document.getElementById('trajectory-plot');
    if (!container || !trajectoryData) return;
    
    try {
        const coordinates = trajectoryData.coordinates;
        const metadata = trajectoryData.metadata;
        
        // Validate required data
        if (!coordinates.Component_1 || !coordinates.Component_2) {
            throw new Error('Missing coordinate data (Component_1, Component_2)');
        }
        
        let colorBy, colorData, title;
        
        switch(view) {
            case 'state':
                if (!metadata.State) throw new Error('State data not available');
                colorBy = 'State';
                colorData = metadata.State;
                title = `Trajectory by State - ${dataset}`;
                break;
            case 'celltype':
                if (!metadata.harmony_annotation) throw new Error('Cell type data not available');
                colorBy = 'Cell Type';
                colorData = metadata.harmony_annotation;
                title = `Trajectory by Cell Type - ${dataset}`;
                break;
            case 'pseudotime':
                if (!metadata.Pseudotime) throw new Error('Pseudotime data not available');
                colorBy = 'Pseudotime';
                colorData = metadata.Pseudotime;
                title = `Trajectory by Pseudotime - ${dataset}`;
                break;
            default:
                throw new Error(`Unknown view type: ${view}`);
        }
        
        let traces;
        
        if (view !== 'pseudotime') {
            // Create separate traces for each group to show legend
            const uniqueValues = [...new Set(colorData)];
            traces = uniqueValues.map(value => {
                const indices = colorData.map((v, i) => v === value ? i : null).filter(i => i !== null);
                return {
                    x: indices.map(i => coordinates.Component_1[i]),
                    y: indices.map(i => coordinates.Component_2[i]),
                    mode: 'markers',
                    type: 'scatter',
                    name: value,
                    marker: { size: 6, opacity: 0.8 },
                    text: indices.map(i => coordinates.cell_ids ? coordinates.cell_ids[i] : `Cell_${i}`),
                    hovertemplate: `
                        <b>%{text}</b><br>
                        Component 1: %{x:.2f}<br>
                        Component 2: %{y:.2f}<br>
                        ${colorBy}: ${value}<br>
                        <extra></extra>
                    `
                };
            });
        } else {
            // Single trace for pseudotime with colorbar
            traces = [{
                x: coordinates.Component_1,
                y: coordinates.Component_2,
                mode: 'markers',
                type: 'scatter',
                marker: {
                    color: colorData,
                    colorscale: 'Viridis',
                    size: 6,
                    opacity: 0.8,
                    showscale: true,
                    colorbar: {
                        title: 'Pseudotime',
                        titleside: 'right'
                    }
                },
                text: coordinates.cell_ids || coordinates.Component_1.map((_, i) => `Cell_${i}`),
                hovertemplate: `
                    <b>%{text}</b><br>
                    Component 1: %{x:.2f}<br>
                    Component 2: %{y:.2f}<br>
                    ${colorBy}: %{marker.color:.3f}<br>
                    <extra></extra>
                `
            }];
        }
        
        const layout = {
            title: { text: title, font: { size: 16, color: '#333' } },
            xaxis: { title: 'Component 1' },
            yaxis: { title: 'Component 2' },
            margin: { t: 60, r: view === 'pseudotime' ? 120 : 150, b: 50, l: 50 },
            showlegend: view !== 'pseudotime',
            legend: { 
                orientation: 'v',
                x: 1.02,
                y: 1 
            },
            hovermode: 'closest'
        };
        
        const config = {
            responsive: true,
            displayModeBar: true,
            modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
            displaylogo: false
        };
        
        container.innerHTML = '';
        await Plotly.newPlot(container, traces, layout, config);
        
        setTimeout(() => {
            Plotly.Plots.resize(container);
        }, 100);
        
        console.log('✅ Trajectory plot created');
        
    } catch (error) {
        console.error('❌ Error creating trajectory plot:', error);
        container.innerHTML = `<div class="error-message">Failed to create trajectory plot: ${error.message}</div>`;
    }
}

async function createDensityPlot(trajectoryData, dataset) {
    const container = document.getElementById('trajectory-density-plot');
    if (!container || !trajectoryData) return;
    
    try {
        const metadata = trajectoryData.metadata;
        
        if (!metadata.harmony_annotation || !metadata.Pseudotime) {
            throw new Error('Missing required data for density plot (harmony_annotation or Pseudotime)');
        }
        
        const cellTypes = [...new Set(metadata.harmony_annotation)];
        
        const traces = cellTypes.map(cellType => {
            const indices = metadata.harmony_annotation.map((ct, i) => ct === cellType ? i : -1).filter(i => i !== -1);
            const pseudotimes = indices.map(i => metadata.Pseudotime[i]).filter(pt => !isNaN(pt));
            
            return {
                x: pseudotimes,
                type: 'histogram',
                name: cellType,
                opacity: 0.7,
                histnorm: 'probability density',
                nbinsx: 20
            };
        });
        
        const layout = {
            title: { text: `Pseudotime Density by Cell Type - ${dataset}`, font: { size: 16, color: '#333' } },
            xaxis: { title: 'Pseudotime' },
            yaxis: { title: 'Density' },
            barmode: 'overlay',
            margin: { t: 60, r: 50, b: 50, l: 50 },
            showlegend: true
        };
        
        const config = {
            responsive: true,
            displayModeBar: true,
            displaylogo: false
        };
        
        container.innerHTML = '';
        await Plotly.newPlot(container, traces, layout, config);
        
        setTimeout(() => {
            Plotly.Plots.resize(container);
        }, 100);
        
        console.log('✅ Density plot created');
        
    } catch (error) {
        console.error('❌ Error creating density plot:', error);
        container.innerHTML = `<div class="error-message">Failed to create density plot: ${error.message}</div>`;
    }
}

async function createProportionPlot(trajectoryData, dataset) {
    const container = document.getElementById('trajectory-proportion-plot');
    if (!container || !trajectoryData) return;
    
    try {
        const metadata = trajectoryData.metadata;
        
        if (!metadata.State || !metadata.harmony_annotation) {
            throw new Error('Missing required data for proportion plot (State or harmony_annotation)');
        }
        
        const states = [...new Set(metadata.State)].sort();
        const cellTypes = [...new Set(metadata.harmony_annotation)];
        
        // Calculate proportions
        const proportions = states.map(state => {
            const stateIndices = metadata.State.map((s, i) => s === state ? i : -1).filter(i => i !== -1);
            const stateCellTypes = stateIndices.map(i => metadata.harmony_annotation[i]);
            
            return cellTypes.map(cellType => {
                const count = stateCellTypes.filter(ct => ct === cellType).length;
                return stateIndices.length > 0 ? (count / stateIndices.length) * 100 : 0;
            });
        });
        
        const traces = cellTypes.map((cellType, ctIndex) => ({
            x: states,
            y: proportions.map(stateProp => stateProp[ctIndex]),
            type: 'scatter',
            mode: 'lines+markers',
            name: cellType,
            line: { width: 3 },
            marker: { size: 8 }
        }));
        
        const layout = {
            title: { text: `Cell Type Proportions Across States - ${dataset}`, font: { size: 16, color: '#333' } },
            xaxis: { title: 'Pseudotime State' },
            yaxis: { title: 'Proportion (%)' },
            margin: { t: 60, r: 50, b: 50, l: 50 },
            showlegend: true
        };
        
        const config = {
            responsive: true,
            displayModeBar: true,
            displaylogo: false
        };
        
        container.innerHTML = '';
        await Plotly.newPlot(container, traces, layout, config);
        
        setTimeout(() => {
            Plotly.Plots.resize(container);
        }, 100);
        
        console.log('✅ Proportion plot created');
        
    } catch (error) {
        console.error('❌ Error creating proportion plot:', error);
        container.innerHTML = `<div class="error-message">Failed to create proportion plot: ${error.message}</div>`;
    }
}

async function createPseudotimeAnalysisPlot(trajectoryData, dataset) {
    const container = document.getElementById('pseudotime-analysis-plot');
    if (!container) return;
    
    try {
        // Get gene from text input
        const pseudotimeGeneInput = document.getElementById('pseudotime-gene');
        const selectedGene = pseudotimeGeneInput ? pseudotimeGeneInput.value.trim() : '';
        
        if (!selectedGene) {
            container.innerHTML = `
                <div class="viz-placeholder">
                    <p>📊 Enter a gene name above and click "Load Trajectory" to see expression over pseudotime</p>
                    <small>Example genes: NOC2L, ISG15, TNFRSF4</small>
                </div>
            `;
            return;
        }
        
        // FIXED: Use correct relative path
        const response = await fetch('./data/Pseudotime_Analysis.json');
        if (!response.ok) {
            container.innerHTML = `
                <div class="error-message">
                    Pseudotime gene expression data not available
                    <br><small>File: ./data/Pseudotime_Analysis.json not found</small>
                </div>
            `;
            return;
        }
        
        const pseudotimeData = await response.json();
        
        if (!pseudotimeData.genes_data || !pseudotimeData.genes_data[selectedGene]) {
            const availableGenes = Object.keys(pseudotimeData.genes_data || {}).slice(0, 20);
            container.innerHTML = `
                <div class="error-message">
                    <strong>Gene "${selectedGene}" not found in pseudotime data</strong><br>
                    <small>Available genes: ${availableGenes.join(', ')}${availableGenes.length === 20 ? '...' : ''}</small>
                </div>
            `;
            return;
        }
        
        const geneData = pseudotimeData.genes_data[selectedGene];
        
        const traces = geneData.cell_types.map((cellType, index) => {
            const data = geneData.data[cellType];
            return {
                x: data.pseudotime,
                y: data.expression,
                mode: 'lines',
                type: 'scatter',
                name: cellType,
                line: {
                    width: 3
                }
            };
        });
        
        const layout = {
            title: { 
                text: `${selectedGene} Expression Over Pseudotime - ${dataset}`, 
                font: { size: 16, color: '#333' } 
            },
            xaxis: { title: 'Pseudotime' },
            yaxis: { title: 'Expression Level' },
            margin: { t: 60, r: 50, b: 50, l: 70 },
            showlegend: true,
            legend: {
                orientation: 'v',
                x: 1.02,
                y: 1
            }
        };
        
        const config = {
            responsive: true,
            displayModeBar: true,
            displaylogo: false
        };
        
        container.innerHTML = '';
        await Plotly.newPlot(container, traces, layout, config);
        
        setTimeout(() => {
            Plotly.Plots.resize(container);
        }, 100);
        
        console.log('✅ Pseudotime analysis plot created for', selectedGene);
        
    } catch (error) {
        console.error('❌ Error creating pseudotime plot:', error);
        container.innerHTML = `<div class="error-message">Error creating pseudotime plot: ${error.message}</div>`;
    }
}

function showTrajectoryError(message) {
    const containers = ['trajectory-plot', 'trajectory-density-plot', 'trajectory-proportion-plot', 'pseudotime-analysis-plot'];
    containers.forEach(containerId => {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <strong>Error:</strong> ${message}
                    <br><br>
                    <button onclick="loadTrajectoryData()" style="margin-top: 10px;">🔄 Retry</button>
                </div>
            `;
        }
    });
}

// FIXED: Update populatePseudotimeGeneDropdown function
async function populatePseudotimeGeneDropdown() {
    const dropdown = document.getElementById('pseudotime-gene');
    if (!dropdown) return;
    
    try {
        // FIXED: Use correct relative path
        const response = await fetch('./data/Pseudotime_Analysis.json');
        if (!response.ok) {
            console.log('Pseudotime data not available for gene dropdown');
            return;
        }
        
        const pseudotimeData = await response.json();
        const availableGenes = Object.keys(pseudotimeData.genes_data || {});
        
        // Set placeholder text with some example genes
        dropdown.placeholder = availableGenes.length > 0 
            ? `Enter gene name (e.g., ${availableGenes.slice(0, 3).join(', ')}...)`
            : 'Enter gene name';
        
        console.log('✅ Pseudotime gene input ready with', availableGenes.length, 'available genes');
        
    } catch (error) {
        console.log('Could not load pseudotime gene data:', error.message);
        dropdown.placeholder = 'Enter gene name (e.g., NOC2L, ISG15, TNFRSF4)';
    }
}


// ========== UTILITY FUNCTIONS ==========
function generateColorMap(data, groupingVar) {
    const groups = [...new Set(data.map(cell => cell[groupingVar]))];
    const colors = [
        '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6',
        '#1abc9c', '#34495e', '#e67e22', '#95a5a6', '#f1c40f'
    ];
    
    const colorMap = {};
    groups.forEach((group, index) => {
        colorMap[group] = colors[index % colors.length];
    });
    
    return colorMap;
}

function getGroupColor(index, alpha = 1) {
    const colors = [
        '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6',
        '#1abc9c', '#34495e', '#e67e22', '#95a5a6', '#f1c40f'
    ];
    const color = colors[index % colors.length];
    
    if (alpha < 1) {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return color;
}

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔬 Fibroblasts GitHub Pages portal DOM ready, initializing...');
    
    try {
        // Setup module navigation
        const moduleTabs = document.querySelectorAll('.module-tab');
        moduleTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const targetModule = this.getAttribute('data-module');
                showModule(targetModule);
            });
        });
        
        // Initialize with basic module
        showModule('basic');
        
        // Setup gene input
        setupGeneInput();
        
        // Setup grouping change listener
        const groupedBySelect = document.getElementById('grouped-by-select');
        if (groupedBySelect) {
            groupedBySelect.addEventListener('change', () => {
                console.log('📊 Grouping selection changed:', groupedBySelect.value);
            });
        }
        
        // Load static data
        loadStaticData();
        populatePseudotimeGeneDropdown(); // Add this line
        
        console.log('✅ Fibroblasts GitHub Pages portal initialized successfully!');
        
    } catch (error) {
        console.error('❌ Initialization error:', error);
    }
});

// ========== GLOBAL EXPORTS ==========
window.updateVisualization = updateVisualization;
window.loadDEGData = loadDEGData;
window.loadPathwayData = loadPathwayData;
window.loadInteractionData = loadInteractionData;
window.loadTrajectoryData = loadTrajectoryData;
window.showModule = showModule;

console.log('🚀 Fibroblasts GitHub Pages portal loaded successfully!');
