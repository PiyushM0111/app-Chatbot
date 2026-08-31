import serverless from 'serverless-http';
import app from '../../server/server.js';
import { ensureDatabaseInitialized } from '../../server/db.js';

const serverlessHandler = serverless(app);

export const handler = async (event, context) => {
  try {
    await ensureDatabaseInitialized();
  } catch (err) {
    console.error('Netlify Serverless Function DB Init Error:', err);
  }
  return await serverlessHandler(event, context);
};
