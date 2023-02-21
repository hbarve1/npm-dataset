import wait from '@hbarve1/wait';

import {
  getAllPackageNamesFromFiles,
  getNpmPackage,
  parsePackageJson,
} from './npm';
import { insertJson, newClientStub, newClient } from './dgraph';

async function writeNpmPackageNamesToDatabaseSub(packageNames, i) {
  const dgraphClientStub = newClientStub();
  const dgraphClient = newClient(dgraphClientStub);
  try {
    const pkgJson = await getNpmPackage(packageNames[i]);
    // const pkgJson = await getNpmPackage("--hiljson");
    // console.log(i, packageNames[i]);
    // console.dir(pkgJson, { depth: null });
    // console.log(
    //   'parsePackageJson fn calling ===================================='
    // );
    // const parsedPkgJson = parsePackageJson(pkgJson);
    // console.dir(parsedPkgJson, { depth: null });

    try {
      const res = await insertJson(dgraphClient, {
        _id: packageNames[i],
        _table: 'npmPackage',
        jsonData: JSON.stringify(pkgJson),
      });
      // console.dir(res, { depth: null });
      console.log('Success', i, packageNames[i]);
      // await wait(70);
    } catch (error) {
      console.log('Error Inserting', i, packageNames[i]);
      // const parsedPkgJson = parsePackageJson(pkgJson);
      // console.dir(parsedPkgJson, { depth: null });
      console.dir(error, { depth: null });
      // console.error(error);
    }
  } catch (error) {
    console.log('Error fetching', i, packageNames[i]);
    console.error(error);
  }
  dgraphClientStub.close();
}

async function writeNpmPackageNamesToDatabase() {
  const packageNames = await getAllPackageNamesFromFiles({
    folderPath: ['..', '..', '..', '..', 'datasets'],
  });

  const index = 298000;
  // const index = packageNames.findIndex(
  //   (packageName) => packageName === "@wind-webcli/core",
  // );
  console.log('index', index);
  // for (let i = index; i < 953; i++) {
  let loopCounter = 0;
  for (let i = index; i < packageNames.length; i++) {
    writeNpmPackageNamesToDatabaseSub(packageNames, i);

    if (loopCounter === 50) {
      console.log('Waiting for 3 seconds');
      await wait(3000);
      loopCounter = 0;
    }

    loopCounter++;
  }
}

// writeNpmPackageNamesToDatabase();
