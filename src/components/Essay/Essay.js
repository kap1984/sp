import React from "react";
import "./Essay.css";

class Essay extends React.Component {

    render() {
        return(
            <div className='essay_container'>
                <div className='essay_content_container'>
                    <div className='essay_sidebar_left'></div>
                    <div className='essay_info'>
                        <div className='header'>
                            <h1>Кто читает это - тот лох.</h1>
                        </div>
                    </div>
                    <div className='essay_sidebar_right'></div>
                </div>
            </div>
        );
    }
}
export default Essay;