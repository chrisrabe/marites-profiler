# Marites Profiler

- [About](#about)
- [Getting started](#getting-started)
- [Architecture](#architecture)

## <a name="about"></a>About

### The team

- [Chris Rabe](https://www.linkedin.com/in/chrisrabe1/)

### What is personalisation?

Personalisation refers to the action of tailoring a business' content or offerings
offerings or content based on an individual's preference. [It is proven to provide many benefits for businesses and their customers](https://blog.useproof.com/9-benefits-of-website-personalization). It can result in better conversions, improved customer loyalty, better user experience, increased sales, and higher retention. 

Most businesses approach personalisation in two ways; historical based personalisation and session based personalisation. 

Historical based personalisation is when applications analyse the user's activity since their account was created to provide tailored recommendations. The more the user uses the application, the better the recommendations get. Music recommendations by Spotify is an example of this.

Session based personalisation is when applications provide recommendations based on the user's activity in their current session. For example, whenever you're browsing items in Amazon, the website slowly starts recommending items that are based on what you've recently searched.

Businesses generally use a combination of both to reap its benefits. Personalisation is generally applied to businesses which involves some form of advertising on their content or products. Examples of this are news websites, social media websites, blogs or e-commerce applications.

### The problem
>_Personalisation takes long when users don't spend enough time using the application._ 

At the time of writing this, I currently work as a full stack engineer in a global travel industry company. We recently released a new feature which allows users to register for our site to receive travel recommendations and rewards. 

Our current recommendations are based on marketers' research, however it can be overwhelming for the users due to the large number of deals we possess. We could theoretically yield higher sales if our recommendations are personalised to the user. The problem is that we can't obtain data fast enough to match the rapidly changing nature of our product deals.

### The solution

In this hackathon, I wanted to create a solution that can provide us data for personalisation **as soon as the user registers for our site**.

Most companies address the gap in data by asking users questions about their preferences. Spotify and Twitter are examples of this. This process can be a very long and tedious process for the users.

My solution (the Marites Profiler) would use [Amazon's new Targeted Sentiment Analysis feature](https://aws.amazon.com/blogs/machine-learning/extract-granular-sentiment-in-text-with-amazon-comprehend-targeted-sentiment/) to determine the user's overall interest by analysing their Twitter posts and the posts of their followers. 

The data collected from the analysis are placed into Tigergraph so that I can retrieve the relationships between users, their interests and related content in an efficient manner.

Please refer to the [architecture](#architecture) section to see more technical details.

## <a name="getting-started"></a>Getting Started

### Pre-requisites
- [Python 3 and Pip](https://www.python.org/downloads/)
- [NodeJS and AWS](https://nodejs.org/en/download/)
- [Created a free-tier Tigergraph solution](https://docs.tigergraph.com/cloud/start/overview)
- [Amazon account with AdminAccess permissions](https://docs.aws.amazon.com/IAM/latest/UserGuide/getting-started_create-admin-group.html)
- [Installed AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
- [Installed AWS CDK](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html)
- [Installed Docker Desktop](https://docs.docker.com/desktop/)
- [Registered for Twitter API access and generated API key](https://developer.twitter.com/en/docs/twitter-api)
- [News Catcher API Access](https://newscatcherapi.com/)
- [News API Access](https://newsapi.org/docs/get-started)

#### Optional
_You need these if you want to keep your free-tier solution alive forever._

- [Heroku account](https://signup.heroku.com/)
- [Installed Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)

### Instructions

Inside the repository, you should see four folders

1. init -> contains logic for the initial step for the set up
2. marites-cdk -> contains the CDK stack for generating your AWS infrastructure
3. marites-ui -> contains frontend code that's deployed to NextJS
4. notebooks -> contains Jupyter notebooks I used to experiment and build my functions

#### Step 1: Set up your graph schema and secret
1. Go into the `init`
2. Create a `.env` file which contains the following:
```
TG_HOST=XXX # tigergraph cloud host
TG_PASSWORD=XXX # tigergraph password
```
3. Install all dependencies `pip install -r requirements.txt`
4. Run the `setup-graph.py` script - `python3 setup-graph.py`
5. Copy the secret that's printed at the end of the process. It shoud look something like this:
```
Query installation finished.
Generating secret...
Your secret: <SECRET_TO_COPY>
```

#### Step 2: Setting up AWS infrastructure

**For this step, you need to make sure that your AWS CLI is configured to an admin account beforehand**

1. Go into the `marites-cdk` folder `cd marites-cdk`
2. Install dependencies `npm install`
3. Create a `.env` file with the following contents:
```
BEARER_TOKEN=XXX # twitter bearer token
TG_HOST=XXX # tigergraph host URL
TG_PASSWORD=XXX # tigergraph password
TG_SECRET=XXX # tigergraph secret

NEWS_CATCHER_API_KEY=XXXX # news catcher api key
NEWS_API_KEY=XXXX # news api key
```
4. Create the CDK cloud formation templates using `npm run cdk -- synth`
5. Deploy the initial stack `npm run cdk -- deploy` *note: if this fails, delete the MaritesCDK stack for your region in cloud formation then restart
6. Grab a cup of coffee or tea, or move into the next step (deployment takes a while - roughly 5 minutes)
7. Once your deployment is completed, copy the api endpoint that's printed out in your terminal. This is the URL for your backend. The output looks something like this:
```
Outputs:
MaritesCdkStack.maritesapiEndpointE0B8740E = <AWS_API_GATEWAY_URL>
...
```

#### Step 3: Set up your frontend

1. Go inside the `marites-ui` folder
2. Install all dependencies - `npm install`
3. Create a new `.env.local` file with the following contents
```
API_GATEWAY_URL=XXXX # your API gateway url
```
4. Start the application locally - `npm run dev`

#### Step 4: Bypass Tigergraph free-tier service limits (Optional)

By default, the free version of Tigergraph comes with a [service limit](https://docs.tigergraph.com/cloud/reference/service-limits) where the instance automatically turns off after 1 hour of no activity, and deleted after 7 days of no activity. Users have to manually turn them on. This kinda sucks for demo purposes because you'd have to keep a vigilant eye on whether the instance is turned on. Luckily, [heroku workers](https://devcenter.heroku.com/articles/background-jobs-queueing) are here to save the day.

1. Go into `marites-worker` folder
2. Log into heroku `heroku login`
3. Create a new app `heroku create -a marites-worker`
4. Initialise git locally `git init`
5. Create heroku remote `heroku git:remote -a marites-worker`
6. Add everything to repo `git add .`
7. Commit `git commit -m "create worker"`
8. Push to heroku `git push heroku master`
9. Go into your Heroku dashboard and select your application
10. Go into settings and configure your environment variables

![Screen Shot 2022-04-15 at 6 16 52 pm](https://user-images.githubusercontent.com/11940900/163545193-55126d32-85db-4f03-bf39-281d2d303df8.png)

### Cleaning up

If you want to clean up everything, please follow these steps:
1. Destroy your AWS infrastructure - `npm run cdk -- destroy`
2. [Terminate your Tigergraph instance](https://docs.tigergraph.com/cloud/solutions/stop-restart-and-terminate)
3. Remove the Heroku worker (if used)
4. Remove the Marites UI (if deployed somewhere)

11. Set environment variables for `TG_HOST` and `TG_PASSWORD`

## <a name="architecture"></a>Architecture

![Screen Shot 2022-04-15 at 6 20 34 pm](https://user-images.githubusercontent.com/11940900/163545496-dd6ee867-a5ef-43e9-bbca-554f01c1e4fe.png)

### Key Components
|Component| Description|
|:-------|:------------|
|Frontend/UI|A NextJS application that displays news articles.|
|Tigergraph|Used for storing a graph that relates users to posts and topics. This should also include business content more query options but decided that it's a future improvement. I was only after the pattern of retrieving user interest.|
|AWS Comprehend| Used for extracting entities and sentiments about the entities from a list of posts|
|S3 | Used to store inputs and outputs for AWS Comprehend and the transformation lambda functions. The input bucket would contain information that was retrieved from Twitter. The output bucket would contain information that was generated by AWS Comprehend.|
|Internal Lambdas| Transforms data form the S3 bucket and pushes them to Tigergraph. I created one input and one output transformation function.|
|Serverless API| Supports functions for retrieving user, analysing a user and retrieving content|
|Twitter API|Social media source. In the future, this can be extended to use more social media websites.|
|News API|Returns news articles based on queries passed from the frontend|
|Heroku worker|Used to bypass Tigergraph service limits|

### Logical Flow
- The frontend application communicates to the serverless functions through an API Gateway
- The API gateway supports three endpoints
    - POST /analyse -> to extract information about a user from Twitter
    - GET /user/:id -> to retrieve information about a user from Tigergraph
    - GET /news -> to retrieve aggregated news (note: this can be exchanged to other content)
- When the user enters a new username from the Frontend, it first tries to retrieve the user and their interest from Tigergraph.
- If no results retrieved from Tigergraph, it sends a POST request to the analyse function and redirects the user to the home page.
- If the user has information but no followers, it uses the current information from Tigergraph to provide personalised experience and sends a POST request to the analyse function to retrieve more information about the user.
- The user is repeatedly polled from the frontend every five minutes to ensure up-to-date information (in an actual environment, we probably don't want to do this because it increases AWS billing costs. This action is probably done whenever the user logs into the website in a more realistic scenario.)
- When a request is sent to the /analyse function, 
    - it retrieves all Twitter post of the specified user and its followers. 
    - it cleans the data that will be sent to Tigergraph and AWS Comprehend
    - it extracts the text from the cleaned data into a text buffer
    - it sends the text buffer into the input S3 bucket for further analysis
    - it sends the posts, users and following into the input S3 bucket to send to Tigergraph
    - it starts a new AWS Comprehend Targeted Sentiment job
- Pushing the CSVs into the input bucket would trigger a lambda function that's responsible for converting them to edges and vertices in Tigergraph
- Once the AWS Comprehend job is completed, it would create a `output.tar.gz` file inside the output S3 bucket.
- The new `.tar.gz` would trigger a lambda function that's responsible for converting targeted sentiment analysis results into edges and vertices in Tigergraph
- News content is queried by keywords that's produced by the analysis