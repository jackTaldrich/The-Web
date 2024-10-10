let data;

let actionHistory = [];

let pencilToggle = false;
let selectedNode = null;
let secondNode = null;

let eraserToggle = false;

let textVisible = true;

d3.json("data.json").then(function (loadedData) {
  data = loadedData;
  document.getElementById("flowchart-name").textContent = data.name;
  initChart();
});

document
  .getElementById("flowchart-name")
  .addEventListener("click", function () {
    if (this.textContent === "") {
      this.textContent = "Click to edit title";
    }
  });

const svg = d3.select("svg");
const width = window.innerWidth;
const height = window.innerHeight;

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

const zoom = d3.zoom().on("zoom", (event) => {
  container.attr("transform", event.transform);
});

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

  node = node.data(data.nodes, (d) => d.id);
  node.exit().remove();

  const nodeEnter = node.enter().append("g");

  nodeEnter
    .call(
      d3
        .drag()
        .on("start", dragStarted)
        .on("drag", dragged)
        .on("end", dragEnded)
    )
    .style("cursor", "default")
    .on("click", nodeClicked);

  nodeEnter.each(function (d) {
    let shape;
    if (d.category === "Decision") {
      shape = d3
        .select(this)
        .append("polygon")
        .attr("points", "0,-20 20,0 0,20 -20,0");
    } else if (d.category === "Start") {
      shape = d3
        .select(this)
        .append("rect")
        .attr("width", 40)
        .attr("height", 40)
        .attr("x", -20)
        .attr("y", -20);
    } else if (d.category === "End") {
      shape = d3
        .select(this)
        .append("polygon")
        .attr(
          "points",
          "12.5,-20 22.5,-10 22.5,10 12.5,20 -12.5,20 -22.5,10 -22.5,-10 -12.5,-20"
        );
    } else {
      shape = d3.select(this).append("circle").attr("r", 20);
    }

    shape.attr("fill", getNodeColor(d));

    d3.select(this)
      .append("text")
      .attr("x", 0)
      .attr("y", 5)
      .attr("text-anchor", "middle")
      .text(d.content);
  });

  node = nodeEnter.merge(node);

  node.each(function (d) {
    let shape = d3.select(this).select("polygon, rect, circle");
    shape.attr("fill", getNodeColor(d));

    d3.select(this).select("text").text(d.content);
  });

  node.attr("transform", (d) => `translate(${d.x},${d.y})`);

  simulation.nodes(data.nodes);
  simulation.force("link").links(data.links);
  simulation.alpha(1).restart();
}

function getNodeColor(d) {
  if (d.selected) {
    return "green";
  } else {
    switch (d.category) {
      case "Decision":
        return "orange";
      case "Start":
        return "lightblue";
      case "End":
        return "red";
      default:
        return "lightgrey";
    }
  }
}

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

function squareButton() {
  let numSquares = data.nodes.filter(
    (node) => node.category === "Start"
  ).length;

  const newNode = {
    id: (data.nodes.length + 1).toString(),
    category: "Start",
    content: "New square node",
    x: width / 2,
    y: height / 2,
  };

  if (numSquares != 0) {
    return;
  }
  data.nodes.push(newNode);

  update();
}

function circleButton() {
  const newNode = {
    id: (data.nodes.length + 1).toString(),
    category: "Action",
    content: "New node",
    x: width / 2,
    y: height / 2,
  };

  data.nodes.push(newNode);

  update();
}

function rhombusButton() {
  const newNode = {
    id: (data.nodes.length + 1).toString(),
    category: "Decision",
    content: "New decision node",
    x: width / 2,
    y: height / 2,
  };

  data.nodes.push(newNode);

  update();
}

function hexagonButton() {}

function octagonButton() {
  const newNode = {
    id: (data.nodes.length + 1).toString(),
    category: "End",
    content: "New end node",
    x: width / 2,
    y: height / 2,
  };

  data.nodes.push(newNode);

  update();
}

function pencilButton() {
  const pencilButton = document.getElementsByClassName("pencil-button")[0];
  const eraserButton = document.getElementsByClassName("eraser-button")[0];

  if (eraserToggle) {
    eraserToggle = false;
    eraserButton.style.backgroundColor = "rgb(209, 209, 209)";
  }

  pencilToggle = !pencilToggle;

  pencilButton.style.backgroundColor = pencilToggle
    ? "rgb(87, 86, 86)"
    : "rgb(209, 209, 209)";

  if (!pencilToggle) {
    selectedNode = null;
    secondNode = null;
  }
}

function nodeClicked(event, d) {
  if (eraserToggle) {
    // Remove the node and associated links
    removeNode(d);
  } else if (pencilToggle) {
    // Existing logic for linking nodes when the pencil tool is active
    if (!selectedNode) {
      // First node selection
      selectedNode = d;
      d.selected = true; // Mark the node as selected
      update(); // Update the visualization to reflect the change
    } else if (selectedNode.id !== d.id) {
      // Second node selection
      data.links.push({ source: selectedNode.id, target: d.id }); // Create a link
      selectedNode.selected = false; // Reset the selection state
      selectedNode = null; // Reset for the next interaction
      update(); // Update the visualization
    }
  } else {
    // If neither eraser nor pencil tool is active, do nothing or handle other interactions
    return;
  }
}

function resetNodeColor(nodeData) {
  d3.selectAll("g")
    .filter((n) => n.id === nodeData.id)
    .select("*")
    .attr("fill", "lightgrey");
}

function eraserButton() {
  const pencilButton = document.getElementsByClassName("pencil-button")[0];
  const eraserButton = document.getElementsByClassName("eraser-button")[0];

  // Deactivate the pencil tool if it's active
  if (pencilToggle) {
    pencilToggle = false;
    pencilButton.style.backgroundColor = "rgb(209, 209, 209)";
  }

  // Toggle the eraser tool
  eraserToggle = !eraserToggle;

  // Update the eraser button's background color to reflect its state
  eraserButton.style.backgroundColor = eraserToggle
    ? "rgb(87, 86, 86)" // Active state color
    : "rgb(209, 209, 209)"; // Inactive state color
}

function textButton() {
  textVisible = !textVisible;

  d3.selectAll("g")
    .select("text")
    .style("display", textVisible ? "block" : "none");
}

function xButton() {
  deleteAllNodes();
}

function home() {
  const bounds = container.node().getBBox();

  const translateX = (width - bounds.width) / 2 - bounds.x;
  const translateY = (height - bounds.height) / 2 - bounds.y;

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

function changeTitle() {
  const title = document.getElementById("flowchart-name");
  title.contentEditable = true;
  title.focus();
}

function saveFlowchart() {
  const minimalNodes = data.nodes.map((node) => ({
    id: node.id,
    category: node.category,
    content: node.content,
  }));

  const minimalLinks = data.links.map((link) => ({
    source: link.source.id ? link.source.id : link.source,
    target: link.target.id ? link.target.id : link.target,
  }));

  const minimalData = {
    name: document.getElementById("flowchart-name").textContent,
    nodes: minimalNodes,
    links: minimalLinks,
  };

  const jsonData = JSON.stringify(minimalData, null, 2);

  const blob = new Blob([jsonData], { type: "application/json" });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = minimalData.name + ".json";

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
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

function removeNode(nodeData) {
  // Remove the node from data.nodes
  data.nodes = data.nodes.filter(function (n) {
    return n.id !== nodeData.id;
  });

  // Remove any links connected to the node
  data.links = data.links.filter(function (l) {
    // Handle both cases where source and target are objects or ids
    const sourceId = l.source.id ? l.source.id : l.source;
    const targetId = l.target.id ? l.target.id : l.target;

    return sourceId !== nodeData.id && targetId !== nodeData.id;
  });

  // If the node was selected (in pencil mode), reset the selection
  if (selectedNode && selectedNode.id === nodeData.id) {
    selectedNode = null;
  }

  // Update the graph
  update();
}

function deleteAllNodes() {
  data.nodes = [];
  data.links = [];

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
