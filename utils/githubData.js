const axios = require('axios');
const User = require('../models/User');
const { isToday } = require('./dateHelper');
const { getRepoCreationDate, fetchStarsByDay } = require('./githubApi');

const fetchRepoStars = async (repoUrl) => {
  const repoName = repoUrl.split('github.com/')[1];
  const response = await axios.get(`https://api.github.com/repos/${repoName}`);
  const stars = response.data.stargazers_count;
  return { repoUrl, stars };
};

const fetchAndCacheStars2 = async (userId, repoUrls) => {
  const user = await User.findById(userId);
  for (const repoUrl of repoUrls) {
    const repoName = repoUrl.split('github.com/')[1];
    const repoCreationDate = await getRepoCreationDate(repoName);

    if (!user.githubStarsHistory.some(repo => repo.repoUrl === repoUrl && hasEntryForToday(repo.starHistory))) {
      const starHistory = await fetchStarsByDay(repoName, repoCreationDate);
      await saveStarHistoryToUser(userId, repoUrl, starHistory);
    }
  }
};

const fetchAndCacheStars = async (userId, repoUrls) => {
  const user = await User.findById(userId);
  for (const repoUrl of repoUrls) {
    const repoName = repoUrl.split('github.com/')[1];
    const repoData = user.githubStarsHistory.find(repo => repo.repoUrl === repoUrl);
    const alreadyFetchedToday = repoData && isToday(new Date(repoData.starHistory.slice(-1)[0].recordedDate));

    if (!alreadyFetchedToday) {
      const repoCreationDate = await getRepoCreationDate(repoName);
      // const { stars } = await fetchRepoStars(repoUrl);
      const starHistory = await fetchStarsByDay(repoName, repoCreationDate);
      if (repoData) {
        repoData.starHistory.push(starHistory);
      } else {
        user.githubStarsHistory.push({ repoUrl, starHistory: starHistory });
      }
    }
  }
  await user.save();
};

const fetchLatestStarsCount = async (userId, repoUrls) => {
  const user = await User.findById(userId);

  const starsData = await Promise.all(repoUrls.map(async (repoUrl) => {
    const repoIndex = user.githubStarsHistory.findIndex(repo => repo.repoUrl === repoUrl);
    if (repoIndex !== -1) {
      const starHistory = user.githubStarsHistory[repoIndex].starHistory;
      return {
        repoUrl: repoUrl,
        starHistory
      };
    } else {
      const { stars } = await fetchRepoStars(repoUrl);
      return {
        repoUrl,
        starHistory: [{ stars, recordedDate: new Date() }]
      };
    }
  }));
  return starsData;
};

const saveChartForUser = async (userId, chartName, repo1Url, repo2Url) => {
  const user = await User.findById(userId);
  user.savedCharts.push({ name: chartName, repo1Url, repo2Url });
  await user.save();
};

const getSavedChartsForUser = async (userId) => {
  const user = await User.findById(userId);
  return user.savedCharts;
};

module.exports = {
  fetchAndCacheStars,
  fetchLatestStarsCount,
  fetchRepoStars,
  saveChartForUser,
  getSavedChartsForUser
};
