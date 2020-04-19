const core = require('@actions/core');
const exec = require('@actions/exec');
const artifact = require('@actions/artifact');
const artifactClient = artifact.create()


const url = core.getInput("url", { required: true });

core.startGroup("starting lighthouse audit");

let myOutput = '';
let myError = '';

const options = {};
options.listeners = {
  stdout: (data) => {
    myOutput += data.toString();
  },
  stderr: (data) => {
    myError += data.toString();
  }
};

exec.exec(`npx lighthouse ${url} --verbose --output html --output-path ./report.html`, options)
.then(res => {
  core.debug(myOutput);
  core.warning(myError);

  core.info("completed audit");

  core.info("uploading artifact");
  const artifactName = 'lighthouse-result';
  const rootDirectory = '.'
  const files = [
    'report.html'
  ]
  const artifactOptions = {
    continueOnError: false
  }

  artifactClient.uploadArtifact(artifactName, files, rootDirectory, artifactOptions)
  .then(res => {
    core.debug(res);
    core.info("done uploading artifact")
    core.setOutput("metrics", myOutput);
  })

  core.endGroup();
})