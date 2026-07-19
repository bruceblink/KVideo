import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const nodeRuntimeLine = "export const runtime = 'nodejs';";

function routeFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return routeFiles(entryPath);
    return entry.name === 'route.ts' ? [entryPath] : [];
  });
}

test('legacy Pages build rewrites every Node.js API route to Edge runtime', () => {
  const root = process.cwd();
  const script = fs.readFileSync(path.join(root, 'scripts/run-pages-build.mjs'), 'utf8');
  const configured = new Set(
    [...script.matchAll(/'(app\/api\/[^']+\/route\.ts)'/g)].map((match) => match[1]),
  );
  const nodeRoutes = routeFiles(path.join(root, 'app/api'))
    .filter((file) => fs.readFileSync(file, 'utf8').includes(nodeRuntimeLine))
    .map((file) => path.relative(root, file).replaceAll('\\', '/'));

  assert.deepEqual(
    nodeRoutes.filter((route) => !configured.has(route)),
    [],
    'Every Node.js API route must be included in the legacy Pages runtime rewrite list',
  );
});
