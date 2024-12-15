// Configuration
const width = 1200;
const height = 1500;
const nodeRadius = 8;

// SVG Setup with zoom support
const svg = d3.select("#graph")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// Add zoom behavior
const g = svg.append("g");
const zoom = d3.zoom()
    .scaleExtent([0.1, 4])
    .on("zoom", (event) => {
        g.attr("transform", event.transform);
    });
svg.call(zoom);

// Tooltip Setup
const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("background", "white")
    .style("padding", "10px")
    .style("border", "1px solid black");

// Filter Setup
const filterContainer = d3.select("#graph")
    .append("div")
    .attr("class", "filter-container")
    .style("margin", "10px");

// Data Processing Function
function processData(data) {
    const nodeMap = new Map();
    const links = [];
    const relationshipTypes = new Set();

    // Enhanced data processing to include more detailed relationships
    data.forEach(row => {
        if (!nodeMap.has(row.country)) {
            nodeMap.set(row.country, {
                id: row.country,
                type: 'country',
                region: row.WHO_Region,
                incidence: +row.New_Incidence || 0,
                hivPositive: +row.New_Relationship_HIV_Positive || 0,
                expanded: false,
                details: {
                    incidence: +row.New_Incidence || 0,
                    hivPositive: +row.New_Relationship_HIV_Positive || 0,
                    region: row.WHO_Region
                },
                subNodes: [] // Will store additional detail nodes when expanded
            });
        }

        if (!nodeMap.has(row.WHO_Region)) {
            nodeMap.set(row.WHO_Region, {
                id: row.WHO_Region,
                type: 'region',
                expanded: false,
                details: {
                    totalCountries: 0,
                    avgIncidence: 0,
                    avgHivPositive: 0
                },
                subNodes: [] // Will store country nodes when expanded
            });
        }

        // Update region statistics
        const region = nodeMap.get(row.WHO_Region);
        region.details.totalCountries++;
        region.details.avgIncidence += +row.New_Incidence || 0;
        region.details.avgHivPositive += +row.New_Relationship_HIV_Positive || 0;

        links.push({
            source: row.country,
            target: row.WHO_Region,
            type: 'regional_connection',
            value: +row.New_Incidence || 0
        });
        relationshipTypes.add('regional_connection');
    });

    // Calculate averages for regions
    nodeMap.forEach(node => {
        if (node.type === 'region') {
            node.details.avgIncidence /= node.details.totalCountries;
            node.details.avgHivPositive /= node.details.totalCountries;
        }
    });

    return {
        nodes: Array.from(nodeMap.values()),
        links: links,
        relationshipTypes: Array.from(relationshipTypes)
    };
}

// Create Visualization Function
function createForceGraph(data) {
    const { nodes, links, relationshipTypes } = processData(data);
    
    // Create filter checkboxes
    relationshipTypes.forEach(type => {
        filterContainer.append("label")
            .style("margin-right", "15px")
            .text(type)
            .append("input")
            .attr("type", "checkbox")
            .attr("checked", true)
            .attr("value", type)
            .on("change", function() {
                updateVisibility();
            });
    });

    const regionColorScale = d3.scaleOrdinal(d3.schemeCategory10);
    const incidenceColorScale = d3.scaleSequential()
        .domain([0, d3.max(data, d => +d.New_Incidence) || 1])
        .interpolator(d3.interpolateBlues);

    const simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(d => d.id)
            .distance(100)
            .strength(0.5))
        .force("charge", d3.forceManyBody()
            .strength(-100)
            .distanceMax(200))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collide", d3.forceCollide().radius(d => 
            d.type === 'country' ? Math.sqrt(d.incidence || 0) + nodeRadius + 2 : nodeRadius * 2 + 2))
        .alphaDecay(0.02)
        .alphaMin(0.001);

    // Draw Links
    const link = g.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(links)
        .enter()
        .append("line")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .attr("stroke-width", 1)
        .attr("data-type", d => d.type);

    // Draw Nodes
    const node = g.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(nodes)
        .enter()
        .append("circle")
        .attr("r", d => getNodeRadius(d))
        .attr("fill", d => getNodeColor(d, regionColorScale, incidenceColorScale))
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    // Add hover interactions
    node.on("mouseover", (event, d) => {
            showTooltip(event, d);
        })
        .on("mouseout", hideTooltip)
        .on("click", (event, d) => {
            d.expanded = !d.expanded;
            expandNode(d);
            updateVisualization();
        });

    function getNodeRadius(d) {
        if (d.expanded) {
            return (d.type === 'country' ? 
                Math.sqrt(d.incidence || 0) + nodeRadius : 
                nodeRadius * 2) * 1.5;
        }
        return d.type === 'country' ? 
            Math.sqrt(d.incidence || 0) + nodeRadius : 
            nodeRadius * 2;
    }

    function getNodeColor(d, regionColorScale, incidenceColorScale) {
        return d.type === 'country' ? 
            incidenceColorScale(d.incidence || 0) : 
            regionColorScale(d.id);
    }

    function showTooltip(event, d) {
        tooltip.transition().duration(200).style("opacity", .9);
        tooltip.html(() => {
            if (d.type === 'country') {
                return `
                    <strong>${d.id}</strong><br>
                    Region: ${d.region}<br>
                    Incidence: ${d.incidence.toFixed(2)}<br>
                    HIV Positive: ${d.hivPositive.toFixed(2)}<br>
                    <em>Click to ${d.expanded ? 'collapse' : 'expand'}</em>
                `;
            }
            return `<strong>Region: ${d.id}</strong><br><em>Click to ${d.expanded ? 'collapse' : 'expand'}</em>`;
        })
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
    }

    function hideTooltip() {
        tooltip.transition().duration(500).style("opacity", 0);
    }

    
function expandNode(d) {
    const expandedRadius = d.type === 'country' ? 
        (Math.sqrt(d.incidence || 0) + nodeRadius) * 2 : 
        nodeRadius * 4;

    if (d.expanded) {
        // Create sub-nodes for expanded state
        if (d.type === 'country') {
            // For countries, create detail nodes around the main node
            const detailCount = 3; // Number of detail nodes
            const radius = expandedRadius * 1.5; // Distance from center
            
            d.subNodes = Object.entries(d.details).map(([key, value], i) => {
                const angle = (i * 2 * Math.PI) / detailCount;
                return {
                    id: `${d.id}_${key}`,
                    parentId: d.id,
                    type: 'detail',
                    x: d.x + radius * Math.cos(angle),
                    y: d.y + radius * Math.sin(angle),
                    value: value,
                    label: key
                };
            });
        } else if (d.type === 'region') {
            // For regions, show connected countries in a circle
            const connectedCountries = links
                .filter(l => l.target.id === d.id)
                .map(l => l.source);
            
            const angleStep = (2 * Math.PI) / connectedCountries.length;
            const radius = expandedRadius * 2;

            d.subNodes = connectedCountries.map((country, i) => ({
                ...country,
                parentId: d.id,
                x: d.x + radius * Math.cos(i * angleStep),
                y: d.y + radius * Math.sin(i * angleStep)
            }));
        }

        // Add sub-nodes to the visualization
        const subNodeElements = node.enter()
            .append("g")
            .attr("class", "sub-node")
            .attr("transform", subNode => 
                `translate(${subNode.x},${subNode.y})`);

        // Add circles for sub-nodes
        subNodeElements.append("circle")
            .attr("r", nodeRadius)
            .attr("fill", (subNode) => {
                if (subNode.type === 'detail') {
                    return "#fff";
                }
                return getNodeColor(subNode, regionColorScale, incidenceColorScale);
            })
            .attr("stroke", "#999")
            .attr("stroke-width", 1);

        // Add labels for sub-nodes
        subNodeElements.append("text")
            .attr("dy", ".35em")
            .attr("text-anchor", "middle")
            .style("font-size", "10px")
            .text(subNode => {
                if (subNode.type === 'detail') {
                    return `${subNode.label}: ${formatValue(subNode.value)}`;
                }
                return subNode.id;
            });

        // Add connecting lines to sub-nodes
        g.append("g")
            .attr("class", "sub-links")
            .selectAll("line")
            .data(d.subNodes)
            .enter()
            .append("line")
            .attr("x1", d.x)
            .attr("y1", d.y)
            .attr("x2", subNode => subNode.x)
            .attr("y2", subNode => subNode.y)
            .attr("stroke", "#999")
            .attr("stroke-opacity", 0.6)
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "3,3");

        // Highlight connected nodes and links
        link.style("stroke-opacity", l => 
            (l.source === d || l.target === d) ? 1 : 0.1);
        node.style("opacity", n => 
            (n === d || d.subNodes.includes(n)) ? 1 : 0.3);
    } else {
        // Remove sub-nodes and their connections when collapsing
        g.selectAll(".sub-node").remove();
        g.selectAll(".sub-links").remove();
        
        // Reset highlighting
        link.style("stroke-opacity", 0.6);
        node.style("opacity", 1);
        
        d.subNodes = [];
    }

    // Update node size
    node.transition()
        .duration(300)
        .attr("r", n => n === d ? expandedRadius : getNodeRadius(n));

    // Update simulation
    simulation
        .force("collide", d3.forceCollide().radius(n => 
            n === d ? expandedRadius + 10 : getNodeRadius(n) + 2))
        .alpha(0.1)
        .restart();
}
function formatValue(value) {
    if (typeof value === 'number') {
        return value.toFixed(1);
    }
    return value;
}
function getNodeColor(d, regionColorScale, incidenceColorScale) {
    if (d.type === 'country') {
        return incidenceColorScale(d.incidence || 0);
    } else if (d.type === 'region') {
        return regionColorScale(d.id);
    }
    return "#ccc"; // Default color for other types
}

// Update the showTooltip function to show more details
function showTooltip(event, d) {
    tooltip.transition().duration(200).style("opacity", .9);
    tooltip.html(() => {
        if (d.type === 'country') {
            return `
                <strong>${d.id}</strong><br>
                Region: ${d.region}<br>
                Incidence: ${d.incidence.toFixed(2)}<br>
                HIV Positive: ${d.hivPositive.toFixed(2)}<br>
                <em>Click to ${d.expanded ? 'collapse' : 'expand'} for more details</em>
            `;
        } else if (d.type === 'region') {
            return `
                <strong>Region: ${d.id}</strong><br>
                Total Countries: ${d.details.totalCountries}<br>
                Avg Incidence: ${d.details.avgIncidence.toFixed(2)}<br>
                Avg HIV Positive: ${d.details.avgHivPositive.toFixed(2)}<br>
                <em>Click to ${d.expanded ? 'collapse' : 'expand'} and see countries</em>
            `;
        }
        return `<strong>${d.label}</strong>: ${formatValue(d.value)}`;
    })
    .style("left", (event.pageX + 10) + "px")
    .style("top", (event.pageY - 28) + "px");
}
    function updateVisibility() {
        const selectedTypes = new Set(
            Array.from(filterContainer.selectAll("input:checked").nodes())
                .map(checkbox => checkbox.value)
        );

        link.style("display", d => 
            selectedTypes.has(d.type) ? "inline" : "none"
        );

        // Update node visibility based on connected links
        const visibleNodes = new Set();
        links.forEach(l => {
            if (selectedTypes.has(l.type)) {
                visibleNodes.add(l.source.id);
                visibleNodes.add(l.target.id);
            }
        });

        node.style("display", d => 
            visibleNodes.has(d.id) ? "inline" : "none"
        );

        simulation.alpha(0.1).restart();
    }

    function updateVisualization() {
        node.attr("r", d => getNodeRadius(d));
        simulation.alpha(0.1).restart();
    }

    simulation
        .nodes(nodes)
        .on("tick", () => {
            nodes.forEach(d => {
                d.x = Math.max(nodeRadius, Math.min(width - nodeRadius, d.x));
                d.y = Math.max(nodeRadius, Math.min(height - nodeRadius, d.y));
            });

            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            node
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);
        });

    simulation.force("link").links(links);

    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.1).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
    }

    setTimeout(() => {
        simulation.stop();
    }, 5000);
}

// Load Data with error handling
d3.csv("data.csv")
    .then(data => {
        if (!data || data.length === 0) {
            throw new Error("No data loaded");
        }
        console.log("Loaded data:", data.length, "rows");
        console.log("First row:", data[0]);
        createForceGraph(data);
    })
    .catch(error => {
        console.error("Error loading the CSV file:", error);
        d3.select("#graph")
            .append("div")
            .attr("class", "error-message")
            .style("color", "red")
            .style("padding", "20px")
            .text("Error loading data: " + error.message);
    });