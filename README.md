# Marites Profiler

- [About](#about)
- [Getting started](#getting-started)
- [Architecture](#architecture)

## <a name="about"></a>About

### The team

- [Chris Rabe](https://www.linkedin.com/in/chrisrabe1/)

### What is personalisation?

Personalisation refers to the process of businesses or websites tailoring their offerings based on a user's preference. [It is proven to provide many benefits](https://blog.useproof.com/9-benefits-of-website-personalization) for businesses and their customers. It can result in better conversions, improved customer loyalty, better user experience, increased sales, and higher retention. 

Most businesses approach personalisation in two ways; historical based personalisation and session based personalisation. 

Historical based personalisation is when applications analyse the user's activity since their account was created to provide tailored recommendations. The more the user uses the application, the better the recommendations get. Music recommendations by Spotify is an example of this.

Session based personalisation is when applications provide recommendations based on the user's activity in their current session. For example, whenever you're browsing items in Amazon, the website slowly starts recommending items that are based on what you've recently searched.

Businesses generally use a combination of both to reap its benefits. Personalisation is generally applied to businesses which involves some form of advertising on their content or products. Examples of this are news websites, social media websites, blogs or e-commerce applications.

### The problem
_Personalisation take long when users don't spend enough time using the application._ At the time of writing this, I currently work as a full stack engineer in a global travel industry company. During my time working there, I learnt that timing is an extremely important factor to generating sales. We need to be able to present the right content at the right time to attract user interest.

We recently released a new feature which allows users to register for our site to receive travel recommendations and rewards. Our current recommendations are based on marketers' research. This currently generates sales but adding a personalisation capability may theoretically yield better results.

### The solution
In this hackathon, I wanted to explore whether it's possible to personalise a user's experience **as soon as they create their account**. Most companies generally address this by asking the user a long-winded questionnaire. I wanted to make sure that users also do not have to go through that process.

At the time of writing this, [Amazon released a new feature for Amazon Comprehend called Targeted Sentimental Analysis](https://aws.amazon.com/blogs/machine-learning/extract-granular-sentiment-in-text-with-amazon-comprehend-targeted-sentiment/) last month. This feature uses NLP to extract key terms from a piece of text and the user's sentiment towards those terms.

My solution (the Marites Profiler) would use this new feature to determine the user's overall interest by analysing their Twitter posts and the posts of their followers. This data is placed into Tigergraph so that I can retrieve the relationships between users, their interests and related content in an efficient manner.

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
5. Create a [Tigergraph secret](https://docs.tigergraph.com/cloud/access-solution/rest-requests) and copy the value to a notepad somewhere

#### Step 2: Setting up AWS infrastructure

**For this step, you need to make sure that your AWS CLI is configured to an admin account beforehand**

1. Go into the `marites-cdk` folder
2. Install dependencies `npm install`
3. Create the CDK cloud formation templates using `npm run cdk -- synth`
4. Deploy the initial stack `npm run cdk -- deploy` *note: if this fails, delete the MaritesCDK stack for your region in cloud formation then restart
5. Grab a cup of coffee or tea (deployment takes a while - roughly 5 minutes)
6. Inside `marites-cdk` create a `.env` file with the following contents:
```
BEARER_TOKEN=XXX # twitter bearer token
TG_HOST=XXX # tigergraph host URL
TG_PASSWORD=XXX # tigergraph password
TG_SECRET=XXX # tigergraph secret
```
7. Generate your cloud formation template with the new configuration `npm run cdk -- synth`
8. Redeploy with the changes `npm run cdk -- deploy`

#### Step 3: Bypass Tigergraph free-tier service limits

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

11. Set environment variables for `TG_HOST` and `TG_PASSWORD`

#### Step 4: Set up your frontend

WIP.

## <a name="architecture"></a>Architecture

![Screen Shot 2022-04-15 at 6 20 34 pm](https://user-images.githubusercontent.com/11940900/163545496-dd6ee867-a5ef-43e9-bbca-554f01c1e4fe.png)

- The frontend application communicates to the serverless functions through an API Gateway

- The API gateway supports three endpoints
    - POST /analyse -> to extract information about a user from Twitter
    - GET /user/:id -> to retrieve information about a user from Tigergraph
    - GET /news -> to retrieve aggregated news (note: this can be exchanged to other content)

- When the user enters a new username from the Frontend, it first tries to retrieve the user and their interest from Tigergraph
- If no results retrieved from Tigergraph, it sends a POST request to the analyse function and redirects the user to the home page
- If the user has information but no followers, it uses the current information from Tigergraph to provide personalised experience
- The user is repeatedly polled from the frontend every five minutes to ensure up-to-date information (in an actual environment, we probably don't want to do this because it increases AWS billing costs)

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