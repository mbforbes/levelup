git checkout master
git push origin master
git checkout deploy
git merge master
git push heroku deploy:master
git checkout master