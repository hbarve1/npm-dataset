import wait from '@hbarve1/wait';
import { getHeapStatistics } from 'node:v8';
import log from 'why-is-node-running';

import {
  getAllPackageNamesFromFiles,
  getNpmPackage,
  parsePackageJson,
} from './npm';
import { insertJson, newClientStub, newClient } from './dgraph';

async function writeNpmPackageNamesToDatabaseSub(packageNames, i) {
  // try {
  const dgraphClientStub = newClientStub();
  const dgraphClient = newClient(dgraphClientStub);
  // try {
  const pkgJson = await getNpmPackage(packageNames[i]).catch((error) => {
    console.log('Error Inserting', i, packageNames[i]);
    // const parsedPkgJson = parsePackageJson(pkgJson);
    // console.dir(parsedPkgJson, { depth: null });
    console.dir(error, { depth: null });
    // console.error(error);
  });
  // const pkgJson = await getNpmPackage("--hiljson");
  // console.log(i, packageNames[i]);
  // console.dir(pkgJson, { depth: null });
  // console.log(
  //   'parsePackageJson fn calling ===================================='
  // );
  // const parsedPkgJson = parsePackageJson(pkgJson);
  // console.dir(parsedPkgJson, { depth: null });

  // try {
  const res = await insertJson(dgraphClient, {
    _id: packageNames[i],
    _table: 'npmPackage',
    jsonData: JSON.stringify(pkgJson),
  }).catch((error) => {
    console.log('Error fetching', i, packageNames[i]);
    console.error(error);
  });
  // console.dir(res, { depth: null });
  console.log('Success', i, packageNames[i]);
  // await wait(70);
  // } catch (error) {
  //   console.log('Error Inserting', i, packageNames[i]);
  //   // const parsedPkgJson = parsePackageJson(pkgJson);
  //   // console.dir(parsedPkgJson, { depth: null });
  //   console.dir(error, { depth: null });
  //   // console.error(error);
  // }
  // } catch (error) {
  //   console.log('Error fetching', i, packageNames[i]);
  //   console.error(error);
  // }
  dgraphClientStub.close();
  // } catch (error) {
  //   console.log('Error in writeNpmPackageNamesToDatabaseSub');
  //   console.error(error);
  // }
}

async function writeNpmPackageNamesToDatabase() {
  const packageNames = await getAllPackageNamesFromFiles({
    folderPath: ['..', '..', '..', '..', 'datasets'],
  });

  const index = 67091;
  // const index = packageNames.findIndex(
  //   (packageName) => packageName === "@wind-webcli/core",
  // );
  console.log('index', index);
  // for (let i = index; i < 953; i++) {
  let loopCounter = 0;
  for (let i = index; i < packageNames.length; i++) {
    console.log({ loopCounter, i });
    // await writeNpmPackageNamesToDatabaseSub(packageNames, i);
    writeNpmPackageNamesToDatabaseSub(packageNames, i);

    if (loopCounter >= 10) {
      console.log('Waiting for 2 seconds');
      await wait(2000);
      loopCounter = 0;
    }

    loopCounter++;
  }
}

// writeNpmPackageNamesToDatabase();

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
