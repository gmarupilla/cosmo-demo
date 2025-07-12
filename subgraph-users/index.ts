import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { readFileSync } from "fs";
import gql from "graphql-tag";
import { publishers } from "./data";

const typeDefs = gql(readFileSync("./schema.graphql", { encoding: "utf-8" }));

const resolvers = {
  Query: {
    publishers: () => {
      return publishers;
    },
    publisher: (_: any, { id }) => {
      return publishers.find((publisher) => publisher.id === id);
    },
  },
  Publisher: {
    __resolveReference: ({ id }) => {
      return publishers.find((publisher) => publisher.id === id);
    },
  },
  Character: {
    publisher(character) {
      return publishers.find((publisher) => publisher.id === character.publisherId);
    },
    __resolveReference(character) {
      return character;
    },
  },
};

const server = new ApolloServer({
  schema: buildSubgraphSchema({ typeDefs, resolvers }),
});

startStandaloneServer(server, {
  listen: {
    port: 4002,
  },
})
  .then(({ url }) => console.log(`Subgraph users running at ${url}.`))
  .catch((e) => console.error(e));
