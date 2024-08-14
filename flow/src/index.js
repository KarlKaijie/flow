const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// 配置
const targetDir = path.join('src', 'libs', 'workflow_dataflow');
const tempDir = path.join('src', 'libs', 'temp_directory');
const folderToCopy = 'src/views/appEngine';
const mdPath = path.join('src', 'libs', 'workflow_dataflow', 'README.md');

function copyFolderRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const items = fs.readdirSync(src);

  for (const item of items) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);

    if (fs.statSync(srcPath).isDirectory()) {
      copyFolderRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function cloneRepository(url, destination) {
  return new Promise((resolve, reject) => {
    const command = `git clone -b workflow_dataflow --single-branch ${url} ${destination}`;
    exec(command, (error, stdout, stderr) => {
      if (error) {
        return reject(`克隆仓库失败: ${stderr}`);
      }
      resolve();
    });
  });
}

function deleteDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
}

function writeMD() {
  const content =
    '# 注意\n\n此文件夹内容，不由本项目维护，在执行npm run flow时自动生成，更新时会被完全替换，请勿修改内容。';
  fs.writeFile(mdPath, content, (err) => {
    if (err) {
      return console.error('写入文件时出错:', err);
    }
  });
}

async function updateWorkflowDataflow(repoUrl) {
  try {
    deleteDirectory(targetDir);
    deleteDirectory(tempDir);
    await cloneRepository(repoUrl, tempDir);
    const srcFolder = path.join(tempDir, folderToCopy);
    const destFolder = path.join(targetDir, path.basename(folderToCopy));

    if (fs.existsSync(srcFolder)) {
      copyFolderRecursive(srcFolder, destFolder);
      writeMD();
      console.log('操作成功');
    } else {
      console.error('源文件夹不存在:', srcFolder);
    }
    deleteDirectory(tempDir);
  } catch (error) {
    console.error('发生错误:', error);
  }
}

// 导出主函数
module.exports = {
  updateWorkflowDataflow,
};
