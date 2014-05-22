dbname="paris-region-map"
dbuser="postgres"
dbencode="UTF8" 

dropdb -U "$dbuser" "$dbname"
createdb -U "$dbuser" "$dbname" -E "$dbencode" 
createlang -U "$dbuser" plpgsql "$dbname"
psql -U "$dbuser" -d "$dbname" -c 'create extension postgis'

cd `dirname $0`
scriptsDir=`pwd`
psql -U "$dbuser" -d "$dbname" -f "$scriptsDir/01.db-rebuild.sql"