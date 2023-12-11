const express = require('express');
const { fetchAndCacheStars, fetchLatestStarsCount, saveChartForUser, getSavedChartsForUser } = require('../utils/githubData');
const router = express.Router();

router.get('/', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/user/login');
  }
  res.render('github');
});

router.post('/stars', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const { repoUrls } = req.body;
  
  try {
    await fetchAndCacheStars(req.session.userId, repoUrls);

    const starsData = await fetchLatestStarsCount(req.session.userId, repoUrls);
    const transformedData = starsData.map(repoData => {
      if (Array.isArray(repoData.starHistory)) {
        return {
          repoUrl: repoData.repoUrl,
          starHistory: repoData.starHistory.map(entry => ({ stars: entry.stars, recordedDate: entry.recordedDate }))
        };
      } else {
        return {
          repoUrl: repoData.repoUrl,
          starHistory: []
        };
      }
    });
    
    res.json({ starsData: transformedData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while fetching GitHub stars" });
  }
});

router.post('/saveChart', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const { chartName, repo1Url, repo2Url } = req.body;
  
  try {
    await saveChartForUser(req.session.userId, chartName, repo1Url, repo2Url);
    res.json({ message: "Chart saved successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while saving chart" });
  }
});

router.get('/savedCharts', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  try {
    const savedCharts = await getSavedChartsForUser(req.session.userId);
    res.json(savedCharts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while fetching saved charts" });
  }
});

module.exports = router;
