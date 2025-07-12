import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { buildSubgraphSchema } from "@apollo/subgraph";
import { readFileSync } from "fs";
import gql from "graphql-tag";
import { characters } from "./data";

const typeDefs = gql(readFileSync("./schema.graphql", { encoding: "utf-8" }));

const resolvers = {
  Query: {
    characters: () => {
      return characters;
    },
    character: (_: any, { id }) => {
      return characters.find((character) => character.id === id);
    },
  },
  Character: {
    __resolveReference: ({ id }) => {
      return characters.find((character) => character.id === id);
    },
  },
};

const server = new ApolloServer({
  schema: buildSubgraphSchema({ typeDefs, resolvers }),
});

startStandaloneServer(server, {
  listen: {
    port: 4001,
  },
})
  .then(({ url }) => console.log(`Subgraph posts running at ${url}`))
  .catch((e) => console.error(e));
