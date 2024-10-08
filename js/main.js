// Function to programmatically trigger the file input
function triggerFileInput() {
  document.getElementById("fileInput").click(); // Simulate click on the hidden file input
}

// Function to handle the file once selected
document
  .getElementById("fileInput")
  .addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        try {
          data = JSON.parse(e.target.result); // Parse the uploaded JSON file
          initChart(); // Initialize the chart with new data (from flowchart.js)
        } catch (error) {
          alert("Error parsing JSON file: " + error);
        }
      };
      reader.readAsText(file);
    }
  });
