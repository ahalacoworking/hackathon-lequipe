drop table if exists objects cascade;
create table objects(
    id SERIAL primary key,
    type varchar(255),
    properties json,
    geometry geometry, 
    check (st_srid(geometry) = 4326)
);

create or replace view objects_webmercator as 
select 
    objects.id,
    objects.type,
    objects.properties,
    objects.geometry,
    st_transform(objects.geometry, 3857) as the_geom_webmercator
from objects;
create index on objects(type);

drop function if exists convert_to_objects(t varchar(255), n varchar(255));
create function convert_to_objects(t varchar(255), n varchar(255))
returns integer as $$
begin
  execute 'insert into objects(type,properties,geometry) ' || 
    'select ' ||
      '''' || t || ''' as type, ' ||
      'row_to_json(t0) as properties, ' || 
      'st_transform(t1.geom, 4326) as geometry ' ||
      'from ( select '
      || array_to_string(array(select 'o' || '.' || c.column_name
        from information_schema.columns As c
            where table_name = n 
            and  c.column_name NOT IN('geom','the_geom_webmercator')
    ), ',') || ' from ' || n || ' As o) as t0 join '
    || n || ' as t1 using (gid)';
  return 1;
end
$$ LANGUAGE plpgsql;