import express, { Request, Response, Application } from 'express';
import dotenv from 'dotenv';
import axios from 'axios';
const cors = require('cors');
const cron = require('node-cron')
const path = require('path');
const userRoutes = require('../routes/user.routes');
dotenv.config({ path: "./config.xenv" });

const app: Application = express();
app.use(express.json())
app.use(cors());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.resolve(__dirname, 'public')))

app.use("/", userRoutes);

const port = process.env.PORT;

app.get('/', async (req: Request, res: Response) => {
    try {
        // console.log("first")
        res.send("Hello");
    }
    catch (err: any) {
        console.log(err);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, (): void => {
    console.log(`server is running at http://localhost:${port}`);
}) 

// Added cron

app.get("/ping", (req, res) => {
    res.status(200).json("pong....");
  });
  
  const API_ENDPOINT = "";
  
  const makeApiRequest = async () => {
    try {
      const response = await axios.get(API_ENDPOINT);
      return response.data;
    } catch (err: any) {
      console.error("API request failed:", err.message);
      throw err;
    }
  };
  
  const runApiRequestJob = async () => {
    console.log("Running API request job...");
    try {
      const responseData = await makeApiRequest();
      return responseData;
    } catch (error) {
      return null;
    }
  };
  
  // Schedule the API request job to run every 15 minutes
  cron.schedule("*/15 * * * *", async () => {
    const responseData = await runApiRequestJob();
    if (responseData) {
      // Process the response data here
      console.log("API request successful:", responseData);
    } else {
      console.log("API request failed");
    }
  });