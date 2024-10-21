import React, { Component } from 'react';
import { HashLoader } from 'react-spinners'
import { Container, Row, Col } from 'reactstrap';

class Load extends Component{
    constructor( props ){
        super(props);
    }

    render() {
        return (
            <Container className='h-100'>
                <Row xs={4} className='justify-content-center align-items-center h-100' >
                    <Col  xs={'auto'}>
                        <HashLoader color='black' size={70}/>
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default Load;