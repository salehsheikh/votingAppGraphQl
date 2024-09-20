import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLInt,
  GraphQLSchema,
  GraphQLID,
} from "graphql";
import Poll from "../model/poll.js";

// PollOption Type
const PollOptionType = new GraphQLObjectType({
  name: "PollOption",
  fields: () => ({
    text: { type: GraphQLString },
    votes: { type: GraphQLInt },
  }),
});
// Define Poll Type
const PollType = new GraphQLObjectType({
  name: "Poll",
  fields: () => ({
    id: { type: GraphQLID },
    question: { type: GraphQLString },
    options: { type: new GraphQLList(PollOptionType) },
    createdAt: { type: GraphQLString },
  }),
});

// Root Query

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    poll: {
      type: PollType, // Adjusting to return a single poll, not a list
      args: { id: { type: GraphQLID } }, // Use an argument to fetch a specific poll by ID
      async resolve(parent, args) {
        if (args.id) {
          return await Poll.findById(args.id); // Fetch by ID if provided
        } else {
          return await Poll.findOne(); // Fetch the first poll if no ID is provided
        }
      },
    },
  },
});

// Mutation to create a poll and cast a vote
// Mutation to create a poll
const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    createPoll: {
      type: PollType,
      args: {
        question: { type: GraphQLString },
        options: { type: new GraphQLList(GraphQLString) },
      },
      async resolve(parent, args) {
        const newPoll = new Poll({
          question: "Which is your favorite programming language?",
          options: [
            { text: "JavaScript", votes: 0 },
            { text: "C++", votes: 0 },
            { text: "Python", votes: 0 },
          ],
        });
        return newPoll.save();
      },
    },
    // vote mutation remains the same
  },
});

export default new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});
