# NPM Dataset

## Docker

```
docker run \
    --publish=7474:7474 --publish=7687:7687 --env=NEO4J_AUTH=none \
    --volume=$HOME/codes/npm-dataset/neo4j/data:/data \
    neo4j
```
