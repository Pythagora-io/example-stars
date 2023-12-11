import { loadSavedCharts } from './savedChartsRenderer.js';

document.getElementById('compareStars').addEventListener('click', () => {
  const repo1Url = document.getElementById('repo1Url').value;
  const repo2Url = document.getElementById('repo2Url').value;
  const loaderElem = document.getElementById('loader');

  loaderElem.style.display = 'block'; // Show loader

    console.log('Salje', [repo1Url, repo2Url])
  fetch('/github/stars', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      credentials: 'same-origin',
      body: JSON.stringify({ repoUrls: [repo1Url, repo2Url] })
  })
  .then(response => response.json())
  .then(data => {
      const labelsSet = new Set();
      data.starsData.forEach(repo => {
          repo.starHistory.forEach(entry => {
              labelsSet.add(entry.recordedDate);
          });
      });
      const labels = Array.from(labelsSet).sort((a, b) => new Date(a) - new Date(b));

      const datasets = data.starsData.map((repo, index) => {
          const dataPoints = labels.map(label => {
              const entry = repo.starHistory.find(entry => entry.recordedDate === label);
              return entry ? entry.stars : null;
          });

          return {
              showLine: true,
              label: repo.repoUrl,
              data: dataPoints,
              fill: false,
              borderColor: index === 0 ? 'rgba(255, 99, 132, 1)' : 'rgba(54, 162, 235, 1)',
              tension: 0.1
          };
      });

      if (window.myChart) {
        window.myChart.destroy();
      }

      window.myChart = new Chart(document.getElementById('starsChart').getContext('2d'), {
          type: 'line',
          data: {
              labels: labels,
              datasets: datasets
          },
          options: {
              spanGaps: true,
              scales: {
                  y: {
                      beginAtZero: true
                  },
                  x: {
                      type: 'time',
                      time: {
                          unit: 'day'
                      },
                      title: {
                          display: true,
                          text: 'Date'
                      }
                  }
              },
              interaction: {
                intersect: false,
                mode: 'index'
              },
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'GitHub Stars Over Time'
                },
                zoom: {
                    zoom: {
                        wheel: {
                            enabled: true
                        },
                        pinch: {
                            enabled: true
                        },
                        mode: 'x'
                    },
                    pan: {
                        enabled: true,
                        mode: 'x'
                    }
                }
              }
          }
      });
      loaderElem.style.display = 'none'; // Hide loader
  })
  .catch(error => {
      console.error('Error:', error);
      alert('Failed to compare stars');
      loaderElem.style.display = 'none'; // Hide loader in case of error
  });
});

document.getElementById('saveChart').addEventListener('click', () => {
  const getRepoNameFromUrl = (url) => {
    const repoNameMatch = url.match(/.*github\.com\/([\w-]+\/[\w-]+)(\/.*)?$/);
    return repoNameMatch ? repoNameMatch[1].replace('/', '_vs_') : '';
  };

  const repo1Url = document.getElementById('repo1Url').value;
  const repo2Url = document.getElementById('repo2Url').value;
  const defaultChartName = `${getRepoNameFromUrl(repo1Url)}_vs_${getRepoNameFromUrl(repo2Url)}`;

  const chartName = prompt('Please enter a name for the chart:', defaultChartName);
  if (chartName) {
    fetch('/github/saveChart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'same-origin',
      body: JSON.stringify({ chartName, repo1Url, repo2Url })
    })
    .then(response => response.json())
    .then(data => {
      alert(data.message);
      loadSavedCharts();  // Refresh the saved charts list
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Failed to save chart');
    });
  }
});

window.onload = () => {
  loadSavedCharts();
};

export { loadSavedCharts };
