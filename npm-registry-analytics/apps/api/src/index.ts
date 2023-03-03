import wait from '@hbarve1/wait';
import { getHeapStatistics } from 'node:v8';
import log from 'why-is-node-running';

import {
  getAllPackageNamesFromFiles,
  getNpmPackage,
  parsePackageJson,
} from './npm';
import { insertJson, newClientStub, newClient } from './dgraph';

async function writeNpmPackageNamesToDatabaseSub({
  packageNames,
  i,
  dgraphClient,
}) {
  const pkgJson = await getNpmPackage(packageNames[i]).catch((error) => {
    console.log('Error Inserting', i, packageNames[i]);
    console.dir(error, { depth: null });
  });

  try {
    const jsonData = JSON.stringify(pkgJson);
    const res = await insertJson(dgraphClient, {
      _id: packageNames[i],
      _table: 'npmPackage',
      jsonData,
    }).catch((error) => {
      console.log('Error fetching', i, packageNames[i]);
      console.error(error);
    });
    console.log('Success', i, packageNames[i]);
  } catch (error) {
    console.log('Error Inserting', i, packageNames[i]);
    console.dir(error, { depth: null });
  }
}

async function writeNpmPackageNamesToDatabase() {
  const packageNames = await getAllPackageNamesFromFiles({
    folderPath: ['..', '..', '..', '..', 'datasets'],
  });
  const dgraphClientStub = newClientStub();
  const dgraphClient = newClient(dgraphClientStub);

  const index = 1898334;
  // const index = packageNames.findIndex(
  //   (packageName) => packageName === "@wind-webcli/core",
  // );
  console.log('index', index);
  // for (let i = index; i < 953; i++) {
  let loopCounter = 0;
  for (let i = index; i < packageNames.length; i++) {
    console.log({ loopCounter, i });
    // await writeNpmPackageNamesToDatabaseSub(packageNames, i);
    writeNpmPackageNamesToDatabaseSub({ packageNames, i, dgraphClient });

    if (loopCounter >= 12) {
      console.log('Waiting for 2 seconds');
      await wait(2000);
      loopCounter = 0;
    }

    loopCounter++;
  }

  dgraphClientStub.close();
}

writeNpmPackageNamesToDatabase();

// setInterval(() => {
//   console.table(
//     Object.entries(getHeapStatistics()).map(([k, v]) => ({
//       k,
//       v: v / 1024 / 1024,
//     }))
//   );
// }, 1000);

// setTimeout(function () {
//   log(); // logs out active handles that are keeping node running
// }, 200);
