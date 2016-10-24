/** 
 * Part of the build script because windows doesn't have rm -rf and npm doesn't have conditionals
*/
const exec = require('child_process').exec;
const os = require('os');
function done(error, stdout, stderr) {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
  console.log(`stderr: ${stderr}`);
  console.log("All done cleaning dist");
}

if(os.platform() == "win32"){
    exec("if exist \"dist\" rd /S/Q dist",done);
}else{
     exec("rm -rf ./dist/*",done);
}