export default function() {
    var coordsData = '';

    function setCoords(eventData){
        coordsData = eventData.currentPoints.canvas;
    }

    function getCoords(){
        return coordsData;
    }

    return {
        setCoords,
        getCoords
    };
}