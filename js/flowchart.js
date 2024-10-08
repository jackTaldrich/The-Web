let data;

d3.json("data.json").then(function (loadedData) {
  data = loadedData;
  initChart();
});

const svg = d3.select("svg");
const width = window.innerWidth;
const height = window.innerHeight;

// Create a container <g> for the graph (nodes and links) to apply pan/zoom
const container = svg.append("g");

const simulation = d3
  .forceSimulation()
  .force(
    "link",
    d3
      .forceLink()
      .id((d) => d.id)
      .distance(100)
  )
  .force("charge", d3.forceManyBody().strength(-400))
  .force("center", d3.forceCenter(width / 2, height / 2));

let link = container.append("g").selectAll("line");
let node = container.append("g").selectAll("g");

// Initialize zoom behavior
const zoom = d3.zoom().on("zoom", (event) => {
  container.attr("transform", event.transform);
});

// Apply zoom behavior to the SVG
svg.call(zoom);

function initChart() {
  simulation.nodes(data.nodes);
  simulation.force("link").links(data.links);
  update();
}

function update() {
  link = link.data(data.links);
  link.exit().remove();
  link = link.enter().append("line").attr("class", "link").merge(link);

  node = node.data(data.nodes);
  node.exit().remove();

  const nodeEnter = node.enter().append("g");

  nodeEnter.call(
    d3.drag().on("start", dragStarted).on("drag", dragged).on("end", dragEnded)
  );

  nodeEnter.style("cursor", "default");

  nodeEnter.each(function (d) {
    if (d.category === "Decision") {
      d3.select(this)
        .append("polygon")
        .attr("points", "0,-20 20,0 0,20 -20,0")
        .attr("fill", "orange");
    } else if (d.category === "Start") {
      d3.select(this)
        .append("rect")
        .attr("width", 40)
        .attr("height", 40)
        .attr("x", -20)
        .attr("y", -20)
        .attr("fill", "lightblue");
    } else if (d.category === "End") {
      d3.select(this)
        .append("polygon")
        .attr(
          "points",
          "15,-20 25,-10 25,10 15,20 -15,20 -25,10 -25,-10 -15,-20"
        )
        .attr("fill", "red");
    } else {
      d3.select(this).append("circle").attr("r", 20).attr("fill", "lightgrey");
    }
  });

  nodeEnter
    .append("text")
    .attr("x", -10)
    .attr("y", 5)
    .text((d) => d.content);

  node = nodeEnter.merge(node);

  simulation.nodes(data.nodes);
  simulation.force("link").links(data.links);
  simulation.alpha(1).restart();
}

// Drag event functions for nodes
function dragStarted(event, d) {
  if (!event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(event, d) {
  d.fx = event.x;
  d.fy = event.y;
}

function dragEnded(event, d) {
  if (!event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}

// Function to reset the zoom and pan to the initial view (centered and 100% zoom)
function home() {
  const bounds = container.node().getBBox(); // Get the bounding box of the entire graph

  // Calculate the translation to center the graph at scale 1 (reset zoom)
  const translateX = (width - bounds.width) / 2 - bounds.x;
  const translateY = (height - bounds.height) / 2 - bounds.y;

  // Apply the calculated translation and reset the scale to 1 (default zoom level)
  svg
    .transition()
    .duration(750)
    .call(
      zoom.transform,
      d3.zoomIdentity.translate(translateX, translateY).scale(1)
    );
}

function zoomIn() {
  svg.transition().duration(300).call(zoom.scaleBy, 1.3);
}

function zoomOut() {
  svg.transition().duration(300).call(zoom.scaleBy, 0.7);
}

function addNode() {
  const newNodeId = (data.nodes.length + 1).toString();
  data.nodes.push({ id: newNodeId, category: "New", content: "New Node" });

  data.links.push({
    source: data.nodes[data.nodes.length - 2].id,
    target: newNodeId,
  });

  update();
}

simulation.on("tick", () => {
  link
    .attr("x1", (d) => d.source.x)
    .attr("y1", (d) => d.source.y)
    .attr("x2", (d) => d.target.x)
    .attr("y2", (d) => d.target.y);

  node.attr("transform", (d) => `translate(${d.x},${d.y})`);
});
