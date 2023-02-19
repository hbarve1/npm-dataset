const axios = require("axios");
const fs = require("fs/promises");
const path = require("path");
// const util = require("util");
// const readFile = util.promisify(fs.readFile);
// const writeFile = util.promisify(fs.writeFile);
const { mkdir } = require("node:fs/promises");
const { resolve, join } = require("node:path");
const { TextDecoderStream } = require("node:stream/web");

const npmRegistry = {
  name: "npm",
  url: "https://registry.npmjs.org",
  search: "/-/v1/search",
  getPackage: "/",
  getAllVersions: "/",
  getAllNames: "https://replicate.npmjs.com/_all_docs",
  getAllNames2:
    "https://raw.githubusercontent.com/nice-registry/all-the-package-names/master/names.json",
};

async function writeDataToFile(fileName, jsonData, folderName = `datasets`) {
  const folderPath = path.join(__dirname, `..`, folderName);

  try {
    await fs.access(folderPath);
  } catch (error) {
    console.error(`Folder '${folderName}' not present. `, { error });
    try {
      await mkdir(folderPath, { recursive: true });
      console.log(`Folder '${folderName}' created. `);
    } catch (error) {
      console.error(`Error in creating folder '${folderName}'. `, { error });
      return;
    }
  } finally {
    try {
      await fs.writeFile(
        path.join(folderPath, fileName),
        JSON.stringify(jsonData),
      );

      console.log(`File '${fileName}' written to folder '${folderName}'. `);
    } catch (error) {
      console.error(`Error in writing file '${fileName}'. `, { error });
    }
  }
}

// writeDataToFile(`data-${Date.now()}.json`, { a: 1 });

async function getAllPackageNames() {
  const res = await fetch(npmRegistry.getAllNames2);
  // const res = await fetch(npmRegistry.url + npmRegistry.getPackage + "axios");

  const data = await res.json();
  console.log(data);
  // return;

  // const { data } = await axios.get(npmRegistry.getAllNames);
  // console.log(data.rows.length);

  // const packageNames = data.rows.map((row) => row.id);

  writeDataToFile(`data-${Date.now()}.json`, data);
}

// getAllPackageNames();

async function getNpmPackage(packageName) {
  const res = await fetch(`${npmRegistry.url}/${packageName}`);
  const data = await res.json();
  // console.log(data);
  return data;
}

async function fetchStream() {
  const response = await fetch(npmRegistry.getAllNames);
  const stream = response.body;
  const textStream = stream.pipeThrough(new TextDecoderStream());

  const reader = textStream.getReader();
  let result = "";
  while (true) {
    const { value, done } = await reader.read();
    console.log(done, value);
    if (done) break;
    result += value;
  }
}

// fetchStream();
async function getAllPackageNamesFromFiles({
  foldername = "datasets",
  filename = "npm-registry-namespace.json",
} = {}) {
  const filePath = path.join(__dirname, `..`, foldername, filename);
  // console.log({ filePath });
  const data = await fs.readFile(
    path.join(__dirname, `..`, foldername, filename),
  );
  return JSON.parse(data);
}

async function writeNpmPackageNamesToDatabase({
  foldername = "datasets",
  filename = "npm-registry-namespace.json",
} = {}) {
  // data-1675854763820.json
  const filePath = path.join(__dirname, `..`, foldername, filename);
  console.log({ filePath });
  const data = await fs.readFile(
    path.join(__dirname, `..`, foldername, filename),
  );
  const packageNames = JSON.parse(data);
  console.log(packageNames.length);

  let index = 0;
  // const index = packageNames.findIndex(
  //   (packageName) => packageName === "@wind-webcli/core",
  // );

  for (let i = index; i < packageNames.length; i++) {
    // await createNode(packageNames[i]);
    console.log(i, packageNames[i]);
  }

  // for (const packageName of packageNames) {
  //   await createNode(packageName);
  // }
}

// writeNpmPackageNamesToDatabase();

const parseKeyName = (str) =>
  str
    .trim()
    .split("-")
    .map((w, i) => (i === 0 ? w : w[0].toUpperCase() + w.slice(1)))
    .join("");

const parseKeyNames = (obj) => {
  return Object.entries(obj)
    .filter(([_, val]) => {
      if (Array.isArray(val)) {
        return val.length > 0;
      }
      if (typeof val === "object") {
        return Object.keys(val).length > 0;
      }
      if (typeof val === "string") {
        return val.trim().length > 0;
      }
      return true;
    })
    .reduce((prevObj, [key, value]) => {
      const updatedKey = parseKeyName(key);

      if (Array.isArray(value)) {
        return {
          ...prevObj,
          [updatedKey]: value.map((v) =>
            typeof v === "object" ? parseKeyNames(v) : v,
          ),
        };
      }

      if (typeof value === "object") {
        return {
          ...prevObj,
          [updatedKey]: parseKeyNames(value),
        };
      }

      return {
        ...prevObj,
        [updatedKey]: value,
      };
    }, {});
};

const recursiveNpmDep =
  ([keyName1, keyName2]) =>
  (obj) =>
    Object.entries(obj).map(([key, value]) => ({
      [keyName1]: key,
      [keyName2]:
        typeof value === "object"
          ? recursiveNpmDep([keyName1, keyName2])(value)
          : value,
    }));

const mapFnWrapper =
  ([keyName1, keyName2]) =>
  ([key, value]) => ({
    [keyName1]: key,
    [keyName2]:
      typeof value === "object"
        ? recursiveNpmDep([keyName1, keyName2])(value)
        : value,
  });

// let index = 0;
function parsePackageJson({
  versions,
  time,
  dependencies,
  devDependencies,
  peerDependencies,
  peerDependenciesMeta,
  overrides,
  // _rev,
  // _id,
  // name,
  // distTags,
  // description,
  repository,
  ...rest
}) {
  // index++;
  console.log({ repository });
  // console.log({ versions, time });
  // return {};
  // console.dir(
  //   {
  //     // versions,
  //     time,
  //     dependencies,
  //     devDependencies,
  //     peerDependencies,
  //     peerDependenciesMeta,
  //     overrides,
  //     rest,
  //   },
  //   { depth: null },
  // );
  const returnObj = {
    ...parseKeyNames(rest),
  };
  // console.dir({ returnObj }, { depth: null });
  // return returnObj;

  if (versions) {
    const ver = Object.values(versions)
      .map((v) => parseKeyNames(v))
      .map((v) => {
        // console.dir({ v }, { depth: null });

        const res = parsePackageJson(v);

        return res;

        // const {
        //   name,
        //   version,
        //   description,
        //   main,
        //   scripts,
        //   author,
        //   license,
        //   _id,
        //   _nodeVersion,
        //   _npmVersion,
        //   _npmUser,
        //   maintainers,
        //   _npmOperationalInternal,
        //   _hasShrinkwrap,
        //   dist,
        // } = res;

        // console.dir({ author }, { depth: null });

        // return {
        //   name,
        //   version,
        //   description,
        //   main,
        //   scripts,
        //   author,
        //   license,
        //   _id,
        //   _nodeVersion,
        //   _npmVersion,
        //   _npmUser,
        //   maintainers,
        //   _npmOperationalInternal,
        //   _hasShrinkwrap,
        //   dist,
        // };
      });

    // console.log("-------");
    // console.dir(Object.values(versions), { depth: null });
    // console.dir(ver, { depth: null });
    // console.log("-------");

    // returnObj.versions = ver;
  }
  if (time) {
    // console.dir({ time }, { depth: null });
    // console.dir(Object.entries(time), { depth: null });
    // console.dir(Object.entries(time).map(mapFnWrapper(["version", "time"])), {
    //   depth: null,
    // });
    // returnObj.time = Object.entries(time).map(
    //   mapFnWrapper(["version", "time"]),
    // );

    returnObj.timeAsTimeline = Object.entries(time).map(
      mapFnWrapper(["version", "time"]),
    );
  }
  if (overrides) {
    returnObj.overrides = Object.entries(overrides).map(
      mapFnWrapper(["name", "version"]),
    );
  }
  if (dependencies) {
    returnObj.dependencies = Object.entries(dependencies).map(
      mapFnWrapper(["name", "version"]),
    );
  }
  if (devDependencies) {
    returnObj.devDependencies = Object.entries(devDependencies).map(
      mapFnWrapper(["name", "version"]),
    );
  }
  if (peerDependencies) {
    returnObj.peerDependencies = Object.entries(peerDependencies).map(
      mapFnWrapper(["name", "version"]),
    );
  }

  // console.log({ index });
  return returnObj;
}

module.exports = {
  npmRegistry,
  getAllPackageNames,
  getAllPackageNamesFromFiles,
  writeNpmPackageNamesToDatabase,
  getNpmPackage,
  parsePackageJson,
};
