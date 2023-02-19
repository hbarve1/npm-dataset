const axios = require("axios");
const fs = require("fs/promises");
const path = require("path");
const wait = require("@hbarve1/wait");

const {
  getAllPackageNamesFromFiles,
  getNpmPackage,
  parsePackageJson,
} = require("./npm");
const { insertJson, newClientStub, newClient } = require("./dgraph");

async function writeNpmPackageNamesToDatabase() {
  const packageNames = await getAllPackageNamesFromFiles();
  const dgraphClientStub = newClientStub();
  const dgraphClient = newClient(dgraphClientStub);

  let index = 952;
  // const index = packageNames.findIndex(
  //   (packageName) => packageName === "@wind-webcli/core",
  // );

  for (let i = index; i < 953; i++) {
    // for (let i = index; i < packageNames.length; i++) {
    try {
      const pkgJson = await getNpmPackage(packageNames[i]);
      // const pkgJson = await getNpmPackage("--hiljson");
      // console.log(i, packageNames[i]);
      console.dir(pkgJson, { depth: null });
      console.log(
        "parsePackageJson fn calling ====================================",
      );
      const parsedPkgJson = parsePackageJson(pkgJson);
      console.dir(parsedPkgJson, { depth: null });

      try {
        const res = await insertJson(dgraphClient, parsedPkgJson);
        // console.dir(res, { depth: null });
        console.log("Success", i, packageNames[i]);
        await wait(500);
      } catch (error) {
        console.log("Error Inserting", i, packageNames[i]);
        // const parsedPkgJson = parsePackageJson(pkgJson);
        // console.dir(parsedPkgJson, { depth: null });
        console.dir(error, { depth: null });
        // console.error(error);
      }
    } catch (error) {
      console.log("Error fetching", i, packageNames[i]);
      console.error(error);
    }
  }

  dgraphClientStub.close();
}

writeNpmPackageNamesToDatabase();
