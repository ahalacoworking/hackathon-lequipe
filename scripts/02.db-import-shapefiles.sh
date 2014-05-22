dbname="paris-region-map"
dbuser="postgres"
dbencode="UTF8" 
# dbencode="LATIN1"
 
# See http://prj2epsg.org/search
epsgcode=2154 # RGF93_Lambert_93

cd `dirname $0`
scriptsDir=`pwd`
cd "$scriptsDir/../data"

dir=`pwd`
sqldir="$dir/sql"
if [ ! -d "$sqldir" ]; then
    mkdir "$sqldir"
fi 

copy_shape_to_db() {
    shapefile=$1
    tablename=$2

    echo "-----------------------------------"
    echo "Importing '$shapefile' in '$tablename'."

    # Generate SQL file from a shape file(s)
    shp2pgsql -W "$dbencode" -s "$epsgcode" "$shapefile" "$tablename" > "$sqldir/$tablename.sql"

    # Import the generated SQL file in the DB
    psql -U "$dbuser" -d "$dbname" -f "$sqldir/$tablename.sql"

    echo "Done."
}

copy_shape_to_db "territoires/PRM_niv1_polygones_21052014.shp" "territoires_niv2"
copy_shape_to_db "territoires/PRM_niv2_21052014.shp" "territoires_niv1"

psql -U "$dbuser" -d "$dbname" -f "$scriptsDir/02.db-import-shapefiles.sql"
