import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
} from "react-leaflet";

function HospitalMap({ hospitals, requestBed, ambulances }) {

    return (
        <div className="rounded-3xl overflow-hidden border border-slate-800">

            <MapContainer
                center={[28.6139, 77.209]}
                zoom={11}
                style={{
                    height: "500px",
                    width: "100%",
                }}
            >

                {/* OpenStreetMap Tiles */}
                <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Hospital Markers */}
                {hospitals.map((hospital) => (

                    <Marker
                        key={hospital._id}
                        position={[
                            hospital.location.lat,
                            hospital.location.lng,
                        ]}
                    >

                        <Popup>

                            <div className="space-y-2">

                                <h2 className="font-bold text-lg">
                                    {hospital.name}
                                </h2>

                                <p>
                                    ICU Beds:
                                    {" "}
                                    {hospital.resources.icuBeds.available}
                                </p>

                                <p>
                                    General Beds:
                                    {" "}
                                    {hospital.resources.generalBeds.available}
                                </p>

                                <button
                                    onClick={() => requestBed(hospital._id)}
                                    className="bg-red-500 text-white px-4 py-2 rounded-lg w-full"
                                >
                                    Request ICU Bed
                                </button>

                            </div>

                        </Popup>

                    </Marker>

                ))}
                {
                    ambulances.map((ambulance) => (

                        <Marker
                            key={ambulance._id}
                            position={[
                                ambulance.location.lat,
                                ambulance.location.lng,
                            ]}
                        >

                            <Popup>

                                <div>

                                    <h2 className="font-bold">
                                        Ambulance
                                    </h2>

                                    <p>
                                        Driver: {ambulance.driverName}
                                    </p>

                                    <p>
                                        Status: {ambulance.status}
                                    </p>

                                </div>

                            </Popup>

                        </Marker>

                    ))
                }

            </MapContainer>

        </div>
    );
}

export default HospitalMap;