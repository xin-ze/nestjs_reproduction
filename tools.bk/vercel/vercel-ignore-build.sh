# Add origin for git repositry
git remote add origin $GIT_CREDENTIALS:getjerry/jerry-serverless.git

# Fetch remote master branch
git fetch origin master 

# Install @nrwl/workspace in order to run the affected command
npm install --no-package-lock --no-save @nrwl/workspace typescript rxjs --prefer-offline

if [ $VERCEL_ENV = 'production' ]; then
  # Run the affected command, comparing latest commit to the previous commit
  npx nx affected:libs | grep $VERCEL_PROJECT_NAME -q
else
  # Run the affected command, comparing latest commit to origin/master
  npx nx affected:libs --base=origin/master | grep $VERCEL_PROJECT_NAME -q
fi

# Store result of the previous command (grep)
IS_AFFECTED_LIB=$?

if [ $VERCEL_ENV = 'production' ]; then
  # Run the affected command, comparing latest commit to the previous commit
  npx nx affected:apps | grep $VERCEL_PROJECT_NAME -q
else
  # Run the affected command, comparing latest commit to origin/master
  npx nx affected:apps --base=origin/master | grep $VERCEL_PROJECT_NAME -q
fi

# Store result of the previous command (grep)
IS_AFFECTED_APP=$?

if [ $IS_AFFECTED_LIB -eq 0 ]; then
  echo "✅ - Lib affected. Build can proceed"
  exit 1
elif [ $IS_AFFECTED_APP -eq 0 ]; then
  echo "✅ - App affected. Build can proceed"
  exit 1
fi

echo "🛑 - Not affected. Build cancelled"
exit 0
