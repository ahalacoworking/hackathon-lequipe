dbname="paris-region-map"
dbuser="postgres"

cd `dirname $0`
scriptsDir=`pwd`
psql -U "$dbuser" -d "$dbname" -f "$scriptsDir/99.db-index.sql"