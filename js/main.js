function triggerFileInput() {
  document.getElementById("fileInput").click();
}

document
  .getElementById("fileInput")
  .addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        try {
          data = JSON.parse(e.target.result);
          document.getElementById("flowchart-name").textContent = data.name;
          initChart();
        } catch (error) {
          alert("Error parsing JSON file: " + error);
        }
      };
      reader.readAsText(file);
    }
  });
