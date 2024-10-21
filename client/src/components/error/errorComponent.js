import { Container, Row, Col } from 'reactstrap';
import React from 'react';
import { FaExclamationCircle, FaRetweet } from "react-icons/fa";
import '../main.css';
import { useTranslation } from 'react-i18next';

function Error({refresh}) {
    const { t } = useTranslation();
    return (
        <Container className=' flex-fill h-100'>
            <Row className='justify-content-center align-items-center h-100' >
                <Col xs={'auto'} >
                    <Row className='justify-content-center align-items-center' >
                        <Col xs={'auto'} >
                            <FaExclamationCircle className='error-icon' />
                        </Col>
                        <Col xs={12}>
                            <p className='text-center'>  { t('error') } </p>
                        </Col>
                        <Col xs={'auto'} md={'auto'}>
                            <button className=' myButton' onClick={ refresh }>
                                { t('refresh') }  <FaRetweet className='refresh-icon' />
                            </button>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Container>
    );
}

export default Error;