import React, { Component, isValidElement } from "react";
import { Breadcrumb, BreadcrumbItem } from "reactstrap";
import style  from '../../css/breadcrumbCss.module.css'
import { Link } from "react-router-dom";

/**
 * This BreadCrumb component will receive array of the current path for the rendered view to to be displayed to the user
 * each time the main rendered component update the array will result to re-render the component
 */
class BreadCrumbContent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            path: props.pathArr,
        }
    }

    render() {

        const beardItems = this.state.path.map((val, index) => {
           // console.log('the val of index is:' +index);
            let pathCurrent = '/' + val;
            if (index < this.props.pathArr.length - 1) {
                return (
                    <div className="breadcrumb-item">
                        <Link to={pathCurrent} >{val}</Link>
                    </div>
                );
            } else {
                return (
                    <div className="breadcrumb-item">
                        {val}
                    </div>
                );
            }
        });

        return (
                <div className="col-12 col-md-auto offset-md-1" >
                  <div className={style.breadcrumb +' d-flex' } >
                     {beardItems}
                 </div>
               </div>
        );

    }

}

export default BreadCrumbContent;