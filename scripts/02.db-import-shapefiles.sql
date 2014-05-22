alter table territoires_niv1 add the_geom_webmercator geometry;
update territoires_niv1 set the_geom_webmercator = ST_Force2D(ST_Transform(geom, 3857));
create index ON territoires_niv1 USING gist(the_geom_webmercator);

alter table territoires_niv2 add the_geom_webmercator geometry;
update territoires_niv2 set the_geom_webmercator = ST_Force2D(ST_Transform(geom, 3857));
create index ON territoires_niv2 USING gist(the_geom_webmercator);

select convert_to_objects('Territoire/niv1','territoires_niv1');
select convert_to_objects('Territoire/niv1','territoires_niv2');
