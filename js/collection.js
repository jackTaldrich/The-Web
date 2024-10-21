function loadSelectedFlowchart(chartPath) {
  const encodedPath = encodeURIComponent(chartPath);
  window.location.href = `maker.html?chart=${encodedPath}`;
}
