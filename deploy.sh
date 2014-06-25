git checkout master
git push origin master
git checkout deploy
git merge master
git push heroku deploy:master
cp exp_url ../
cp abilities_url ../
git checkout master
mv ../exp_url .
mv ../abilities_url .
