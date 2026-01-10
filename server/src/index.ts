import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import express from 'express';
import cors from 'cors';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';
import { initializeDatabase } from './database';

const PORT = process.env.PORT || 4000;

async function startServer() {
  // Initialize database
  initializeDatabase();
  console.log('Database initialized');

  const app = express();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // GraphQL endpoint
  app.use('/graphql', expressMiddleware(server, {
    context: async ({ req }) => {
      // Generate or retrieve session ID from cookie/header
      const sessionId = req.headers['x-session-id'] as string || 
                       req.cookies?.sessionId || 
                       Math.random().toString(36).substring(7);
      
      return {
        req,
        sessionId
      };
    },
  }));

  app.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
  });
}

startServer().catch(console.error);

