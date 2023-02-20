// https://github.com/dgraph-io/dgraph-js/blob/2743ad010f96f00c8760411b74896ab4de5653c9/examples/tls/index.js#L82

import dgraph from 'dgraph-js';
import * as grpc from '@grpc/grpc-js';
import fs from 'fs';
import path from 'path';

const { DGRAPH_GRPC_URI, DGRAPH_HTTP_URI } = process.env;

export function newClientStub() {
  return new dgraph.DgraphClientStub(
    DGRAPH_GRPC_URI,
    grpc.credentials.createInsecure()
  );
}

// Create a client stub.
function newClientStub2() {
  // First create the appropriate TLS certs with dgraph cert:
  //     $ dgraph cert
  //     $ dgraph cert -n localhost
  //     $ dgraph cert -c user
  const rootCaCert = fs.readFileSync(path.join(__dirname, 'tls', 'ca.crt'));
  const clientCertKey = fs.readFileSync(
    path.join(__dirname, 'tls', 'client.user.key')
  );
  const clientCert = fs.readFileSync(
    path.join(__dirname, 'tls', 'client.user.crt')
  );
  return new dgraph.DgraphClientStub(
    'localhost:9080',
    grpc.credentials.createSsl(rootCaCert, clientCertKey, clientCert)
  );
}

export function newClient(clientStub) {
  return new dgraph.DgraphClient(clientStub);
}

async function dropAll(dgraphClient) {
  const op = new dgraph.Operation();
  op.setDropAll(true);
  await dgraphClient.alter(op);
}

async function setSchema(dgraphClient) {
  const schema = `
    name: string @index(exact) .
    age: int .
    married: bool .
    loc: geo @index(geo) .
    dob: datetime .
    friend: uid @reverse .
  `;
  const op = new dgraph.Operation();
  op.setSchema(schema);
  await dgraphClient.alter(op);
}

async function createData(dgraphClient) {
  const txn = dgraphClient.newTxn();
  try {
    const p = {
      uid: '_:alice',
      name: 'Alice',
      age: 26,
      married: true,
      loc: {
        type: 'Point',
        coordinates: [-122.4184, 37.7665],
      },
      dob: new Date(1980, 1, 15),
      friend: [
        {
          uid: '_:bob',
          name: 'Bob',
          age: 24,
          married: true,
        },
        {
          uid: '_:charlie',
          name: 'Charlie',
          age: 29,
        },
      ],
      school: [
        {
          name: 'Crown Public School',
        },
      ],
    };

    // run mutation
    const mu = new dgraph.Mutation();
    mu.setSetJson(p);
    const response = await txn.mutate(mu);

    await txn.commit();

    // Get uid of the outermost object (person named "Alice").
    // Response#getUidsMap() returns a map from blank node names to uids.
    // For a json mutation, blank node label is used for the name of the created nodes.
    console.log(`uid = ${response.getUidsMap().get('alice')}\n`);

    console.log('All created nodes (map from blank node names to uids):');
    response
      .getUidsMap()
      .forEach((uid, key) => console.log(`${key} => ${uid}`));
    console.log();
  } finally {
    await txn.discard();
  }
}

async function queryData(dgraphClient) {
  const query = `
    query all($a: string) {
      all(func: eq(name, $a)) {
        uid
        name
        age
        married
        loc
        dob
        friend {
          uid
          name
        }
        school {
          uid
          name
        }
      }
    }
  `;

  const vars = { $a: 'Alice' };
  const res = await dgraphClient.newTxn().queryWithVars(query, vars);
  const ppl = res.getJson();

  console.log('Number of people named Alice: ', ppl.all.length);
  ppl.all.forEach((person) => {
    console.log(person);
  });
}

async function createDataForNpm(dgraphClient, json) {
  const txn = dgraphClient.newTxn();
  try {
    // run mutation
    const mu = new dgraph.Mutation();
    mu.setSetJson(json);
    const response = await txn.mutate(mu);

    await txn.commit();

    console.log('All created nodes (map from blank node names to uids):');
    response
      .getUidsMap()
      .forEach((uid, key) => console.log(`${key} => ${uid}`));
    console.log();
  } finally {
    await txn.discard();
  }
}

async function main() {
  const dgraphClientStub = newClientStub();
  const dgraphClient = newClient(dgraphClientStub);
  // await dropAll(dgraphClient);
  // await setSchema(dgraphClient);
  // await createData(dgraphClient);
  await createDataForNpm(dgraphClient, {
    _id: '@hbarve1/wait',
    _rev: '2-594d62021d6fe136aff0f74db6f60d38',
    name: '@hbarve1/wait',
    'dist-tags': {
      latest: '2.0.0',
    },
    versions: Object.values({
      '1.0.0': {
        name: '@hbarve1/wait',
        version: '1.0.0',
        description:
          'This function paues the flow of code for miliseconds given in parameter.',
        main: 'index.js',
        scripts: {
          test: 'echo "Error: no test specified" && exit 1',
        },
        repository: {
          type: 'git',
          url: 'git+ssh://git@gitlab.com/hbarve1/wait.git',
        },
        author: {
          name: 'Himank Barve',
          email: 'hbarve1592@gmail.com',
        },
        license: 'ISC',
        bugs: {
          url: 'https://gitlab.com/hbarve1/wait/issues',
        },
        homepage: 'https://gitlab.com/hbarve1/wait#readme',
        gitHead: '022f95003dec1b46a5f607c378855b07fcfe3a80',
        _id: '@hbarve1/wait@1.0.0',
        _nodeVersion: '10.15.3',
        _npmVersion: '6.11.3',
        dist: {
          integrity:
            'sha512-QsmDDs47CDq5DvUlejxmQljVOyn0clc9YNRTJO1c/Q6+ATlnMcs9kYaKuF5r3IVCYU5O0qtS7u6qLCNpSFSXHg==',
          shasum: 'c49e89fecad89b1e2242ad1e672b84e716a03066',
          tarball: 'https://registry.npmjs.org/@hbarve1/wait/-/wait-1.0.0.tgz',
          fileCount: 3,
          unpackedSize: 934,
          'npm-signature':
            '-----BEGIN PGP SIGNATURE-----\r\nVersion: OpenPGP.js v3.0.4\r\nComment: https://openpgpjs.org\r\n\r\nwsFcBAEBCAAQBQJdnwY2CRA9TVsSAnZWagAAv8QP/jA2IMQoOt2U8OgddgIU\nZEGTM3fYLBew2YOa0JSf0tGTu+tJ6IMACw7JE34eK/jkwWPLHaPU+T5/fsew\np+Qv4v4gOnl1KDnVRerO9GO9sv/UbvmiYxjVPa5x71QP0b9yE/UiSzdlPEMl\ndmUvcolRMKgjNozw+hfkTdjtRlGLa4sNSv/jY4mHDcpteiTziZPuVWANBWUa\nqGmgt6TuLAnDAAVQ3aRoES2Hq+xzvJiKHgEtmbhKP029n8mTAiqncX6I2/QJ\nHbTjrMYJglOEAUX69Rn7Zvw2I4reN/Zh4ezIDBTqLnNBJpnCz5owXY/Sfn8F\nhr3fr1PADVKR+ZWts4+0YqvU1ab5i97eUolq9+PUK6NK5GijFY0nvVmMloQz\n9wWHq6ua8HMqlRpg2eK0uSfRqPyWvQ4dZdTAhsDNlLGMlExoiGRRASGb8CVW\nqfMOYOvkmOaujpQ6zo34rF0e0T7Dxgqp/LrMk9JeT1wastweLeAaQuutEass\ns/3MgUrBGuk71gI/sFUdWSe9rb7cwN5iLJqsNEI5/uCZ0rSDTTivkWL6UpmY\n0AYt32eyi1vm9NaKvvMDhlPDqZDtLhsuY19ZQtktJCwT6ev5MrYHkoFJKD2h\n5wSnZKf97C/tHvrZn6a7GcBipXlwypmE2aEl5Rt4jxQdk51PbPWQS+p9PDHr\nhOsR\r\n=4LF+\r\n-----END PGP SIGNATURE-----\r\n',
          signatures: [
            {
              keyid: 'SHA256:jl3bwswu80PjjokCgh0o2w5c2U4LhQAE57gj9cz1kzA',
              sig: 'MEYCIQDA1WQPNk8uiM5Jgug70oH/uYL09jd/HFlE8nqmRHFvTAIhAMkbfqUswrNRt5vRYdkwyHYTaYZ38rzQRRJ4yTNOHZzi',
            },
          ],
        },
        maintainers: [
          {
            name: 'hbarve1',
            email: 'hbarve1592@gmail.com',
          },
        ],
        _npmUser: {
          name: 'hbarve1',
          email: 'hbarve1592@gmail.com',
        },
        directories: {},
        _npmOperationalInternal: {
          host: 's3://npm-registry-packages',
          tmp: 'tmp/wait_1.0.0_1570702902181_0.10826698406178314',
        },
        _hasShrinkwrap: false,
      },
      '2.0.0': {
        name: '@hbarve1/wait',
        version: '2.0.0',
        description:
          'This function paues the flow of code for miliseconds given in parameter.',
        main: 'index.js',
        scripts: {
          test: 'echo "Error: no test specified" && exit 1',
        },
        repository: {
          type: 'git',
          url: 'git+ssh://git@gitlab.com/hbarve1/wait.git',
        },
        author: {
          name: 'Himank Barve',
          email: 'hbarve1592@gmail.com',
        },
        license: 'ISC',
        bugs: {
          url: 'https://gitlab.com/hbarve1/wait/issues',
        },
        homepage: 'https://gitlab.com/hbarve1/wait#readme',
        gitHead: 'e1b8310731c9e9ab79dedd8a7cc125aeb72d5820',
        _id: '@hbarve1/wait@2.0.0',
        _nodeVersion: '10.15.3',
        _npmVersion: '6.11.3',
        dist: {
          integrity:
            'sha512-voISS635BP4t3bfeUxUMa/mqu9sbXFhUZIxfZ+SvAfOlsdsd7RmgxwFZlAOEEHobsggTnhOlCrVc0DZgz3+OfQ==',
          shasum: '2829f8d4ca2596e9667a7b6d2843eef7d8ffea15',
          tarball: 'https://registry.npmjs.org/@hbarve1/wait/-/wait-2.0.0.tgz',
          fileCount: 3,
          unpackedSize: 989,
          'npm-signature':
            '-----BEGIN PGP SIGNATURE-----\r\nVersion: OpenPGP.js v3.0.4\r\nComment: https://openpgpjs.org\r\n\r\nwsFcBAEBCAAQBQJdnwdGCRA9TVsSAnZWagAAHOAP/jhULLctAvt4ssdmGc/N\nwF22Eov1NZfs8nBlLnDA6XbFLeetytbhi9iZ3Cau1ZtpScnrQRUaU8kOoyjm\nqdBqH9RtLy2UVA8MYQTMfBehlPwrnSrbg9OHJF2RH4BUEgigaOH8ITQAs2M3\nKzXd8AVd0rbdYFbxw2ScarmDjyF3fX1b+jcMZtOyiKK3Hkt+4l7dFSq+wwQ3\n/eGMkvy+/7WCKJwfmOXESLIWFVy1mpNkXCUOaZir+M3W/Ox38A/kxo3oDVqT\nvaQ410AtmYz9Dlbwtz4USc5hIIbOepaOc1LGQKbmZ1YxQk0I562cgsbj0agA\nNhMbYmyQ6IH/dWe+Zc8HSGjAHCfHgVGAdf7SaNV3BcjaEHFi1SRld5zkwC7t\n1F3fnjWukS9wafj/8FjQBVib6jkRqurwFKuxPWQ95BZXrdvb0b1CLX/PaRt7\n/1LGzVbgxEeAIworKtT9uBcQp9ceCVFuuUv7PrGSEXGYmpTw4bQwfPPSi3Hx\n4LDMhcicEFb+7hjH1pZsYRLIkN1cjf99reH+rmM5rW8RGfp0I204Bk522Kaz\nz/YJrwQbJj4MrmmCf6Ia1exE1paIZLOXA57+NBPxiTf/kqkR5jeMnJO2V6yf\nTor5jDbfw5OwocmWlSSVRP3fZaSWR9zR7w/LtHiSoV1rAg+8F8an7tZsa9Yt\nWdPn\r\n=S5/V\r\n-----END PGP SIGNATURE-----\r\n',
          signatures: [
            {
              keyid: 'SHA256:jl3bwswu80PjjokCgh0o2w5c2U4LhQAE57gj9cz1kzA',
              sig: 'MEUCIQC2ihORxei2CsVL8MKXXwG3t2XRf7b6Qe0AsYt2aya4QAIgRz+7bqKT8RoflXxSqDD6YoA928KcDkPgkHlX8JC6+to=',
            },
          ],
        },
        maintainers: [
          {
            name: 'hbarve1',
            email: 'hbarve1592@gmail.com',
          },
        ],
        _npmUser: {
          name: 'hbarve1',
          email: 'hbarve1592@gmail.com',
        },
        directories: {},
        _npmOperationalInternal: {
          host: 's3://npm-registry-packages',
          tmp: 'tmp/wait_2.0.0_1570703174206_0.9311570589853388',
        },
        _hasShrinkwrap: false,
      },
    }),
    time: Object.entries(([key, value]) => {
      return {
        version: key,
        time: value,
      };
    }),

    maintainers: [
      {
        name: 'hbarve1',
        email: 'hbarve1592@gmail.com',
      },
    ],
    description:
      'This function paues the flow of code for miliseconds given in parameter.',
    homepage: 'https://gitlab.com/hbarve1/wait#readme',
    repository: {
      type: 'git',
      url: 'git+ssh://git@gitlab.com/hbarve1/wait.git',
    },
    author: {
      name: 'Himank Barve',
      email: 'hbarve1592@gmail.com',
    },

    bugs: {
      url: 'https://gitlab.com/hbarve1/wait/issues',
    },
    license: 'ISC',
    readme:
      "# Wait\n\nThis function paues the flow of code for miliseconds given in parameter.\n\n```\n  const wait = require('@hbarve1/wait');\n\n  async function doSomething() {\n    // your important stuff\n\n    // will wait 1000 milli-seconds after moving forwarn in code, \n    // default value is 0\n    await wait(1000); \n\n    // your other important stuff\n  }\n```",
    readmeFilename: 'README.md',
  });
  // await queryData(dgraphClient);

  dgraphClientStub.close();
}

// main()
//   .then(() => console.log("Done"))
//   .catch((e) => console.error(e));

export async function insertJson(dgraphClient, json) {
  const txn = dgraphClient.newTxn();
  let res = null;
  try {
    const mu = new dgraph.Mutation();
    mu.setSetJson(json);
    res = await txn.mutate(mu);
    await txn.commit();

    // console.log("Inserted data: ", res.getUidsMap());

    return res;
  } finally {
    txn.discard();
  }
}
