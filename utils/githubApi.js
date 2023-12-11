const axios = require('axios');

const githubApiBase = 'https://api.github.com';

const getRepoCreationDate = async (repoName) => {
  const response = await axios.get(`${githubApiBase}/repos/${repoName}`, {
    headers: {
      'Authorization': `token ${process.env.GITHUB_TOKEN}`
    }
  });
  return new Date(response.data.created_at);
};

const fetchStarsByDay = async (repoName, sinceDate, perPage = 100) => {
  let page = 1;
  let stars = 0;
  let starHistory = [];
  let retrievedAll = false;
  
  while (!retrievedAll) {
    const response = await axios.get(`${githubApiBase}/repos/${repoName}/stargazers`, {
      params: {
        per_page: perPage,
        page,
        since: sinceDate.toISOString()
      },
      headers: {
        'Accept': 'application/vnd.github.v3.star+json',
        'Authorization': `token ${process.env.GITHUB_TOKEN}`
      }
    });

    console.log(`Fetched ${response.data.length} stargazers for ${repoName} on page ${page}.`);

    response.data.forEach(stargazer => {
      const starDate = new Date(stargazer.starred_at);
      if (starDate > sinceDate) {
        starHistory.push({
          stars: ++stars,
          recordedDate: starDate.toISOString().split('T')[0]
        });
      }
    });

    if (response.data.length < perPage) {
      retrievedAll = true;
    } else {
      page++;
    }
  }

  return starHistory;
};

module.exports = {
  getRepoCreationDate,
  fetchStarsByDay
};
