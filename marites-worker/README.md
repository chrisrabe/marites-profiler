# Marites Worker

The purpose of this folder is to create a worker script that keeps our
free Tigergraph cloud instance running by repeatedly sending requests
every 30 minutes.

This will be deployed via Heroku as a worker resource.

## Deployment

1. Install [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
2. Log into heroku `heroku login`
3. Create a new app `heroku create -a marites-worker`
4. Initialise git locally `git init`
5. Create heroku remote `heroku git:remote -a marites-worker`
6. Add everything to repo `git add .`
7. Commit `git commit -m "create worker"`
8. Push to heroku `git push heroku master`
