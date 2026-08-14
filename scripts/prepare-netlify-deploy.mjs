import { copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();
const publicDir = path.join(rootDir, 'public');
const distDir = path.join(rootDir, 'dist');

const filesToCopy = ['_redirects'];

async function prepareNetlifyDeploy() {
  await mkdir(distDir, { recursive: true });

  for (const fileName of filesToCopy) {
    const sourcePath = path.join(publicDir, fileName);
    const targetPath = path.join(distDir, fileName);
    await copyFile(sourcePath, targetPath);
  }
}

prepareNetlifyDeploy().catch((error) => {
  console.error('[prepare-netlify-deploy] Netlify 배포용 정적 파일 준비에 실패했습니다.');
  console.error(error);
  process.exit(1);
});
