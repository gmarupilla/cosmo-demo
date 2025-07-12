# Cosmo Demo

This demo consists of 2 subgraphs that provide a simple federation example
for DC and Marvel comics data. Characters belong to publishers, so the
router (supergraph) can join data across the subgraphs.

- **characters** exposes comic book characters
- **publishers** exposes publishers

## Running Subgraphs Locally

You can run the subgraphs with the script as shown below

Characters run on http://localhost:4001 and publishers run on http://localhost:4002

```bash
sh ./start-subgraphs.sh
```

## Running Router Locally

You can run the router locally without a connection to the control plane by executing the following commands.

1. First cd into the router directory

```bash
cd router
```

2. Next generate the router config locally by running the compose command.

```bash
wgc router compose --input graph.localhost.yaml --out config.json
```

3. Finally run the router and head over to http://localhost:3002/graphql

```bash
docker run \
  --name cosmo-router \
  --rm \
  -p 3002:3002 \
  --add-host=host.docker.internal:host-gateway \
  --platform=linux/amd64 \
  -e pull=always \
  -e DEV_MODE=true \
  -e LISTEN_ADDR=0.0.0.0:3002 \
  -e EXECUTION_CONFIG_FILE_PATH="/config/config.json" \
  -v "$(pwd)/config.json:/config/config.json" \
  ghcr.io/wundergraph/cosmo/router:latest
```

## Building and Publishing Subgraph Containers

Each subgraph includes a `Dockerfile` so you can build and publish images to
GitHub Container Registry (GHCR). Replace `<owner>` with your GitHub user or
organization.

```bash
# Build and push the characters subgraph
docker build -t ghcr.io/<owner>/subgraph-characters:latest ./subgraph-characters
docker push ghcr.io/<owner>/subgraph-characters:latest

# Build and push the publishers subgraph
docker build -t ghcr.io/<owner>/subgraph-publishers:latest ./subgraph-publishers
docker push ghcr.io/<owner>/subgraph-publishers:latest
```

These images can then be pulled by TrueNAS or any other container host.

### Building Images on TrueNAS

To build the subgraph containers directly on a TrueNAS server you can open a
shell in the SCALE UI and run the same `docker build` commands. Make sure your
TrueNAS system is logged in to GHCR so it can push the images:

```bash
docker login ghcr.io
docker build -t ghcr.io/<owner>/subgraph-characters:latest ./subgraph-characters
docker push ghcr.io/<owner>/subgraph-characters:latest
docker build -t ghcr.io/<owner>/subgraph-publishers:latest ./subgraph-publishers
docker push ghcr.io/<owner>/subgraph-publishers:latest
```

Once published, create Docker containers in TrueNAS using these images.

## CI/CD

GitHub actions are setup to do schema checks on pull requests and schema publish on push to main.

## Example Queries

### Characters subgraph

Query the `characters` subgraph directly to list characters:

```graphql
query {
  characters {
    id
    name
    publisherId
  }
}
```

### Publishers subgraph

Query the `publishers` subgraph to list publishers:

```graphql
query {
  publishers {
    id
    name
    foundedYear
    totalComicsPublished
  }
}
```

### Federated query (router)

When the router composes the subgraphs you can fetch characters with their
publisher in a single request:

```graphql
query {
  characters {
    id
    name
    publisher {
      name
      foundedYear
      totalComicsPublished
    }
  }
}
```

While DC Comics and Marvel Comics remain separate publishers, this federated
query shows how the router connects the subgraphs by looking up a character's
publisher.
