const renderSavedCharts = (savedCharts) => {
  const savedChartItems = document.getElementById('savedChartItems');
  savedChartItems.innerHTML = ''; // Clear any existing items
  savedCharts.forEach(chart => {
    const button = document.createElement('button');
    button.textContent = chart.name;
    button.classList.add('btn', 'btn-secondary', 'm-1'); // Bootstrap classes for styling
    button.onclick = () => {
      document.getElementById('repo1Url').value = chart.repo1Url;
      document.getElementById('repo2Url').value = chart.repo2Url;
      // Trigger the compareStars click to load the chart
      document.getElementById('compareStars').click();
    };
    savedChartItems.appendChild(button);
  });
};

const loadSavedCharts = () => {
  fetch('/github/savedCharts', {
    credentials: 'same-origin'
  })
  .then(response => response.json())
  .then(data => {
    renderSavedCharts(data);
  })
  .catch(error => {
    console.error('Error:', error);
  });
};

export { loadSavedCharts };
