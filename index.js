const fs = require('fs');
const moment = require('moment');
const simpleGit = require('simple-git');

const FILE_PATH = './data.json';
const git = simpleGit();

const makeCommit = (n) => {
    if (n === 0) return git.push();

    // Use Math.random() to generate random weeks (0–54) and days (0–6)
    const x = Math.floor(Math.random() * 55); // 0 to 54 weeks
    const y = Math.floor(Math.random() * 7);  // 0 to 6 days

    const DATE = moment().subtract(2, 'year').add(1, 'day').add(x, 'weeks').add(y, 'days').format();

    const data = { date: DATE };
    console.log(`Committing for date: ${DATE}`);

    fs.writeFile(FILE_PATH, JSON.stringify(data), (err) => {
        if (err) throw err;

        git.add(FILE_PATH)
           .commit(`Commit on ${DATE}`, { '--date': DATE }, () => makeCommit(n - 1));
    });
};

makeCommit(400);
