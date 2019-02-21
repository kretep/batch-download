const fetch = require('node-fetch');
const yaml = require('js-yaml');
const fs = require('fs');
const https = require('https');
const url = require('url');
const nunjucks = require('nunjucks');

try {
  nunjucks.configure({ autoescape: true });
  const task = yaml.safeLoad(fs.readFileSync('./task.yml', 'utf8'));
  fetchFromUrl(task.url, task.tasks);
} catch (e) {
  console.log(e);
}

async function fetchFromUrl(sourceURL, tasks, outerVariables) {
  console.log("Processing", sourceURL);
  return fetch(sourceURL)
    .then(res => res.text())
    .then(async body => {
      for (const task of tasks) {
        await processTask(sourceURL, task, outerVariables, body);
      }
    });
}

async function processTask(sourceURL, task, outerVariables, body) {
  // Match regex to body
  const regex = new RegExp(task.regex, "g");
  let matches;
  while ((matches = regex.exec(body)) != null) {

    // Construct variables object
    const localVariables = matches.groups;
    const variables = {...outerVariables, [task.name]: localVariables};

    // Resolve URL in case it is relative
    let newURL = (new url.URL(localVariables.url, sourceURL)).href;
    
    // Recurse or download file
    if (task.tasks !== undefined) {
      await fetchFromUrl(newURL, task.tasks, variables);
    }
    else {
      try {
        const filename = nunjucks.renderString(task.file, variables);
        await downloadToFile(newURL, filename);
      }
      catch(err) {
        console.log(`Error while downloading ${newURL}: ${err}`);
      }
    }
  }
}

async function downloadToFile(url, path) {
  return new Promise((resolve, reject) => {
    console.log(`Downloading ${url} to ${path}`);

    const request = https.get(url, function(response) {

      // Don't download if file already exists
      // and was fully downloaded (size on disk equals response header)
      if (fs.existsSync(path)) {
        const stats = fs.statSync(path);
        if (response.headers['content-length'] == stats.size) {
          request.abort();
          reject(path + " already exists");
          return;
        }
      }

      // Download file
      const file = fs.createWriteStream(path);
      response.pipe(file);

      file.on('finish', async () => {
        await file.close();
        resolve();
      });

    }).on('error', function(err) {
      fs.unlink(dest);
      if (cb) cb(err.message);
      reject(err);
    });
  });
}
