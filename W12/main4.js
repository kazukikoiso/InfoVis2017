function main()
{
    var volume = new KVS.LobsterData();
    var screen = new KVS.THREEScreen();

    screen.init( volume, {
        width: window.innerWidth,
        height: window.innerHeight,
        enableAutoResize: false	
    });
  
    var bounds = Bounds( volume );
    screen.scene.add( bounds );

    var x = ( volume.max_coord.x + volume.min_coord.x ) * 0.5;
    var y = ( volume.max_coord.y + volume.min_coord.y ) * 0.5;
    var z = ( volume.max_coord.z + volume.min_coord.z ) * 0.5;

    var point = new THREE.Vector3(x,y,z);
    var normal = new THREE.Vector3(0,0,1);
    var slice = SlicePlane( volume, point, normal);
    screen.scene.add(slice);
        
    document.addEventListener( 'mousemove', function() {
        screen.light.position.copy( screen.camera.position );
    });

    window.addEventListener( 'resize', function() {
        screen.resize( [ window.innerWidth, window.innerHeight ] );
    });

    screen.loop();
}
