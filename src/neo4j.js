const neo4j = require("neo4j-driver");
const axios = require("axios");
const fs = require("fs/promises");
const path = require("path");
// const util = require("util");
// const readFile = util.promisify(fs.readFile);
// const writeFile = util.promisify(fs.writeFile);
const { mkdir } = require("node:fs/promises");
const { resolve, join } = require("node:path");
const { TextDecoderStream } = require("node:stream/web");

const driver = neo4j.driver(
  `bolt://localhost:7687`,
  // neo4j.auth.basic("neo4j", "neo4j"),
);
const session = driver.session();
const personName = "Alice";

async function get() {
  try {
    const result = await session.run(
      `CREATE (a:Person {name: $name}) RETURN a`,
      {
        name: personName,
      },
    );

    const singleRecord = result.records[0];
    const node = singleRecord.get(0);

    console.log(node.properties.name);
  } catch (e) {
    console.log(e);
  } finally {
    await session.close();
    console.log("filnal");
  }
}
// get();

// on application exit:
// await driver.close();

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

async function createNode(packageName) {
  const result = await session.run(
    `CREATE (a:npmPackage {name: $name, id: $id}) RETURN a`,
    {
      id: packageName,
      name: packageName,
    },
  );

  const singleRecord = result.records[0];
  const node = singleRecord.get(0);

  console.log(node.properties.name);
}

// createNode("axios");

async function writeNpmPackageNamesToDatabaase() {
  // data-1675854763820.json
  const data = await fs.readFile(
    path.join(__dirname, `..`, `datasets`, `data-1675854763820.json`),
  );
  const packageNames = JSON.parse(data);
  console.log(packageNames.length);
  //@wind-webcli/core

  // const index = packageNames.findIndex(
  //   (packageName) => packageName === "@wind-webcli/core",
  // );

  for (let i = index; i < packageNames.length; i++) {
    await createNode(packageNames[i]);
  }

  // for (const packageName of packageNames) {
  //   await createNode(packageName);
  // }
}

// writeNpmPackageNamesToDatabaase();
