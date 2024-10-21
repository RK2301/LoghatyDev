import React from "react";
import PropTypes from 'prop-types';
import { useTranslation } from "react-i18next";
import { Col, Container, Modal, ModalBody, Row } from "reactstrap";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Typography } from "@mui/material";
import { formatDateTime } from "../../services";

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

const LocationModal = ({ isOpen, toggle, startLocation, endLocation, shift }) => {
    const { t } = useTranslation();


    return (
        <Modal
            isOpen={isOpen}
            toggle={toggle}
            backdropTransition={{ timeout: 700 }} modalTransition={{ timeout: 500 }}
            centered scrollable
        >
            <ModalBody>
                <Container fluid>
                    <Row className="justify-content-center">
                        <Col xs='auto'>
                            <Typography variant='body2'>
                                {shift.firstname + ' ' + shift.lastname}
                            </Typography>
                        </Col>

                        <Col xs='auto'>
                            <Typography variant='body2'>
                                {formatDateTime(shift.start_shift)}
                            </Typography>
                        </Col>

                        {shift.end_shift ? (
                            <Col xs='auto'>
                                <Typography variant='body2'>
                                {formatDateTime(shift.end_shift)}
                                </Typography>
                            </Col>
                        ) : <></>}
                    </Row>

                    <Row className="mt-1">
                        <Col xs={12}>
                            <MapContainer center={[startLocation.start_latitude, startLocation.start_longitude, -0.09]}
                                zoom={15} scrollWheelZoom={true} style={{ height: '50vh' }}>
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <Marker position={[startLocation.start_latitude, startLocation.start_longitude]}>
                                    <Popup>
                                        {t('startShift')}
                                    </Popup>
                                </Marker>

                                {endLocation.end_latitude ? (
                                    <Marker position={[endLocation.end_latitude, endLocation.end_longitude]}>
                                        <Popup>
                                            {t('endShift')}
                                        </Popup>
                                    </Marker>
                                ) : <></>}
                            </MapContainer>
                        </Col>
                    </Row>
                </Container>
            </ModalBody>
        </Modal>)
}

LocationModal.propTypes = {
    start_latitude: PropTypes.string.isRequired
}

export default LocationModal;