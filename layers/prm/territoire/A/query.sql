select 
    id,
    type,
    properties->>'nomcom' as label,
    properties::text,
    st_simplify(the_geom_webmercator, 1500) as the_geom_webmercator
from objects_webmercator
where type in ('Territoire/niv2')

union

select 
    id,
    type,
    properties->>'nomcom' as label,
    properties::text,
    the_geom_webmercator
from objects_webmercator
where type in ('Territoire/niv1')

