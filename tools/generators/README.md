### SQL Dump

`pg_dump -s jerry_test > tools/generators/dump.sql`

WARNING: Please do not manually update `dump.sql` because it will be written by new dumps. For Redshift table please update in `redshift_dump.sql`

WARNING: Update your jerry2 dev branch to latest. Run db migrations script on it before running the command above so that dump.sql will have the all the most recent changes.

NOTICE: You need to run `npm run test:db` command in jerry2 repo to make sure the dump.sql contains `FUNCTION delete_from_tables`
