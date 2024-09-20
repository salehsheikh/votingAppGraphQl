import React, { useState, useEffect } from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import io from 'socket.io-client';

// Initialize socket connection to the backend server
const socket = io('http://localhost:5000');

// GraphQL Queries and Mutations
const GET_POLLS = gql`
  query GetPolls {
    poll {
      id
      question
      options {
        text
        votes
      }
    }
  }
`;

const VOTE_MUTATION = gql`
  mutation Vote($pollId: ID!, $optionIndex: Int!) {
    vote(pollId: $pollId, optionIndex: $optionIndex) {
      id
      question
      options {
        text
        votes
      }
    }
  }
`;

const Poll = () => {
  const { loading, error, data, refetch } = useQuery(GET_POLLS);
  const [vote] = useMutation(VOTE_MUTATION);
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    socket.on('pollUpdated', () => {
      refetch();
    });

    return () => {
      socket.disconnect();
    };
  }, [refetch]);

  // Handle voting
  const handleVote = (pollId) => {
    if (selectedOption !== null) {
      vote({ variables: { pollId, optionIndex: selectedOption } });
      socket.emit('vote', pollId); // Notify the server about the vote
    }
  };

  // Calculate percentage of votes for each option
  const calculatePercentage = (votes, totalVotes) => {
    return totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
  };

  if (loading) return <p className="text-center">Loading...</p>;
  if (error) return <p className="text-center text-red-500">Error fetching poll: {error.message}</p>;

  // Fetch and display only the first poll or by a specific ID
  const poll = data.poll[0];

  if (!poll) {
    return <p className="text-center">No poll available</p>;
  }

  const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Poll: Which is your favorite programming language?</h1>

      <div className="border p-4 rounded-lg shadow-md bg-white">
        <h3 className="text-xl font-semibold mb-4">{poll.question}</h3>
        <form className="space-y-4">
          {poll.options.map((option, index) => (
            <div key={index} className="flex items-center space-x-4">
              <input
                type="radio"
                name="poll"
                id={`option-${index}`}
                value={index}
                onChange={() => setSelectedOption(index)}
                className="mr-2"
              />
              <label htmlFor={`option-${index}`} className="text-lg">
                {option.text} ({option.votes} votes)
              </label>

              {/* Range slider for vote percentage */}
              <input
                type="range"
                min="0"
                max="100"
                value={calculatePercentage(option.votes, totalVotes)}
                readOnly
                className="w-full h-2 bg-blue-400 rounded-lg"
              />
              <span className="ml-2 text-blue-600">{calculatePercentage(option.votes, totalVotes)}%</span>
            </div>
          ))}
        </form>
        <button
          onClick={() => handleVote(poll.id)}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg mt-4 focus:outline-none"
        >
          Submit Vote
        </button>
      </div>
    </div>
  );
};

export default Poll;
